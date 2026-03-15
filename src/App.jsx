import { useState } from "react";

const C={gold:"#d4ae6e",goldL:"#f2dea8",goldD:"#a07820",bg:"#1a1108",card:"#261a0c",text:"#f7edd5",muted:"rgba(230,190,120,0.72)",water:"#4da0f0",wood:"#3fc060",fire:"#f55030",earth:"#d8a818",metal:"#b8a078",red:"#f06050"};
const EL_COL={"水":C.water,"木":C.wood,"火":C.fire,"土":C.earth,"金":C.metal};
// 사진 스타일 색상 팔레트 (밝은 둥근 버튼용)
const PILL_BG={木:"#3fc060",火:"#f55030",土:"#d8a818",金:"#b8a078",水:"#4da0f0"};

const globalStyle=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;700;900&family=Noto+Sans+KR:wght@300;400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  input,select,button{font-family:'Noto Sans KR',sans-serif;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  ::-webkit-scrollbar{height:3px;width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.3);border-radius:99px;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  input[type=number]{-moz-appearance:textfield;}
`;

let _lunarReady=false,_lunarCallbacks=[];
function ensureLunar(cb){if(_lunarReady){cb();return;}_lunarCallbacks.push(cb);if(document.querySelector('script[data-lunar]'))return;const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js';s.setAttribute('data-lunar','1');s.onload=()=>{_lunarReady=true;_lunarCallbacks.forEach(f=>f());_lunarCallbacks=[];};document.head.appendChild(s);}

function getJD(y,m,d){const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
function jdToDate(jd){const L=jd+68569,N=Math.floor(4*L/146097),L2=L-Math.floor((146097*N+3)/4),I=Math.floor(4000*(L2+1)/1461001),L3=L2-Math.floor(1461*I/4)+31,J=Math.floor(80*L3/2447),day=L3-Math.floor(2447*J/80),L4=Math.floor(J/11),month=J+2-12*L4,year=100*(N-49)+I+L4;return{year,month,day};}
function sunLon(jd){const T=(jd-2451545)/36525,L0=280.46646+36000.76983*T+0.0003032*T*T,M=((357.52911+35999.05029*T-0.0001537*T*T)*Math.PI)/180,CC=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);return((L0+CC)%360+360)%360;}
function findTermJD(year,lon){const base=getJD(year,1,1),approx=base+((lon-sunLon(base)+360)%360)/360*365.25;let j1=approx-15,j2=approx+15;for(let i=0;i<60;i++){const mid=(j1+j2)/2;let d=lon-sunLon(mid);if(d>180)d-=360;if(d<-180)d+=360;if(Math.abs(d)<0.00005)break;if(d>0)j1=mid;else j2=mid;}return(j1+j2)/2;}
const tCache={};
function getTerms(year){if(tCache[year])return tCache[year];const T=[{n:"입춘",l:315},{n:"경칩",l:345},{n:"청명",l:15},{n:"입하",l:45},{n:"망종",l:75},{n:"소서",l:105},{n:"입추",l:135},{n:"백로",l:165},{n:"한로",l:195},{n:"입동",l:225},{n:"대설",l:255},{n:"소한",l:285}];const r={};for(const t of T){const jd=findTermJD(year,t.l),d=jdToDate(jd+9/24);r[t.n]={month:d.month,day:d.day,jd};}tCache[year]=r;return r;}
function calcNewMoonKST(k){const T=k/1236.85;let JDE=2451550.09766+29.530588861*k+0.00015437*T*T-0.000000150*T*T*T+0.00000000073*T*T*T*T;const M=(2.5534+29.10535670*k-0.0000014*T*T-0.00000011*T*T*T)*Math.PI/180,Mp=(201.5643+385.81693528*k+0.0107582*T*T+0.00001238*T*T*T-0.000000058*T*T*T*T)*Math.PI/180,F=(160.7108+390.67050284*k-0.0016118*T*T-0.00000227*T*T*T+0.000000011*T*T*T*T)*Math.PI/180,Om=(124.7746-1.56375588*k+0.0020672*T*T+0.00000215*T*T*T)*Math.PI/180;JDE+=-0.40720*Math.sin(Mp)+0.17241*Math.sin(M)+0.01608*Math.sin(2*Mp)+0.01039*Math.sin(2*F)+0.00739*Math.sin(Mp-M)-0.00514*Math.sin(Mp+M)+0.00208*Math.sin(2*M)-0.00111*Math.sin(Mp-2*F)-0.00057*Math.sin(Mp+2*F)+0.00056*Math.sin(2*Mp+M)-0.00042*Math.sin(3*Mp)+0.00042*Math.sin(M+2*F)+0.00038*Math.sin(M-2*F)-0.00024*Math.sin(2*Mp-M)-0.00017*Math.sin(Om)-0.00007*Math.sin(Mp+2*M);return Math.floor(JDE+9/24+0.5);}

const NY={1900:[1,31],1901:[2,19],1902:[2,8],1903:[1,29],1904:[2,16],1905:[2,4],1906:[1,25],1907:[2,13],1908:[2,2],1909:[1,22],1910:[2,10],1911:[1,30],1912:[2,18],1913:[2,6],1914:[1,26],1915:[2,14],1916:[2,3],1917:[1,23],1918:[2,11],1919:[2,1],1920:[2,20],1921:[2,8],1922:[1,28],1923:[2,16],1924:[2,5],1925:[1,24],1926:[2,13],1927:[2,2],1928:[1,23],1929:[2,10],1930:[1,30],1931:[2,17],1932:[2,6],1933:[1,26],1934:[2,14],1935:[2,4],1936:[1,24],1937:[2,11],1938:[1,31],1939:[2,19],1940:[2,8],1941:[1,27],1942:[2,15],1943:[2,5],1944:[1,25],1945:[2,13],1946:[2,2],1947:[1,22],1948:[2,10],1949:[1,29],1950:[2,17],1951:[2,6],1952:[1,27],1953:[2,14],1954:[2,3],1955:[1,24],1956:[2,12],1957:[1,31],1958:[2,18],1959:[2,8],1960:[1,28],1961:[2,15],1962:[2,5],1963:[1,25],1964:[2,13],1965:[2,2],1966:[1,21],1967:[2,9],1968:[1,30],1969:[2,17],1970:[2,6],1971:[1,27],1972:[2,15],1973:[2,3],1974:[1,23],1975:[2,11],1976:[1,31],1977:[2,18],1978:[2,7],1979:[1,28],1980:[2,16],1981:[2,5],1982:[1,25],1983:[2,13],1984:[2,2],1985:[2,20],1986:[2,9],1987:[1,29],1988:[2,17],1989:[2,6],1990:[1,27],1991:[2,15],1992:[2,4],1993:[1,23],1994:[2,10],1995:[1,31],1996:[2,19],1997:[2,7],1998:[1,28],1999:[2,16],2000:[2,5],2001:[1,24],2002:[2,12],2003:[2,1],2004:[1,22],2005:[2,9],2006:[1,29],2007:[2,18],2008:[2,7],2009:[1,26],2010:[2,14],2011:[2,3],2012:[1,23],2013:[2,10],2014:[1,31],2015:[2,19],2016:[2,8],2017:[1,28],2018:[2,16],2019:[2,5],2020:[1,25],2021:[2,12],2022:[2,1],2023:[1,22],2024:[2,10],2025:[1,29],2026:[2,17],2027:[2,6],2028:[1,26],2029:[2,13],2030:[2,3],2031:[1,23]};
const LEAP_MONTH={1900:8,1902:5,1905:4,1907:9,1910:6,1913:5,1916:4,1919:2,1921:7,1924:5,1927:6,1930:5,1933:4,1936:3,1938:7,1941:6,1944:4,1947:2,1949:7,1952:5,1955:3,1957:8,1960:6,1963:4,1966:3,1968:7,1971:5,1972:4,1975:8,1977:8,1980:5,1982:4,1984:10,1987:6,1989:5,1990:5,1993:3,1995:8,1998:5,2001:4,2004:2,2006:7,2009:5,2012:3,2014:9,2017:6,2020:4,2023:2,2025:6,2028:5,2031:3};
const lyCache={};
function buildLunarYear(y){if(lyCache[y])return lyCache[y];const ny=NY[y],nyN=NY[y+1];if(!ny||!nyN)return null;const startJD=getJD(y,ny[0],ny[1]),endJD=getJD(y+1,nyN[0],nyN[1]),k0=Math.round((y+1/24-2000)*12.3685);let bestK=k0,bestDiff=999;for(let dk=-3;dk<=3;dk++){const jd=calcNewMoonKST(k0+dk),diff=Math.abs(jd-startJD);if(diff<bestDiff){bestDiff=diff;bestK=k0+dk;}}const months=[startJD];let k=bestK+1;while(true){const jd=calcNewMoonKST(k);if(jd>=endJD)break;if(jd>startJD)months.push(jd);k++;if(k>bestK+20)break;}const leapM=LEAP_MONTH[y]||0,result={startJD,endJD,months,leapM};lyCache[y]=result;return result;}
function solarToLunar(sy,sm,sd){const targetJD=getJD(sy,sm,sd);for(let y=1900;y<=2030;y++){const ny=NY[y],nyN=NY[y+1];if(!ny||!nyN)break;const startJD=getJD(y,ny[0],ny[1]),endJD=getJD(y+1,nyN[0],nyN[1]);if(targetJD<startJD||targetJD>=endJD)continue;const yr=buildLunarYear(y);if(!yr)continue;const{months,leapM}=yr,total=months.length;let mi=-1;for(let i=0;i<total;i++){const ns=i+1<total?months[i+1]:endJD;if(targetJD>=months[i]&&targetJD<ns){mi=i;break;}}if(mi<0)continue;const day=targetJD-months[mi]+1;let lm,isLeap=false;if(total===13&&leapM>0){if(mi<leapM)lm=mi+1;else if(mi===leapM){lm=leapM;isLeap=true;}else lm=mi;}else lm=mi+1;return{year:y,month:lm,day,isLeap};}return{year:1900,month:1,day:1,isLeap:false};}

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

function validateDate(y,m,d){const year=+y,month=+m,day=+d;if(!y||!m||!d)return "생년월일을 모두 입력해주세요.";if(isNaN(year)||year<1900||year>2030)return "연도는 1900~2030 사이로 입력해주세요.";if(isNaN(month)||month<1||month>12)return "월은 1~12 사이로 입력해주세요.";const dm=[0,31,28,31,30,31,30,31,31,30,31,30,31];if((year%4===0&&year%100!==0)||(year%400===0))dm[2]=29;if(isNaN(day)||day<1||day>dm[month])return `${month}월은 최대 ${dm[month]}일까지 입력 가능합니다.`;return null;}
function validateTime(h,min){if(isNaN(+h)||+h<0||+h>23)return "시간은 0~23 사이로 입력해주세요.";if(isNaN(+min)||+min<0||+min>59)return "분은 0~59 사이로 입력해주세요.";return null;}
function getMaxDay(y,m){const dm=[0,31,28,31,30,31,30,31,31,30,31,30,31];if((y%4===0&&y%100!==0)||(y%400===0))dm[2]=29;return dm[m]||28;}

function calcStrengthDetail(pillars){
  const ds=pillars[1].stem,mb=pillars[2].branch,dayEl=HS_EL[HS.indexOf(ds)],mbEl=EB_EL[EB.indexOf(mb)];
  const GEN={"木":"水","火":"木","土":"火","金":"土","水":"金"},genEl=GEN[dayEl];
  let elementScores={"木":0,"火":0,"土":0,"金":0,"水":0},myScore=0;
  const isDeukRyeong=(mbEl===dayEl||mbEl===genEl),stemW=[0.6,0,1.2,0.6],branchW=[0.6,1.2,3.0,0.6];
  function addScore(el,score){elementScores[el]+=score;if(el===dayEl||el===genEl)myScore+=score;}
  pillars.forEach((p,i)=>{if(i!==1)addScore(HS_EL[p.stemIdx],stemW[i]);addScore(EB_EL[p.branchIdx],branchW[i]);const hidden=EBH[p.branch];if(hidden)Object.values(hidden).forEach(hs=>{if(!hs)return;addScore(HS_EL[HS.indexOf(hs[0])],branchW[i]*(hs[1]/30)*((p.branch===mb)?1.2:1.0));});});
  if(isDeukRyeong)myScore*=1.2;else myScore*=0.9;
  const threshold=isDeukRyeong?5.0:6.0;
  // 5단계 세분화
  let strength;
  if(myScore>=threshold+3)      strength="극신강";
  else if(myScore>=threshold)   strength="신강";
  else if(myScore>threshold-2.0)strength="중화";
  else if(myScore>threshold-4.5)strength="신약";
  else                           strength="극신약";
  return{strength,myScore,elementScores,isDeukRyeong};
}
function calcStrength(pillars){return calcStrengthDetail(pillars).strength;}
// 신강/신약 색상 (5단계)
function strengthColor5(s){
  if(s==="극신강")return"#ff4444";
  if(s==="신강")  return C.fire;
  if(s==="중화")  return C.gold;
  if(s==="신약")  return C.water;
  return"#8040ff"; // 극신약
}

// 한국 만세력 시지 경계 (23:30 기준)
// 子(23:30~01:29), 丑(01:30~03:29), 寅(03:30~05:29), 卯(05:30~07:29)
// 辰(07:30~09:29), 巳(09:30~11:29), 午(11:30~13:29), 未(13:30~15:29)
// 申(15:30~17:29), 酉(17:30~19:29), 戌(19:30~21:29), 亥(21:30~23:29)
// 분 단위: 子=90(01:30), 丑=210(03:30), ... 亥=1410(23:30)
// getHB: 입력 시각(분)이 어느 시지인지 반환
function getHB(hour,minute=0){
  const t=hour*60+minute;
  // 23:30(1410분) 이후 또는 01:30(90분) 미만 → 子시(0)
  if(t>=1410||t<90) return 0;
  // 01:30~03:29 → 丑(1), 03:30~05:29 → 寅(2), ...
  return Math.floor((t-90)/120)+1;
}
function getYP(y,m,d){const cb=findTermJD(y,315)+9/24,jd=getJD(y,m,d)+0.5,sy=jd<cb?y-1:y,s=((sy-4)%10+10)%10,b=((sy-4)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getDP(y,m,d){const jd=getJD(y,m,d),s=((jd+9)%10+10)%10,b=((jd+1)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getMP(y,m,d){const dJD=getJD(y,m,d)+0.5,MT=[{l:315,b:2},{l:345,b:3},{l:15,b:4},{l:45,b:5},{l:75,b:6},{l:105,b:7},{l:135,b:8},{l:165,b:9},{l:195,b:10},{l:225,b:11},{l:255,b:0},{l:285,b:1}];let branchIdx=1,bestJD=-Infinity;for(let yr=y-1;yr<=y+1;yr++)for(const t of MT){const tj=findTermJD(yr,t.l)+9/24;if(tj<=dJD&&tj>bestJD){bestJD=tj;branchIdx=t.b;}}const cb=findTermJD(y,315)+9/24,sajuY=dJD<cb?y-1:y,ySI=((sajuY-4)%10+10)%10,yinStem=[2,4,6,8,0][ySI%5],stemIdx=(yinStem+((branchIdx-2+12)%12))%10;return{stem:HS[stemIdx],branch:EB[branchIdx],stemIdx,branchIdx};}
function getHP(ds,hour,minute=0){const bi=getHB(hour,minute),startMap={0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8},s=(startMap[ds]+bi)%10;return{stem:HS[s],branch:EB[bi],stemIdx:s,branchIdx:bi};}

function calcSaju(y,m,d,hour,minute=0){
  try{if(typeof window!=="undefined"&&window.Solar&&window.EightChar){const solar=window.Solar.fromYmd(y,m,d),lunar=solar.getLunar(),ec=lunar.getEightChar(),dayStr=ec.getDay(),monthStr=ec.getMonth(),yearStr=ec.getYear(),dsi=HS.indexOf(dayStr[0]),hb=getHB(hour,minute),sm={0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8};function pp(s,label){const si=HS.indexOf(s[0]),bi=EB.indexOf(s[1]);return{stem:s[0],branch:s[1],stemIdx:si,branchIdx:bi,label};}const hStem=HS[(sm[dsi]+hb)%10],hBranch=EB[hb];const pillars=[pp(hStem+hBranch,"시"),pp(dayStr,"일"),pp(monthStr,"월"),pp(yearStr,"년")];return{pillars,dayStem:dayStr[0],solar:{year:y,month:m,day:d,hour,minute},lunar:{year:lunar.getYear(),month:lunar.getMonth(),day:lunar.getDay(),isLeap:lunar.isLeap()}};}}catch(e){}
  const lunar=solarToLunar(y,m,d),yp=getYP(y,m,d),mp=getMP(y,m,d),dp=getDP(y,m,d),hp=getHP(dp.stemIdx,hour,minute);
  return{pillars:[{label:"시",...hp},{label:"일",...dp},{label:"월",...mp},{label:"년",...yp}],dayStem:dp.stem,solar:{year:y,month:m,day:d,hour,minute},lunar};
}

function calcDaeun(by,bm,bd,gender,mp){
  const yp=getYP(by,bm,bd),isYang=yp.stemIdx%2===0,fwd=(isYang&&gender==="male")||(!isYang&&gender==="female");
  const T=getTerms(by),FT=["경칩","청명","입하","망종","소서","입추","백로","한로","입동","대설","소한","입춘"],BT=["입춘","소한","대설","입동","한로","백로","입추","소서","망종","입하","청명","경칩"];
  const tl=fwd?FT:BT,bjd=getJD(by,bm,bd);let near=365;
  for(const tn of tl){const td=T[tn];if(!td)continue;const df=fwd?td.jd-bjd:bjd-td.jd;if(df>0&&df<near)near=df;}
  const sa=Math.round(near/3);
  return Array.from({length:8},(_,i)=>{const off=fwd?i+1:-(i+1),si=((mp.stemIdx+off)%10+10)%10,bi=((mp.branchIdx+off)%12+12)%12,age=sa+i*10;return{stem:HS[si],branch:EB[bi],stemIdx:si,branchIdx:bi,startAge:age,startYear:by+age};})
  .filter(d=>d.startAge<=100); // 100세 초과 대운 제거
}
function calcSeun(year){const s=((year-4)%10+10)%10,b=((year-4)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b,year};}

// ============================================================
// 12운성 (포태법)
// ============================================================
// 12운성 (포태법 조견표 — 이미지 원본 기준)
// 地支 순서: 子0 丑1 寅2 卯3 辰4 巳5 午6 未7 申8 酉9 戌10 亥11
// 열 순서: 甲 乙 丙/戊 丁/己 庚 辛 壬 癸
// ============================================================
const UNSUNG_TABLE = {
  //        子     丑     寅     卯     辰     巳     午     未     申     酉     戌     亥
  甲: ["목욕","관대","건록","제왕","쇠  ","병  ","사  ","묘  ","절  ","태  ","양  ","장생"],
  乙: ["병  ","쇠  ","제왕","건록","관대","목욕","장생","양  ","태  ","절  ","묘  ","사  "],
  丙: ["태  ","양  ","장생","목욕","관대","건록","제왕","쇠  ","병  ","사  ","묘  ","절  "],
  丁: ["절  ","묘  ","사  ","병  ","쇠  ","제왕","건록","관대","목욕","장생","양  ","태  "],
  戊: ["태  ","양  ","장생","목욕","관대","건록","제왕","쇠  ","병  ","사  ","묘  ","절  "],
  己: ["절  ","묘  ","사  ","병  ","쇠  ","제왕","건록","관대","목욕","장생","양  ","태  "],
  庚: ["사  ","묘  ","절  ","태  ","양  ","장생","목욕","관대","건록","제왕","쇠  ","병  "],
  辛: ["장생","양  ","태  ","절  ","묘  ","사  ","병  ","쇠  ","제왕","건록","관대","목욕"],
  壬: ["제왕","쇠  ","병  ","사  ","묘  ","절  ","태  ","양  ","장생","목욕","관대","건록"],
  癸: ["건록","관대","목욕","장생","양  ","태  ","절  ","묘  ","사  ","병  ","쇠  ","제왕"],
};
function getUnsung(stem, branch){
  const row = UNSUNG_TABLE[stem];
  if(!row) return "";
  const bi = EB.indexOf(branch);
  if(bi < 0) return "";
  return (row[bi]||"").trim();
}

// ============================================================
// TCPA 조후 정밀 산출 엔진
// ============================================================
// 간지별 조후 기본값 V (온도 기준, -5 ~ +5)
const TCPA_V_STEM={甲:1,乙:1,丙:5,丁:3,戊:5,己:0,庚:-2,辛:-2,壬:-4,癸:-4};
const TCPA_V_BRANCH={子:-4,丑:-4,寅:1,卯:1,辰:0,巳:5,午:5,未:3,申:-2,酉:-2,戌:1,亥:-4};

// 원국 위치별 가중치
// pillars 순서: [시주0, 일주1, 월주2, 년주3]
// 시간=0.025, 시지=0.025, 일간=0, 일지=0.2, 월간=0.15, 월지=0.4, 년간=0.025, 년지=0.05
const TCPA_W_STEM=[0.025, 0, 0.15, 0.025];   // [시간, 일간, 월간, 년간]
const TCPA_W_BRANCH=[0.025, 0.2, 0.4, 0.05]; // [시지, 일지, 월지, 년지]

function calcTCPA(pillars, daeunStem=null, daeunBranch=null, seunStem=null, seunBranch=null){
  // Step1: 원국 기본 점수
  let sBase = 0;
  pillars.forEach((p,i)=>{
    sBase += (TCPA_V_STEM[p.stem]||0) * TCPA_W_STEM[i];
    sBase += (TCPA_V_BRANCH[p.branch]||0) * TCPA_W_BRANCH[i];
  });

  // Step2: 운 점수
  let sLuck = 0, sYear = 0;
  if(daeunStem) sLuck += (TCPA_V_STEM[daeunStem]||0) * 0.5;
  if(daeunBranch) sLuck += (TCPA_V_BRANCH[daeunBranch]||0) * 1.5;
  if(seunStem) sYear += (TCPA_V_STEM[seunStem]||0) * 0.3;
  if(seunBranch) sYear += (TCPA_V_BRANCH[seunBranch]||0) * 0.7;

  // Step3: 합산
  let sTotal = sBase + sLuck + sYear;

  // Step4 예외처리: 조후 해결사 없으면 1.2배
  const mb = pillars[2].branch;
  const coldMonths=["亥","子","丑"], hotMonths=["巳","午","未"];
  const allStems=pillars.map(p=>p.stem), allBranches=pillars.map(p=>p.branch);
  const hasFireResolver = hotMonths.includes(mb)
    ? allStems.concat(allBranches).some(k=>TCPA_V_STEM[k]<=-2||TCPA_V_BRANCH[k]<=-2)
    : true;
  const hasColdResolver = coldMonths.includes(mb)
    ? allStems.concat(allBranches).some(k=>TCPA_V_STEM[k]>=3||TCPA_V_BRANCH[k]>=3)
    : true;
  if(!hasFireResolver||!hasColdResolver) sTotal *= 1.2;

  // 합(合) 보정: 방합/삼합으로 火 또는 水 형성 시 ±50%
  const withRun=[...allBranches,daeunBranch,seunBranch].filter(Boolean);
  const fireHap=[["寅","午","戌"],["巳","午","未"]],waterHap=[["申","子","辰"],["亥","子","丑"]];
  if(fireHap.some(g=>g.every(b=>withRun.includes(b)))) sTotal *= 1.5;
  if(waterHap.some(g=>g.every(b=>withRun.includes(b)))) sTotal *= 1.5;

  // 결과 정규화 및 레이블
  sTotal = Math.round(sTotal * 100) / 100;
  sBase = Math.round(sBase * 100) / 100;

  return {sBase, sLuck:Math.round(sLuck*100)/100, sYear:Math.round(sYear*100)/100, sTotal};
}

function tcpaLabel(s){
  if(s>=14)  return{label:"심각한 과열",sublabel:"Red Alert",color:"#ff2020",emoji:"🌋"};
  if(s>=8)   return{label:"위험 과열",sublabel:"과열 경보",color:"#f55030",emoji:"🔥"};
  if(s>=4)   return{label:"조열함",sublabel:"열기 주의",color:"#fb923c",emoji:"☀️"};
  if(s>=1.5) return{label:"약한 온기",sublabel:"양호",color:"#f5c842",emoji:"🌤"};
  if(s>=-1.5)return{label:"균형",sublabel:"최적",color:"#4ade80",emoji:"🌿"};
  if(s>=-4)  return{label:"약한 한기",sublabel:"냉량",color:"#86efac",emoji:"🍃"};
  if(s>=-8)  return{label:"한냉함",sublabel:"한기 주의",color:"#4da0f0",emoji:"❄️"};
  if(s>=-14) return{label:"위험 한랭",sublabel:"한기 경보",color:"#2080ff",emoji:"🧊"};
  return{label:"심각한 한랭",sublabel:"Freeze Alert",color:"#8040ff",emoji:"☃️"};
}

// (tcpaMentalState, tcpaHealth, tcpaSolution, tcpaAdvice 제거 → getJohuMessages로 통합)

// ============================================================
// 조후점수 10단계 메시지 시스템 (업무/재정/관계/건강)
// ============================================================
function getJohuMessages(s){
  // Lv.5 극열 (+15 이상)
  if(s>=15) return {
    work:"지금 벌이는 일은 열정이 아니라 폭주입니다. 판단력이 완전히 마비되었으니, 모든 결정권과 카드를 신뢰할 수 있는 타인에게 넘기세요.",
    finance:"'영끌'과 '몰빵'의 유혹이 극에 달합니다. 지금 하는 투자는 도박입니다. HTS나 코인 앱을 당장 삭제하세요.",
    relation:"숨 쉬듯 주변에 상처를 줍니다. 본인은 팩트라고 쏘아붙이지만 상대는 폭력으로 느낍니다. 묵언 수행이 유일한 답입니다.",
    health:"체내 수분(진액)이 완전히 말라붙은 상태입니다. 심장에 무리가 가고 만성 불면증과 탈모가 급증하는 위험 신호입니다. 땀을 빼는 사우나나 격렬한 운동은 독입니다. 미지근한 물을 의식적으로 마시고 무조건 수면 시간을 늘려 뇌를 식혀야 합니다."
  };
  // Lv.4 강열 (+10~+14.9)
  if(s>=10) return {
    work:"조급증이 심해져 결과가 바로 안 나오면 다 뒤엎어버리려 합니다. 7할이 완성된 밥통을 열어버리는 실수를 주의하세요.",
    finance:"스트레스성 홧김 비용이 폭발합니다. 밤 10시 이후 온라인 쇼핑몰 결제는 무조건 24시간 장바구니에 묵혀두세요.",
    relation:"남의 속도가 답답해 미칠 지경입니다. 내 기준을 남에게 강요하다 고립될 수 있으니, 의식적으로 대답을 3초 늦게 하세요.",
    health:"화(火) 기운이 폐와 피부를 직격합니다. 마른기침, 안구건조증, 피부 트러블이 심해집니다. 커피와 술은 불에 기름을 붓는 격이니 끊고, 배·도라지·오미자차를 곁에 두세요."
  };
  // Lv.3 열 (+6~+9.9)
  if(s>=6) return {
    work:"일의 진척은 빠르지만 디테일이 엉망입니다. 메일을 보내거나 결재를 올리기 전 오탈자와 숫자를 두 번 확인하세요.",
    finance:"리스크 테이킹을 즐기기 시작합니다. '이 정도면 괜찮겠지' 하는 안일한 배팅이 손실을 부릅니다. 현금 비중을 늘리세요.",
    relation:"말이 많아지고 과장법이 심해집니다. 지키지 못할 호언장담을 남발하지 말고 스케줄러부터 확인하세요.",
    health:"속에 열이 차서 끊임없이 얼음물과 매운 음식을 찾게 됩니다. 위장 열이 쌓이면 가짜 식욕이 폭발하고 변비가 찾아옵니다. 차가운 음료 대신 상온의 물을 자주 마시고 양배추나 알로에를 섭취하세요."
  };
  // Lv.2 온기 (+2.5~+5.9)
  if(s>=2.5) return {
    work:"에너지가 적절히 상승 중입니다. 미뤄뒀던 굵직한 태스크를 빠르게 치고 나가기 좋은 타이밍입니다.",
    finance:"나를 위한 '소소한 사치'가 잦아집니다. 커피값, 택시비 등 가랑비에 옷 젖는 지출을 가계부로 점검하세요.",
    relation:"자신감이 넘쳐 매력이 어필되는 시기입니다. 긍정적인 에너지를 발산하되, 선을 넘는 농담만 주의하세요.",
    health:"상체와 머리로 열이 살짝 뜨는 상태로 두통이나 뒷목 뭉침이 잦아집니다. 가벼운 하체 운동과 반신욕으로 위로 뜬 열을 아래로 끌어내리세요."
  };
  // Lv.1 미온 (0~+2.4)
  if(s>=0) return {
    work:"추진력과 이성적 판단이 완벽한 밸런스를 이룹니다. 기획안 작성부터 실행까지 걸림돌이 없는 최상의 컨디션입니다.",
    finance:"수입과 지출의 통제가 완벽합니다. 무리하지 말고 지금의 자산 포트폴리오를 우직하게 밀고 나가세요.",
    relation:"오해 없이 내 뜻을 전달할 수 있습니다. 연봉 협상이나 중요한 계약, 껄끄러운 대화를 시도하기 가장 좋은 날입니다.",
    health:"기혈 순환이 가장 원활한 이상적인 체온입니다. 신진대사와 면역력이 최고조이니 현재의 식단과 수면 패턴을 유지하세요. 가벼운 유산소 운동이 활력을 더해줍니다."
  };
  // Lv.-1 미냉 (0~-2.4)
  if(s>=-2.5) return {
    work:"실행력보다는 분석력이 빛을 발합니다. 데이터를 다루거나 전략을 기획하는 등 책상 앞 업무 효율이 최고치입니다.",
    finance:"지갑이 쉽게 열리지 않습니다. 모아둔 시드머니를 어디에 굴릴지 차분하게 투자처를 분석하기 좋은 시기입니다.",
    relation:"다소 건조해 보일 수 있지만 신뢰감을 줍니다. 감정보다는 논리로 상대를 설득해야 할 때 유리합니다.",
    health:"체열이 살짝 내려가 차분함을 유지하기 좋은 상태입니다. 오래 앉아있으면 소화기관이 둔해질 수 있으니 식후 15분 가볍게 걷는 산책이 좋습니다."
  };
  // Lv.-2 냉 (-2.5~-5.9)
  if(s>=-6) return {
    work:"생각이 꼬리를 물어 결정을 유보합니다. 자료 조사만 하다 하루가 갑니다. 데드라인을 짧게 잡고 일단 60%짜리 초안이라도 던지세요.",
    finance:"원금 손실이 두려워 좋은 기회도 흘려보냅니다. 커피 한 잔 값의 소액으로라도 감각을 유지하는 실전 연습이 필요합니다.",
    relation:"연락해야 할 사람에게 '나중에 하지 뭐'라며 미루고 있습니다. 먼저 다가가지 않으면 좋은 기회는 남에게 넘어갑니다.",
    health:"찬 기운이 위장으로 스며들어 소화 효소 분비가 떨어집니다. 밀가루나 차가운 샐러드는 소화 불량의 주범입니다. 생강차나 따뜻한 국물 요리로 속을 덥히세요."
  };
  // Lv.-3 한냉 (-6~-9.9)
  if(s>=-10) return {
    work:"실패에 대한 두려움으로 수비적인 태도만 취합니다. 새로운 제안을 일단 거절부터 하고 보는 습관을 당장 고치세요.",
    finance:"돈을 꽉 쥐고만 있어 자금의 흐름이 막힙니다. 나를 위한 교육이나 책 구매 등 생산적인 곳에는 의식적으로 돈을 쓰세요.",
    relation:"서운한 게 있어도 입을 닫고 혼자 속앓이를 합니다. 상대방은 독심술사가 아닙니다. 서운함을 구체적인 단어로 뱉어내세요.",
    health:"한습(寒濕)이 뼈와 근육에 스며들어 관절 마디마디가 쑤시고 아침에 몸이 붓습니다. 샤워 후 족욕을 하거나 핫팩으로 아랫배를 따뜻하게 유지해 체내 양기를 보호하세요."
  };
  // Lv.-4 극한 (-10~-14.9)
  if(s>=-15) return {
    work:"무기력증이 찾아와 루틴이 무너집니다. 거창한 목표는 버리세요. 오늘은 출근해서 메일함만 비워내도 100점입니다.",
    finance:"경제 관념 자체가 희미해집니다. 중요한 고지서 납부를 놓치거나 만기된 적금을 방치할 수 있습니다. 금융 캘린더를 켜세요.",
    relation:"자발적 아웃사이더 모드입니다. 사람 만나는 게 끔찍하겠지만 점심시간에라도 햇볕을 쬐며 혼자 걷는 물리적 환기가 절실합니다.",
    health:"생명력의 뿌리인 신장의 온기가 얼어붙었습니다. 극심한 수족냉증과 만성 피로, 허리 통증이 나타납니다. 찬물 샤워나 수영은 절대 피하고, 부추·마늘·쑥 등 몸에 열을 내는 식단이 필수입니다."
  };
  // Lv.-5 빙결 (-15 이하)
  return {
    work:"어떤 동기부여 명언도 타격감이 없습니다. 뇌가 겨울잠에 들어갔습니다. 이럴 땐 생각 자체를 끄고 기계처럼 단순 반복 업무만 하세요.",
    finance:"모든 자산이 동결된 느낌입니다. 당장 현금화할 수 없는 곳에 돈이 묶이지 않도록 유동성 확보에만 사활을 거세요.",
    relation:"타인과의 소통 스위치가 완전히 꺼졌습니다. 억지로 웃으려 하지 말고 신뢰할 수 있는 단 한 사람에게만 생존 신고를 해두세요.",
    health:"체내 불씨가 완전히 꺼진 상태입니다. 신체적 무기력이 우울증으로 직결됩니다. 어떤 영양제나 약보다 무조건 낮 시간에 햇볕을 쬐며 걷는 일광욕이 뇌와 몸을 깨우는 유일한 생명줄입니다."
  };
}
// calcJohuDetail — TCPA 기반 경량 래퍼 (물상이미지/UI 호환용)
function calcJohuDetail(pillars, daeunBranch=null){
  const daeunStem=null; // 천간 없이 지지만
  const r=calcTCPA(pillars,daeunStem,daeunBranch);
  const s=r.sTotal;
  // TCPA → 0~100 스케일 변환 (0점=+20, 100점=-20, 50점=0)
  const tempScore=Math.max(0,Math.min(100,Math.round(50-s*2.5)));
  const humScore=Math.max(0,Math.min(100,Math.round(50-s*1.5)));
  const need=s<=-6?["火"]:s>=6?["水"]:[];
  const avoid=s<=-6?["水"]:s>=6?["火"]:[];
  return{tempScore,humScore,totalScore:Math.round((tempScore+humScore)/2),need,avoid,elScore:{},total:1};
}
function johuLabel(s){if(s>=80)return{label:"최적",color:"#4ade80"};if(s>=65)return{label:"양호",color:"#86efac"};if(s>=50)return{label:"보통",color:C.gold};if(s>=35)return{label:"불균형",color:"#fb923c"};return{label:"편중",color:C.red};}
function calcElementCount(pillars){const cnt={水:0,木:0,火:0,土:0,金:0};pillars.forEach(p=>{cnt[HS_EL[p.stemIdx]]=(cnt[HS_EL[p.stemIdx]]||0)+1.5;cnt[EB_EL[p.branchIdx]]=(cnt[EB_EL[p.branchIdx]]||0)+1;});return cnt;}

const BRANCH_DESC={子:"만물이 잠든 고요한 한겨울 밤",丑:"차고 척박한 한겨울의 언 땅",寅:"아직 어둠이 걷히지 않은 이른 봄새벽",卯:"꽃잎이 흩날리는 화사한 봄날",辰:"봄비가 촉촉이 내리는 무르익은 봄날",巳:"뜨거운 열기가 피어오르는 초여름",午:"태양이 작열하는 한여름 대낮",未:"모든 것이 무르익은 늦여름의 황혼",申:"청명한 하늘 아래 서늘한 초가을",酉:"결실의 향기 가득한 풍요로운 가을",戌:"낙엽이 지는 쓸쓸한 늦가을",亥:"찬 겨울비가 내리는 초겨울의 밤"};
const STEM_SHORT={甲:"우뚝 솟은 큰 나무",乙:"타고 오르는 덩굴",丙:"환하게 비추는 태양",丁:"따뜻한 촛불",戊:"묵묵히 버티는 큰 산",己:"씨앗을 품은 대지",庚:"날카로운 칼날",辛:"차갑게 빛나는 보석",壬:"힘차게 흐르는 강물",癸:"조용히 내리는 맑은 비"};
function buildMulsangHeader(ds,mb){const env=BRANCH_DESC[mb]||"",s=STEM_SHORT[ds]||"";if(!env||!s)return null;return`${env} · ${s}`;}

const CHUNG_MAP={子:"午",午:"子",丑:"未",未:"丑",寅:"申",申:"寅",卯:"酉",酉:"卯",辰:"戌",戌:"辰",巳:"亥",亥:"巳"};
const SAMHYUNG3=[["寅","巳","申"],["丑","戌","未"]];

// ============================================================
// 통합 용신 산출 워터폴 엔진 v1.0
// ============================================================
const EL_GEN={木:"水",火:"木",土:"火",金:"土",水:"金"};   // 나를 생하는
const EL_MY_GEN={木:"火",火:"土",土:"金",金:"水",水:"木"}; // 내가 생하는(식상)
const EL_CTRL={木:"土",火:"金",土:"水",金:"木",水:"火"};   // 내가 극하는(재성)
const EL_CTRL_ME={木:"金",火:"水",土:"木",金:"火",水:"土"};// 나를 극하는(관성)
// 두 오행 사이를 통관시키는 오행
const EL_TONGWAN={
  "木土":"火","土木":"火",
  "火金":"土","金火":"土",
  "土水":"金","水土":"金",
  "金木":"水","木金":"水",
  "水火":"木","火水":"木",
};

function calcYongsin(pillars, tcpaSTotal){
  const {strength, myScore, elementScores, isDeukRyeong} = calcStrengthDetail(pillars);
  const dayEl = HS_EL[HS.indexOf(pillars[1].stem)];
  const total = Object.values(elementScores).reduce((a,b)=>a+b,0)||1;
  const elPct = {}; // 오행별 비율
  for(const el of ["木","火","土","金","水"]) elPct[el] = (elementScores[el]||0)/total;

  let primary=null, secondary=null, type="", reason="", isTrueYongsin=false;

  // ── Step 1: 최상위 예외처리 ──
  // 1-1. 종격: 특정 오행 75% 이상
  const dominantEl = Object.entries(elPct).find(([,v])=>v>=0.75)?.[0];
  if(dominantEl){
    primary = dominantEl;
    secondary = EL_GEN[dominantEl];
    type = "종격";
    reason = `${dominantEl} 기운이 사주를 장악(${Math.round(elPct[dominantEl]*100)}%). 거스르지 않고 순응`;
    return {primary,secondary,type,reason,isTrueYongsin,strength};
  }
  // 1-2. 수다화식: TCPA ≤ -6 AND 水 50% 이상
  if(tcpaSTotal<=-6 && elPct["水"]>=0.50){
    primary="土"; secondary="火";
    type="수다화식";
    reason="범람하는 水를 조토(土)로 먼저 막고 火로 온기를 보충";
    return {primary,secondary,type,reason,isTrueYongsin,strength};
  }
  // 1-3. 토다수탁: TCPA ≥ +6 AND 土 45% 이상
  if(tcpaSTotal>=6 && elPct["土"]>=0.45){
    primary="金"; secondary="水";
    type="토다수탁";
    reason="과열된 土를 金으로 설기하고 水를 살려 균형 회복";
    return {primary,secondary,type,reason,isTrueYongsin,strength};
  }

  // ── Step 2: 통관/병약 ──
  // 2-1. 통관: 상극 두 오행 합 70% 이상
  const CLASH_PAIRS=[["木","土"],["火","金"],["土","水"],["金","木"],["水","火"]];
  for(const [a,b] of CLASH_PAIRS){
    if((elPct[a]||0)+(elPct[b]||0)>=0.70 && (elPct[a]||0)>=0.25 && (elPct[b]||0)>=0.25){
      const tw=EL_TONGWAN[a+b];
      if(tw){
        primary=tw; type="통관";
        reason=`${a}(${Math.round(elPct[a]*100)}%)와 ${b}(${Math.round(elPct[b]*100)}%)의 충돌을 ${tw}로 중재`;
        // Step4 조후와 같으면 진용신
        if((tcpaSTotal<=-6&&tw==="火")||(tcpaSTotal>=6&&tw==="水")) isTrueYongsin=true;
        return {primary,secondary,type,reason,isTrueYongsin,strength};
      }
    }
  }
  // 2-2. 병약: 일간을 극하는 오행 40% 이상
  const killerEl=EL_CTRL_ME[dayEl];
  if(elPct[killerEl]>=0.40){
    primary=EL_MY_GEN[dayEl]; // 식상으로 제압
    type="병약";
    reason=`${killerEl}(${Math.round(elPct[killerEl]*100)}%)가 일간을 압박. 식상(${primary})으로 제압`;
    return {primary,secondary,type,reason,isTrueYongsin,strength};
  }

  // ── Step 3: 억부 (왕신촉발 방어) ──
  const selfPct = myScore / (total * 1.5); // 일간 세력 비율 근사
  if(selfPct<0.40){
    // 신약
    primary=EL_GEN[dayEl]; secondary=dayEl;
    type="억부(신약)";
    reason=`일간 세력 부족(${Math.round(selfPct*100)}%). 인성(${primary})으로 보강`;
  } else if(selfPct<=0.55){
    // 일반 신강
    primary=EL_CTRL_ME[dayEl]; secondary=EL_MY_GEN[dayEl];
    type="억부(신강)";
    reason=`일간 세력 적정(${Math.round(selfPct*100)}%). 관성(${primary})으로 다듬음`;
  } else {
    // 극신강 → 왕신촉발 방어: 관성 금지, 식상 우선
    primary=EL_MY_GEN[dayEl]; secondary=EL_CTRL[dayEl];
    type="억부(극신강)";
    reason=`일간 세력 과강(${Math.round(selfPct*100)}%). 관성 위험, 식상(${primary})으로 자연 설기`;
  }

  // ── Step 4: 조후 연동 ──
  let johuYongsin=null;
  if(tcpaSTotal<=-6) johuYongsin="火";
  else if(tcpaSTotal>=6) johuYongsin="水";

  // ── Step 5: 마스터 라우터 ──
  if(johuYongsin){
    // 규칙1: 조후가 위험 수준이면 억부와 상극 시 조후 우선
    const ctrlRelation=EL_CTRL[johuYongsin]===primary||EL_CTRL[primary]===johuYongsin;
    if(ctrlRelation){
      // 조후용신으로 교체
      secondary=primary;
      primary=johuYongsin;
      reason=`조후 위험(${tcpaSTotal>0?"+":""}${tcpaSTotal}). ${johuYongsin} 최우선 — ${reason}`;
    } else if(johuYongsin===primary){
      // 규칙3: 진용신
      isTrueYongsin=true;
      reason=`[진용신] 억부+조후 모두 ${primary} 지목 — ${reason}`;
    }
  }

  return {primary, secondary, johuYongsin, type, reason, isTrueYongsin, strength};
}

// 하위 호환용 (대운등급, 택일 등에서 여전히 사용)
function getYongsinElements(strength,dayEl,johuNeed){
  const MY_GEN={木:"火",火:"土",土:"金",金:"水",水:"木"},MY_CTRL={木:"土",火:"金",土:"水",金:"木",水:"火"};
  let yongs=["극신강","신강"].includes(strength)?[MY_GEN[dayEl],MY_CTRL[dayEl]]:["극신약","신약"].includes(strength)?[EL_GEN[dayEl],dayEl]:[MY_GEN[dayEl],EL_GEN[dayEl]];
  return[...new Set([...yongs,...(johuNeed||[])])];
}
// UI용 용신 텍스트 (시뮬레이터 억부/조후 표시)
function getYongsinText(strength,dayEl,johuNeed){
  const MY_GEN={木:"火",火:"土",土:"金",金:"水",水:"木"},MY_CTRL={木:"土",火:"金",土:"水",金:"木",水:"火"};
  let eobbuYongsin=[],eobbuGisin=[];
  if(["극신강","신강"].includes(strength)){eobbuYongsin=[MY_GEN[dayEl],MY_CTRL[dayEl]];eobbuGisin=[EL_GEN[dayEl],dayEl];}
  else if(["극신약","신약"].includes(strength)){eobbuYongsin=[EL_GEN[dayEl],dayEl];eobbuGisin=[MY_GEN[dayEl],MY_CTRL[dayEl]];}
  else{eobbuYongsin=[MY_GEN[dayEl],EL_GEN[dayEl]];eobbuGisin=[];}
  return{eobbuYongsin:[...new Set(eobbuYongsin)],eobbuGisin:[...new Set(eobbuGisin)],johuYongsin:johuNeed||[]};
}
function checkHapProtection(branch,allBranches){const HAP6={子:"丑",丑:"子",寅:"亥",亥:"寅",卯:"戌",戌:"卯",辰:"酉",酉:"辰",巳:"申",申:"巳",午:"未",未:"午"};return HAP6[branch]&&allBranches.includes(HAP6[branch]);}

function calcDaeunGrade(pillars,dayStem,daeunStem,daeunBranch){
  const{strength}=calcStrengthDetail(pillars),mb=pillars[2].branch,db=pillars[1].branch,allBranches=pillars.map(p=>p.branch),dayEl=HS_EL[HS.indexOf(dayStem)];
  const tcpaBase=calcTCPA(pillars);
  const yongsin=calcYongsin(pillars,tcpaBase.sBase);
  const yongsinEls=[yongsin.primary,yongsin.secondary].filter(Boolean);
  const johuYongsin=yongsin.johuYongsin;
  const MY_GEN={木:"火",火:"土",土:"金",金:"水",水:"木"},MY_CTRL={木:"土",火:"金",土:"水",金:"木",水:"火"},CTRL_ME={木:"金",火:"水",土:"木",金:"火",水:"土"};
  const dStemEl=HS_EL[HS.indexOf(daeunStem)],dBranchEl=EB_EL[EB.indexOf(daeunBranch)],targetChung=CHUNG_MAP[daeunBranch];
  let score=55,reasons=[];
  if(yongsinEls.includes(dStemEl)){score+=15;reasons.push(`천간에 용신 [${dStemEl}] 기운 진입`);}
  if(yongsinEls.includes(dBranchEl)){score+=20;reasons.push(`지지에 용신 뿌리 [${dBranchEl}] 도래`);}
  if(!yongsinEls.includes(dStemEl)&&!yongsinEls.includes(dBranchEl)){
    if(["극신강","신강"].includes(strength)&&(dStemEl===dayEl||dStemEl===EL_GEN[dayEl])){score-=10;reasons.push("기구신이 들어와 경쟁 및 부담 증가");}
    if(["극신약","신약"].includes(strength)&&(dBranchEl===MY_CTRL[dayEl]||dBranchEl===CTRL_ME[dayEl])){score-=15;reasons.push("기구신이 들어와 현실적 압박이 거셈");}
  }
  // 조후 반영 (TCPA 기반)
  if(johuYongsin&&(dStemEl===johuYongsin||dBranchEl===johuYongsin)){score+=15;reasons.push(`조후 균형 개선 — ${johuYongsin} 기운 진입`);}
  const tcpaWithDaeun=calcTCPA(pillars,daeunStem,daeunBranch);
  if(Math.abs(tcpaWithDaeun.sTotal)<Math.abs(tcpaBase.sBase)&&Math.abs(tcpaBase.sBase)>=4){score+=8;reasons.push(`조후점수 개선 (${tcpaBase.sBase>0?"+":""}${tcpaBase.sBase} → ${tcpaWithDaeun.sTotal>0?"+":""}${tcpaWithDaeun.sTotal})`);}
  else if(Math.abs(tcpaWithDaeun.sTotal)>Math.abs(tcpaBase.sBase)+2){score-=10;reasons.push(`조후 불균형 심화 (→ ${tcpaWithDaeun.sTotal>0?"+":""}${tcpaWithDaeun.sTotal})`);}
  if(daeunStem===daeunBranch){if(yongsinEls.includes(dBranchEl)){score+=10;reasons.push("길운이 간여지동으로 강하게 발복");}else{score-=10;reasons.push("흉운이 간여지동으로 겹쳐 제약 뚜렷");}}
  const withDaeun=[...allBranches,daeunBranch],HAP_GROUPS=[{el:"木",label:"木局",chars:["寅","卯","辰"]},{el:"火",label:"火局",chars:["巳","午","未"]},{el:"金",label:"金局",chars:["申","酉","戌"]},{el:"水",label:"水局",chars:["亥","子","丑"]},{el:"木",label:"木局",chars:["亥","卯","未"]},{el:"火",label:"火局",chars:["寅","午","戌"]},{el:"金",label:"金局",chars:["巳","酉","丑"]},{el:"水",label:"水局",chars:["申","子","辰"]}];
  for(const hap of HAP_GROUPS){if(hap.chars.every(c=>withDaeun.includes(c))&&hap.chars.includes(daeunBranch)){if(yongsinEls.includes(hap.el)){score+=25;reasons.push(`강력한 [${hap.label}] 용신 세력 형성`);}else{score-=25;reasons.push(`원치 않는 [${hap.label}] 세력 형성`);}break;}}
  if(allBranches.includes(targetChung)){const isP=checkHapProtection(targetChung,allBranches),tEl=EB_EL[EB.indexOf(targetChung)],isY=yongsinEls.includes(tEl);if(isY){score-=(isP?10:25);reasons.push(`⚠️ 대운이 용신 [${targetChung}]을 충격함${isP?" (합으로 피해 감소)":""}`);}else{score+=(isP?5:15);reasons.push(`✨ 대운이 기신 [${targetChung}] 충거, 장애물 제거`);}if(targetChung===db)reasons.push("📌 일지 자리 직접 변화");if(targetChung===mb)reasons.push("📌 월지(사회적 기반) 큰 변동");}
  if(SAMHYUNG3.some(g=>g.every(b=>withDaeun.includes(b))&&g.includes(daeunBranch))){score-=20;reasons.push("삼형살 완성 — 관재구설 주의");}
  if(reasons.length===0)reasons.push("무난하고 평온하게 흘러가는 시기");
  let gradeData;
  if(score>=80)gradeData={grade:"S",color:"#f5c842",label:"최상 발복기",desc:"모든 기운이 화합하여 최고의 성취를 이루는 전성기"};
  else if(score>=65)gradeData={grade:"A+",color:"#4ade80",label:"주도적 성취기",desc:"실력을 발휘하여 확실한 결과물을 쟁취하는 시기"};
  else if(score>=55)gradeData={grade:"A",color:"#86efac",label:"환경적 안정기",desc:"외부 환경이 우호적으로 변하고 안정을 찾는 시기"};
  else if(score>=40)gradeData={grade:"B",color:"#d4ae6e",label:"현상 유지기",desc:"큰 변화보다는 내실을 다지며 때를 기다려야 할 시기"};
  else gradeData={grade:"C",color:"#fb923c",label:"주의 및 타격기",desc:"외부 압박과 변동이 심하니 자중하고 수성해야 함"};
  return{...gradeData,reasons};
}

// ============================================================
// 택일 채점 엔진 v2
// ============================================================
// 통관(通關) 체크: A가 B를 극할 때 C가 중간에서 통관시키는지
function checkTongGwan(pillars, dayStem){
  // 수다토붕(水多土崩): 水가 많고 土 일간이 위험할 때 金(인성)이 土生金-金生水 통관
  const allEls=[...pillars.map(p=>HS_EL[p.stemIdx]),...pillars.map(p=>EB_EL[p.branchIdx])];
  const dayEl=HS_EL[HS.indexOf(dayStem)];
  const GEN={木:"水",火:"木",土:"火",金:"土",水:"金"};
  const MY_GEN={木:"火",火:"土",土:"金",金:"水",水:"木"};
  const CTRL_ME={木:"金",火:"水",土:"木",金:"火",水:"土"};
  const ctrlEl=CTRL_ME[dayEl]; // 나를 극하는 오행
  const genEl=GEN[dayEl];      // 나를 생하는 오행 (인성)
  const ctrlCount=allEls.filter(e=>e===ctrlEl).length;
  const genCount=allEls.filter(e=>e===genEl).length;
  // 극하는 오행이 4개 이상(수다토붕류) + 인성이 존재 → 통관 가산
  if(ctrlCount>=4 && genCount>=1) return 8;
  // 극하는 오행이 3개 + 인성 존재
  if(ctrlCount>=3 && genCount>=1) return 4;
  return 0;
}

function scoreTaekIlCandidate(pillars, dayStem, parentPillars=null){
  const {strength, myScore:rawMyScore, elementScores, isDeukRyeong} = calcStrengthDetail(pillars);
  const tcpaBase = calcTCPA(pillars);
  const yongsinResult = calcYongsin(pillars, tcpaBase.sBase);
  const dayEl = HS_EL[HS.indexOf(dayStem)];
  const GEN = {木:"水",火:"木",土:"火",金:"土",水:"金"};
  const MY_GEN = {木:"火",火:"土",土:"金",金:"水",水:"木"};
  const MY_CTRL = {木:"土",火:"金",土:"水",金:"木",水:"火"};
  const CTRL_ME = {木:"金",火:"水",土:"木",金:"火",水:"土"};
  const mb = pillars[2].branch, db = pillars[1].branch;
  const allBranches = pillars.map(p=>p.branch);
  const allStems = pillars.map(p=>p.stem);
  const johuNeed = tcpaBase.sBase<=-6?["火"]:tcpaBase.sBase>=6?["水"]:[];
  let score = 60;
  const flags = [], goods = [];

  // ── 1단계: 구조적 치명타 ──
  const coldMonths=["亥","子","丑"], hotMonths=["巳","午","未"];
  const fireTotal = (elementScores["火"]||0), waterTotal = (elementScores["水"]||0);
  if(coldMonths.includes(mb) && fireTotal < 0.3){score-=40;flags.push("❌ 한겨울 월 + 火기운 전무 → 조후 완전 붕괴");}
  if(hotMonths.includes(mb) && waterTotal < 0.3){score-=40;flags.push("❌ 한여름 월 + 水기운 전무 → 조후 완전 붕괴");}
  if(["寅","巳","申"].every(b=>allBranches.includes(b))){score-=35;flags.push("❌ 인사신 삼형살 완성");}
  if(["丑","戌","未"].every(b=>allBranches.includes(b))){score-=35;flags.push("❌ 축술미 삼형살 완성");}
  if(allBranches.includes("子")&&allBranches.includes("卯")){score-=20;flags.push("⚠️ 자묘형(子卯刑)");}
  const dayBranchChung=CHUNG_MAP[db];
  if(allBranches.some((b,i)=>i!==1&&b===dayBranchChung)){score-=25;flags.push(`⚠️ 일지 ${db} 충 — 건강/배우자 불안`);}
  function isTGJC(p1,p2){return Math.abs(p1.stemIdx-p2.stemIdx)===4&&CHUNG_MAP[p1.branch]===p2.branch;}
  if(isTGJC(pillars[3],pillars[2])){score-=20;flags.push("⚠️ 연주-월주 천극지충");}
  if(isTGJC(pillars[2],pillars[1])){score-=20;flags.push("⚠️ 월주-일주 천극지충");}
  if(isTGJC(pillars[1],pillars[0])){score-=20;flags.push("⚠️ 일주-시주 천극지충");}

  // ── 2단계: 오행 균형 + 조후 (TCPA 기반) ──
  const tcpaScore=tcpaBase.sBase;
  // 조후 균형: 절댓값이 작을수록 좋음 (0에 가까울수록 균형)
  const johuBalanceScore=Math.max(0,Math.min(40,Math.round((10-Math.abs(tcpaScore))*2)));
  score+=johuBalanceScore-20; // 기준점 대비 가감
  if(Math.abs(tcpaScore)<=2)goods.push(`✅ 조후 균형 우수 (조후점수 ${tcpaScore>0?"+":""}${tcpaScore})`);
  if(Math.abs(tcpaScore)>=8){score-=15;flags.push(`⚠️ 조후 불균형 심각 (조후점수 ${tcpaScore>0?"+":""}${tcpaScore})`);}
  const hasAll5=["木","火","土","金","水"].every(el=>(elementScores[el]||0)>0.1);
  if(hasAll5){score+=15;goods.push("✅ 오행 구족 — 5가지 오행 고루 분포");}
  const elTotal=Object.values(elementScores).reduce((a,b)=>a+b,1);
  const maxElRatio=Math.max(...Object.values(elementScores))/elTotal;
  if(maxElRatio>0.5){score-=20;const maxEl=Object.entries(elementScores).sort((a,b)=>b[1]-a[1])[0][0];flags.push(`⚠️ ${maxEl} 과다 편중 (${Math.round(maxElRatio*100)}%)`);}
  // 용신 (새 워터폴 엔진)
  const yongsinEls=[yongsinResult.primary,yongsinResult.secondary].filter(Boolean);
  const branchYongsinCount=allBranches.filter(b=>yongsinEls.includes(EB_EL[EB.indexOf(b)])).length;
  if(branchYongsinCount>=2){score+=7;goods.push(`✅ 지지에 용신 기운 ${branchYongsinCount}개 집중`);}
  else if(branchYongsinCount===1){score+=3;}

  // ── 3단계: 격국 품질 ──
  const yongsinHasRoot=yongsinEls.some(el=>allBranches.some(b=>EB_EL[EB.indexOf(b)]===el));
  if(yongsinHasRoot){score+=15;goods.push(`✅ 용신(${yongsinEls.join("/")}) 지지 통근`);}
  else{score-=10;flags.push(`⚠️ 용신 지지 뿌리 없음`);}
  if(strength==="중화"){score+=12;goods.push("✅ 중화 — 최적 균형");}
  else if(strength==="신강"){score+=6;goods.push("✅ 신강 — 활동력 강함");}
  else if(strength==="극신강"){score-=5;flags.push("⚠️ 극신강 — 과도한 자아, 설기 필요");}
  else if(strength==="신약"){score-=5;flags.push("⚠️ 신약 — 자아 기반 약함");}
  else{score-=15;flags.push("❌ 극신약 — 자아가 너무 약한 구조");}
  if(isDeukRyeong){score+=10;goods.push("✅ 득령 — 월지 기운 수령");}
  // 상관견관
  const hasGwan=allStems.some(s=>getSS(dayStem,s)==="정관"),hasSG=allStems.some(s=>getSS(dayStem,s)==="상관");
  if(hasGwan&&hasSG){const gi=allStems.findIndex(s=>getSS(dayStem,s)==="정관"),si=allStems.findIndex(s=>getSS(dayStem,s)==="상관");if(Math.abs(gi-si)===1){score-=15;flags.push("⚠️ 상관견관 — 관직/명예 손상");}}

  // ── 통관 가산점 ──
  const tongGwanBonus=checkTongGwan(pillars,dayStem);
  if(tongGwanBonus>0){score+=tongGwanBonus;goods.push(`✅ 통관(通關) 구조 — 기신을 중화시키는 오행 존재 (+${tongGwanBonus}점)`);}

  // ── 부모 사주 적합도 (선택) ──
  let parentBonus=0;
  if(parentPillars){
    // 부모의 용신을 자녀가 보강해주면 +10
    const parentStrength=calcStrength(parentPillars);
    const parentDayEl=HS_EL[HS.indexOf(parentPillars[1].stem)];
    const parentYongs=getYongsinElements(parentStrength,parentDayEl,[]);
    const childSupportsParent=parentYongs.some(el=>allStems.concat(allBranches.map(b=>EB_EL[EB.indexOf(b)])).includes(el));
    if(childSupportsParent){parentBonus=10;goods.push("✅ 자녀가 부모의 용신 오행 보강");}
    // 부모-자녀 천간 충은 감점
    const parentStems=parentPillars.map(p=>p.stem);
    const childStems=pillars.map(p=>p.stem);
    const STEM_CHUNG={甲:"庚",庚:"甲",乙:"辛",辛:"乙",丙:"壬",壬:"丙",丁:"癸",癸:"丁"};
    const hasChung=parentStems.some(ps=>childStems.includes(STEM_CHUNG[ps]||""));
    if(hasChung){parentBonus-=8;flags.push("⚠️ 부모-자녀 천간 충 — 관계 마찰 가능성");}
    score+=parentBonus;
  }

  // 음수 방지 (최하 0점)
  score=Math.max(0,Math.min(100,score));
  return{score,flags,goods,strength,johu:{totalScore:Math.max(0,Math.min(100,Math.round(50-tcpaBase.sBase*3))),tempScore:50,humScore:50,need:johuNeed},elementScores,yongsinEls,tongGwanBonus,parentBonus};
}

// 대운 가중평균 (20~40대 높은 가중치)
function calcDaeunWeightedScore(daeunList, pillars, dayStem, birthYear){
  if(!daeunList||daeunList.length===0) return null;
  // 나이대별 가중치
  const ageWeight=(age)=>{
    if(age>=20&&age<=29) return 1.0;
    if(age>=30&&age<=39) return 1.0;
    if(age>=40&&age<=49) return 0.8;
    if(age>=50&&age<=59) return 0.6;
    if(age>=10&&age<=19) return 0.4;
    if(age>=60&&age<=69) return 0.3;
    return 0.1; // 70대+
  };
  const GRADE_SCORE={S:95,"A+":85,A:75,B:55,C:25};
  let totalW=0,totalWS=0;
  daeunList.forEach(d=>{
    const grade=calcDaeunGrade(pillars,dayStem,d.stem,d.branch);
    const gs=GRADE_SCORE[grade.grade]??50;
    const w=ageWeight(d.startAge);
    totalW+=w;totalWS+=gs*w;
  });
  return totalW>0?Math.round(totalWS/totalW):50;
}

// 각 시지의 대표 시각 (시지 중간값, 만세력 기준)
const SIJI_HOURS=[0,2,4,6,8,10,12,14,16,18,20,22]; // 子=00:30→0시, 丑=02:30→2시...
const SIJI_MINUTES=[30,30,30,30,30,30,30,30,30,30,30,30]; // 모두 :30분
const SIJI_LABELS=["子(23:30~01:29)","丑(01:30~03:29)","寅(03:30~05:29)","卯(05:30~07:29)","辰(07:30~09:29)","巳(09:30~11:29)","午(11:30~13:29)","未(13:30~15:29)","申(15:30~17:29)","酉(17:30~19:29)","戌(19:30~21:29)","亥(21:30~23:29)"];

function runTaekIlFilter(centerYear, centerMonth, centerDay, gender, parentPillars=null){
  const results=[];
  const seen=new Set();
  // 예정일 기준 ±10일
  let startJD=getJD(centerYear,centerMonth,centerDay)-10;
  let endJD=getJD(centerYear,centerMonth,centerDay)+10;
  for(let jd=startJD;jd<=endJD;jd++){
    const dt=jdToDate(jd);
    const {year:y,month:m,day:d}=dt;
    if(y<1900||y>2030) continue;
    for(let sijiIdx=0;sijiIdx<12;sijiIdx++){
      const h=SIJI_HOURS[sijiIdx];
      const min=SIJI_MINUTES[sijiIdx];
      try{
        const saju=calcSaju(y,m,d,h,min);
        const key=saju.pillars[1].stem+saju.pillars[1].branch+saju.pillars[0].stem+saju.pillars[0].branch;
        if(seen.has(key)) continue;
        const res=scoreTaekIlCandidate(saju.pillars,saju.dayStem,parentPillars);
        if(res.score<50) continue;
        seen.add(key);
        // 대운 가중평균 반영 (20%)
        const daeunList=calcDaeun(y,m,d,gender,saju.pillars[2]);
        const daeunAvg=calcDaeunWeightedScore(daeunList,saju.pillars,saju.dayStem,y);
        const finalScore=Math.round(res.score*0.8+(daeunAvg||50)*0.2);
        results.push({...res,score:finalScore,rawScore:res.score,daeunAvg,saju,day:d,month:m,year:y,hour:h,minute:0,sijiIdx,daeunList});
      }catch(e){}
    }
  }
  results.sort((a,b)=>b.score-a.score);
  return results.slice(0,3);
}

function hourLabel(h,m=0){return SIJI_LABELS[getHB(h,m)]||`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;}
// 시지 인덱스로 실제 시간 범위 텍스트
function sijiTimeLabel(sijiIdx){return SIJI_LABELS[sijiIdx]||"";}

