import React, { useEffect, useMemo, useRef, useState } from 'react';
import LegacyApp from '../App.jsx';
import {
  upsertEntry, toggleFavorite, setSelf, deleteEntry, restoreEntry, recordOpen,
  importScreenshotPackage, createBackup, restoreBackup, applyImportMappings,
} from '../vault/model.js';
import {
  initializeVault, loadState, saveState, isAndroid, importNativeFile,
  exportBackupFile, parseImportText,
} from '../vault/persistence.js';
import { calculateEntry } from './engine.js';
import './mobile.css';
import ReferenceVault from './ReferenceVault.jsx';
import ReferenceReader from './ReferenceReader.jsx';

const INITIAL_ROUTE = { name: 'vault' };
const pad = n => String(n).padStart(2, '0');
const dateLabel = date => new Date(date).toLocaleDateString('ko-KR');
const activeEntries = vault => vault.entries.filter(entry => !entry.deletedAt);
const errorText = error => error?.name === 'VaultValidationError'
  ? '입력 또는 파일 형식을 확인해 주세요. 날짜·시간 범위를 벗어나거나 필수 항목이 누락되었습니다. 저장 내용은 바뀌지 않았습니다.'
  : error?.message || '처리하지 못했습니다. 다시 시도해 주세요.';

function Icon({ name, size = 22, filled = false }) {
  const paths = {
    back: 'm14 5-7 7 7 7',
    plus: 'M12 5v14M5 12h14',
    search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
    vault: 'M4 5h16v16H4zM8 5V2h8v3M8 10h8M8 15h5',
    settings: 'M4 7h16M4 17h16M8 4v6M16 14v6',
    arrow: 'm9 5 7 7-7 7',
    download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
    upload: 'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
    close: 'm6 6 12 12M6 18 18 6',
    check: 'm5 12 4 4L19 6',
    clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.vault} /></svg>;
}

function Dialog({ title, children, onClose, busy = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog className="vault-dialog" ref={ref} aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="dialog-heading"><h2>{title}</h2><button className="icon-button" aria-label="닫기" disabled={busy} onClick={onClose}><Icon name="close" /></button></div>
    {children}
  </dialog>;
}

class AnalysisBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <section className="panel" role="alert"><h2>상세 해석을 표시하지 못했어요</h2><p>보관한 명식은 유지됩니다. 입력정보와 계산 기준을 확인해 주세요.</p><button className="secondary" onClick={this.props.onReturn}>명식으로 돌아가기</button></section>;
    return this.props.children;
  }
}

function Field({ label, children, hint }) {
  return <div className="form-field"><span className="field-label">{label}</span>{children}{hint && <small className="field-hint">{hint}</small>}</div>;
}

