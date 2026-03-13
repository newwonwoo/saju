import { useState, useEffect } from "react";

// ============================================================
// 1. 색상 테마 및 스타일
// ============================================================
const C = { gold:"#d4ae6e",goldL:"#f2dea8",goldD:"#a07820", bg:"#1a1108",card:"#261a0c", text:"#f7edd5",muted:"rgba(230,190,120,0.72)", water:"#4da0f0",wood:"#3fc060",fire:"#f55030",earth:"#d8a818",metal:"#b8a078", red:"#f06050" };
const EL_COL={"水":C.water,"木":C.wood,"火":C.fire,"土":C.earth,"金":C.metal};

const globalStyle=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;700;900&family=Noto+Sans+KR:wght@300;400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  input,select,button{font-family:'Noto Sans KR',sans-serif;outline:none;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{box-shadow:0 0 5px rgba(255,106,80,0.2)}50%{box-shadow:0 0 15px rgba(255,106,80,0.6); border-color:rgba(255,106,80,1)}}
  ::-webkit-scrollbar{height:3px;width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.3);border-radius:99px;}
`;

// ============================================================
// 2. 명리 데이터 & 만세력 엔진 (lunar-javascript)
// ============================================================
const HS=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const EB=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const HS_EL=["木","木","火","火","土","土","金","金","水","水"];
const EB_EL=["水","土","木","木","土","火","火","土","金","金","土","水"];
const EB_KR=["자","축","인","묘","진","사","오","미","신","유","술","해"];
const ZODIAC_E=["🐭","🐮","🐯","🐰","🐉","🐍","🐴","🐑","🐵","🐓","🐶","🐗"];

const SS_MAP={甲甲:"비견",甲乙:"겁재",甲丙:"식신",甲丁:"상관",甲戊:"편재",甲己:"정재",甲庚:"편관",甲辛:"정관",甲壬:"편인",甲癸:"정인",乙乙:"비견",乙甲:"겁재",乙丁:"식신",乙丙:"상관",乙己:"편재",乙戊:"정재",乙辛:"편관",乙庚:"정관",乙癸:"편인",乙壬:"정인",丙丙:"비견",丙丁:"겁재",丙戊:"식신",丙己:"상관",丙庚:"편재",丙辛:"정재",丙壬:"편관",丙癸:"정관",丙甲:"편인",丙乙:"정인",丁丁:"비견",丁丙:"겁재",丁己:"식신",丁戊:"상관",丁辛:"편재",丁庚:"정재",丁癸:"편관",丁壬:"정관",丁乙:"편인",丁甲:"정인",戊戊:"비견",戊己:"겁재",戊庚:"식신",戊辛:"상관",戊壬:"편재",戊癸:"정재",戊甲:"편관",戊乙:"정관",戊丙:"편인",戊丁:"정인",己己:"비견",己戊:"겁재",己辛:"식신",己庚:"상관",己癸:"편재",己壬:"정재",己乙:"편관",己甲:"정관",己丁:"편인",己丙:"정인",庚庚:"비견",庚辛:"겁재",庚壬:"식신",庚癸:"상관",庚甲:"편재",庚乙:"정재",庚丙:"편관",庚丁:"정관",庚戊:"편인",庚己:"정인",辛辛:"비견",辛庚:"겁재",辛癸:"식신",辛壬:"상관",辛乙:"편재",辛甲:"정재",辛丁:"편관",辛丙:"정관",辛己:"편인",辛戊:"정인",壬壬:"비견",壬癸:"겁재",壬甲:"식신",壬乙:"상관",壬丙:"편재",壬丁:"정재",壬戊:"편관",壬己:"정관",壬庚:"편인",壬辛:"정인",癸癸:"비견",癸壬:"겁재",癸乙:"식신",癸甲:"상관",癸丁:"편재",癸丙:"정재",癸己:"편관",癸戊:"정관",癸辛:"편인",癸庚:"정인"};
const EBH={子:{yo:["壬",7],jung:null,bon:["癸",23]},丑:{yo:["癸",9],jung:["辛",3],bon:["己",18]},寅:{yo:["戊",7],jung:["丙",7],bon:["甲",16]},卯:{yo:["甲",10],jung:null,bon:["乙",20]},辰:{yo:["乙",9],jung:["癸",3],bon:["戊",18]},巳:{yo:["戊",7],jung:["庚",7],bon:["丙",16]},午:{yo:["丙",10],jung:["己",9],bon:["丁",11]},未:{yo:["丁",9],jung:["乙",3],bon:["己",18]},申:{yo:["戊",7],jung:["壬",7],bon:["庚",16]},酉:{yo:["庚",10],jung:null,bon:["辛",20]},戌:{yo:["辛",9],jung:["丁",3],bon:["戊",18]},亥:{yo:["戊",7],jung:["甲",5],bon:["壬",18]}};
function getSS(ds,s){return SS_MAP[ds+s]||"-";}

let _lunarReady=false, _lunarCallbacks=[];
function ensureLunar(cb){
  if(_lunarReady){cb();return;}
  _lunarCallbacks.push(cb);
  if(document.querySelector('script[data-lunar]'))return;
  const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js'; s.setAttribute('data-lunar','1');
  s.onload=()=>{_lunarReady=true;_lunarCallbacks.forEach(f=>f());_lunarCallbacks=[];}; document.head.appendChild(s);
}

function getHB(hour,min=0){const t=hour*60+min;const B=[120,240,360,480,600,720,840,960,1080,1200,1320,1440];for(let i=0;i<12;i++)if(t<B[i])return i;return 0;}

function calcSaju(y,m,d,hour,minute=0){
  try {
    const S=window.Solar; const EC=window.EightChar; if(!S||!EC)throw new Error();
    const solar=S.fromYmd(y,m,d); const lunar=solar.getLunar(); const ec=lunar.getEightChar();
    const ds=ec.getDay(); const dsi=HS.indexOf(ds[0]); const hb=getHB(hour,minute);
    const sm={0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8}; const hs=HS[(sm[dsi]+hb)%10]; const br=EB[hb];
    const p = (s,l)=>({stem:s[0],branch:s[1],stemIdx:HS.indexOf(s[0]),branchIdx:EB.indexOf(s[1]),label:l});
    return { pillars:[p(hs+br,"시"), p(ds,"일"), p(ec.getMonth(),"월"), p(ec.getYear(),"년")], dayStem:ds[0], solar:{year:y,month:m,day:d,hour,minute} };
  } catch(e) {
    // 안전한 폴백 로직
    return { pillars:[], dayStem:"甲", solar:{year:y,month:m,day:d,hour,minute} };
  }
}

function calcDaeun(by,bm,bd,gender,mp){
  if(!mp) return [];
  const isY=["甲","丙","戊","庚","壬"].includes(mp.stem); const f=(isY&&gender==="male")||(!isY&&gender==="female");
  return Array.from({length:9},(_,i)=>{
    const o=f?i+1:-(i+1); const si=((mp.stemIdx+o)%10+10)%10; const bi=((mp.branchIdx+o)%12+12)%12; const a=i*10+1;
    return{stem:HS[si],branch:EB[bi],stemIdx:si,branchIdx:bi,startAge:a,startYear:by+a};
  });
}
function generateSewoons(baseYear=2024){
  return Array.from({length:12},(_,i)=>{const y=baseYear+i; const o=(y-1984+60)%60; return{year:y,stem:HS[o%10],branch:EB[o%12]};});
}

function get12Woonsung(s,b){
  const W=["장생","목욕","관대","건록","제왕","쇠","병","사","묘","절","태","양"];
  const B={"甲":11,"丙":2,"戊":2,"庚":5,"壬":8,"乙":6,"丁":9,"己":9,"辛":0,"癸":3};
  if(B[s]===undefined)return"-";
  const iy=["甲","丙","戊","庚","壬"].includes(s); const bi=EB.indexOf(b); const idx=iy?(bi-B[s]+12)%12:(B[s]-bi+12)%12;
  return W[idx];
}
function getShinsal(ds,s,b){
  const G={"甲":["丑","未"],"戊":["丑","未"],"庚":["丑","未"],"乙":["子","申"],"己":["子","申"],"丙":["亥","酉"],"丁":["亥","酉"],"辛":["寅","午"],"壬":["卯","巳"],"癸":["卯","巳"]};
  const W=["甲辰","乙未","丙戌","丁丑","戊辰","壬戌","癸丑"];
  let r=[]; if(G[ds]?.includes(b))r.push("천을귀인"); if(W.includes(s+b))r.push("백호대살"); return r;
}

// ============================================================
// 3. 통변 코어 엔진 (신강신약 V10, 조후 2.0, 대운 V8)
// ============================================================
const JOHU_NEED={亥:{need:["火","木"],avoid:["水","金"]},子:{need:["火","木"],avoid:["水","金"]},丑:{need:["火","木"],avoid:["水","金"]},寅:{need:["水","火"],avoid:[]},卯:{need:["水","火"],avoid:[]},辰:{need:["木","水"],avoid:[]},巳:{need:["水","金"],avoid:["火","木"]},午:{need:["水","金"],avoid:["火","木"]},未:{need:["水","金"],avoid:["火","木"]},申:{need:["火","木"],avoid:["金","水"]},酉:{need:["火","木"],avoid:["金","水"]},戌:{need:["木","水"],avoid:[]}};
const GANJI_TH={"甲":{T:1,H:0},"乙":{T:1,H:2},"丙":{T:5,H:-2},"丁":{T:4,H:-4},"戊":{T:2,H:-3},"己":{T:1,H:2},"庚":{T:-2,H:-2},"辛":{T:-3,H:-1},"壬":{T:-4,H:4},"癸":{T:-3,H:5},"子":{T:-5,H:3},"丑":{T:-4,H:1},"寅":{T:1,H:1},"卯":{T:2,H:2},"辰":{T:2,H:3},"巳":{T:4,H:-1},"午":{T:5,H:-2},"未":{T:4,H:-4},"申":{T:-1,H:-2},"酉":{T:-2,H:-1},"戌":{T:-2,H:-4},"亥":{T:-3,H:2}};

function calcJohuDetail(p, ds=null, db=null, ss=null, sb=null) {
  let t=0, h=0; const bw=[1,2,5,1], sw=[0.5,0.5,0.5,0.5];
  p.forEach((x,i)=>{t+=(GANJI_TH[x.stem]?.T||0)*sw[i]+(GANJI_TH[x.branch]?.T||0)*bw[i];h+=(GANJI_TH[x.stem]?.H||0)*sw[i]+(GANJI_TH[x.branch]?.H||0)*bw[i];});
  if(ds&&db){t+=(GANJI_TH[ds]?.T||0)*0.5+(GANJI_TH[db]?.T||0)*3;h+=(GANJI_TH[ds]?.H||0)*0.5+(GANJI_TH[db]?.H||0)*3;}
  if(ss&&sb){t+=(GANJI_TH[ss]?.T||0)*0.5+(GANJI_TH[sb]?.T||0)*2;h+=(GANJI_TH[ss]?.H||0)*0.5+(GANJI_TH[sb]?.H||0)*2;}
  const d=Math.sqrt(t*t+h*h); let sc=Math.max(0,Math.min(100,Math.round(100-(d*2.2))));
  let st="NEUTRAL"; if(t>3&&h<-2)st="HOT_DRY"; else if(t>3&&h>=-2)st="HOT_WET"; else if(t<-3&&h<-2)st="COLD_DRY"; else if(t<-3&&h>=-2)st="COLD_WET";
  const need = JOHU_NEED[p[2]?.branch]?.need || []; const avoid = JOHU_NEED[p[2]?.branch]?.avoid || [];
  return{tempScore:Math.max(0,Math.min(100,Math.round(50+(t*2.5)))),humScore:Math.max(0,Math.min(100,Math.round(50+(h*2.5)))),totalScore:sc,status:st,need,avoid};
}

function calcStrengthDetail(p, ds=null, db=null){
  const dayEl=HS_EL[p[1].stemIdx]; let my=0; const scores={"木":0,"火":0,"土":0,"金":0,"水":0};
  p.forEach((x,i)=>{
    const se=HS_EL[x.stemIdx], be=EB_EL[x.branchIdx];
    if(se) scores[se] += (i===1?0:0.5); if(be) scores[be] += [0.5,1,2,0.5][i];
    if(se===dayEl||(dayEl==="木"&&se==="水")||(dayEl==="火"&&se==="木")||(dayEl==="土"&&se==="火")||(dayEl==="金"&&se==="土")||(dayEl==="水"&&se==="金")) my+=(i===1?0:0.5);
    if(be===dayEl||(dayEl==="木"&&be==="水")||(dayEl==="火"&&be==="木")||(dayEl==="土"&&be==="火")||(dayEl==="金"&&be==="土")||(dayEl==="水"&&be==="金")) my+=[0.5,1,2,0.5][i];
  });
  if(db){
    const be=EB_EL[EB.indexOf(db)]; if(be) scores[be]+=1.5;
    if(be===dayEl||(dayEl==="木"&&be==="水")||(dayEl==="火"&&be==="木")||(dayEl==="土"&&be==="火")||(dayEl==="金"&&be==="土")||(dayEl==="水"&&be==="金")) my+=1.5;
  }
  const str = my>=(db?6.5:5.5)?"신강":my<=(db?5.0:4.0)?"신약":"중화";
  return { strength: str, elementScores: scores };
}

function calcElCnt(p, ds=null, ss=null){
  const c={"水":0,"木":0,"火":0,"土":0,"金":0};
  p.forEach(x=>{ const se=HS_EL[x.stemIdx]; const be=EB_EL[x.branchIdx]; if(se)c[se]+=1.5; if(be)c[be]+=1; });
  if(ds){const se=HS_EL[HS.indexOf(ds.stem)], be=EB_EL[EB.indexOf(ds.branch)]; if(se)c[se]+=1; if(be)c[be]+=2;}
  if(ss){const se=HS_EL[HS.indexOf(ss.stem)], be=EB_EL[EB.indexOf(ss.branch)]; if(se)c[se]+=0.5; if(be)c[be]+=1;}
  return c;
}

const CHUNG_MAP = { 子:"午", 午:"子", 丑:"未", 未:"丑", 寅:"申", 申:"寅", 卯:"酉", 酉:"卯", 辰:"戌", 戌:"辰", 巳:"亥", 亥:"巳" };
function calcDaeunGrade(pillars, dayStem, daeunStem, daeunBranch) {
  let score = 50;
  if(daeunStem===daeunBranch) score+=10;
  if(CHUNG_MAP[daeunBranch]===pillars[1].branch) score-=15;
  if(CHUNG_MAP[daeunBranch]===pillars[2].branch) score-=15;
  if(score >= 70) return { grade: "S", color: "#f5c842" };
  else if(score >= 55) return { grade: "A", color: "#4ade80" };
  else if(score >= 40) return { grade: "B", color: C.gold };
  else return { grade: "C", color: "#fb923c" };
}

// ============================================================
// 4. UI 및 대시보드 부품
// ============================================================
function Card({children,style}){return <div style={{background:C.card,borderRadius:20,padding:20,border:"1px solid rgba(215,180,105,0.22)",...style}}>{children}</div>;}
function CardTitle({children}){return <p style={{textAlign:"center",fontWeight:700,color:C.goldL,marginBottom:14,fontSize:"0.88rem",letterSpacing:"0.1em"}}>{children}</p>;}
function Btn({children,active,onClick}){return <button onClick={onClick} style={{flex:1,padding:"10px 0",borderRadius:12,background:active?`${C.gold}28`:"rgba(255,255,255,0.05)",color:active?C.gold:`${C.gold}88`,border:active?`1px solid ${C.gold}70`:"1px solid transparent",cursor:"pointer",fontWeight:700,fontSize:"0.85rem"}}>{children}</button>;}

// ✨✨ 6기둥 콕핏 (지장간 쏙 들어간 버전)
function SajuChart({ pillars, dayStem, daeun = null, sewoon = null, hitBranch = null }) {
  if (!pillars || pillars.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {pillars.map((p, i) => {
        const isDay=i===1; const sc=EL_COL[HS_EL[p.stemIdx]]; const bc=EL_COL[EB_EL[p.branchIdx]];
        const isHit = hitBranch && CHUNG_MAP[hitBranch]===p.branch;
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"0.6rem 0.05rem", background:isDay?`${C.gold}09`:"rgba(255,255,255,0.02)", borderRadius:12, border:isHit?`1.5px solid ${C.red}`:"1px solid rgba(255,255,255,0.05)", position:"relative", animation:isHit?"pulse 1.5s infinite":"none" }}>
            {isHit && <div style={{position:"absolute", top:-8, right:-4, fontSize:"0.8rem", textShadow:"0 0 5px red"}}>⚡</div>}
            <span style={{fontSize:"0.5rem", color:C.muted, marginBottom:3}}>{p.label}주</span>
            <span style={{fontSize:"0.53rem", color:isDay?C.gold:`${C.gold}88`, fontWeight:700, marginBottom:3, background:"rgba(255,255,255,0.08)", borderRadius:4, padding:"2px 6px"}}>{isDay?"일간":getSS(dayStem, p.stem)}</span>
            <div style={{fontSize:"2.2rem", lineHeight:1, color:sc, fontFamily:"serif", fontWeight:900, marginBottom:2}}>{p.stem}</div>
            <div style={{width:14, height:1, background:"rgba(255,255,255,0.1)", margin:"4px 0"}}/>
            <div style={{fontSize:"2.2rem", lineHeight:1, color:bc, fontFamily:"serif", fontWeight:900, marginBottom:2}}>{p.branch}</div>
            
            {/* 지장간 (기둥 안으로 흡수!) */}
            <div style={{marginTop:6, background:"rgba(0,0,0,0.3)", borderRadius:6, padding:"4px 2px", width:"90%"}}>
              {[EBH[p.branch]?.yo, EBH[p.branch]?.jung, EBH[p.branch]?.bon].filter(Boolean).map((j, idx) => (
                <div key={idx} style={{fontSize:"0.55rem", color:j[0]===dayStem||idx===2?EL_COL[HS_EL[HS.indexOf(j[0])]]:C.muted, fontWeight:j[0]===dayStem||idx===2?"bold":"normal", textAlign:"center"}}>{j[0]}</div>
              ))}
            </div>
            {/* 12운성 & 신살 (기둥 안으로 흡수!) */}
            <div style={{marginTop:6, fontSize:"0.5rem", textAlign:"center", lineHeight:1.3}}>
              <div style={{color:"#f6ad55", fontWeight:"bold"}}>{get12Woonsung(dayStem, p.branch)}</div>
              {getShinsal(dayStem, p.stem, p.branch).map((s, idx)=><div key={idx} style={{color:"#fc8181", marginTop:2}}>{s}</div>)}
            </div>
          </div>
        );
      })}
      
      {/* 5기둥: 대운 */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", background:"rgba(74,222,128,0.05)", borderRadius:12, padding:"0.6rem 0.05rem", border:"1px dashed #4ade80" }}>
        <span style={{fontSize:"0.5rem", color:"#4ade80", marginBottom:3}}>대운</span>
        {daeun ? (
          <>
            <span style={{fontSize:"0.53rem", color:C.gold, fontWeight:700, marginBottom:3, background:"rgba(255,255,255,0.08)", borderRadius:4, padding:"2px 6px"}}>{getSS(dayStem, daeun.stem)}</span>
            <div style={{fontSize:"1.8rem", color:EL_COL[HS_EL[HS.indexOf(daeun.stem)]], fontFamily:"serif", fontWeight:900}}>{daeun.stem}</div>
            <div style={{width:14, height:1, background:"rgba(255,255,255,0.1)", margin:"4px 0"}}/>
            <div style={{fontSize:"1.8rem", color:EL_COL[EB_EL[EB.indexOf(daeun.branch)]], fontFamily:"serif", fontWeight:900}}>{daeun.branch}</div>
          </>
        ) : <div style={{flex:1, display:"flex", alignItems:"center", color:"#4ade80", opacity:0.5, fontSize:"0.7rem"}}>선택대기</div>}
      </div>
      
      {/* 6기둥: 세운 */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", background:"rgba(240,96,80,0.05)", borderRadius:12, padding:"0.6rem 0.05rem", border:"1px dashed #f06050" }}>
        <span style={{fontSize:"0.5rem", color:"#f06050", marginBottom:3}}>세운</span>
        {sewoon ? (
          <>
            <span style={{fontSize:"0.53rem", color:C.gold, fontWeight:700, marginBottom:3, background:"rgba(255,255,255,0.08)", borderRadius:4, padding:"2px 6px"}}>{getSS(dayStem, sewoon.stem)}</span>
            <div style={{fontSize:"1.8rem", color:EL_COL[HS_EL[HS.indexOf(sewoon.stem)]], fontFamily:"serif", fontWeight:900}}>{sewoon.stem}</div>
            <div style={{width:14, height:1, background:"rgba(255,255,255,0.1)", margin:"4px 0"}}/>
            <div style={{fontSize:"1.8rem", color:EL_COL[EB_EL[EB.indexOf(sewoon.branch)]], fontFamily:"serif", fontWeight:900}}>{sewoon.branch}</div>
          </>
        ) : <div style={{flex:1, display:"flex", alignItems:"center", color:"#f06050", opacity:0.5, fontSize:"0.7rem"}}>선택대기</div>}
      </div>
    </div>
  );
}

// 오행 펜타곤도
function Pentagon({ pillars, dayStem, daeun=null, sewoon=null }) {
  if(!pillars || pillars.length===0) return null;
  const cnt = calcElCnt(pillars, daeun, sewoon); const dayEl = HS_EL[HS.indexOf(dayStem)];
  const O=["木","火","土","金","水"]; const sI=Math.max(0, O.indexOf(dayEl)); const ord=[...O.slice(sI), ...O.slice(0,sI)];
  const cx=130, cy=130, R=80, maxV=Math.max(...Object.values(cnt),1);
  const getP=()=>ord.map((el,i)=>{const a=(i*72-90)*Math.PI/180; const rr=14+(R-14)*(cnt[el]/maxV); return {x:cx+rr*Math.cos(a), y:cy+rr*Math.sin(a)};});
  const pathD = getP().map((p,i)=>(i===0?"M":"L")+p.x+","+p.y).join(" ")+"Z";
  return (
    <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
      <svg width="260" height="260" viewBox="0 0 260 260">
        <rect width="260" height="260" fill="#1e1508" rx="16" />
        {[0.33, 0.66, 1.0].map(lv=>(<path key={lv} d={ord.map((_,i)=>{const a=(i*72-90)*Math.PI/180; const rr=(R-14)*lv+14; return(i===0?"M":"L")+(cx+rr*Math.cos(a))+","+(cy+rr*Math.sin(a));}).join(" ")+"Z"} fill="none" stroke="rgba(220,185,120,0.15)"/>))}
        <path d={pathD} fill={`${C.gold}20`} stroke={C.gold} strokeWidth="2" style={{transition:"all 0.5s"}}/>
        {ord.map((el,i)=>{
          const r=14+(40-14)*(cnt[el]/maxV); const a=(i*72-90)*Math.PI/180; const px=cx+R*Math.cos(a); const py=cy+R*Math.sin(a);
          return <g key={el}><circle cx={px} cy={py} r={r} fill={EL_COL[el]} fillOpacity="0.6"/><text x={px} y={py} textAnchor="middle" dominantBaseline="middle" fontSize={14} fill="#fff" fontWeight="bold">{el}</text></g>
        })}
      </svg>
    </div>
  );
}

// 조후 2.0 게이지
function JohuGauge({ jd }) {
  const UI={"HOT_DRY":{i:"🔥",t:"맹렬한 조열",c:C.red},"HOT_WET":{i:"♨️",t:"끈적한 습열",c:"#fb923c"},"COLD_DRY":{i:"❄️",t:"매서운 한조",c:C.water},"COLD_WET":{i:"🌧️",t:"얼어붙은 한습",c:"#3b82f6"},"NEUTRAL":{i:"🌿",t:"온화한 중화",c:"#4ade80"}};
  const u = UI[jd.status];
  return(
    <div style={{display:"flex", gap:12}}>
      <div style={{flex:1, background:"rgba(255,255,255,0.05)", padding:16, borderRadius:16, textAlign:"center"}}>
        <div style={{fontSize:"2rem"}}>{u.i}</div>
        <div style={{color:u.c, fontWeight:"bold", marginTop:6, fontFamily:"serif"}}>{u.t}</div>
        <div style={{fontSize:"0.65rem", color:C.muted, marginTop:4}}>종합 밸런스: {jd.totalScore}점</div>
      </div>
      <div style={{flex:1, display:"flex", flexDirection:"column", gap:6}}>
        <div style={{flex:1, background:"rgba(255,255,255,0.05)", borderRadius:12, padding:10, display:"flex", alignItems:"center", justifyContent:"space-between"}}><span style={{fontSize:"0.7rem",color:C.muted}}>온도 (熱)</span><strong style={{color:jd.tempScore>60?C.red:C.water}}>{jd.tempScore}</strong></div>
        <div style={{flex:1, background:"rgba(255,255,255,0.05)", borderRadius:12, padding:10, display:"flex", alignItems:"center", justifyContent:"space-between"}}><span style={{fontSize:"0.7rem",color:C.muted}}>습도 (濕)</span><strong style={{color:jd.humScore>60?"#3b82f6":C.gold}}>{jd.humScore}</strong></div>
      </div>
    </div>
  );
}

// 대운 인생 그래프
function LifeGraph({ daeunList, pillars, dayStem, birthYear, selDaeun, setSelDaeun }){
  const grades = daeunList.map(d=>({...d, gradeObj: calcDaeunGrade(pillars, dayStem, d.stem, d.branch)}));
  const GV = {S:95, A:80, B:60, C:30};
  const W=340, H=140, PL=14, PR=14, PT=18, PB=32, gW=W-PL-PR, gH=H-PT-PB;
  const pts = grades.map((g,i)=>({ x: PL+i*(gW/(grades.length-1)), y: PT+gH*(1-(GV[g.gradeObj.grade]||50)/100) }));
  
  let dPath = `M ${pts[0].x} ${pts[0].y}`;
  pts.forEach(p => dPath += ` L ${p.x} ${p.y}`);
  
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      <path d={dPath} fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" />
      {grades.map((g,i)=>{
        const isSel = selDaeun?.startYear === g.startYear;
        return (
          <g key={i} style={{cursor:"pointer"}} onClick={()=>setSelDaeun(g)}>
            <circle cx={pts[i].x} cy={pts[i].y} r={isSel?7:4} fill={g.gradeObj.color} stroke="#000" strokeWidth="1.5" />
            <text x={pts[i].x} y={pts[i].y-12} textAnchor="middle" fontSize="8" fill={g.gradeObj.color} fontWeight="bold">{g.gradeObj.grade}</text>
            <text x={pts[i].x} y={H-14} textAnchor="middle" fontSize="8" fill={isSel?"#fff":C.muted}>{g.stem}{g.branch}</text>
            <text x={pts[i].x} y={H-4} textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.3)">{g.startAge}세</text>
          </g>
        );
      })}
    </svg>
  );
}

// 물상 카드
function PhysImageCard({dayStem}){
  const elColor=EL_COL[HS_EL[HS.indexOf(dayStem)]]||C.gold;
  return(
    <div style={{borderRadius:16,overflow:"hidden",background:"#1e1508",border:"1px solid rgba(210,175,100,0.22)", padding:20, textAlign:"center"}}>
      <div style={{fontSize:44,fontFamily:"serif",color:elColor,opacity:0.25, marginBottom:10}}>{dayStem}</div>
      <div style={{fontSize:"0.8rem", color:C.goldL}}>AI 물상 렌더링 시스템 (준비됨)</div>
    </div>
  );
}

// ============================================================
// 5. 메인 앱 (최종 렌더링)
// ============================================================
export default function App() {
  const [screen, setScreen] = useState("input");
  const [form, setForm] = useState({ year: "1990", month: "5", day: "15", hour: "12", minute: "0", gender: "male" });
  
  // ✅ 버그 1 픽스: useState -> useEffect 로 무한루프 방지
  const [lunarLoaded, setLunarLoaded] = useState(false);
  useEffect(() => { ensureLunar(() => setLunarLoaded(true)); }, []);

  const [saju, setSaju] = useState(null); 
  const [daeunList, setDaeunList] = useState([]); const [selDaeun, setSelDaeun] = useState(null);
  const [sewoonList, setSewoonList] = useState([]); const [selSewoon, setSelSewoon] = useState(null);
  
  const [tab, setTab] = useState("chart");
  const [simDate, setSimDate] = useState({ d: 15, h: 12 });
  const [bestMatches, setBestMatches] = useState([]);

  function handleCalc() {
    if (!lunarLoaded) return alert("만세력 로딩중입니다. 잠시만 기다려주세요.");
    if (!form.year || !form.month || !form.day) return alert("날짜를 입력해주세요.");
    
    const r = calcSaju(+form.year, +form.month, +form.day, +form.hour, +form.minute);
    if (!r.pillars.length) return alert("사주 변환에 실패했습니다.");
    
    const dl = calcDaeun(+form.year, +form.month, +form.day, form.gender, r.pillars[2]);
    const sl = generateSewoons(2024);

    setSaju(r); setDaeunList(dl); setSewoonList(sl);
    const cAge = new Date().getFullYear() - +form.year;
    
    // 초기 세팅 (현재 대운, 2026 세운)
    setSelDaeun(dl.find(d => d.startAge <= cAge && d.startAge + 10 > cAge) || dl[0]);
    setSelSewoon(sl.find(s => s.year === 2026) || sl[0]); 
    setSimDate({ d: Number(form.day), h: Number(form.hour) });
    
    setTab("chart"); setScreen("result");
  }

  function handleSim() {
    let best = [];
    for (let d=1; d<=31; d++) {
      const td=new Date(+form.year, +form.month-1, d); if(td.getMonth()+1 !== +form.month) continue;
      for (let h=1; h<24; h+=2) {
        const ss = calcSaju(+form.year, +form.month, d, h, 0);
        if(!ss.pillars.length) continue;
        const jd = calcJohuDetail(ss.pillars);
        const rootScore = ss.pillars.reduce((acc,p)=>acc+(EB_EL[EB.indexOf(p.branch)]===HS_EL[HS.indexOf(ss.dayStem)]?15:0),0);
        best.push({ d, h, saju:ss, score: jd.totalScore + rootScore });
      }
    }
    best.sort((a,b)=>b.score-a.score); setBestMatches(best.slice(0,3));
  }

  // ── 입력 화면 ──
  if (screen === "input") return (
    <div style={{minHeight:"100vh", background:C.bg, color:C.text, padding:"60px 20px"}}>
      <style>{globalStyle}</style>
      <div style={{textAlign:"center", marginBottom:40}}><h1 style={{color:C.gold, fontSize:"2rem", fontFamily:"serif"}}>사주 콕핏 2.0</h1><p style={{color:C.muted}}>전문가용 밀착형 6기둥 대시보드</p></div>
      <Card style={{maxWidth:400, margin:"0 auto", display:"flex", flexDirection:"column", gap:16}}>
        <div><label style={{fontSize:"0.8rem", color:C.muted, display:"block", marginBottom:8}}>생년월일</label><div style={{display:"flex", gap:8}}><input type="number" value={form.year} onChange={e=>setForm({...form, year:e.target.value})} style={{flex:2, padding:12, borderRadius:8, background:"#222", color:"#fff", border:"1px solid #444"}}/><input type="number" value={form.month} onChange={e=>setForm({...form, month:e.target.value})} style={{flex:1, padding:12, borderRadius:8, background:"#222", color:"#fff", border:"1px solid #444"}}/><input type="number" value={form.day} onChange={e=>setForm({...form, day:e.target.value})} style={{flex:1, padding:12, borderRadius:8, background:"#222", color:"#fff", border:"1px solid #444"}}/></div></div>
        <div><label style={{fontSize:"0.8rem", color:C.muted, display:"block", marginBottom:8}}>시간</label><input type="number" value={form.hour} onChange={e=>setForm({...form, hour:e.target.value})} style={{width:"100%", padding:12, borderRadius:8, background:"#222", color:"#fff", border:"1px solid #444"}}/></div>
        <button onClick={handleCalc} style={{padding:16, background:C.goldD, color:"#fff", border:"none", borderRadius:8, fontWeight:"bold", marginTop:10, cursor:"pointer", fontSize:"1rem"}}>분석 시작</button>
      </Card>
    </div>
  );

  // ── 결과 화면 ──
  const activeSaju = tab === "simulate" ? calcSaju(+form.year, +form.month, simDate.d, simDate.h, 0) : saju;
  const { strength, elementScores } = calcStrengthDetail(activeSaju.pillars, selDaeun?.stem, selDaeun?.branch);
  const jd = calcJohuDetail(activeSaju.pillars, selDaeun?.stem, selDaeun?.branch, selSewoon?.stem, selSewoon?.branch);

  return (
    <div style={{minHeight:"100vh", background:C.bg, color:C.text, padding:"20px 10px 100px"}}>
      <style>{globalStyle}</style>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, padding:"0 10px"}}>
        <button onClick={()=>setScreen("input")} style={{background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:"0.8rem"}}>← 다시입력</button>
        <span style={{ fontSize:"0.75rem", fontWeight:900, color:strength==="신강"?C.fire:C.water, background:"rgba(255,255,255,0.05)", padding:"4px 10px", borderRadius:8 }}>{strength}</span>
      </div>
      
      {/* 1. 고정 노출: 6기둥 콕핏 */}
      <Card style={{padding:"12px 6px", marginBottom:16}}>
        <SajuChart pillars={activeSaju.pillars} dayStem={activeSaju.dayStem} daeun={tab==="simulate"?null:selDaeun} sewoon={tab==="simulate"?null:selSewoon} hitBranch={selDaeun?.branch} />
      </Card>

      {/* 2. 상단 탭 */}
      <div style={{display:"flex", gap:8, marginBottom:16}}>
        <Btn active={tab==="chart"} onClick={()=>setTab("chart")}>⬠ 통변 콕핏</Btn>
        <Btn active={tab==="simulate"} onClick={()=>setTab("simulate")}>✨ 택일 시뮬</Btn>
        <Btn active={tab==="image"} onClick={()=>setTab("image")}>🎬 물상</Btn>
      </div>

      {/* 3. 탭 전환 영역 */}
      {tab === "chart" && (
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          {/* 타임라인 */}
          <div style={{display:"flex", gap:8}}>
            <Card style={{flex:1, padding:10}}><div style={{fontSize:"0.6rem", color:"#4ade80", marginBottom:6}}>대운 10년주기</div>
              <div style={{display:"flex", gap:6, overflowX:"auto", paddingBottom:4}}>{daeunList.map((d,i)=><button key={i} onClick={()=>setSelDaeun(d===selDaeun?null:d)} style={{padding:"8px 10px", borderRadius:8, background:selDaeun?.startYear===d.startYear?"rgba(74,222,128,0.2)":"#222", border:selDaeun?.startYear===d.startYear?"1px solid #4ade80":"none", color:"#fff", flexShrink:0, cursor:"pointer", fontFamily:"serif", fontSize:"1.1rem"}}>{d.stem}{d.branch}</button>)}</div>
            </Card>
            <Card style={{flex:1, padding:10}}><div style={{fontSize:"0.6rem", color:"#f06050", marginBottom:6}}>세운 1년주기</div>
              <div style={{display:"flex", gap:6, overflowX:"auto", paddingBottom:4}}>{sewoonList.map((s,i)=><button key={i} onClick={()=>setSelSewoon(s===selSewoon?null:s)} style={{padding:"8px 10px", borderRadius:8, background:selSewoon?.year===s.year?"rgba(240,96,80,0.2)":"#222", border:selSewoon?.year===s.year?"1px solid #f06050":"none", color:"#fff", flexShrink:0, cursor:"pointer", fontFamily:"serif", fontSize:"1.1rem", position:"relative"}}>{s.year===2026&&<div style={{position:"absolute",top:-2,right:-2,width:6,height:6,background:C.red,borderRadius:"50%"}}/>}{s.stem}{s.branch}</button>)}</div>
            </Card>
          </div>
          <Card><CardTitle>조후 2.0 밸런스</CardTitle><JohuGauge jd={jd}/></Card>
          <Card><CardTitle>실시간 오행 세력도 ({strength})</CardTitle><Pentagon pillars={saju.pillars} dayStem={saju.dayStem} daeun={selDaeun} sewoon={selSewoon} /></Card>
          <Card><CardTitle>대운 인생 그래프</CardTitle><LifeGraph daeunList={daeunList} pillars={saju.pillars} dayStem={saju.dayStem} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={setSelDaeun}/></Card>
        </div>
      )}

      {tab === "simulate" && (
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <Card>
            <CardTitle>AI 조후/뿌리 최적화 택일</CardTitle>
            <p style={{fontSize:"0.7rem", color:C.muted, textAlign:"center", marginBottom:16}}>년/월은 고정됩니다. 날짜와 시간을 굴려보세요.</p>
            <div style={{display:"flex", gap:8, marginBottom:16}}>
              <select value={simDate.d} onChange={e=>setSimDate({...simDate, d:Number(e.target.value)})} style={{flex:1, padding:12, borderRadius:8, background:"#222", color:"#fff", border:`1px solid ${C.gold}50`}}>{Array.from({length:31},(_,i)=><option key={i} value={i+1}>{i+1}일</option>)}</select>
              <select value={simDate.h} onChange={e=>setSimDate({...simDate, h:Number(e.target.value)})} style={{flex:1, padding:12, borderRadius:8, background:"#222", color:"#fff", border:`1px solid ${C.gold}50`}}>{Array.from({length:12},(_,i)=><option key={i} value={i*2+1}>{EB_KR[i]}시</option>)}</select>
            </div>
            <button onClick={handleSim} style={{width:"100%", padding:16, background:C.goldD, color:"#fff", border:"none", borderRadius:8, fontWeight:"bold", cursor:"pointer", letterSpacing:"0.1em"}}>🚀 AI 최적 조합 Top 3 찾기</button>
            
            {bestMatches.length>0 && (
              <div style={{marginTop:16, display:"flex", flexDirection:"column", gap:8}}>
                {bestMatches.map((m, i)=>(
                  <div key={i} onClick={()=>setSimDate({d:m.d, h:m.h})} style={{padding:12, background:"rgba(255,255,255,0.05)", borderRadius:8, border:`1px solid ${C.gold}50`, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <div><div style={{fontSize:"0.65rem", color:C.gold, marginBottom:4}}>🏆 추천 {i+1}순위 (점수:{m.score})</div><div style={{fontWeight:"bold"}}>{m.d}일 {EB_KR[Math.floor(m.h/2)]}시 ({m.saju.pillars[0].stem}{m.saju.pillars[0].branch})</div></div>
                    <div style={{fontSize:"0.7rem", color:"#4ade80", background:"rgba(74,222,128,0.1)", padding:"4px 8px", borderRadius:6}}>조후/통근 최적</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card><CardTitle>조작된 명식 세력도</CardTitle><Pentagon pillars={activeSaju.pillars} dayStem={activeSaju.dayStem}/></Card>
        </div>
      )}

      {tab === "image" && (
        <Card><CardTitle>나의 물상</CardTitle><PhysImageCard dayStem={activeSaju.dayStem} /></Card>
      )}

    </div>
  );
}