// ============================================================
// 물상 이미지
// ============================================================
const STEM_SCENE={甲:"a towering ancient pine forest",乙:"a delicate wildflower meadow with cascading vines",丙:"a blazing sun at zenith scorching the horizon",丁:"a lone lantern flame against vast cold darkness",戊:"colossal mountain peaks wrapped in storm clouds",己:"deep fertile terraced earth heavy with possibility",庚:"sheer steel-grey cliffs with razor edges",辛:"glittering crystal formations in dark caverns",壬:"a boundless surging ocean eroding ancient shores",癸:"quiet rain and mist-shrouded mountain pools"};
const BRANCH_SCENE={子:"frozen tundra under a pale winter moon",丑:"frost-locked earth in deepest winter",寅:"misty spring forest at dawn",卯:"rolling hills of cherry blossoms",辰:"rain-soaked fields in early spring",巳:"parched summer earth shimmering in heat haze",午:"blazing midsummer noon, cracked earth",未:"golden late-summer dusk",申:"vivid mountain autumn slopes",酉:"endless harvest fields under clear autumn sky",戌:"bare branches in melancholy late-autumn dusk",亥:"cold dark winter rain on bare branches"};
function getJohuExpression(tS,hS){const tL=tS<35,tH=tS>68,hL=hS<35,hH=hS>68,tot=Math.round((tS+hS)/2);if(tL&&hH)return{body:"hunched against cold and dampness, arms wrapped tightly",face:"cheek in profile, tense cold expression, furrowed brow"};if(tL)return{body:"bundled tightly, body curled, cautious posture",face:"three-quarter profile, pensive cold expression"};if(tH&&hL)return{body:"slouched, hand raised to shade from sunlight",face:"profile squinting against harsh light, fatigued"};if(tH)return{body:"leaning back, light clothing, overwhelmed by heat",face:"three-quarter view, flushed strained expression"};if(tot>=70)return{body:"relaxed upright, arms slightly open, deep contentment",face:"soft three-quarter view, peaceful gentle smile"};return{body:"composed natural stance",face:"partial profile, neutral peaceful expression"};}
function getJohuCostume(tS,hS,gender){const f=gender==="female",tL=tS<40,tH=tS>68,hL=hS<40,hH=hS>68;let o="";if(tL&&hH)o=f?"heavy layered hanbok, dark indigo":"dark heavy overcoat, deep navy";else if(tL)o=f?"winter hanbok, fur-trimmed, silver and white":"thick Korean overcoat, charcoal and midnight blue";else if(tH&&hL)o=f?"light summer hanbok, vibrant red and orange":"lightweight linen Korean robe, warm amber";else if(tH)o=f?"sheer summer hanbok, coral and gold":"light Korean summer robe, golden yellow";else if(hL)o=f?"autumn hanbok, golden amber":"Korean autumn robe, chestnut and gold";else if(hH)o=f?"spring hanbok, jade green and misty blue":"spring Korean robe, moss green";else o=f?"classic hanbok, jade and ivory":"traditional Korean robe, deep teal and ivory";return`a Korean ${f?"woman":"man"} in three-quarter angle, ${o}`;}
function buildNarrativeTransition(mb,db){const cold=["亥","子","丑"],spr=["寅","卯","辰"],sum=["巳","午","未"],aut=["申","酉","戌"],g=b=>cold.includes(b)?"cold":spr.includes(b)?"spring":sum.includes(b)?"summer":"autumn",T={"cold->summer":"The frozen world cracks — blazing heat arrives","cold->spring":"Gentle warmth dissolves the frozen landscape","summer->cold":"Sudden cold crashes over scorched earth","summer->autumn":"Peak heat breaks into harvest gold","spring->summer":"Spring erupts into full summer glory","autumn->cold":"Autumn descends into deep winter","cold->cold":"Cold compounds upon cold","summer->summer":"Heat compounds with doubled intensity","spring->spring":"Spring multiplies into lush abundance","autumn->autumn":"Autumn settles deep and golden"};return T[`${g(mb)}->${g(db)}`]||"a subtle seasonal shift";}
function buildOriginPrompt(ds,mb,gender,tS,hS){const char=getJohuCostume(tS,hS,gender),expr=getJohuExpression(tS,hS);return`Photorealistic cinematic 8K photograph. Primary landscape: ${STEM_SCENE[ds]}. Seasonal environment: ${BRANCH_SCENE[mb]}. Character (20% of frame): ${char}. Body: ${expr.body}. Face: ${expr.face}. Landscape dominates. Dramatic cinematic lighting. STRICT: NO text, NO watermark. One figure only.`;}
function buildDaeunFusionPrompt(ds,mb,db,gender,tS,hS){const char=getJohuCostume(tS,hS,gender),expr=getJohuExpression(tS,hS),tr=buildNarrativeTransition(mb,db);return`Photorealistic cinematic 8K photograph. Primary identity: ${STEM_SCENE[ds]}. TRANSFORMATION: ${tr}. New energy: ${BRANCH_SCENE[db]}. Character at boundary: ${char}. Body: ${expr.body}. Face: ${expr.face}. Two color palettes bleed across frame. Epic scale. STRICT: NO text, NO watermark.`;}
async function generateImage(prompt,onProgress){onProgress?.(10,"요청 전송 중...");const r=await fetch("/api/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});const data=await r.json();if(!r.ok)throw new Error(data.error||"이미지 생성 실패");if(data.url){onProgress?.(100,"완료!");return data.url;}if(data.id){for(let i=0;i<60;i++){await new Promise(res=>setTimeout(res,2000));const poll=await fetch(`/api/image?id=${data.id}`);const pd=await poll.json();onProgress?.(Math.min(90,30+i*2),"AI 렌더링 중...");if(pd.status==="succeeded"){onProgress?.(100,"완료!");return pd.url;}if(pd.status==="failed")throw new Error(pd.error||"생성 실패");}throw new Error("시간 초과");}throw new Error("응답 오류");}

// 궁합
const HS_HAP={甲:"己",己:"甲",乙:"庚",庚:"乙",丙:"辛",辛:"丙",丁:"壬",壬:"丁",戊:"癸",癸:"戊"};
const HS_CHUNG={甲:"庚",庚:"甲",乙:"辛",辛:"乙",丙:"壬",壬:"丙",丁:"癸",癸:"丁"};
const WANG_JI=["子","午","卯","酉"],WANG_CHUNG={子:"午",午:"子",卯:"酉",酉:"卯"};
const SAMHYUNG=[["寅","巳","申"],["丑","戌","未"],["子","卯"]];
function calcCompatScore(s1,s2){const d1=s1.pillars[1].stem,d2=s2.pillars[1].stem,b1=s1.pillars[1].branch,b2=s2.pillars[1].branch;let score=50;const details=[];if(HS_HAP[d1]===d2){score+=20;details.push({type:"일간합",icon:"✦",desc:`${d1}·${d2} 천간합`,positive:true,pts:20});}if(HS_CHUNG[d1]===d2){score-=15;details.push({type:"일간충",icon:"✕",desc:`${d1}·${d2} 천간충`,positive:false,pts:-15});}const el1=HS_EL[s1.pillars[1].stemIdx],el2=HS_EL[s2.pillars[1].stemIdx];const n1=JOHU_NEED[s1.pillars[2].branch]?.need||[],n2=JOHU_NEED[s2.pillars[2].branch]?.need||[];let jPts=0;if(n1.includes(el2))jPts+=10;if(n2.includes(el1))jPts+=10;score+=jPts;details.push(jPts>0?{type:"조후보완",icon:"◎",desc:`오행 상호보완 (${el2}·${el1})`,positive:true,pts:jPts}:{type:"조후보완",icon:"△",desc:"조후 보완 관계 없음",positive:false,pts:0});if(WANG_JI.includes(b1)&&WANG_JI.includes(b2)&&WANG_CHUNG[b1]===b2){score-=12;details.push({type:"왕지충",icon:"⚡",desc:`${b1}·${b2} 왕지충`,positive:false,pts:-12});}const combined=[...s1.pillars.map(p=>p.branch),...s2.pillars.map(p=>p.branch)];if(SAMHYUNG.some(grp=>grp.every(b=>combined.includes(b)))){score-=10;details.push({type:"삼형살",icon:"⚠",desc:"삼형살 완성",positive:false,pts:-10});}return{score:Math.max(0,Math.min(100,score)),details};}
function compatLabel(s){if(s>=85)return{label:"천생연분",color:"#f59e0b"};if(s>=70)return{label:"좋은 인연",color:"#4ade80"};if(s>=55)return{label:"보통 궁합",color:C.gold};if(s>=40)return{label:"주의 필요",color:"#fb923c"};return{label:"충극 관계",color:C.red};}

// ============================================================
// 공통 UI
// ============================================================
function Card({children,style}){return <div style={{background:C.card,borderRadius:18,padding:16,border:"1px solid rgba(215,180,105,0.22)",boxShadow:"0 4px 20px rgba(0,0,0,0.22)",...style}}>{children}</div>;}
function CardTitle({children,style}){return <p style={{textAlign:"center",fontWeight:700,color:C.goldL,fontFamily:"'Noto Serif KR',serif",marginBottom:12,fontSize:"0.85rem",letterSpacing:"0.1em",...style}}>{children}</p>;}
function Field({label,children}){return <div><label style={{fontSize:"0.65rem",fontWeight:700,color:C.muted,display:"block",marginBottom:8,letterSpacing:"0.1em"}}>{label}</label>{children}</div>;}
function SI({style,...p}){return <input {...p} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid rgba(215,180,105,0.32)",background:"rgba(255,255,255,0.10)",color:C.text,fontSize:"0.95rem",outline:"none",boxSizing:"border-box",...style}}/>;}
function GoldBtn({children,style,...p}){return <button {...p} style={{padding:"14px 24px",borderRadius:14,background:p.disabled?`${C.gold}12`:`linear-gradient(135deg,${C.gold},${C.goldD})`,color:p.disabled?C.muted:"#160c00",fontWeight:700,fontSize:"0.88rem",border:"none",cursor:p.disabled?"not-allowed":"pointer",letterSpacing:"0.08em",fontFamily:"'Noto Serif KR',serif",...style}}>{children}</button>;}
function GhBtn({children,active,style,...p}){return <button {...p} style={{padding:"10px 0",borderRadius:0,background:"transparent",color:active?C.gold:`${C.gold}55`,border:"none",borderBottom:active?`2px solid ${C.gold}`:"2px solid transparent",cursor:"pointer",fontSize:"0.68rem",fontWeight:700,whiteSpace:"nowrap",flex:1,letterSpacing:"0.05em",textAlign:"center",transition:"all 0.18s",...style}}>{children}</button>;}
function GenderBtn({v,l,form,setForm}){return <button onClick={()=>setForm({...form,gender:v})} style={{flex:1,padding:12,borderRadius:12,background:form.gender===v?`${C.gold}28`:"rgba(255,255,255,0.07)",color:form.gender===v?C.gold:`${C.gold}88`,border:form.gender===v?`1.5px solid ${C.gold}70`:"1.5px solid rgba(255,255,255,0.14)",cursor:"pointer",fontWeight:700,fontSize:"0.85rem"}}>{l}</button>;}

// ============================================================
// ★ 새 만세력 스타일 기둥 카드 (사진 UI 스타일)
// ============================================================
function PillarCard({p, dayStem, isDay=false, isHighlight=false, accentColor=null, showUnsung=true}){
  const sc = EL_COL[HS_EL[p.stemIdx]] || C.gold;
  const bc = EL_COL[EB_EL[p.branchIdx]] || C.gold;
  const stemSS = isDay ? "본원" : getSS(dayStem, p.stem);
  const bonStem = EBH[p.branch]?.bon?.[0];
  const branchSS = bonStem ? getSS(dayStem, bonStem) : "";
  const hid = EBH[p.branch] || {};
  const hidItems = [hid.yo, hid.jung, hid.bon].filter(Boolean);
  // 12운성: 일간 기준
  const unsungStr = showUnsung && dayStem ? getUnsung(dayStem, p.branch) : "";

  const bgStem = isDay ? "#2c3e6b" : isHighlight ? `${accentColor||sc}22` : "#2a2a2a";
  const bgBranch = isDay ? "#2c6b3a" : isHighlight ? `${accentColor||bc}22` : "#1e1e1e";
  const borderCol = isDay ? "#4a90d9" : isHighlight ? (accentColor||sc) : "rgba(255,255,255,0.12)";

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,gap:3,minWidth:0}}>
      <div style={{fontSize:"0.85rem",fontWeight:700,color:isDay?"#7ab8ff":isHighlight?(accentColor||C.gold):C.muted,letterSpacing:"0.08em",marginBottom:2}}>{p.label}주</div>
      <div style={{fontSize:"0.72rem",fontWeight:700,color:isDay?"#7ab8ff":C.muted,background:"rgba(255,255,255,0.08)",borderRadius:6,padding:"2px 8px",marginBottom:2}}>{stemSS}</div>
      <div style={{width:"100%",padding:"10px 4px",borderRadius:14,background:bgStem,border:`2px solid ${borderCol}`,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <div style={{fontSize:"2.2rem",lineHeight:1,color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.stem]?900:300}}>{p.stem}</div>
        <div style={{fontSize:"0.65rem",color:sc,fontWeight:700}}>{HS_EL[p.stemIdx]}</div>
      </div>
      <div style={{width:"100%",padding:"10px 4px",borderRadius:14,background:bgBranch,border:`2px solid ${isDay?"#4aaa6b":isHighlight?(accentColor||bc)+"66":"rgba(255,255,255,0.1)"}`,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <div style={{fontSize:"2.2rem",lineHeight:1,color:bc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.branch]?900:300}}>{p.branch}</div>
        <div style={{fontSize:"0.65rem",color:bc,fontWeight:700}}>{EB_EL[p.branchIdx]}</div>
      </div>
      {branchSS && <div style={{fontSize:"0.68rem",fontWeight:700,color:isDay?"#4aaa6b":C.muted,background:"rgba(255,255,255,0.06)",borderRadius:6,padding:"2px 7px"}}>{branchSS}</div>}
      {/* 지장간 */}
      <div style={{display:"flex",gap:2,justifyContent:"center",flexWrap:"wrap",marginTop:1}}>
        {hidItems.map(([stem,days],j)=>{
          const hsc=EL_COL[HS_EL[HS.indexOf(stem)]]||C.gold;
          return <div key={j} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"1px 4px",borderRadius:5,background:`${hsc}15`}}>
            <span style={{fontSize:"0.7rem",color:hsc,fontFamily:"serif",fontWeight:700}}>{stem}</span>
            <span style={{fontSize:"0.42rem",color:hsc,opacity:0.7}}>{days}일</span>
          </div>;
        })}
      </div>
      {/* 12운성 */}
      {unsungStr && <div style={{fontSize:"0.65rem",fontWeight:700,color:bc,background:`${bc}18`,borderRadius:6,padding:"2px 8px",marginTop:1,letterSpacing:"0.05em"}}>{unsungStr}</div>}
    </div>
  );
}