function EntryForm({ entry, change, navigate, busy }) {
  const [form, setForm] = useState(() => {
    const birth = entry?.birth || {};
    return { name: entry?.name || '', memo: entry?.memo || '', year: birth.input_year ?? '', month: birth.input_month ?? '', day: birth.input_day ?? '', hour: birth.input_hour ?? '', minute: birth.input_minute ?? '', calendar: entry ? birth.calendar_type || '' : 'solar', leap: birth.lunar_leap_month === true ? 'true' : birth.lunar_leap_month === false ? 'false' : '', time: birth.time_status || 'unknown', sex: birth.sex || '', correction: birth.correction_settings?.legacy_confirmed === true };
  });
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const number = value => value === '' ? null : Number(value);
  const save = async event => {
    event.preventDefault();
    const year = number(form.year), month = number(form.month), day = number(form.day);
    const hasDate = [year, month, day].every(Number.isInteger);
    const birth = {
      ...(entry?.birth || {}), input_year: year, input_month: month, input_day: day,
      date_raw: hasDate ? year + '/' + pad(month) + '/' + pad(day) : null,
      calendar_type: form.calendar || null,
      lunar_leap_month: form.calendar === 'solar' ? false : form.leap === '' ? null : form.leap === 'true',
      sex: form.sex || null, time_status: form.time,
      input_hour: form.time === 'known' ? number(form.hour) : null,
      input_minute: form.time === 'known' ? number(form.minute) : null,
      time_raw: form.time === 'known' ? pad(form.hour) + ':' + pad(form.minute) : form.time === 'unknown' ? '--:--' : null,
      correction_settings: { ...(entry?.birth.correction_settings || {}), legacy_confirmed: form.correction },
      settings_status: { ...(entry?.birth.settings_status || {}), calendar_type: form.calendar ? 'user_confirmed' : 'unconfirmed', sex: form.sex ? 'user_confirmed' : 'unconfirmed' },
    };
    const draft = { name: form.name.trim(), memo: form.memo, birth };
    if (entry) draft.id = entry.id;
    const saved = await change(state => upsertEntry(state, draft), '명식을 저장했습니다.');
    if (saved) navigate({ name: 'details', id: entry?.id || saved.state.entries[saved.state.entries.length - 1].id }, true);
  };
  return <form className="entry-form" onSubmit={save}><fieldset className="entry-form-fields" disabled={busy}>
    <section className="intro compact"><span className="eyebrow">{entry ? '기록 다듬기' : '새로운 기록'}</span><h1>{entry ? '명식 수정' : '명식 추가'}</h1><p>모르는 정보는 비워 두어도 괜찮아요.</p></section>
    <section className="panel form-panel">
      <Field label="이름"><input aria-label="이름" required maxLength={200} autoComplete="off" value={form.name} onChange={event => update('name', event.target.value)} placeholder="이름 또는 별칭" /></Field>
      <Field label="생년월일"><div className="date-inputs"><input aria-label="출생 연도" type="number" min="1" max="9999" inputMode="numeric" placeholder="년" value={form.year} onChange={event => update('year', event.target.value)} /><input aria-label="출생 월" type="number" min="1" max="12" inputMode="numeric" placeholder="월" value={form.month} onChange={event => update('month', event.target.value)} /><input aria-label="출생 일" type="number" min="1" max={form.calendar === 'lunar' ? 30 : 31} inputMode="numeric" placeholder="일" value={form.day} onChange={event => update('day', event.target.value)} /></div></Field>
      <Field label="양력·음력" hint={entry?.birth.calendar_symbol_raw ? '가져온 원문 기호: ' + entry.birth.calendar_symbol_raw : undefined}><select aria-label="양력·음력" value={form.calendar} onChange={event => update('calendar', event.target.value)}><option value="">미확인</option><option value="solar">양력</option><option value="lunar">음력</option></select></Field>
      {form.calendar === 'lunar' && <Field label="평달·윤달"><select aria-label="평달·윤달" value={form.leap} onChange={event => update('leap', event.target.value)}><option value="">미확인</option><option value="false">평달</option><option value="true">윤달</option></select></Field>}
      <Field label="출생시각"><select aria-label="출생시각 상태" value={form.time} onChange={event => update('time', event.target.value)}><option value="unknown">시간 모름</option><option value="known">시간 알고 있음</option><option value="not_visible">아직 확인하지 않음</option></select>{form.time === 'known' && <div className="time-inputs"><input aria-label="출생 시" type="number" min="0" max="23" inputMode="numeric" required placeholder="시 · 0~23" value={form.hour} onChange={event => update('hour', event.target.value)} /><span>:</span><input aria-label="출생 분" type="number" min="0" max="59" inputMode="numeric" required placeholder="분 · 0~59" value={form.minute} onChange={event => update('minute', event.target.value)} /></div>}</Field>
      <Field label="성별" hint="대운의 방향을 계산할 때 사용합니다."><select aria-label="성별" value={form.sex} onChange={event => update('sex', event.target.value)}><option value="">미확인</option><option value="male">남성</option><option value="female">여성</option></select></Field>
    </section>
    {entry?.birth.correction_raw && <section className="panel"><h2>시각 보정 기준</h2><p className="muted">원본 표시: {entry.birth.correction_raw}</p><p className="muted">기존 사이트는 자시를 23:30부터 계산합니다. 원본 앱의 보정값을 자동 적용하지 않습니다.</p><label className="checkbox-line"><input type="checkbox" checked={form.correction} onChange={event => update('correction', event.target.checked)} /><span>입력한 시각에 기존 사이트의 계산 기준을 적용하겠습니다.</span></label></section>}
    <section className="panel"><Field label="메모"><textarea aria-label="메모" rows={4} maxLength={20000} value={form.memo} onChange={event => update('memo', event.target.value)} placeholder="관계, 상담 내용, 기억해 둘 이야기" /></Field></section>
    <div className="form-save"><button type="submit" className="primary full-width" disabled={busy}><Icon name="check" size={20} />{busy ? '저장 중…' : '명식 저장'}</button><p className="field-hint">이 기기에 저장됩니다. 계산 가능한 생년월일은 1900~2030년입니다.</p></div>
  </fieldset></form>;
}

