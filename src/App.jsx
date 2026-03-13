import { useState } from "react";

// ============================================================
// 색상 테마
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
  input,select,button{font-family:'Noto Sans KR',sans-serif;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
  ::-webkit-scrollbar{height:3px;width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.3);border-radius:99px;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
`;

// lunar-javascript 동적 로드
let _lunarReady=false;
let _lunarCallbacks=[];
function ensureLunar(cb){
  if(_lunarReady){cb();return;}
  _lunarCallbacks.push(cb);
  if(document.querySelector('script[data-lunar]'))return;
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js';
  s.setAttribute('data-lunar','1');
  s.onload=()=>{_lunarReady=true;_lunarCallbacks.forEach(f=>f());_lunarCallbacks=[];};
  document.head.appendChild(s);
}

// lunar-javascript 기반 사주 계산 (메인)
function calcSajuByLunar(y,m,d,hour,minute,gender){
  try{
    const S=window.Solar;const EC=window.EightChar;if(!S||!EC)throw new Error("not loaded");
    // 서울 태양시: KST - 32분 (약 30분), 시지 경계는 태양시 기준
    const totalMin=hour*60+minute-30;
    const adjH=Math.floor(((totalMin%1440)+1440)%1440/60);
    const adjM=((totalMin%60)+60)%60;
    const solar=S.fromYmd(y,m,d);
    const lunar=solar.getLunar();
    const ec=lunar.getEightChar();
    // 시주는 직접 계산 (일간 기반)
    const dayHS=ec.getDay();const dayStemCh=dayHS[0];
    const dsi=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"].indexOf(dayStemCh);
    const hb=getHB(hour,minute);// 서울 보정 경계 사용
    const sm={0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8};
    const HS_A=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const EB_A=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    const hStem=HS_A[(sm[dsi]+hb)%10];const hBranch=EB_A[hb];
    const yearStr=ec.getYear();const monthStr=ec.getMonth();const dayStr=ec.getDay();
    const hourStr=hStem+hBranch;
    // pillars: [시,일,월,년] 순서
    function parsePillar(s,label){
      const st=s[0],br=s[1];
      const si=HS_A.indexOf(st),bi=EB_A.indexOf(br);
      return{stem:st,branch:br,stemIdx:si,branchIdx:bi,label};
    }
    const pillars=[parsePillar(hourStr,"시"),parsePillar(dayStr,"일"),parsePillar(monthStr,"월"),parsePillar(yearStr,"년")];
    const lunarObj=lunar;
    return{pillars,dayStem:dayStr[0],lunar:{year:lunarObj.getYear(),month:lunarObj.getMonth(),day:lunarObj.getDay(),isLeap:lunarObj.isLeap()}};
  }catch(e){
    // 폴백: 내부 계산
    return calcSajuFallback(y,m,d,hour,minute);
  }
}

// 폴백: 기존 내부 계산
function calcSajuFallback(y,m,d,hour,minute=0){
  const lunar=solarToLunar(y,m,d);
  const yp=getYP(y,m,d);const mp=getMP(y,m,d);const dp=getDP(y,m,d);
  const hp=getHP(dp.stemIdx,hour,minute);
  return{pillars:[hp,dp,mp,yp],lunar};
}

// ============================================================
// lunar-javascript (6tail) CDN 로드 및 사주 계산
// ============================================================
// CDN: https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js
// 브라우저 로드 후 window.Solar, window.Lunar 사용

// lunar-javascript 없을 때 폴백용 내부 계산
function getJD(y,m,d){const a=Math.floor((14-m)/12);const yy=y+4800-a;const mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
function jdToDate(jd){const L=jd+68569;const N=Math.floor(4*L/146097);const L2=L-Math.floor((146097*N+3)/4);const I=Math.floor(4000*(L2+1)/1461001);const L3=L2-Math.floor(1461*I/4)+31;const J=Math.floor(80*L3/2447);const day=L3-Math.floor(2447*J/80);const L4=Math.floor(J/11);const month=J+2-12*L4;const year=100*(N-49)+I+L4;return{year,month,day};}
function sunLon(jd){const T=(jd-2451545)/36525;const L0=280.46646+36000.76983*T+0.0003032*T*T;const M=((357.52911+35999.05029*T-0.0001537*T*T)*Math.PI)/180;const CC=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);return((L0+CC)%360+360)%360;}
function findTermJD(year,lon){const base=getJD(year,1,1);const approx=base+((lon-sunLon(base)+360)%360)/360*365.25;let j1=approx-15,j2=approx+15;for(let i=0;i<60;i++){const mid=(j1+j2)/2;let d=lon-sunLon(mid);if(d>180)d-=360;if(d<-180)d+=360;if(Math.abs(d)<0.00005)break;if(d>0)j1=mid;else j2=mid;}return(j1+j2)/2;}
const tCache={};
function getTerms(year){if(tCache[year])return tCache[year];const T=[{n:"입춘",l:315},{n:"경칩",l:345},{n:"청명",l:15},{n:"입하",l:45},{n:"망종",l:75},{n:"소서",l:105},{n:"입추",l:135},{n:"백로",l:165},{n:"한로",l:195},{n:"입동",l:225},{n:"대설",l:255},{n:"소한",l:285}];const r={};for(const t of T){const jd=findTermJD(year,t.l);const d=jdToDate(jd+9/24);r[t.n]={month:d.month,day:d.day,jd};}tCache[year]=r;return r;}

// ============================================================
// 음력 변환 (천문 삭망 + 설날 테이블 + KASI 윤달 기준)
// ============================================================
function calcNewMoonKST(k){
  const T=k/1236.85;
  let JDE=2451550.09766+29.530588861*k+0.00015437*T*T-0.000000150*T*T*T+0.00000000073*T*T*T*T;
  const M=(2.5534+29.10535670*k-0.0000014*T*T-0.00000011*T*T*T)*Math.PI/180;
  const Mp=(201.5643+385.81693528*k+0.0107582*T*T+0.00001238*T*T*T-0.000000058*T*T*T*T)*Math.PI/180;
  const F=(160.7108+390.67050284*k-0.0016118*T*T-0.00000227*T*T*T+0.000000011*T*T*T*T)*Math.PI/180;
  const Om=(124.7746-1.56375588*k+0.0020672*T*T+0.00000215*T*T*T)*Math.PI/180;
  JDE+=-0.40720*Math.sin(Mp)+0.17241*Math.sin(M)+0.01608*Math.sin(2*Mp)+0.01039*Math.sin(2*F)+0.00739*Math.sin(Mp-M)-0.00514*Math.sin(Mp+M)+0.00208*Math.sin(2*M)-0.00111*Math.sin(Mp-2*F)-0.00057*Math.sin(Mp+2*F)+0.00056*Math.sin(2*Mp+M)-0.00042*Math.sin(3*Mp)+0.00042*Math.sin(M+2*F)+0.00038*Math.sin(M-2*F)-0.00024*Math.sin(2*Mp-M)-0.00017*Math.sin(Om)-0.00007*Math.sin(Mp+2*M);
  return Math.floor(JDE+9/24+0.5);
}

// 설날 테이블 (각 음력년 1월 1일의 양력 날짜) - KASI/네이버 검증
const NY={1900:[1,31],1901:[2,19],1902:[2,8],1903:[1,29],1904:[2,16],1905:[2,4],1906:[1,25],1907:[2,13],1908:[2,2],1909:[1,22],1910:[2,10],1911:[1,30],1912:[2,18],1913:[2,6],1914:[1,26],1915:[2,14],1916:[2,3],1917:[1,23],1918:[2,11],1919:[2,1],1920:[2,20],1921:[2,8],1922:[1,28],1923:[2,16],1924:[2,5],1925:[1,24],1926:[2,13],1927:[2,2],1928:[1,23],1929:[2,10],1930:[1,30],1931:[2,17],1932:[2,6],1933:[1,26],1934:[2,14],1935:[2,4],1936:[1,24],1937:[2,11],1938:[1,31],1939:[2,19],1940:[2,8],1941:[1,27],1942:[2,15],1943:[2,5],1944:[1,25],1945:[2,13],1946:[2,2],1947:[1,22],1948:[2,10],1949:[1,29],1950:[2,17],1951:[2,6],1952:[1,27],1953:[2,14],1954:[2,3],1955:[1,24],1956:[2,12],1957:[1,31],1958:[2,18],1959:[2,8],1960:[1,28],1961:[2,15],1962:[2,5],1963:[1,25],1964:[2,13],1965:[2,2],1966:[1,21],1967:[2,9],1968:[1,30],1969:[2,17],1970:[2,6],1971:[1,27],1972:[2,15],1973:[2,3],1974:[1,23],1975:[2,11],1976:[1,31],1977:[2,18],1978:[2,7],1979:[1,28],1980:[2,16],1981:[2,5],1982:[1,25],1983:[2,13],1984:[2,2],1985:[2,20],1986:[2,9],1987:[1,29],1988:[2,17],1989:[2,6],1990:[1,27],1991:[2,15],1992:[2,4],1993:[1,23],1994:[2,10],1995:[1,31],1996:[2,19],1997:[2,7],1998:[1,28],1999:[2,16],2000:[2,5],2001:[1,24],2002:[2,12],2003:[2,1],2004:[1,22],2005:[2,9],2006:[1,29],2007:[2,18],2008:[2,7],2009:[1,26],2010:[2,14],2011:[2,3],2012:[1,23],2013:[2,10],2014:[1,31],2015:[2,19],2016:[2,8],2017:[1,28],2018:[2,16],2019:[2,5],2020:[1,25],2021:[2,12],2022:[2,1],2023:[1,22],2024:[2,10],2025:[1,29],2026:[2,17],2027:[2,6],2028:[1,26],2029:[2,13],2030:[2,3],2031:[1,23]};

// KASI 윤달 테이블 (0=없음)
const LEAP_MONTH={1900:8,1902:5,1905:4,1907:9,1910:6,1913:5,1916:4,1919:2,1921:7,1924:5,1927:6,1930:5,1933:4,1936:3,1938:7,1941:6,1944:4,1947:2,1949:7,1952:5,1955:3,1957:8,1960:6,1963:4,1966:3,1968:7,1971:5,1972:4,1975:8,1977:8,1980:5,1982:4,1984:10,1987:6,1989:5,1990:5,1993:3,1995:8,1998:5,2001:4,2004:2,2006:7,2009:5,2012:3,2014:9,2017:6,2020:4,2023:2,2025:6,2028:5,2031:3};

const lyCache={};
function buildLunarYear(y){
  if(lyCache[y])return lyCache[y];
  const ny=NY[y],nyN=NY[y+1];
  if(!ny||!nyN)return null;
  const startJD=getJD(y,ny[0],ny[1]);
  const endJD=getJD(y+1,nyN[0],nyN[1]);
  const k0=Math.round((y+1/24-2000)*12.3685);
  let bestK=k0,bestDiff=999;
  for(let dk=-3;dk<=3;dk++){const jd=calcNewMoonKST(k0+dk);const diff=Math.abs(jd-startJD);if(diff<bestDiff){bestDiff=diff;bestK=k0+dk;}}
  const months=[startJD];
  let k=bestK+1;
  while(true){const jd=calcNewMoonKST(k);if(jd>=endJD)break;if(jd>startJD)months.push(jd);k++;if(k>bestK+20)break;}
  const leapM=LEAP_MONTH[y]||0;
  const result={startJD,endJD,months,leapM};
  lyCache[y]=result;
  return result;
}

function solarToLunar(sy,sm,sd){
  const targetJD=getJD(sy,sm,sd);
  for(let y=1900;y<=2030;y++){
    const ny=NY[y],nyN=NY[y+1];
    if(!ny||!nyN)break;
    const startJD=getJD(y,ny[0],ny[1]);
    const endJD=getJD(y+1,nyN[0],nyN[1]);
    if(targetJD<startJD||targetJD>=endJD)continue;
    const yr=buildLunarYear(y);if(!yr)continue;
    const{months,leapM}=yr;const total=months.length;
    let mi=-1;
    for(let i=0;i<total;i++){const ns=i+1<total?months[i+1]:endJD;if(targetJD>=months[i]&&targetJD<ns){mi=i;break;}}
    if(mi<0)continue;
    const day=targetJD-months[mi]+1;
    let lm,isLeap=false;
    if(total===13&&leapM>0){if(mi<leapM)lm=mi+1;else if(mi===leapM){lm=leapM;isLeap=true;}else lm=mi;}else lm=mi+1;
    return{year:y,month:lm,day,isLeap};
  }
  return{year:1900,month:1,day:1,isLeap:false};
}

// ============================================================
// 사주 상수
// ============================================================
const HS=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const EB=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const HS_EL=["木","木","火","火","土","土","金","金","水","水"];
const EB_EL=["水","土","木","木","土","火","火","土","金","金","土","水"];
const EB_KR=["자","축","인","묘","진","사","오","미","신","유","술","해"];
const ZODIAC=["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
const ZODIAC_E=["🐭","🐮","🐯","🐰","🐉","🐍","🐴","🐑","🐵","🐓","🐶","🐗"];
const KANJI_YANG={甲:true,丙:true,戊:true,庚:true,壬:true,寅:true,辰:true,巳:true,午:true,申:true,戌:true};
const SS_MAP={甲甲:"비견",甲乙:"겁재",甲丙:"식신",甲丁:"상관",甲戊:"편재",甲己:"정재",甲庚:"편관",甲辛:"정관",甲壬:"편인",甲癸:"정인",乙乙:"비견",乙甲:"겁재",乙丁:"식신",乙丙:"상관",乙己:"편재",乙戊:"정재",乙辛:"편관",乙庚:"정관",乙癸:"편인",乙壬:"정인",丙丙:"비견",丙丁:"겁재",丙戊:"식신",丙己:"상관",丙庚:"편재",丙辛:"정재",丙壬:"편관",丙癸:"정관",丙甲:"편인",丙乙:"정인",丁丁:"비견",丁丙:"겁재",丁己:"식신",丁戊:"상관",丁辛:"편재",丁庚:"정재",丁癸:"편관",丁壬:"정관",丁乙:"편인",丁甲:"정인",戊戊:"비견",戊己:"겁재",戊庚:"식신",戊辛:"상관",戊壬:"편재",戊癸:"정재",戊甲:"편관",戊乙:"정관",戊丙:"편인",戊丁:"정인",己己:"비견",己戊:"겁재",己辛:"식신",己庚:"상관",己癸:"편재",己壬:"정재",己乙:"편관",己甲:"정관",己丁:"편인",己丙:"정인",庚庚:"비견",庚辛:"겁재",庚壬:"식신",庚癸:"상관",庚甲:"편재",庚乙:"정재",庚丙:"편관",庚丁:"정관",庚戊:"편인",庚己:"정인",辛辛:"비견",辛庚:"겁재",辛癸:"식신",辛壬:"상관",辛乙:"편재",辛甲:"정재",辛丁:"편관",辛丙:"정관",辛己:"편인",辛戊:"정인",壬壬:"비견",壬癸:"겁재",壬甲:"식신",壬乙:"상관",壬丙:"편재",壬丁:"정재",壬戊:"편관",壬己:"정관",壬庚:"편인",壬辛:"정인",癸癸:"비견",癸壬:"겁재",癸乙:"식신",癸甲:"상관",癸丁:"편재",癸丙:"정재",癸己:"편관",癸戊:"정관",癸辛:"편인",癸庚:"정인"};
const EBH={子:{yo:["壬",7],jung:null,bon:["癸",23]},丑:{yo:["癸",9],jung:["辛",3],bon:["己",18]},寅:{yo:["戊",7],jung:["丙",7],bon:["甲",16]},卯:{yo:["甲",10],jung:null,bon:["乙",20]},辰:{yo:["乙",9],jung:["癸",3],bon:["戊",18]},巳:{yo:["戊",7],jung:["庚",7],bon:["丙",16]},午:{yo:["丙",10],jung:["己",9],bon:["丁",11]},未:{yo:["丁",9],jung:["乙",3],bon:["己",18]},申:{yo:["戊",7],jung:["壬",7],bon:["庚",16]},酉:{yo:["庚",10],jung:null,bon:["辛",20]},戌:{yo:["辛",9],jung:["丁",3],bon:["戊",18]},亥:{yo:["戊",7],jung:["甲",5],bon:["壬",18]}};
function getSS(ds,s){return SS_MAP[ds+s]||"-";}

// 신강/신약 계산
function calcStrength(pillars){
  const ds=pillars[1].stem; // 일간
  const dayEl=HS_EL[pillars[1].stemIdx];
  // 일간을 생하는 오행: 木→火, 火→土, 土→金, 金→水, 水→木
  const GEN={木:"水",火:"木",土:"火",金:"土",水:"金"};
  const SAME={木:"木",火:"火",土:"土",金:"金",水:"水"};
  const genEl=GEN[dayEl];
  let score=0;
  const weights=[0.5,0,1,1.5,0.5]; // 시,일,월(가중치최고),년
  pillars.forEach((p,i)=>{
    if(i===1)return; // 일간 자신 제외
    const w=weights[i];
    const sEl=HS_EL[p.stemIdx];const bEl=EB_EL[p.branchIdx];
    if(sEl===dayEl||sEl===genEl)score+=w*1.5;
    if(bEl===dayEl||bEl===genEl)score+=w;
    // 지장간 본기도 반영
    const bon=EBH[p.branch]?.bon?.[0];
    if(bon){const bonEl=HS_EL[HS.indexOf(bon)];if(bonEl===dayEl||bonEl===genEl)score+=w*0.3;}
  });
  return score>=4?"신강":score>=2.5?"중화":"신약";
}

// ============================================================
// 사주 계산
// ============================================================
function getYP(y,m,d){const cb=findTermJD(y,315)+9/24;const jd=getJD(y,m,d)+0.5;const sy=jd<cb?y-1:y;const s=((sy-4)%10+10)%10;const b=((sy-4)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getDP(y,m,d){const jd=getJD(y,m,d);const s=((jd+9)%10+10)%10;const b=((jd+1)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getMP(y,m,d){
  const dJD=getJD(y,m,d)+0.5;// 정오 기준
  const MT=[{l:315,b:2},{l:345,b:3},{l:15,b:4},{l:45,b:5},{l:75,b:6},{l:105,b:7},{l:135,b:8},{l:165,b:9},{l:195,b:10},{l:225,b:11},{l:255,b:0},{l:285,b:1}];
  let branchIdx=1,bestJD=-Infinity;
  for(let yr=y-1;yr<=y+1;yr++){for(const t of MT){const tj=findTermJD(yr,t.l)+9/24;if(tj<=dJD&&tj>bestJD){bestJD=tj;branchIdx=t.b;}}}
  const cb=findTermJD(y,315)+9/24;const sajuY=dJD<cb?y-1:y;
  const ySI=((sajuY-4)%10+10)%10;
  const yinStem=[2,4,6,8,0][ySI%5];
  const stemIdx=(yinStem+((branchIdx-2+12)%12))%10;
  return{stem:HS[stemIdx],branch:EB[branchIdx],stemIdx,branchIdx};
}

// 시지 경계 (서울 태양시 기준, KST+30분 보정):
// 子:0~119,丑:120~239,寅:240~359,卯:360~479,辰:480~599,巳:600~719,午:720~839,未:840~959,申:960~1079,酉:1080~1199,戌:1200~1319,亥:1320~1439
const HB_BOUNDS=[120,240,360,480,600,720,840,960,1080,1200,1320,1440];
function getHB(hour,minute=0){const t=hour*60+minute;for(let i=0;i<12;i++)if(t<HB_BOUNDS[i])return i;return 0;}
function getHP(ds,hour,minute=0){
  const bi=getHB(hour,minute);
  // 일간별 자시(子時) 천간 시작: 甲己→甲子, 乙庚→丙子, 丙辛→戊子, 丁壬→庚子, 戊癸→壬子
  const startMap={0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8};
  const s=(startMap[ds]+bi)%10;
  return{stem:HS[s],branch:EB[bi],stemIdx:s,branchIdx:bi};
}
function calcSaju(y,m,d,hour,minute=0){
  if(typeof window!=="undefined"&&window.Solar&&window.EightChar){
    try{
      const res=calcSajuByLunar(y,m,d,hour,minute);
      // label 추가 (pillars는 [시,일,월,년])
      const labels=["시","일","월","년"];
      res.pillars=res.pillars.map((p,i)=>({...p,label:labels[i]}));
      res.dayStem=res.pillars[1].stem;
      res.solar={year:y,month:m,day:d,hour,minute};
      return res;
    }catch(e){}
  }
  const lunar=solarToLunar(y,m,d);
  const yp=getYP(y,m,d);const mp=getMP(y,m,d);const dp=getDP(y,m,d);
  const hp=getHP(dp.stemIdx,hour,minute);
  return{pillars:[{label:"시",...hp},{label:"일",...dp},{label:"월",...mp},{label:"년",...yp}],dayStem:dp.stem,solar:{year:y,month:m,day:d,hour,minute},lunar};
}
function calcDaeun(by,bm,bd,gender,mp){
  const yp=getYP(by,bm,bd);const isYang=yp.stemIdx%2===0;const fwd=(isYang&&gender==="male")||(!isYang&&gender==="female");
  const T=getTerms(by);const FT=["경칩","청명","입하","망종","소서","입추","백로","한로","입동","대설","소한","입춘"];const BT=["입춘","소한","대설","입동","한로","백로","입추","소서","망종","입하","청명","경칩"];
  const tl=fwd?FT:BT;const bjd=getJD(by,bm,bd);let near=365;
  for(const tn of tl){const td=T[tn];if(!td)continue;const df=fwd?td.jd-bjd:bjd-td.jd;if(df>0&&df<near)near=df;}
  const sa=Math.round(near/3);
  return Array.from({length:8},(_,i)=>{const off=fwd?i+1:-(i+1);const si=((mp.stemIdx+off)%10+10)%10;const bi=((mp.branchIdx+off)%12+12)%12;const age=sa+i*10;return{stem:HS[si],branch:EB[bi],stemIdx:si,branchIdx:bi,startAge:age,startYear:by+age};});
}

// ============================================================
// 조후 점수 2.0 (22간지 독립 온습도 매트릭스 + 벡터 거리 기반)
// ============================================================

// 기존 궁합용 JOHU_NEED는 그대로 유지합니다. (삭제 금지)
const JOHU_NEED={ 亥:{need:["火","木"],avoid:["水","金"]},子:{need:["火","木"],avoid:["水","金"]},丑:{need:["火","木"],avoid:["水","金"]}, 寅:{need:["水","火"],avoid:[]},卯:{need:["水","火"],avoid:[]},辰:{need:["木","水"],avoid:[]}, 巳:{need:["水","金"],avoid:["火","木"]},午:{need:["水","金"],avoid:["火","木"]},未:{need:["水","金"],avoid:["火","木"]}, 申:{need:["火","木"],avoid:["金","水"]},酉:{need:["火","木"],avoid:["金","水"]},戌:{need:["木","水"],avoid:[]} };

// 1. 22간지 고유 온습도(T/H) 매트릭스
const GANJI_TH = {
  "甲":{T:1, H:0},  "乙":{T:1, H:2},  "丙":{T:5, H:-2}, "丁":{T:4, H:-4}, "戊":{T:2, H:-3}, "己":{T:1, H:2}, "庚":{T:-2, H:-2}, "辛":{T:-3, H:-1}, "壬":{T:-4, H:4}, "癸":{T:-3, H:5},
  "子":{T:-5, H:3}, "丑":{T:-4, H:1}, "寅":{T:1, H:1},  "卯":{T:2, H:2},  "辰":{T:2, H:3},  "巳":{T:4, H:-1}, "午":{T:5, H:-2}, "未":{T:4, H:-4}, "申":{T:-1, H:-2}, "酉":{T:-2, H:-1}, "戌":{T:-2, H:-4}, "亥":{T:-3, H:2}
};

function calcJohuDetail(pillars, daeunStem = null, daeunBranch = null) {
  let totalT = 0, totalH = 0;

  // 2. 자리별 가중치 (시, 일, 월, 년) - 월지는 5.0으로 절대 권력
  const bWeights = [1.0, 2.0, 5.0, 1.0];
  const sWeights = [0.5, 0.5, 0.5, 0.5];

  pillars.forEach((p, i) => {
    const sTH = GANJI_TH[p.stem] || {T:0, H:0};
    const bTH = GANJI_TH[p.branch] || {T:0, H:0};
    totalT += (sTH.T * sWeights[i]) + (bTH.T * bWeights[i]);
    totalH += (sTH.H * sWeights[i]) + (bTH.H * bWeights[i]);
  });

  // 대운 개입 (제2의 월지급 가중치 3.0)
  if (daeunStem && daeunBranch) {
    const dsTH = GANJI_TH[daeunStem] || {T:0, H:0};
    const dbTH = GANJI_TH[daeunBranch] || {T:0, H:0};
    totalT += (dsTH.T * 0.5) + (dbTH.T * 3.0);
    totalH += (dsTH.H * 0.5) + (dbTH.H * 3.0);
  }

  // 3. 합국(合局)에 의한 기후 대격변 변수
  const allBranches = pillars.map(p => p.branch);
  if (daeunBranch) allBranches.push(daeunBranch);
  
  if (["寅","午","戌"].every(c => allBranches.includes(c)) || ["巳","午","未"].every(c => allBranches.includes(c))) { totalT += 15; totalH -= 10; } // 용광로/사막
  if (["申","子","辰"].every(c => allBranches.includes(c)) || ["亥","子","丑"].every(c => allBranches.includes(c))) { totalT -= 15; totalH += 10; } // 빙하/해일
  if (["亥","卯","未"].every(c => allBranches.includes(c)) || ["寅","卯","辰"].every(c => allBranches.includes(c))) { totalT += 5;  totalH += 8;  } // 대밀림
  if (["巳","酉","丑"].every(c => allBranches.includes(c)) || ["申","酉","戌"].every(c => allBranches.includes(c))) { totalT -= 8;  totalH -= 8;  } // 극동토

  // 4. 절대 영점(0,0) 기반 벡터 거리 계산 (수화기제를 향한 거리)
  const distance = Math.sqrt(Math.pow(totalT, 2) + Math.pow(totalH, 2));
  let score = 100 - (distance * 2.2); // 2.2는 페널티 상수
  score = Math.max(0, Math.min(100, Math.round(score)));

  // 5. 기후 상태 매핑 (표정 연동 및 UI용)
  let status = "NEUTRAL";
  if (totalT > 3 && totalH < -2) status = "HOT_DRY";
  else if (totalT > 3 && totalH >= -2) status = "HOT_WET";
  else if (totalT < -3 && totalH < -2) status = "COLD_DRY";
  else if (totalT < -3 && totalH >= -2) status = "COLD_WET";

  // 게이지(0~100) 표출용 스케일링
  const tempScore = Math.max(0, Math.min(100, Math.round(50 + (totalT * 2.5))));
  const humScore = Math.max(0, Math.min(100, Math.round(50 + (totalH * 2.5))));

  // 기존 컴포넌트 호환을 위해 need, avoid 빈 배열 유지
  return { tempScore, humScore, totalScore: score, status, need: [], avoid: [] };
}

  // 기존 UI(JohuGauge) 호환을 위한 상대 수치 변환 (0~100 스케일)
  const tempScore = Math.max(0, Math.min(100, Math.round(50 + (totalT * 2.5))));
  const humScore = Math.max(0, Math.min(100, Math.round(50 + (totalH * 2.5))));

  return { tempScore, humScore, totalScore: score, status, need: [], avoid: [] };
}

function johuLabel(s){
  if(s>=80)return{label:"최적",color:"#4ade80"};if(s>=65)return{label:"양호",color:"#86efac"};
  if(s>=50)return{label:"보통",color:C.gold};if(s>=35)return{label:"불균형",color:"#fb923c"};return{label:"편중",color:C.red};
}

function calcElementCount(pillars){
  const cnt={水:0,木:0,火:0,土:0,金:0};
  pillars.forEach(p=>{cnt[HS_EL[p.stemIdx]]=(cnt[HS_EL[p.stemIdx]]||0)+1.5;cnt[EB_EL[p.branchIdx]]=(cnt[EB_EL[p.branchIdx]]||0)+1;});
  return cnt;
}
// ============================================================
// 동적 물상 헤더 텍스트 (일간 × 월지 120가지 조합)
// ============================================================
const BRANCH_DESC={
  子:"만물이 잠든 고요한 한겨울 밤",丑:"차고 척박한 한겨울의 언 땅",
  寅:"아직 어둠이 걷히지 않은 이른 봄새벽",卯:"꽃잎이 흩날리는 화사한 봄날",
  辰:"봄비가 촉촉이 내리는 무르익은 봄날",巳:"뜨거운 열기가 피어오르는 초여름",
  午:"태양이 작열하는 한여름 대낮",未:"모든 것이 무르익은 늦여름의 황혼",
  申:"청명한 하늘 아래 서늘한 초가을",酉:"결실의 향기 가득한 풍요로운 가을",
  戌:"낙엽이 지는 쓸쓸한 늦가을",亥:"찬 겨울비가 내리는 초겨울의 밤"
};
const STEM_DESC={
  甲:{action:"에 우뚝 솟은 큰 나무",prep:"에"},
  乙:{action:"을 타고 오르는 부드러운 덩굴",prep:"을"},
  丙:{action:"을 환하게 비추는 뜨거운 태양",prep:"을"},
  丁:{action:"을 밝히는 따뜻한 촛불 한 자루",prep:"을"},
  戊:{action:"을 묵묵히 떠받치는 큰 산",prep:"을"},
  己:{action:"을 품고 씨앗을 키우는 기름진 대지",prep:"을"},
  庚:{action:"에 날카롭게 빛나는 서늘한 칼날",prep:"에"},
  辛:{action:"에서 차갑게 반짝이는 아름다운 보석",prep:"에서"},
  壬:{action:"을 힘차게 흘러가는 깊은 강물",prep:"을"},
  癸:{action:"을 조용히 적시며 내리는 맑은 비",prep:"을"}
};
// 출력: [월지 환경] + [일간 묘사] + "의 모습입니다."
function buildMulsangHeader(dayStem, monthBranch){
  const env=BRANCH_DESC[monthBranch]||"";
  const s=STEM_DESC[dayStem];
  if(!env||!s)return null;
  return env+s.action+"의 모습입니다.";
}
// 대운 융합 묘사
const DAEUN_DESC={
  子:"만물이 잠드는 냉기가 밀려오며",丑:"땅이 꽁꽁 어는 한기가 깔리며",
  寅:"새벽 찬기를 뚫고 새싹이 솟아나며",卯:"꽃봉오리가 터지는 봄 기운이 퍼지며",
  辰:"봄비가 대지를 적시며",巳:"무더운 열기가 서서히 차오르며",
  午:"뜨거운 여름 기운이 불같이 타오르며",未:"황금빛 저녁 노을이 깔리며",
  申:"가을 서늘함이 스며들며",酉:"결실의 기운이 무르익으며",
  戌:"낙엽이 스러지는 쓸쓸함이 깃들며",亥:"겨울 기운이 내려앉으며"
};
function buildDaeunHeader(dayStem, daeunBranch){
  const desc=DAEUN_DESC[daeunBranch]||"";
  const s=STEM_DESC[dayStem];
  if(!desc||!s)return null;
  return desc+" "+dayStem+"의 기운이 새로운 전환점을 맞이합니다.";
}

// ============================================================
// 대운 5단계 등급 판별 (Waterfall Evaluation)
// ============================================================
// 삼형살 그룹
const SAMHYUNG3=[["寅","巳","申"],["丑","戌","未"]];
const SAMHYUNG2=[["子","卯"]];

function calcDaeunGrade(pillars, dayStem, daeunBranch){
  const strength=calcStrength(pillars);
  const monthBranch=pillars[2].branch;
  const johuNeed=JOHU_NEED[monthBranch]?.need||[];
  const johuAvoid=JOHU_NEED[monthBranch]?.avoid||[];
  
  // 원국 지지 목록
  const origBranches=pillars.map(p=>p.branch);
  
  // Phase 1: 절대 흉운 필터링 (신약 + 삼형살 완성)
  if(strength==="신약"){
    const withDaeun=[...origBranches,daeunBranch];
    const isFullSamhyung3=SAMHYUNG3.some(g=>g.every(b=>withDaeun.includes(b)));
    if(isFullSamhyung3){
      return{grade:"C",color:"#f06050",label:"주의 필요",desc:"신약한 일간에 삼형살 완성 — 체력·관재 위험 극대화"};
    }
  }
  
  // 용신 계산: 신약이면 일간 생조 오행, 신강이면 식상·재·관
  const dayEl=HS_EL[HS.indexOf(dayStem)];
  const GEN={木:"水",火:"木",土:"火",金:"土",水:"金"};// A생B: A는 B의 인성
  const CTRL={木:"金",火:"水",土:"木",金:"火",水:"土"};// A克B
  let yongsinEls=[];
  if(strength==="신약"){
    // 인성(생하는 오행)과 비겁(같은 오행)이 용신
    yongsinEls=[GEN[dayEl],dayEl];
  } else if(strength==="신강"){
    // 식상(내가 생하는)·재(내가 극하는)·관(나를 극하는)
    const myGen=Object.keys(GEN).find(k=>GEN[k]===dayEl); // 내가 생하는
    const myCtrl=Object.keys(CTRL).find(k=>CTRL[k]===dayEl); // 내가 극하는
    const myGov=CTRL[dayEl]; // 나를 극하는
    yongsinEls=[myGen,myCtrl,myGov].filter(Boolean);
  } else {
    // 중화: 조후 기준
    yongsinEls=[...johuNeed];
  }
  
  // 대운 오행
  const daeunEl=EB_EL[EB.indexOf(daeunBranch)];
  const isYongsin=yongsinEls.includes(daeunEl);
  // 조후 해결: 대운이 johuNeed에 있고 avoid에 없음
  const isJohuOk=johuNeed.includes(daeunEl)&&!johuAvoid.includes(daeunEl);
  
  // Phase 2: 순수 길운
  if(isYongsin&&isJohuOk){
    return{grade:"S",color:"#f5c842",label:"최상 발복기",desc:"용신 충족 + 조후 해결 — 운명적 전성기"};
  }
  if(isYongsin){
    return{grade:"A+",color:"#4ade80",label:"주도적 성취기",desc:"용신 충족 — 목표를 향한 강력한 추진력"};
  }
  if(isJohuOk){
    return{grade:"A",color:"#86efac",label:"환경적 안정기",desc:"조후 해결 — 외부 환경이 편안하게 받쳐주는 시기"};
  }
  
  // Phase 3: 방어력 판별
  // 기구신 도래 확인: 용신과 반대
  const elCounts=calcElementCount(pillars);
  const elVals=Object.values(elCounts);
  const maxEl=Math.max(...elVals);const minEl=Math.min(...elVals);
  const isBalanced=(maxEl-minEl)<2.5; // 편차 2.5 이하면 주류무체(균형)
  
  if(isBalanced){
    return{grade:"B",color:C.gold,label:"원국 방어기",desc:"기구신 도래이나 원국 균형으로 타격 흡수 가능"};
  }
  return{grade:"C",color:"#fb923c",label:"불리한 타격기",desc:"기구신 도래 + 원국 편중 — 주의 필요한 시련기"};
}


// ============================================================
// 물상 프롬프트
// ============================================================
const STEM_SCENE={甲:"a towering ancient pine forest, massive primordial trunks rising into mist",乙:"a delicate wildflower meadow with cascading vines, tender yet persistent",丙:"a blazing sun at zenith, overwhelming radiance scorching the horizon",丁:"a lone lantern flame burning against vast cold darkness, intimate warmth",戊:"colossal mountain peaks, immovable and eternal, wrapped in storm clouds",己:"deep fertile terraced earth, patient and nurturing, heavy with possibility",庚:"sheer steel-grey cliffs with razor edges, harsh unyielding stone",辛:"glittering crystal formations refracting cold prismatic light in dark caverns",壬:"a boundless surging ocean, deep relentless waves eroding ancient shores",癸:"quiet rain and mist-shrouded mountain pools, hidden depths and mystery"};
const BRANCH_SCENE={子:"frozen tundra under a pale winter moon, crystalline ice silence",丑:"frost-locked earth in deepest winter, heavy grey sky pressing down",寅:"misty spring forest at dawn, first green buds piercing dark cold soil",卯:"rolling hills of cherry blossoms, petals drifting on warm soft air",辰:"rain-soaked fields in early spring, muddy earth alive with emergence",巳:"parched summer earth shimmering in relentless heat haze",午:"blazing midsummer noon, cracked earth, bleached sky, merciless heat",未:"golden late-summer dusk, tall grass swaying in heavy amber light",申:"vivid mountain autumn slopes, crisp cold air, leaves turning crimson",酉:"endless harvest fields under a clear high-autumn sky, golden stillness",戌:"bare branches in melancholy late-autumn dusk, dry leaves spiraling",亥:"cold dark winter rain, frost forming on bare branches, moonlit puddles"};
function buildNarrativeTransition(mb,db){const cold=["亥","子","丑"],spr=["寅","卯","辰"],sum=["巳","午","未"],aut=["申","酉","戌"];const g=b=>cold.includes(b)?"cold":spr.includes(b)?"spring":sum.includes(b)?"summer":"autumn";const from=g(mb),to=g(db);const T={"cold->summer":"The frozen world cracks and melts violently — blazing heat arrives, steam erupts from thawing ice, rivers break free, life explodes from the thaw in dramatic upheaval","cold->spring":"Gentle warmth softly dissolves the frozen landscape — ice edges weep, green shoots pierce through frost, the world cautiously awakens","cold->autumn":"Cold deepens into profound silence — frost hardens, bare branches creak under ice weight, stillness becomes absolute crystalline winter","summer->cold":"Sudden cold crashes over scorched earth — dark storm clouds roll in, cold rain steams on burning ground, a dramatic clash","summer->spring":"Brutal heat softens — clouds gather bringing rain, scorched earth drinks deeply, green tendrils reclaim parched ground","summer->autumn":"Peak summer heat breaks into harvest gold — amber light deepens, shadows lengthen, abundance ripens before the cold","spring->summer":"Spring's tender growth erupts into full summer glory — flowers burst into fruit, heat builds, life reaches its apex","spring->cold":"Frost interrupts spring's awakening — new buds killed by returning cold, green shoots retreat, unseasonal chill smothers fragile life","autumn->cold":"Autumn descends into deep winter — last leaves fall, frost claims bare earth, the world retreats into crystalline stillness","autumn->summer":"Unexpected warmth floods autumn — lingering summer refuses to yield, bittersweet golden light, late blooms","cold->cold":"Cold compounds upon cold — layers of frost deepen, moonlit ice plains stretch to the horizon, absolute winter intensifies","summer->summer":"Heat compounds upon heat — air shimmers with doubled intensity, everything bleached and burning","spring->spring":"Spring multiplies into lush abundance — green overwhelms green, rain and bloom cascade endlessly","autumn->autumn":"Autumn settles deep and golden — copper light dims to bronze, harvest complete, the world rests","spring->autumn":"Autumn winds interrupt spring — petals scatter before fully opening, bittersweet impermanence","autumn->spring":"Spring warmth breaks the autumn chill — unexpected second awakening, harvest season softened by new blooms"};return T[`${from}->${to}`]||"a subtle seasonal shift, the landscape's mood quietly transforming";}
// 조후 기반 의상 선택
// ============================================================
// 조후 기반 의상 및 얼굴 표정 프롬프트 생성
// ============================================================
function getFaceAndCostume(johuDetail, gender) {
  const { status, tempScore, humScore } = johuDetail;
  const isFemale = gender === "female";
  const charBase = isFemale ? "A highly detailed beautiful Korean female" : "A highly detailed handsome Korean male";
  
  const faceMap = {
    "HOT_DRY": "tightly closed lips, sharp and intense gaze, slightly flushed warm skin, confident and fierce expression",
    "HOT_WET": "subtle smirk, dewy glowing skin, deep and emotional eyes, alluring and intense expression",
    "COLD_DRY": "cold piercing gaze, pale matte skin, emotionally detached and highly rational expression, thin lips",
    "COLD_WET": "pale skin, melancholic and distant eyes, soft but sorrowful aura, delicate features",
    "NEUTRAL": "serene and gentle smile, glowing healthy skin, soft and relaxed eyes, peaceful aura"
  };

  const tLow = tempScore < 40, tHigh = tempScore > 60, hLow = humScore < 40, hHigh = humScore > 60;
  let outfit = "";
  if (tLow && hHigh) outfit = isFemale ? "heavy layered winter hanbok in dark indigo and grey" : "dark heavy overcoat with traditional Korean robes in navy";
  else if (tLow)     outfit = isFemale ? "elegant winter hanbok with fur-trimmed collar in pale silver" : "thick dark Korean overcoat and muffler in charcoal";
  else if (tHigh && hLow) outfit = isFemale ? "light flowing summer hanbok in vibrant red and orange" : "lightweight linen Korean robe in warm amber";
  else if (tHigh)    outfit = isFemale ? "sheer summer hanbok in warm coral and gold" : "light Korean summer robe in golden yellow";
  else if (hLow)     outfit = isFemale ? "autumn hanbok in golden amber and burnt sienna" : "structured autumn robe in rich chestnut";
  else if (hHigh)    outfit = isFemale ? "spring hanbok in soft jade green and misty blue" : "soft spring robe in moss green";
  else               outfit = isFemale ? "classic hanbok in balanced jade and ivory" : "traditional Korean robe in deep teal and ivory";

  return `Character: ${charBase}. Facial expression and features: ${faceMap[status] || faceMap["NEUTRAL"]}. Attire: ${outfit}. The figure is standing naturally in the center, gazing slightly towards the camera.`;
}

function buildOriginPrompt(ds, mb, gender, johuDetail) {
  const charDesc = getFaceAndCostume(johuDetail, gender);
  return [
    "Photorealistic cinematic portrait photography. 8K ultra-high resolution.",
    `Primary elemental identity: ${STEM_SCENE[ds] || "dramatic natural landscape"}.`,
    `Seasonal environment: ${BRANCH_SCENE[mb] || "vast atmospheric landscape"}.`,
    charDesc,
    "Mood: deeply connected with the surrounding nature. Lighting: dramatic cinematic lighting with physically accurate shadows. Masterpiece, hyper-detailed."
  ].join(" ");
}

function buildDaeunFusionPrompt(ds, mb, db, gender, johuDetail, dayBranch) {
  const charDesc = getFaceAndCostume(johuDetail, gender);
  const CHUNG_MAP = { 子:"午", 午:"子", 丑:"未", 未:"丑", 寅:"申", 申:"寅", 卯:"酉", 酉:"卯", 辰:"戌", 戌:"辰", 巳:"亥", 亥:"巳" };
  
  let eventDesc = buildNarrativeTransition(mb, db);
  
  // 충(沖) 기믹
  if (CHUNG_MAP[db] === mb || CHUNG_MAP[db] === dayBranch) {
    eventDesc = `A violent and epic elemental collision! Shattering landscape, explosive contrast between the old environment and the incoming ${BRANCH_SCENE[db]}. A decisive dividing line tearing the frame in half, dramatic clash of forces.`;
  } 
  // 삼합/방합 기믹
  else if (["寅午戌","巳午未","申子辰","亥子丑","亥卯未","寅卯辰","巳酉丑","申酉戌"].some(g => g.includes(mb) && g.includes(db))) {
    eventDesc = `A harmonious but overwhelming metamorphosis. The entire environment is being swallowed and unified into a single immense elemental power. Surreal scaling, boundless energy of ${BRANCH_SCENE[db]}.`;
  }

  return [
    "Photorealistic cinematic portrait photography. 8K ultra-high resolution.",
    `Primary elemental identity: ${STEM_SCENE[ds] || "dramatic landscape"}.`,
    `NARRATIVE TRANSFORMATION IN PROGRESS: ${eventDesc}`,
    charDesc,
    "CRITICAL: Capture the dynamic MOMENT OF TRANSITION — opposing forces actively colliding or beautifully merging around the character.",
    "Lighting: chiaroscuro clash or overwhelming unified glow. Masterpiece."
  ].join(" ");
}
async function generateImage(prompt,onProgress){onProgress?.(10,"요청 전송 중...");const r=await fetch("/api/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});const data=await r.json();if(!r.ok)throw new Error(data.error||"이미지 생성 실패");if(data.url){onProgress?.(100,"완료!");return data.url;}if(data.id){for(let i=0;i<60;i++){await new Promise(res=>setTimeout(res,2000));const poll=await fetch(`/api/image?id=${data.id}`);const pd=await poll.json();onProgress?.(Math.min(90,30+i*2),"AI 렌더링 중...");if(pd.status==="succeeded"){onProgress?.(100,"완료!");return pd.url;}if(pd.status==="failed")throw new Error(pd.error||"생성 실패");}throw new Error("시간 초과");}throw new Error("응답 오류");}

// ============================================================
// 궁합 계산
// ============================================================
const HS_HAP={甲:"己",己:"甲",乙:"庚",庚:"乙",丙:"辛",辛:"丙",丁:"壬",壬:"丁",戊:"癸",癸:"戊"};
const HS_CHUNG={甲:"庚",庚:"甲",乙:"辛",辛:"乙",丙:"壬",壬:"丙",丁:"癸",癸:"丁"};
const WANG_JI=["子","午","卯","酉"];const WANG_CHUNG={子:"午",午:"子",卯:"酉",酉:"卯"};
const SAMHYUNG=[["寅","巳","申"],["丑","戌","未"],["子","卯"]];
function calcCompatScore(s1,s2){
  const d1=s1.pillars[1].stem,d2=s2.pillars[1].stem;const b1=s1.pillars[1].branch,b2=s2.pillars[1].branch;
  let score=50;const details=[];
  if(HS_HAP[d1]===d2){score+=20;details.push({type:"일간합",icon:"✦",desc:`${d1}·${d2} 천간합 — 두 기운이 하나로 합쳐지는 깊은 인연`,positive:true,pts:20});}
  if(HS_CHUNG[d1]===d2){score-=15;details.push({type:"일간충",icon:"✕",desc:`${d1}·${d2} 천간충 — 서로 부딪히는 강한 긴장 관계`,positive:false,pts:-15});}
  const need1=JOHU_NEED[s1.pillars[2].branch]?.need||[];const need2=JOHU_NEED[s2.pillars[2].branch]?.need||[];
  const el1=HS_EL[s1.pillars[1].stemIdx],el2=HS_EL[s2.pillars[1].stemIdx];
  let johuPts=0;if(need1.includes(el2))johuPts+=10;if(need2.includes(el1))johuPts+=10;score+=johuPts;
  details.push(johuPts>0?{type:"조후보완",icon:"◎",desc:`서로에게 필요한 오행(${el2}·${el1})을 주고받는 상호 보완 관계`,positive:true,pts:johuPts}:{type:"조후보완",icon:"△",desc:"조후 보완 관계 없음 — 오행의 상호 보완이 약함",positive:false,pts:0});
  if(WANG_JI.includes(b1)&&WANG_JI.includes(b2)&&WANG_CHUNG[b1]===b2){score-=12;details.push({type:"왕지충",icon:"⚡",desc:`${b1}·${b2} 왕지충 — 강한 기운끼리 정면 충돌, 격렬한 갈등 가능`,positive:false,pts:-12});}
  const combined=[...s1.pillars.map(p=>p.branch),...s2.pillars.map(p=>p.branch)];
  if(SAMHYUNG.some(grp=>grp.every(b=>combined.includes(b)))){score-=10;details.push({type:"삼형살",icon:"⚠",desc:"합쳤을 때 삼형살 완성 — 함께할수록 예상치 못한 시련이 따름",positive:false,pts:-10});}
  return{score:Math.max(0,Math.min(100,score)),details};
}
function compatLabel(s){if(s>=85)return{label:"천생연분",color:"#f59e0b"};if(s>=70)return{label:"좋은 인연",color:"#4ade80"};if(s>=55)return{label:"보통 궁합",color:C.gold};if(s>=40)return{label:"주의 필요",color:"#fb923c"};return{label:"충극 관계",color:C.red};}

// ============================================================
// 공통 UI 컴포넌트
// ============================================================
function Card({children,style}){return <div style={{background:C.card,borderRadius:20,padding:20,border:"1px solid rgba(215,180,105,0.22)",boxShadow:"0 4px 20px rgba(0,0,0,0.22)",...style}}>{children}</div>;}
function CardTitle({children,style}){return <p style={{textAlign:"center",fontWeight:700,color:C.goldL,fontFamily:"'Noto Serif KR',serif",marginBottom:14,fontSize:"0.88rem",letterSpacing:"0.1em",...style}}>{children}</p>;}
function Field({label,children}){return <div><label style={{fontSize:"0.65rem",fontWeight:700,color:C.muted,display:"block",marginBottom:8,letterSpacing:"0.1em"}}>{label}</label>{children}</div>;}
function SI({style,...p}){return <input {...p} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid rgba(215,180,105,0.32)",background:"rgba(255,255,255,0.10)",color:C.text,fontSize:"0.95rem",outline:"none",boxSizing:"border-box",...style}}/>;}
function SS2({children,style,...p}){return <select {...p} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid rgba(210,175,100,0.25)",background:"#2e1e10",color:C.text,fontSize:"0.95rem",outline:"none",...style}}>{children}</select>;}
function GoldBtn({children,style,...p}){return <button {...p} style={{padding:"14px 24px",borderRadius:14,background:p.disabled?`${C.gold}12`:`linear-gradient(135deg,${C.gold},${C.goldD})`,color:p.disabled?C.muted:"#160c00",fontWeight:700,fontSize:"0.88rem",border:"none",cursor:p.disabled?"not-allowed":"pointer",letterSpacing:"0.08em",fontFamily:"'Noto Serif KR',serif",...style}}>{children}</button>;}
function GhBtn({children,active,style,...p}){return <button {...p} style={{padding:"8px 0",borderRadius:12,background:active?`${C.gold}28`:"rgba(255,255,255,0.07)",color:active?C.gold:`${C.gold}88`,border:active?`1.5px solid ${C.gold}70`:"1.5px solid rgba(255,255,255,0.14)",cursor:"pointer",fontSize:"0.72rem",fontWeight:700,whiteSpace:"nowrap",flex:1,letterSpacing:"0.04em",textAlign:"center",...style}}>{children}</button>;}
function GenderBtn({v,l,form,setForm}){return <button onClick={()=>setForm({...form,gender:v})} style={{flex:1,padding:12,borderRadius:12,background:form.gender===v?`${C.gold}28`:"rgba(255,255,255,0.07)",color:form.gender===v?C.gold:`${C.gold}88`,border:form.gender===v?`1.5px solid ${C.gold}70`:"1.5px solid rgba(255,255,255,0.14)",cursor:"pointer",fontWeight:700,fontSize:"0.85rem"}}>{l}</button>;}

// ============================================================
// 팔자표 (일지 십신 포함)
// ============================================================
function SajuChart({pillars,dayStem,compact=false,johuDetail=null}){
  const dayEl=HS_EL[HS.indexOf(dayStem)];
  const monthBranch=pillars[2].branch;
  // 물상 헤드라인
  return(
    <div>
      {/* 물상 시(詩) 헤드 - 일간×월지 조합 */}
      {(()=>{const mh=buildMulsangHeader(dayStem,monthBranch);return mh?(
        <div style={{marginBottom:10,padding:"9px 14px",background:`linear-gradient(135deg,${EL_COL[dayEl]}1a,${EL_COL[EB_EL[EB.indexOf(monthBranch)]]}1a)`,borderRadius:12,border:`1px solid ${EL_COL[dayEl]}40`,textAlign:"center"}}>
          <span style={{fontSize:"0.82rem",color:C.goldL,fontFamily:"'Noto Serif KR',serif",lineHeight:1.8,fontStyle:"italic",letterSpacing:"0.02em"}}>"{mh}"</span>
        </div>
      ):null;})()}
      {/* 팔자표 */}
      <div style={{display:"flex"}}>
        {pillars.map((p,i)=>{
          const isDay=i===1;
          const sc=EL_COL[HS_EL[p.stemIdx]]||C.gold;const bc=EL_COL[EB_EL[p.branchIdx]]||C.gold;
          const stemSS=isDay?"일간":getSS(dayStem,p.stem);
          // 지지 십신 (일지 포함, 본기 기준)
          const bonStem=EBH[p.branch]?.bon?.[0];
          const branchSS=bonStem?getSS(dayStem,bonStem):"";
          return(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:compact?"0.5rem 0.05rem":"0.85rem 0.05rem 0.6rem",background:isDay?`${C.gold}06`:"transparent",borderRadius:12,borderRight:i<3?"1px solid rgba(201,169,110,0.05)":"none"}}>
              <span style={{fontSize:"0.5rem",color:isDay?`${C.gold}cc`:C.muted,marginBottom:3,letterSpacing:"0.08em"}}>{p.label}주</span>
              <span style={{fontSize:"0.53rem",color:isDay?C.gold:`${C.gold}88`,fontWeight:700,background:isDay?`${C.gold}25`:"rgba(255,255,255,0.09)",borderRadius:4,padding:"2px 6px",marginBottom:3}}>{stemSS}</span>
              <div style={{fontSize:compact?"1.9rem":"2.5rem",lineHeight:1,color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.stem]?900:300,marginBottom:2}}>{p.stem}</div>
              <span style={{fontSize:"0.44rem",color:sc,fontWeight:700,background:`${sc}18`,borderRadius:4,padding:"1px 4px",marginBottom:5}}>{HS_EL[p.stemIdx]}</span>
              <div style={{width:10,height:1,background:`linear-gradient(to right,transparent,${C.gold}44,transparent)`,marginBottom:5}}/>
              <div style={{fontSize:compact?"1.9rem":"2.5rem",lineHeight:1,color:bc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.branch]?900:300,marginBottom:2}}>{p.branch}</div>
              <span style={{fontSize:"0.44rem",color:bc,fontWeight:700,background:`${bc}18`,borderRadius:4,padding:"1px 4px",marginBottom:3}}>{EB_EL[p.branchIdx]}</span>
              {/* 지지 십신 (일지 포함) */}
              {branchSS&&<span style={{fontSize:"0.53rem",color:isDay?C.gold:`${C.gold}88`,fontWeight:700,background:isDay?`${C.gold}25`:"rgba(255,255,255,0.09)",borderRadius:4,padding:"2px 6px"}}>{branchSS}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 오행 오각형 + 신강신약 영역 표시
// ============================================================
function Pentagon({pillars,dayStem,pillars2=null,name1="나",name2="상대방"}){
  const cnt1=calcElementCount(pillars);const cnt2=pillars2?calcElementCount(pillars2):null;
  const ORDER=["水","木","火","土","金"];const EC={水:C.water,木:C.wood,火:C.fire,土:C.earth,金:C.metal};
  const cx=130,cy=130,R=80;
  const pts=ORDER.map((_,i)=>{const a=(i*72-90)*Math.PI/180;return{x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)};});
  const max1=Math.max(...Object.values(cnt1),1);
  const makePath=(cnt,maxv)=>{const rp=ORDER.map((el,i)=>{const a=(i*72-90)*Math.PI/180;const rr=14+(R-14)*(cnt[el]/maxv);return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)};});return rp.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z";};
  const rd1=makePath(cnt1,max1);const rd2=cnt2?makePath(cnt2,Math.max(...Object.values(cnt2),1)):null;
  const dayEl=HS_EL[HS.indexOf(dayStem)];
  const need1=JOHU_NEED[pillars[2].branch]?.need||[];
  
  // 신강/신약 판별
  const strength=calcStrength(pillars);
  const strengthColor=strength==="신강"?C.fire:strength==="신약"?C.water:C.gold;
  
  // 강세 오행 그룹 (값이 평균 이상인 것들)
  const avg1=Object.values(cnt1).reduce((a,b)=>a+b,0)/5;
  const strongEls=ORDER.filter(el=>cnt1[el]>avg1*1.2);
  
  // 강세 오행 연결 폴리곤 (강세 오행 꼭짓점 연결)
  const strongPts=strongEls.map(el=>{const i=ORDER.indexOf(el);const ratio=cnt1[el]/max1;const a=(i*72-90)*Math.PI/180;const rr=14+(R-14)*ratio;return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a),el};});

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      {/* 신강/신약 배지 */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <div style={{padding:"4px 14px",borderRadius:99,background:`${strengthColor}25`,border:`1.5px solid ${strengthColor}70`,fontSize:"0.8rem",fontWeight:700,color:strengthColor,fontFamily:"'Noto Serif KR',serif",letterSpacing:"0.15em"}}>{strength}</div>
        {pillars2&&<>
          <div style={{width:12,height:3,background:`${C.gold}cc`,borderRadius:2}}/>
          <span style={{fontSize:"0.6rem",color:C.muted}}>{name1}</span>
          <div style={{width:12,height:3,background:`${C.water}99`,borderRadius:2,borderStyle:"dashed"}}/>
          <span style={{fontSize:"0.6rem",color:C.muted}}>{name2}</span>
        </>}
      </div>
      
      <svg width="260" height="260" viewBox="0 0 260 260">
        <rect width="260" height="260" fill="#1e1508" rx="16"/>
        {[0.33,0.66,1.0].map((lv,gi)=>{const gp=ORDER.map((_,i)=>{const a=(i*72-90)*Math.PI/180;const rr=(R-14)*lv+14;return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)};});return <path key={gi} d={gp.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z"} fill="none" stroke="rgba(220,185,120,0.18)" strokeWidth={gi===2?1.2:0.6}/>;})}
        {pts.map((p,i)=><line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(220,185,120,0.12)" strokeWidth="0.8"/>)}
        
        {/* 강세 오행 영역 하이라이트 */}
        {strongEls.length>=2&&(()=>{
          const sPts=strongEls.map(el=>{const i=ORDER.indexOf(el);const ratio=cnt1[el]/max1;const a=(i*72-90)*Math.PI/180;const rr=14+(R-14)*ratio;return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a),el};});
          const avgColor=sPts.length>0?EC[sPts[0].el]:"rgba(201,169,110,0.5)";
          const pathD=sPts.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+(sPts.length>2?"Z":"");
          return <path d={pathD} fill={`${avgColor}14`} stroke={avgColor} strokeWidth="1.5" strokeOpacity="0.55" strokeDasharray="4 2"/>;
        })()}
        
        {rd2&&<path d={rd2} fill={`${C.water}0a`} stroke={C.water} strokeWidth="1.5" strokeOpacity="0.55" strokeDasharray="4 3"/>}
        <path d={rd1} fill={`${C.gold}0a`} stroke={C.gold} strokeWidth="2" strokeOpacity="0.75"/>
        
        {ORDER.map((el,i)=>{
          const ratio=cnt1[el]/max1;const r=14+(40-14)*ratio;const isDay=el===dayEl;const isStrong=strongEls.includes(el);
          const isComplement=cnt2&&need1.includes(el);
          return(
            <g key={el}>
              {isComplement&&<circle cx={pts[i].x} cy={pts[i].y} r={r+10} fill="none" stroke={EC[el]} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3 3"/>}
              {isStrong&&<circle cx={pts[i].x} cy={pts[i].y} r={r+6} fill={EC[el]} fillOpacity="0.08" stroke={EC[el]} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 2"/>}
              <circle cx={pts[i].x} cy={pts[i].y} r={r+4} fill={EC[el]} fillOpacity="0.04"/>
              <circle cx={pts[i].x} cy={pts[i].y} r={r} fill={EC[el]} fillOpacity={0.15+ratio*0.5} stroke={isDay?EC[el]:"none"} strokeWidth={isDay?2:0}/>
              <text x={pts[i].x} y={pts[i].y} textAnchor="middle" dominantBaseline="middle" fontSize={r>20?16:12} fontWeight="900" fontFamily="serif" fill={EC[el]}>{el}</text>
              <text x={pts[i].x} y={pts[i].y+r+10} textAnchor="middle" fontSize="9" fill={EC[el]} fillOpacity="0.65">{cnt1[el].toFixed(1)}</text>
              {cnt2&&<text x={pts[i].x} y={pts[i].y+r+20} textAnchor="middle" fontSize="8" fill={C.water} fillOpacity="0.5">{(calcElementCount(pillars2))[el].toFixed(1)}</text>}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="14" fill={EC[dayEl]||C.gold} fillOpacity="0.15" stroke={EC[dayEl]||C.gold} strokeWidth="1.5"/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fontFamily="serif" fill={EC[dayEl]||C.gold}>{dayStem}</text>
      </svg>
      
    </div>
  );
}

// ============================================================
// 조후 게이지 (온도/습도 분리)
// ============================================================
// ============================================================
// 조후 게이지 UI
// ============================================================
function JohuGauge({ johuDetail }) {
  const { tempScore, humScore, status } = johuDetail;
  
  const statusUI = {
    "HOT_DRY":  { icon: "🔥", title: "맹렬한 조열(燥熱)", desc: "사막의 태양처럼 뜨겁고 메마른 기운입니다.", color: "#f05030", bg: "rgba(240, 80, 48, 0.1)" },
    "HOT_WET":  { icon: "♨️", title: "끈적한 습열(濕熱)", desc: "한여름 장마철처럼 뜨겁고 축축한 기운입니다.", color: "#fb923c", bg: "rgba(251, 146, 60, 0.1)" },
    "COLD_DRY": { icon: "❄️", title: "매서운 한조(寒燥)", desc: "한겨울 칼바람처럼 차갑고 건조한 기운입니다.", color: "#4da0f0", bg: "rgba(77, 160, 240, 0.1)" },
    "COLD_WET": { icon: "🌧️", title: "얼어붙은 한습(寒濕)", desc: "초겨울 진눈깨비처럼 차갑고 습한 기운입니다.", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
    "NEUTRAL":  { icon: "🌿", title: "온화한 중화(中和)", desc: "생명력이 피어나기 가장 좋은 쾌적하고 조화로운 기운입니다.", color: "#4ade80", bg: "rgba(74, 222, 128, 0.1)" }
  };
  
  const ui = statusUI[status] || statusUI["NEUTRAL"];
  const r = 32, circ = 2 * Math.PI * r;
  const tempColor = tempScore > 60 ? "#f05030" : tempScore < 40 ? "#4da0f0" : "#4ade80";
  const humColor = humScore > 60 ? "#3b82f6" : humScore < 40 ? "#d4ae6e" : "#4ade80";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ padding:"14px 16px", background: ui.bg, borderRadius:12, border:`1.5px solid ${ui.color}40` }}>
        <div style={{ textAlign:"center", marginBottom:8 }}>
          <div style={{ fontSize:"1.3rem", marginBottom:4 }}>{ui.icon}</div>
          <span style={{ fontSize:"1.05rem", fontWeight:900, color: ui.color, fontFamily:"'Noto Serif KR',serif", letterSpacing:"0.05em" }}>
            {ui.title}
          </span>
          <p style={{ fontSize:"0.68rem", color: "rgba(240,220,180,0.85)", marginTop:6, lineHeight:1.5 }}>{ui.desc}</p>
        </div>
        <div style={{ borderTop:`1px solid ${ui.color}25`, paddingTop:10, marginTop:6 }}>
          <div style={{ fontSize:"0.55rem", color:ui.color, fontWeight:700, letterSpacing:"0.12em", marginBottom:8, opacity:0.8 }}>✦ 조후 통변</div>
          {johuTongByun(status).map((l, i) => (
            <div key={i} style={{ display:"flex", gap:6, marginBottom:5 }}>
              <span style={{ flexShrink:0, fontSize:"0.55rem", color:ui.color, opacity:0.55, marginTop:2 }}>•</span>
              <span style={{ fontSize:"0.66rem", color:"rgba(240,220,180,0.9)", lineHeight:1.6, fontFamily:"'Noto Serif KR',serif" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        {[{ score: tempScore, label: "온도 (熱/寒)", icon: "🌡", color: tempColor }, { score: humScore, label: "습도 (濕/燥)", icon: "💧", color: humColor }].map(({ score, label, icon, color }) => (
          <div key={label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"12px 8px", background:`${color}08`, borderRadius:14, border:`1px solid ${color}25` }}>
            <span style={{ fontSize:"1.2rem" }}>{icon}</span>
            <div style={{ position:"relative", width:80, height:80 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="7"/>
                <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={circ} strokeDashoffset={circ * (1 - score/100)} strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition:"stroke-dashoffset 1.2s ease" }}/>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:"1.1rem", fontWeight:900, color, lineHeight:1 }}>{score}</span>
              </div>
            </div>
            <span style={{ fontSize:"0.7rem", fontWeight:700, color, letterSpacing:"0.05em" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 대운 선택 패널
// ============================================================
function DaeunPanel({daeunList,birthYear,selDaeun,setSelDaeun}){
  const curYear=new Date().getFullYear();const age=curYear-birthYear;
  return(
    <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
      {daeunList.map((d,i)=>{
        const isNow=d.startAge<=age&&age<d.startAge+10;const isSel=selDaeun?.startYear===d.startYear;
        return(
          <button key={i} onClick={()=>setSelDaeun(isSel?null:d)} style={{flexShrink:0,width:62,borderRadius:14,padding:"8px 3px 7px",textAlign:"center",background:isSel?`${C.gold}28`:"#2e1e0e",border:isSel?`1.5px solid ${C.gold}70`:"1.5px solid rgba(255,255,255,0.14)",cursor:"pointer",position:"relative"}}>
            {isNow&&<div style={{position:"absolute",top:4,right:5,width:5,height:5,borderRadius:"50%",background:"#4ade80"}}/>}
            <div style={{fontSize:"1.7rem",color:EL_COL[HS_EL[d.stemIdx]],fontFamily:"serif",lineHeight:1}}>{d.stem}</div>
            <div style={{fontSize:"1.7rem",color:EL_COL[EB_EL[d.branchIdx]],fontFamily:"serif",lineHeight:1}}>{d.branch}</div>
            <div style={{fontSize:"0.48rem",color:isSel?C.gold:C.muted,marginTop:3}}>{d.startAge}세</div>
            <div style={{fontSize:"0.42rem",color:C.muted,marginBottom:3}}>{d.startYear}~</div>
          </button>
        );
      })}
    </div>
  );
}


function johuTongByun(status) {
  const scripts = {
    "HOT_DRY": [
      "뜨거운 열기와 건조함이 강해 폭발적인 추진력과 다혈질적 성향을 보입니다.",
      "맺고 끊음이 칼 같고 원칙을 중시하여 때로는 타인에게 냉정하게 비칠 수 있습니다.",
      "수(水) 기운이 들어올 때 마음에 여유가 생기고 인간관계가 넓어지며 결실을 맺습니다."
    ],
    "HOT_WET": [
      "열기와 습기가 얽혀 화려하고 감정이 풍부하나, 감정 기복이 심할 수 있습니다.",
      "정이 많아 대인관계에 에너지를 많이 쓰며, 무언가에 쉽게 집착하거나 번아웃이 올 수 있습니다.",
      "가을의 금(金) 기운이 오면 불필요한 감정이 정리되고 이성적인 판단력이 살아납니다."
    ],
    "COLD_DRY": [
      "얼어붙은 동토처럼 차갑고 건조해 고독을 즐기며 매우 이성적이고 치밀합니다.",
      "감정을 잘 드러내지 않아 속을 알 수 없다는 평을 듣지만 멘탈이 강합니다.",
      "화(火) 기운의 대운에서 얼음이 녹듯 삶에 활기가 깃들고 세상의 인정을 받게 됩니다."
    ],
    "COLD_WET": [
      "한기와 습기가 겹쳐 생각이 많고 활동력이 저하되기 쉬운 수용적인 구조입니다.",
      "매사 진행이 더디고 우유부단함 때문에 결정적인 기회를 놓치는 경향이 있습니다.",
      "강력한 태양인 병화(丙)가 올 때 내면의 빛이 세상 밖으로 활짝 드러납니다."
    ],
    "NEUTRAL": [
      "온도와 습도의 균형이 완벽에 가까워 가장 건강하고 원만한 멘탈을 가졌습니다.",
      "상황에 따라 유연하게 대처하며, 어떠한 환경에서도 쉽게 무너지지 않습니다.",
      "대운의 흐름에 크게 휘둘리지 않고 본인의 페이스대로 꾸준한 발전이 가능합니다."
    ]
  };
  return scripts[status] || scripts["NEUTRAL"];
}
// ============================================================
// 인생 그래프 (대운 등급 기반)
// ============================================================
const GRADE_VALUE={S:95,A:80,B:60,C:30};
function getGradeVal(g){
  if(!g)return 50;
  if(g==="A+")return 85;
  return GRADE_VALUE[g]??50;
}

function LifeGraph({daeunList,pillars,dayStem,birthYear,selDaeun,setSelDaeun}){
  const grades=daeunList.map(d=>({...d,grade:calcDaeunGrade(pillars,dayStem,d.branch)}));
  const vals=grades.map(g=>getGradeVal(g.grade.grade));
  const curYear=new Date().getFullYear();
  const curAge=curYear-birthYear;

  // SVG 크기
  const W=340,H=140,PL=14,PR=14,PT=18,PB=32;
  const gW=W-PL-PR,gH=H-PT-PB;
  const n=grades.length;
  const xOf=i=>PL+i*(gW/(n-1));
  const yOf=v=>PT+gH*(1-(v-20)/80);

  // 스플라인 포인트 생성
  const pts=vals.map((v,i)=>({x:xOf(i),y:yOf(v)}));
  // 부드러운 커브 (베지에)
  function bezierPath(pts){
    if(pts.length<2)return "";
    let d=`M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for(let i=0;i<pts.length-1;i++){
      const p0=i>0?pts[i-1]:pts[i];
      const p1=pts[i];const p2=pts[i+1];
      const p3=i+2<pts.length?pts[i+2]:p2;
      const cp1x=(p1.x+(p2.x-p0.x)*0.2).toFixed(1);
      const cp1y=(p1.y+(p2.y-p0.y)*0.2).toFixed(1);
      const cp2x=(p2.x-(p3.x-p1.x)*0.2).toFixed(1);
      const cp2y=(p2.y-(p3.y-p1.y)*0.2).toFixed(1);
      d+=` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }
  const linePath=bezierPath(pts);
  // 채우기용 (하단 닫기)
  const fillPath=linePath+` L ${pts[n-1].x.toFixed(1)} ${(PT+gH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PT+gH).toFixed(1)} Z`;

  // 현재 대운 위치
  const nowIdx=grades.findIndex(d=>d.startAge<=curAge&&curAge<d.startAge+10);
  const selIdx=selDaeun?grades.findIndex(d=>d.startYear===selDaeun.startYear):-1;

  // 등급별 색상
  const gradeColor={S:"#f5c842","A+":"#4ade80",A:"#86efac",B:C.gold,C:"#fb923c"};

  return(
    <div style={{width:"100%"}}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
        <defs>
          <linearGradient id="lgraph" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.gold} stopOpacity="0.35"/>
            <stop offset="100%" stopColor={C.gold} stopOpacity="0.02"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* 가로 가이드라인 */}
        {[{v:90,l:"S"},{v:75,l:"A"},{v:55,l:"B"},{v:35,l:"C"}].map(({v,l})=>(
          <g key={l}>
            <line x1={PL} y1={yOf(v)} x2={W-PR} y2={yOf(v)} stroke={"rgba(255,255,255,0.06)"} strokeWidth="1" strokeDasharray="3,4"/>
            <text x={PL-4} y={yOf(v)} textAnchor="end" fontSize="7" fill="rgba(220,185,120,0.4)" dominantBaseline="middle">{l}</text>
          </g>
        ))}

        {/* 현재 대운 세로선 */}
        {nowIdx>=0&&(
          <line x1={pts[nowIdx].x} y1={PT} x2={pts[nowIdx].x} y2={PT+gH} stroke="#4ade80" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,3"/>
        )}

        {/* 면적 채우기 */}
        <path d={fillPath} fill="url(#lgraph)"/>
        {/* 선 */}
        <path d={linePath} fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" filter="url(#glow)" opacity="0.85"/>

        {/* 포인트 */}
        {grades.map((g,i)=>{
          const gc=gradeColor[g.grade.grade]||C.gold;
          const isSel=selIdx===i;const isNow=nowIdx===i;
          return(
            <g key={i} style={{cursor:"pointer"}} onClick={()=>setSelDaeun(g.startYear===selDaeun?.startYear?null:g)}>
              {/* 선택/현재 하이라이트 */}
              {(isSel||isNow)&&<circle cx={pts[i].x} cy={pts[i].y} r="14" fill={gc} fillOpacity="0.12" stroke={gc} strokeWidth="1" strokeOpacity="0.4"/>}
              {/* 메인 도트 */}
              <circle cx={pts[i].x} cy={pts[i].y} r={isSel?6:4} fill={gc} stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" filter={isSel?"url(#glow)":"none"}/>
              {/* 등급 레이블 */}
              <text x={pts[i].x} y={pts[i].y-10} textAnchor="middle" fontSize={isSel?9:7.5} fill={gc} fontWeight={isSel?"bold":"normal"} opacity={isSel?1:0.8}>{g.grade.grade}</text>
              {/* 대운 이름 */}
              <text x={pts[i].x} y={PT+gH+12} textAnchor="middle" fontSize="8" fill={isSel?C.goldL:"rgba(220,185,120,0.55)"} fontWeight={isSel?"bold":"normal"}>{g.stem}{g.branch}</text>
              {/* 시작 나이 */}
              <text x={pts[i].x} y={PT+gH+22} textAnchor="middle" fontSize="6.5" fill="rgba(220,185,120,0.38)">{g.startAge}세</text>
            </g>
          );
        })}
        {/* 현재 위치 초록 점 */}
        {nowIdx>=0&&<circle cx={pts[nowIdx].x} cy={pts[nowIdx].y} r="3" fill="#4ade80" opacity="0.9"/>}
      </svg>
    </div>
  );
}
// ============================================================
// 물상 이미지 카드
// ============================================================
function PhysImageCard({title,prompt,dayStem,label,note}){
  const[url,setUrl]=useState(null);const[status,setStatus]=useState("idle");
  const[prog,setProg]=useState(0);const[progMsg,setProgMsg]=useState("");const[err,setErr]=useState("");
  const elColor=EL_COL[HS_EL[HS.indexOf(dayStem)]]||C.gold;
  async function generate(){setStatus("loading");setErr("");setProg(0);try{const imgUrl=await generateImage(prompt,(p,m)=>{setProg(p);setProgMsg(m);});setUrl(imgUrl);setStatus("done");}catch(e){setErr(e.message);setStatus("error");}}
  async function save(){if(!url)return;try{const res=await fetch(url);const blob=await res.blob();const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`saju-${label}-${Date.now()}.webp`;a.click();}catch{window.open(url,"_blank");}}
  return(
    <div style={{borderRadius:16,overflow:"hidden",background:"#1e1508",border:"1px solid rgba(210,175,100,0.22)"}}>
      <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.10)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
        <div><div style={{fontSize:"0.72rem",fontWeight:700,color:C.goldL,fontFamily:"'Noto Serif KR',serif"}}>{title}</div>{note&&<div style={{fontSize:"0.56rem",color:C.muted,marginTop:2}}>{note}</div>}</div>
        {status==="done"&&url&&<button onClick={save} style={{flexShrink:0,padding:"4px 10px",borderRadius:8,background:`${C.gold}15`,border:`1px solid ${C.gold}30`,color:C.gold,fontSize:"0.6rem",fontWeight:700,cursor:"pointer"}}>⬇ 저장</button>}
      </div>
      {status==="idle"&&<div style={{height:210,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}><div style={{fontSize:44,fontFamily:"serif",color:elColor,opacity:0.25,animation:"float 3s ease-in-out infinite"}}>{dayStem}</div><button onClick={generate} style={{padding:"10px 24px",borderRadius:12,background:`${elColor}18`,color:elColor,border:`1px solid ${elColor}40`,cursor:"pointer",fontSize:"0.78rem",fontWeight:700}}>🎬 이미지 생성</button></div>}
      {status==="loading"&&<div style={{height:210,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,padding:"1.5rem"}}><div style={{fontSize:32,color:elColor,opacity:0.35,fontFamily:"serif",animation:"shimmer 1.5s ease infinite"}}>{dayStem}</div><div style={{width:"100%",maxWidth:200}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:"0.6rem",color:C.muted}}>{progMsg}</span><span style={{fontSize:"0.65rem",fontWeight:700,color:elColor}}>{prog}%</span></div><div style={{height:4,borderRadius:99,background:"rgba(220,185,120,0.14)"}}><div style={{height:"100%",borderRadius:99,background:elColor,width:`${prog}%`,transition:"width 0.4s ease"}}/></div></div></div>}
      {status==="done"&&url&&<img src={url} alt={title} style={{width:"100%",display:"block"}}/>}
      {status==="error"&&<div style={{height:170,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:"1rem"}}><p style={{color:"#ff6a50",fontSize:"0.68rem",margin:0,textAlign:"center"}}>⚠ {err}</p><button onClick={generate} style={{padding:"7px 16px",borderRadius:10,background:`${C.gold}10`,color:C.gold,border:`1px solid ${C.gold}25`,cursor:"pointer",fontSize:"0.7rem"}}>↺ 다시 시도</button></div>}
    </div>
  );
}

// ============================================================
// 궁합 결과
// ============================================================
function CompatResult({compat,s1,s2,name1,name2}){
  const{score,details}=compat;const{label,color}=compatLabel(score);const r=50,circ=2*Math.PI*r;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card><div style={{display:"flex",alignItems:"center",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",width:120,height:120}}>
          <svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="10"/><circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset 1.5s ease"}}/></svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:"2rem",fontWeight:900,color,lineHeight:1}}>{score}</span><span style={{fontSize:"0.48rem",color,opacity:0.7}}>/ 100</span></div>
        </div>
        <div><div style={{fontSize:"1.15rem",fontWeight:900,color,fontFamily:"'Noto Serif KR',serif",marginBottom:6}}>{label}</div><div style={{fontSize:"0.63rem",color:C.muted,lineHeight:1.8}}>{name1} × {name2}<br/>일간 <span style={{color:EL_COL[HS_EL[s1.pillars[1].stemIdx]]}}>{s1.pillars[1].stem}</span>·<span style={{color:EL_COL[HS_EL[s2.pillars[1].stemIdx]]}}>{s2.pillars[1].stem}</span></div></div>
      </div></Card>
      <Card><CardTitle>궁합 세부 분석</CardTitle><div style={{display:"flex",flexDirection:"column",gap:8}}>{details.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 12px",borderRadius:12,background:d.positive?`${C.gold}12`:`${C.red}10`,border:`1px solid ${d.positive?C.gold:C.red}30`}}><span style={{fontSize:"1.1rem",flexShrink:0,color:d.positive?C.gold:C.red,lineHeight:1.2,marginTop:1}}>{d.icon}</span><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{fontSize:"0.7rem",fontWeight:700,color:d.positive?C.gold:C.red,fontFamily:"'Noto Serif KR',serif"}}>{d.type}</span>{d.pts!==0&&<span style={{fontSize:"0.58rem",color:d.positive?"#4ade80":C.red,background:d.positive?"rgba(74,222,128,0.1)":"rgba(224,80,64,0.1)",padding:"1px 6px",borderRadius:6,fontWeight:700}}>{d.pts>0?"+":""}{d.pts}점</span>}</div><p style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.6}}>{d.desc}</p></div></div>))}</div></Card>
      <Card><CardTitle>오행 세력 비교 및 보완 관계</CardTitle><Pentagon pillars={s1.pillars} dayStem={s1.dayStem} pillars2={s2.pillars} name1={name1} name2={name2}/></Card>
    </div>
  );
}

// ============================================================
// 메인 앱
// ============================================================
export default function App(){
  const[screen,setScreen]=useState("input");
  const[form,setForm]=useState({name:"",year:"1990",month:"1",day:"1",hour:"12",minute:"0",gender:"male"});
  const[lunarLoaded,setLunarLoaded]=useState(false);
  // lunar-javascript CDN 로드
  useState(()=>{ensureLunar(()=>setLunarLoaded(true));});
  const[form2,setForm2]=useState({name:"",year:"1992",month:"6",day:"15",hour:"12",minute:"0",gender:"female"});
  const[saju,setSaju]=useState(null);const[saju2,setSaju2]=useState(null);
  const[daeunList,setDaeunList]=useState([]);const[selDaeun,setSelDaeun]=useState(null);
  const[imgKey,setImgKey]=useState(0);const[tab,setTab]=useState("chart");
  const[err,setErr]=useState("");const[compat,setCompat]=useState(null);const[compatErr,setCompatErr]=useState("");

  function handleCalc(){
    setErr("");
    if(!form.year||!form.month||!form.day){setErr("생년월일을 입력해주세요.");return;}
    try{
      const r=calcSaju(+form.year,+form.month,+form.day,+form.hour,+form.minute);
      const dl=calcDaeun(+form.year,+form.month,+form.day,form.gender,r.pillars[2]);
      setSaju(r);setDaeunList(dl);
      const curAge=new Date().getFullYear()-+form.year;
      const cur=dl.find((d,i)=>d.startAge<=curAge&&(dl[i+1]?dl[i+1].startAge>curAge:true));
      setSelDaeun(cur||null);setImgKey(0);setSaju2(null);setCompat(null);
      setTab("chart");setScreen("result");
    }catch(e){setErr("계산 오류: "+e.message);}
  }
  function handleCompat(){
    setCompatErr("");
    try{const r2=calcSaju(+form2.year,+form2.month,+form2.day,+form2.hour,+form2.minute);setSaju2(r2);setCompat(calcCompatScore(saju,r2));}
    catch(e){setCompatErr("오류: "+e.message);}
  }

  // ── 입력 화면 ──
  if(screen==="input") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
      <style>{globalStyle}</style>
      <div style={{padding:"64px 24px 28px",textAlign:"center",background:`linear-gradient(180deg,#3c2410 0%,${C.bg} 100%)`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% -10%, rgba(201,169,110,0.07) 0%, transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-55%)",fontSize:"18rem",fontFamily:"'Noto Serif KR',serif",fontWeight:900,color:"transparent",WebkitTextStroke:"1px rgba(220,185,120,0.08)",userSelect:"none",pointerEvents:"none",lineHeight:1}}>命</div>
        <div style={{position:"relative",zIndex:1,animation:"fadeIn 0.7s ease"}}>
          <div style={{fontSize:"5.5rem",fontFamily:"'Noto Serif KR',serif",fontWeight:900,color:C.gold,lineHeight:1,marginBottom:8,textShadow:"0 0 60px rgba(201,169,110,0.5)",animation:"float 4s ease-in-out infinite"}}>命</div>
          <h1 style={{fontSize:"1.5rem",fontWeight:900,fontFamily:"'Noto Serif KR',serif",letterSpacing:"0.55em",color:C.goldL,marginBottom:8,textShadow:"0 2px 20px rgba(201,169,110,0.25)"}}>사주명리</h1>
          <p style={{fontSize:"0.62rem",color:C.muted,letterSpacing:"0.18em"}}>四柱命理 · 조후분석 · 물상이미지</p>
        </div>
      </div>
      <div style={{padding:"12px 20px 100px",display:"flex",flexDirection:"column",gap:16,maxWidth:480,margin:"0 auto",animation:"fadeIn 0.6s ease 0.1s both"}}>
        <Field label="이름 (선택)"><SI placeholder="성함을 입력하세요" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
        <Field label="생년월일"><div style={{display:"flex",gap:8}}><SI type="number" placeholder="년도" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} style={{flex:2}}/><SI type="number" placeholder="월" value={form.month} onChange={e=>setForm({...form,month:e.target.value})} style={{flex:1}}/><SI type="number" placeholder="일" value={form.day} onChange={e=>setForm({...form,day:e.target.value})} style={{flex:1}}/></div></Field>
        <Field label="출생 시각">
          <div style={{display:"flex",gap:8}}>
            <SS2 value={form.hour} onChange={e=>setForm({...form,hour:e.target.value})} style={{flex:1}}>
              {Array.from({length:24},(_,i)=>{const branches=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];const bi=getHB(i,0);return <option key={i} value={i}>{i}시 ({branches[bi]})</option>;})}
            </SS2>
            <SS2 value={form.minute} onChange={e=>setForm({...form,minute:e.target.value})} style={{flex:1}}>{[0,10,20,30,40,50].map(m=><option key={m} value={m}>{String(m).padStart(2,"0")}분</option>)}</SS2>
          </div>
        </Field>
        <Field label="성별"><div style={{display:"flex",gap:8}}><GenderBtn v="male" l="남성 ♂" form={form} setForm={setForm}/><GenderBtn v="female" l="여성 ♀" form={form} setForm={setForm}/></div></Field>
        {err&&<div style={{background:"rgba(180,40,20,0.1)",color:"#ff6a50",padding:"11px 16px",borderRadius:12,fontSize:"0.8rem",border:"1px solid rgba(180,40,20,0.22)"}}>{err}</div>}
        <GoldBtn onClick={handleCalc} style={{width:"100%",padding:18,fontSize:"1rem",letterSpacing:"0.2em",borderRadius:18,marginTop:4}}>命 팔자 산출하기</GoldBtn>
      </div>
    </div>
  );

  // ── 결과 화면 ──
  if(screen==="result"&&saju){
    const{pillars,dayStem,solar,lunar}=saju;
    const zodiacIdx=pillars[3].branchIdx;
    const johuDetail=calcJohuDetail(pillars,selDaeun?.branch);
    const strength=calcStrength(pillars);
    const strengthColor=strength==="신강"?C.fire:strength==="신약"?C.water:C.gold;
    const TABS=[{k:"chart",l:"오행",i:"⬠"},{k:"image",l:"물상",i:"🎬"},{k:"compat",l:"궁합",i:"♡"}];

    return(
      <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
        <style>{globalStyle}</style>
        <div style={{padding:"44px 20px 16px",background:`linear-gradient(180deg,#2a1c0a 0%,${C.bg} 100%)`}}>
          <button onClick={()=>setScreen("input")} style={{fontSize:"0.7rem",color:C.muted,marginBottom:12,display:"block",background:"none",border:"none",cursor:"pointer"}}>← 다시 입력</button>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{ZODIAC_E[zodiacIdx]}</span>
            <div style={{flex:1,minWidth:0}}>
              <h2 style={{fontSize:"1.05rem",fontWeight:900,fontFamily:"'Noto Serif KR',serif",color:C.goldL}}>{form.name?`${form.name}님의 사주`:"사주팔자"}</h2>
              <p style={{fontSize:"0.56rem",color:C.muted,marginTop:2}}>양력 {solar.year}.{solar.month}.{solar.day} {solar.hour}시{+solar.minute>0?` ${solar.minute}분`:""} · 음력 {lunar.year}.{lunar.isLeap?"윤":""}{lunar.month}.{lunar.day} · {ZODIAC[zodiacIdx]}띠</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:"0.72rem",fontWeight:900,color:strengthColor,lineHeight:1,background:`${strengthColor}15`,padding:"3px 10px",borderRadius:8,border:`1px solid ${strengthColor}40`}}>{strength}</span>
              <span style={{fontSize:"0.6rem",fontWeight:700,color:johuLabel(johuDetail.totalScore).color}}>{johuLabel(johuDetail.totalScore).label}</span>
            </div>
          </div>
        </div>

        <div style={{padding:"0 16px 100px",display:"flex",flexDirection:"column",gap:12,maxWidth:520,margin:"0 auto"}}>
          <Card style={{padding:"0.9rem 0.3rem"}}><SajuChart pillars={pillars} dayStem={dayStem} johuDetail={johuDetail}/></Card>

          {/* 탭 - 균등 분할 */}
          <div style={{display:"flex",gap:6}}>
            {TABS.map(({k,l,i})=><GhBtn key={k} active={tab===k} onClick={()=>setTab(k)}>{i} {l}</GhBtn>)}
          </div>

          <div style={{animation:"fadeIn 0.3s ease"}}>

            {/* ── 오행 탭 ── */}
            {tab==="chart"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <Card><CardTitle>오행 세력도 및 신강/신약</CardTitle><Pentagon pillars={pillars} dayStem={dayStem}/></Card>
                <Card>
                  <CardTitle style={{marginBottom:10}}>대운 인생 그래프</CardTitle>
                  <LifeGraph daeunList={daeunList} pillars={pillars} dayStem={dayStem} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={setSelDaeun}/>
                  <div style={{marginTop:4,display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#4ade80"}}/><span style={{fontSize:"0.48rem",color:"rgba(220,185,120,0.5)"}}>현재 대운</span>
                  </div>
                </Card>
                <Card>
                  {selDaeun&&(()=>{const grade=calcDaeunGrade(pillars,dayStem,selDaeun.branch);return(
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"7px 10px",borderRadius:10,background:`${grade.color}0e`,border:`1.5px solid ${grade.color}30`}}>
                      <div style={{padding:"2px 8px",borderRadius:7,background:`${grade.color}22`,border:`1.5px solid ${grade.color}55`,flexShrink:0}}>
                        <span style={{fontSize:"0.88rem",fontWeight:900,color:grade.color,fontFamily:"'Noto Serif KR',serif"}}>{grade.grade}</span>
                      </div>
                      <div>
                        <div style={{fontSize:"0.65rem",fontWeight:700,color:grade.color}}>{selDaeun.stem}{selDaeun.branch} 대운 — {grade.label}</div>
                        <div style={{fontSize:"0.55rem",color:"rgba(230,195,130,0.72)",marginTop:1}}>{grade.desc}</div>
                      </div>
                    </div>
                  );})()}
                  <CardTitle style={{marginBottom:8}}>대운 선택</CardTitle>
                  <DaeunPanel daeunList={daeunList} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={setSelDaeun}/>
                </Card>
                <Card>
                  <CardTitle>지장간</CardTitle>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                    {pillars.map((p,i)=>{const fd=EBH[p.branch]||{};const items=[fd.yo,fd.jung,fd.bon].filter(Boolean);return(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:"0.52rem",color:C.muted,marginBottom:5}}>{p.branch}({EB_KR[p.branchIdx]})</div>{items.map(([stem,days],j)=>{const sc=EL_COL[HS_EL[HS.indexOf(stem)]]||C.gold;return(<div key={j} style={{marginBottom:5,padding:"4px 2px",borderRadius:8,background:"rgba(255,255,255,0.05)"}}><span style={{fontSize:"1rem",color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[stem]?900:300}}>{stem}</span><div style={{fontSize:"0.42rem",color:sc,opacity:0.75,fontWeight:700}}>{getSS(dayStem,stem)}</div><div style={{fontSize:"0.38rem",color:C.muted}}>{days}일</div></div>);})}</div>);})}
                  </div>
                </Card>
                <Card>
                  <CardTitle>조후 균형 지수</CardTitle>
                  <JohuGauge johuDetail={johuDetail} pillars={pillars}/>
                </Card>
              </div>
            )}

            {/* ── 물상이미지 탭 ── */}
            {tab==="image"&&(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <PhysImageCard key={`origin-${imgKey}`} title="나의 원국 물상" prompt={buildOriginPrompt(dayStem, pillars[2].branch, form.gender, johuDetail)} dayStem={dayStem} label="origin" note={`일간 ${dayStem}(${HS_EL[pillars[1].stemIdx]}) · 월지 ${pillars[2].branch}(${EB_KR[pillars[2].branchIdx]})`}/>
                <Card>
                  <CardTitle>대운 반영 물상</CardTitle>
                  <p style={{fontSize:"0.63rem",color:C.muted,textAlign:"center",marginBottom:12,lineHeight:1.8}}>대운의 기운이 원국에 스며들 때 일어나는<br/>서사적 전환을 담은 이미지입니다</p>
                  <DaeunPanel daeunList={daeunList} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={d=>{setSelDaeun(d);setImgKey(k=>k+1);}}/>
                  {selDaeun?(
                    <div style={{marginTop:14}}>
                      {(()=>{
                        const grade=calcDaeunGrade(pillars,dayStem,selDaeun.branch);
                        const daeunPoem=buildDaeunHeader(dayStem,selDaeun.branch);
                        return(
                        <div style={{padding:"12px 14px",borderRadius:12,background:`${grade.color}0e`,border:`1.5px solid ${grade.color}35`,marginBottom:12}}>
                          {/* 등급 배지 + 제목 */}
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                            <div style={{flexShrink:0,padding:"3px 10px",borderRadius:8,background:`${grade.color}22`,border:`1.5px solid ${grade.color}55`}}>
                              <span style={{fontSize:"1rem",fontWeight:900,color:grade.color,fontFamily:"'Noto Serif KR',serif",lineHeight:1}}>{grade.grade}</span>
                            </div>
                            <div>
                              <div style={{fontSize:"0.72rem",fontWeight:700,color:grade.color,fontFamily:"'Noto Serif KR',serif"}}>{selDaeun.stem}{selDaeun.branch} 대운 · {grade.label}</div>
                              <div style={{fontSize:"0.56rem",color:"rgba(230,195,130,0.75)",marginTop:1}}>{selDaeun.startAge}세 ({selDaeun.startYear}년~)</div>
                            </div>
                          </div>
                          {/* 등급 해설 */}
                          <div style={{fontSize:"0.63rem",color:"rgba(230,195,130,0.82)",lineHeight:1.7,marginBottom:6}}>{grade.desc}</div>
                          {/* 대운 물상 시(詩) */}
                          {daeunPoem&&<div style={{padding:"6px 10px",background:"rgba(255,255,255,0.04)",borderRadius:8,borderLeft:`3px solid ${grade.color}55`}}>
                            <span style={{fontSize:"0.65rem",color:C.goldL,fontFamily:"'Noto Serif KR',serif",fontStyle:"italic",lineHeight:1.7}}>"{daeunPoem}"</span>
                          </div>}
                        </div>
                        );
                      })()}
                      <PhysImageCard key={`daeun-${imgKey}-${selDaeun.startYear}`} title={`${selDaeun.stem}${selDaeun.branch} 대운 융합 물상`} prompt={buildDaeunFusionPrompt(dayStem,pillars[2].branch,selDaeun.branch,form.gender,johuDetail.tempScore,johuDetail.humScore)} dayStem={dayStem} label="daeun" note={`원국 ${pillars[2].branch} + 대운 ${selDaeun.branch} 서사적 전환`}/>
                    </div>
                  ):(
                    <div style={{marginTop:12,padding:"14px",borderRadius:12,background:"rgba(255,255,255,0.07)",border:"1px dashed rgba(220,185,120,0.35)",textAlign:"center"}}>
                      <p style={{fontSize:"0.65rem",color:C.muted}}>위에서 대운을 선택하면 융합 이미지를 생성할 수 있습니다</p>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* ── 궁합 탭 ── */}
            {tab==="compat"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <Card>
                  <CardTitle>상대방 정보 입력</CardTitle>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <Field label="이름 (선택)"><SI value={form2.name} onChange={e=>setForm2({...form2,name:e.target.value})} placeholder="상대방 이름"/></Field>
                    <Field label="생년월일"><div style={{display:"flex",gap:8}}><SI type="number" placeholder="년도" value={form2.year} onChange={e=>setForm2({...form2,year:e.target.value})} style={{flex:2}}/><SI type="number" placeholder="월" value={form2.month} onChange={e=>setForm2({...form2,month:e.target.value})} style={{flex:1}}/><SI type="number" placeholder="일" value={form2.day} onChange={e=>setForm2({...form2,day:e.target.value})} style={{flex:1}}/></div></Field>
                    <Field label="출생 시각">
                      <div style={{display:"flex",gap:8}}>
                        <SS2 value={form2.hour} onChange={e=>setForm2({...form2,hour:e.target.value})} style={{flex:1}}>{Array.from({length:24},(_,i)=>{const bi=getHB(i,0);const br=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];return <option key={i} value={i}>{i}시 ({br[bi]})</option>;})}  </SS2>
                        <SS2 value={form2.minute} onChange={e=>setForm2({...form2,minute:e.target.value})} style={{flex:1}}>{[0,10,20,30,40,50].map(m=><option key={m} value={m}>{String(m).padStart(2,"0")}분</option>)}</SS2>
                      </div>
                    </Field>
                    <Field label="성별"><div style={{display:"flex",gap:8}}><GenderBtn v="male" l="남성 ♂" form={form2} setForm={setForm2}/><GenderBtn v="female" l="여성 ♀" form={form2} setForm={setForm2}/></div></Field>
                    <GoldBtn onClick={handleCompat} style={{width:"100%",marginTop:4}}>♡ 궁합 분석하기</GoldBtn>
                    {compatErr&&<p style={{color:"#ff6a50",fontSize:"0.68rem",textAlign:"center"}}>{compatErr}</p>}
                  </div>
                </Card>
                {saju2&&<Card style={{padding:"0.9rem 0.3rem"}}><CardTitle style={{marginBottom:8}}>{form2.name||"상대방"} 사주</CardTitle><SajuChart pillars={saju2.pillars} dayStem={saju2.dayStem} compact/></Card>}
                {compat&&saju2&&<CompatResult compat={compat} s1={saju} s2={saju2} name1={form.name||"나"} name2={form2.name||"상대방"}/>}
              </div>
            )}
          </div>

          <button onClick={()=>{setSaju(null);setSaju2(null);setCompat(null);setScreen("input");}} style={{marginTop:10,padding:14,borderRadius:12,background:"rgba(255,255,255,0.09)",color:"rgba(230,190,120,0.70)",border:"1px solid rgba(210,175,100,0.15)",cursor:"pointer",fontSize:"0.78rem"}}>↺ 처음으로</button>
        </div>
      </div>
    );
  }
  return null;
}