// 팔자 4주 레이아웃 (사진 스타일)
function SajuBoard({pillars, dayStem, showMulsang=true, selDaeun=null, selSeun=null}){
  const dayEl = HS_EL[HS.indexOf(dayStem)];
  const monthBranch = pillars[2].branch;
  const mh = showMulsang ? buildMulsangHeader(dayStem, monthBranch) : null;

  // 대운 필러 객체 생성
  const daeunPillar = selDaeun ? {
    stem: selDaeun.stem, branch: selDaeun.branch,
    stemIdx: selDaeun.stemIdx, branchIdx: selDaeun.branchIdx,
    label: "대운"
  } : null;
  // 세운 필러 객체 생성
  const seunPillar = selSeun ? {
    stem: selSeun.stem, branch: selSeun.branch,
    stemIdx: selSeun.stemIdx, branchIdx: selSeun.branchIdx,
    label: "세운"
  } : null;

  return (
    <div>
      {mh && <div style={{marginBottom:8,padding:"5px 10px",background:`${EL_COL[dayEl]}12`,borderRadius:8,textAlign:"center"}}><span style={{fontSize:"0.68rem",color:C.goldL,fontFamily:"'Noto Serif KR',serif"}}>{mh}</span></div>}
      <div style={{display:"flex",gap:6}}>
        {/* 세운 필러 — 좌측 */}
        {seunPillar && (
          <PillarCard p={seunPillar} dayStem={dayStem} isHighlight accentColor={"#86efac"}/>
        )}
        {/* 원국 4주 — 중앙 */}
        {pillars.map((p,i)=><PillarCard key={i} p={p} dayStem={dayStem} isDay={i===1}/>)}
        {/* 대운 필러 — 우측 */}
        {daeunPillar && (
          <PillarCard p={daeunPillar} dayStem={dayStem} isHighlight accentColor={C.gold}/>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 오행 오각형 (절반 크기)
// ============================================================
function Pentagon({pillars,dayStem,elementScores=null,strength=null,pillars2=null,compact=false}){
  const cnt1=elementScores||calcElementCount(pillars);
  const cnt2=pillars2?calcElementCount(pillars2):null;
  const currentStrength=strength||calcStrength(pillars);
  const dayEl=HS_EL[HS.indexOf(dayStem)];
  const BASE_ORDER=["木","火","土","金","水"],startIdx=Math.max(0,BASE_ORDER.indexOf(dayEl));
  const ORDER=[...BASE_ORDER.slice(startIdx),...BASE_ORDER.slice(0,startIdx)];
  const EC={水:C.water,木:C.wood,火:C.fire,土:C.earth,金:C.metal};
  // compact=true이면 작게, 아니면 기본
  const sz=compact?70:100,cx=sz,cy=sz,R=compact?42:58;
  const pts=ORDER.map((_,i)=>{const a=(i*72-90)*Math.PI/180;return{x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)};});
  const max1=Math.max(...Object.values(cnt1),1);
  const makePath=(cnt,maxv)=>{const rp=ORDER.map((el,i)=>{const a=(i*72-90)*Math.PI/180,rr=8+(R-8)*((cnt[el]||0)/maxv);return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)};});return rp.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z";};
  const rd1=makePath(cnt1,max1),rd2=cnt2?makePath(cnt2,Math.max(...Object.values(cnt2),1)):null;
  const strengthColor=currentStrength==="신강"?C.fire:currentStrength==="신약"?C.water:C.gold;
  const total=sz*2;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <svg width="100%" viewBox={`0 0 ${total} ${total}`} style={{overflow:"visible",maxWidth:compact?140:200}}>
        <rect width={total} height={total} fill="#1e1508" rx="12"/>
        {[0.33,0.66,1.0].map((lv,gi)=>{const gp=ORDER.map((_,i)=>{const a=(i*72-90)*Math.PI/180,rr=(R-8)*lv+8;return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)};});return<path key={gi} d={gp.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z"} fill="none" stroke="rgba(220,185,120,0.18)" strokeWidth={gi===2?1:0.5}/>;}) }
        {pts.map((p,i)=><line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(220,185,120,0.10)" strokeWidth="0.6"/>)}
        {rd2&&<path d={rd2} fill={`${C.water}0a`} stroke={C.water} strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="3 2"/>}
        <path d={rd1} fill={`${C.gold}08`} stroke={C.gold} strokeWidth="1.5" strokeOpacity="0.75"/>
        {ORDER.map((el,i)=>{const ratio=(cnt1[el]||0)/max1,r=8+(28-8)*ratio,isDay=el===dayEl,fs=compact?9:11;return(<g key={el}><circle cx={pts[i].x} cy={pts[i].y} r={r+3} fill={EC[el]} fillOpacity="0.04"/><circle cx={pts[i].x} cy={pts[i].y} r={r} fill={EC[el]} fillOpacity={0.15+ratio*0.5} stroke={isDay?EC[el]:"none"} strokeWidth={isDay?1.5:0}/><text x={pts[i].x} y={pts[i].y} textAnchor="middle" dominantBaseline="middle" fontSize={r>14?fs:fs-2} fontWeight="900" fontFamily="serif" fill={EC[el]}>{el}</text><text x={pts[i].x} y={pts[i].y+r+7} textAnchor="middle" fontSize={compact?"6":"7"} fill={EC[el]} fillOpacity="0.65">{(cnt1[el]||0).toFixed(1)}</text></g>);})}
        <circle cx={cx} cy={cy} r="10" fill={EC[dayEl]||C.gold} fillOpacity="0.15" stroke={EC[dayEl]||C.gold} strokeWidth="1.2"/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="900" fontFamily="serif" fill={EC[dayEl]||C.gold}>{dayStem}</text>
      </svg>
    </div>
  );
}

// 조후 통변 (기존 유지)
function JohuTab({pillars, johuDetail, selDaeun=null, selSeun=null, birthYear=1990, daeunList=[]}){
  // TCPA 점수 산출
  const tcpaBase = calcTCPA(pillars);
  const tcpaNow = calcTCPA(pillars, selDaeun?.stem, selDaeun?.branch, selSeun?.stem, selSeun?.branch);
  const lBase = tcpaLabel(tcpaBase.sBase);
  const lNow = tcpaLabel(tcpaNow.sTotal);

  // 연도별 추이 (현재 대운 기준 전후 5년)
  const curYear = new Date().getFullYear();
  const trendYears = Array.from({length:7},(_,i)=>curYear-2+i);
  const trendData = trendYears.map(y=>{
    const sy = calcSeun(y);
    // 현재 대운 유지 상태에서 세운만 변경
    const t = calcTCPA(pillars, selDaeun?.stem, selDaeun?.branch, sy.stem, sy.branch);
    return{year:y, val:t.sTotal, label:tcpaLabel(t.sTotal)};
  });

  // 온도계 게이지 (-20 ~ +20)
  const gaugeMin=-20, gaugeMax=20;
  const gaugeVal = Math.max(gaugeMin, Math.min(gaugeMax, tcpaNow.sTotal));
  const gaugePct = (gaugeVal - gaugeMin) / (gaugeMax - gaugeMin) * 100;

  // 꺾은선 그래프 SVG
  const GW=300,GH=80,GPT=14,GPB=20,GPL=24,GPR=10;
  const gW2=GW-GPL-GPR, gH2=GH-GPT-GPB;
  const n=trendData.length;
  const xOf=i=>GPL+i*(gW2/(n-1));
  const yOf=v=>GPT+gH2*(1-(Math.max(gaugeMin,Math.min(gaugeMax,v))-gaugeMin)/(gaugeMax-gaugeMin));
  const pts=trendData.map((d,i)=>({x:xOf(i),y:yOf(d.val)}));
  function lp(pts){if(pts.length<2)return"";let d=`M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;for(let i=1;i<pts.length;i++){const p0=i>1?pts[i-2]:pts[i-1],p1=pts[i-1],p2=pts[i],p3=i<pts.length-1?pts[i+1]:p2;const cp1x=(p1.x+(p2.x-p0.x)*0.2).toFixed(1),cp1y=(p1.y+(p2.y-p0.y)*0.2).toFixed(1),cp2x=(p2.x-(p3.x-p1.x)*0.2).toFixed(1),cp2y=(p2.y-(p3.y-p1.y)*0.2).toFixed(1);d+=` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;}return d;}
  const linePath=lp(pts);
  const fillPath=linePath+` L${pts[n-1].x.toFixed(1)},${(GPT+gH2).toFixed(1)} L${pts[0].x.toFixed(1)},${(GPT+gH2).toFixed(1)}Z`;

  const msgs = getJohuMessages(tcpaNow.sTotal);
  // 조후용신 (온도계에 표시)
  const johuYongsin = tcpaNow.sTotal<=-6?"火":tcpaNow.sTotal>=6?"水":null;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* 조후점수 상태 카드 */}
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{fontSize:"2rem",lineHeight:1}}>{lNow.emoji}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:"1rem",fontWeight:900,color:lNow.color,fontFamily:"'Noto Serif KR',serif"}}>{lNow.label}</div>
            <div style={{fontSize:"0.62rem",color:C.muted,marginTop:2}}>{lNow.sublabel} · 조후점수 <span style={{color:lNow.color,fontWeight:700}}>{tcpaNow.sTotal > 0 ? "+" : ""}{tcpaNow.sTotal}</span></div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"0.52rem",color:C.muted}}>원국기준</div>
            <div style={{fontSize:"0.72rem",color:lBase.color,fontWeight:700}}>{lBase.emoji} {tcpaBase.sBase > 0 ? "+" : ""}{tcpaBase.sBase}</div>
          </div>
        </div>
        {/* 온도계 게이지 + 조후용신 */}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}>
            <span style={{fontSize:"0.52rem",color:"#8040ff"}}>☃️ -20</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:"0.58rem",color:C.muted,fontWeight:700}}>조후 온도계</span>
              {johuYongsin&&(
                <div style={{display:"flex",alignItems:"center",gap:3,padding:"1px 8px",borderRadius:99,background:`${EL_COL[johuYongsin]}22`,border:`1.5px solid ${EL_COL[johuYongsin]}66`}}>
                  <span style={{fontSize:"0.5rem",color:EL_COL[johuYongsin],fontWeight:700}}>조후용신</span>
                  <span style={{fontSize:"1rem",fontFamily:"serif",color:EL_COL[johuYongsin],fontWeight:900}}>{johuYongsin}</span>
                </div>
              )}
            </div>
            <span style={{fontSize:"0.52rem",color:"#ff2020"}}>🌋 +20</span>
          </div>
          <div style={{position:"relative",height:16,borderRadius:99,background:"linear-gradient(to right,#8040ff,#4da0f0,#4ade80,#f5c842,#f55030,#ff2020)",overflow:"visible"}}>
            <div style={{position:"absolute",top:"50%",left:`${gaugePct}%`,transform:"translate(-50%,-50%)",width:18,height:18,borderRadius:"50%",background:"white",border:`3px solid ${lNow.color}`,boxShadow:`0 0 8px ${lNow.color}`,zIndex:2,transition:"left 0.8s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
            <span style={{fontSize:"0.45rem",color:C.muted}}>빙하</span>
            <span style={{fontSize:"0.45rem",color:C.muted}}>냉기</span>
            <span style={{fontSize:"0.45rem",color:"#4ade80",fontWeight:700}}>균형</span>
            <span style={{fontSize:"0.45rem",color:C.muted}}>열기</span>
            <span style={{fontSize:"0.45rem",color:C.muted}}>용암</span>
          </div>
        </div>
        {/* 점수 분해 */}
        {(selDaeun||selSeun)&&(
          <div style={{display:"flex",gap:6,padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:"0.48rem",color:C.muted,marginBottom:2}}>원국</div><div style={{fontSize:"0.82rem",fontWeight:700,color:lBase.color}}>{tcpaBase.sBase>0?"+":""}{tcpaBase.sBase}</div></div>
            {selDaeun&&<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:"0.48rem",color:C.gold,marginBottom:2}}>대운</div><div style={{fontSize:"0.82rem",fontWeight:700,color:C.gold}}>{tcpaNow.sLuck>0?"+":""}{tcpaNow.sLuck}</div></div>}
            {selSeun&&<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:"0.48rem",color:"#86efac",marginBottom:2}}>세운</div><div style={{fontSize:"0.82rem",fontWeight:700,color:"#86efac"}}>{tcpaNow.sYear>0?"+":""}{tcpaNow.sYear}</div></div>}
            <div style={{flex:1,textAlign:"center",borderLeft:"1px solid rgba(255,255,255,0.1)",paddingLeft:6}}><div style={{fontSize:"0.48rem",color:C.muted,marginBottom:2}}>합계</div><div style={{fontSize:"0.9rem",fontWeight:900,color:lNow.color}}>{tcpaNow.sTotal>0?"+":""}{tcpaNow.sTotal}</div></div>
          </div>
        )}
      </Card>
      {/* 4카드: 업무/재정/관계/건강 */}
      {[
        {icon:"💼",label:"업무 · 실행",text:msgs.work,color:lNow.color},
        {icon:"💰",label:"재정 · 소비",text:msgs.finance,color:"#f5c842"},
        {icon:"🤝",label:"관계 · 소통",text:msgs.relation,color:"#86efac"},
        {icon:"❤️",label:"건강",text:msgs.health,color:"#fb923c"},
      ].map(({icon,label,text,color},i)=>(
        <Card key={i}>
          <div style={{display:"flex",gap:10}}>
            <span style={{fontSize:"1.2rem",flexShrink:0,lineHeight:1.4}}>{icon}</span>
            <div>
              <div style={{fontSize:"0.62rem",fontWeight:700,color,marginBottom:5,letterSpacing:"0.08em"}}>{label}</div>
              <div style={{fontSize:"0.7rem",color:"rgba(240,220,180,0.90)",lineHeight:1.75,fontFamily:"'Noto Serif KR',serif"}}>{text}</div>
            </div>
          </div>
        </Card>
      ))}
      {/* 연도별 조후 추이 */}
      <Card>
        <CardTitle style={{marginBottom:8}}>연도별 조후점수 추이</CardTitle>
        <svg width="100%" viewBox={`0 0 ${GW} ${GH}`} style={{overflow:"visible"}}>
          <defs>
            <linearGradient id="johugrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lNow.color} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={lNow.color} stopOpacity="0.02"/>
            </linearGradient>
          </defs>
          <line x1={GPL} y1={yOf(0)} x2={GW-GPR} y2={yOf(0)} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3"/>
          <text x={GPL-3} y={yOf(0)} textAnchor="end" fontSize="7" fill="rgba(255,255,255,0.3)" dominantBaseline="middle">0</text>
          {[5,-5,10,-10].map(v=>(
            <line key={v} x1={GPL} y1={yOf(v)} x2={GW-GPR} y2={yOf(v)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2,4"/>
          ))}
          <path d={fillPath} fill="url(#johugrad)"/>
          <path d={linePath} fill="none" stroke={lNow.color} strokeWidth="2" strokeLinecap="round" opacity="0.85"/>
          {trendData.map((d,i)=>{
            const col=tcpaLabel(d.val).color;
            const isNow=d.year===curYear;
            return(
              <g key={i}>
                <circle cx={pts[i].x} cy={pts[i].y} r={isNow?5:3.5} fill={col} stroke="rgba(0,0,0,0.3)" strokeWidth="1.2"/>
                {isNow&&<circle cx={pts[i].x} cy={pts[i].y} r="8" fill="none" stroke={col} strokeWidth="1" strokeOpacity="0.4"/>}
                <text x={pts[i].x} y={pts[i].y-(isNow?10:8)} textAnchor="middle" fontSize={isNow?"8":"7"} fill={col} fontWeight={isNow?"bold":"normal"}>{d.val>0?"+":""}{d.val}</text>
                <text x={pts[i].x} y={GPT+gH2+12} textAnchor="middle" fontSize="7" fill={isNow?C.goldL:"rgba(220,185,120,0.5)"} fontWeight={isNow?"bold":"normal"}>{d.year}</text>
              </g>
            );
          })}
        </svg>
      </Card>
    </div>
  );
}

