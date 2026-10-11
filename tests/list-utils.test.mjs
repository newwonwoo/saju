import test from 'node:test';
import assert from 'node:assert/strict';
import { ageBadge, dayGlyphs, filterAndSortEntries, referenceBirthLabel, stemColor, branchColor } from '../src/mobile/list-utils.js';
const make = (id, name, badge, stem, branch, date) => ({
  id, name, favorite: false, memo:'', createdAt:'2026-10-10T00:00:00.000Z', deletedAt:null,
  birth:{ input_year:Number(date.slice(0,4)),input_month:Number(date.slice(5,7)),input_day:Number(date.slice(8,10)),date_raw:date, time_status:'known',time_raw:'16:00',calendar_type:null,calendar_symbol_raw:'+',correction_raw:null },
  referenceDisplay:{badge_text:badge,day_stem_ko:stem,day_branch_ko:branch,badge_color:'pink'},
});
const first = make('1','가상기록가','32','임','신','1993/12/22');
const second = make('2','가상기록나','41','계','해','1985/05/19');
test('imported screenshot age/day remain raw when birth settings unconfirmed',()=>{
  assert.deepEqual(ageBadge(first,new Date('2026-10-11')),{text:'32',captured:true});
  assert.deepEqual(dayGlyphs(second),{stem:'계',branch:'해',captured:true});
  assert.equal(referenceBirthLabel(second),'+ 1985/05/19 16:00');
});
test('age computed for confirmed solar and current date, not screenshot badge',()=>{
  const confirmed={...first,birth:{...first.birth,calendar_type:'solar'}};
  assert.deepEqual(ageBadge(confirmed,new Date(2026,9,11)),{text:'32',captured:false});
  assert.deepEqual(ageBadge(confirmed,new Date(2026,11,22)),{text:'33',captured:false});
});
test('find by name, full day, partial stem, age, and birthday',()=>{
  const arr=[first,second];
  for(const q of ['계해','계 해','41','41세','1985/05/19','가상기록나']) assert.deepEqual(filterAndSortEntries(arr,{query:q}).map(x=>x.id),['2'],q);
  assert.deepEqual(filterAndSortEntries(arr,{query:'임신'}).map(x=>x.id),['1']);
  assert.deepEqual(filterAndSortEntries(arr,{query:'16:00'}).length,2);
  assert.deepEqual(filterAndSortEntries(arr,{query:'35'}).length,0);
});
test('sort names, age and original input unmodified',()=>{
  const entries=[second,first];
  assert.deepEqual(filterAndSortEntries(entries).map(x=>x.id),['1','2']);
  assert.deepEqual(filterAndSortEntries(entries,{sort:'age-asc'}).map(x=>x.id),['1','2']);
  assert.deepEqual(filterAndSortEntries(entries,{sort:'age-desc'}).map(x=>x.id),['2','1']);
  assert.equal(entries[0],second);
});
test('no invented calendar/time/age/sex when missing',()=>{
  const partial={...first,referenceDisplay:null,birth:{...first.birth,time_raw:null,time_status:'not_visible',calendar_symbol_raw:null,date_raw:null,input_year:null,input_month:null,input_day:null}};
  assert.equal(ageBadge(partial).text,'—');
  assert.equal(referenceBirthLabel(partial),'· 날짜 미확인');
  assert.equal(dayGlyphs(partial).stem,'·');
});
test('five element colors derived solely from day glyph',()=>{
  assert.equal(stemColor('계'),'water');
  assert.equal(stemColor('을'),'wood');
  assert.equal(branchColor('신'),'metal');
  assert.equal(branchColor('오'),'fire');
});

test('user-corrected calendar and time supersede stale screenshot display',()=>{
  const edited={...first,birth:{...first.birth,calendar_type:'lunar',lunar_leap_month:true,
    settings_status:{calendar_type:'user_confirmed'},input_hour:8,input_minute:5,time_raw:'16:00'}};
  assert.equal(referenceBirthLabel(edited),'= 1993/12/22 08:05');
  const pending={...edited,birth:{...edited.birth,time_status:'not_visible',input_hour:null,input_minute:null,time_raw:'16:00'}};
  assert.equal(referenceBirthLabel(pending),'= 1993/12/22');
});
test('search accepts compact YYYYMMDD and day sort puts unknown records last',()=>{
  const unknown={...first,id:'x',referenceDisplay:null,birth:{...first.birth,calendar_type:null,input_year:null,input_month:null,input_day:null, date_raw:null}};
  assert.deepEqual(filterAndSortEntries([first,second],{query:'19850519'}).map(x=>x.id),['2']);
  assert.deepEqual(filterAndSortEntries([unknown,second],{sort:'day'}).map(x=>x.id),['2','x']);
});
