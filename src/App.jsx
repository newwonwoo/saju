import { useState } from "react";

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
  @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  ::-webkit-scrollbar{height:3px;width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.3);border-radius:99px;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  input[type=number]{-moz-appearance:textfield;}
`;

let _lunarReady=false,_lunarCallbacks=[];
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

function getJD(y,m,d){const a=Math.floor((14-m)/12);const yy=y+4800-a;const mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
function jdToDate(jd){const L=jd+68569;const N=Math.floor(4*L/146097);const L2=L-Math.floor((146097*N+3)/4);const I=Math.floor(4000*(L2+1)/1461001);const L3=L2-Math.floor(1461*I/4)+31;const J=Math.floor(80*L3/2447);const day=L3-Math.floor(2447*J/80);const L4=Math.floor(J/11);const month=J+2-12*L4;const year=100*(N-49)+I+L4;return{year,month,day};}
function sunLon(jd){const T=(jd-2451545)/36525;const L0=280.46646+36000.76983*T+0.0003032*T*T;const M=((357.52911+35999.05029*T-0.0001537*T*T)*Math.PI)/180;const CC=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);return((L0+CC)%360+360)%360;}
function findTermJD(year,lon){const base=getJD(year,1,1);const approx=base+((lon-sunLon(base)+360)%360)/360*365.25;let j1=approx-15,j2=approx+15;for(let i=0;i<60;i++){const mid=(j1+j2)/2;let d=lon-sunLon(mid);if(d>180)d-=360;if(d<-180)d+=360;if(Math.abs(d)<0.00005)break;if(d>0)j1=mid;else j2=mid;}return(j1+j2)/2;}
const tCache={};
function getTerms(year){if(tCache[year])return tCache[year];const T=[{n:"입춘",l:315},{n:"경칩",l:345},{n:"청명",l:15},{n:"입하",l:45},{n:"망종",l:75},{n:"소서",l:105},{n:"입추",l:135},{n:"백로",l:165},{n:"한로",l:195},{n:"입동",l:225},{n:"대설",l:255},{n:"소한",l:285}];const r={};for(const t of T){const jd=findTermJD(year,t.l);const d=jdToDate(jd+9/24);r[t.n]={month:d.month,day:d.day,jd};}tCache[year]=r;return r;}
function calcNewMoonKST(k){const T=k/1236.85;let JDE=2451550.09766+29.530588861*k+0.00015437*T*T-0.000000150*T*T*T+0.00000000073*T*T*T*T;const M=(2.5534+29.10535670*k-0.0000014*T*T-0.00000011*T*T*T)*Math.PI/180;const Mp=(201.5643+385.81693528*k+0.0107582*T*T+0.00001238*T*T*T-0.000000058*T*T*T*T)*Math.PI/180;const F=(160.7108+390.67050284*k-0.0016118*T*T-0.00000227*T*T*T+0.000000011*T*T*T*T)*Math.PI/180;const Om=(124.7746-1.56375588*k+0.0020672*T*T+0.00000215*T*T*T)*Math.PI/180;JDE+=-0.40720*Math.sin(Mp)+0.17241*Math.sin(M)+0.01608*Math.sin(2*Mp)+0.01039*Math.sin(2*F)+0.00739*Math.sin(Mp-M)-0.00514*Math.sin(Mp+M)+0.00208*Math.sin(2*M)-0.00111*Math.sin(Mp-2*F)-0.00057*Math.sin(Mp+2*F)+0.00056*Math.sin(2*Mp+M)-0.00042*Math.sin(3*Mp)+0.00042*Math.sin(M+2*F)+0.00038*Math.sin(M-2*F)-0.00024*Math.sin(2*Mp-M)-0.00017*Math.sin(Om)-0.00007*Math.sin(Mp+2*M);return Math.floor(JDE+9/24+0.5);}

const NY={1900:[1,31],1901:[2,19],1902:[2,8],1903:[1,29],1904:[2,16],1905:[2,4],1906:[1,25],1907:[2,13],1908:[2,2],1909:[1,22],1910:[2,10],1911:[1,30],1912:[2,18],1913:[2,6],1914:[1,26],1915:[2,14],1916:[2,3],1917:[1,23],1918:[2,11],1919:[2,1],1920:[2,20],1921:[2,8],1922:[1,28],1923:[2,16],1924:[2,5],1925:[1,24],1926:[2,13],1927:[2,2],1928:[1,23],1929:[2,10],1930:[1,30],1931:[2,17],1932:[2,6],1933:[1,26],1934:[2,14],1935:[2,4],1936:[1,24],1937:[2,11],1938:[1,31],1939:[2,19],1940:[2,8],1941:[1,27],1942:[2,15],1943:[2,5],1944:[1,25],1945:[2,13],1946:[2,2],1947:[1,22],1948:[2,10],1949:[1,29],1950:[2,17],1951:[2,6],1952:[1,27],1953:[2,14],1954:[2,3],1955:[1,24],1956:[2,12],1957:[1,31],1958:[2,18],1959:[2,8],1960:[1,28],1961:[2,15],1962:[2,5],1963:[1,25],1964:[2,13],1965:[2,2],1966:[1,21],1967:[2,9],1968:[1,30],1969:[2,17],1970:[2,6],1971:[1,27],1972:[2,15],1973:[2,3],1974:[1,23],1975:[2,11],1976:[1,31],1977:[2,18],1978:[2,7],1979:[1,28],1980:[2,16],1981:[2,5],1982:[1,25],1983:[2,13],1984:[2,2],1985:[2,20],1986:[2,9],1987:[1,29],1988:[2,17],1989:[2,6],1990:[1,27],1991:[2,15],1992:[2,4],1993:[1,23],1994:[2,10],1995:[1,31],1996:[2,19],1997:[2,7],1998:[1,28],1999:[2,16],2000:[2,5],2001:[1,24],2002:[2,12],2003:[2,1],2004:[1,22],2005:[2,9],2006:[1,29],2007:[2,18],2008:[2,7],2009:[1,26],2010:[2,14],2011:[2,3],2012:[1,23],2013:[2,10],2014:[1,31],2015:[2,19],2016:[2,8],2017:[1,28],2018:[2,16],2019:[2,5],2020:[1,25],2021:[2,12],2022:[2,1],2023:[1,22],2024:[2,10],2025:[1,29],2026:[2,17],2027:[2,6],2028:[1,26],2029:[2,13],2030:[2,3],2031:[1,23]};
const LEAP_MONTH={1900:8,1902:5,1905:4,1907:9,1910:6,1913:5,1916:4,1919:2,1921:7,1924:5,1927:6,1930:5,1933:4,1936:3,1938:7,1941:6,1944:4,1947:2,1949:7,1952:5,1955:3,1957:8,1960:6,1963:4,1966:3,1968:7,1971:5,1972:4,1975:8,1977:8,1980:5,1982:4,1984:10,1987:6,1989:5,1990:5,1993:3,1995:8,1998:5,2001:4,2004:2,2006:7,2009:5,2012:3,2014:9,2017:6,2020:4,2023:2,2025:6,2028:5,2031:3};
const lyCache={};
function buildLunarYear(y){if(lyCache[y])return lyCache[y];const ny=NY[y],nyN=NY[y+1];if(!ny||!nyN)return null;const startJD=getJD(y,ny[0],ny[1]);const endJD=getJD(y+1,nyN[0],nyN[1]);const k0=Math.round((y+1/24-2000)*12.3685);let bestK=k0,bestDiff=999;for(let dk=-3;dk<=3;dk++){const jd=calcNewMoonKST(k0+dk);const diff=Math.abs(jd-startJD);if(diff<bestDiff){bestDiff=diff;bestK=k0+dk;}}const months=[startJD];let k=bestK+1;while(true){const jd=calcNewMoonKST(k);if(jd>=endJD)break;if(jd>startJD)months.push(jd);k++;if(k>bestK+20)break;}const leapM=LEAP_MONTH[y]||0;const result={startJD,endJD,months,leapM};lyCache[y]=result;return result;}
function solarToLunar(sy,sm,sd){const targetJD=getJD(sy,sm,sd);for(let y=1900;y<=2030;y++){const ny=NY[y],nyN=NY[y+1];if(!ny||!nyN)break;const startJD=getJD(y,ny[0],ny[1]);const endJD=getJD(y+1,nyN[0],nyN[1]);if(targetJD<startJD||targetJD>=endJD)continue;const yr=buildLunarYear(y);if(!yr)continue;const{months,leapM}=yr;const total=months.length;let mi=-1;for(let i=0;i<total;i++){const ns=i+1<total?months[i+1]:endJD;if(targetJD>=months[i]&&targetJD<ns){mi=i;break;}}if(mi<0)continue;const day=targetJD-months[mi]+1;let lm,isLeap=false;if(total===13&&leapM>0){if(mi<leapM)lm=mi+1;else if(mi===leapM){lm=leapM;isLeap=true;}else lm=mi;}else lm=mi+1;return{year:y,month:lm,day,isLeap};}return{year:1900,month:1,day:1,isLeap:false};}

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

function validateDate(y,m,d){
  const year=+y,month=+m,day=+d;
  if(!y||!m||!d)return "생년월일을 모두 입력해주세요.";
  if(isNaN(year)||year<1900||year>2030)return "연도는 1900~2030 사이로 입력해주세요.";
  if(isNaN(month)||month<1||month>12)return "월은 1~12 사이로 입력해주세요.";
  const dm=[0,31,28,31,30,31,30,31,31,30,31,30,31];
  if((year%4===0&&year%100!==0)||(year%400===0))dm[2]=29;
  if(isNaN(day)||day<1||day>dm[month])return `${month}월은 최대 ${dm[month]}일까지 입력 가능합니다.`;
  return null;
}
function validateTime(h,min){
  if(isNaN(+h)||+h<0||+h>23)return "시간은 0~23 사이로 입력해주세요.";
  if(isNaN(+min)||+min<0||+min>59)return "분은 0~59 사이로 입력해주세요.";
  return null;
}
function getMaxDay(y,m){const dm=[0,31,28,31,30,31,30,31,31,30,31,30,31];if((y%4===0&&y%100!==0)||(y%400===0))dm[2]=29;return dm[m]||28;}

function calcStrengthDetail(pillars){
  const ds=pillars[1].stem,mb=pillars[2].branch;
  const dayEl=HS_EL[HS.indexOf(ds)],mbEl=EB_EL[EB.indexOf(mb)];
  const GEN={"木":"水","火":"木","土":"火","金":"土","水":"金"};
  const genEl=GEN[dayEl];
  let elementScores={"木":0,"火":0,"土":0,"金":0,"水":0};
  let myScore=0;
  const isDeukRyeong=(mbEl===dayEl||mbEl===genEl);
  const stemW=[0.6,0,1.2,0.6],branchW=[0.6,1.2,3.0,0.6];
  function addScore(el,score){elementScores[el]+=score;if(el===dayEl||el===genEl)myScore+=score;}
  pillars.forEach((p,i)=>{
    if(i!==1)addScore(HS_EL[p.stemIdx],stemW[i]);
    addScore(EB_EL[p.branchIdx],branchW[i]);
    const hidden=EBH[p.branch];
    if(hidden)Object.values(hidden).forEach(hs=>{if(!hs)return;addScore(HS_EL[HS.indexOf(hs[0])],branchW[i]*(hs[1]/30)*((p.branch===mb)?1.2:1.0));});
  });
  if(isDeukRyeong){myScore*=1.2;}else{myScore*=0.9;}
  const threshold=isDeukRyeong?5.0:6.0;
  const strength=myScore>=threshold?"신강":myScore<=(threshold-2.0)?"신약":"중화";
  return{strength,elementScores,isDeukRyeong};
}
function calcStrength(pillars){return calcStrengthDetail(pillars).strength;}

const HB_BOUNDS=[120,240,360,480,600,720,840,960,1080,1200,1320,1440];
function getHB(hour,minute=0){const t=hour*60+minute;for(let i=0;i<12;i++)if(t<HB_BOUNDS[i])return i;return 0;}
function getYP(y,m,d){const cb=findTermJD(y,315)+9/24;const jd=getJD(y,m,d)+0.5;const sy=jd<cb?y-1:y;const s=((sy-4)%10+10)%10;const b=((sy-4)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getDP(y,m,d){const jd=getJD(y,m,d);const s=((jd+9)%10+10)%10;const b=((jd+1)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getMP(y,m,d){const dJD=getJD(y,m,d)+0.5;const MT=[{l:315,b:2},{l:345,b:3},{l:15,b:4},{l:45,b:5},{l:75,b:6},{l:105,b:7},{l:135,b:8},{l:165,b:9},{l:195,b:10},{l:225,b:11},{l:255,b:0},{l:285,b:1}];let branchIdx=1,bestJD=-Infinity;for(let yr=y-1;yr<=y+1;yr++){for(const t of MT){const tj=findTermJD(yr,t.l)+9/24;if(tj<=dJD&&tj>bestJD){bestJD=tj;branchIdx=t.b;}}}const cb=findTermJD(y,315)+9/24;const sajuY=dJD<cb?y-1:y;const ySI=((sajuY-4)%10+10)%10;const yinStem=[2,4,6,8,0][ySI%5];const stemIdx=(yinStem+((branchIdx-2+12)%12))%10;return{stem:HS[stemIdx],branch:EB[branchIdx],stemIdx,branchIdx};}
function getHP(ds,hour,minute=0){const bi=getHB(hour,minute);const startMap={0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8};const s=(startMap[ds]+bi)%10;return{stem:HS[s],branch:EB[bi],stemIdx:s,branchIdx:bi};}

function calcSaju(y,m,d,hour,minute=0){
  try{
    if(typeof window!=="undefined"&&window.Solar&&window.EightChar){
      const solar=window.Solar.fromYmd(y,m,d);const lunar=solar.getLunar();const ec=lunar.getEightChar();
      const dayStr=ec.getDay(),monthStr=ec.getMonth(),yearStr=ec.getYear();
      const dsi=HS.indexOf(dayStr[0]);const hb=getHB(hour,minute);
      const sm={0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8};
      const hStem=HS[(sm[dsi]+hb)%10],hBranch=EB[hb];
      function pp(s,label){const si=HS.indexOf(s[0]),bi=EB.indexOf(s[1]);return{stem:s[0],branch:s[1],stemIdx:si,branchIdx:bi,label};}
      const pillars=[pp(hStem+hBranch,"시"),pp(dayStr,"일"),pp(monthStr,"월"),pp(yearStr,"년")];
      return{pillars,dayStem:dayStr[0],solar:{year:y,month:m,day:d,hour,minute},lunar:{year:lunar.getYear(),month:lunar.getMonth(),day:lunar.getDay(),isLeap:lunar.isLeap()}};
    }
  }catch(e){}
  const lunar=solarToLunar(y,m,d);
  const yp=getYP(y,m,d),mp=getMP(y,m,d),dp=getDP(y,m,d),hp=getHP(dp.stemIdx,hour,minute);
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
function calcSeun(year){const s=((year-4)%10+10)%10,b=((year-4)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b,year};}

const JOHU_NEED={亥:{need:["火","木"],avoid:["水","金"]},子:{need:["火","木"],avoid:["水","金"]},丑:{need:["火","木"],avoid:["水","金"]},寅:{need:["水","火"],avoid:[]},卯:{need:["水","火"],avoid:[]},辰:{need:["木","水"],avoid:[]},巳:{need:["水","金"],avoid:["火","木"]},午:{need:["水","金"],avoid:["火","木"]},未:{need:["水","金"],avoid:["火","木"]},申:{need:["火","木"],avoid:["金","水"]},酉:{need:["火","木"],avoid:["金","水"]},戌:{need:["木","水"],avoid:[]}};
const TEMP_W={火:3,木:1,土:0,金:-1,水:-3},HUM_W={水:3,木:1,金:0,土:-1,火:-2};
const SEASON_TARGET={亥:{tempTarget:-1,humTarget:2},子:{tempTarget:-2,humTarget:3},丑:{tempTarget:-2,humTarget:2},寅:{tempTarget:0,humTarget:1},卯:{tempTarget:1,humTarget:1},辰:{tempTarget:1,humTarget:0},巳:{tempTarget:2,humTarget:-1},午:{tempTarget:3,humTarget:-2},未:{tempTarget:2,humTarget:-1},申:{tempTarget:1,humTarget:-1},酉:{tempTarget:0,humTarget:0},戌:{tempTarget:-1,humTarget:1}};
function calcJohuDetail(pillars,daeunBranch=null){
  const weights=[0.15,0.35,0.35,0.15];
  const elScore={木:0,火:0,土:0,金:0,水:0};
  pillars.forEach((p,i)=>{const w=weights[i];elScore[HS_EL[p.stemIdx]]=(elScore[HS_EL[p.stemIdx]]||0)+w*1.5;elScore[EB_EL[p.branchIdx]]=(elScore[EB_EL[p.branchIdx]]||0)+w;});
  if(daeunBranch){const de=EB_EL[EB.indexOf(daeunBranch)];if(de)elScore[de]=(elScore[de]||0)+0.12;}
  const total=Object.values(elScore).reduce((a,b)=>a+b,0)||1;
  let temp=0,hum=0;
  for(const [el,v] of Object.entries(elScore)){temp+=v/total*TEMP_W[el];hum+=v/total*HUM_W[el];}
  const mb=pillars[2].branch,tgt=SEASON_TARGET[mb]||{tempTarget:0,humTarget:0};
  const tempScore=Math.max(0,Math.min(100,Math.round(50-(temp-tgt.tempTarget)*15)));
  const humScore=Math.max(0,Math.min(100,Math.round(50-(hum-tgt.humTarget)*15)));
  const{need=[]}=JOHU_NEED[mb]||{};
  const johuAvoidBase=JOHU_NEED[mb]?.avoid||[];
  const actualExcess=Object.entries(elScore).filter(([el,v])=>v/total>0.30).map(([el])=>el);
  const avoid=[...new Set([...actualExcess,...johuAvoidBase.filter(e=>elScore[e]/total>0.12)])].filter(e=>!need.includes(e));
  return{tempScore,humScore,totalScore:Math.round((tempScore+humScore)/2),need,avoid,elScore,total};
}
function johuLabel(s){if(s>=80)return{label:"최적",color:"#4ade80"};if(s>=65)return{label:"양호",color:"#86efac"};if(s>=50)return{label:"보통",color:C.gold};if(s>=35)return{label:"불균형",color:"#fb923c"};return{label:"편중",color:C.red};}
function calcElementCount(pillars){const cnt={水:0,木:0,火:0,土:0,金:0};pillars.forEach(p=>{cnt[HS_EL[p.stemIdx]]=(cnt[HS_EL[p.stemIdx]]||0)+1.5;cnt[EB_EL[p.branchIdx]]=(cnt[EB_EL[p.branchIdx]]||0)+1;});return cnt;}

const BRANCH_DESC={子:"만물이 잠든 고요한 한겨울 밤",丑:"차고 척박한 한겨울의 언 땅",寅:"아직 어둠이 걷히지 않은 이른 봄새벽",卯:"꽃잎이 흩날리는 화사한 봄날",辰:"봄비가 촉촉이 내리는 무르익은 봄날",巳:"뜨거운 열기가 피어오르는 초여름",午:"태양이 작열하는 한여름 대낮",未:"모든 것이 무르익은 늦여름의 황혼",申:"청명한 하늘 아래 서늘한 초가을",酉:"결실의 향기 가득한 풍요로운 가을",戌:"낙엽이 지는 쓸쓸한 늦가을",亥:"찬 겨울비가 내리는 초겨울의 밤"};
const STEM_SHORT={甲:"우뚝 솟은 큰 나무",乙:"타고 오르는 덩굴",丙:"환하게 비추는 태양",丁:"따뜻한 촛불",戊:"묵묵히 버티는 큰 산",己:"씨앗을 품은 대지",庚:"날카로운 칼날",辛:"차갑게 빛나는 보석",壬:"힘차게 흐르는 강물",癸:"조용히 내리는 맑은 비"};
function buildMulsangHeader(ds,mb){const env=BRANCH_DESC[mb]||"",s=STEM_SHORT[ds]||"";if(!env||!s)return null;return`${env} · ${s}`;}

const CHUNG_MAP={子:"午",午:"子",丑:"未",未:"丑",寅:"申",申:"寅",卯:"酉",酉:"卯",辰:"戌",戌:"辰",巳:"亥",亥:"巳"};
const SAMHYUNG3=[["寅","巳","申"],["丑","戌","未"]];
function getYongsinElements(strength,dayEl,johuNeed){const GEN={木:"水",火:"木",土:"火",金:"土",水:"金"};const MY_GEN={木:"火",火:"土",土:"金",金:"水",水:"木"};const MY_CTRL={木:"土",火:"金",土:"水",金:"木",水:"火"};let yongs=strength==="신강"?[MY_GEN[dayEl],MY_CTRL[dayEl]]:strength==="신약"?[GEN[dayEl],dayEl]:[MY_GEN[dayEl],GEN[dayEl]];return[...new Set([...yongs,...(johuNeed||[])])];}
function checkHapProtection(branch,allBranches){const HAP6={子:"丑",丑:"子",寅:"亥",亥:"寅",卯:"戌",戌:"卯",辰:"酉",酉:"辰",巳:"申",申:"巳",午:"未",未:"午"};return HAP6[branch]&&allBranches.includes(HAP6[branch]);}
function calcDaeunGrade(pillars,dayStem,daeunStem,daeunBranch){
  const{strength}=calcStrengthDetail(pillars);
  const mb=pillars[2].branch,db=pillars[1].branch,allBranches=pillars.map(p=>p.branch);
  const johu=calcJohuDetail(pillars);
  const dayEl=HS_EL[HS.indexOf(dayStem)];
  const GEN={木:"水",火:"木",土:"火",金:"土",水:"金"};
  const MY_GEN={木:"火",火:"土",土:"金",金:"水",水:"木"};
  const MY_CTRL={木:"土",火:"金",土:"水",金:"木",水:"火"};
  const CTRL_ME={木:"金",火:"水",土:"木",金:"火",水:"土"};
  const yongsinEls=getYongsinElements(strength,dayEl,johu.need);
  const dStemEl=HS_EL[HS.indexOf(daeunStem)],dBranchEl=EB_EL[EB.indexOf(daeunBranch)];
  const targetChung=CHUNG_MAP[daeunBranch];
  let score=55,reasons=[];
  if(yongsinEls.includes(dStemEl)){score+=15;reasons.push(`천간에 용신 [${dStemEl}] 기운 진입`);}
  if(yongsinEls.includes(dBranchEl)){score+=20;reasons.push(`지지에 용신 뿌리 [${dBranchEl}] 도래`);}
  if(!yongsinEls.includes(dStemEl)&&!yongsinEls.includes(dBranchEl)){
    if(strength==="신강"&&(dStemEl===dayEl||dStemEl===GEN[dayEl])){score-=10;reasons.push("기구신이 들어와 경쟁 및 부담 증가");}
    if(strength==="신약"&&(dBranchEl===MY_CTRL[dayEl]||dBranchEl===CTRL_ME[dayEl])){score-=15;reasons.push("기구신이 들어와 현실적 압박이 거셈");}
  }
  if((johu.need||[]).includes(dStemEl)||(johu.need||[]).includes(dBranchEl)){score+=15;reasons.push("치우친 온/습도를 조절하여 환경적 안정");}
  if((johu.avoid||[]).includes(dStemEl)||(johu.avoid||[]).includes(dBranchEl)){score-=15;reasons.push("조후 불균형을 심화시키는 기운");}
  if(daeunStem===daeunBranch){if(yongsinEls.includes(dBranchEl)){score+=10;reasons.push("길운이 간여지동으로 강하게 발복");}else{score-=10;reasons.push("흉운이 간여지동으로 겹쳐 제약 뚜렷");}}
  const withDaeun=[...allBranches,daeunBranch];
  const HAP_GROUPS=[{el:"木",label:"木局",chars:["寅","卯","辰"]},{el:"火",label:"火局",chars:["巳","午","未"]},{el:"金",label:"金局",chars:["申","酉","戌"]},{el:"水",label:"水局",chars:["亥","子","丑"]},{el:"木",label:"木局",chars:["亥","卯","未"]},{el:"火",label:"火局",chars:["寅","午","戌"]},{el:"金",label:"金局",chars:["巳","酉","丑"]},{el:"水",label:"水局",chars:["申","子","辰"]}];
  for(const hap of HAP_GROUPS){if(hap.chars.every(c=>withDaeun.includes(c))&&hap.chars.includes(daeunBranch)){if(yongsinEls.includes(hap.el)){score+=25;reasons.push(`강력한 [${hap.label}] 용신 세력 형성`);}else{score-=25;reasons.push(`원치 않는 [${hap.label}] 세력 형성`);}break;}}
  if(allBranches.includes(targetChung)){const isP=checkHapProtection(targetChung,allBranches);const tEl=EB_EL[EB.indexOf(targetChung)];const isY=yongsinEls.includes(tEl);if(isY){score-=(isP?10:25);reasons.push(`⚠️ 대운이 용신 [${targetChung}]을 충격함${isP?" (합으로 피해 감소)":""}`);}else{score+=(isP?5:15);reasons.push(`✨ 대운이 기신 [${targetChung}] 충거, 장애물 제거`);}if(targetChung===db)reasons.push("📌 일지 자리 직접 변화");if(targetChung===mb)reasons.push("📌 월지(사회적 기반) 큰 변동");}
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

const STEM_SCENE={甲:"a towering ancient pine forest, massive primordial trunks rising into mist",乙:"a delicate wildflower meadow with cascading vines",丙:"a blazing sun at zenith, overwhelming radiance scorching the horizon",丁:"a lone lantern flame burning against vast cold darkness",戊:"colossal mountain peaks, immovable and eternal, wrapped in storm clouds",己:"deep fertile terraced earth, patient and nurturing",庚:"sheer steel-grey cliffs with razor edges, harsh unyielding stone",辛:"glittering crystal formations refracting cold prismatic light",壬:"a boundless surging ocean, deep relentless waves",癸:"quiet rain and mist-shrouded mountain pools, hidden depths"};
const BRANCH_SCENE={子:"frozen tundra under a pale winter moon",丑:"frost-locked earth in deepest winter, heavy grey sky",寅:"misty spring forest at dawn, first green buds",卯:"rolling hills of cherry blossoms, petals drifting",辰:"rain-soaked fields in early spring, muddy earth alive",巳:"parched summer earth shimmering in relentless heat haze",午:"blazing midsummer noon, cracked earth, bleached sky",未:"golden late-summer dusk, tall grass in heavy amber light",申:"vivid mountain autumn slopes, crisp cold air, crimson leaves",酉:"endless harvest fields under clear high-autumn sky",戌:"bare branches in melancholy late-autumn dusk",亥:"cold dark winter rain, frost on bare branches, moonlit puddles"};
function getJohuExpression(tempScore,humScore){
  const tLow=tempScore<35,tHigh=tempScore>68,hLow=humScore<35,hHigh=humScore>68,total=Math.round((tempScore+humScore)/2);
  if(tLow&&hHigh)return{body:"hunched against cold and dampness, arms wrapped tightly, shoulders raised",face:"cheek and jaw in profile, tense cold expression, furrowed brow, lips pressed"};
  if(tLow)return{body:"bundled tightly, body slightly curled, cautious yet resilient posture",face:"three-quarter profile, furrowed brow, pensive expression, slightly squinting"};
  if(tHigh&&hLow)return{body:"slightly slouched, hand raised to shade from intense sunlight, weary stance",face:"profile squinting against harsh light, fatigued sun-worn expression"};
  if(tHigh)return{body:"leaning back slightly, light clothing, bold yet taxed posture expressing intense heat",face:"three-quarter view, flushed expression, sweat on brow, strained bright eyes"};
  if(hLow)return{body:"upright decisive posture, precise movements, dry clarity",face:"strong jaw profile, composed resolute expression, alert eyes"};
  if(hHigh)return{body:"slightly drooping soft posture, gentle yielding body language",face:"soft rounded profile, dreamy downward gaze, gentle melancholic expression"};
  if(total>=70)return{body:"relaxed upright posture, arms slightly open, deep contentment, integrated with nature",face:"soft three-quarter view, peaceful barely-visible smile, calm clear eyes"};
  return{body:"composed natural stance, breathing with the landscape",face:"partial profile, neutral peaceful expression"};
}
function getJohuCostume(tS,hS,gender){const f=gender==="female";const tL=tS<40,tH=tS>68,hL=hS<40,hH=hS>68;let o="";if(tL&&hH)o=f?"heavy layered hanbok, dark indigo and grey, thick winter coat":"dark heavy overcoat with layered Korean robes, deep navy";else if(tL)o=f?"elegant winter hanbok, fur-trimmed collar, pale silver and white":"thick dark Korean overcoat, muffler, charcoal and midnight blue";else if(tH&&hL)o=f?"light flowing summer hanbok, vibrant red and orange":"lightweight linen Korean robe, open collar, warm amber and rust";else if(tH)o=f?"sheer flowing summer hanbok, warm coral and gold":"light Korean summer robe, golden yellow and cream";else if(hL)o=f?"autumn hanbok, golden amber and burnt sienna":"structured Korean autumn robe, chestnut and gold";else if(hH)o=f?"spring hanbok, soft jade green and misty blue":"soft spring Korean robe, moss green and celadon";else o=f?"classic hanbok, balanced jade and ivory":"traditional Korean robe, deep teal and ivory";return`a Korean ${f?"woman":"man"} in three-quarter angle (face partially visible), ${o}`;}
function buildNarrativeTransition(mb,db){const cold=["亥","子","丑"],spr=["寅","卯","辰"],sum=["巳","午","未"],aut=["申","酉","戌"];const g=b=>cold.includes(b)?"cold":spr.includes(b)?"spring":sum.includes(b)?"summer":"autumn";const T={"cold->summer":"The frozen world cracks violently — blazing heat arrives","cold->spring":"Gentle warmth dissolves the frozen landscape","cold->autumn":"Cold deepens into profound silence","summer->cold":"Sudden cold crashes over scorched earth","summer->spring":"Brutal heat softens — rain begins","summer->autumn":"Peak heat breaks into harvest gold","spring->summer":"Spring's growth erupts into full summer glory","spring->cold":"Frost interrupts spring's awakening","autumn->cold":"Autumn descends into deep winter","autumn->summer":"Unexpected warmth floods autumn","cold->cold":"Cold compounds upon cold","summer->summer":"Heat compounds with doubled intensity","spring->spring":"Spring multiplies into lush abundance","autumn->autumn":"Autumn settles deep and golden","spring->autumn":"Autumn winds interrupt spring","autumn->spring":"Spring warmth breaks the autumn chill"};return T[`${g(mb)}->${g(db)}`]||"a subtle seasonal shift";}
function buildOriginPrompt(ds,mb,gender="male",tS=50,hS=50){const char=getJohuCostume(tS,hS,gender),expr=getJohuExpression(tS,hS);return["Photorealistic cinematic photograph. 8K. Shot on RED MONSTRO anamorphic lens.",`Primary landscape: ${STEM_SCENE[ds]}.`,`Seasonal environment: ${BRANCH_SCENE[mb]}.`,`Character (20% of frame): ${char}. Body: ${expr.body}. Face: ${expr.face}.`,`Landscape DOMINATES. Character is small but emotionally expressive.`,"Lighting: dramatic cinematic with volumetric god rays.","Quality: National Geographic meets fine art. Hyper-detailed depth of field.","STRICT: NO text, NO watermark, NO full-face close-up. One figure only."].join(" ");}
function buildDaeunFusionPrompt(ds,mb,db,gender="male",tS=50,hS=50){const char=getJohuCostume(tS,hS,gender),expr=getJohuExpression(tS,hS),tr=buildNarrativeTransition(mb,db);return["Photorealistic cinematic photograph. 8K. Shot on RED MONSTRO anamorphic lens.",`Primary identity: ${STEM_SCENE[ds]}.`,`NARRATIVE TRANSFORMATION: ${tr}.`,`New arriving energy: ${BRANCH_SCENE[db]}.`,`Character at the boundary: ${char}. Body: ${expr.body}. Face: ${expr.face}.`,"Two opposing color palettes visibly bleed into each other. Chiaroscuro clash. Epic scale.","STRICT: NO text, NO watermark, NO full-face close-up. One figure only."].join(" ");}
async function generateImage(prompt,onProgress){onProgress?.(10,"요청 전송 중...");const r=await fetch("/api/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});const data=await r.json();if(!r.ok)throw new Error(data.error||"이미지 생성 실패");if(data.url){onProgress?.(100,"완료!");return data.url;}if(data.id){for(let i=0;i<60;i++){await new Promise(res=>setTimeout(res,2000));const poll=await fetch(`/api/image?id=${data.id}`);const pd=await poll.json();onProgress?.(Math.min(90,30+i*2),"AI 렌더링 중...");if(pd.status==="succeeded"){onProgress?.(100,"완료!");return pd.url;}if(pd.status==="failed")throw new Error(pd.error||"생성 실패");}throw new Error("시간 초과");}throw new Error("응답 오류");}

const HS_HAP={甲:"己",己:"甲",乙:"庚",庚:"乙",丙:"辛",辛:"丙",丁:"壬",壬:"丁",戊:"癸",癸:"戊"};
const HS_CHUNG={甲:"庚",庚:"甲",乙:"辛",辛:"乙",丙:"壬",壬:"丙",丁:"癸",癸:"丁"};
const WANG_JI=["子","午","卯","酉"],WANG_CHUNG={子:"午",午:"子",卯:"酉",酉:"卯"};
const SAMHYUNG=[["寅","巳","申"],["丑","戌","未"],["子","卯"]];
function calcCompatScore(s1,s2){const d1=s1.pillars[1].stem,d2=s2.pillars[1].stem,b1=s1.pillars[1].branch,b2=s2.pillars[1].branch;let score=50;const details=[];if(HS_HAP[d1]===d2){score+=20;details.push({type:"일간합",icon:"✦",desc:`${d1}·${d2} 천간합 — 두 기운이 하나로 합쳐지는 깊은 인연`,positive:true,pts:20});}if(HS_CHUNG[d1]===d2){score-=15;details.push({type:"일간충",icon:"✕",desc:`${d1}·${d2} 천간충 — 서로 부딪히는 강한 긴장 관계`,positive:false,pts:-15});}const el1=HS_EL[s1.pillars[1].stemIdx],el2=HS_EL[s2.pillars[1].stemIdx];const n1=JOHU_NEED[s1.pillars[2].branch]?.need||[],n2=JOHU_NEED[s2.pillars[2].branch]?.need||[];let jPts=0;if(n1.includes(el2))jPts+=10;if(n2.includes(el1))jPts+=10;score+=jPts;details.push(jPts>0?{type:"조후보완",icon:"◎",desc:`서로에게 필요한 오행(${el2}·${el1})을 주고받는 상호 보완 관계`,positive:true,pts:jPts}:{type:"조후보완",icon:"△",desc:"조후 보완 관계 없음",positive:false,pts:0});if(WANG_JI.includes(b1)&&WANG_JI.includes(b2)&&WANG_CHUNG[b1]===b2){score-=12;details.push({type:"왕지충",icon:"⚡",desc:`${b1}·${b2} 왕지충 — 강한 기운끼리 정면 충돌`,positive:false,pts:-12});}const combined=[...s1.pillars.map(p=>p.branch),...s2.pillars.map(p=>p.branch)];if(SAMHYUNG.some(grp=>grp.every(b=>combined.includes(b)))){score-=10;details.push({type:"삼형살",icon:"⚠",desc:"합쳤을 때 삼형살 완성 — 함께할수록 시련이 따름",positive:false,pts:-10});}return{score:Math.max(0,Math.min(100,score)),details};}
function compatLabel(s){if(s>=85)return{label:"천생연분",color:"#f59e0b"};if(s>=70)return{label:"좋은 인연",color:"#4ade80"};if(s>=55)return{label:"보통 궁합",color:C.gold};if(s>=40)return{label:"주의 필요",color:"#fb923c"};return{label:"충극 관계",color:C.red};}

function Card({children,style}){return <div style={{background:C.card,borderRadius:18,padding:18,border:"1px solid rgba(215,180,105,0.22)",boxShadow:"0 4px 20px rgba(0,0,0,0.22)",...style}}>{children}</div>;}
function CardTitle({children,style}){return <p style={{textAlign:"center",fontWeight:700,color:C.goldL,fontFamily:"'Noto Serif KR',serif",marginBottom:12,fontSize:"0.85rem",letterSpacing:"0.1em",...style}}>{children}</p>;}
function Field({label,children}){return <div><label style={{fontSize:"0.65rem",fontWeight:700,color:C.muted,display:"block",marginBottom:8,letterSpacing:"0.1em"}}>{label}</label>{children}</div>;}
function SI({style,...p}){return <input {...p} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid rgba(215,180,105,0.32)",background:"rgba(255,255,255,0.10)",color:C.text,fontSize:"0.95rem",outline:"none",boxSizing:"border-box",...style}}/>;}
function GoldBtn({children,style,...p}){return <button {...p} style={{padding:"14px 24px",borderRadius:14,background:p.disabled?`${C.gold}12`:`linear-gradient(135deg,${C.gold},${C.goldD})`,color:p.disabled?C.muted:"#160c00",fontWeight:700,fontSize:"0.88rem",border:"none",cursor:p.disabled?"not-allowed":"pointer",letterSpacing:"0.08em",fontFamily:"'Noto Serif KR',serif",...style}}>{children}</button>;}
function GhBtn({children,active,style,...p}){return <button {...p} style={{padding:"10px 0",borderRadius:0,background:"transparent",color:active?C.gold:`${C.gold}55`,border:"none",borderBottom:active?`2px solid ${C.gold}`:"2px solid transparent",cursor:"pointer",fontSize:"0.68rem",fontWeight:700,whiteSpace:"nowrap",flex:1,letterSpacing:"0.05em",textAlign:"center",transition:"all 0.18s",...style}}>{children}</button>;}
function GenderBtn({v,l,form,setForm}){return <button onClick={()=>setForm({...form,gender:v})} style={{flex:1,padding:12,borderRadius:12,background:form.gender===v?`${C.gold}28`:"rgba(255,255,255,0.07)",color:form.gender===v?C.gold:`${C.gold}88`,border:form.gender===v?`1.5px solid ${C.gold}70`:"1.5px solid rgba(255,255,255,0.14)",cursor:"pointer",fontWeight:700,fontSize:"0.85rem"}}>{l}</button>;}

function PillarCell({p,isDay=false,dayStem,compact=false}){
  const sc=EL_COL[HS_EL[p.stemIdx]]||C.gold,bc=EL_COL[EB_EL[p.branchIdx]]||C.gold;
  const stemSS=isDay?"일간":getSS(dayStem,p.stem);
  const bonStem=EBH[p.branch]?.bon?.[0],branchSS=bonStem?getSS(dayStem,bonStem):"";
  const fs=compact?"1.5rem":"1.9rem";
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:compact?"0.3rem 0.02rem":"0.5rem 0.02rem",background:isDay?`${C.gold}06`:"transparent",borderRadius:8,borderRight:"1px solid rgba(201,169,110,0.05)"}}>
      <span style={{fontSize:"0.42rem",color:isDay?`${C.gold}cc`:C.muted,marginBottom:2,letterSpacing:"0.08em"}}>{p.label}주</span>
      <span style={{fontSize:"0.45rem",color:isDay?C.gold:`${C.gold}75`,fontWeight:700,background:isDay?`${C.gold}22`:"rgba(255,255,255,0.07)",borderRadius:4,padding:"1px 4px",marginBottom:2}}>{stemSS}</span>
      <div style={{fontSize:fs,lineHeight:1,color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.stem]?900:300,marginBottom:1}}>{p.stem}</div>
      <span style={{fontSize:"0.38rem",color:sc,fontWeight:700,marginBottom:4}}>{HS_EL[p.stemIdx]}</span>
      <div style={{width:8,height:1,background:`${C.gold}30`,marginBottom:4}}/>
      <div style={{fontSize:fs,lineHeight:1,color:bc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.branch]?900:300,marginBottom:1}}>{p.branch}</div>
      <span style={{fontSize:"0.38rem",color:bc,fontWeight:700,marginBottom:2}}>{EB_EL[p.branchIdx]}</span>
      {branchSS&&<span style={{fontSize:"0.45rem",color:isDay?C.gold:`${C.gold}75`,fontWeight:700,background:isDay?`${C.gold}22`:"rgba(255,255,255,0.07)",borderRadius:4,padding:"1px 4px"}}>{branchSS}</span>}
    </div>
  );
}

function SajuChart({pillars,dayStem,compact=false,showMulsang=true}){
  const dayEl=HS_EL[HS.indexOf(dayStem)],monthBranch=pillars[2].branch;
  const mh=showMulsang?buildMulsangHeader(dayStem,monthBranch):null;
  return(
    <div>
      {mh&&<div style={{marginBottom:6,padding:"5px 10px",background:`${EL_COL[dayEl]}12`,borderRadius:8,textAlign:"center"}}><span style={{fontSize:"0.68rem",color:C.goldL,fontFamily:"'Noto Serif KR',serif"}}>{mh}</span></div>}
      <div style={{display:"flex"}}>{pillars.map((p,i)=><PillarCell key={i} p={p} isDay={i===1} dayStem={dayStem} compact={compact}/>)}</div>
    </div>
  );
}

function Pentagon({pillars,dayStem,elementScores=null,strength=null,pillars2=null,compact=false}){
  const cnt1=elementScores||calcElementCount(pillars);
  const cnt2=pillars2?calcElementCount(pillars2):null;
  const currentStrength=strength||calcStrength(pillars);
  const dayEl=HS_EL[HS.indexOf(dayStem)];
  const BASE_ORDER=["木","火","土","金","水"];
  const startIdx=Math.max(0,BASE_ORDER.indexOf(dayEl));
  const ORDER=[...BASE_ORDER.slice(startIdx),...BASE_ORDER.slice(0,startIdx)];
  const EC={水:C.water,木:C.wood,火:C.fire,土:C.earth,金:C.metal};
  const sz=compact?110:130,cx=sz,cy=sz,R=compact?65:80;
  const pts=ORDER.map((_,i)=>{const a=(i*72-90)*Math.PI/180;return{x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)};});
  const max1=Math.max(...Object.values(cnt1),1);
  const makePath=(cnt,maxv)=>{const rp=ORDER.map((el,i)=>{const a=(i*72-90)*Math.PI/180;const rr=14+(R-14)*((cnt[el]||0)/maxv);return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)};});return rp.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z";};
  const rd1=makePath(cnt1,max1);
  const rd2=cnt2?makePath(cnt2,Math.max(...Object.values(cnt2),1)):null;
  const strengthColor=currentStrength==="신강"?C.fire:currentStrength==="신약"?C.water:C.gold;
  const total=sz*2;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{padding:"3px 12px",borderRadius:99,background:`${strengthColor}25`,border:`1.5px solid ${strengthColor}70`,fontSize:compact?"0.68rem":"0.78rem",fontWeight:700,color:strengthColor,fontFamily:"'Noto Serif KR',serif",letterSpacing:"0.12em",marginBottom:6}}>{currentStrength}</div>
      <svg width="100%" viewBox={`0 0 ${total} ${total}`} style={{overflow:"visible"}}>
        <rect width={total} height={total} fill="#1e1508" rx="14"/>
        {[0.33,0.66,1.0].map((lv,gi)=>{const gp=ORDER.map((_,i)=>{const a=(i*72-90)*Math.PI/180;const rr=(R-14)*lv+14;return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)};});return<path key={gi} d={gp.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z"} fill="none" stroke="rgba(220,185,120,0.18)" strokeWidth={gi===2?1.2:0.6}/>;}) }
        {pts.map((p,i)=><line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(220,185,120,0.12)" strokeWidth="0.8"/>)}
        {rd2&&<path d={rd2} fill={`${C.water}0a`} stroke={C.water} strokeWidth="1.5" strokeOpacity="0.55" strokeDasharray="4 3"/>}
        <path d={rd1} fill={`${C.gold}0a`} stroke={C.gold} strokeWidth="2" strokeOpacity="0.75"/>
        {ORDER.map((el,i)=>{const ratio=(cnt1[el]||0)/max1;const r=14+(40-14)*ratio;const isDay=el===dayEl;return(<g key={el}><circle cx={pts[i].x} cy={pts[i].y} r={r+4} fill={EC[el]} fillOpacity="0.04"/><circle cx={pts[i].x} cy={pts[i].y} r={r} fill={EC[el]} fillOpacity={0.15+ratio*0.5} stroke={isDay?EC[el]:"none"} strokeWidth={isDay?2:0}/><text x={pts[i].x} y={pts[i].y} textAnchor="middle" dominantBaseline="middle" fontSize={r>20?(compact?13:16):(compact?10:12)} fontWeight="900" fontFamily="serif" fill={EC[el]}>{el}</text><text x={pts[i].x} y={pts[i].y+r+9} textAnchor="middle" fontSize={compact?"7":"9"} fill={EC[el]} fillOpacity="0.65">{(cnt1[el]||0).toFixed(1)}</text></g>);})}
        <circle cx={cx} cy={cy} r="14" fill={EC[dayEl]||C.gold} fillOpacity="0.15" stroke={EC[dayEl]||C.gold} strokeWidth="1.5"/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fontFamily="serif" fill={EC[dayEl]||C.gold}>{dayStem}</text>
      </svg>
    </div>
  );
}

function johuTongByun(tS,hS,mb){
  const cold=["亥","子","丑"],summer=["巳","午","未"],dry=["申","酉","戌","辰"],wet=["寅","卯"];
  const isCold=cold.includes(mb)||tS<40,isHot=summer.includes(mb)||tS>68,isDry=dry.includes(mb)||hS<40,isWet=hS>68;
  if(isCold&&!isHot)return["얼어붙은 대지처럼 재능이 세상에 드러나기까지 시간이 걸립니다.","생각은 깊고 철학적이지만 행동력이 부족해 기회를 놓치기 쉽습니다.","火 기운의 대운에서 얼음이 녹듯 삶에 활기가 깃들고 세상의 인정을 받게 됩니다."];
  if(isHot&&!isCold)return["뜨거운 열정과 폭발적인 추진력을 가졌지만 감정 기복과 다혈질이 옥의 티입니다.","번아웃이 쉽게 찾아오고 일을 벌이기만 하고 수습하지 못하는 용두사미가 되기 쉽습니다.","水 기운의 대운에서 조급함이 사라지고 그간 벌려놓은 일들이 결실로 연결됩니다."];
  if(isDry&&!isWet&&!isCold&&!isHot)return["맺고 끊음이 지나치게 칼 같아 타인에게 까칠하거나 냉정하다는 인상을 줍니다.","원칙과 효율을 중시하다 보니 인간관계가 점점 좁아지는 경향이 있습니다.","水·濕土 기운이 오면 성격에 윤기가 생기고 타인과 융화하는 능력이 깨어납니다."];
  if(isWet&&!isDry&&!isCold&&!isHot)return["정이 너무 많아 거절을 못하고 주변 사람들에게 끌려다니는 경향이 있습니다.","우유부단함 때문에 결정적인 기회를 놓치거나 만성적인 무기력에 빠지기 쉽습니다.","火·燥土 기운의 대운에서 결단력이 생기고 자기 주도적으로 삶을 개척하게 됩니다."];
  if(isCold&&isWet)return["한기와 습기가 겹쳐 활동력과 의욕이 크게 저하되는 구조입니다.","매사 진행이 더디고 정체되는 느낌이 강하며 감정적 무기력이 반복됩니다.","丙火의 따뜻한 태양 기운이 오면 비로소 얼음이 녹아 내면의 빛이 세상에 드러납니다."];
  if(isHot&&isDry)return["열기와 건조함이 겹쳐 심혈관 부담과 감정 과부하가 누적되기 쉬운 구조입니다.","인간관계에서 폭발과 단절을 반복하며 지나친 원칙주의로 마찰이 잦습니다.","癸水의 맑은 빗물 기운이 오면 열기가 식고 인간관계에 온기와 윤기가 돌아옵니다."];
  return["온도와 습도의 균형이 잘 잡힌 안정적인 원국 구조입니다.","극단적인 성향보다는 상황에 따라 유연하게 대처하는 능력이 있습니다.","대운의 흐름에 따라 순조롭게 성장하며 큰 굴곡 없이 꾸준한 발전이 가능합니다."];
}

function JohuTab({pillars,johuDetail}){
  const{tempScore,humScore,totalScore,need,avoid}=johuDetail;
  const{color:tC}=johuLabel(tempScore),{color:hC}=johuLabel(humScore),{label:totL,color:totC}=johuLabel(totalScore);
  const r=38,circ=2*Math.PI*r;
  const mb=pillars[2].branch,lines=johuTongByun(tempScore,humScore,mb);
  function johuText(tS,hS){const tL=tS<40,tH=tS>70,hL=hS<40,hH=hS>70;if(tL&&hH)return{text:"너무 춥고 습합니다",color:"#4da0f0"};if(tL&&hL)return{text:"너무 춥고 건조합니다",color:"#86efac"};if(tH&&hH)return{text:"너무 덥고 습합니다",color:"#fb923c"};if(tH&&hL)return{text:"너무 덥고 건조합니다",color:"#f05030"};if(tL)return{text:"한기(寒氣)가 강합니다",color:"#4da0f0"};if(tH)return{text:"열기(熱氣)가 강합니다",color:"#f05030"};if(hL)return{text:"건조한 기운이 강합니다",color:"#d4ae6e"};if(hH)return{text:"습한 기운이 강합니다",color:"#3fc060"};return{text:"온습도가 고른 균형 상태입니다",color:"#4ade80"};}
  const jt=johuText(tempScore,humScore);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card>
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:"1.05rem",fontWeight:900,color:jt.color,fontFamily:"'Noto Serif KR',serif",marginBottom:6}}>{jt.text}</div>
          <div style={{display:"flex",justifyContent:"center",gap:8}}><span style={{fontSize:"0.6rem",color:tC,background:`${tC}15`,padding:"2px 10px",borderRadius:99,fontWeight:700}}>온도 {johuLabel(tempScore).label}</span><span style={{fontSize:"0.6rem",color:hC,background:`${hC}15`,padding:"2px 10px",borderRadius:99,fontWeight:700}}>습도 {johuLabel(humScore).label}</span></div>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:12}}>
          {[{score:tempScore,label:"온도",icon:"🌡",color:tC,sub:"火·木 계열"},{score:humScore,label:"습도",icon:"💧",color:hC,sub:"水·木 계열"}].map(({score,label,icon,color,sub})=>(
            <div key={label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"12px 8px",background:`${color}08`,borderRadius:14,border:`1px solid ${color}25`}}>
              <span style={{fontSize:"1.3rem"}}>{icon}</span>
              <div style={{position:"relative",width:90,height:90}}>
                <svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="8"/><circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round" transform="rotate(-90 45 45)" style={{transition:"stroke-dashoffset 1.2s ease"}}/></svg>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:"1.2rem",fontWeight:900,color,lineHeight:1}}>{score}</span></div>
              </div>
              <span style={{fontSize:"0.72rem",fontWeight:700,color,letterSpacing:"0.08em"}}>{label}</span>
              <span style={{fontSize:"0.52rem",color:C.muted}}>{sub}</span>
            </div>
          ))}
        </div>
        {(need.length>0||avoid.length>0)&&(
          <div style={{display:"flex",gap:8,marginBottom:4}}>
            {need.length>0&&<div style={{flex:1,padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}><div style={{fontSize:"0.58rem",color:C.muted,marginBottom:8,fontWeight:700}}>필요한 오행</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{need.map(el=><div key={el} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:10,background:`${EL_COL[el]}18`,border:`1.5px solid ${EL_COL[el]}55`}}><span style={{fontSize:"1.3rem",fontFamily:"serif",color:EL_COL[el],fontWeight:900}}>{el}</span><span style={{fontSize:"0.52rem",color:EL_COL[el],fontWeight:700}}>필요</span></div>)}</div></div>}
            {avoid.length>0&&<div style={{flex:1,padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}><div style={{fontSize:"0.58rem",color:C.muted,marginBottom:8,fontWeight:700}}>과다 주의</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{avoid.map(el=><div key={el} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:10,background:`${EL_COL[el]}12`,border:`1.5px solid ${EL_COL[el]}44`}}><span style={{fontSize:"1.3rem",fontFamily:"serif",color:EL_COL[el],fontWeight:900,opacity:0.75}}>{el}</span><span style={{fontSize:"0.52rem",color:EL_COL[el],fontWeight:700,opacity:0.75}}>과다</span></div>)}</div></div>}
          </div>
        )}
      </Card>
      <Card><CardTitle>✦ 조후 통변</CardTitle><div style={{display:"flex",flexDirection:"column",gap:8}}>{lines.map((l,i)=><div key={i} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:12,background:i===0?`${jt.color}10`:"rgba(255,255,255,0.04)",border:`1px solid ${i===0?jt.color+"30":"rgba(255,255,255,0.08)"}`}}><span style={{flexShrink:0,fontSize:"0.62rem",color:jt.color,opacity:i===0?1:0.6,marginTop:2}}>{i===0?"●":i===1?"○":"◦"}</span><span style={{fontSize:"0.7rem",color:"rgba(240,220,180,0.90)",lineHeight:1.7,fontFamily:"'Noto Serif KR',serif"}}>{l}</span></div>)}</div></Card>
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
  const W=340,H=140,PL=14,PR=14,PT=18,PB=32,gW=W-PL-PR,gH=H-PT-PB,n=grades.length;
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
        {grades.map((g,i)=>{const c=gc[g.g.grade]||C.gold,isSel=selIdx===i,isNow=nowIdx===i;return(<g key={i} style={{cursor:"pointer"}} onClick={()=>setSelDaeun(g.startYear===selDaeun?.startYear?null:g)}>{(isSel||isNow)&&<circle cx={pts[i].x} cy={pts[i].y} r="14" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1" strokeOpacity="0.4"/>}<circle cx={pts[i].x} cy={pts[i].y} r={isSel?6:4} fill={c} stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" filter={isSel?"url(#glow)":"none"}/><text x={pts[i].x} y={pts[i].y-10} textAnchor="middle" fontSize={isSel?9:7.5} fill={c} fontWeight={isSel?"bold":"normal"} opacity={isSel?1:0.8}>{g.g.grade}</text><text x={pts[i].x} y={PT+gH+12} textAnchor="middle" fontSize="8" fill={isSel?C.goldL:"rgba(220,185,120,0.55)"} fontWeight={isSel?"bold":"normal"}>{g.stem}{g.branch}</text><text x={pts[i].x} y={PT+gH+22} textAnchor="middle" fontSize="6.5" fill="rgba(220,185,120,0.38)">{g.startAge}세</text></g>);})}
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
      {status==="idle"&&<div style={{height:210,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}><div style={{fontSize:44,fontFamily:"serif",color:elColor,opacity:0.25,animation:"float 3s ease-in-out infinite"}}>{dayStem}</div><button onClick={generate} style={{padding:"10px 24px",borderRadius:12,background:`${elColor}18`,color:elColor,border:`1px solid ${elColor}40`,cursor:"pointer",fontSize:"0.78rem",fontWeight:700}}>🎬 이미지 생성</button></div>}
      {status==="loading"&&<div style={{height:210,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,padding:"1.5rem"}}><div style={{fontSize:32,color:elColor,opacity:0.35,fontFamily:"serif",animation:"shimmer 1.5s ease infinite"}}>{dayStem}</div><div style={{width:"100%",maxWidth:200}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:"0.6rem",color:C.muted}}>{progMsg}</span><span style={{fontSize:"0.65rem",fontWeight:700,color:elColor}}>{prog}%</span></div><div style={{height:4,borderRadius:99,background:"rgba(220,185,120,0.14)"}}><div style={{height:"100%",borderRadius:99,background:elColor,width:`${prog}%`,transition:"width 0.4s ease"}}/></div></div></div>}
      {status==="done"&&url&&<img src={url} alt={title} style={{width:"100%",display:"block"}}/>}
      {status==="error"&&<div style={{height:170,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:"1rem"}}><p style={{color:"#ff6a50",fontSize:"0.68rem",margin:0,textAlign:"center"}}>⚠ {err}</p><button onClick={generate} style={{padding:"7px 16px",borderRadius:10,background:`${C.gold}10`,color:C.gold,border:`1px solid ${C.gold}25`,cursor:"pointer",fontSize:"0.7rem"}}>↺ 다시 시도</button></div>}
    </div>
  );
}

// ============================================================
// ★ 출산택일 시뮬레이터
// ============================================================
const HOUR_REPR=[1,3,5,7,9,11,13,15,17,19,21,23];
const HOUR_LABEL=["23:00~01:00","01:00~03:00","03:00~05:00","05:00~07:00","07:00~09:00","09:00~11:00","11:00~13:00","13:00~15:00","15:00~17:00","17:00~19:00","19:00~21:00","21:00~23:00"];

function TaekIlSimulator(){
  const now=new Date();
  const[simYear,setSimYear]=useState(now.getFullYear());
  const[simMonth,setSimMonth]=useState(now.getMonth()+1);
  const[simDay,setSimDay]=useState(now.getDate());
  const[simHourIdx,setSimHourIdx]=useState(6);
  const[simGender,setSimGender]=useState("male");
  const[simSaju,setSimSaju]=useState(null);
  const[simErr,setSimErr]=useState("");

  function recalc(y,m,d,hi){
    const err=validateDate(y,m,d);if(err){setSimErr(err);return;}
    setSimErr("");
    try{
      const r=calcSaju(y,m,d,HOUR_REPR[hi],0);
      r.solar={year:y,month:m,day:d,hour:HOUR_REPR[hi],minute:0};
      setSimSaju(r);
    }catch(e){setSimErr("계산 오류: "+e.message);}
  }

  // 초기 계산
  useState(()=>{recalc(simYear,simMonth,simDay,simHourIdx);},[]);

  function handleAdjDay(delta){
    let y=simYear,m=simMonth,d=simDay+delta;
    const mx=getMaxDay(y,m);
    if(d>mx){d=1;m++;if(m>12){m=1;y++;}}
    if(d<1){m--;if(m<1){m=12;y--;}d=getMaxDay(y,m);}
    setSimYear(y);setSimMonth(m);setSimDay(d);
    recalc(y,m,d,simHourIdx);
  }
  function handleAdjHour(delta){
    const ni=((simHourIdx+delta)%12+12)%12;
    setSimHourIdx(ni);
    recalc(simYear,simMonth,simDay,ni);
  }

  const johuD=simSaju?calcJohuDetail(simSaju.pillars):null;
  const sResult=simSaju?calcStrengthDetail(simSaju.pillars):null;
  const strength=sResult?.strength;
  const strengthColor=strength==="신강"?C.fire:strength==="신약"?C.water:C.gold;

  function AdjCol({pillarIdx,onUp,onDown,headerText,accentColor}){
    if(!simSaju)return<div style={{width:72,flexShrink:0}}/>;
    const p=simSaju.pillars[pillarIdx];
    const sc=EL_COL[HS_EL[p.stemIdx]]||C.gold,bc=EL_COL[EB_EL[p.branchIdx]]||C.gold;
    const stemSS=pillarIdx===1?"일간":getSS(simSaju.dayStem,p.stem);
    const bonStem=EBH[p.branch]?.bon?.[0],branchSS=bonStem?getSS(simSaju.dayStem,bonStem):"";
    return(
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,width:72,flexShrink:0}}>
        <div style={{padding:"4px 6px",borderRadius:8,background:`${accentColor}12`,border:`1px solid ${accentColor}25`,textAlign:"center",width:"100%"}}>
          <div style={{fontSize:"0.4rem",color:C.muted}}>{ pillarIdx===0?"시간범위":"양력날짜"}</div>
          <div style={{fontSize:pillarIdx===0?"0.48rem":"0.58rem",fontWeight:700,color:C.goldL,lineHeight:1.3}}>
            {pillarIdx===0?HOUR_LABEL[simHourIdx]:`${simYear}.${simMonth}.${simDay}`}
          </div>
        </div>
        <button onClick={onUp} style={{width:"100%",padding:"7px 0",borderRadius:10,background:`${accentColor}18`,border:`1.5px solid ${accentColor}40`,color:accentColor,fontSize:"1.1rem",cursor:"pointer",fontWeight:900,lineHeight:1}}>▲</button>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px 3px",background:`${accentColor}08`,borderRadius:12,border:`1.5px solid ${accentColor}35`,width:"100%",gap:1,minHeight:120}}>
          <span style={{fontSize:"0.4rem",color:`${accentColor}cc`,letterSpacing:"0.08em"}}>{p.label}주</span>
          <span style={{fontSize:"0.44rem",color:accentColor,fontWeight:700,background:`${accentColor}22`,borderRadius:4,padding:"1px 4px"}}>{stemSS}</span>
          <div style={{fontSize:"1.8rem",lineHeight:1,color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.stem]?900:300}}>{p.stem}</div>
          <span style={{fontSize:"0.38rem",color:sc,fontWeight:700}}>{HS_EL[p.stemIdx]}</span>
          <div style={{width:8,height:1,background:`${accentColor}30`}}/>
          <div style={{fontSize:"1.8rem",lineHeight:1,color:bc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.branch]?900:300}}>{p.branch}</div>
          <span style={{fontSize:"0.38rem",color:bc,fontWeight:700}}>{EB_EL[p.branchIdx]}</span>
          {branchSS&&<span style={{fontSize:"0.44rem",color:accentColor,fontWeight:700,background:`${accentColor}22`,borderRadius:4,padding:"1px 4px"}}>{branchSS}</span>}
        </div>
        <button onClick={onDown} style={{width:"100%",padding:"7px 0",borderRadius:10,background:`${accentColor}18`,border:`1.5px solid ${accentColor}40`,color:accentColor,fontSize:"1.1rem",cursor:"pointer",fontWeight:900,lineHeight:1}}>▼</button>
      </div>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card>
        <CardTitle>출산택일 시뮬레이터</CardTitle>
        <p style={{fontSize:"0.6rem",color:C.muted,textAlign:"center",marginBottom:14,lineHeight:1.8}}>시(時) ▲▼ : 2시간(시지) 단위 조정<br/>일(日) ▲▼ : 하루씩 날짜 이동</p>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[["male","아들 ♂"],["female","딸 ♀"]].map(([v,l])=><button key={v} onClick={()=>setSimGender(v)} style={{flex:1,padding:10,borderRadius:12,background:simGender===v?`${C.gold}28`:"rgba(255,255,255,0.07)",color:simGender===v?C.gold:`${C.gold}88`,border:simGender===v?`1.5px solid ${C.gold}70`:"1.5px solid rgba(255,255,255,0.14)",cursor:"pointer",fontWeight:700,fontSize:"0.82rem"}}>{l}</button>)}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"stretch"}}>
          <AdjCol pillarIdx={0} onUp={()=>handleAdjHour(1)} onDown={()=>handleAdjHour(-1)} accentColor={C.gold}/>
          <AdjCol pillarIdx={1} onUp={()=>handleAdjDay(1)} onDown={()=>handleAdjDay(-1)} accentColor={C.wood}/>
          <div style={{flex:1,display:"flex",gap:4}}>
            {simSaju&&[2,3].map(i=>{
              const p=simSaju.pillars[i];
              const sc=EL_COL[HS_EL[p.stemIdx]]||C.gold,bc=EL_COL[EB_EL[p.branchIdx]]||C.gold;
              const stemSS=getSS(simSaju.dayStem,p.stem);
              const bonStem=EBH[p.branch]?.bon?.[0],branchSS=bonStem?getSS(simSaju.dayStem,bonStem):"";
              return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px 2px",background:"rgba(255,255,255,0.04)",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",gap:1}}>
                <span style={{fontSize:"0.4rem",color:C.muted,letterSpacing:"0.08em"}}>{p.label}주</span>
                <span style={{fontSize:"0.44rem",color:`${C.gold}75`,fontWeight:700,background:"rgba(255,255,255,0.07)",borderRadius:4,padding:"1px 4px"}}>{stemSS}</span>
                <div style={{fontSize:"1.8rem",lineHeight:1,color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.stem]?900:300}}>{p.stem}</div>
                <span style={{fontSize:"0.38rem",color:sc,fontWeight:700}}>{HS_EL[p.stemIdx]}</span>
                <div style={{width:8,height:1,background:`${C.gold}30`}}/>
                <div style={{fontSize:"1.8rem",lineHeight:1,color:bc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[p.branch]?900:300}}>{p.branch}</div>
                <span style={{fontSize:"0.38rem",color:bc,fontWeight:700}}>{EB_EL[p.branchIdx]}</span>
                {branchSS&&<span style={{fontSize:"0.44rem",color:`${C.gold}75`,fontWeight:700,background:"rgba(255,255,255,0.07)",borderRadius:4,padding:"1px 4px"}}>{branchSS}</span>}
              </div>);
            })}
          </div>
        </div>
        {simErr&&<div style={{marginTop:8,color:"#ff6a50",fontSize:"0.68rem",textAlign:"center"}}>{simErr}</div>}
      </Card>
      {simSaju&&johuD&&sResult&&(
        <div style={{display:"flex",flexDirection:"column",gap:10,animation:"slideUp 0.3s ease"}}>
          <Card style={{padding:14}}>
            <div style={{display:"flex",gap:14,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:"0.52rem",color:C.muted,marginBottom:4}}>신강/신약</div><div style={{padding:"4px 14px",borderRadius:99,background:`${strengthColor}25`,border:`1.5px solid ${strengthColor}70`,fontSize:"0.88rem",fontWeight:900,color:strengthColor,fontFamily:"'Noto Serif KR',serif"}}>{strength}</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:"0.52rem",color:C.muted,marginBottom:4}}>조후 균형</div><div style={{padding:"4px 14px",borderRadius:99,background:`${johuLabel(johuD.totalScore).color}25`,border:`1.5px solid ${johuLabel(johuD.totalScore).color}70`,fontSize:"0.88rem",fontWeight:900,color:johuLabel(johuD.totalScore).color,fontFamily:"'Noto Serif KR',serif"}}>{johuLabel(johuD.totalScore).label}</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:"0.52rem",color:C.muted,marginBottom:4}}>일간</div><div style={{fontSize:"1.8rem",fontFamily:"'Noto Serif KR',serif",color:EL_COL[HS_EL[simSaju.pillars[1].stemIdx]],fontWeight:900,lineHeight:1}}>{simSaju.dayStem}</div></div>
            </div>
          </Card>
          <Card style={{padding:14}}><Pentagon pillars={simSaju.pillars} dayStem={simSaju.dayStem} elementScores={sResult.elementScores} strength={strength} compact/></Card>
          {johuD.need.length>0&&<Card style={{padding:14}}><div style={{fontSize:"0.6rem",color:C.muted,marginBottom:8,fontWeight:700}}>필요한 오행</div><div style={{display:"flex",gap:8}}>{johuD.need.map(el=><div key={el} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 12px",borderRadius:10,background:`${EL_COL[el]}18`,border:`1.5px solid ${EL_COL[el]}55`}}><span style={{fontSize:"1.4rem",fontFamily:"serif",color:EL_COL[el],fontWeight:900}}>{el}</span><span style={{fontSize:"0.55rem",color:EL_COL[el],fontWeight:700}}>필요</span></div>)}</div></Card>}
        </div>
      )}
    </div>
  );
}

function CompatResult({compat,s1,s2,name1,name2}){
  const{score,details}=compat,{label,color}=compatLabel(score),r=50,circ=2*Math.PI*r;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card><div style={{display:"flex",alignItems:"center",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",width:120,height:120}}><svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="10"/><circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset 1.5s ease"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:"2rem",fontWeight:900,color,lineHeight:1}}>{score}</span><span style={{fontSize:"0.48rem",color,opacity:0.7}}>/ 100</span></div></div>
        <div><div style={{fontSize:"1.15rem",fontWeight:900,color,fontFamily:"'Noto Serif KR',serif",marginBottom:6}}>{label}</div><div style={{fontSize:"0.63rem",color:C.muted,lineHeight:1.8}}>{name1} × {name2}<br/>일간 <span style={{color:EL_COL[HS_EL[s1.pillars[1].stemIdx]]}}>{s1.pillars[1].stem}</span>·<span style={{color:EL_COL[HS_EL[s2.pillars[1].stemIdx]]}}>{s2.pillars[1].stem}</span></div></div>
      </div></Card>
      <Card><CardTitle>궁합 세부 분석</CardTitle><div style={{display:"flex",flexDirection:"column",gap:8}}>{details.map((d,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 12px",borderRadius:12,background:d.positive?`${C.gold}12`:`${C.red}10`,border:`1px solid ${d.positive?C.gold:C.red}30`}}><span style={{fontSize:"1.1rem",flexShrink:0,color:d.positive?C.gold:C.red,lineHeight:1.2,marginTop:1}}>{d.icon}</span><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{fontSize:"0.7rem",fontWeight:700,color:d.positive?C.gold:C.red,fontFamily:"'Noto Serif KR',serif"}}>{d.type}</span>{d.pts!==0&&<span style={{fontSize:"0.58rem",color:d.positive?"#4ade80":C.red,background:d.positive?"rgba(74,222,128,0.1)":"rgba(224,80,64,0.1)",padding:"1px 6px",borderRadius:6,fontWeight:700}}>{d.pts>0?"+":""}{d.pts}점</span>}</div><p style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.6}}>{d.desc}</p></div></div>)}</div></Card>
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
      setSelDaeun(cur||null);setImgKey(0);setSaju2(null);setCompat(null);setTab("chart");setScreen("result");
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
      <div style={{padding:"64px 24px 28px",textAlign:"center",background:`linear-gradient(180deg,#3c2410 0%,${C.bg} 100%)`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% -10%, rgba(201,169,110,0.07) 0%, transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-55%)",fontSize:"18rem",fontFamily:"'Noto Serif KR',serif",fontWeight:900,color:"transparent",WebkitTextStroke:"1px rgba(220,185,120,0.08)",userSelect:"none",pointerEvents:"none",lineHeight:1}}>命</div>
        <div style={{position:"relative",zIndex:1,animation:"fadeIn 0.7s ease"}}>
          <div style={{fontSize:"5.5rem",fontFamily:"'Noto Serif KR',serif",fontWeight:900,color:C.gold,lineHeight:1,marginBottom:8,textShadow:"0 0 60px rgba(201,169,110,0.5)",animation:"float 4s ease-in-out infinite"}}>命</div>
          <h1 style={{fontSize:"1.5rem",fontWeight:900,fontFamily:"'Noto Serif KR',serif",letterSpacing:"0.55em",color:C.goldL,marginBottom:8}}>사주명리</h1>
          <p style={{fontSize:"0.62rem",color:C.muted,letterSpacing:"0.18em"}}>四柱命理 · 조후분석 · 물상이미지</p>
        </div>
      </div>
      <div style={{padding:"12px 20px 100px",display:"flex",flexDirection:"column",gap:16,maxWidth:480,margin:"0 auto",animation:"fadeIn 0.6s ease 0.1s both"}}>
        <Field label="이름 (선택)"><SI placeholder="성함을 입력하세요" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
        <Field label="생년월일">
          <div style={{display:"flex",gap:8}}>
            <SI type="number" placeholder="년도 (1900~2030)" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} style={{flex:2}}/>
            <SI type="number" placeholder="월 (1~12)" value={form.month} onChange={e=>setForm({...form,month:e.target.value})} style={{flex:1}}/>
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
          {form.hour!==""&&!isNaN(+form.hour)&&<div style={{marginTop:5,fontSize:"0.56rem",color:C.muted}}>{form.hour}시 {form.minute||0}분 → {EB[getHB(+form.hour,+(form.minute||0))]}時 ({EB_KR[getHB(+form.hour,+(form.minute||0))]}시)</div>}
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
    const johuDetail=calcJohuDetail(pillars,selDaeun?.branch);
    const strengthColor=strength==="신강"?C.fire:strength==="신약"?C.water:C.gold;
    const TABS=[{k:"chart",l:"오행",i:"⬠"},{k:"johu",l:"조후",i:"☯"},{k:"image",l:"물상",i:"🎬"},{k:"taekil",l:"택일",i:"✦"},{k:"compat",l:"궁합",i:"♡"}];
    const curYear=new Date().getFullYear();
    const seunBase=selDaeun?selDaeun.startYear:curYear-4;
    const seunList=Array.from({length:10},(_,i)=>calcSeun(seunBase+i));

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
              <span style={{fontSize:"0.58rem",fontWeight:700,color:johuLabel(johuDetail.totalScore).color}}>{johuLabel(johuDetail.totalScore).label}</span>
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
                <Card style={{padding:"10px 8px 12px"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignItems:"start"}}>
                    <div><div style={{fontSize:"0.55rem",color:C.muted,letterSpacing:"0.1em",marginBottom:5,fontWeight:700}}>원국 팔자</div><SajuChart pillars={pillars} dayStem={dayStem} compact showMulsang/></div>
                    <div><div style={{fontSize:"0.55rem",color:C.muted,letterSpacing:"0.1em",marginBottom:5,fontWeight:700}}>오행 세력도</div><Pentagon pillars={pillars} dayStem={dayStem} elementScores={sResult.elementScores} strength={strength} compact/></div>
                  </div>
                </Card>
                <Card>
                  <CardTitle style={{marginBottom:8}}>대운 · 세운</CardTitle>
                  <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:10}}>
                    <div>
                      <div style={{fontSize:"0.52rem",color:C.muted,marginBottom:5,fontWeight:700,letterSpacing:"0.08em"}}>▶ 대운</div>
                      <DaeunPanel daeunList={daeunList} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={setSelDaeun}/>
                    </div>
                    <div>
                      <div style={{fontSize:"0.52rem",color:C.muted,marginBottom:5,fontWeight:700,letterSpacing:"0.08em"}}>▶ 세운</div>
                      <div style={{display:"flex",flexDirection:"column",gap:2,maxHeight:190,overflowY:"auto"}}>
                        {seunList.map(s=>{const isNow=s.year===curYear;const sc=EL_COL[HS_EL[s.stemIdx]],bc=EL_COL[EB_EL[s.branchIdx]];return(<div key={s.year} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 7px",borderRadius:7,background:isNow?`${C.gold}18`:"rgba(255,255,255,0.04)",border:isNow?`1px solid ${C.gold}40`:"1px solid transparent"}}>{isNow&&<div style={{width:4,height:4,borderRadius:"50%",background:"#4ade80",flexShrink:0}}/>}<span style={{fontSize:"0.48rem",color:C.muted,width:26,flexShrink:0}}>{s.year}</span><span style={{fontSize:"0.9rem",color:sc,fontFamily:"serif",fontWeight:KANJI_YANG[s.stem]?900:300,lineHeight:1}}>{s.stem}</span><span style={{fontSize:"0.9rem",color:bc,fontFamily:"serif",fontWeight:KANJI_YANG[s.branch]?900:300,lineHeight:1}}>{s.branch}</span><span style={{fontSize:"0.38rem",color:sc,opacity:0.7}}>{HS_EL[s.stemIdx]}</span><span style={{fontSize:"0.38rem",color:bc,opacity:0.7}}>{EB_EL[s.branchIdx]}</span></div>);})}
                      </div>
                    </div>
                  </div>
                </Card>
                {selDaeun&&(()=>{const grade=calcDaeunGrade(pillars,dayStem,selDaeun.stem,selDaeun.branch);return(<Card><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><div style={{flexShrink:0,padding:"4px 10px",borderRadius:8,background:`${grade.color}22`,border:`1.5px solid ${grade.color}55`}}><span style={{fontSize:"1.1rem",fontWeight:900,color:grade.color,fontFamily:"'Noto Serif KR',serif"}}>{grade.grade}</span></div><div><div style={{fontSize:"0.72rem",fontWeight:700,color:grade.color,fontFamily:"'Noto Serif KR',serif"}}>{selDaeun.stem}{selDaeun.branch} 대운 · {grade.label}</div><div style={{fontSize:"0.56rem",color:"rgba(230,195,130,0.8)",marginTop:1}}>{grade.desc}</div></div></div>{grade.reasons&&grade.reasons.length>0&&(<div style={{borderTop:`1px dashed ${grade.color}40`,paddingTop:10}}><div style={{fontSize:"0.58rem",color:grade.color,fontWeight:700,marginBottom:5}}>💡 등급 분석 근거</div>{grade.reasons.map((r,idx)=><div key={idx} style={{fontSize:"0.66rem",color:"rgba(240,220,180,0.9)",marginBottom:3,display:"flex",gap:5,lineHeight:1.4}}><span style={{color:grade.color,opacity:0.8}}>•</span><span>{r}</span></div>)}</div>)}</Card>);})()}
                <Card><CardTitle style={{marginBottom:8}}>대운 인생 그래프</CardTitle><LifeGraph daeunList={daeunList} pillars={pillars} dayStem={dayStem} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={setSelDaeun}/></Card>
                <Card><CardTitle>지장간</CardTitle><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>{pillars.map((p,i)=>{const fd=EBH[p.branch]||{},items=[fd.yo,fd.jung,fd.bon].filter(Boolean);return(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:"0.48rem",color:C.muted,marginBottom:4}}>{p.branch}({EB_KR[p.branchIdx]})</div>{items.map(([stem,days],j)=>{const sc=EL_COL[HS_EL[HS.indexOf(stem)]]||C.gold;return(<div key={j} style={{marginBottom:4,padding:"3px 2px",borderRadius:6,background:"rgba(255,255,255,0.05)"}}><span style={{fontSize:"1rem",color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_YANG[stem]?900:300}}>{stem}</span><div style={{fontSize:"0.38rem",color:sc,opacity:0.75,fontWeight:700}}>{getSS(dayStem,stem)}</div><div style={{fontSize:"0.36rem",color:C.muted}}>{days}일</div></div>);})}</div>);})}</div></Card>
              </div>
            )}

            {tab==="johu"&&<JohuTab pillars={pillars} johuDetail={johuDetail}/>}

            {tab==="image"&&(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <PhysImageCard key={`origin-${imgKey}`} title="나의 원국 물상" prompt={buildOriginPrompt(dayStem,pillars[2].branch,form.gender,johuDetail.tempScore,johuDetail.humScore)} dayStem={dayStem} label="origin" note={`일간 ${dayStem}(${HS_EL[pillars[1].stemIdx]}) · 월지 ${pillars[2].branch}(${EB_KR[pillars[2].branchIdx]}) · 조후 ${johuLabel(johuDetail.totalScore).label}`}/>
                <Card>
                  <CardTitle>대운 반영 물상</CardTitle>
                  <p style={{fontSize:"0.62rem",color:C.muted,textAlign:"center",marginBottom:12,lineHeight:1.8}}>대운의 기운이 원국에 스며들 때<br/>서사적 전환을 담은 이미지입니다</p>
                  <DaeunPanel daeunList={daeunList} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={d=>{setSelDaeun(d);setImgKey(k=>k+1);}}/>
                  {selDaeun?<div style={{marginTop:14}}><PhysImageCard key={`daeun-${imgKey}-${selDaeun.startYear}`} title={`${selDaeun.stem}${selDaeun.branch} 대운 융합 물상`} prompt={buildDaeunFusionPrompt(dayStem,pillars[2].branch,selDaeun.branch,form.gender,johuDetail.tempScore,johuDetail.humScore)} dayStem={dayStem} label="daeun" note={`원국 ${pillars[2].branch} + 대운 ${selDaeun.branch} 서사적 전환`}/></div>:<div style={{marginTop:12,padding:"14px",borderRadius:12,background:"rgba(255,255,255,0.07)",border:"1px dashed rgba(220,185,120,0.35)",textAlign:"center"}}><p style={{fontSize:"0.65rem",color:C.muted}}>위에서 대운을 선택하면 융합 이미지를 생성할 수 있습니다</p></div>}
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
                {saju2&&<Card style={{padding:"0.9rem 0.3rem"}}><CardTitle style={{marginBottom:8}}>{form2.name||"상대방"} 사주</CardTitle><SajuChart pillars={saju2.pillars} dayStem={saju2.dayStem} compact showMulsang={false}/></Card>}
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