function DaeunPanel({daeunList,birthYear,selDaeun,setSelDaeun}){
  const curYear=new Date().getFullYear(),age=curYear-birthYear;
  return(
    <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4}}>
      {daeunList.map((d,i)=>{const isNow=d.startAge<=age&&age<d.startAge+10,isSel=selDaeun?.startYear===d.startYear;return(
        <button key={i} onClick={()=>setSelDaeun(isSel?null:d)} style={{flexShrink:0,width:54,borderRadius:12,padding:"6px 3px 5px",textAlign:"center",background:isSel?`${C.gold}28`:"#2e1e0e",border:isSel?`1.5px solid ${C.gold}70`:"1.5px solid rgba(255,255,255,0.14)",cursor:"pointer",position:"relative"}}>
          {isNow&&<div style={{position:"absolute",top:4,right:4,width:5,height:5,borderRadius:"50%",background:"#4ade80"}}/>}
          <div style={{fontSize:"1.4rem",color:EL_COL[HS_EL[d.stemIdx]],fontFamily:"serif",lineHeight:1}}>{d.stem}</div>
          <div style={{fontSize:"1.4rem",color:EL_COL[EB_EL[d.branchIdx]],fontFamily:"serif",lineHeight:1}}>{d.branch}</div>
          <div style={{fontSize:"0.42rem",color:isSel?C.gold:C.muted,marginTop:2}}>{d.startAge}세</div>
          <div style={{fontSize:"0.38rem",color:C.muted}}>{d.startYear}~</div>
        </button>
      );})}
    </div>
  );
}

