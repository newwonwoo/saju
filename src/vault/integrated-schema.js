export const DEFAULT_WEIGHTS=Object.freeze({enabled:false,stems:Object.freeze([.6,.6,1.2,.6]),branches:Object.freeze([.6,1.2,3,.6]),hidden:Object.freeze([1,1,1]),luck:Object.freeze([1,1,1,1,1])});
export const emptyIntegrated=()=>({version:1,weights:JSON.parse(JSON.stringify(DEFAULT_WEIGHTS)),notes:[],selection:null});
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const iso=x=>typeof x==='string'&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
export function weightErrors(w) {
 if(!plain(w)||Object.keys(w).some(k=>!['enabled','stems','branches','hidden','luck'].includes(k))||typeof w.enabled!=='boolean')return ['비중 설정 형식 오류'];
 const errors=[];for(const [k,n] of [['stems',4],['branches',4],['hidden',3],['luck',5]])if(!Array.isArray(w[k])||w[k].length!==n||w[k].some(v=>!Number.isFinite(v)||v<0||v>10))errors.push(k+' 비중은 0~10이어야 합니다.');
 return errors;
}
export function imageValid(s) {return typeof s==='string'&&s.length<=1100000&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(s);}
const validDate = date => typeof date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0,10)===date;
const validSelection = selection => plain(selection) && validDate(selection.date) && selection.date>='1900-01-01' && selection.date<='2050-12-31' && Number.isInteger(selection.hour) && selection.hour>=0 && selection.hour<=23 && Number.isInteger(selection.minute) && selection.minute>=0 && selection.minute<=59;
export function noteContentErrors(n) {
 const e=[];if(typeof n.title!=='string'||!n.title.trim()||n.title.length>120)e.push('제목은 1~120자');
 if(typeof n.text!=='string'||n.text.length>20000)e.push('본문은 20,000자 이하');
 if(typeof n.category!=='string'||n.category.length>80)e.push('분류는 80자 이하');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(n.date)||!Number.isFinite(Date.parse(n.date))||new Date(n.date).toISOString().slice(0,10)!==n.date)e.push('날짜를 확인하세요');
 if(!Array.isArray(n.images)||n.images.length>4||n.images.some(x=>!imageValid(x)))e.push('사진은 4장 이하의 작은 이미지여야 합니다');
 if(n.drawing!==null&&!imageValid(n.drawing))e.push('그림 형식 오류');
 if(n.selection!==null&&!validSelection(n.selection))e.push('운 선택 형식 오류');
 return e;
}
export function validateIntegrated(x,entryIds) {
 if(!plain(x)||x.version!==1||Object.keys(x).some(k=>!['version','weights','notes','selection'].includes(k)))return ['통합 저장 버전 오류'];
 const errors=weightErrors(x.weights);
 if(x.selection!==null&&(!validSelection(x.selection)||!entryIds.has(x.selection.entryId)))errors.push('운 선택 오류');
 if(!Array.isArray(x.notes)||x.notes.length>2000)return [...errors,'메모 최대 2,000개'];
 const ids=new Set();
 for(const n of x.notes){
  if(!plain(n)){errors.push('메모 형식 오류');continue;}
  if(typeof n.id!=='string'||!n.id||ids.has(n.id)||!entryIds.has(n.entryId))errors.push('메모 식별자 오류');ids.add(n.id);
  errors.push(...noteContentErrors(n));
  if(!iso(n.createdAt)||!iso(n.updatedAt)||(n.deletedAt!==null&&!iso(n.deletedAt)))errors.push('메모 시각 오류');
  if(!Array.isArray(n.history)||n.history.length>10)errors.push('메모 이력 오류');
  else for(const h of n.history) {if(!plain(h)||!iso(h.at))errors.push('메모 이력 시각 오류');else errors.push(...noteContentErrors(h));}
 }
 return errors;
}
export function mergeIntegrated(a,b,ids,conflicts) {
 if(!b)return a;if(!a)return {...b,notes:b.notes.filter(n=>ids.has(n.entryId)),selection:b.selection&&ids.has(b.selection.entryId)?b.selection:null};
 const notes=[...a.notes];for(const n of b.notes){if(!ids.has(n.entryId))continue;const old=notes.find(m=>m.id===n.id);if(!old)notes.push(n);else if(JSON.stringify(old)!==JSON.stringify(n))conflicts.push({kind:'note',id:n.id,reason:'local_note_kept'});}
 return {...a,notes};
}
