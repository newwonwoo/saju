import { useState } from "react";

// ============================================================
// 색상 테마
// ============================================================
const C = {
  gold:"#c9a96e",goldL:"#e8d5a8",goldD:"#8b6010",
  bg:"#0b0805",card:"#16100a",cardL:"#1f1710",
  text:"#f0e6d0",muted:"rgba(201,169,110,0.45)",
  water:"#2a7fd4",wood:"#2a9a4a",fire:"#e04020",earth:"#c49010",metal:"#9a8060",
  red:"#e05040",
};
const EL_COL={"水":C.water,"木":C.wood,"火":C.fire,"土":C.earth,"金":C.metal};

// ============================================================
// 날짜 계산
// ============================================================
function getJD(y,m,d){const a=Math.floor((14-m)/12);const yy=y+4800-a;const mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
function jdToDate(jd){const L=Math.floor(jd)+68569;const N=Math.floor(4*L/146097);const L2=L-Math.floor((146097*N+3)/4);const I=Math.floor(4000*(L2+1)/1461001);const L3=L2-Math.floor(1461*I/4)+31;const J=Math.floor(80*L3/2447);const day=L3-Math.floor(2447*J/80);const L4=Math.floor(J/11);const month=J+2-12*L4;const year=100*(N-49)+I+L4;return{year,month,day};}
function sunLon(jd){const T=(jd-2451545)/36525;const L0=280.46646+36000.76983*T+0.0003032*T*T;const M=((357.52911+35999.05029*T-0.0001537*T*T)*Math.PI)/180;const CC=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);return((L0+CC)%360+360)%360;}
function findTermJD(year,lon){const base=getJD(year,1,1);const approx=base+((lon-sunLon(base)+360)%360)/360*365.25;let j1=approx-15,j2=approx+15;for(let i=0;i<60;i++){const mid=(j1+j2)/2;let d=lon-sunLon(mid);if(d>180)d-=360;if(d<-180)d+=360;if(Math.abs(d)<0.00005)break;if(d>0)j1=mid;else j2=mid;}return(j1+j2)/2;}
const tCache={};
function getTerms(year){if(tCache[year])return tCache[year];const T=[{n:"입춘",l:315},{n:"경칩",l:345},{n:"청명",l:15},{n:"입하",l:45},{n:"망종",l:75},{n:"소서",l:105},{n:"입추",l:135},{n:"백로",l:165},{n:"한로",l:195},{n:"입동",l:225},{n:"대설",l:255},{n:"소한",l:285}];const r={};for(const t of T){const jd=findTermJD(year,t.l);const d=jdToDate(jd+9/24);r[t.n]={month:d.month,day:d.day,jd};}tCache[year]=r;return r;}

// ============================================================
// 음력
// ============================================================
const LDB=[[1900,[0,0x04AE53]],[1901,[0,0x0A5748]],[1902,[5,0x5526BD]],[1903,[0,0x0D2650]],[1904,[0,0x0D9544]],[1905,[4,0x46AA59]],[1906,[0,0x056AD0]],[1907,[9,0x9AD4DC]],[1908,[0,0x0B4AE8]],[1909,[0,0x0B4AE0]],[1910,[6,0x6A4DE5]],[1911,[0,0x0A4EB0]],[1912,[0,0x0D26E4]],[1913,[5,0x5529D0]],[1914,[0,0x0D2AE8]],[1915,[0,0x0D0AC4]],[1916,[4,0x46B553]],[1917,[0,0x056D50]],[1918,[0,0x05ABA5]],[1919,[3,0x25B650]],[1920,[0,0x095B50]],[1921,[8,0x84AFBF]],[1922,[0,0x04AE53]],[1923,[0,0x0A4FBA]],[1924,[5,0x5526B5]],[1925,[0,0x06A690]],[1926,[0,0x06AA48]],[1927,[6,0x6AD550]],[1928,[0,0x02B6A0]],[1929,[0,0x09B5A8]],[1930,[5,0x549DAA]],[1931,[0,0x04BA4A]],[1932,[0,0x0A5B50]],[1933,[4,0x452BA5]],[1934,[0,0x052BB0]],[1935,[0,0x0A9578]],[1936,[3,0x352952]],[1937,[0,0x0E9520]],[1938,[8,0x8AAA54]],[1939,[0,0x06AA50]],[1940,[0,0x056D40]],[1941,[5,0x4AADA5]],[1942,[0,0x02B6A0]],[1943,[0,0x09B748]],[1944,[4,0x452BA5]],[1945,[0,0x052B50]],[1946,[0,0x0A9540]],[1947,[2,0x2252BD]],[1948,[0,0x0694A0]],[1949,[7,0x668AA4]],[1950,[0,0x056AD0]],[1951,[0,0x09AD50]],[1952,[5,0x54BAB5]],[1953,[0,0x04B6A0]],[1954,[0,0x0ABA40]],[1955,[5,0x44AF46]],[1956,[0,0x0452A8]],[1957,[0,0x0AD550]],[1958,[3,0x2954D5]],[1959,[0,0x0556A0]],[1960,[0,0x0A6D40]],[1961,[4,0x452EB5]],[1962,[0,0x0552B0]],[1963,[0,0x0A5578]],[1964,[5,0x5452B7]],[1965,[0,0x0452A0]],[1966,[8,0x8496BD]],[1967,[0,0x04AEA0]],[1968,[0,0x0A4EB8]],[1969,[5,0x5526B5]],[1970,[0,0x06A690]],[1971,[0,0x0752A0]],[1972,[4,0x46B554]],[1973,[0,0x056B50]],[1974,[0,0x05AB50]],[1975,[3,0x252BB5]],[1976,[0,0x096D50]],[1977,[8,0x84AF5F]],[1978,[0,0x04AE53]],[1979,[0,0x0A4FBA]],[1980,[5,0x5526B4]],[1981,[0,0x06A690]],[1982,[0,0x06AA50]],[1983,[6,0x6AD555]],[1984,[0,0x02B6A0]],[1985,[0,0x09B5A0]],[1986,[5,0x542BB5]],[1987,[0,0x04BA50]],[1988,[0,0x0A5B50]],[1989,[4,0x452BB5]],[1990,[0,0x052B50]],[1991,[0,0x0A9578]],[1992,[3,0x352950]],[1993,[0,0x0E9520]],[1994,[8,0x8AA555]],[1995,[0,0x06AA50]],[1996,[0,0x056D48]],[1997,[5,0x4AADA5]],[1998,[0,0x02B6A0]],[1999,[0,0x09B5A8]],[2000,[4,0x452BA5]],[2001,[0,0x052B50]],[2002,[0,0x0A9540]],[2003,[2,0x2295BD]],[2004,[0,0x0694A0]],[2005,[7,0x668AA4]],[2006,[0,0x056AD0]],[2007,[0,0x09AD50]],[2008,[5,0x54BAB5]],[2009,[0,0x04B6A0]],[2010,[0,0x0ABA40]],[2011,[5,0x44AF45]],[2012,[0,0x0452A8]],[2013,[0,0x0AD550]],[2014,[4,0x2954D5]],[2015,[0,0x0556A0]],[2016,[0,0x0A6D40]],[2017,[6,0x452EB5]],[2018,[0,0x0552B0]],[2019,[0,0x0A5578]],[2020,[4,0x5452B7]],[2021,[0,0x0452A0]],[2022,[0,0x0496BD]],[2023,[2,0x04AEA0]],[2024,[0,0x0A4EB8]],[2025,[6,0x5526B5]],[2026,[0,0x06A690]],[2027,[0,0x0752A0]],[2028,[5,0x46B554]],[2029,[0,0x056B50]],[2030,[0,0x05AB50]]];
const LM=Object.fromEntries(LDB);
function lmd(y,mi){const d=LM[y];if(!d)return 30;return(d[1]>>(23-mi))&1?30:29;}
function solarToLunar(sy,sm,sd){const BASE=getJD(1900,1,31);let diff=getJD(sy,sm,sd)-BASE;let ly=1900,lm=1,ld=1,isLeap=false;for(let y=1900;y<=2050&&diff>=0;y++){const lp=LM[y]?.[0]||0;const mc=12+(lp>0?1:0);for(let i=0;i<mc&&diff>=0;i++){const md=lmd(y,i);if(diff<md){ly=y;ld=diff+1;if(lp>0&&i>=lp){if(i===lp){lm=lp;isLeap=true;}else lm=i;}else lm=i+1;return{year:ly,month:lm,day:ld,isLeap};}diff-=md;}}return{year:ly,month:lm,day:ld,isLeap};}