const GRADE_VALUE={S:95,"A+":85,A:80,B:60,C:30};
function LifeGraph({daeunList,pillars,dayStem,birthYear,selDaeun,setSelDaeun}){
  const grades=daeunList.map(d=>({...d,g:calcDaeunGrade(pillars,dayStem,d.stem,d.branch)}));
  const vals=grades.map(g=>GRADE_VALUE[g.g.grade]??50);
  const curYear=new Date().getFullYear(),curAge=curYear-birthYear;
  const W=320,H=120,PL=14,PR=14,PT=16,PB=28,gW=W-PL-PR,gH=H-PT-PB,n=grades.length;
  const xOf=i=>PL+i*(gW/(n-1)),yOf=v=>PT+gH*(1-(v-20)/80);
  const pts=vals.map((v,i)=>({x:xOf(i),y:yOf(v)}));
  function bezierPath(pts){if(pts.length<2)return "";let d=`M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;for(let i=0;i<pts.length-1;i++){const p0=i>0?pts[i-1]:pts[i],p1=pts[i],p2=pts[i+1],p3=i+2<pts.length?pts[i+2]:p2;const cp1x=(p1.x+(p2.x-p0.x)*0.2).toFixed(1),cp1y=(p1.y+(p2.y-p0.y)*0.2).toFixed(1),cp2x=(p2.x-(p3.x-p1.x)*0.2).toFixed(1),cp2y=(p2.y-(p3.y-p1.y)*0.2).toFixed(1);d+=` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;}return d;}
  const linePath=bezierPath(pts),fillPath=linePath+` L ${pts[n-1].x.toFixed(1)} ${(PT+gH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PT+gH).toFixed(1)} Z`;
  const nowIdx=grades.findIndex(d=>d.startAge<=curAge&&curAge<d.startAge+10),selIdx=selDaeun?grades.findIndex(d=>d.startYear===selDaeun.startYear):-1;
  const gc={S:"#f5c842","A+":"#4ade80",A:"#86efac",B:C.gold,C:"#fb923c"};
  return(
    <div style={{width:"100%"}}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
        <defs><linearGradient id="lgraph" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity="0.35"/><stop offset="100%" stopColor={C.gold} stopOpacity="0.02"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {[{v:90,l:"S"},{v:75,l:"A"},{v:55,l:"B"},{v:35,l:"C"}].map(({v,l})=><g key={l}><line x1={PL} y1={yOf(v)} x2={W-PR} y2={yOf(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,4"/><text x={PL-4} y={yOf(v)} textAnchor="end" fontSize="7" fill="rgba(220,185,120,0.4)" dominantBaseline="middle">{l}</text></g>)}
        {nowIdx>=0&&<line x1={pts[nowIdx].x} y1={PT} x2={pts[nowIdx].x} y2={PT+gH} stroke="#4ade80" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,3"/>}
        <path d={fillPath} fill="url(#lgraph)"/>
        <path d={linePath} fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" filter="url(#glow)" opacity="0.85"/>
        {grades.map((g,i)=>{const c=gc[g.g.grade]||C.gold,isSel=selIdx===i,isNow=nowIdx===i;return(<g key={i} style={{cursor:"pointer"}} onClick={()=>setSelDaeun(g.startYear===selDaeun?.startYear?null:g)}>{(isSel||isNow)&&<circle cx={pts[i].x} cy={pts[i].y} r="12" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1" strokeOpacity="0.4"/>}<circle cx={pts[i].x} cy={pts[i].y} r={isSel?6:4} fill={c} stroke="rgba(0,0,0,0.4)" strokeWidth="1.5"/><text x={pts[i].x} y={pts[i].y-9} textAnchor="middle" fontSize={isSel?9:7} fill={c} fontWeight={isSel?"bold":"normal"} opacity={isSel?1:0.8}>{g.g.grade}</text><text x={pts[i].x} y={PT+gH+10} textAnchor="middle" fontSize="7.5" fill={isSel?C.goldL:"rgba(220,185,120,0.55)"}>{g.stem}{g.branch}</text><text x={pts[i].x} y={PT+gH+19} textAnchor="middle" fontSize="6" fill="rgba(220,185,120,0.35)">{g.startAge}세</text></g>);})}
        {nowIdx>=0&&<circle cx={pts[nowIdx].x} cy={pts[nowIdx].y} r="3" fill="#4ade80" opacity="0.9"/>}
      </svg>
    </div>
  );
}

function PhysImageCard({title,prompt,dayStem,label,note}){
  const[url,setUrl]=useState(null),[status,setStatus]=useState("idle"),[prog,setProg]=useState(0),[progMsg,setProgMsg]=useState(""),[err,setErr]=useState("");
  const elColor=EL_COL[HS_EL[HS.indexOf(dayStem)]]||C.gold;
  async function generate(){setStatus("loading");setErr("");setProg(0);try{const imgUrl=await generateImage(prompt,(p,m)=>{setProg(p);setProgMsg(m);});setUrl(imgUrl);setStatus("done");}catch(e){setErr(e.message);setStatus("error");}}
  async function save(){if(!url)return;try{const res=await fetch(url);const blob=await res.blob();const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`saju-${label}-${Date.now()}.webp`;a.click();}catch{window.open(url,"_blank");}}
  return(
    <div style={{borderRadius:16,overflow:"hidden",background:"#1e1508",border:"1px solid rgba(210,175,100,0.22)"}}>
      <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.10)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
        <div><div style={{fontSize:"0.72rem",fontWeight:700,color:C.goldL,fontFamily:"'Noto Serif KR',serif"}}>{title}</div>{note&&<div style={{fontSize:"0.56rem",color:C.muted,marginTop:2}}>{note}</div>}</div>
        {status==="done"&&url&&<button onClick={save} style={{flexShrink:0,padding:"4px 10px",borderRadius:8,background:`${C.gold}15`,border:`1px solid ${C.gold}30`,color:C.gold,fontSize:"0.6rem",fontWeight:700,cursor:"pointer"}}>⬇ 저장</button>}
      </div>
      {status==="idle"&&<div style={{height:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}><div style={{fontSize:40,fontFamily:"serif",color:elColor,opacity:0.25,animation:"float 3s ease-in-out infinite"}}>{dayStem}</div><button onClick={generate} style={{padding:"10px 22px",borderRadius:12,background:`${elColor}18`,color:elColor,border:`1px solid ${elColor}40`,cursor:"pointer",fontSize:"0.78rem",fontWeight:700}}>🎬 이미지 생성</button></div>}
      {status==="loading"&&<div style={{height:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:"1.5rem"}}><div style={{fontSize:28,color:elColor,opacity:0.35,fontFamily:"serif",animation:"shimmer 1.5s ease infinite"}}>{dayStem}</div><div style={{width:"100%",maxWidth:180}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:"0.6rem",color:C.muted}}>{progMsg}</span><span style={{fontSize:"0.65rem",fontWeight:700,color:elColor}}>{prog}%</span></div><div style={{height:4,borderRadius:99,background:"rgba(220,185,120,0.14)"}}><div style={{height:"100%",borderRadius:99,background:elColor,width:`${prog}%`,transition:"width 0.4s ease"}}/></div></div></div>}
      {status==="done"&&url&&<img src={url} alt={title} style={{width:"100%",display:"block"}}/>}
      {status==="error"&&<div style={{height:160,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:"1rem"}}><p style={{color:"#ff6a50",fontSize:"0.68rem",margin:0,textAlign:"center"}}>⚠ {err}</p><button onClick={generate} style={{padding:"7px 14px",borderRadius:10,background:`${C.gold}10`,color:C.gold,border:`1px solid ${C.gold}25`,cursor:"pointer",fontSize:"0.7rem"}}>↺ 다시 시도</button></div>}
    </div>
  );
}

// 시뮬레이터 초소형 균일 필러 (오행세력도 옆 4열용)
function MiniPillarCell({p, dayStem, label, isDay=false, accentColor=null}){
  const sc=EL_COL[HS_EL[p.stemIdx]]||C.gold;
  const bc=EL_COL[EB_EL[p.branchIdx]]||C.gold;
  const ss=isDay?"본원":getSS(dayStem,p.stem);
  const bonStem=EBH[p.branch]?.bon?.[0];
  const branchSS=bonStem?getSS(dayStem,bonStem):"";
  const hid=EBH[p.branch]||{};
  const hidItems=[hid.yo,hid.jung,hid.bon].filter(Boolean);
  const uns=dayStem?getUnsung(dayStem,p.branch):"";
  const acc=accentColor;
  const stemBg=isDay?"#2c3e6b":acc?`${acc}18`:"rgba(255,255,255,0.06)";
  const branchBg=isDay?"#2c6b3a":acc?`${acc}10`:"rgba(0,0,0,0.18)";
  const bdr=isDay?"#4a90d9":acc||"rgba(255,255,255,0.1)";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,minWidth:0}}>
      <div style={{fontSize:"0.62rem",fontWeight:700,color:isDay?"#7ab8ff":acc||C.muted}}>{label}</div>
      <div style={{fontSize:"0.54rem",color:isDay?"#7ab8ff":C.muted,background:"rgba(255,255,255,0.06)",borderRadius:4,padding:"0px 4px",marginBottom:1}}>{ss}</div>
      <div style={{width:"100%",padding:"5px 2px",borderRadius:9,background:stemBg,border:`1.5px solid ${bdr}`,textAlign:"center"}}>
        <div style={{fontSize:"1.6rem",lineHeight:1,color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.stem]?900:300}}>{p.stem}</div>
        <div style={{fontSize:"0.5rem",color:sc,fontWeight:700}}>{HS_EL[p.stemIdx]}</div>
      </div>
      <div style={{width:"100%",padding:"5px 2px",borderRadius:9,background:branchBg,border:`1.5px solid ${isDay?"#4aaa6b55":acc?`${acc}35`:"rgba(255,255,255,0.08)"}`,textAlign:"center"}}>
        <div style={{fontSize:"1.6rem",lineHeight:1,color:bc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.branch]?900:300}}>{p.branch}</div>
        <div style={{fontSize:"0.5rem",color:bc,fontWeight:700}}>{EB_EL[p.branchIdx]}</div>
      </div>
      {branchSS&&<div style={{fontSize:"0.52rem",fontWeight:700,color:isDay?"#4aaa6b":C.muted,background:"rgba(255,255,255,0.05)",borderRadius:4,padding:"0px 4px"}}>{branchSS}</div>}
      <div style={{display:"flex",gap:1,justifyContent:"center",flexWrap:"wrap"}}>
        {hidItems.map(([stem,days],j)=>{const hsc=EL_COL[HS_EL[HS.indexOf(stem)]]||C.gold;return<span key={j} style={{fontSize:"0.55rem",color:hsc,fontFamily:"serif",fontWeight:700,background:`${hsc}12`,padding:"0 3px",borderRadius:3}}>{stem}</span>;})}
      </div>
      {uns&&<div style={{fontSize:"0.54rem",fontWeight:700,color:bc,background:`${bc}14`,borderRadius:4,padding:"0px 5px"}}>{uns}</div>}
    </div>
  );
}

// 시뮬레이터 전용 균일 너비 필러 (grid 안에서 사용)
function SimPillarCell({p, dayStem, label, isDay=false, accentColor=null, isAdj=false}){
  const sc=EL_COL[HS_EL[p.stemIdx]]||C.gold;
  const bc=EL_COL[EB_EL[p.branchIdx]]||C.gold;
  const ss=isDay?"본원":getSS(dayStem,p.stem);
  const bonStem=EBH[p.branch]?.bon?.[0];
  const branchSS=bonStem?getSS(dayStem,bonStem):"";
  const hid=EBH[p.branch]||{};
  const hidItems=[hid.yo,hid.jung,hid.bon].filter(Boolean);
  const uns=dayStem?getUnsung(dayStem,p.branch):"";
  const accent=accentColor||null;
  const stemBg=isDay?"#2c3e6b":accent?`${accent}20`:"rgba(255,255,255,0.07)";
  const branchBg=isDay?"#2c6b3a":accent?`${accent}14`:"rgba(0,0,0,0.2)";
  const borderC=isDay?"#4a90d9":accent||"rgba(255,255,255,0.12)";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:0}}>
      <div style={{fontSize:"0.72rem",fontWeight:700,color:isDay?"#7ab8ff":accent||C.muted,letterSpacing:"0.06em"}}>{label}</div>
      <div style={{fontSize:"0.62rem",color:isDay?"#7ab8ff":C.muted,background:"rgba(255,255,255,0.07)",borderRadius:5,padding:"1px 6px"}}>{ss}</div>
      {/* 천간 */}
      <div style={{width:"100%",padding:"8px 2px",borderRadius:12,background:stemBg,border:`2px solid ${borderC}`,textAlign:"center"}}>
        <div style={{fontSize:"2rem",lineHeight:1,color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.stem]?900:300}}>{p.stem}</div>
        <div style={{fontSize:"0.58rem",color:sc,fontWeight:700}}>{HS_EL[p.stemIdx]}</div>
      </div>
      {/* 지지 */}
      <div style={{width:"100%",padding:"8px 2px",borderRadius:12,background:branchBg,border:`2px solid ${isDay?"#4aaa6b55":accent?`${accent}44`:"rgba(255,255,255,0.09)"}`,textAlign:"center"}}>
        <div style={{fontSize:"2rem",lineHeight:1,color:bc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.branch]?900:300}}>{p.branch}</div>
        <div style={{fontSize:"0.58rem",color:bc,fontWeight:700}}>{EB_EL[p.branchIdx]}</div>
      </div>
      {branchSS&&<div style={{fontSize:"0.6rem",fontWeight:700,color:isDay?"#4aaa6b":C.muted,background:"rgba(255,255,255,0.06)",borderRadius:5,padding:"1px 6px"}}>{branchSS}</div>}
      {/* 지장간 */}
      <div style={{display:"flex",gap:2,justifyContent:"center",flexWrap:"wrap"}}>
        {hidItems.map(([stem,days],j)=>{const hsc=EL_COL[HS_EL[HS.indexOf(stem)]]||C.gold;return<div key={j} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"1px 3px",borderRadius:4,background:`${hsc}15`}}><span style={{fontSize:"0.65rem",color:hsc,fontFamily:"serif",fontWeight:700}}>{stem}</span><span style={{fontSize:"0.38rem",color:hsc,opacity:0.7}}>{days}일</span></div>;})}
      </div>
      {uns&&<div style={{fontSize:"0.6rem",fontWeight:700,color:bc,background:`${bc}15`,borderRadius:5,padding:"1px 7px"}}>{uns}</div>}
    </div>
  );
}

