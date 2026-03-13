import { useState, useEffect } from "react";

// ============================================================
// 1. 색상 테마 및 글로벌 스타일 (예전의 아름다운 테마 복구)
// ============================================================
const C = {
  gold:"#d4ae6e",goldL:"#f2dea8",goldD:"#a07820",
  bg:"#1a1108",card:"#261a0c",cardL:"#321f10",
  text:"#f7edd5",muted:"rgba(230,190,120,0.72)",
  water:"#4da0f0",wood:"#3fc060",fire:"#f55030",earth:"#d8a818",metal:"#b8a078",
  red:"#f06050",
};
const EL_COL={"水":C.water,"木":C.wood,"火":C.fire,"土":C.earth,"金":C.metal};

const globalStyle=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;700;900&family=Noto+Sans+KR:wght@300;400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  input,select,button{font-family:'Noto Sans KR',sans-serif; outline:none;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1; box-shadow:0 0 5px rgba(255,106,80,0.2)}50%{opacity:0.8; box-shadow:0 0 15px rgba(255,106,80,0.6); border-color:rgba(255,106,80,1)}}
  ::-webkit-scrollbar{height:3px;width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.3);border-radius:99px;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
`;

// ============================================================
// 2. 만세력 엔진 (Lunar) 및 명리 데이터
// ============================================================
let _lunarReady=false; let _lunarCallbacks=[];
function ensureLunar(cb){
  if(_lunarReady){cb();return;} _lunarCallbacks.push(cb);
  if(document.querySelector('script[data-lunar]'))return;
  const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js'; s.setAttribute('data-lunar','1');
  s.onload=()=>{_lunarReady=true;_lunarCallbacks.forEach(f=>f());_lunarCallbacks=[];}; document.head.appendChild(s);
}

const HS=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const EB=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const HS_EL=["木","木","火","火","土","土","金","金","水","水"];
const EB_EL=["水","土","木","木","土","火","火","土","金","金","土","水"];
const EB_KR=["자","축","인","묘","진","사","오","미","신","유","술","해"];
const ZODIAC_E=["🐭","🐮","🐯","🐰","🐉","🐍","🐴","🐑","🐵","🐓","🐶","🐗"];

const SS_MAP={甲甲:"비견",甲乙:"겁재",甲丙:"식신",甲丁:"상관",甲戊:"편재",甲己:"정재",甲庚:"편관",甲辛:"정관",甲壬:"편인",甲癸:"정인",乙乙:"비견",乙甲:"겁재",乙丁:"식신",乙丙:"상관",乙己:"편재",乙戊:"정재",乙辛:"편관",乙庚:"정관",乙癸:"편인",乙壬:"정인",丙丙:"비견",丙丁:"겁재",丙戊:"식신",丙己:"상관",丙庚:"편재",丙辛:"정재",丙壬:"편관",丙癸:"정관",丙甲:"편인",丙乙:"정인",丁丁:"비견",丁丙:"겁재",丁己:"식신",丁戊:"상관",丁辛:"편재",丁庚:"정재",丁癸:"편관",丁壬:"정관",丁乙:"편인",丁甲:"정인",戊戊:"비견",戊己:"겁재",戊庚:"식신",戊辛:"상관",戊壬:"편재",戊癸:"정재",戊甲:"편관",戊乙:"정관",戊丙:"편인",戊丁:"정인",己己:"비견",己戊:"겁재",己辛:"식신",己庚:"상관",己癸:"편재",己壬:"정재",己乙:"편관",己甲:"정관",己丁:"편인",己丙:"정인",庚庚:"비견",庚辛:"겁재",庚壬:"식신",庚癸:"상관",庚甲:"편재",庚乙:"정재",庚丙:"편관",庚丁:"정관",庚戊:"편인",庚己:"정인",辛辛:"비견",辛庚:"겁재",辛癸:"식신",辛壬:"상관",辛乙:"편재",辛甲:"정재",辛丁:"편관",辛丙:"정관",辛己:"편인",辛戊:"정인",壬壬:"비견",壬癸:"겁재",壬甲:"식신",壬乙:"상관",壬丙:"편재",壬丁:"정재",壬戊:"편관",壬己:"정관",壬庚:"편인",壬辛:"정인",癸癸:"비견",癸壬:"겁재",癸乙:"식신",癸甲:"상관",癸丁:"편재",癸丙:"정재",癸己:"편관",癸戊:"정관",癸辛:"편인",癸庚:"정인"};
const EBH={子:{yo:["壬",7],jung:null,bon:["癸",23]},丑:{yo:["癸",9],jung:["辛",3],bon:["己",18]},寅:{yo:["戊",7],jung:["丙",7],bon:["甲",16]},卯:{yo:["甲",10],jung:null,bon:["乙",20]},辰:{yo:["乙",9],jung:["癸",3],bon:["戊",18]},巳:{yo:["戊",7],jung:["庚",7],bon:["丙",16]},午:{yo:["丙",10],jung:["己",9],bon:["丁",11]},未:{yo:["丁",9],jung:["乙",3],bon:["己",18]},申:{yo:["戊",7],jung:["壬",7],bon:["庚",16]},酉:{yo:["庚",10],jung:null,bon:["辛",20]},戌:{yo:["辛",9],jung:["丁",3],bon:["戊",18]},亥:{yo:["戊",7],jung:["甲",5],bon:["壬",18]}};
function getSS(ds,s){return SS_MAP[ds+s]||"-";}

function getHB(hour,min=0){const t=hour*60+min;const B=[120,240,360,480,600,720,840,960,1080,1200,1320,1440];for(let i=0;i<12;i++)if(t<B[i])return i;return 0;}

function calcSaju(y,m,d,h,min=0){
  try {
    const S=window.Solar; const EC=window.EightChar; if(!S||!EC)throw new Error();
    const sl=S.fromYmd(y,m,d); const ln=sl.getLunar(); const ec=ln.getEightChar();
    const ds=ec.getDay(); const dsi=HS.indexOf(ds[0]); const hb=getHB(h,min);
    const sm={0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8}; const hs=HS[(sm[dsi]+hb)%10]; const br=EB[hb];
    const p=(s,l)=>({stem:s[0],branch:s[1],stemIdx:HS.indexOf(s[0]),branchIdx:EB.indexOf(s[1]),label:l});
    return{pillars:[p(hs+br,"시"),p(ds,"일"),p(ec.getMonth(),"월"),p(ec.getYear(),"년")], dayStem:ds[0], solar:{year:y,month:m,day:d,hour:h,minute:min}};
  } catch(e){ return {pillars:[], dayStem:"甲", solar:{year:y,month:m,day:d,hour:h,minute:min}}; }
}
function calcDaeun(by,bm,bd,gender,mp){
  if(!mp)return[]; const isY=["甲","丙","戊","庚","壬"].includes(mp.stem); const f=(isY&&gender==="male")||(!isY&&gender==="female");
  return Array.from({length:9},(_,i)=>{const o=f?i+1:-(i+1);const si=((mp.stemIdx+o)%10+10)%10;const bi=((mp.branchIdx+o)%12+12)%12;const a=i*10+1;return{stem:HS[si],branch:EB[bi],stemIdx:si,branchIdx:bi,startAge:a,startYear:by+a};});
}
function generateSewoons(bY=2024){return Array.from({length:12},(_,i)=>{const y=bY+i;const o=(y-1984+60)%60;return{year:y,stem:HS[o%10],branch:EB[o%12]};});}
function get12Woonsung(s,b){const W=["장생","목욕","관대","건록","제왕","쇠","병","사","묘","절","태","양"];const B={"甲":11,"丙":2,"戊":2,"庚":5,"壬":8,"乙":6,"丁":9,"己":9,"辛":0,"癸":3};if(B[s]===undefined)return"-";const iy=["甲","丙","戊","庚","壬"].includes(s);const bi=EB.indexOf(b);return W[iy?(bi-B[s]+12)%12:(B[s]-bi+12)%12];}
function getShinsal(ds,s,b){const G={"甲":["丑","未"],"戊":["丑","未"],"庚":["丑","未"],"乙":["子","申"],"己":["子","申"],"丙":["亥","酉"],"丁":["亥","酉"],"辛":["寅","午"],"壬":["卯","巳"],"癸":["卯","巳"]};const W=["甲辰","乙未","丙戌","丁丑","戊辰","壬戌","癸丑"];let r=[];if(G[ds]?.includes(b))r.push("천을귀인");if(W.includes(s+b))r.push("백호대살");return r;}

// ============================================================
// 3. 코어 엔진 (신강신약 V10, 조후 2.0, 대운, 궁합)
// ============================================================
const JOHU_NEED={亥:{need:["火","木"],avoid:["水","金"]},子:{need:["火","木"],avoid:["水","金"]},丑:{need:["火","木"],avoid:["水","金"]},寅:{need:["水","火"],avoid:[]},卯:{need:["水","火"],avoid:[]},辰:{need:["木","水"],avoid:[]},巳:{need:["水","金"],avoid:["火","木"]},午:{need:["水","金"],avoid:["火","木"]},未:{need:["水","金"],avoid:["火","木"]},申:{need:["火","木"],avoid:["金","水"]},酉:{need:["火","木"],avoid:["金","水"]},戌:{need:["木","水"],avoid:[]}};
const GANJI_TH={"甲":{T:1,H:0},"乙":{T:1,H:2},"丙":{T:5,H:-2},"丁":{T:4,H:-4},"戊":{T:2,H:-3},"己":{T:1,H:2},"庚":{T:-2,H:-2},"辛":{T:-3,H:-1},"壬":{T:-4,H:4},"癸":{T:-3,H:5},"子":{T:-5,H:3},"丑":{T:-4,H:1},"寅":{T:1,H:1},"卯":{T:2,H:2},"辰":{T:2,H:3},"巳":{T:4,H:-1},"午":{T:5,H:-2},"未":{T:4,H:-4},"申":{T:-1,H:-2},"酉":{T:-2,H:-1},"戌":{T:-2,H:-4},"亥":{T:-3,H:2}};
const CHUNG_MAP={子:"午",午:"子",丑:"未",未:"丑",寅:"申",申:"寅",卯:"酉",酉:"卯",辰:"戌",戌:"辰",巳:"亥",亥:"巳"};

function calcJohuDetail(p, ds=null, db=null, ss=null, sb=null) {
  let t=0, h=0; const bw=[1,2,5,1], sw=[0.5,0.5,0.5,0.5];
  p.forEach((x,i)=>{t+=(GANJI_TH[x.stem]?.T||0)*sw[i]+(GANJI_TH[x.branch]?.T||0)*bw[i];h+=(GANJI_TH[x.stem]?.H||0)*sw[i]+(GANJI_TH[x.branch]?.H||0)*bw[i];});
  if(ds&&db){t+=(GANJI_TH[ds]?.T||0)*0.5+(GANJI_TH[db]?.T||0)*3;h+=(GANJI_TH[ds]?.H||0)*0.5+(GANJI_TH[db]?.H||0)*3;}
  if(ss&&sb){t+=(GANJI_TH[ss]?.T||0)*0.5+(GANJI_TH[sb]?.T||0)*2;h+=(GANJI_TH[ss]?.H||0)*0.5+(GANJI_TH[sb]?.H||0)*2;}
  const d=Math.sqrt(t*t+h*h); let sc=Math.max(0,Math.min(100,Math.round(100-(d*2.2))));
  let st="NEUTRAL"; if(t>3&&h<-2)st="HOT_DRY"; else if(t>3&&h>=-2)st="HOT_WET"; else if(t<-3&&h<-2)st="COLD_DRY"; else if(t<-3&&h>=-2)st="COLD_WET";
  return{tempScore:Math.max(0,Math.min(100,Math.round(50+(t*2.5)))),humScore:Math.max(0,Math.min(100,Math.round(50+(h*2.5)))),totalScore:sc,status:st};
}

function calcStrengthDetail(p, ds=null, db=null){
  const dayEl=HS_EL[p[1].stemIdx]; let my=0; const sc={"木":0,"火":0,"土":0,"金":0,"水":0};
  p.forEach((x,i)=>{
    const se=HS_EL[x.stemIdx], be=EB_EL[x.branchIdx]; if(se) sc[se] += (i===1?0:0.5); if(be) sc[be] += [0.5,1,2,0.5][i];
    if(se===dayEl||(dayEl==="木"&&se==="水")||(dayEl==="火"&&se==="木")||(dayEl==="土"&&se==="火")||(dayEl==="金"&&se==="土")||(dayEl==="水"&&se==="金")) my+=(i===1?0:0.5);
    if(be===dayEl||(dayEl==="木"&&be==="水")||(dayEl==="火"&&be==="木")||(dayEl==="土"&&be==="火")||(dayEl==="金"&&be==="土")||(dayEl==="水"&&be==="金")) my+=[0.5,1,2,0.5][i];
  });
  if(db){
    const be=EB_EL[EB.indexOf(db)]; if(be) sc[be]+=1.5;
    if(be===dayEl||(dayEl==="木"&&be==="水")||(dayEl==="火"&&be==="木")||(dayEl==="土"&&be==="火")||(dayEl==="金"&&be==="土")||(dayEl==="水"&&be==="金")) my+=1.5;
  }
  return { strength: my>=(db?6.5:5.5)?"신강":my<=(db?5.0:4.0)?"신약":"중화", elementScores: sc };
}
function calcElCnt(p, ds=null, ss=null){
  const c={"水":0,"木":0,"火":0,"土":0,"金":0}; p.forEach(x=>{ const se=HS_EL[x.stemIdx], be=EB_EL[x.branchIdx]; if(se)c[se]+=1.5; if(be)c[be]+=1; });
  if(ds){c[HS_EL[HS.indexOf(ds.stem)]]+=1; c[EB_EL[EB.indexOf(ds.branch)]]+=2;}
  if(ss){c[HS_EL[HS.indexOf(ss.stem)]]+=0.5; c[EB_EL[EB.indexOf(ss.branch)]]+=1;}
  return c;
}
function calcDaeunGrade(p, ds, ds2, db2) {
  let score=50; if(ds2===db2)score+=10; if(CHUNG_MAP[db2]===p[1].branch)score-=15; if(CHUNG_MAP[db2]===p[2].branch)score-=15;
  if(score>=70)return{grade:"S",color:"#f5c842"}; else if(score>=55)return{grade:"A",color:"#4ade80"}; else if(score>=40)return{grade:"B",color:C.gold}; else return{grade:"C",color:"#fb923c"};
}
const HS_HAP={甲:"己",己:"甲",乙:"庚",庚:"乙",丙:"辛",辛:"丙",丁:"壬",壬:"丁",戊:"癸",癸:"戊"};
const HS_CHUNG={甲:"庚",庚:"甲",乙:"辛",辛:"乙",丙:"壬",壬:"丙",丁:"癸",癸:"丁"};
const WANG_JI=["子","午","卯","酉"]; const WANG_CHUNG={子:"午",午:"子",卯:"酉",酉:"卯"};
const SAMHYUNG=[["寅","巳","申"],["丑","戌","未"],["子","卯"]];
function calcCompatScore(s1,s2){
  const d1=s1.pillars[1].stem, d2=s2.pillars[1].stem, b1=s1.pillars[1].branch, b2=s2.pillars[1].branch;
  let sc=50; const dt=[];
  if(HS_HAP[d1]===d2){sc+=20;dt.push({type:"일간합",icon:"✦",desc:"두 기운이 하나로 합쳐지는 깊은 인연",positive:true,pts:20});}
  if(HS_CHUNG[d1]===d2){sc-=15;dt.push({type:"일간충",icon:"✕",desc:"서로 부딪히는 강한 긴장 관계",positive:false,pts:-15});}
  const n1=JOHU_NEED[s1.pillars[2].branch]?.need||[], n2=JOHU_NEED[s2.pillars[2].branch]?.need||[];
  const e1=HS_EL[s1.pillars[1].stemIdx], e2=HS_EL[s2.pillars[1].stemIdx]; let jp=0; if(n1.includes(e2))jp+=10; if(n2.includes(e1))jp+=10; sc+=jp;
  dt.push(jp>0?{type:"조후보완",icon:"◎",desc:`서로에게 필요한 오행(${e2}·${e1}) 제공`,positive:true,pts:jp}:{type:"조후보완",icon:"△",desc:"상호 보완 약함",positive:false,pts:0});
  if(WANG_JI.includes(b1)&&WANG_JI.includes(b2)&&WANG_CHUNG[b1]===b2){sc-=12;dt.push({type:"왕지충",icon:"⚡",desc:"강한 기운끼리 정면 충돌",positive:false,pts:-12});}
  const cmb=[...s1.pillars.map(p=>p.branch),...s2.pillars.map(p=>p.branch)];
  if(SAMHYUNG.some(g=>g.every(b=>cmb.includes(b)))){sc-=10;dt.push({type:"삼형살",icon:"⚠",desc:"함께할수록 예상치 못한 시련이 따름",positive:false,pts:-10});}
  return{score:Math.max(0,Math.min(100,sc)),details:dt};
}

// 물상 텍스트 & 프롬프트 생성
const BRANCH_DESC={子:"고요한 한겨울 밤",丑:"차고 척박한 언 땅",寅:"이른 봄새벽",卯:"화사한 봄날",辰:"봄비 내리는 무르익은 봄날",巳:"초여름",午:"작열하는 한여름 대낮",未:"늦여름의 황혼",申:"청명한 초가을",酉:"결실의 향기 가득한 가을",戌:"쓸쓸한 늦가을",亥:"찬 겨울비 내리는 초겨울"};
const STEM_DESC={甲:{a:"에 우뚝 솟은 큰 나무"},乙:{a:"을 타고 오르는 부드러운 덩굴"},丙:{a:"을 환하게 비추는 뜨거운 태양"},丁:{a:"을 밝히는 따뜻한 촛불"},戊:{a:"을 묵묵히 떠받치는 큰 산"},己:{a:"을 품고 생명을 키우는 대지"},庚:{a:"에 날카롭게 빛나는 서늘한 칼날"},辛:{a:"에서 차갑게 반짝이는 보석"},壬:{a:"을 힘차게 흘러가는 깊은 강물"},癸:{a:"을 조용히 적시며 내리는 맑은 비"}};
function buildMulsangHeader(ds, mb){ return (BRANCH_DESC[mb]||"") + (STEM_DESC[ds]?.a||"") + "의 모습입니다."; }
