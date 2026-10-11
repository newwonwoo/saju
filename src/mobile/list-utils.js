// UI-only projection for the offline vault. Never infer sex or calendar from badge colors.
export const LIST_SORT_OPTIONS = Object.freeze([
  ['name', '가나다순'],
  ['newest', '최근 추가순'],
  ['age-asc', '나이 어린순'],
  ['age-desc', '나이 많은순'],
  ['day', '일주순'],
]);
const DAY_STEMS = Object.freeze(['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']);
const DAY_BRANCHES = Object.freeze(['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']);
const ELEMENT_BY_STEM = Object.freeze({ 갑:'wood', 을:'wood', 병:'fire', 정:'fire', 무:'earth', 기:'earth', 경:'metal', 신:'metal', 임:'water', 계:'water' });
const ELEMENT_BY_BRANCH = Object.freeze({ 인:'wood', 묘:'wood', 사:'fire', 오:'fire', 진:'earth', 술:'earth', 축:'earth', 미:'earth', 신:'metal', 유:'metal', 해:'water', 자:'water' });

export function dayGlyphs(entry, computedDay = null) {
  const original = entry.referenceDisplay;
  // Imported screenshot characters are more reliable than re-running a calculator with unconfirmed calendar data.
  if (original?.day_stem_ko || original?.day_branch_ko) return { stem: original.day_stem_ko || '·', branch: original.day_branch_ko || '·', captured: true };
  if (computedDay?.stem && computedDay?.branch) return { stem: computedDay.stem, branch: computedDay.branch, captured: false };
  return { stem: '·', branch: '·', captured: false };
}

export function ageBadge(entry, today = new Date()) {
  const birth = entry.birth || {};
  const birthday = [birth.input_year, birth.input_month, birth.input_day];
  if (birth.calendar_type === 'solar' && birthday.every(Number.isInteger) &&
      birth.input_month >= 1 && birth.input_month <= 12 && birth.input_day >= 1 && birth.input_day <= 31) {
    const age = today.getFullYear() - birth.input_year -
      (today.getMonth() + 1 < birth.input_month ||
       (today.getMonth() + 1 === birth.input_month && today.getDate() < birth.input_day) ? 1 : 0);
    return Number.isInteger(age) && age >= 0 && age <= 130 ? { text: String(age), captured: false } : { text: '—', captured: false };
  }
  // The age shown in the reference image may be stale; do not recalculate using unconfirmed dates.
  const raw = entry.referenceDisplay?.badge_text;
  return { text: typeof raw === 'string' && /^\d{1,3}$/.test(raw) ? raw : '—', captured: true };
}

export function referenceBirthLabel(entry) {
  const b = entry.birth || {};
  // A deliberate user correction must take precedence over the original screen symbol.
  const confirmedCalendar = b.settings_status?.calendar_type === 'user_confirmed';
  const selectedSymbol = b.calendar_type === 'solar' ? '+' : b.calendar_type === 'lunar' ? b.lunar_leap_month === true ? '=' : '-' : '·';
  const symbol = confirmedCalendar ? selectedSymbol : ['+', '-', '='].includes(b.calendar_symbol_raw)
    ? b.calendar_symbol_raw : selectedSymbol;
  const date = b.date_raw ||
    ([b.input_year, b.input_month, b.input_day].every(Number.isInteger)
      ? [b.input_year, b.input_month, b.input_day].map((v, i) => i ? String(v).padStart(2, '0') : v).join('/')
      : '날짜 미확인');
  const time = b.time_status === 'unknown' ? '--:--'
    : b.time_status === 'not_visible' ? ''
    : (Number.isInteger(b.input_hour) && Number.isInteger(b.input_minute)
      ? `${String(b.input_hour).padStart(2, '0')}:${String(b.input_minute).padStart(2, '0')}` : b.time_raw || '');
  return [symbol, date, time, b.correction_raw].filter(Boolean).join(' ');
}

export const branchColor = glyph => ELEMENT_BY_BRANCH[glyph] || 'unknown';
export const stemColor = glyph => ELEMENT_BY_STEM[glyph] || 'unknown';

export function filterAndSortEntries(entries, { query = '', sort = 'name', now = new Date(), dayOf = () => null } = {}) {
  const text = String(query || '').toLocaleLowerCase('ko').trim().replace(/\s+/g, ' ');
  const tokens = text.split(' ').filter(Boolean);
  const data = entries.filter(e => !e.deletedAt).map((entry, index) => {
    const age = ageBadge(entry, now).text;
    const day = dayGlyphs(entry, dayOf(entry));
    const searchable = [entry.name, referenceBirthLabel(entry), entry.memo || '', age === '—' ? '' : age,
      `${age}세`, day.stem + day.branch, `${day.stem} ${day.branch}`, day.stem, day.branch,
      // A birthday entered as 19840130 or 1984-01-30 should also match 1984/01/30.
      [entry.birth?.input_year, entry.birth?.input_month, entry.birth?.input_day].every(Number.isInteger)
        ? `${entry.birth.input_year}${String(entry.birth.input_month).padStart(2, '0')}${String(entry.birth.input_day).padStart(2, '0')}` : '',
      referenceBirthLabel(entry).replace(/[^0-9]/g, '')].join(' ').toLocaleLowerCase('ko');
    return { entry, index, age, day, searchable };
  });
  const matching = data.filter(x => tokens.every(t => x.searchable.includes(t)));
  const byName = (a,b) => a.entry.name.localeCompare(b.entry.name, 'ko') || a.index - b.index;
  const byAge = (a,b) => (Number.isFinite(Number(a.age)) ? Number(a.age) : 999) -
    (Number.isFinite(Number(b.age)) ? Number(b.age) : 999) || byName(a,b);
  if (sort === 'newest') matching.sort((a,b) => (b.entry.createdAt || '').localeCompare(a.entry.createdAt || '') || a.index - b.index);
  else if (sort === 'age-asc') matching.sort(byAge);
  else if (sort === 'age-desc') matching.sort((a,b) => {
    const v = (Number.isFinite(Number(b.age)) ? Number(b.age) : -1) - (Number.isFinite(Number(a.age)) ? Number(a.age) : -1);
    return v || byName(a,b);
  });
  else if (sort === 'day') matching.sort((a,b) => {
    const score = day => {
      const stem = DAY_STEMS.indexOf(day.stem), branch = DAY_BRANCHES.indexOf(day.branch);
      return stem < 0 || branch < 0 ? 999 : stem * 12 + branch;
    };
    return score(a.day) - score(b.day) || byName(a,b);
  });
  else matching.sort(byName);
  return matching.map(x => x.entry);
}