function ImportMappings({ vault, change, busy }) {
  const [mapping, setMapping] = useState({ plus: '', minus: '', teal: '', pink: '', leap: '' });
  const [preview, setPreview] = useState(null);
  const selected = () => ({ calendar: { '+': mapping.plus || null, '-': mapping.minus || null }, sex: { teal: mapping.teal || null, pink: mapping.pink || null }, lunarLeap: mapping.leap === '' ? null : mapping.leap === 'true' });
  const set = (key, value) => setMapping(current => ({ ...current, [key]: value }));
  const [error, setError] = useState('');
  return <details className="panel mapping-panel"><summary>가져온 기호 확인</summary><p className="muted">기호의 뜻을 알고 있을 때 선택하세요. 아직 미확인인 항목에만 적용하고 원본은 보관합니다.</p><div className="mapping-grid">
    <Field label="+ 기호"><select aria-label="+ 기호" value={mapping.plus} onChange={e => set('plus', e.target.value)}><option value="">미확인 유지</option><option value="solar">양력으로 확인</option></select></Field>
    <Field label="− 기호"><select aria-label="- 기호" value={mapping.minus} onChange={e => set('minus', e.target.value)}><option value="">미확인 유지</option><option value="lunar">음력으로 확인</option></select></Field>
    {['teal', 'pink'].map(color => <Field key={color} label={color === 'teal' ? '청록색 표시' : '분홍색 표시'}><select aria-label={color === 'teal' ? '청록색 표시' : '분홍색 표시'} value={mapping[color]} onChange={e => set(color, e.target.value)}><option value="">미확인 유지</option><option value="male">남성으로 확인</option><option value="female">여성으로 확인</option></select></Field>)}
  </div><Field label="음력의 윤달 여부" hint="대상 전체가 같은 조건임을 확인한 경우에만 선택하세요. 개별 명식에서도 수정할 수 있습니다."><select aria-label="음력 일괄 윤달 여부" value={mapping.leap} onChange={e => set('leap', e.target.value)}><option value="">미확인 유지</option><option value="false">모두 평달로 확인</option><option value="true">모두 윤달로 확인</option></select></Field>
    {error && <p className="inline-error" role="alert">{error}</p>}
    <button className="secondary full-width" disabled={busy} onClick={() => { try { setError(''); const value = selected(); const next = applyImportMappings(vault, value); setPreview({ value, count: next.entries.filter((entry, index) => entry !== vault.entries[index]).length }); } catch (failure) { setError(errorText(failure)); } }}>적용할 항목 확인</button>
    {preview && <Dialog title="기호 확인 적용" onClose={() => setPreview(null)} busy={busy}><p>미확인 정보가 있는 <strong>{preview.count}개 명식</strong>에 선택한 뜻을 적용합니다. 확인된 값은 유지됩니다.</p><div className="button-row"><button className="secondary" disabled={busy} onClick={() => setPreview(null)}>취소</button><button className="primary" disabled={busy || !preview.count} onClick={async () => { const saved = await change(state => applyImportMappings(state, preview.value), '기호 확인을 적용했습니다.'); if (saved) setPreview(null); }}>적용</button></div></Dialog>}
  </details>;
}

