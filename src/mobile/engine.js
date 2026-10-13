import {
  calcSaju, calcDaeun, calcStrengthDetail, calcTCPA, calcYongsin,
  getDP, getMP, getYP, buildLunarYear, jdToDate, getMaxDay,
  HS, EB, HS_EL, EB_EL, EBH, getSS, getUnsung,
} from '../App.jsx';

export { HS, EB, HS_EL, EB_EL, EBH, getSS, getUnsung };
export const STEM_KO = ['갑','을','병','정','무','기','경','신','임','계'];
export const BRANCH_KO = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
export const ENGINE_VERSION = 'legacy-saju-6389ec7-v1';

function solarDate(birth) {
  const { input_year: year, input_month: month, input_day: day, calendar_type: calendar } = birth;
  if (![year, month, day].every(Number.isInteger)) throw new Error('생년월일을 확인해 주세요.');
  if (year < 1900 || year > 2030) throw new Error('현재 계산 범위는 1900~2030년입니다. 기록은 그대로 보관됩니다.');
  if (month < 1 || month > 12 || day < 1 || day > 31) throw new Error('생년월일을 확인해 주세요.');
  if (calendar === 'solar') {
    if (day > getMaxDay(year, month)) throw new Error('존재하지 않는 양력 날짜입니다.');
    return { year, month, day };
  }
  if (calendar !== 'lunar') throw new Error('수정 화면에서 양력·음력을 확인해 주세요.');
  if (typeof birth.lunar_leap_month !== 'boolean') throw new Error('음력의 평달·윤달 여부를 확인해 주세요.');
  const data = buildLunarYear(year);
  if (!data) throw new Error('이 음력 연도의 변환 자료가 없습니다.');
  const hasLeap = data.months.length === 13 && data.leapM > 0;
  if (birth.lunar_leap_month && (!hasLeap || data.leapM !== month)) throw new Error('선택한 달은 이 해의 윤달과 일치하지 않습니다.');
  let index = month - 1;
  if (hasLeap && month > data.leapM) index += 1;
  if (birth.lunar_leap_month) index = data.leapM;
  const start = data.months[index];
  const end = data.months[index + 1] ?? data.endJD;
  if (start == null || day > end - start) throw new Error('이 음력 달의 날짜 범위를 넘었습니다.');
  const converted = jdToDate(start + day - 1);
  if (converted.year < 1900 || converted.year > 2030) throw new Error('변환한 양력 날짜가 계산 범위를 벗어났습니다.');
  return converted;
}

export function calculateEntry(entry) {
  const birth = entry.birth;
  try {
    const solar = solarDate(birth);
    if (birth.correction_raw && !birth.correction_settings?.legacy_confirmed) {
      throw new Error('원본에 시각 보정표시가 있습니다. 수정 화면에서 적용할 계산 기준을 확인해 주세요.');
    }
    const hasTime = birth.time_status === 'known';
    if (hasTime && (!Number.isInteger(birth.input_hour) || !Number.isInteger(birth.input_minute) || birth.input_hour < 0 || birth.input_hour > 23 || birth.input_minute < 0 || birth.input_minute > 59)) {
      throw new Error('출생 시각을 확인해 주세요.');
    }
    const saju = hasTime
      ? calcSaju(solar.year, solar.month, solar.day, birth.input_hour, birth.input_minute)
      : {
          pillars: [{ label: '시', unknown: true }, { label: '일', ...getDP(solar.year, solar.month, solar.day) }, { label: '월', ...getMP(solar.year, solar.month, solar.day) }, { label: '년', ...getYP(solar.year, solar.month, solar.day) }],
          dayStem: getDP(solar.year, solar.month, solar.day).stem,
          solar: { ...solar, hour: null, minute: null },
        };
    const hasSex = birth.sex === 'male' || birth.sex === 'female';
    const daeun = hasTime && hasSex ? calcDaeun(solar.year, solar.month, solar.day, birth.sex, saju.pillars[2]) : [];
    const strength = hasTime ? calcStrengthDetail(saju.pillars) : null;
    const tcpa = hasTime ? calcTCPA(saju.pillars) : null;
    const yongsin = hasTime ? calcYongsin(saju.pillars, tcpa.sBase) : null;
    return {
      status: hasTime ? 'ready' : 'partial', saju, daeun, strength, yongsin, tcpa,
      message: !hasTime ? '출생시각 미상 · 시주와 시각이 필요한 분석은 표시하지 않습니다.' : !hasSex ? '성별 미확인 · 대운 방향은 확인 후 계산합니다.' : '',
      legacyForm: hasTime ? { name: entry.name, year: String(solar.year), month: String(solar.month), day: String(solar.day), hour: String(birth.input_hour), minute: String(birth.input_minute), gender: birth.sex || '' } : null,
    };
  } catch (error) {
    return { status: 'needs_confirmation', message: error.message };
  }
}

export function referenceDay(entry) {
  const reference = entry.referenceDisplay;
  const stem = reference?.day_stem_ko;
  const branch = reference?.day_branch_ko;
  if (stem || branch) return { stem: stem || '·', branch: branch || '·', isReference: true };
  const result = calculateEntry(entry);
  const day = result.saju?.pillars[1];
  return day ? { stem: STEM_KO[day.stemIdx], branch: BRANCH_KO[day.branchIdx], isReference: false } : { stem: '·', branch: '·', isReference: false };
}

export function birthSummary(birth) {
  const date = birth.date_raw || [birth.input_year, birth.input_month, birth.input_day].filter(x => x != null).join('/');
  const calendar = birth.calendar_type === 'solar' ? '양력' : birth.calendar_type === 'lunar' ? `음력${birth.lunar_leap_month === true ? ' 윤달' : ''}` : birth.calendar_symbol_raw || '달력 미확인';
  const time = birth.time_status === 'unknown' ? '시간 모름' : birth.time_status === 'not_visible' ? '시간 미확인' : birth.time_raw || `${String(birth.input_hour).padStart(2, '0')}:${String(birth.input_minute).padStart(2, '0')}`;
  return `${calendar} ${date || '생년월일 미확인'} · ${time}`;
}