// ============================================================
// ★★★ 출산택일 시뮬레이터
// ============================================================
function TaekIlSimulator(){
  const now = new Date();
  const[simYear,setSimYear]=useState(now.getFullYear());
  const[simMonth,setSimMonth]=useState(now.getMonth()+1);
  const[simDay,setSimDay]=useState(now.getDate());
  const[simSijiIdx,setSimSijiIdx]=useState(6); // 午時 기본
  const[simGender,setSimGender]=useState("male");
  const[simSaju,setSimSaju]=useState(null);
  const[simErr,setSimErr]=useState("");
  const[aiResults,setAiResults]=useState([]);
  const[aiLoading,setAiLoading]=useState(false);
  const[aiErr,setAiErr]=useState("");
  // 예정일 (±10일 자동)
  const[centerYear,setCenterYear]=useState(now.getFullYear());
  const[centerMonth,setCenterMonth]=useState(now.getMonth()+1);
  const[centerDay,setCenterDay]=useState(now.getDate());
  // 부모 사주 (엄마/아빠 각각)
  const[momForm,setMomForm]=useState({year:"",month:"",day:"",hour:"12",minute:"0",absent:false});
  const[dadForm,setDadForm]=useState({year:"",month:"",day:"",hour:"12",minute:"0",absent:false});
  const[parentSaju,setParentSaju]=useState(null); // {mom, dad} 형태
  const[showParentForm,setShowParentForm]=useState(false);
  const[selectedResult,setSelectedResult]=useState(null);
  // 이름짓기
  const[nameResult,setNameResult]=useState(null);
  const[nameLoading,setNameLoading]=useState(false);
  const[nameSaju,setNameSaju]=useState(null); // 이름짓기 대상 사주

  function recalc(y,m,d,sijiIdx){
    const err=validateDate(y,m,d);if(err){setSimErr(err);setSimSaju(null);return;}
    setSimErr("");
    try{
      const h=SIJI_HOURS[sijiIdx];
      const r=calcSaju(y,m,d,h,0);
      r.solar={year:y,month:m,day:d,hour:h,minute:0};
      setSimSaju(r);
    }catch(e){setSimErr("계산 오류: "+e.message);}
  }

  useState(()=>{recalc(simYear,simMonth,simDay,simSijiIdx);},[]);

  function handleInput(field,val){
    const ny=field==="year"?+val:simYear;
    const nm=field==="month"?Math.min(12,Math.max(1,+val)):simMonth;
    const nd=field==="day"?Math.min(getMaxDay(ny,nm),Math.max(1,+val)):simDay;
    if(field==="year")setSimYear(ny);
    if(field==="month")setSimMonth(nm);
    if(field==="day")setSimDay(nd);
    recalc(ny,nm,nd,simSijiIdx);
  }
  function handleSiji(delta){
    const ni=((simSijiIdx+delta)%12+12)%12;
    setSimSijiIdx(ni);
    recalc(simYear,simMonth,simDay,ni);
  }

  function runAI(){
    const err=validateDate(centerYear,centerMonth,centerDay);
    if(err){setAiErr(err);return;}
    setAiLoading(true);setAiErr("");setAiResults([]);setSelectedResult(null);setNameResult(null);
    setTimeout(()=>{
      try{
        // 부모 pillars: 엄마+아빠 합쳐서 전달 (있는 것만)
        const pp=parentSaju
          ? [...(parentSaju.mom?.pillars||[]),...(parentSaju.dad?.pillars||[])]
          : null;
        const results=runTaekIlFilter(centerYear,centerMonth,centerDay,simGender,pp.length?pp:null);
        if(results.length===0)setAiErr("해당 범위에서 추천 조합을 찾지 못했습니다.");
        else setAiResults(results);
      }catch(e){setAiErr("오류: "+e.message);}
      setAiLoading(false);
    },100);
  }

  function calcParentSaju(){
    let momSaju=null, dadSaju=null;
    if(!momForm.absent){
      const err=validateDate(momForm.year,momForm.month,momForm.day);
      if(err){alert("엄마 생년월일 오류: "+err);return;}
      try{momSaju=calcSaju(+momForm.year,+momForm.month,+momForm.day,+momForm.hour,+(momForm.minute||0));}
      catch(e){alert("엄마 사주 계산 오류");return;}
    }
    if(!dadForm.absent){
      const err=validateDate(dadForm.year,dadForm.month,dadForm.day);
      if(err){alert("아빠 생년월일 오류: "+err);return;}
      try{dadSaju=calcSaju(+dadForm.year,+dadForm.month,+dadForm.day,+dadForm.hour,+(dadForm.minute||0));}
      catch(e){alert("아빠 사주 계산 오류");return;}
    }
    if(!momSaju&&!dadSaju){alert("부모 사주를 최소 한 명은 입력해주세요.");return;}
    setParentSaju({mom:momSaju,dad:dadSaju});
    setShowParentForm(false);
    alert(`부모 사주 입력 완료! (${momSaju?"엄마 ✅":"엄마 없음"} / ${dadSaju?"아빠 ✅":"아빠 없음"})`);
  }

  // 이름짓기 상태
  const[nameSurname,setNameSurname]=useState(""); // 한글 성씨
  const[nameSurnameLoading,setNameSurnameLoading]=useState(false);
  const[nameSurnameOptions,setNameSurnameOptions]=useState([]); // 한자 후보
  const[selectedSurname,setSelectedSurname]=useState(null); // 선택된 성씨 한자 정보

  // 성씨 한자 후보 조회 (Gemini)
  async function fetchSurnameOptions(hangul){
    if(!hangul.trim()){setNameSurnameOptions([]);return;}
    setNameSurnameLoading(true);
    const GEMINI_KEY=import.meta.env.VITE_GEMINI_API_KEY||"";
    if(!GEMINI_KEY){setNameSurnameOptions([{hanja:"?",oheng:"?",sound_oheng:"?",desc:"API 키 필요"}]);setNameSurnameLoading(false);return;}
    try{
      const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[{text:`한국 성씨 "${hangul}"의 한자 표기 목록을 알려주세요. 반드시 JSON만 응답하세요(다른 텍스트 없이):\n{"options":[{"hanja":"漢字","meaning":"뜻","char_oheng":"자원오행(木/火/土/金/水)","sound_oheng":"발음오행(木/火/土/金/水)","common":true/false}]}`}]}],generationConfig:{temperature:0.1,maxOutputTokens:500}})
      });
      const data=await res.json();
      const text=data?.candidates?.[0]?.content?.parts?.[0]?.text||"";
      const clean=text.replace(/```json[\s\S]*?```/g,m=>m.slice(7,-3)).replace(/```/g,"").trim();
      const parsed=JSON.parse(clean);
      setNameSurnameOptions(parsed.options||[]);
    }catch(e){setNameSurnameOptions([{hanja:"조회 실패",oheng:"?",desc:e.message}]);}
    setNameSurnameLoading(false);
  }

  // 이름짓기 (Gemini API)
  async function saveReport(idx){
    const reportEl=document.getElementById(`report-${idx}`);
    if(!reportEl){alert("리포트 영역을 찾을 수 없습니다.");return;}
    // html2canvas CDN 동적 로드
    if(!window.html2canvas){
      await new Promise((res,rej)=>{
        const s=document.createElement("script");
        s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        s.onload=res;s.onerror=rej;document.head.appendChild(s);
      });
    }
    try{
      const canvas=await window.html2canvas(reportEl,{
        scale:2, // 고해상도 2x
        backgroundColor:"#1a1108",
        useCORS:true,
        logging:false,
      });
      const a=document.createElement("a");
      a.href=canvas.toDataURL("image/png");
      a.download=`출산택일_리포트_${aiResults[idx]?.year||""}${aiResults[idx]?.month||""}${aiResults[idx]?.day||""}.png`;
      a.click();
    }catch(e){alert("저장 오류: "+e.message);}
  }
    setNameLoading(true);setNameResult(null);setNameSaju(saju);
    const {strength,elementScores}=calcStrengthDetail(saju.pillars);
    const tcpaBase=calcTCPA(saju.pillars);
    const yongsin=calcYongsin(saju.pillars,tcpaBase.sBase);
    const dayEl=HS_EL[HS.indexOf(saju.dayStem)];
    // 일간별 성향
    const DAYEL_CHAR={
      甲:"주도적이고 곧은 성격, 리더십과 도전 정신이 강함",
      乙:"섬세하고 유연한 성격, 예술적 감수성과 친화력이 뛰어남",
      丙:"밝고 활발한 성격, 표현력이 풍부하고 사교적",
      丁:"따뜻하고 내면이 깊은 성격, 집중력과 통찰력이 뛰어남",
      戊:"듬직하고 신뢰감 있는 성격, 책임감과 포용력이 강함",
      己:"세심하고 실용적인 성격, 현실 감각과 배려심이 뛰어남",
      庚:"강직하고 결단력 있는 성격, 의리와 추진력이 강함",
      辛:"날카롭고 완벽주의적 성격, 심미안과 분석력이 뛰어남",
      壬:"유연하고 지략이 뛰어난 성격, 적응력과 포용력이 강함",
      癸:"지혜롭고 신중한 성격, 직관력과 창의력이 뛰어남"
    };
    const personality=DAYEL_CHAR[saju.dayStem]||"";
    const surnameInfo=selectedSurname?`성씨: ${nameSurname}(${selectedSurname.hanja}) / 자원오행: ${selectedSurname.char_oheng} / 발음오행: ${selectedSurname.sound_oheng}`:"성씨 미입력 (金씨 범용 기준 적용)";
    const GEMINI_KEY=import.meta.env.VITE_GEMINI_API_KEY||"";
    if(!GEMINI_KEY){
      setNameResult([{hangul:"키 없음",hanja:"—",hanja_detail:"—",sound_oheng:"—",char_oheng:"—",personality:"—",reason_oheng:"—",reason_sound:"—",reason_hanja:"—",reason_surname:"—"}]);
      setNameLoading(false);return;
    }
    const prompt=`당신은 사주명리 기반 한국 아기 이름 전문가입니다. 아래 사주를 분석하여 이름 3가지를 추천하세요.

[사주 정보]
- 일간: ${saju.dayStem}(${dayEl}) | 신강/신약: ${strength}
- 용신 유형: ${yongsin.type} | 1순위 용신: ${yongsin.primary} | 2순위: ${yongsin.secondary||"없음"}
- 조후점수: ${tcpaBase.sBase>0?"+":""}${tcpaBase.sBase} ${yongsin.johuYongsin?`→ 조후용신: ${yongsin.johuYongsin}`:""}
${yongsin.isTrueYongsin?"- ⭐ 진용신: "+yongsin.primary+" (억부+조후 일치, 이름에 강하게 반영)":""}
- 오행분포: ${Object.entries(elementScores).map(([k,v])=>`${k}=${v.toFixed(1)}`).join(" ")}
- 월지: ${saju.pillars[2].branch}(${EB_KR[saju.pillars[2].branchIdx]}월)
- 성별: ${simGender==="male"?"남아":"여아"}
- ${surnameInfo}

[아이 성향 예측] ${personality}

[이름 규칙]
1. 획수(수리성명학) 완전 배제
2. 불용문자 금지: 太山海川光春夏秋冬天地日月悲由 등 거대자연물·부정적 한자
3. 유명 정치인·연예인·범죄자 이름과 동일한 이름 금지
4. 발음오행(초성): ㄱㅋ=木 ㄴㄷㄹㅌ=火 ㅇㅎ=土 ㅅㅈㅊ=金 ㅁㅂㅍ=水
5. 자원오행(한자부수): 용신 오행 부수 우선
6. 성씨 오행과 이름 첫글자 상극 금지
7. 현대적이고 부르기 쉬운 이름
8. 대법원 인명용 한자 사용

반드시 JSON만 응답 (다른 텍스트 없이):
{"names":[{"hangul":"두글자","hanja":"두글자","hanja_detail":"한자1(음/훈) 한자2(음/훈)","personality":"이 사주를 가진 아이의 성향과 특징 2~3문장","reason_oheng":"① 왜 이 오행인가 — 용신과의 연결 설명","reason_sound":"② 왜 이 발음인가 — 초성 발음오행 설명","reason_hanja":"③ 왜 이 한자인가 — 자원오행+한자 의미 설명","reason_surname":"④ 성씨와의 조화 — 상극 여부와 오행 흐름 설명"}]}`;
    try{
      const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.7,maxOutputTokens:1500}})
      });
      if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err?.error?.message||`HTTP ${res.status}`);}
      const data=await res.json();
      const text=data?.candidates?.[0]?.content?.parts?.[0]?.text||"";
      const clean=text.replace(/```json[\s\S]*?```/g,m=>m.slice(7,-3)).replace(/```/g,"").trim();
      const parsed=JSON.parse(clean);
      setNameResult(parsed.names||[]);
    }catch(e){
      setNameResult([{hangul:"오류",hanja:"—",hanja_detail:"—",personality:"—",reason_oheng:"—",reason_sound:"—",reason_hanja:"—",reason_surname:"이름 생성 오류: "+e.message}]);
    }
    setNameLoading(false);
  }

  const sResult=simSaju?calcStrengthDetail(simSaju.pillars):null;
  const strength=sResult?.strength;
  const strengthColor=strengthColor5(strength);
  function scoreColor(s){if(s>=80)return"#f5c842";if(s>=65)return"#4ade80";if(s>=50)return C.gold;return"#fb923c";}

  // 시뮬 대운
  const simDaeunList = simSaju ? calcDaeun(simYear,simMonth,simDay,simGender,simSaju.pillars[2]) : [];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card>
        <CardTitle>출산택일 시뮬레이터</CardTitle>

        {/* 성별 */}
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[["male","아들 ♂"],["female","딸 ♀"]].map(([v,l])=>(
            <button key={v} onClick={()=>setSimGender(v)} style={{flex:1,padding:10,borderRadius:12,background:simGender===v?`${C.gold}28`:"rgba(255,255,255,0.07)",color:simGender===v?C.gold:`${C.gold}88`,border:simGender===v?`1.5px solid ${C.gold}70`:"1.5px solid rgba(255,255,255,0.14)",cursor:"pointer",fontWeight:700,fontSize:"0.82rem"}}>{l}</button>
          ))}
        </div>

        {/* 연/월/일 입력 */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["year","연도",simYear,1900,2030],["month","월",simMonth,1,12],["day","일",simDay,1,31]].map(([field,label,val,mn,mx])=>(
            <div key={field} style={{flex:field==="year"?2:1}}>
              <label style={{fontSize:"0.58rem",color:C.muted,display:"block",marginBottom:4,textAlign:"center"}}>{label}</label>
              <input type="number" min={mn} max={mx} value={val}
                onChange={e=>handleInput(field,e.target.value)}
                style={{width:"100%",padding:"10px 6px",borderRadius:12,border:"1.5px solid rgba(215,180,105,0.32)",background:"rgba(255,255,255,0.08)",color:C.text,fontSize:"0.92rem",outline:"none",textAlign:"center"}}/>
            </div>
          ))}
        </div>

        {/* 사주판: 오행세력도(좌) + 4주(우) 균일 그리드 */}
        {simSaju && (
          <div style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:8}}>
            {/* 오행세력도 좌측 */}
            <div style={{flexShrink:0,width:90}}>
              <Pentagon pillars={simSaju.pillars} dayStem={simSaju.dayStem} elementScores={sResult?.elementScores} strength={strength} compact/>
            </div>
            {/* 4주 균일 그리드 */}
            <div style={{flex:1,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3}}>
              {/* 시주 */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <button onClick={()=>handleSiji(1)} style={{width:"100%",padding:"3px 0",borderRadius:6,background:`${C.gold}18`,border:`1px solid ${C.gold}40`,color:C.gold,fontSize:"0.75rem",cursor:"pointer",fontWeight:900,lineHeight:1}}>▲</button>
                <MiniPillarCell p={simSaju.pillars[0]} dayStem={simSaju.dayStem} label="시주" accentColor={C.gold}/>
                <div style={{padding:"2px 3px",borderRadius:5,background:`${C.gold}12`,textAlign:"center",width:"100%"}}>
                  <div style={{fontSize:"0.42rem",color:C.gold,fontWeight:700,lineHeight:1.3}}>{EB_KR[simSaju.pillars[0].branchIdx]}시</div>
                </div>
                <button onClick={()=>handleSiji(-1)} style={{width:"100%",padding:"3px 0",borderRadius:6,background:`${C.gold}18`,border:`1px solid ${C.gold}40`,color:C.gold,fontSize:"0.75rem",cursor:"pointer",fontWeight:900,lineHeight:1}}>▼</button>
              </div>
              {/* 일주~연주 */}
              {[1,2,3].map(i=>(
                <MiniPillarCell key={i} p={simSaju.pillars[i]} dayStem={simSaju.dayStem}
                  label={["일주","월주","연주"][i-1]} isDay={i===1}/>
              ))}
            </div>
          </div>
        )}
        {simErr&&<div style={{color:"#ff6a50",fontSize:"0.68rem",textAlign:"center",marginBottom:6}}>{simErr}</div>}

        {/* 사주 특징 — 억부/조후 용신 명시 (새 워터폴 엔진) */}
        {simSaju&&sResult&&(()=>{
          const tcpaBase=calcTCPA(simSaju.pillars);
          const yongsin=calcYongsin(simSaju.pillars,tcpaBase.sBase);
          const sc5=strengthColor5(strength);
          return(
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <span style={{padding:"3px 10px",borderRadius:99,background:`${sc5}22`,border:`1px solid ${sc5}44`,fontSize:"0.68rem",fontWeight:700,color:sc5}}>{strength}</span>
              {/* 억부용신 테두리박스 */}
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:9,background:"rgba(255,255,255,0.05)",border:`1.5px solid ${EL_COL[yongsin.primary]||C.gold}66`}}>
                <span style={{fontSize:"0.56rem",color:C.muted}}>억부</span>
                <span style={{fontSize:"0.85rem",fontFamily:"serif",fontWeight:900,color:EL_COL[yongsin.primary]||C.gold}}>{yongsin.primary}</span>
                {yongsin.isTrueYongsin&&<span style={{fontSize:"0.5rem",color:"#f5c842"}}>⭐진</span>}
              </div>
              {/* 조후용신 테두리박스 (있을 때만) */}
              {yongsin.johuYongsin&&yongsin.johuYongsin!==yongsin.primary&&(
                <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:9,background:"rgba(255,255,255,0.04)",border:`1.5px dashed ${EL_COL[yongsin.johuYongsin]||C.gold}55`}}>
                  <span style={{fontSize:"0.56rem",color:C.muted}}>조후</span>
                  <span style={{fontSize:"0.85rem",fontFamily:"serif",fontWeight:900,color:EL_COL[yongsin.johuYongsin]||C.gold}}>{yongsin.johuYongsin}</span>
                </div>
              )}
              <span style={{fontSize:"0.56rem",color:C.muted,alignSelf:"center"}}>{yongsin.type}</span>
            </div>
          );
        })()}

        {/* 대운 (10개, 원국 바로 아래) */}
        {simDaeunList.length>0&&(
          <div style={{borderTop:"1px solid rgba(215,180,105,0.15)",paddingTop:8,marginTop:2}}>
            <div style={{fontSize:"0.52rem",color:C.muted,marginBottom:5,fontWeight:700}}>▶ 대운</div>
            <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:3}}>
              {simDaeunList.slice(0,10).map((d,i)=>{
                const curAge2=simYear?0:0; // 출생연도 기준 현재 나이 계산
                const sc=EL_COL[HS_EL[d.stemIdx]],bc=EL_COL[EB_EL[d.branchIdx]];
                return(
                  <div key={i} style={{flexShrink:0,textAlign:"center",padding:"4px 4px 3px",borderRadius:9,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.11)",minWidth:38}}>
                    <div style={{fontSize:"0.38rem",color:C.muted,marginBottom:1}}>{d.startAge}세</div>
                    <div style={{fontSize:"1.15rem",color:sc,fontFamily:"serif",fontWeight:KANJI_YANG[d.stem]?900:300,lineHeight:1}}>{d.stem}</div>
                    <div style={{fontSize:"1.15rem",color:bc,fontFamily:"serif",fontWeight:KANJI_YANG[d.branch]?900:300,lineHeight:1}}>{d.branch}</div>
                    <div style={{fontSize:"0.34rem",color:C.muted}}>{d.startYear}~</div>
                  </div>
                );
              })}
            </div>
            {/* 대운 인생 그래프 */}
            {simDaeunList.length>=2&&(
              <div style={{marginTop:8}}>
                <LifeGraph daeunList={simDaeunList} pillars={simSaju.pillars} dayStem={simSaju.dayStem} birthYear={simYear} selDaeun={null} setSelDaeun={()=>{}}/>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* AI 추천 */}
      <Card>
        <CardTitle>✦ AI 택일 추천</CardTitle>
        <p style={{fontSize:"0.6rem",color:C.muted,textAlign:"center",marginBottom:12,lineHeight:1.7}}>예정일 기준 ±10일 · 대운 가중평균 반영 · 통관 보정</p>

        {/* 예정일 입력 */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:"0.58rem",color:C.muted,marginBottom:5,fontWeight:700}}>예정일 입력</div>
          <div style={{display:"flex",gap:6}}>
            {[["연도",centerYear,setCenterYear,1900,2030,2],["월",centerMonth,setCenterMonth,1,12,1],["일",centerDay,setCenterDay,1,31,1]].map(([label,val,setter,mn,mx,flex])=>(
              <div key={label} style={{flex}}>
                <label style={{fontSize:"0.52rem",color:C.muted,display:"block",marginBottom:3,textAlign:"center"}}>{label}</label>
                <input type="number" min={mn} max={mx} value={val} onChange={e=>setter(+e.target.value)} style={{width:"100%",padding:"8px 4px",borderRadius:9,border:"1.5px solid rgba(215,180,105,0.25)",background:"rgba(255,255,255,0.07)",color:C.text,fontSize:"0.88rem",outline:"none",textAlign:"center"}}/>
              </div>
            ))}
          </div>
        </div>

        {/* 부모 사주 (선택) */}
        <div style={{marginBottom:12}}>
          <button onClick={()=>setShowParentForm(v=>!v)} style={{width:"100%",padding:"7px 12px",borderRadius:9,background:"rgba(255,255,255,0.05)",border:`1px solid rgba(255,255,255,${showParentForm?0.2:0.1})`,color:parentSaju?"#4ade80":C.muted,fontSize:"0.62rem",cursor:"pointer",textAlign:"left",fontWeight:700}}>
            {parentSaju
              ?`✅ 부모 사주 입력됨 (${parentSaju.mom?"엄마 ✅":"엄마 없음"} / ${parentSaju.dad?"아빠 ✅":"아빠 없음"})`
              :"👪 부모 사주 입력 (선택) — 자녀-부모 적합도 반영"} {showParentForm?"▲":"▼"}
          </button>
          {showParentForm&&(
            <div style={{marginTop:8,padding:"12px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{fontSize:"0.56rem",color:C.muted,marginBottom:10}}>자녀-부모 천간 충 여부 및 용신 보강 여부를 분석합니다.</div>
              {/* 엄마 */}
              {[["엄마","#f9a8d4",momForm,setMomForm],["아빠","#93c5fd",dadForm,setDadForm]].map(([label,color,form,setForm])=>(
                <div key={label} style={{marginBottom:12,padding:"10px",borderRadius:9,background:`${color}08`,border:`1px solid ${color}25`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:"0.65rem",fontWeight:700,color}}>{label}</span>
                    <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                      <input type="checkbox" checked={form.absent} onChange={e=>setForm(f=>({...f,absent:e.target.checked}))} style={{cursor:"pointer"}}/>
                      <span style={{fontSize:"0.56rem",color:C.muted}}>없음</span>
                    </label>
                  </div>
                  {!form.absent&&(
                    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:4}}>
                      {[["연도","year",1900,2030],["월","month",1,12],["일","day",1,31],["시","hour",0,23],["분","minute",0,59]].map(([l,k,mn,mx])=>(
                        <div key={k}>
                          <label style={{fontSize:"0.48rem",color:C.muted,display:"block",marginBottom:2,textAlign:"center"}}>{l}</label>
                          <input type="number" min={mn} max={mx} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{width:"100%",padding:"6px 2px",borderRadius:7,border:`1px solid ${color}30`,background:"rgba(255,255,255,0.06)",color:C.text,fontSize:"0.8rem",outline:"none",textAlign:"center"}}/>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.absent&&<div style={{fontSize:"0.56rem",color:C.muted,textAlign:"center",padding:"6px 0"}}>해당 부모 사주를 고려하지 않습니다</div>}
                </div>
              ))}
              <GoldBtn onClick={calcParentSaju} style={{width:"100%",padding:"8px 0",fontSize:"0.75rem"}}>부모 사주 계산</GoldBtn>
            </div>
          )}
        </div>

        <GoldBtn onClick={runAI} disabled={aiLoading} style={{width:"100%",marginBottom:10,padding:12}}>
          {aiLoading
            ?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{display:"inline-block",width:14,height:14,border:"2px solid #160c00",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>분석 중...</span>
            :"🔍 AI 추천 분석하기"}
        </GoldBtn>
        {aiErr&&<div style={{color:"#ff6a50",fontSize:"0.68rem",textAlign:"center",marginBottom:8}}>{aiErr}</div>}

        {aiResults.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {aiResults.map((res,idx)=>{
              const sc=scoreColor(res.score);
              const isSel=selectedResult===idx;
              const saju=res.saju;
              const sc5=strengthColor5(res.strength);
              return(
                <div key={idx}>
                  <button onClick={()=>setSelectedResult(isSel?null:idx)} style={{width:"100%",textAlign:"left",padding:"12px 12px",borderRadius:14,background:isSel?`${sc}15`:"rgba(255,255,255,0.05)",border:`1.5px solid ${isSel?sc:sc+"44"}`,cursor:"pointer",transition:"all 0.2s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:`${sc}22`,border:`2px solid ${sc}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:"0.72rem",fontWeight:900,color:sc}}>#{idx+1}</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"0.85rem",fontWeight:700,color:C.goldL,fontFamily:"'Noto Serif KR',serif"}}>{res.year}년 {res.month}월 {res.day}일 · {SIJI_LABELS[res.sijiIdx]}</div>
                        <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:"0.58rem",color:sc,background:`${sc}18`,padding:"1px 7px",borderRadius:99,fontWeight:700}}>최종 {res.score}점</span>
                          <span style={{fontSize:"0.55rem",color:sc,padding:"1px 6px",borderRadius:99,fontWeight:600,opacity:0.8}}>원국 {res.rawScore}점</span>
                          {res.daeunAvg&&<span style={{fontSize:"0.55rem",color:C.gold,padding:"1px 6px",borderRadius:99,fontWeight:600}}>대운평균 {res.daeunAvg}점</span>}
                          <span style={{fontSize:"0.55rem",color:sc5,background:`${sc5}15`,padding:"1px 6px",borderRadius:99,fontWeight:700}}>{res.strength}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3}}>
                      {saju.pillars.map((p,i)=>{
                        const sc2=EL_COL[HS_EL[p.stemIdx]],bc2=EL_COL[EB_EL[p.branchIdx]];
                        return(
                          <div key={i} style={{textAlign:"center",padding:"4px 2px",borderRadius:8,background:i===1?"rgba(74,144,217,0.15)":"rgba(255,255,255,0.04)",border:i===1?"1px solid rgba(74,144,217,0.3)":"1px solid rgba(255,255,255,0.08)"}}>
                            <div style={{fontSize:"0.4rem",color:C.muted,marginBottom:1}}>{["시","일","월","년"][i]}</div>
                            <div style={{fontSize:"1.1rem",color:sc2,fontFamily:"serif",fontWeight:KANJI_YANG[p.stem]?900:300,lineHeight:1}}>{p.stem}</div>
                            <div style={{fontSize:"1.1rem",color:bc2,fontFamily:"serif",fontWeight:KANJI_YANG[p.branch]?900:300,lineHeight:1}}>{p.branch}</div>
                          </div>
                        );
                      })}
                    </div>
                  </button>

                  {isSel&&(
                    <div id={`report-${idx}`} style={{margin:"4px 0 0",padding:"14px",borderRadius:12,background:`${sc}08`,border:`1px solid ${sc}25`,animation:"slideUp 0.2s ease"}}>
                      <div style={{fontSize:"0.72rem",fontWeight:700,color:sc,marginBottom:10}}>📋 상세 분석 리포트</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:12}}>
                        {saju.pillars.map((p,i)=>(
                          <SimPillarCell key={i} p={p} dayStem={saju.dayStem} label={["시주","일주","월주","연주"][i]} isDay={i===1}/>
                        ))}
                      </div>
                      {/* 억부/조후 용신 — 새 워터폴 엔진 */}
                      {(()=>{
                        const tcpaB=calcTCPA(saju.pillars);
                        const ys=calcYongsin(saju.pillars,tcpaB.sBase);
                        return(
                          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,padding:"7px 10px",borderRadius:9,background:"rgba(255,255,255,0.05)"}}>
                            <div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:8,background:`${EL_COL[ys.primary]||C.gold}18`,border:`1.5px solid ${EL_COL[ys.primary]||C.gold}55`}}>
                              <span style={{fontSize:"0.56rem",color:C.muted}}>억부</span>
                              <span style={{fontSize:"0.85rem",fontFamily:"serif",fontWeight:900,color:EL_COL[ys.primary]||C.gold}}>{ys.primary}</span>
                              {ys.isTrueYongsin&&<span style={{fontSize:"0.5rem",color:"#f5c842"}}>⭐진용신</span>}
                            </div>
                            {ys.johuYongsin&&ys.johuYongsin!==ys.primary&&(
                              <div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:8,background:`${EL_COL[ys.johuYongsin]||C.gold}12`,border:`1.5px dashed ${EL_COL[ys.johuYongsin]||C.gold}44`}}>
                                <span style={{fontSize:"0.56rem",color:C.muted}}>조후</span>
                                <span style={{fontSize:"0.85rem",fontFamily:"serif",fontWeight:900,color:EL_COL[ys.johuYongsin]||C.gold}}>{ys.johuYongsin}</span>
                              </div>
                            )}
                            <span style={{fontSize:"0.54rem",color:C.muted,alignSelf:"center"}}>{ys.type}</span>
                          </div>
                        );
                      })()}
                      {res.goods.length>0&&(
                        <div style={{marginBottom:8}}>
                          <div style={{fontSize:"0.6rem",color:"#4ade80",fontWeight:700,marginBottom:5}}>✅ 길한 구조</div>
                          {res.goods.map((g,i)=><div key={i} style={{fontSize:"0.64rem",color:"rgba(74,222,128,0.9)",marginBottom:3,display:"flex",gap:5,lineHeight:1.5}}><span>•</span><span>{g}</span></div>)}
                        </div>
                      )}
                      {res.flags.length>0&&(
                        <div style={{marginBottom:8}}>
                          <div style={{fontSize:"0.6rem",color:"#fb923c",fontWeight:700,marginBottom:5}}>⚠️ 주의 항목</div>
                          {res.flags.map((f,i)=><div key={i} style={{fontSize:"0.64rem",color:"rgba(251,146,60,0.9)",marginBottom:3,display:"flex",gap:5,lineHeight:1.5}}><span>•</span><span>{f}</span></div>)}
                      </div>
                      )}
                      {/* 점수 분해 */}
                      <div style={{display:"flex",gap:6,padding:"8px 10px",borderRadius:9,background:"rgba(255,255,255,0.05)",marginBottom:10}}>
                        <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:"0.48rem",color:C.muted}}>원국점수</div><div style={{fontSize:"0.85rem",fontWeight:700,color:sc}}>{res.rawScore}</div></div>
                        <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:"0.48rem",color:C.gold}}>대운평균</div><div style={{fontSize:"0.85rem",fontWeight:700,color:C.gold}}>{res.daeunAvg||"-"}</div></div>
                        {res.tongGwanBonus>0&&<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:"0.48rem",color:"#86efac"}}>통관보정</div><div style={{fontSize:"0.85rem",fontWeight:700,color:"#86efac"}}>+{res.tongGwanBonus}</div></div>}
                        {res.parentBonus!==0&&<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:"0.48rem",color:"#c084fc"}}>부모적합</div><div style={{fontSize:"0.85rem",fontWeight:700,color:"#c084fc"}}>{res.parentBonus>0?"+":""}{res.parentBonus}</div></div>}
                        <div style={{flex:1,textAlign:"center",borderLeft:"1px solid rgba(255,255,255,0.1)"}}><div style={{fontSize:"0.48rem",color:C.muted}}>최종</div><div style={{fontSize:"0.9rem",fontWeight:900,color:sc}}>{res.score}</div></div>
                      </div>
                      {/* 성씨 입력 + 이름짓기 버튼 */}
                      <div style={{marginBottom:8}}>
                        <div style={{fontSize:"0.58rem",color:C.muted,marginBottom:5,fontWeight:700}}>아이 성씨 (선택)</div>
                        <div style={{display:"flex",gap:6,marginBottom:6}}>
                          <input value={nameSurname} onChange={e=>{setNameSurname(e.target.value);setSelectedSurname(null);setNameSurnameOptions([]);}} placeholder="한글 성씨 입력 (예: 김)" style={{flex:1,padding:"7px 10px",borderRadius:9,border:"1px solid rgba(215,180,105,0.3)",background:"rgba(255,255,255,0.07)",color:C.text,fontSize:"0.85rem",outline:"none"}}/>
                          <button onClick={()=>fetchSurnameOptions(nameSurname)} disabled={nameSurnameLoading||!nameSurname} style={{padding:"7px 12px",borderRadius:9,background:`${C.gold}22`,border:`1px solid ${C.gold}44`,color:C.goldL,fontSize:"0.72rem",cursor:"pointer",fontWeight:700}}>
                            {nameSurnameLoading?"조회중...":"한자 조회"}
                          </button>
                        </div>
                        {nameSurnameOptions.length>0&&(
                          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                            {nameSurnameOptions.map((opt,oi)=>(
                              <button key={oi} onClick={()=>setSelectedSurname(opt)} style={{padding:"4px 10px",borderRadius:8,background:selectedSurname===opt?`${C.gold}30`:"rgba(255,255,255,0.07)",border:selectedSurname===opt?`1.5px solid ${C.gold}`:"1px solid rgba(255,255,255,0.15)",color:selectedSurname===opt?C.goldL:C.text,cursor:"pointer",fontSize:"0.72rem",fontWeight:selectedSurname===opt?700:400}}>
                                {nameSurname}{opt.hanja} <span style={{fontSize:"0.6rem",color:C.muted}}>({opt.char_oheng})</span>
                                {opt.common&&<span style={{fontSize:"0.5rem",color:"#4ade80",marginLeft:3}}>주요</span>}
                              </button>
                            ))}
                          </div>
                        )}
                        {selectedSurname&&<div style={{fontSize:"0.56rem",color:"#4ade80",marginBottom:4}}>✅ {nameSurname}({selectedSurname.hanja}) 선택됨 — 자원오행: {selectedSurname.char_oheng} / 발음오행: {selectedSurname.sound_oheng}</div>}
                      </div>
                      <button onClick={()=>generateNames(saju)} disabled={nameLoading&&nameSaju===saju} style={{width:"100%",padding:"10px 0",borderRadius:10,background:`linear-gradient(135deg,${C.gold}22,${C.goldD}22)`,border:`1.5px solid ${C.gold}55`,color:C.goldL,fontSize:"0.75rem",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",marginBottom:nameResult&&nameSaju===saju?10:0}}>
                        {nameLoading&&nameSaju===saju?"✨ 이름 생성 중...":"✨ 이름 짓기 (AI 추천 3가지)"}
                      </button>
                      {/* 이름 결과 */}
                      {nameResult&&nameSaju===saju&&(
                        <div style={{display:"flex",flexDirection:"column",gap:10,animation:"slideUp 0.2s ease"}}>
                          {nameResult.map((n,ni)=>(
                            <div key={ni} style={{padding:"14px",borderRadius:14,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.gold}35`}}>
                              {/* 이름 헤더 */}
                              <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8}}>
                                <span style={{fontSize:"1.6rem",fontWeight:900,color:C.goldL,fontFamily:"'Noto Serif KR',serif",letterSpacing:"0.12em"}}>{nameSurname||""}{n.hangul}</span>
                                <span style={{fontSize:"1.1rem",color:C.gold,fontFamily:"serif"}}>{selectedSurname?.hanja||""}{n.hanja}</span>
                                <span style={{fontSize:"0.6rem",color:C.muted,lineHeight:1.5}}>{n.hanja_detail}</span>
                              </div>
                              {/* 아이 성향 */}
                              {n.personality&&(
                                <div style={{padding:"8px 10px",borderRadius:9,background:`${C.gold}10`,border:`1px solid ${C.gold}25`,marginBottom:8}}>
                                  <div style={{fontSize:"0.55rem",color:C.gold,fontWeight:700,marginBottom:3}}>🌟 이 아이의 성향</div>
                                  <div style={{fontSize:"0.68rem",color:"rgba(240,220,180,0.90)",lineHeight:1.7,fontFamily:"'Noto Serif KR',serif"}}>{n.personality}</div>
                                </div>
                              )}
                              {/* 4분할 근거 */}
                              {[
                                {icon:"🔥",label:"① 왜 이 오행인가",text:n.reason_oheng,color:lNow?.color||C.gold},
                                {icon:"🔊",label:"② 왜 이 발음인가",text:n.reason_sound,color:"#86efac"},
                                {icon:"漢",label:"③ 왜 이 한자인가",text:n.reason_hanja,color:C.gold},
                                {icon:"👨‍👩‍👧",label:"④ 성씨와의 조화",text:n.reason_surname,color:"#c084fc"},
                              ].filter(r=>r.text&&r.text!=="—").map(({icon,label,text,color},ri)=>(
                                <div key={ri} style={{display:"flex",gap:8,padding:"7px 10px",borderRadius:8,background:`${color}08`,border:`1px solid ${color}20`,marginBottom:ri<3?5:0}}>
                                  <span style={{flexShrink:0,fontSize:"0.9rem",lineHeight:1.5}}>{icon}</span>
                                  <div>
                                    <div style={{fontSize:"0.55rem",color,fontWeight:700,marginBottom:2}}>{label}</div>
                                    <div style={{fontSize:"0.66rem",color:"rgba(240,220,180,0.88)",lineHeight:1.65,fontFamily:"'Noto Serif KR',serif"}}>{text}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                          {/* 재시도 버튼 */}
                          <button onClick={()=>generateNames(saju)} style={{padding:"7px 0",borderRadius:9,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.15)",color:C.muted,fontSize:"0.65rem",cursor:"pointer"}}>↺ 다시 생성</button>
                        </div>
                      )}
                      {/* 리포트 저장 */}
                      <button onClick={()=>saveReport(idx)} style={{width:"100%",marginTop:10,padding:"10px 0",borderRadius:10,background:`linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.08))`,border:"1.5px solid rgba(74,222,128,0.4)",color:"#4ade80",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em"}}>
                        📥 리포트 이미지로 저장
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function CompatResult({compat,s1,s2,name1,name2}){
  const{score,details}=compat,{label,color}=compatLabel(score),r=48,circ=2*Math.PI*r;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card><div style={{display:"flex",alignItems:"center",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",width:110,height:110}}><svg width="110" height="110" viewBox="0 0 110 110"><circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="9"/><circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9" strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round" transform="rotate(-90 55 55)" style={{transition:"stroke-dashoffset 1.5s ease"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:"1.8rem",fontWeight:900,color,lineHeight:1}}>{score}</span><span style={{fontSize:"0.46rem",color,opacity:0.7}}>/ 100</span></div></div>
        <div><div style={{fontSize:"1.1rem",fontWeight:900,color,fontFamily:"'Noto Serif KR',serif",marginBottom:5}}>{label}</div><div style={{fontSize:"0.62rem",color:C.muted,lineHeight:1.8}}>{name1} × {name2}<br/>일간 <span style={{color:EL_COL[HS_EL[s1.pillars[1].stemIdx]]}}>{s1.pillars[1].stem}</span>·<span style={{color:EL_COL[HS_EL[s2.pillars[1].stemIdx]]}}>{s2.pillars[1].stem}</span></div></div>
      </div></Card>
      <Card><CardTitle>궁합 세부 분석</CardTitle><div style={{display:"flex",flexDirection:"column",gap:8}}>{details.map((d,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 11px",borderRadius:11,background:d.positive?`${C.gold}12`:`${C.red}10`,border:`1px solid ${d.positive?C.gold:C.red}30`}}><span style={{fontSize:"1rem",flexShrink:0,color:d.positive?C.gold:C.red,lineHeight:1.2,marginTop:1}}>{d.icon}</span><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}><span style={{fontSize:"0.7rem",fontWeight:700,color:d.positive?C.gold:C.red,fontFamily:"'Noto Serif KR',serif"}}>{d.type}</span>{d.pts!==0&&<span style={{fontSize:"0.56rem",color:d.positive?"#4ade80":C.red,background:d.positive?"rgba(74,222,128,0.1)":"rgba(224,80,64,0.1)",padding:"1px 5px",borderRadius:5,fontWeight:700}}>{d.pts>0?"+":""}{d.pts}점</span>}</div><p style={{fontSize:"0.66rem",color:C.muted,lineHeight:1.6}}>{d.desc}</p></div></div>)}</div></Card>
      <Card><CardTitle>오행 세력 비교</CardTitle><Pentagon pillars={s1.pillars} dayStem={s1.dayStem} pillars2={s2.pillars}/></Card>
    </div>
  );
}

export default function App(){
  const[screen,setScreen]=useState("input");
  const[form,setForm]=useState({name:"",year:"1990",month:"1",day:"1",hour:"12",minute:"0",gender:"male"});
  const[form2,setForm2]=useState({name:"",year:"1992",month:"6",day:"15",hour:"12",minute:"0",gender:"female"});
  useState(()=>{ensureLunar(()=>{});});
  const[saju,setSaju]=useState(null),[saju2,setSaju2]=useState(null);
  const[daeunList,setDaeunList]=useState([]),[selDaeun,setSelDaeun]=useState(null);
  const[selSeun,setSelSeun]=useState(null);
  const[imgKey,setImgKey]=useState(0),[tab,setTab]=useState("chart");
  const[err,setErr]=useState(""),[compat,setCompat]=useState(null),[compatErr,setCompatErr]=useState("");

  function handleCalc(){
    setErr("");
    const de=validateDate(form.year,form.month,form.day);if(de){setErr(de);return;}
    const te=validateTime(form.hour,form.minute);if(te){setErr(te);return;}
    try{
      const r=calcSaju(+form.year,+form.month,+form.day,+form.hour,+form.minute);
      const dl=calcDaeun(+form.year,+form.month,+form.day,form.gender,r.pillars[2]);
      setSaju(r);setDaeunList(dl);
      const curAge=new Date().getFullYear()-+form.year;
      const cur=dl.find((d,i)=>d.startAge<=curAge&&(dl[i+1]?dl[i+1].startAge>curAge:true));
      setSelDaeun(cur||null);setSelSeun(null);setImgKey(0);setSaju2(null);setCompat(null);setTab("chart");setScreen("result");
    }catch(e){setErr("계산 오류: "+e.message);}
  }
  function handleCompat(){
    setCompatErr("");
    const de=validateDate(form2.year,form2.month,form2.day);if(de){setCompatErr(de);return;}
    try{const r2=calcSaju(+form2.year,+form2.month,+form2.day,+form2.hour,+form2.minute);setSaju2(r2);setCompat(calcCompatScore(saju,r2));}
    catch(e){setCompatErr("오류: "+e.message);}
  }

  if(screen==="input") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
      <style>{globalStyle}</style>
      <div style={{padding:"60px 24px 24px",textAlign:"center",background:`linear-gradient(180deg,#3c2410 0%,${C.bg} 100%)`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% -10%, rgba(201,169,110,0.07) 0%, transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-55%)",fontSize:"18rem",fontFamily:"'Noto Serif KR',serif",fontWeight:900,color:"transparent",WebkitTextStroke:"1px rgba(220,185,120,0.08)",userSelect:"none",pointerEvents:"none",lineHeight:1}}>命</div>
        <div style={{position:"relative",zIndex:1,animation:"fadeIn 0.7s ease"}}>
          <div style={{fontSize:"5.5rem",fontFamily:"'Noto Serif KR',serif",fontWeight:900,color:C.gold,lineHeight:1,marginBottom:8,textShadow:"0 0 60px rgba(201,169,110,0.5)",animation:"float 4s ease-in-out infinite"}}>命</div>
          <h1 style={{fontSize:"1.5rem",fontWeight:900,fontFamily:"'Noto Serif KR',serif",letterSpacing:"0.55em",color:C.goldL,marginBottom:8}}>사주명리</h1>
          <p style={{fontSize:"0.62rem",color:C.muted,letterSpacing:"0.18em"}}>四柱命理 · 조후분석 · 물상이미지 · 출산택일</p>
        </div>
      </div>
      <div style={{padding:"12px 20px 100px",display:"flex",flexDirection:"column",gap:14,maxWidth:480,margin:"0 auto",animation:"fadeIn 0.6s ease 0.1s both"}}>
        <Field label="이름 (선택)"><SI placeholder="성함을 입력하세요" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
        <Field label="생년월일">
          <div style={{display:"flex",gap:8}}>
            <SI type="number" placeholder="년도 (1900~2030)" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} style={{flex:2}}/>
            <SI type="number" placeholder="월" value={form.month} onChange={e=>setForm({...form,month:e.target.value})} style={{flex:1}}/>
            <SI type="number" placeholder="일" value={form.day} onChange={e=>setForm({...form,day:e.target.value})} style={{flex:1}}/>
          </div>
        </Field>
        <Field label="출생 시각 (직접 입력)">
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <SI type="number" placeholder="시 (0~23)" value={form.hour} onChange={e=>setForm({...form,hour:e.target.value})} style={{flex:1}}/>
            <span style={{color:C.muted,fontSize:"1.1rem",flexShrink:0}}>:</span>
            <SI type="number" placeholder="분 (0~59)" value={form.minute} onChange={e=>setForm({...form,minute:e.target.value})} style={{flex:1}}/>
            {form.hour!==""&&!isNaN(+form.hour)&&+form.hour>=0&&+form.hour<=23&&(
              <div style={{flexShrink:0,padding:"8px 12px",borderRadius:10,background:`${C.gold}18`,border:`1px solid ${C.gold}30`,textAlign:"center",minWidth:52}}>
                <div style={{fontSize:"1.1rem",color:C.gold,fontFamily:"serif",fontWeight:900,lineHeight:1}}>{EB[getHB(+form.hour,+form.minute||0)]}</div>
                <div style={{fontSize:"0.45rem",color:C.muted,marginTop:2}}>{EB_KR[getHB(+form.hour,+form.minute||0)]}시</div>
              </div>
            )}
          </div>
          {form.hour!==""&&!isNaN(+form.hour)&&<div style={{marginTop:4,fontSize:"0.56rem",color:C.muted}}>{form.hour}시 {form.minute||0}분 → {EB[getHB(+form.hour,+(form.minute||0))]}時 ({EB_KR[getHB(+form.hour,+(form.minute||0))]}시)</div>}
        </Field>
        <Field label="성별"><div style={{display:"flex",gap:8}}><GenderBtn v="male" l="남성 ♂" form={form} setForm={setForm}/><GenderBtn v="female" l="여성 ♀" form={form} setForm={setForm}/></div></Field>
        {err&&<div style={{background:"rgba(180,40,20,0.1)",color:"#ff6a50",padding:"11px 16px",borderRadius:12,fontSize:"0.8rem",border:"1px solid rgba(180,40,20,0.22)"}}>{err}</div>}
        <GoldBtn onClick={handleCalc} style={{width:"100%",padding:18,fontSize:"1rem",letterSpacing:"0.2em",borderRadius:18,marginTop:4}}>命 팔자 산출하기</GoldBtn>
      </div>
    </div>
  );

  if(screen==="result"&&saju){
    const{pillars,dayStem,solar,lunar}=saju;
    const zodiacIdx=pillars[3].branchIdx;
    const sResult=calcStrengthDetail(pillars);
    const strength=sResult.strength;
    // 대운 + 세운 반영 오행세력도
    const activeDaeunBranch=selDaeun?.branch||null;
    const activeSeunBranch=selSeun?.branch||null;
    const sResultWithRun=(()=>{
      // 대운/세운 지지를 조후에 반영 (두 branch 모두 가산)
      const weights=[0.15,0.35,0.35,0.15];
      const elScore={...sResult.elementScores};
      if(activeDaeunBranch){const de=EB_EL[EB.indexOf(activeDaeunBranch)];if(de)elScore[de]=(elScore[de]||0)+1.25;}
      if(activeSeunBranch){const se=EB_EL[EB.indexOf(activeSeunBranch)];if(se)elScore[se]=(elScore[se]||0)+0.5;}
      return{...sResult,elementScores:elScore};
    })();
    const johuDetail=calcJohuDetail(pillars,activeDaeunBranch);
    const tcpaNowResult=calcTCPA(pillars,selDaeun?.stem,selDaeun?.branch,selSeun?.stem,selSeun?.branch);
    const tcpaLabelNow=tcpaLabel(tcpaNowResult.sTotal);
    const strengthColor=strengthColor5(strength);
    const TABS=[{k:"chart",l:"오행",i:"⬠"},{k:"johu",l:"조후",i:"☯"},{k:"image",l:"물상",i:"🎬"},{k:"taekil",l:"택일",i:"✦"},{k:"compat",l:"궁합",i:"♡"}];
    const curYear=new Date().getFullYear();
    // 세운: 현재 연도 기준 앞뒤 ±4년 (총 10개), 100세 초과 제거
    const seunList=Array.from({length:10},(_,i)=>calcSeun(curYear-4+i))
      .filter(s=>s.year-+form.year<=100);

    return(
      <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
        <style>{globalStyle}</style>
        <div style={{padding:"44px 16px 0",background:`linear-gradient(180deg,#2a1c0a 0%,${C.bg} 100%)`}}>
          <button onClick={()=>setScreen("input")} style={{fontSize:"0.7rem",color:C.muted,marginBottom:8,display:"block",background:"none",border:"none",cursor:"pointer"}}>← 다시 입력</button>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontSize:18}}>{ZODIAC_E[zodiacIdx]}</span>
            <div style={{flex:1,minWidth:0}}>
              <h2 style={{fontSize:"0.95rem",fontWeight:900,fontFamily:"'Noto Serif KR',serif",color:C.goldL}}>{form.name?`${form.name}님의 사주`:"사주팔자"}</h2>
              <p style={{fontSize:"0.5rem",color:C.muted,marginTop:1}}>양력 {solar.year}.{solar.month}.{solar.day} {solar.hour}시{+solar.minute>0?` ${solar.minute}분`:""} · 음력 {lunar.year}.{lunar.isLeap?"윤":""}{lunar.month}.{lunar.day} · {ZODIAC[zodiacIdx]}띠</p>
            </div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              <span style={{fontSize:"0.68rem",fontWeight:900,color:strengthColor,background:`${strengthColor}15`,padding:"3px 9px",borderRadius:8,border:`1px solid ${strengthColor}40`}}>{strength}</span>
              <span style={{fontSize:"0.58rem",fontWeight:700,color:tcpaLabelNow.color}}>{tcpaLabelNow.emoji} {tcpaLabelNow.label}</span>
            </div>
          </div>
          <div style={{display:"flex",borderBottom:`1px solid rgba(215,180,105,0.15)`}}>
            {TABS.map(({k,l,i})=><GhBtn key={k} active={tab===k} onClick={()=>setTab(k)}>{i} {l}</GhBtn>)}
          </div>
        </div>

        <div style={{padding:"10px 14px 100px",display:"flex",flexDirection:"column",gap:10,maxWidth:520,margin:"0 auto"}}>
          <div style={{animation:"fadeIn 0.3s ease"}}>

            {tab==="chart"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {/* 원국 팔자 — 대운/세운 선택 시 좌측에 추가 표시 */}
                <Card style={{padding:"12px 8px 14px"}}>
                  <SajuBoard pillars={pillars} dayStem={dayStem} showMulsang selDaeun={selDaeun} selSeun={selSeun}/>
                </Card>
                {/* 오행 오각형 — 대운/세운 반영 */}
                <Card style={{padding:12}}>
                  <div style={{display:"flex",gap:4,alignItems:"center",justifyContent:"center",marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:"0.55rem",color:C.muted}}>오행 세력도</span>
                    {selDaeun&&<span style={{fontSize:"0.55rem",color:C.gold,background:`${C.gold}18`,padding:"1px 7px",borderRadius:99}}>대운 {selDaeun.stem}{selDaeun.branch} 반영</span>}
                    {selSeun&&<span style={{fontSize:"0.55rem",color:"#86efac",background:"rgba(134,239,172,0.15)",padding:"1px 7px",borderRadius:99}}>세운 {selSeun.stem}{selSeun.branch} 반영</span>}
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"center"}}>
                    <Pentagon pillars={pillars} dayStem={dayStem} elementScores={sResultWithRun.elementScores} strength={strength} compact/>
                    <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                      <div style={{fontSize:"0.6rem",color:C.muted,fontWeight:700}}>오행 분포</div>
                      {["木","火","土","金","水"].map(el=>{const v=sResultWithRun.elementScores[el]||0;const tot=Object.values(sResultWithRun.elementScores).reduce((a,b)=>a+b,1);const pct=Math.round(v/tot*100);return(<div key={el} style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:"0.8rem",fontFamily:"serif",color:EL_COL[el],fontWeight:900,width:16}}>{el}</span><div style={{flex:1,height:6,borderRadius:99,background:"rgba(255,255,255,0.08)"}}><div style={{height:"100%",borderRadius:99,background:EL_COL[el],width:`${pct}%`,transition:"width 1s ease"}}/></div><span style={{fontSize:"0.55rem",color:EL_COL[el],width:28,textAlign:"right"}}>{pct}%</span></div>);})}
                    </div>
                  </div>
                </Card>

                {/* 대운 + 세운 */}
                <Card>
                  <CardTitle style={{marginBottom:8}}>대운 · 세운</CardTitle>
                  {/* 대운 한 줄 */}
                  <div style={{fontSize:"0.52rem",color:C.muted,marginBottom:5,fontWeight:700}}>▶ 대운</div>
                  <DaeunPanel daeunList={daeunList} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={setSelDaeun}/>
                  {/* 세운 한 줄 */}
                  <div style={{fontSize:"0.52rem",color:C.muted,margin:"12px 0 5px",fontWeight:700}}>▶ 세운</div>
                  <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:4}}>
                    {seunList.map(s=>{
                      const isNow=s.year===curYear,sc=EL_COL[HS_EL[s.stemIdx]],bc=EL_COL[EB_EL[s.branchIdx]];
                      const isSel=selSeun?.year===s.year;
                      return(
                        <button key={s.year} onClick={()=>setSelSeun(isSel?null:s)} style={{flexShrink:0,textAlign:"center",padding:"6px 6px 5px",borderRadius:11,background:isSel?`rgba(134,239,172,0.18)`:isNow?`${C.gold}22`:"rgba(255,255,255,0.05)",border:isSel?`1.5px solid #86efac`:isNow?`1.5px solid ${C.gold}55`:"1.5px solid rgba(255,255,255,0.10)",minWidth:46,position:"relative",cursor:"pointer"}}>
                          {isNow&&!isSel&&<div style={{position:"absolute",top:4,right:4,width:5,height:5,borderRadius:"50%",background:"#4ade80"}}/>}
                          <div style={{fontSize:"0.42rem",color:isSel?"#86efac":C.muted,marginBottom:2}}>{s.year}</div>
                          <div style={{fontSize:"1.4rem",color:sc,fontFamily:"serif",fontWeight:KANJI_YANG[s.stem]?900:300,lineHeight:1}}>{s.stem}</div>
                          <div style={{fontSize:"1.4rem",color:bc,fontFamily:"serif",fontWeight:KANJI_YANG[s.branch]?900:300,lineHeight:1}}>{s.branch}</div>
                          <div style={{fontSize:"0.38rem",color:sc,opacity:0.7}}>{HS_EL[s.stemIdx]}</div>
                          <div style={{fontSize:"0.38rem",color:bc,opacity:0.7}}>{EB_EL[s.branchIdx]}</div>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* 대운 상세 */}
                {selDaeun&&(()=>{const grade=calcDaeunGrade(pillars,dayStem,selDaeun.stem,selDaeun.branch);return(<Card><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><div style={{flexShrink:0,padding:"4px 10px",borderRadius:8,background:`${grade.color}22`,border:`1.5px solid ${grade.color}55`}}><span style={{fontSize:"1.1rem",fontWeight:900,color:grade.color,fontFamily:"'Noto Serif KR',serif"}}>{grade.grade}</span></div><div><div style={{fontSize:"0.72rem",fontWeight:700,color:grade.color,fontFamily:"'Noto Serif KR',serif"}}>{selDaeun.stem}{selDaeun.branch} 대운 · {grade.label}</div><div style={{fontSize:"0.56rem",color:"rgba(230,195,130,0.8)",marginTop:1}}>{grade.desc}</div></div></div>{grade.reasons&&grade.reasons.length>0&&(<div style={{borderTop:`1px dashed ${grade.color}40`,paddingTop:10}}><div style={{fontSize:"0.58rem",color:grade.color,fontWeight:700,marginBottom:5}}>💡 분석 근거</div>{grade.reasons.map((r,idx)=><div key={idx} style={{fontSize:"0.66rem",color:"rgba(240,220,180,0.9)",marginBottom:3,display:"flex",gap:5,lineHeight:1.4}}><span style={{color:grade.color,opacity:0.8}}>•</span><span>{r}</span></div>)}</div>)}</Card>);})()}

                <Card><CardTitle style={{marginBottom:8}}>대운 인생 그래프</CardTitle><LifeGraph daeunList={daeunList} pillars={pillars} dayStem={dayStem} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={setSelDaeun}/></Card>
              </div>
            )}

            {tab==="johu"&&<JohuTab pillars={pillars} johuDetail={johuDetail} selDaeun={selDaeun} selSeun={selSeun} birthYear={+form.year} daeunList={daeunList}/>}

            {tab==="image"&&(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <PhysImageCard key={`origin-${imgKey}`} title="나의 원국 물상" prompt={buildOriginPrompt(dayStem,pillars[2].branch,form.gender,johuDetail.tempScore,johuDetail.humScore)} dayStem={dayStem} label="origin" note={`일간 ${dayStem}(${HS_EL[pillars[1].stemIdx]}) · 월지 ${pillars[2].branch}`}/>
                <Card>
                  <CardTitle>대운 반영 물상</CardTitle>
                  <p style={{fontSize:"0.62rem",color:C.muted,textAlign:"center",marginBottom:12,lineHeight:1.8}}>대운의 기운이 원국에 스며들 때<br/>서사적 전환을 담은 이미지입니다</p>
                  <DaeunPanel daeunList={daeunList} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={d=>{setSelDaeun(d);setImgKey(k=>k+1);}}/>
                  {selDaeun?<div style={{marginTop:12}}><PhysImageCard key={`daeun-${imgKey}-${selDaeun.startYear}`} title={`${selDaeun.stem}${selDaeun.branch} 대운 융합 물상`} prompt={buildDaeunFusionPrompt(dayStem,pillars[2].branch,selDaeun.branch,form.gender,johuDetail.tempScore,johuDetail.humScore)} dayStem={dayStem} label="daeun" note={`원국 ${pillars[2].branch} + 대운 ${selDaeun.branch}`}/></div>:<div style={{marginTop:12,padding:"14px",borderRadius:12,background:"rgba(255,255,255,0.07)",border:"1px dashed rgba(220,185,120,0.35)",textAlign:"center"}}><p style={{fontSize:"0.65rem",color:C.muted}}>위에서 대운을 선택하면 융합 이미지를 생성할 수 있습니다</p></div>}
                </Card>
              </div>
            )}

            {tab==="taekil"&&<TaekIlSimulator/>}

            {tab==="compat"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <Card>
                  <CardTitle>상대방 정보 입력</CardTitle>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <Field label="이름 (선택)"><SI value={form2.name} onChange={e=>setForm2({...form2,name:e.target.value})} placeholder="상대방 이름"/></Field>
                    <Field label="생년월일"><div style={{display:"flex",gap:8}}><SI type="number" placeholder="년도" value={form2.year} onChange={e=>setForm2({...form2,year:e.target.value})} style={{flex:2}}/><SI type="number" placeholder="월" value={form2.month} onChange={e=>setForm2({...form2,month:e.target.value})} style={{flex:1}}/><SI type="number" placeholder="일" value={form2.day} onChange={e=>setForm2({...form2,day:e.target.value})} style={{flex:1}}/></div></Field>
                    <Field label="출생 시각">
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <SI type="number" placeholder="시 (0~23)" value={form2.hour} onChange={e=>setForm2({...form2,hour:e.target.value})} style={{flex:1}}/>
                        <span style={{color:C.muted}}>:</span>
                        <SI type="number" placeholder="분 (0~59)" value={form2.minute} onChange={e=>setForm2({...form2,minute:e.target.value})} style={{flex:1}}/>
                        {form2.hour!==""&&!isNaN(+form2.hour)&&+form2.hour>=0&&+form2.hour<=23&&<div style={{flexShrink:0,padding:"8px 10px",borderRadius:10,background:`${C.gold}18`,border:`1px solid ${C.gold}30`,textAlign:"center",minWidth:48}}><div style={{fontSize:"1rem",color:C.gold,fontFamily:"serif",fontWeight:900,lineHeight:1}}>{EB[getHB(+form2.hour,+form2.minute||0)]}</div><div style={{fontSize:"0.42rem",color:C.muted,marginTop:1}}>{EB_KR[getHB(+form2.hour,+form2.minute||0)]}시</div></div>}
                      </div>
                    </Field>
                    <Field label="성별"><div style={{display:"flex",gap:8}}><GenderBtn v="male" l="남성 ♂" form={form2} setForm={setForm2}/><GenderBtn v="female" l="여성 ♀" form={form2} setForm={setForm2}/></div></Field>
                    <GoldBtn onClick={handleCompat} style={{width:"100%",marginTop:4}}>♡ 궁합 분석하기</GoldBtn>
                    {compatErr&&<p style={{color:"#ff6a50",fontSize:"0.68rem",textAlign:"center"}}>{compatErr}</p>}
                  </div>
                </Card>
                {saju2&&<Card style={{padding:"0.9rem 0.5rem"}}><CardTitle style={{marginBottom:8}}>{form2.name||"상대방"} 사주</CardTitle><SajuBoard pillars={saju2.pillars} dayStem={saju2.dayStem} showMulsang={false}/></Card>}
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