function Settings({ vault, change, busy, setError, notify }) {
  const file = useRef(null);
  const [preview, setPreview] = useState(null);
  const [working, setWorking] = useState(false);
  const trash = vault.entries.filter(entry => entry.deletedAt);
  const importOperation = (state, payload) => {
    if (payload?.format === 'saju-vault-screenshot-import') return importScreenshotPackage(state, payload);
    if (payload?.format === 'saju-vault-backup') return restoreBackup(state, payload);
    throw new Error('명식 가져오기 자료 또는 이 앱에서 만든 백업 JSON을 선택해 주세요.');
  };
  const inspect = text => {
    try { const payload = parseImportText(text); const result = importOperation(vault, payload); setPreview({ payload, stats: result.stats }); }
    catch (error) { setError(errorText(error)); }
  };
  const pickFile = async () => {
    if (!isAndroid()) { file.current.click(); return; }
    setWorking(true);
    try { inspect(await importNativeFile()); } catch (error) { if (error.code !== 'USER_CANCELLED') setError(errorText(error)); } finally { setWorking(false); }
  };
  const exportFile = async () => {
    setWorking(true);
    try { await exportBackupFile(createBackup(vault)); notify('백업 파일을 내보냈습니다.'); } catch (error) { if (error.code !== 'USER_CANCELLED') setError(errorText(error)); } finally { setWorking(false); }
  };
  return <>
    <section className="intro compact"><span className="eyebrow">내 기록 관리</span><h1>설정과 백업</h1><p>기록을 오래, 안전하게 간직하세요.</p></section>
    <section className="storage-card"><span className="storage-icon"><Icon name="vault" size={28} /></span><div><strong>{isAndroid() ? '내 기기에 저장 중' : '이 브라우저에 저장 중'}</strong><p>보관 {activeEntries(vault).length}명 · 휴지통 {trash.length}명</p></div><span className="status-dot" /></section>
    <section className="panel"><h2>백업과 가져오기</h2><p className="muted">{isAndroid() ? '앱을 삭제하거나 기기를 바꾸기 전에 백업 파일을 따로 보관하세요.' : '앱에서는 기기 내부에 저장됩니다. 브라우저의 사이트 데이터를 지우기 전에는 백업하세요.'}</p><button className="settings-action" disabled={working || busy} onClick={exportFile}><Icon name="download" /><span><strong>백업 내보내기</strong><small>명식·메모·원본·휴지통을 JSON으로 저장</small></span><Icon name="arrow" size={18} /></button><button className="settings-action" disabled={working || busy} onClick={pickFile}><Icon name="upload" /><span><strong>자료 가져오기</strong><small>명식 자료 또는 백업 JSON 선택</small></span><Icon name="arrow" size={18} /></button><input hidden type="file" accept=".json,application/json" ref={file} aria-label="가져올 JSON 파일" onChange={async event => { const chosen = event.target.files?.[0]; event.target.value = ''; if (!chosen) return; if (chosen.size > 8 * 1024 * 1024) { setError('8MB 이하의 JSON 파일을 선택해 주세요.'); return; } try { inspect(await chosen.text()); } catch (error) { setError(errorText(error)); } }} /><p className="field-hint">같은 자료를 다시 가져와도 중복을 만들지 않습니다. 수정한 내용과 삭제 상태를 우선 보존합니다.</p></section>
    {vault.sources.length > 0 && <ImportMappings vault={vault} change={change} busy={busy} />}
    <details className="panel trash-panel"><summary>휴지통 <span>{trash.length}</span></summary>{trash.length ? <ul>{trash.map(entry => <li key={entry.id}><span><strong>{entry.name}</strong><small>{dateLabel(entry.deletedAt)} 삭제</small></span><button className="small-button" disabled={busy} onClick={() => change(state => restoreEntry(state, entry.id), '명식을 복원했습니다.')}>복원</button></li>)}</ul> : <p className="muted">삭제한 명식이 없습니다.</p>}</details>
    <details className="panel engine-notes"><summary>계산 기준과 지원 범위</summary><p>기존 사주 사이트의 계산식을 앱에 포함했습니다. 계산과 저장에 인터넷이 필요하지 않습니다.</p><ul><li>계산 범위: 1900~2030년. 양력·음력과 평달·윤달을 확인한 뒤 계산합니다.</li><li>출생시각을 모르면 시주와 시각이 필요한 분석을 생략합니다. 성별 미확인 시 대운을 표시하지 않습니다.</li><li>기존 산식의 자시 시작은 23:30입니다. 출생지·경도·서머타임에 따른 별도 보정은 적용하지 않습니다.</li><li>년·월주는 절입일의 출생 시·분을 반영하지 않습니다. 대운 시작 나이는 근사값이며 일부 연말 날짜는 산출되지 않습니다.</li><li>원본 사이트의 초기 음력 자료 이전 날짜는 음력 표시를 별도로 확인해야 합니다. 8자어때 앱과 계산 결과가 같다고 검증된 상태는 아닙니다.</li></ul><p>현재 앱에는 명식 보관과 오행·조후·궁합 분석을 포함합니다. 외부 AI 이미지 생성과 출산택일 화면은 포함하지 않습니다.</p></details>
    <div className="app-signature"><span>命</span><p>사주 보관함 <b>1.0.3</b></p><small>나의 기록, 나의 기기에.</small></div>
    {preview && <Dialog title="가져오기 확인" onClose={() => setPreview(null)} busy={busy}><p>파일을 확인했습니다. 기존 기록은 보존하면서 병합합니다.</p><div className="import-counts"><div><strong>{preview.stats.added}</strong><span>추가할 명식</span></div><div><strong>{preview.stats.skipped}</strong><span>이미 있는 명식</span></div></div>{preview.stats.conflicts.length > 0 && <p className="notice">내용이 다른 {preview.stats.conflicts.length}개 항목은 현재 기기의 기록을 우선합니다.</p>}<div className="button-row"><button className="secondary" disabled={busy} onClick={() => setPreview(null)}>취소</button><button className="primary" disabled={busy} onClick={async () => { const result = await change(state => importOperation(state, preview.payload)); if (result) { setPreview(null); notify('가져오기 완료 · 추가 ' + result.result.stats.added + '개'); } }}>가져오기</button></div></Dialog>}
  </>;
}