// ============================================================
// 사주 계산
// ============================================================
const KANJI_DATA = {
  "甲": { yang: true, temp: 15 }, "乙": { yang: false, temp: 10 },
  "丙": { yang: true, temp: 30 }, "丁": { yang: false, temp: 25 },
  "戊": { yang: true, temp: 10 }, "己": { yang: false, temp: 0 },
  "庚": { yang: true, temp: -15 }, "辛": { yang: false, temp: -10 },
  "壬": { yang: true, temp: -30 }, "癸": { yang: false, temp: -25 },
  "子": { yang: false, temp: -30 }, "丑": { yang: false, temp: -20 },
  "寅": { yang: true, temp: 15 }, "卯": { yang: false, temp: 10 },
  "辰": { yang: true, temp: 5 }, "巳": { yang: true, temp: 25 },
  "午": { yang: true, temp: 30 }, "未": { yang: false, temp: 15 },
  "申": { yang: true, temp: -15 }, "酉": { yang: false, temp: -10 },
  "戌": { yang: true, temp: -5 }, "亥": { yang: false, temp: -25 }
};

// [추가] 7:3 가중치 조후 점수 수식 (지장간 제외)
function calculateJohu(pillars) {
  const getT = (k) => KANJI_DATA[k]?.temp || 0;
  // pillars[1]=일주, pillars[2]=월주 (70% 가중치)
  const core = (getT(pillars[1].stem) + getT(pillars[1].branch) + getT(pillars[2].stem) + getT(pillars[2].branch)) * 0.7;
  // pillars[0]=시주, pillars[3]=년주 (30% 가중치)
  const sub = (getT(pillars[0].stem) + getT(pillars[0].branch) + getT(pillars[3].stem) + getT(pillars[3].branch)) * 0.3;
  return Math.round(Math.max(0, Math.min(100, 100 - Math.abs(core + sub))));
}
const HS=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const EB=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const HS_EL=["木","木","火","火","土","土","金","金","水","水"];
const EB_EL=["水","土","木","木","土","火","火","土","金","金","土","水"];
const HS_KR=["갑","을","병","정","무","기","경","신","임","계"];
const EB_KR=["자","축","인","묘","진","사","오","미","신","유","술","해"];
const ZODIAC=["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
const ZODIAC_E=["🐭","🐮","🐯","🐰","🐉","🐍","🐴","🐑","🐵","🐓","🐶","🐗"];
const SS_MAP={"甲甲":"비견","甲乙":"겁재","甲丙":"식신","甲丁":"상관","甲戊":"편재","甲己":"정재","甲庚":"편관","甲辛":"정관","甲壬":"편인","甲癸":"정인","乙乙":"비견","乙甲":"겁재","乙丁":"식신","乙丙":"상관","乙己":"편재","乙戊":"정재","乙辛":"편관","乙庚":"정관","乙癸":"편인","乙壬":"정인","丙丙":"비견","丙丁":"겁재","丙戊":"식신","丙己":"상관","丙庚":"편재","丙辛":"정재","丙壬":"편관","丙癸":"정관","丙甲":"편인","丙乙":"정인","丁丁":"비견","丁丙":"겁재","丁己":"식신","丁戊":"상관","丁辛":"편재","丁庚":"정재","丁癸":"편관","丁壬":"정관","丁乙":"편인","丁甲":"정인","戊戊":"비견","戊己":"겁재","戊庚":"식신","戊辛":"상관","戊壬":"편재","戊癸":"정재","戊甲":"편관","戊乙":"정관","戊丙":"편인","戊丁":"정인","己己":"비견","己戊":"겁재","己辛":"식신","己庚":"상관","己癸":"편재","己壬":"정재","己乙":"편관","己甲":"정관","己丁":"편인","己丙":"정인","庚庚":"비견","庚辛":"겁재","庚壬":"식신","庚癸":"상관","庚甲":"편재","庚乙":"정재","庚丙":"편관","庚丁":"정관","庚戊":"편인","庚己":"정인","辛辛":"비견","辛庚":"겁재","辛癸":"식신","辛壬":"상관","辛乙":"편재","辛甲":"정재","辛丁":"편관","辛丙":"정관","辛己":"편인","辛戊":"정인","壬壬":"비견","壬癸":"겁재","壬甲":"식신","壬乙":"상관","壬丙":"편재","壬丁":"정재","壬戊":"편관","壬己":"정관","壬庚":"편인","壬辛":"정인","癸癸":"비견","癸壬":"겁재","癸乙":"식신","癸甲":"상관","癸丁":"편재","癸丙":"정재","癸己":"편관","癸戊":"정관","癸辛":"편인","癸庚":"정인"};
const EBH={"子":{yo:["壬",7],jung:null,bon:["癸",23]},"丑":{yo:["癸",9],jung:["辛",3],bon:["己",18]},"寅":{yo:["戊",7],jung:["丙",7],bon:["甲",16]},"卯":{yo:["甲",10],jung:null,bon:["乙",20]},"辰":{yo:["乙",9],jung:["癸",3],bon:["戊",18]},"巳":{yo:["戊",7],jung:["庚",7],bon:["丙",16]},"午":{yo:["丙",10],jung:["己",9],bon:["丁",11]},"未":{yo:["丁",9],jung:["乙",3],bon:["己",18]},"申":{yo:["戊",7],jung:["壬",7],bon:["庚",16]},"酉":{yo:["庚",10],jung:null,bon:["辛",20]},"戌":{yo:["辛",9],jung:["丁",3],bon:["戊",18]},"亥":{yo:["戊",7],jung:["甲",5],bon:["壬",18]}};

function getYP(y,m,d){const T=getTerms(y);const cb=T["입춘"];let sy=y;if(cb){const jd=getJD(y,m,d);if(jd<cb.jd)sy=y-1;}const s=((sy-4)%10+10)%10;const b=((sy-4)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getDP(y,m,d){const jd=getJD(y,m,d);const s=((jd+9)%10+10)%10;const b=((jd+1)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getMP(y,m,d){const dateJD=getJD(y,m,d);const T=getTerms(y),PT=getTerms(y-1),NT=getTerms(y+1);const chunbunJD=T["입춘"].jd;const isBC=dateJD<chunbunJD;const sajuY=isBC?y-1:y;const ys=HS[((sajuY-4)%10+10)%10];const YMS={"甲":2,"己":2,"乙":4,"庚":4,"丙":6,"辛":6,"丁":8,"壬":8,"戊":0,"癸":0};const startSI=YMS[ys];const bMap=[2,3,4,5,6,7,8,9,10,11,0,1];const TN=["입춘","경칩","청명","입하","망종","소서","입추","백로","한로","입동","대설","소한"];const termJDs=TN.map((n,i)=>{let jd;if(i===11){jd=isBC?T["소한"].jd:NT["소한"].jd;}else{jd=isBC?PT[n].jd:T[n].jd;}return{mi:i+1,jd};});let mi=1;for(const t of termJDs){if(dateJD>=t.jd)mi=t.mi;}return{stem:HS[(startSI+(mi-1))%10],branch:EB[bMap[mi-1]],stemIdx:(startSI+(mi-1))%10,branchIdx:bMap[mi-1]};}
function getHB(hour){const t=hour*60;if(t<90||t>=1410)return 0;return Math.floor((t-91)/120)+1;}
function getHP(ds,hour){const bi=getHB(hour);const s=(ds*2+bi)%10;return{stem:HS[s],branch:EB[bi],stemIdx:s,branchIdx:bi};}
function calcSaju(y,m,d,hour){const lunar=solarToLunar(y,m,d);const yp=getYP(y,m,d);const mp=getMP(y,m,d);const dp=getDP(y,m,d);const hp=getHP(dp.stemIdx,hour);return{pillars:[{label:"시",...hp},{label:"일",...dp},{label:"월",...mp},{label:"년",...yp}],dayStem:dp.stem,solar:{year:y,month:m,day:d},lunar};}
function calcDaeun(by,bm,bd,gender,mp){const yp=getYP(by,bm,bd);const isYang=yp.stemIdx%2===0;const fwd=(isYang&&gender==="male")||(!isYang&&gender==="female");const T=getTerms(by);const FT=["경칩","청명","입하","망종","소서","입추","백로","한로","입동","대설","소한","입춘"];const BT=["입춘","소한","대설","입동","한로","백로","입추","소서","망종","입하","청명","경칩"];const tl=fwd?FT:BT;const bjd=getJD(by,bm,bd);let near=365;for(const tn of tl){const td=T[tn];if(!td)continue;const tjd=getJD(by,td.month,td.day);const df=fwd?tjd-bjd:bjd-tjd;if(df>0&&df<near)near=df;}const sa=Math.round(near/3);return Array.from({length:8},(_,i)=>{const off=fwd?i+1:-(i+1);const si=((mp.stemIdx+off)%10+10)%10;const bi=((mp.branchIdx+off)%12+12)%12;const age=sa+i*10;return{stem:HS[si],branch:EB[bi],stemIdx:si,branchIdx:bi,startAge:age,startYear:by+age,isForward:fwd};});}
function getSeun(year){const s=((year-4)%10+10)%10;const b=((year-4)%12+12)%12;return{year,stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getSS(ds,s){return SS_MAP[ds+s]||"-";}

// ============================================================
// 조후 점수 계산
// ============================================================
const JOHU_NEED={
  "亥":{need:["火","木"],avoid:["水","金"]},"子":{need:["火","木"],avoid:["水","金"]},"丑":{need:["火","木"],avoid:["水","金"]},
  "寅":{need:["水","火"],avoid:[]},"卯":{need:["水","火"],avoid:[]},"辰":{need:["木","水"],avoid:[]},
  "巳":{need:["水","金"],avoid:["火","木"]},"午":{need:["水","金"],avoid:["火","木"]},"未":{need:["水","金"],avoid:["火","木"]},
  "申":{need:["火","木"],avoid:["金","水"]},"酉":{need:["火","木"],avoid:["金","水"]},"戌":{need:["木","水"],avoid:[]},
};

function calcJohuScore(pillars,daeunBranch=null,seunBranch=null){
  // 가중치: pillars 순서 = [시, 일, 월, 년]
  // 일주(idx=1)+월주(idx=2) = 70%, 시주(idx=0)+년주(idx=3) = 30%
  const weights=[0.15,0.35,0.35,0.15];
  const monthBranch=pillars[2].branch;
  const {need=[],avoid=[]}=JOHU_NEED[monthBranch]||{};
  const elScore={木:0,火:0,土:0,金:0,水:0};
  pillars.forEach((p,i)=>{
    const w=weights[i];
    elScore[HS_EL[p.stemIdx]]=(elScore[HS_EL[p.stemIdx]]||0)+w*1.5;
    elScore[EB_EL[p.branchIdx]]=(elScore[EB_EL[p.branchIdx]]||0)+w;
  });
  if(daeunBranch){const de=EB_EL[EB.indexOf(daeunBranch)];if(de)elScore[de]=(elScore[de]||0)+0.12;}
  if(seunBranch){const se=EB_EL[EB.indexOf(seunBranch)];if(se)elScore[se]=(elScore[se]||0)+0.06;}
  const total=Object.values(elScore).reduce((a,b)=>a+b,0)||1;
  const needR=need.reduce((a,el)=>a+(elScore[el]||0),0)/total;
  const avoidR=avoid.reduce((a,el)=>a+(elScore[el]||0),0)/total;
  let score=50+needR*60-avoidR*40;
  const maxV=Math.max(...Object.values(elScore));
  const dom=maxV/total;
  if(dom>0.5)score-=(dom-0.5)*30;
  return Math.max(0,Math.min(100,Math.round(score)));
}
function johuLabel(s){
  if(s>=85)return{label:"최적",color:"#4ade80"};
  if(s>=70)return{label:"양호",color:"#86efac"};
  if(s>=55)return{label:"보통",color:C.gold};
  if(s>=40)return{label:"불균형",color:"#fb923c"};
  return{label:"편중",color:C.red};
}

// ============================================================
// 이미지 프롬프트 (8K 시네마틱 실사)
// ============================================================
const STEM_SUBJECT={
  "甲":"an ancient towering pine forest, massive trunks stretching to the sky",
  "乙":"a breathtaking wildflower meadow with cascading vines and curling tendrils",
  "丙":"a blazing sun dominating the horizon, golden light flooding across the land",
  "丁":"a lone campfire burning fiercely under a vast starry night, embers spiraling upward",
  "戊":"colossal jagged mountain peaks piercing through dramatic storm clouds",
  "己":"vast golden terraced farmlands stretching endlessly toward the horizon",
  "庚":"a sheer rock cliff face with razor-sharp edges gleaming like polished steel",
  "辛":"glittering crystal caves with razor-sharp stalactites refracting prismatic light",
  "壬":"a boundless surging ocean with massive waves crashing dramatically on a rocky shore",
  "癸":"a mystical waterfall cascading through thick morning mist into a still crystal pool",
};
const BRANCH_BG={
  "子":"frozen tundra under moonlight, deep snow, ice crystals glowing blue",
  "丑":"frost-covered bare earth, pale winter dawn, cold steel-grey sky",
  "寅":"misty spring forest, fresh green buds, soft warm dawn rays filtering through trees",
  "卯":"rolling hills exploding with cherry blossoms, petals drifting in golden breeze",
  "辰":"fertile muddy fields in diffused morning mist, soft luminous golden light",
  "巳":"sun-scorched landscape shimmering with heat haze, deep amber skies",
  "午":"blazing midsummer noon, intense sunlight, cracked parched earth, extreme shadows",
  "未":"warm amber late-summer dusk, tall dry grass swaying, long dramatic golden shadows",
  "申":"vivid red-orange autumn foliage on mountain slopes, crisp cool mist",
  "酉":"endless golden harvest fields under a crystal-clear high autumn sky",
  "戌":"dry leaves swirling in melancholic late-autumn dusk, bare branches silhouetted",
  "亥":"cold dark rainy night, first frost on bare branches, moonlit reflections in puddles",
};

function buildCinematicPrompt(dayStem,monthBranch,johuScore,daeunBranch=null,seunBranch=null){
  const subject=STEM_SUBJECT[dayStem]||"a dramatic natural landscape";
  const activeBranch=daeunBranch||monthBranch;
  const bg=BRANCH_BG[activeBranch]||BRANCH_BG[monthBranch];
  let atmo="";
  if(johuScore>=80)atmo="Atmosphere: perfectly harmonious — glowing life force, balanced energies, serene yet powerful.";
  else if(johuScore>=60)atmo="Atmosphere: quiet resilience and subtle tension — beauty under pressure.";
  else atmo="Atmosphere: overwhelming and extreme — harsh dominant forces, dramatic elemental conflict.";
  let fx="";
  if(daeunBranch){
    const w=["亥","子","丑"],s2=["巳","午","未"];
    if(w.includes(monthBranch)&&s2.includes(daeunBranch))fx="A dramatic thaw is occurring — blazing sunlight melts frozen landscapes, steam rising from cracking ice.";
    else if(s2.includes(monthBranch)&&w.includes(daeunBranch))fx="Sudden cold sweeps in — dark storm clouds roll over scorched earth, dramatic temperature contrast.";
  }
  return[
    "Photorealistic cinematic photograph. 8K ultra-high resolution. Shot on RED MONSTRO camera with anamorphic lens.",
    `Primary subject: ${subject}.`,
    `Scene: ${bg}.`,
    atmo,fx,
    "Lighting: dramatic cinematic lighting, volumetric god rays, physically accurate shadows, epic color grading.",
    "Quality: National Geographic meets Hollywood blockbuster. Hyper-detailed textures. Stunning depth of field.",
    "STRICT: NO text, NO watermark, NO people, NO anime, NO illustration, NO cartoon. Pure photorealistic nature photography.",
  ].filter(Boolean).join(" ");
}

async function generateImage(prompt,onProgress){
  onProgress?.(10,"요청 전송 중...");
  const r=await fetch("/api/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
  const data=await r.json();
  if(!r.ok)throw new Error(data.error||"이미지 생성 실패");
  if(data.url){onProgress?.(100,"완료!");return data.url;}
  if(data.id){
    for(let i=0;i<60;i++){
      await new Promise(res=>setTimeout(res,2000));
      const poll=await fetch(`/api/image?id=${data.id}`);
      const pd=await poll.json();
      onProgress?.(Math.min(90,30+i*2),"AI 렌더링 중...");
      if(pd.status==="succeeded"){onProgress?.(100,"완료!");return pd.url;}
      if(pd.status==="failed")throw new Error(pd.error||"생성 실패");
    }
    throw new Error("시간 초과");
  }
  throw new Error("응답 오류");
}

// ============================================================
// AI 통변
// ============================================================
async function callClaude(prompt){
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:prompt}]})});
  const d=await res.json();
  if(!res.ok)throw new Error(d.error?.message||"AI 오류");
  return d.content?.[0]?.text||"";
}
async function genReading(pillars,dayStem,daeun,name){
  const ctx=pillars.map(p=>`${p.label}주: ${p.stem}${p.branch} [${p.label==="일"?"일간":getSS(dayStem,p.stem)}]`).join(", ");
  const dCtx=daeun?`\n현재 대운: ${daeun.stem}${daeun.branch} (${daeun.startAge}~${daeun.startAge+9}세)`:"";
  const dSec=daeun?`**현재 대운 흐름** — ${daeun.stem}${daeun.branch} 대운 특징과 주의점 (3문장)`:"**인생 흐름** — 전반적 흐름 (2문장)";
  return await callClaude(`당신은 최고의 사주명리 통변사입니다. ${name||""}님의 사주를 분석해주세요.${dCtx}\n${ctx}\n\n아래 순서로 작성:\n**타고난 본성** — 일간과 월지 중심 기질 (3문장)\n**강점과 재능** — 특출한 능력과 적성 (2문장)\n**직업과 진로** — 유리한 직군 (2문장)\n**관계와 인연** — 연애/인간관계 패턴 (2문장)\n${dSec}\n\n따뜻하고 희망적 어조. **볼드** 유지.`);
}
async function genDailyFortune(pillars,dayStem,name){
  const today=new Date();
  const ctx=pillars.map(p=>`${p.label}주: ${p.stem}${p.branch}`).join(", ");
  return await callClaude(`당신은 사주명리 전문가입니다. ${name||""}님의 사주: ${ctx}\n오늘: ${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일\n\n**총운** — 오늘 기운 (2문장)\n**재물운** — 금전/직업 (1문장)\n**애정운** — 연애/관계 (1문장)\n**건강운** — 건강 주의 (1문장)\n**오늘의 조언** — 하면 좋은 것, 피할 것 (2문장)\n\n긍정적이고 실용적. **볼드** 유지.`);
}
async function genCompatibility(s1,s2,n1,n2){
  const fmt=s=>s.pillars.map(p=>`${p.label}주: ${p.stem}${p.branch}`).join(", ");
  return await callClaude(`당신은 사주 궁합 전문가입니다.\n${n1||"첫번째"}: ${fmt(s1)}\n${n2||"두번째"}: ${fmt(s2)}\n\n**종합 궁합 점수** — 100점 만점 평가와 총평\n**오행 조화** — 상생상극 (2문장)\n**성격 궁합** — 조화와 충돌 (2문장)\n**연애/결혼** — 관계 패턴 (3문장)\n**함께하면 좋은 점** — 시너지 (2문장)\n\n따뜻하고 구체적. **볼드** 유지.`);
}
function bold(t){return(t||"").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");}

// ============================================================
// 공통 UI 컴포넌트
// ============================================================
function Card({children,style}){return <div style={{background:C.card,borderRadius:20,padding:20,border:"1px solid rgba(201,169,110,0.08)",boxShadow:"0 4px 24px rgba(0,0,0,0.35)",...style}}>{children}</div>;}
function CardTitle({children}){return <p style={{textAlign:"center",fontWeight:700,color:C.goldL,fontFamily:"serif",marginBottom:14,fontSize:"0.9rem",letterSpacing:"0.08em"}}>{children}</p>;}
function Field({label,children}){return <div><label style={{fontSize:"0.68rem",fontWeight:700,color:C.muted,display:"block",marginBottom:8,letterSpacing:"0.08em"}}>{label}</label>{children}</div>;}
function SI({style,...p}){return <input {...p} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid rgba(201,169,110,0.12)",background:"rgba(255,255,255,0.03)",color:C.text,fontSize:"1rem",outline:"none",boxSizing:"border-box",...style}}/>;}
function SS2({children,...p}){return <select {...p} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid rgba(201,169,110,0.12)",background:C.card,color:C.text,fontSize:"1rem",outline:"none"}}>{children}</select>;}
function GoldBtn({children,style,...p}){return <button {...p} style={{padding:"14px 24px",borderRadius:14,background:p.disabled?`${C.gold}12`:`linear-gradient(135deg,${C.gold},${C.goldD})`,color:p.disabled?C.muted:C.bg,fontWeight:700,fontSize:"0.9rem",border:"none",cursor:p.disabled?"not-allowed":"pointer",letterSpacing:"0.05em",...style}}>{children}</button>;}
function GhBtn({children,active,style,...p}){return <button {...p} style={{padding:"8px 11px",borderRadius:12,background:active?`${C.gold}20`:"rgba(255,255,255,0.03)",color:active?C.gold:`${C.gold}55`,border:active?`1.5px solid ${C.gold}55`:"1.5px solid rgba(255,255,255,0.06)",cursor:"pointer",fontSize:"0.73rem",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,...style}}>{children}</button>;}
function GenderBtn({v,l,form,setForm}){return <button onClick={()=>setForm({...form,gender:v})} style={{flex:1,padding:12,borderRadius:12,background:form.gender===v?`${C.gold}20`:"rgba(255,255,255,0.03)",color:form.gender===v?C.gold:`${C.gold}55`,border:form.gender===v?`1.5px solid ${C.gold}55`:"1.5px solid rgba(255,255,255,0.06)",cursor:"pointer",fontWeight:700}}>{l}</button>;}

// ============================================================
// 오행 오각형
// ============================================================
function Pentagon({pillars, dayStem}) {
  const cnt = { 水: 0, 木: 0, 火: 0, 土: 0, 金: 0 };
  pillars.forEach(p => {
    cnt[HS_EL[p.stemIdx]] = (cnt[HS_EL[p.stemIdx]] || 0) + 1.5;
    cnt[EB_EL[p.branchIdx]] = (cnt[EB_EL[p.branchIdx]] || 0) + 1;
  });
  const max = Math.max(...Object.values(cnt), 1);
  const ORDER = ["水", "木", "火", "土", "金"];
  const EC = { 水: C.water, 木: C.wood, 火: C.fire, 土: C.earth, 金: C.metal };
  const cx = 130, cy = 130, R = 80;
  const pts = ORDER.map((_, i) => { const a = (i * 72 - 90) * Math.PI / 180; return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }; });
  const rp = ORDER.map((el, i) => { const a = (i * 72 - 90) * Math.PI / 180; const rr = 14 + (R - 14) * (cnt[el] / max); return { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) }; });
  const rd = rp.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ") + "Z";
  const dayEl = HS_EL[HS.indexOf(dayStem)];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="260" height="260" viewBox="0 0 260 260">
        <rect width="260" height="260" fill="#0d0905" rx="16" />
        {[0.33, 0.66, 1.0].map((lv, gi) => {
          const gp = ORDER.map((_, i) => {
            const a = (i * 72 - 90) * Math.PI / 180;
            const rr = (R - 14) * lv + 14;
            return { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) };
          });
          return (
            <path
              key={gi}
              d={gp.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ") + "Z"}
              fill="none"
              stroke="rgba(201,169,110,0.12)"
              strokeWidth={gi === 2 ? 1.5 : 0.8}
            />
          )
        })}
        {pts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(201,169,110,0.08)" strokeWidth="0.8" />)}
        <path d={rd} fill="rgba(201,169,110,0.07)" stroke={EC[dayEl] || C.gold} strokeWidth="2" />
        {ORDER.map((el, i) => {
          const ratio = cnt[el] / max;
          const r = 14 + (40 - 14) * ratio;
          const isDay = el === dayEl;
          return (
            <g key={el}>
              <circle cx={pts[i].x} cy={pts[i].y} r={r + 4} fill={EC[el]} fillOpacity="0.05" />
              <circle cx={pts[i].x} cy={pts[i].y} r={r} fill={EC[el]} fillOpacity={0.2 + ratio * 0.55} stroke={isDay ? EC[el] : "none"} strokeWidth={isDay ? 2 : 0} />
              <text x={pts[i].x} y={pts[i].y} textAnchor="middle" dominantBaseline="middle" fontSize={r > 20 ? 17 : 13} fontWeight="900" fontFamily="serif" fill={EC[el]}>{el}</text>
              <text x={pts[i].x} y={pts[i].y + r + 10} textAnchor="middle" fontSize="9" fill={EC[el]} fillOpacity="0.6">{cnt[el].toFixed(1)}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="14" fill={EC[dayEl] || C.gold} fillOpacity="0.15" stroke={EC[dayEl] || C.gold} strokeWidth="1.5" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fontFamily="serif" fill={EC[dayEl] || C.gold}>{dayStem}</text>
      </svg>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
        {ORDER.map(el => (
          <div key={el} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontFamily: "serif", color: EC[el], width: 18, textAlign: "center" }}>{el}</span>
            <div style={{ flex: 1, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.05)" }}>
              <div style={{ height: "100%", borderRadius: 99, background: EC[el], width: `${(cnt[el] / max / 1.2) * 100}%`, opacity: 0.75 }} />
            </div>
            <span style={{ fontSize: 10, color: EC[el], opacity: 0.6, width: 26 }}>{cnt[el].toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
// ============================================================
// 조후 점수 위젯
// ============================================================
function JohuGauge({score}){
  const {label,color}=johuLabel(score);
  const r=36,circ=2*Math.PI*r;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      <div style={{position:"relative",width:100,height:100}}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)}
            strokeLinecap="round" transform="rotate(-90 50 50)"
            style={{transition:"stroke-dashoffset 1.2s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:"1.5rem",fontWeight:900,color,lineHeight:1}}>{score}</span>
          <span style={{fontSize:"0.48rem",color,opacity:0.7,marginTop:1}}>/ 100</span>
        </div>
      </div>
      <span style={{fontSize:"0.72rem",fontWeight:700,color,background:`${color}18`,padding:"2px 10px",borderRadius:99,border:`1px solid ${color}33`}}>{label}</span>
    </div>
  );
}

// ============================================================
// 대운 / 세운 선택 패널
// ============================================================
function DaeunSeunPanel({daeunList,birthYear,selDaeun,setSelDaeun,selSeun,setSelSeun}){
  const curYear=new Date().getFullYear();
  const age=curYear-birthYear;
  const seunList=selDaeun?Array.from({length:10},(_,i)=>getSeun(selDaeun.startYear+i)):[];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* 대운 */}
      <div>
        <p style={{fontSize:"0.62rem",color:C.muted,marginBottom:8,letterSpacing:"0.06em"}}>▸ 대운 선택</p>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
          {daeunList.map((d,i)=>{
            const isNow=d.startAge<=age&&age<d.startAge+10;
            const isSel=selDaeun?.startYear===d.startYear;
            return(
              <button key={i} onClick={()=>{setSelDaeun(isSel?null:d);setSelSeun(null);}}
                style={{flexShrink:0,width:58,borderRadius:14,padding:"8px 3px 6px",textAlign:"center",background:isSel?`${C.gold}18`:C.cardL,border:isSel?`1.5px solid ${C.gold}55`:"1.5px solid rgba(255,255,255,0.06)",cursor:"pointer",position:"relative"}}>
                {isNow&&<div style={{position:"absolute",top:4,right:5,width:5,height:5,borderRadius:"50%",background:"#4ade80"}}/>}
                <div style={{fontSize:"1.5rem",color:EL_COL[HS_EL[d.stemIdx]],fontFamily:"serif",lineHeight:1}}>{d.stem}</div>
                <div style={{fontSize:"1.5rem",color:EL_COL[EB_EL[d.branchIdx]],fontFamily:"serif",lineHeight:1}}>{d.branch}</div>
                <div style={{fontSize:"0.5rem",color:isSel?C.gold:C.muted,marginTop:3}}>{d.startAge}세</div>
                <div style={{fontSize:"0.46rem",color:C.muted}}>{d.startYear}~</div>
              </button>
            );
          })}
        </div>
      </div>
      {/* 세운 */}
      {selDaeun&&(
        <div>
          <p style={{fontSize:"0.62rem",color:C.muted,marginBottom:8,letterSpacing:"0.06em"}}>
            ▸ 세운 선택 — {selDaeun.stem}{selDaeun.branch} ({selDaeun.startYear}~{selDaeun.startYear+9})
          </p>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
            {seunList.map((s,i)=>{
              const isThis=s.year===curYear;
              const isSel=selSeun?.year===s.year;
              return(
                <button key={i} onClick={()=>setSelSeun(isSel?null:s)}
                  style={{flexShrink:0,width:50,borderRadius:12,padding:"7px 3px 5px",textAlign:"center",background:isSel?`${C.water}18`:C.cardL,border:isSel?`1.5px solid ${C.water}55`:isThis?"1.5px solid #4ade8044":"1.5px solid rgba(255,255,255,0.06)",cursor:"pointer",position:"relative"}}>
                  {isThis&&<div style={{position:"absolute",top:3,right:4,width:4,height:4,borderRadius:"50%",background:"#4ade80"}}/>}
                  <div style={{fontSize:"1rem",color:EL_COL[HS_EL[s.stemIdx]],fontFamily:"serif",lineHeight:1}}>{s.stem}</div>
                  <div style={{fontSize:"1rem",color:EL_COL[EB_EL[s.branchIdx]],fontFamily:"serif",lineHeight:1}}>{s.branch}</div>
                  <div style={{fontSize:"0.46rem",color:isSel?C.water:C.muted,marginTop:2}}>{s.year}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 이미지 카드 (저장 가능, 다시보기 없음)
// ============================================================
function ImageCard({title,prompt,dayStem,label,key:_}){
  const [url,setUrl]=useState(null);
  const [status,setStatus]=useState("idle");
  const [prog,setProg]=useState(0);
  const [progMsg,setProgMsg]=useState("");
  const [err,setErr]=useState("");
  const elColor=EL_COL[HS_EL[HS.indexOf(dayStem)]]||C.gold;

  async function generate(){
    setStatus("loading");setErr("");setProg(0);
    try{const imgUrl=await generateImage(prompt,(p,m)=>{setProg(p);setProgMsg(m);});setUrl(imgUrl);setStatus("done");}
    catch(e){setErr(e.message);setStatus("error");}
  }

  async function saveImage(){
    if(!url)return;
    try{const res=await fetch(url);const blob=await res.blob();const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`saju-${label}-${Date.now()}.webp`;a.click();}
    catch{window.open(url,"_blank");}
  }

  return(
    <div style={{borderRadius:16,overflow:"hidden",background:"#080503",border:"1px solid rgba(201,169,110,0.1)"}}>
      <div style={{padding:"9px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:"0.7rem",fontWeight:700,color:C.goldL,letterSpacing:"0.06em"}}>{title}</span>
        {status==="done"&&url&&(
          <button onClick={saveImage} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:8,background:`${C.gold}15`,border:`1px solid ${C.gold}30`,color:C.gold,fontSize:"0.66rem",fontWeight:700,cursor:"pointer"}}>
            ⬇ 저장
          </button>
        )}
      </div>
      {status==="idle"&&(
        <div style={{height:190,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
          <div style={{fontSize:34,fontFamily:"serif",color:elColor,opacity:0.2}}>{dayStem}</div>
          <button onClick={generate} style={{padding:"9px 20px",borderRadius:12,background:`${elColor}1a`,color:elColor,border:`1px solid ${elColor}40`,cursor:"pointer",fontSize:"0.78rem",fontWeight:700}}>🎬 이미지 생성</button>
        </div>
      )}
      {status==="loading"&&(
        <div style={{height:190,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,padding:"1.5rem"}}>
          <div style={{fontSize:30,color:elColor,opacity:0.3,fontFamily:"serif"}}>{dayStem}</div>
          <div style={{width:"100%",maxWidth:190}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:"0.62rem",color:C.muted}}>{progMsg}</span><span style={{fontSize:"0.68rem",fontWeight:700,color:elColor}}>{prog}%</span></div>
            <div style={{height:4,borderRadius:99,background:"rgba(201,169,110,0.08)"}}><div style={{height:"100%",borderRadius:99,background:elColor,width:`${prog}%`,transition:"width 0.4s ease"}}/></div>
          </div>
        </div>
      )}
      {status==="done"&&url&&<img src={url} alt={title} style={{width:"100%",display:"block"}}/>}
      {status==="error"&&(
        <div style={{height:170,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:"1rem"}}>
          <p style={{color:"#ff6a50",fontSize:"0.7rem",margin:0,textAlign:"center"}}>⚠ {err}</p>
          <button onClick={generate} style={{padding:"7px 16px",borderRadius:10,background:`${C.gold}10`,color:C.gold,border:`1px solid ${C.gold}25`,cursor:"pointer",fontSize:"0.7rem"}}>↺ 다시 시도</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// AI 풀이 블록
// ============================================================
function AIBlock({text,loading,error,onGen,btnLabel}){
  if(loading)return <div style={{textAlign:"center",padding:"2rem",color:C.muted}}><div style={{fontSize:22,marginBottom:8}}>⏳</div><p style={{fontSize:"0.8rem"}}>AI가 분석 중입니다...</p></div>;
  if(!text)return <div style={{textAlign:"center"}}><GoldBtn onClick={onGen} style={{width:"100%"}}>{btnLabel||"✦ AI 분석 받기"}</GoldBtn>{error&&<p style={{color:"#ff6a50",fontSize:"0.7rem",marginTop:10}}>{error}</p>}</div>;
  return <div><div style={{fontSize:"0.85rem",lineHeight:2,color:C.text,whiteSpace:"pre-line"}} dangerouslySetInnerHTML={{__html:bold(text)}}/><button onClick={onGen} style={{marginTop:14,padding:"7px 16px",borderRadius:10,background:`${C.gold}10`,color:C.gold,border:`1px solid ${C.gold}25`,cursor:"pointer",fontSize:"0.72rem"}}>↺ 다시 분석</button></div>;
}

// ============================================================
// 사주 팔자표 (음양 폰트 가중치 적용 버전)
// ============================================================
function SajuChart({ pillars, dayStem }) {
  return (
    <div style={{ display: "flex" }}>
      {pillars.map((p, i) => {
        const isDay = i === 1;
        const sc = EL_COL[HS_EL[p.stemIdx]] || C.gold;
        const bc = EL_COL[EB_EL[p.branchIdx]] || C.gold;
        const ss = isDay ? "일간" : getSS(dayStem, p.stem);

        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0.9rem 0.1rem 0.7rem", background: isDay ? `${C.gold}06` : "transparent", borderRadius: 12, borderRight: i < 3 ? "1px solid rgba(201,169,110,0.05)" : "none" }}>
            <span style={{ fontSize: "0.57rem", color: isDay ? `${C.gold}cc` : C.muted, marginBottom: 6, letterSpacing: "0.08em" }}>{p.label}주</span>
            
            {/* 천간: KANJI_DATA의 yang 여부에 따라 두께 조절 */}
            <div style={{ 
              fontSize: "2.8rem", lineHeight: 1, color: sc, fontFamily: "serif", 
              fontWeight: KANJI_DATA[p.stem]?.yang ? 900 : 200, 
              marginBottom: 2 
            }}>
              {p.stem}
            </div>
            
            <span style={{ fontSize: "0.5rem", color: sc, fontWeight: 700, background: `${sc}18`, borderRadius: 4, padding: "1px 4px", marginBottom: 8 }}>{HS_EL[p.stemIdx]}</span>
            <div style={{ width: 14, height: 1, background: `linear-gradient(to right,transparent,${C.gold}44,transparent)`, marginBottom: 8 }} />
            
            {/* 지지: KANJI_DATA의 yang 여부에 따라 두께 조절 */}
            <div style={{ 
              fontSize: "2.8rem", lineHeight: 1, color: bc, fontFamily: "serif", 
              fontWeight: KANJI_DATA[p.branch]?.yang ? 900 : 200, 
              marginBottom: 2 
            }}>
              {p.branch}
            </div>
            
            <span style={{ fontSize: "0.5rem", color: bc, fontWeight: 700, background: `${bc}18`, borderRadius: 4, padding: "1px 4px", marginBottom: 8 }}>{EB_EL[p.branchIdx]}</span>
            <div style={{ fontSize: "0.67rem", fontWeight: 700, color: isDay ? C.gold : `${C.gold}77`, padding: "2px 5px", background: isDay ? `${C.gold}14` : "rgba(255,255,255,0.04)", borderRadius: 6 }}>{ss}</div>
          </div>
        );
      })}
    </div>
  );
} 
// ============================================================
// 메인 앱
// ============================================================
export default function App(){
  const [screen,setScreen]=useState("input");
  const [form,setForm]=useState({name:"",year:"1990",month:"1",day:"1",hour:"12",gender:"male"});
  const [form2,setForm2]=useState({name:"",year:"1992",month:"6",day:"15",hour:"12",gender:"female"});
  const [saju,setSaju]=useState(null);
  const [saju2,setSaju2]=useState(null);
  const [daeunList,setDaeunList]=useState([]);
  const [selDaeun,setSelDaeun]=useState(null);
  const [selSeun,setSelSeun]=useState(null);
  const [imgKey,setImgKey]=useState(0); // 이미지 리셋 키
  const [tab,setTab]=useState("chart");
  const [err,setErr]=useState("");
  const [reading,setReading]=useState("");
  const [dReading,setDReading]=useState("");
  const [daily,setDaily]=useState("");
  const [compat,setCompat]=useState("");
  const [loadAI,setLoadAI]=useState(false);
  const [aiErr,setAiErr]=useState("");

  function handleCalc(){
    setErr("");
    if(!form.year||!form.month||!form.day){setErr("생년월일을 입력해주세요.");return;}
    try{
      const r=calcSaju(+form.year,+form.month,+form.day,+form.hour);
      const dl=calcDaeun(+form.year,+form.month,+form.day,form.gender,r.pillars[2]);
      setSaju(r);setDaeunList(dl);
      const curAge=new Date().getFullYear()-+form.year;
      const cur=dl.find((d,i)=>d.startAge<=curAge&&(dl[i+1]?dl[i+1].startAge>curAge:true));
      setSelDaeun(cur||null);setSelSeun(null);setImgKey(0);
      setReading("");setDReading("");setDaily("");setAiErr("");
      setTab("chart");setScreen("result");
    }catch(e){setErr("계산 오류: "+e.message);}
  }

  async function doAI(fn,setState){
    setLoadAI(true);setAiErr("");
    try{setState(await fn());}catch(e){setAiErr(e.message);}finally{setLoadAI(false);}
  }

  if(screen==="input") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}input,select,button{font-family:inherit;}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{padding:"60px 24px 28px",textAlign:"center",background:`linear-gradient(180deg,#1c1005 0%,${C.bg} 100%)`}}>
        <div style={{fontSize:44,marginBottom:12,opacity:0.8}}>☯</div>
        <h1 style={{fontSize:"2rem",fontWeight:900,fontFamily:"serif",letterSpacing:"0.2em",color:C.goldL,marginBottom:8}}>사주명리</h1>
        <p style={{fontSize:"0.7rem",color:C.muted,letterSpacing:"0.15em"}}>사주팔자 · 조후분석 · 8K 시네마틱</p>
      </div>
      <div style={{padding:"0 20px 100px",display:"flex",flexDirection:"column",gap:18,maxWidth:480,margin:"0 auto",animation:"fadeIn 0.5s ease"}}>
        <Field label="이름 (선택)"><SI placeholder="이름" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
        <Field label="생년월일">
          <div style={{display:"flex",gap:8}}>
            <SI type="number" placeholder="년도" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} style={{flex:2}}/>
            <SI type="number" placeholder="월" value={form.month} onChange={e=>setForm({...form,month:e.target.value})} style={{flex:1}}/>
            <SI type="number" placeholder="일" value={form.day} onChange={e=>setForm({...form,day:e.target.value})} style={{flex:1}}/>
          </div>
        </Field>
        <Field label="출생 시각"><SS2 value={form.hour} onChange={e=>setForm({...form,hour:e.target.value})}>{Array.from({length:24},(_,i)=><option key={i} value={i}>{i}시</option>)}</SS2></Field>
        <Field label="성별"><div style={{display:"flex",gap:8}}><GenderBtn v="male" l="남성 ♂" form={form} setForm={setForm}/><GenderBtn v="female" l="여성 ♀" form={form} setForm={setForm}/></div></Field>
        {err&&<div style={{background:"rgba(180,40,20,0.1)",color:"#ff6a50",padding:"11px 16px",borderRadius:12,fontSize:"0.82rem",border:"1px solid rgba(180,40,20,0.22)"}}>{err}</div>}
        <GoldBtn onClick={handleCalc} style={{width:"100%",padding:18,fontSize:"1.05rem",letterSpacing:"0.15em",fontFamily:"serif",borderRadius:18}}>팔자 산출하기</GoldBtn>
      </div>
    </div>
  );

  if(screen==="result"&&saju){
    const{pillars,dayStem,solar,lunar}=saju;
    const zodiacIdx=pillars[3].branchIdx;
    const johuScore=calcJohuScore(pillars,selDaeun?.branch,selSeun?.branch);
    const {color:johuColor}=johuLabel(johuScore);

    const TABS=[
      {k:"chart",l:"오행",i:"⬠"},
      {k:"image",l:"이미지",i:"🎬"},
      {k:"read",l:"통변",i:"✦"},
      {k:"daily",l:"오늘운세",i:"☀"},
      {k:"daeun",l:"대운풀이",i:"⟳"},
      {k:"compat",l:"궁합",i:"♡"},
    ];

    // 이미지 프롬프트
    const originPrompt=buildCinematicPrompt(dayStem,pillars[2].branch,johuScore);
    const daeunPrompt=selDaeun?buildCinematicPrompt(dayStem,pillars[2].branch,johuScore,selDaeun.branch,selSeun?.branch):null;

    return(
      <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}input,select,button{font-family:inherit;}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}::-webkit-scrollbar{height:3px;}::-webkit-scrollbar-thumb{background:${C.gold}33;border-radius:99px;}`}</style>

        {/* 헤더 */}
        <div style={{padding:"48px 20px 18px",background:`linear-gradient(180deg,#1c1005 0%,${C.bg} 100%)`}}>
          <button onClick={()=>setScreen("input")} style={{fontSize:"0.76rem",color:C.muted,marginBottom:12,display:"block",background:"none",border:"none",cursor:"pointer"}}>← 다시 입력</button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <span style={{fontSize:24}}>{ZODIAC_E[zodiacIdx]}</span>
            <div>
              <h2 style={{fontSize:"1.2rem",fontWeight:900,fontFamily:"serif",color:C.goldL}}>{form.name?`${form.name}님의 사주`:"사주팔자"}</h2>
              <p style={{fontSize:"0.6rem",color:C.muted,marginTop:2}}>양력 {solar.year}.{solar.month}.{solar.day} · 음력 {lunar.year}.{lunar.month}.{lunar.day} · {ZODIAC[zodiacIdx]}띠</p>
            </div>
            {/* 헤더 조후점수 미니 뱃지 */}
            <div style={{marginLeft:"auto",display:"flex",flexDirection:"column",alignItems:"center"}}>
              <span style={{fontSize:"1.1rem",fontWeight:900,color:johuColor,lineHeight:1}}>{johuScore}</span>
              <span style={{fontSize:"0.44rem",color:johuColor,opacity:0.75}}>조후점수</span>
            </div>
          </div>
        </div>

        <div style={{padding:"0 16px 100px",display:"flex",flexDirection:"column",gap:12,maxWidth:520,margin:"0 auto"}}>
        
{/* 팔자표 */}
<Card style={{padding:"1.2rem 0.4rem"}}><SajuChart pillars={pillars} dayStem={dayStem}/></Card>

{/* 🔴 여기부터 4단계 코드를 추가합니다 */}
<div style={{ 
  textAlign: 'center', 
  margin: '12px 0', 
  padding: '16px', 
  backgroundColor: 'rgba(201,169,110,0.05)', 
  borderRadius: '16px', 
  border: '1px solid rgba(201,169,110,0.1)' 
}}>
  <div style={{ fontSize: '0.7rem', color: 'rgba(201,169,110,0.6)', marginBottom: '4px', letterSpacing: '0.05em' }}>
    원국 조후 균형 지수
  </div>
  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#c9a96e' }}>
    {getJohuScoreWeighted(pillars)}점
  </div>
</div>
{/* 🔴 여기까지 추가 끝 */}

{/* 탭 */}
<div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
          {/* 탭 */}
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
            {TABS.map(({k,l,i})=><GhBtn key={k} active={tab===k} onClick={()=>setTab(k)}>{i} {l}</GhBtn>)}
          </div>

          <div style={{animation:"fadeIn 0.3s ease"}}>

            {/* ── 오행 탭 ── */}
            {tab==="chart"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <Card><CardTitle>오행 세력도</CardTitle><Pentagon pillars={pillars} dayStem={dayStem}/></Card>

                {/* 조후 균형 지수 + 대운/세운 선택 */}
                <Card>
                  <CardTitle>조후 균형 지수</CardTitle>
                  <div style={{display:"flex",alignItems:"center",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
                    <JohuGauge score={johuScore}/>
                    <div style={{flex:1,minWidth:150}}>
                      <div style={{fontSize:"0.7rem",color:C.muted,lineHeight:1.9}}>
                        <span style={{color:C.goldL,fontWeight:700}}>월지</span> {pillars[2].branch}({EB_KR[pillars[2].branchIdx]}) 기준<br/>
                        <span style={{color:C.goldL,fontWeight:700}}>가중치</span> 일/월주 70% · 시/년주 30%
                        {selDaeun&&<><br/><span style={{color:C.water,fontWeight:700}}>대운 보정</span> {selDaeun.stem}{selDaeun.branch}</>}
                        {selSeun&&<><br/><span style={{color:C.water,fontWeight:700}}>세운 보정</span> {selSeun.stem}{selSeun.branch} ({selSeun.year})</>}
                      </div>
                      {JOHU_NEED[pillars[2].branch]?.need.length>0&&(
                        <p style={{fontSize:"0.64rem",color:C.muted,marginTop:8,lineHeight:1.6}}>
                          필요: {JOHU_NEED[pillars[2].branch].need.join(", ")}
                          {JOHU_NEED[pillars[2].branch].avoid.length>0?` · 과다주의: ${JOHU_NEED[pillars[2].branch].avoid.join(", ")}`:""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                    <p style={{fontSize:"0.66rem",color:C.muted,marginBottom:10,fontWeight:700,letterSpacing:"0.06em"}}>대운 · 세운으로 조후 보정</p>
                    <DaeunSeunPanel
                      daeunList={daeunList} birthYear={+form.year}
                      selDaeun={selDaeun} setSelDaeun={d=>{setSelDaeun(d);setSelSeun(null);setImgKey(k=>k+1);}}
                      selSeun={selSeun} setSelSeun={s=>{setSelSeun(s);setImgKey(k=>k+1);}}
                    />
                  </div>
                </Card>

                {/* 지장간 */}
                <Card>
                  <CardTitle>지장간</CardTitle>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                    {pillars.map((p,i)=>{
                      const fd=EBH[p.branch]||{};
                      const bc=EL_COL[EB_EL[p.branchIdx]]||C.gold;
                      return(
                        <div key={i} style={{borderRadius:12,textAlign:"center",overflow:"hidden",background:C.cardL,border:`1px solid ${bc}18`}}>
                          <div style={{background:`${bc}10`,padding:"7px 4px",borderBottom:`1px solid ${bc}15`}}>
                            <div style={{fontSize:"1.4rem",fontFamily:"serif",fontWeight:700,color:bc}}>{p.branch}</div>
                            <div style={{fontSize:"0.47rem",color:C.muted}}>{p.label}주</div>
                          </div>
                          <div style={{padding:"7px 3px",display:"flex",flexDirection:"column",gap:4}}>
                            {["yo","jung","bon"].map(k2=>{
                              if(!fd[k2])return k2==="jung"?<div key={k2} style={{fontSize:"0.43rem",color:"rgba(255,255,255,0.1)",fontStyle:"italic",padding:"3px"}}>왕지</div>:null;
                              const hi=HS.indexOf(fd[k2][0]);const col=EL_COL[HS_EL[hi]]||C.gold;
                              const lbl=k2==="yo"?"여기":k2==="jung"?"중기":"본기";
                              return <div key={k2}><div style={{fontSize:"0.92rem",fontFamily:"serif",color:col}}>{fd[k2][0]}</div><div style={{fontSize:"0.43rem",color:col,opacity:0.65}}>{lbl} {fd[k2][1]}일</div></div>;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* ── 이미지 탭 ── */}
            {tab==="image"&&(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{fontSize:"0.68rem",color:C.muted,textAlign:"center",lineHeight:1.8}}>
                  일간 <strong style={{color:C.goldL}}>{dayStem}({HS_KR[HS.indexOf(dayStem)]})</strong>{" · "}
                  월지 <strong style={{color:C.goldL}}>{pillars[2].branch}({EB_KR[pillars[2].branchIdx]})</strong>{" · "}
                  조후 <strong style={{color:johuColor}}>{johuScore}점</strong>
                  {selDaeun&&<>{" · "}대운 <strong style={{color:C.water}}>{selDaeun.stem}{selDaeun.branch}</strong></>}
                  {selSeun&&<>{" · "}{selSeun.year}년 세운 <strong style={{color:C.water}}>{selSeun.stem}{selSeun.branch}</strong></>}
                </div>
                <p style={{fontSize:"0.6rem",color:C.muted,textAlign:"center",marginTop:-6}}>
                  ※ 오행탭에서 대운/세운을 선택하면 이미지가 달라집니다
                </p>

                {/* 원국 이미지 */}
                <ImageCard
                  key={`origin-${imgKey}`}
                  title="원국 — 8K 시네마틱 실사"
                  prompt={originPrompt}
                  dayStem={dayStem}
                  label="origin"
                />

                {/* 대운 이미지 */}
                {selDaeun?(
                  <ImageCard
                    key={`daeun-${imgKey}`}
                    title={`${selDaeun.stem}${selDaeun.branch} 대운${selSeun?` · ${selSeun.year}년 세운`:""} — 8K 시네마틱`}
                    prompt={daeunPrompt}
                    dayStem={dayStem}
                    label="daeun"
                  />
                ):(
                  <Card style={{padding:24,textAlign:"center"}}>
                    <p style={{fontSize:"0.73rem",color:C.muted,lineHeight:1.8}}>오행 탭에서 대운을 선택하면<br/>대운 반영 이미지가 여기에 나타납니다</p>
                  </Card>
                )}
              </div>
            )}

            {/* ── 통변 탭 ── */}
            {tab==="read"&&(
              <Card>
                <CardTitle>AI 사주 통변</CardTitle>
                <AIBlock text={reading} loading={loadAI} error={aiErr} onGen={()=>doAI(()=>genReading(pillars,dayStem,null,form.name),setReading)} btnLabel="✦ AI 사주 통변 받기"/>
              </Card>
            )}

            {/* ── 오늘운세 탭 ── */}
            {tab==="daily"&&(
              <Card>
                <CardTitle>오늘의 운세</CardTitle>
                <p style={{fontSize:"0.67rem",color:C.muted,marginBottom:14,textAlign:"center"}}>{new Date().getFullYear()}년 {new Date().getMonth()+1}월 {new Date().getDate()}일</p>
                <AIBlock text={daily} loading={loadAI} error={aiErr} onGen={()=>doAI(()=>genDailyFortune(pillars,dayStem,form.name),setDaily)} btnLabel="☀ 오늘의 운세 보기"/>
              </Card>
            )}

            {/* ── 대운 풀이 탭 ── */}
            {tab==="daeun"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <Card>
                  <CardTitle>대운표</CardTitle>
                  <p style={{fontSize:"0.6rem",color:C.muted,textAlign:"center",marginBottom:10}}>{daeunList[0]?.startAge}세 시작 · {daeunList[0]?.isForward?"순행":"역행"}</p>
                  <DaeunSeunPanel
                    daeunList={daeunList} birthYear={+form.year}
                    selDaeun={selDaeun} setSelDaeun={d=>{setSelDaeun(d);setSelSeun(null);setDReading("");setImgKey(k=>k+1);}}
                    selSeun={selSeun} setSelSeun={s=>{setSelSeun(s);setImgKey(k=>k+1);}}
                  />
                </Card>
                {selDaeun&&(
                  <Card>
                    <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:"2rem",color:EL_COL[HS_EL[selDaeun.stemIdx]],fontFamily:"serif",lineHeight:1}}>{selDaeun.stem}</div>
                        <div style={{fontSize:"2rem",color:EL_COL[EB_EL[selDaeun.branchIdx]],fontFamily:"serif",lineHeight:1}}>{selDaeun.branch}</div>
                      </div>
                      <div>
                        <p style={{fontSize:"0.85rem",fontWeight:700,color:C.goldL}}>{selDaeun.stem}{selDaeun.branch} 대운</p>
                        <p style={{fontSize:"0.66rem",color:C.muted}}>{selDaeun.startAge}~{selDaeun.startAge+9}세 · {selDaeun.startYear}~{selDaeun.startYear+9}년</p>
                        {selSeun&&<p style={{fontSize:"0.62rem",color:C.water,marginTop:2}}>세운: {selSeun.stem}{selSeun.branch} ({selSeun.year})</p>}
                      </div>
                      <JohuGauge score={johuScore}/>
                    </div>
                    <AIBlock text={dReading} loading={loadAI} error={aiErr} onGen={()=>doAI(()=>genReading(pillars,dayStem,selDaeun,form.name),setDReading)} btnLabel={`✦ ${selDaeun.stem}${selDaeun.branch} 대운 풀이 받기`}/>
                  </Card>
                )}
              </div>
            )}

   {/* ── 궁합 탭 (중첩 레이더 + 융합 이미지 포함) ── */}
            {tab === "compat" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Card>
                  <CardTitle>궁합 분석</CardTitle>
                  <p style={{ fontSize: "0.7rem", color: C.muted, marginBottom: 14, textAlign: "center" }}>상대방 정보를 입력하세요</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                    <Field label="상대방 이름"><SI placeholder="이름" value={form2.name} onChange={e => setForm2({ ...form2, name: e.target.value })} /></Field>
                    <Field label="생년월일">
                      <div style={{ display: "flex", gap: 8 }}>
                        <SI type="number" placeholder="년도" value={form2.year} onChange={e => setForm2({ ...form2, year: e.target.value })} style={{ flex: 2 }} />
                        <SI type="number" placeholder="월" value={form2.month} onChange={e => setForm2({ ...form2, month: e.target.value })} style={{ flex: 1 }} />
                        <SI type="number" placeholder="일" value={form2.day} onChange={e => setForm2({ ...form2, day: e.target.value })} style={{ flex: 1 }} />
                      </div>
                    </Field>
                    <Field label="출생 시각"><SS2 value={form2.hour} onChange={e => setForm2({ ...form2, hour: e.target.value })}>{Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}시</option>)}</SS2></Field>
                    <Field label="성별"><div style={{ display: "flex", gap: 8 }}><GenderBtn v="male" l="남성" form={form2} setForm={setForm2} /><GenderBtn v="female" l="여성" form={form2} setForm={setForm2} /></div></Field>
                  </div>

                  {!compat ? (
                    <GoldBtn 
                      style={{ width: "100%" }}
                      onClick={() => doAI(async () => {
                        const r2 = calcSaju(+form2.year, +form2.month, +form2.day, +form2.hour);
                        setSaju2(r2);
                        return genCompatibility(saju, r2, form.name, form2.name);
                      }, setCompat)} 
                      disabled={loadAI}
                    >
                      {loadAI ? "⏳ 궁합 분석 중..." : "♡ 궁합 분석하기"}
                    </GoldBtn>
                  ) : (
                    <div>
                      <div style={{ fontSize: "0.85rem", lineHeight: 2, color: C.text, whiteSpace: "pre-line" }} dangerouslySetInnerHTML={{ __html: bold(compat) }} />
                      <button onClick={() => { setCompat(""); setSaju2(null); }} style={{ marginTop: 14, padding: "7px 16px", borderRadius: 10, background: `${C.gold}10`, color: C.gold, border: `1px solid ${C.gold}25`, cursor: "pointer", fontSize: "0.72rem" }}>↺ 다시 분석</button>
                    </div>
                  )}
                  {aiErr && <p style={{ color: "#ff6a50", fontSize: "0.7rem", marginTop: 10, textAlign: "center" }}>{aiErr}</p>}
                </Card>

                {/* 인연의 물상 융합 이미지 */}
                {saju2 && (
                  <Card>
                    <CardTitle>인연의 물상 (Fusion Art)</CardTitle>
                    <ImageCard 
                      key={`match-${imgKey}`}
                      title="두 기운의 시네마틱 융합"
                      prompt={buildCinematicPrompt(dayStem, pillars[2].branch, (getJohuScoreWeighted(pillars) + getJohuScoreWeighted(saju2.pillars))/2, "The merging energy of two souls.")}
                      dayStem={dayStem}
                      label="match"
                    />
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
}