export default function MobileApp() {
  const [vault, setVault] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [route, setRoute] = useState(() => window.history.state?.sajuRoute || INITIAL_ROUTE);
  const vaultRef = useRef(null);
  const busyRef = useRef(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    initializeVault().then(value => { if (!cancelled) { vaultRef.current = value; setVault(value); } }).catch(failure => { if (!cancelled) setError(errorText(failure)); });
    const pop = event => { setRoute(event.state?.sajuRoute || INITIAL_ROUTE); window.scrollTo(0, 0); };
    window.addEventListener('popstate', pop);
    if (!window.history.state?.sajuRoute) window.history.replaceState({ sajuRoute: INITIAL_ROUTE }, '', window.location.href);
    return () => { cancelled = true; window.removeEventListener('popstate', pop); clearTimeout(toastTimer.current); };
  }, []);

  const notify = message => { clearTimeout(toastTimer.current); setToast(message); toastTimer.current = setTimeout(() => setToast(''), 3500); };
  const navigate = (next, replace = false) => {
    if (next.name === route.name && next.id === route.id && !replace) return;
    if (replace) window.history.replaceState({ sajuRoute: next }, '', '#' + next.name);
    else window.history.pushState({ sajuRoute: next }, '', '#' + next.name);
    setRoute(next); window.scrollTo(0, 0);
  };
  const change = async (producer, success) => {
    if (busyRef.current || !vaultRef.current) return null;
    busyRef.current = true; setBusy(true);
    try {
      const current = vaultRef.current;
      const result = producer(current);
      const next = result.state || result;
      if (next !== current) { await saveState(next, current.revision); vaultRef.current = next; setVault(next); }
      if (success) notify(success);
      return { state: next, result };
    } catch (failure) {
      if (failure.code === 'REVISION_CONFLICT') {
        try { const latest = await loadState(); vaultRef.current = latest; setVault(latest); } catch { /* Keep the last valid view. */ }
      }
      setError(errorText(failure)); return null;
    } finally { busyRef.current = false; setBusy(false); }
  };
  const open = async id => { if (await change(state => recordOpen(state, id))) navigate({ name: 'details', id }); };
  const entry = vault?.entries.find(item => item.id === route.id && !item.deletedAt);
  const page = ['details', 'analysis'].includes(route.name) && !entry ? 'vault' : route.name === 'analysis' && !calculateEntry(entry).legacyForm ? 'details' : route.name;
  const canBack = page !== 'vault';
  const back = () => { if (window.history.state?.sajuRoute?.name !== 'vault' && window.history.length > 1) window.history.back(); else navigate(INITIAL_ROUTE, true); };
  const analysis = page === 'analysis' && entry ? calculateEntry(entry) : null;

  return <div className={'mobile-root ' + (page === 'analysis' ? 'analysis-page reference-light-page' : page === 'vault' ? 'reference-vault-page' : 'reference-light-page ' + page + '-page' + (page === 'details' ? ' reader-page' : ''))}>
    {page !== 'vault' && page !== 'details' && <header className="app-header"><div>{canBack ? <button className="icon-button" aria-label="뒤로" onClick={back}><Icon name="back" /></button> : <span className="brand-seal">命</span>}<span className="header-title">{page === 'analysis' ? entry.name + ' · 상세 해석' : '사주 보관함'}</span></div><span className="offline-label"><i />{busy ? '저장 중' : '오프라인'}</span></header>}
    {!vault ? <main className="mobile-main"><section className="empty-state"><Icon name="vault" size={40} /><h1>{error ? '보관함을 열지 못했어요' : '보관함을 열고 있어요'}</h1>{error && <button className="primary" onClick={() => window.location.reload()}>다시 시도</button>}</section></main> : page === 'analysis' && analysis?.legacyForm ? <div className="legacy-analysis"><AnalysisBoundary key={entry.id} onReturn={back}><LegacyApp initialForm={analysis.legacyForm} onReturn={back} /></AnalysisBoundary></div> : <main className="mobile-main">
      {page === 'vault' && <ReferenceVault vault={vault} navigate={navigate} open={open} favorite={id => change(state => toggleFavorite(state, id))} busy={busy} />}
      {page === 'details' && entry && <ReferenceReader key={entry.id} entry={entry} vault={vault} navigate={navigate} change={change} busy={busy} />}
      {page === 'form' && <EntryForm key={entry?.id || 'new'} entry={entry} change={change} navigate={navigate} busy={busy} />}
      {page === 'settings' && <Settings vault={vault} change={change} busy={busy} setError={setError} notify={notify} />}
    </main>}
    {vault && page !== 'analysis' && page !== 'form' && page !== 'vault' && page !== 'details' && <nav className="bottom-nav" aria-label="주 메뉴"><button className={page === 'vault' ? 'active' : ''} onClick={() => navigate(INITIAL_ROUTE, true)}><Icon name="vault" /><span>보관함</span></button><button className="nav-add" onClick={() => navigate({ name: 'form' })}><span className="add-circle"><Icon name="plus" size={24} /></span><span>명식 추가</span></button><button className={page === 'settings' ? 'active' : ''} onClick={() => navigate({ name: 'settings' })}><Icon name="settings" /><span>설정</span></button></nav>}
    {toast && <div className="toast" role="status"><Icon name="check" size={18} />{toast}</div>}
    {error && <Dialog title="확인이 필요해요" onClose={() => setError('')}><p className="error-message">{error}</p><button className="primary full-width" onClick={() => setError('')}>확인</button></Dialog>}
  </div>;
}
