import { useState } from "react";

// ============================================================
// 색상 테마
// ============================================================
const C = {
  gold:"#c9a96e", goldL:"#e8d5a8", goldD:"#8b6010",
  bg:"#0b0805", card:"#16100a", cardL:"#1f1710",
  text:"#f0e6d0", muted:"rgba(201,169,110,0.45)",
  water:"#2a7fd4", wood:"#2a9a4a", fire:"#e04020", earth:"#c49010", metal:"#9a8060",
  red:"#e05040",
};
const EL_COL = {"水":C.water,"木":C.wood,"火":C.fire,"土":C.earth,"金":C.metal};

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;700;900&family=Noto+Sans+KR:wght@300;400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  input,select,button{font-family:'Noto Sans KR',sans-serif;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
  ::-webkit-scrollbar{height:3px;width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.3);border-radius:99px;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
`;

// ============================================================
// 날짜/절기 계산
// ============================================================
function getJD(y,m,d){const a=Math.floor((14-m)/12);const yy=y+4800-a;const mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
function jdToDate(jd){const L=Math.floor(jd)+68569;const N=Math.floor(4*L/146097);const L2=L-Math.floor((146097*N+3)/4);const I=Math.floor(4000*(L2+1)/1461001);const L3=L2-Math.floor(1461*I/4)+31;const J=Math.floor(80*L3/2447);const day=L3-Math.floor(2447*J/80);const L4=Math.floor(J/11);const month=J+2-12*L4;const year=100*(N-49)+I+L4;return{year,month,day};}
function sunLon(jd){const T=(jd-2451545)/36525;const L0=280.46646+36000.76983*T+0.0003032*T*T;const M=((357.52911+35999.05029*T-0.0001537*T*T)*Math.PI)/180;const CC=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);return((L0+CC)%360+360)%360;}
function findTermJD(year,lon){const base=getJD(year,1,1);const approx=base+((lon-sunLon(base)+360)%360)/360*365.25;let j1=approx-15,j2=approx+15;for(let i=0;i<60;i++){const mid=(j1+j2)/2;let d=lon-sunLon(mid);if(d>180)d-=360;if(d<-180)d+=360;if(Math.abs(d)<0.00005)break;if(d>0)j1=mid;else j2=mid;}return(j1+j2)/2;}
const tCache={};
function getTerms(year){if(tCache[year])return tCache[year];const T=[{n:"입춘",l:315},{n:"경칩",l:345},{n:"청명",l:15},{n:"입하",l:45},{n:"망종",l:75},{n:"소서",l:105},{n:"입추",l:135},{n:"백로",l:165},{n:"한로",l:195},{n:"입동",l:225},{n:"대설",l:255},{n:"소한",l:285}];const r={};for(const t of T){const jd=findTermJD(year,t.l);const d=jdToDate(jd+9/24);r[t.n]={month:d.month,day:d.day,jd};}tCache[year]=r;return r;}

// ============================================================
// 음력 변환
// ============================================================
const LDB=[[1900,[0,0x04AE53]],[1901,[0,0x0A5748]],[1902,[5,0x5526BD]],[1903,[0,0x0D2650]],[1904,[0,0x0D9544]],[1905,[4,0x46AA59]],[1906,[0,0x056AD0]],[1907,[9,0x9AD4DC]],[1908,[0,0x0B4AE8]],[1909,[0,0x0B4AE0]],[1910,[6,0x6A4DE5]],[1911,[0,0x0A4EB0]],[1912,[0,0x0D26E4]],[1913,[5,0x5529D0]],[1914,[0,0x0D2AE8]],[1915,[0,0x0D0AC4]],[1916,[4,0x46B553]],[1917,[0,0x056D50]],[1918,[0,0x05ABA5]],[1919,[3,0x25B650]],[1920,[0,0x095B50]],[1921,[8,0x84AFBF]],[1922,[0,0x04AE53]],[1923,[0,0x0A4FBA]],[1924,[5,0x5526B5]],[1925,[0,0x06A690]],[1926,[0,0x06AA48]],[1927,[6,0x6AD550]],[1928,[0,0x02B6A0]],[1929,[0,0x09B5A8]],[1930,[5,0x549DAA]],[1931,[0,0x04BA4A]],[1932,[0,0x0A5B50]],[1933,[4,0x452BA5]],[1934,[0,0x052BB0]],[1935,[0,0x0A9578]],[1936,[3,0x352952]],[1937,[0,0x0E9520]],[1938,[8,0x8AAA54]],[1939,[0,0x06AA50]],[1940,[0,0x056D40]],[1941,[5,0x4AADA5]],[1942,[0,0x02B6A0]],[1943,[0,0x09B748]],[1944,[4,0x452BA5]],[1945,[0,0x052B50]],[1946,[0,0x0A9540]],[1947,[2,0x2252BD]],[1948,[0,0x0694A0]],[1949,[7,0x668AA4]],[1950,[0,0x056AD0]],[1951,[0,0x09AD50]],[1952,[5,0x54BAB5]],[1953,[0,0x04B6A0]],[1954,[0,0x0ABA40]],[1955,[5,0x44AF46]],[1956,[0,0x0452A8]],[1957,[0,0x0AD550]],[1958,[3,0x2954D5]],[1959,[0,0x0556A0]],[1960,[0,0x0A6D40]],[1961,[4,0x452EB5]],[1962,[0,0x0552B0]],[1963,[0,0x0A5578]],[1964,[5,0x5452B7]],[1965,[0,0x0452A0]],[1966,[8,0x8496BD]],[1967,[0,0x04AEA0]],[1968,[0,0x0A4EB8]],[1969,[5,0x5526B5]],[1970,[0,0x06A690]],[1971,[0,0x0752A0]],[1972,[4,0x46B554]],[1973,[0,0x056B50]],[1974,[0,0x05AB50]],[1975,[3,0x252BB5]],[1976,[0,0x096D50]],[1977,[8,0x84AF5F]],[1978,[0,0x04AE53]],[1979,[0,0x0A4FBA]],[1980,[5,0x5526B4]],[1981,[0,0x06A690]],[1982,[0,0x06AA50]],[1983,[6,0x6AD555]],[1984,[0,0x02B6A0]],[1985,[0,0x09B5A0]],[1986,[5,0x542BB5]],[1987,[0,0x04BA50]],[1988,[0,0x0A5B50]],[1989,[4,0x452BB5]],[1990,[0,0x052B50]],[1991,[0,0x0A9578]],[1992,[3,0x352950]],[1993,[0,0x0E9520]],[1994,[8,0x8AA555]],[1995,[0,0x06AA50]],[1996,[0,0x056D48]],[1997,[5,0x4AADA5]],[1998,[0,0x02B6A0]],[1999,[0,0x09B5A8]],[2000,[4,0x452BA5]],[2001,[0,0x052B50]],[2002,[0,0x0A9540]],[2003,[2,0x2295BD]],[2004,[0,0x0694A0]],[2005,[7,0x668AA4]],[2006,[0,0x056AD0]],[2007,[0,0x09AD50]],[2008,[5,0x54BAB5]],[2009,[0,0x04B6A0]],[2010,[0,0x0ABA40]],[2011,[5,0x44AF45]],[2012,[0,0x0452A8]],[2013,[0,0x0AD550]],[2014,[4,0x2954D5]],[2015,[0,0x0556A0]],[2016,[0,0x0A6D40]],[2017,[6,0x452EB5]],[2018,[0,0x0552B0]],[2019,[0,0x0A5578]],[2020,[4,0x5452B7]],[2021,[0,0x0452A0]],[2022,[0,0x0496BD]],[2023,[2,0x04AEA0]],[2024,[0,0x0A4EB8]],[2025,[6,0x5526B5]],[2026,[0,0x06A690]],[2027,[0,0x0752A0]],[2028,[5,0x46B554]],[2029,[0,0x056B50]],[2030,[0,0x05AB50]]];
const LM=Object.fromEntries(LDB);
function lmd(y,mi){const d=LM[y];if(!d)return 30;return((d[1]>>(23-mi))&1)?30:29;}
function solarToLunar(sy,sm,sd){
  const BASE=getJD(1900,1,31);let diff=Math.floor(getJD(sy,sm,sd)-BASE);if(diff<0)return{year:1900,month:1,day:1,isLeap:false};
  for(let y=1900;y<=2030;y++){const entry=LM[y];if(!entry)break;const lp=entry[0];const mc=12+(lp>0?1:0);
    for(let i=0;i<mc;i++){const days=lmd(y,i);if(diff<days){let lm,isLeap=false;if(lp>0){if(i<lp){lm=i+1;}else if(i===lp){lm=lp;isLeap=true;}else{lm=i;}}else{lm=i+1;}return{year:y,month:lm,day:diff+1,isLeap};}diff-=days;}}
  return{year:2030,month:12,day:30,isLeap:false};
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
const KANJI_DATA={
  "甲":{yang:true},"乙":{yang:false},"丙":{yang:true},"丁":{yang:false},
  "戊":{yang:true},"己":{yang:false},"庚":{yang:true},"辛":{yang:false},
  "壬":{yang:true},"癸":{yang:false},
  "子":{yang:false},"丑":{yang:false},"寅":{yang:true},"卯":{yang:false},
  "辰":{yang:true},"巳":{yang:true},"午":{yang:true},"未":{yang:false},
  "申":{yang:true},"酉":{yang:false},"戌":{yang:true},"亥":{yang:false},
};
const SS_MAP={
  "甲甲":"비견","甲乙":"겁재","甲丙":"식신","甲丁":"상관","甲戊":"편재","甲己":"정재","甲庚":"편관","甲辛":"정관","甲壬":"편인","甲癸":"정인",
  "乙乙":"비견","乙甲":"겁재","乙丁":"식신","乙丙":"상관","乙己":"편재","乙戊":"정재","乙辛":"편관","乙庚":"정관","乙癸":"편인","乙壬":"정인",
  "丙丙":"비견","丙丁":"겁재","丙戊":"식신","丙己":"상관","丙庚":"편재","丙辛":"정재","丙壬":"편관","丙癸":"정관","丙甲":"편인","丙乙":"정인",
  "丁丁":"비견","丁丙":"겁재","丁己":"식신","丁戊":"상관","丁辛":"편재","丁庚":"정재","丁癸":"편관","丁壬":"정관","丁乙":"편인","丁甲":"정인",
  "戊戊":"비견","戊己":"겁재","戊庚":"식신","戊辛":"상관","戊壬":"편재","戊癸":"정재","戊甲":"편관","戊乙":"정관","戊丙":"편인","戊丁":"정인",
  "己己":"비견","己戊":"겁재","己辛":"식신","己庚":"상관","己癸":"편재","己壬":"정재","己乙":"편관","己甲":"정관","己丁":"편인","己丙":"정인",
  "庚庚":"비견","庚辛":"겁재","庚壬":"식신","庚癸":"상관","庚甲":"편재","庚乙":"정재","庚丙":"편관","庚丁":"정관","庚戊":"편인","庚己":"정인",
  "辛辛":"비견","辛庚":"겁재","辛癸":"식신","辛壬":"상관","辛乙":"편재","辛甲":"정재","辛丁":"편관","辛丙":"정관","辛己":"편인","辛戊":"정인",
  "壬壬":"비견","壬癸":"겁재","壬甲":"식신","壬乙":"상관","壬丙":"편재","壬丁":"정재","壬戊":"편관","壬己":"정관","壬庚":"편인","壬辛":"정인",
  "癸癸":"비견","癸壬":"겁재","癸乙":"식신","癸甲":"상관","癸丁":"편재","癸丙":"정재","癸己":"편관","癸戊":"정관","癸辛":"편인","癸庚":"정인"
};
const EBH={
  "子":{yo:["壬",7],jung:null,bon:["癸",23]},"丑":{yo:["癸",9],jung:["辛",3],bon:["己",18]},
  "寅":{yo:["戊",7],jung:["丙",7],bon:["甲",16]},"卯":{yo:["甲",10],jung:null,bon:["乙",20]},
  "辰":{yo:["乙",9],jung:["癸",3],bon:["戊",18]},"巳":{yo:["戊",7],jung:["庚",7],bon:["丙",16]},
  "午":{yo:["丙",10],jung:["己",9],bon:["丁",11]},"未":{yo:["丁",9],jung:["乙",3],bon:["己",18]},
  "申":{yo:["戊",7],jung:["壬",7],bon:["庚",16]},"酉":{yo:["庚",10],jung:null,bon:["辛",20]},
  "戌":{yo:["辛",9],jung:["丁",3],bon:["戊",18]},"亥":{yo:["戊",7],jung:["甲",5],bon:["壬",18]}
};
function getSS(ds,s){return SS_MAP[ds+s]||"-";}

// ============================================================
// 사주 계산
// ============================================================
function getYP(y,m,d){const T=getTerms(y);const cb=T["입춘"];let sy=y;if(cb){const jd=getJD(y,m,d);if(jd<cb.jd)sy=y-1;}const s=((sy-4)%10+10)%10;const b=((sy-4)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getDP(y,m,d){const jd=getJD(y,m,d);const s=((jd+9)%10+10)%10;const b=((jd+1)%12+12)%12;return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};}
function getMP(y,m,d){
  const dateJD=getJD(y,m,d);const T=getTerms(y),PT=getTerms(y-1),NT=getTerms(y+1);
  const chunbunJD=T["입춘"].jd;const isBC=dateJD<chunbunJD;const sajuY=isBC?y-1:y;
  const ys=HS[((sajuY-4)%10+10)%10];const YMS={"甲":2,"己":2,"乙":4,"庚":4,"丙":6,"辛":6,"丁":8,"壬":8,"戊":0,"癸":0};
  const startSI=YMS[ys];const bMap=[2,3,4,5,6,7,8,9,10,11,0,1];
  const TN=["입춘","경칩","청명","입하","망종","소서","입추","백로","한로","입동","대설","소한"];
  const termJDs=TN.map((n,i)=>{let jd;if(i===11){jd=isBC?T["소한"].jd:NT["소한"].jd;}else{jd=isBC?PT[n].jd:T[n].jd;}return{mi:i+1,jd};});
  let mi=1;for(const t of termJDs){if(dateJD>=t.jd)mi=t.mi;}
  return{stem:HS[(startSI+(mi-1))%10],branch:EB[bMap[mi-1]],stemIdx:(startSI+(mi-1))%10,branchIdx:bMap[mi-1]};
}
function getHB(hour,minute=0){const t=hour*60+minute;if(t<30||t>=1410)return 0;return Math.floor((t-30)/120)+1;}
function getHP(ds,hour,minute=0){const bi=getHB(hour,minute);const s=(ds*2+bi)%10;return{stem:HS[s],branch:EB[bi],stemIdx:s,branchIdx:bi};}
function calcSaju(y,m,d,hour,minute=0){
  const lunar=solarToLunar(y,m,d);const yp=getYP(y,m,d);const mp=getMP(y,m,d);const dp=getDP(y,m,d);const hp=getHP(dp.stemIdx,hour,minute);
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
// 조후 점수
// ============================================================
const JOHU_NEED={
  "亥":{need:["火","木"],avoid:["水","金"]},"子":{need:["火","木"],avoid:["水","金"]},"丑":{need:["火","木"],avoid:["水","金"]},
  "寅":{need:["水","火"],avoid:[]},"卯":{need:["水","火"],avoid:[]},"辰":{need:["木","水"],avoid:[]},
  "巳":{need:["水","金"],avoid:["火","木"]},"午":{need:["水","金"],avoid:["火","木"]},"未":{need:["水","金"],avoid:["火","木"]},
  "申":{need:["火","木"],avoid:["金","水"]},"酉":{need:["火","木"],avoid:["金","水"]},"戌":{need:["木","水"],avoid:[]},
};
function calcJohuScore(pillars,daeunBranch=null){
  const weights=[0.15,0.35,0.35,0.15];const monthBranch=pillars[2].branch;const{need=[],avoid=[]}=JOHU_NEED[monthBranch]||{};
  const elScore={木:0,火:0,土:0,金:0,水:0};
  pillars.forEach((p,i)=>{const w=weights[i];elScore[HS_EL[p.stemIdx]]=(elScore[HS_EL[p.stemIdx]]||0)+w*1.5;elScore[EB_EL[p.branchIdx]]=(elScore[EB_EL[p.branchIdx]]||0)+w;});
  if(daeunBranch){const de=EB_EL[EB.indexOf(daeunBranch)];if(de)elScore[de]=(elScore[de]||0)+0.12;}
  const total=Object.values(elScore).reduce((a,b)=>a+b,0)||1;
  const needR=need.reduce((a,el)=>a+(elScore[el]||0),0)/total;const avoidR=avoid.reduce((a,el)=>a+(elScore[el]||0),0)/total;
  let score=50+needR*60-avoidR*40;const maxV=Math.max(...Object.values(elScore));const dom=maxV/total;if(dom>0.5)score-=(dom-0.5)*30;
  return Math.max(0,Math.min(100,Math.round(score)));
}
function johuLabel(s){
  if(s>=85)return{label:"최적",color:"#4ade80"};if(s>=70)return{label:"양호",color:"#86efac"};
  if(s>=55)return{label:"보통",color:C.gold};if(s>=40)return{label:"불균형",color:"#fb923c"};return{label:"편중",color:C.red};
}
function calcElementCount(pillars){
  const cnt={水:0,木:0,火:0,土:0,金:0};
  pillars.forEach(p=>{cnt[HS_EL[p.stemIdx]]=(cnt[HS_EL[p.stemIdx]]||0)+1.5;cnt[EB_EL[p.branchIdx]]=(cnt[EB_EL[p.branchIdx]]||0)+1;});
  return cnt;
}

// ============================================================
// 물상 프롬프트 (서사적 융합)
// ============================================================
const STEM_SCENE={
  "甲":"a towering ancient pine forest, massive primordial trunks rising into mist",
  "乙":"a delicate wildflower meadow with cascading vines, tender yet persistent life",
  "丙":"a blazing sun at zenith, overwhelming radiance scorching the horizon",
  "丁":"a lone lantern flame burning against vast cold darkness, intimate fragile warmth",
  "戊":"colossal mountain peaks, immovable and eternal, wrapped in storm clouds",
  "己":"deep fertile terraced earth, patient and nurturing, heavy with possibility",
  "庚":"sheer steel-grey cliffs with razor edges, harsh unyielding stone faces",
  "辛":"glittering crystal formations refracting cold prismatic light in dark caverns",
  "壬":"a boundless surging ocean, deep relentless waves eroding ancient shores",
  "癸":"quiet rain and mist-shrouded mountain pools, hidden depths and mystery",
};
const BRANCH_SCENE={
  "子":"frozen tundra under a pale winter moon, crystalline ice silence",
  "丑":"frost-locked earth in deepest winter, heavy grey sky pressing down",
  "寅":"misty spring forest at dawn, first green buds piercing dark cold soil",
  "卯":"rolling hills of cherry blossoms, petals drifting on warm soft air",
  "辰":"rain-soaked fields in early spring, muddy earth alive with emergence",
  "巳":"parched summer earth shimmering in relentless heat haze",
  "午":"blazing midsummer noon, cracked earth, bleached sky, merciless heat",
  "未":"golden late-summer dusk, tall grass swaying in heavy amber light",
  "申":"vivid mountain autumn slopes, crisp cold air, leaves turning crimson",
  "酉":"endless harvest fields under a clear high-autumn sky, golden stillness",
  "戌":"bare branches in melancholy late-autumn dusk, dry leaves spiraling",
  "亥":"cold dark winter rain, frost forming on bare branches, moonlit puddles",
};

function buildNarrativeTransition(mb,db){
  const cold=["亥","子","丑"],spr=["寅","卯","辰"],sum=["巳","午","未"],aut=["申","酉","戌"];
  const g=b=>cold.includes(b)?"cold":spr.includes(b)?"spring":sum.includes(b)?"summer":"autumn";
  const from=g(mb),to=g(db);
  const T={
    "cold->summer":"The frozen world cracks and melts violently — blazing heat arrives like a force of nature, steam erupts from thawing ice, rivers break free with thunderous power, life explodes from the thaw in a dramatic seasonal upheaval",
    "cold->spring":"Gentle warmth softly dissolves the frozen landscape — ice edges weep, green shoots tentatively pierce through frost, the world cautiously awakens with fragile new life",
    "cold->autumn":"Cold deepens further into profound silence — frost hardens on frost, bare branches creak under ice weight, stillness becomes absolute crystalline winter",
    "summer->cold":"Sudden cold crashes over scorched earth — dark storm clouds roll in, cold rain steams on burning ground, a dramatic temperature collision, the parched land shocked into stillness",
    "summer->spring":"Brutal heat softens — clouds gather bringing gentle rain, scorched earth drinks deeply, green tendrils reclaim parched ground, life cautiously returns",
    "summer->autumn":"Peak summer heat breaks into harvest gold — the amber light deepens, shadows lengthen, abundance ripens before the coming cold",
    "spring->summer":"Spring's tender growth erupts into full summer glory — flowers burst into fruit, canopy closes, heat builds, life reaches its apex",
    "spring->cold":"Frost interrupts spring's awakening — new buds killed by returning cold, green shoots retreat, an unseasonal chill smothers fragile new life",
    "autumn->cold":"Autumn descends into deep winter — last leaves fall, frost claims bare earth, the world retreats into crystalline stillness",
    "autumn->summer":"Unexpected warmth floods autumn — lingering summer refuses to yield, bittersweet golden light, late blooms confused by the warmth",
    "cold->cold":"Cold compounds upon cold — layers of frost deepen, moonlit ice plains stretch to the horizon, absolute winter intensifies",
    "summer->summer":"Heat compounds upon heat — air shimmers with doubled intensity, everything bleached and burning, relentless sun",
    "spring->spring":"Spring multiplies into lush abundance — green overwhelms green, rain and bloom cascade endlessly, life overflowing",
    "autumn->autumn":"Autumn settles deep and golden — copper light dims to bronze, harvest complete, the world rests in quiet beauty",
    "spring->autumn":"Autumn winds interrupt spring — petals scatter before fully opening, harvest arrives too soon, bittersweet beauty in impermanence",
    "autumn->spring":"Spring warmth breaks the autumn chill — unexpected second awakening, harvest season softened by new blooms",
  };
  return T[`${from}->${to}`]||"a subtle but perceptible seasonal shift, the landscape's mood quietly transforming";
}

function buildOriginPrompt(dayStem,monthBranch){
  return [
    "Photorealistic cinematic photograph. 8K ultra-high resolution. Shot on RED MONSTRO with anamorphic lens.",
    `Primary identity and subject: ${STEM_SCENE[dayStem]||"a dramatic natural landscape"}.`,
    `Seasonal environment: ${BRANCH_SCENE[monthBranch]||"a vast atmospheric landscape"}.`,
    "Atmosphere: pure undisturbed essence — this is the original elemental nature before any external influence.",
    "Lighting: dramatic cinematic lighting with volumetric god rays and physically accurate shadows.",
    "Quality: National Geographic meets Hollywood blockbuster. Hyper-detailed. Stunning depth of field.",
    "STRICT: NO text, NO watermark, NO people, NO anime, NO illustration. Pure photorealistic nature only.",
  ].join(" ");
}

function buildDaeunFusionPrompt(dayStem,monthBranch,daeunBranch){
  const transition=buildNarrativeTransition(monthBranch,daeunBranch);
  return [
    "Photorealistic cinematic photograph. 8K ultra-high resolution. Shot on RED MONSTRO with anamorphic lens.",
    `Primary identity: ${STEM_SCENE[dayStem]||"a dramatic natural landscape"}.`,
    `NARRATIVE TRANSFORMATION IN PROGRESS: ${transition}.`,
    `The arriving new energy brings: ${BRANCH_SCENE[daeunBranch]||"a shifting atmosphere"}.`,
    "CRITICAL: Capture the dynamic MOMENT OF TRANSITION — not before, not after. Show two elemental forces actively colliding, merging, or dissolving each other RIGHT NOW.",
    "Two opposing color palettes and light temperatures must visibly bleed into each other across the frame.",
    "Lighting: chiaroscuro clash, dramatic backlighting, two competing light sources fighting for dominance.",
    "Quality: Epic scale. Breathtaking. Emotionally overwhelming. Like a painting brought to photorealistic life.",
    "STRICT: NO text, NO watermark, NO people, NO anime, NO illustration. Pure photorealistic nature only.",
  ].join(" ");
}

async function generateImage(prompt,onProgress){
  onProgress?.(10,"요청 전송 중...");
  const r=await fetch("/api/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
  const data=await r.json();if(!r.ok)throw new Error(data.error||"이미지 생성 실패");
  if(data.url){onProgress?.(100,"완료!");return data.url;}
  if(data.id){for(let i=0;i<60;i++){await new Promise(res=>setTimeout(res,2000));const poll=await fetch(`/api/image?id=${data.id}`);const pd=await poll.json();onProgress?.(Math.min(90,30+i*2),"AI 렌더링 중...");if(pd.status==="succeeded"){onProgress?.(100,"완료!");return pd.url;}if(pd.status==="failed")throw new Error(pd.error||"생성 실패");}throw new Error("시간 초과");}
  throw new Error("응답 오류");
}

// ============================================================
// 궁합 계산
// ============================================================
const HS_HAP={"甲":"己","己":"甲","乙":"庚","庚":"乙","丙":"辛","辛":"丙","丁":"壬","壬":"丁","戊":"癸","癸":"戊"};
const HS_CHUNG={"甲":"庚","庚":"甲","乙":"辛","辛":"乙","丙":"壬","壬":"丙","丁":"癸","癸":"丁"};
const WANG_JI=["子","午","卯","酉"];
const WANG_CHUNG={"子":"午","午":"子","卯":"酉","酉":"卯"};
const SAMHYUNG=[["寅","巳","申"],["丑","戌","未"],["子","卯"]];

function calcCompatScore(s1,s2){
  const d1=s1.pillars[1].stem,d2=s2.pillars[1].stem;
  const b1=s1.pillars[1].branch,b2=s2.pillars[1].branch;
  let score=50;const details=[];

  // 1) 일간합
  if(HS_HAP[d1]===d2){score+=20;details.push({type:"일간합",icon:"✦",desc:`${d1}·${d2} 천간합 — 두 기운이 하나로 합쳐지는 깊은 인연`,positive:true,pts:20});}

  // 2) 일간충
  if(HS_CHUNG[d1]===d2){score-=15;details.push({type:"일간충",icon:"✕",desc:`${d1}·${d2} 천간충 — 서로 부딪히는 강한 긴장 관계`,positive:false,pts:-15});}

  // 3) 조후 보완
  const need1=JOHU_NEED[s1.pillars[2].branch]?.need||[];const need2=JOHU_NEED[s2.pillars[2].branch]?.need||[];
  const el1=HS_EL[s1.pillars[1].stemIdx],el2=HS_EL[s2.pillars[1].stemIdx];
  let johuPts=0;
  if(need1.includes(el2))johuPts+=10;if(need2.includes(el1))johuPts+=10;
  score+=johuPts;
  details.push(johuPts>0?
    {type:"조후보완",icon:"◎",desc:`서로에게 필요한 오행(${el2}·${el1})을 주고받는 상호 보완 관계`,positive:true,pts:johuPts}:
    {type:"조후보완",icon:"△",desc:"조후 보완 관계 없음 — 오행의 상호 보완이 약함",positive:false,pts:0}
  );

  // 4) 왕지충
  if(WANG_JI.includes(b1)&&WANG_JI.includes(b2)&&WANG_CHUNG[b1]===b2){score-=12;details.push({type:"왕지충",icon:"⚡",desc:`${b1}·${b2} 왕지충 — 강한 기운끼리 정면 충돌, 격렬한 갈등 가능`,positive:false,pts:-12});}

  // 5) 삼형살
  const combined=[...s1.pillars.map(p=>p.branch),...s2.pillars.map(p=>p.branch)];
  if(SAMHYUNG.some(grp=>grp.every(b=>combined.includes(b)))){score-=10;details.push({type:"삼형살",icon:"⚠",desc:"합쳤을 때 삼형살 완성 — 함께할수록 예상치 못한 시련이 따름",positive:false,pts:-10});}

  return{score:Math.max(0,Math.min(100,score)),details};
}
function compatLabel(s){
  if(s>=85)return{label:"천생연분",color:"#f59e0b"};if(s>=70)return{label:"좋은 인연",color:"#4ade80"};
  if(s>=55)return{label:"보통 궁합",color:C.gold};if(s>=40)return{label:"주의 필요",color:"#fb923c"};return{label:"충극 관계",color:C.red};
}

// ============================================================
// 공통 UI
// ============================================================
function Card({children,style}){return <div style={{background:C.card,borderRadius:20,padding:20,border:"1px solid rgba(201,169,110,0.08)",boxShadow:"0 4px 24px rgba(0,0,0,0.35)",...style}}>{children}</div>;}
function CardTitle({children,style}){return <p style={{textAlign:"center",fontWeight:700,color:C.goldL,fontFamily:"'Noto Serif KR',serif",marginBottom:14,fontSize:"0.88rem",letterSpacing:"0.1em",...style}}>{children}</p>;}
function Field({label,children}){return <div><label style={{fontSize:"0.65rem",fontWeight:700,color:C.muted,display:"block",marginBottom:8,letterSpacing:"0.1em"}}>{label}</label>{children}</div>;}
function SI({style,...p}){return <input {...p} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid rgba(201,169,110,0.12)",background:"rgba(255,255,255,0.03)",color:C.text,fontSize:"0.95rem",outline:"none",boxSizing:"border-box",...style}}/>;}
function SS2({children,style,...p}){return <select {...p} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid rgba(201,169,110,0.12)",background:C.card,color:C.text,fontSize:"0.95rem",outline:"none",...style}}>{children}</select>;}
function GoldBtn({children,style,...p}){return <button {...p} style={{padding:"14px 24px",borderRadius:14,background:p.disabled?`${C.gold}12`:`linear-gradient(135deg,${C.gold},${C.goldD})`,color:p.disabled?C.muted:"#1a0e00",fontWeight:700,fontSize:"0.88rem",border:"none",cursor:p.disabled?"not-allowed":"pointer",letterSpacing:"0.08em",fontFamily:"'Noto Serif KR',serif",...style}}>{children}</button>;}
function GhBtn({children,active,style,...p}){return <button {...p} style={{padding:"8px 12px",borderRadius:12,background:active?`${C.gold}22`:"rgba(255,255,255,0.03)",color:active?C.gold:`${C.gold}55`,border:active?`1.5px solid ${C.gold}55`:"1.5px solid rgba(255,255,255,0.06)",cursor:"pointer",fontSize:"0.72rem",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,letterSpacing:"0.04em",...style}}>{children}</button>;}
function GenderBtn({v,l,form,setForm}){return <button onClick={()=>setForm({...form,gender:v})} style={{flex:1,padding:12,borderRadius:12,background:form.gender===v?`${C.gold}20`:"rgba(255,255,255,0.03)",color:form.gender===v?C.gold:`${C.gold}55`,border:form.gender===v?`1.5px solid ${C.gold}55`:"1.5px solid rgba(255,255,255,0.06)",cursor:"pointer",fontWeight:700,fontSize:"0.85rem"}}>{l}</button>;}

// ============================================================
// 팔자표
// ============================================================
function SajuChart({pillars,dayStem,compact=false}){
  return(
    <div style={{display:"flex"}}>
      {pillars.map((p,i)=>{
        const isDay=i===1;const sc=EL_COL[HS_EL[p.stemIdx]]||C.gold;const bc=EL_COL[EB_EL[p.branchIdx]]||C.gold;
        const stemSS=isDay?"일간":getSS(dayStem,p.stem);
        const bonStem=EBH[p.branch]?.bon?.[0];const branchSS=isDay?"":(bonStem?getSS(dayStem,bonStem):"");
        return(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:compact?"0.55rem 0.05rem":"0.9rem 0.05rem 0.7rem",background:isDay?`${C.gold}06`:"transparent",borderRadius:12,borderRight:i<3?"1px solid rgba(201,169,110,0.05)":"none"}}>
            <span style={{fontSize:"0.5rem",color:isDay?`${C.gold}cc`:C.muted,marginBottom:3,letterSpacing:"0.08em"}}>{p.label}주</span>
            <span style={{fontSize:"0.44rem",color:isDay?C.gold:`${C.gold}88`,fontWeight:700,background:isDay?`${C.gold}20`:"rgba(255,255,255,0.04)",borderRadius:4,padding:"1px 5px",marginBottom:3}}>{stemSS}</span>
            <div style={{fontSize:compact?"2rem":"2.6rem",lineHeight:1,color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_DATA[p.stem]?.yang?900:300,marginBottom:2}}>{p.stem}</div>
            <span style={{fontSize:"0.44rem",color:sc,fontWeight:700,background:`${sc}18`,borderRadius:4,padding:"1px 4px",marginBottom:5}}>{HS_EL[p.stemIdx]}</span>
            <div style={{width:12,height:1,background:`linear-gradient(to right,transparent,${C.gold}44,transparent)`,marginBottom:5}}/>
            <div style={{fontSize:compact?"2rem":"2.6rem",lineHeight:1,color:bc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_DATA[p.branch]?.yang?900:300,marginBottom:2}}>{p.branch}</div>
            <span style={{fontSize:"0.44rem",color:bc,fontWeight:700,background:`${bc}18`,borderRadius:4,padding:"1px 4px",marginBottom:3}}>{EB_EL[p.branchIdx]}</span>
            {branchSS&&<span style={{fontSize:"0.4rem",color:`${C.gold}66`,background:"rgba(255,255,255,0.03)",borderRadius:4,padding:"1px 4px"}}>{branchSS}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// 오행 오각형 (궁합 오버레이 지원)
// ============================================================
function Pentagon({pillars,dayStem,pillars2=null,name1="나",name2="상대방"}){
  const cnt1=calcElementCount(pillars);const cnt2=pillars2?calcElementCount(pillars2):null;
  const ORDER=["水","木","火","土","金"];const EC={水:C.water,木:C.wood,火:C.fire,土:C.earth,金:C.metal};
  const cx=130,cy=130,R=80;
  const pts=ORDER.map((_,i)=>{const a=(i*72-90)*Math.PI/180;return{x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)};});
  const max1=Math.max(...Object.values(cnt1),1);const max2=cnt2?Math.max(...Object.values(cnt2),1):1;
  const makePath=(cnt,maxv)=>{const rp=ORDER.map((el,i)=>{const a=(i*72-90)*Math.PI/180;const rr=14+(R-14)*(cnt[el]/maxv);return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)};});return rp.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z";};
  const rd1=makePath(cnt1,max1);const rd2=cnt2?makePath(cnt2,max2):null;
  const dayEl=HS_EL[HS.indexOf(dayStem)];
  const need1=JOHU_NEED[pillars[2].branch]?.need||[];
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      {pillars2&&<div style={{display:"flex",gap:20,marginBottom:10,fontSize:"0.6rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:14,height:3,background:`${C.gold}cc`,borderRadius:2}}/><span style={{color:C.muted}}>{name1}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:14,height:3,background:`${C.water}cc`,borderRadius:2,opacity:0.7}}/><span style={{color:C.muted}}>{name2}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:12,borderRadius:"50%",border:`2px dashed ${C.gold}88`,flexShrink:0}}/><span style={{color:C.muted}}>보완 오행</span></div>
      </div>}
      <svg width="260" height="260" viewBox="0 0 260 260">
        <rect width="260" height="260" fill="#0d0905" rx="16"/>
        {[0.33,0.66,1.0].map((lv,gi)=>{const gp=ORDER.map((_,i)=>{const a=(i*72-90)*Math.PI/180;const rr=(R-14)*lv+14;return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)};});return <path key={gi} d={gp.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z"} fill="none" stroke="rgba(201,169,110,0.09)" strokeWidth={gi===2?1.2:0.6}/>;})}
        {pts.map((p,i)=><line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(201,169,110,0.06)" strokeWidth="0.8"/>)}
        {rd2&&<path d={rd2} fill={`${C.water}0a`} stroke={C.water} strokeWidth="1.5" strokeOpacity="0.55" strokeDasharray="4 3"/>}
        <path d={rd1} fill={`${C.gold}0a`} stroke={C.gold} strokeWidth="2" strokeOpacity="0.75"/>
        {ORDER.map((el,i)=>{
          const ratio=cnt1[el]/max1;const r=14+(40-14)*ratio;const isDay=el===dayEl;
          const isComplement=cnt2&&need1.includes(el);
          return(
            <g key={el}>
              {isComplement&&<circle cx={pts[i].x} cy={pts[i].y} r={r+10} fill="none" stroke={EC[el]} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3 3"/>}
              <circle cx={pts[i].x} cy={pts[i].y} r={r+4} fill={EC[el]} fillOpacity="0.04"/>
              <circle cx={pts[i].x} cy={pts[i].y} r={r} fill={EC[el]} fillOpacity={0.15+ratio*0.5} stroke={isDay?EC[el]:"none"} strokeWidth={isDay?2:0}/>
              <text x={pts[i].x} y={pts[i].y} textAnchor="middle" dominantBaseline="middle" fontSize={r>20?16:12} fontWeight="900" fontFamily="serif" fill={EC[el]}>{el}</text>
              <text x={pts[i].x} y={pts[i].y+r+10} textAnchor="middle" fontSize="8" fill={EC[el]} fillOpacity="0.55">{cnt1[el].toFixed(1)}</text>
              {cnt2&&<text x={pts[i].x} y={pts[i].y+r+20} textAnchor="middle" fontSize="8" fill={C.water} fillOpacity="0.45">{cnt2[el].toFixed(1)}</text>}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="14" fill={EC[dayEl]||C.gold} fillOpacity="0.15" stroke={EC[dayEl]||C.gold} strokeWidth="1.5"/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fontFamily="serif" fill={EC[dayEl]||C.gold}>{dayStem}</text>
      </svg>
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:6,marginTop:10}}>
        {ORDER.map(el=>(
          <div key={el} style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:13,fontFamily:"serif",color:EC[el],width:18,textAlign:"center"}}>{el}</span>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
              <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,0.04)"}}><div style={{height:"100%",borderRadius:99,background:EC[el],width:`${(cnt1[el]/max1/1.2)*100}%`,opacity:0.8}}/></div>
              {cnt2&&<div style={{height:3,borderRadius:99,background:"rgba(255,255,255,0.04)"}}><div style={{height:"100%",borderRadius:99,background:C.water,width:`${(cnt2[el]/max2/1.2)*100}%`,opacity:0.55}}/></div>}
            </div>
            <div style={{minWidth:50,display:"flex",gap:4}}>
              <span style={{fontSize:9,color:EC[el],opacity:0.7,width:24,textAlign:"right"}}>{cnt1[el].toFixed(1)}</span>
              {cnt2&&<span style={{fontSize:9,color:C.water,opacity:0.55,width:24,textAlign:"right"}}>{cnt2[el].toFixed(1)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 조후 게이지
// ============================================================
function JohuGauge({score}){
  const{label,color}=johuLabel(score);const r=36,circ=2*Math.PI*r;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:90,height:90}}>
        <svg width="90" height="90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round" transform="rotate(-90 50 50)" style={{transition:"stroke-dashoffset 1.2s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:"1.3rem",fontWeight:900,color,lineHeight:1}}>{score}</span>
          <span style={{fontSize:"0.42rem",color,opacity:0.7}}>/ 100</span>
        </div>
      </div>
      <span style={{fontSize:"0.65rem",fontWeight:700,color,background:`${color}18`,padding:"2px 8px",borderRadius:99,border:`1px solid ${color}33`}}>{label}</span>
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
          <button key={i} onClick={()=>setSelDaeun(isSel?null:d)} style={{flexShrink:0,width:56,borderRadius:14,padding:"8px 3px 6px",textAlign:"center",background:isSel?`${C.gold}18`:C.cardL,border:isSel?`1.5px solid ${C.gold}55`:"1.5px solid rgba(255,255,255,0.06)",cursor:"pointer",position:"relative",transition:"all 0.2s ease"}}>
            {isNow&&<div style={{position:"absolute",top:4,right:5,width:5,height:5,borderRadius:"50%",background:"#4ade80"}}/>}
            <div style={{fontSize:"1.35rem",color:EL_COL[HS_EL[d.stemIdx]],fontFamily:"serif",lineHeight:1}}>{d.stem}</div>
            <div style={{fontSize:"1.35rem",color:EL_COL[EB_EL[d.branchIdx]],fontFamily:"serif",lineHeight:1}}>{d.branch}</div>
            <div style={{fontSize:"0.46rem",color:isSel?C.gold:C.muted,marginTop:3}}>{d.startAge}세</div>
            <div style={{fontSize:"0.4rem",color:C.muted}}>{d.startYear}~</div>
          </button>
        );
      })}
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
    <div style={{borderRadius:16,overflow:"hidden",background:"#080503",border:"1px solid rgba(201,169,110,0.12)"}}>
      <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
        <div>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:C.goldL,letterSpacing:"0.06em",fontFamily:"'Noto Serif KR',serif"}}>{title}</div>
          {note&&<div style={{fontSize:"0.56rem",color:C.muted,marginTop:2}}>{note}</div>}
        </div>
        {status==="done"&&url&&<button onClick={save} style={{flexShrink:0,padding:"4px 10px",borderRadius:8,background:`${C.gold}15`,border:`1px solid ${C.gold}30`,color:C.gold,fontSize:"0.6rem",fontWeight:700,cursor:"pointer"}}>⬇ 저장</button>}
      </div>
      {status==="idle"&&(
        <div style={{height:210,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
          <div style={{fontSize:42,fontFamily:"serif",color:elColor,opacity:0.12,animation:"float 3s ease-in-out infinite"}}>{dayStem}</div>
          <button onClick={generate} style={{padding:"10px 24px",borderRadius:12,background:`${elColor}18`,color:elColor,border:`1px solid ${elColor}40`,cursor:"pointer",fontSize:"0.78rem",fontWeight:700,letterSpacing:"0.06em"}}>🎬 이미지 생성</button>
        </div>
      )}
      {status==="loading"&&(
        <div style={{height:210,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,padding:"1.5rem"}}>
          <div style={{fontSize:32,color:elColor,opacity:0.22,fontFamily:"serif",animation:"shimmer 1.5s ease infinite"}}>{dayStem}</div>
          <div style={{width:"100%",maxWidth:200}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:"0.6rem",color:C.muted}}>{progMsg}</span><span style={{fontSize:"0.65rem",fontWeight:700,color:elColor}}>{prog}%</span></div>
            <div style={{height:4,borderRadius:99,background:"rgba(201,169,110,0.08)"}}><div style={{height:"100%",borderRadius:99,background:elColor,width:`${prog}%`,transition:"width 0.4s ease"}}/></div>
          </div>
        </div>
      )}
      {status==="done"&&url&&<img src={url} alt={title} style={{width:"100%",display:"block"}}/>}
      {status==="error"&&(
        <div style={{height:170,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:"1rem"}}>
          <p style={{color:"#ff6a50",fontSize:"0.68rem",margin:0,textAlign:"center"}}>⚠ {err}</p>
          <button onClick={generate} style={{padding:"7px 16px",borderRadius:10,background:`${C.gold}10`,color:C.gold,border:`1px solid ${C.gold}25`,cursor:"pointer",fontSize:"0.7rem"}}>↺ 다시 시도</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 궁합 결과
// ============================================================
function CompatResult({compat,s1,s2,name1,name2}){
  const{score,details}=compat;const{label,color}=compatLabel(score);
  const r=50,circ=2*Math.PI*r;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
          <div style={{position:"relative",width:120,height:120}}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10"/>
              <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset 1.5s ease"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:"2rem",fontWeight:900,color,lineHeight:1}}>{score}</span>
              <span style={{fontSize:"0.48rem",color,opacity:0.7}}>/ 100</span>
            </div>
          </div>
          <div>
            <div style={{fontSize:"1.15rem",fontWeight:900,color,fontFamily:"'Noto Serif KR',serif",marginBottom:6}}>{label}</div>
            <div style={{fontSize:"0.63rem",color:C.muted,lineHeight:1.8}}>
              {name1} × {name2}<br/>
              일간 <span style={{color:EL_COL[HS_EL[s1.pillars[1].stemIdx]]}}>{s1.pillars[1].stem}</span>{" "}·{" "}<span style={{color:EL_COL[HS_EL[s2.pillars[1].stemIdx]]}}>{s2.pillars[1].stem}</span>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <CardTitle>궁합 세부 분석</CardTitle>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {details.map((d,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 12px",borderRadius:12,background:d.positive?`${C.gold}07`:`${C.red}07`,border:`1px solid ${d.positive?C.gold:C.red}18`}}>
              <span style={{fontSize:"1.1rem",flexShrink:0,color:d.positive?C.gold:C.red,lineHeight:1.2,marginTop:1}}>{d.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontSize:"0.7rem",fontWeight:700,color:d.positive?C.gold:C.red,fontFamily:"'Noto Serif KR',serif"}}>{d.type}</span>
                  {d.pts!==0&&<span style={{fontSize:"0.58rem",color:d.positive?"#4ade80":C.red,background:d.positive?"rgba(74,222,128,0.1)":"rgba(224,80,64,0.1)",padding:"1px 6px",borderRadius:6,fontWeight:700}}>{d.pts>0?"+":""}{d.pts}점</span>}
                </div>
                <p style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.6}}>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardTitle>오행 세력 비교 및 보완 관계</CardTitle>
        <Pentagon pillars={s1.pillars} dayStem={s1.dayStem} pillars2={s2.pillars} name1={name1} name2={name2}/>
        <div style={{marginTop:10,padding:"8px 12px",borderRadius:10,background:`${C.gold}06`,border:`1px solid ${C.gold}10`}}>
          <p style={{fontSize:"0.62rem",color:C.muted,lineHeight:1.8,textAlign:"center"}}>
            점선 원으로 표시된 오행 = {name1}에게 필요한 오행을 {name2}가 보유
          </p>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// 메인 앱
// ============================================================
export default function App(){
  const[screen,setScreen]=useState("input");
  const[form,setForm]=useState({name:"",year:"1990",month:"1",day:"1",hour:"12",minute:"0",gender:"male"});
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
    try{
      const r2=calcSaju(+form2.year,+form2.month,+form2.day,+form2.hour,+form2.minute);
      setSaju2(r2);setCompat(calcCompatScore(saju,r2));
    }catch(e){setCompatErr("오류: "+e.message);}
  }

  // ── 입력 화면 ──
  if(screen==="input") return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
      <style>{globalStyle}</style>
      <div style={{padding:"64px 24px 28px",textAlign:"center",background:`linear-gradient(180deg,#1c1005 0%,${C.bg} 100%)`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% -10%, rgba(201,169,110,0.07) 0%, transparent 65%)",pointerEvents:"none"}}/>
        {/* 배경 대형 命 */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-55%)",fontSize:"18rem",fontFamily:"'Noto Serif KR',serif",fontWeight:900,color:"transparent",WebkitTextStroke:"1px rgba(201,169,110,0.04)",userSelect:"none",pointerEvents:"none",lineHeight:1}}>命</div>
        <div style={{position:"relative",zIndex:1,animation:"fadeIn 0.7s ease"}}>
          <div style={{fontSize:"5.5rem",fontFamily:"'Noto Serif KR',serif",fontWeight:900,color:C.gold,lineHeight:1,marginBottom:8,textShadow:"0 0 60px rgba(201,169,110,0.5)",animation:"float 4s ease-in-out infinite"}}>命</div>
          <h1 style={{fontSize:"1.5rem",fontWeight:900,fontFamily:"'Noto Serif KR',serif",letterSpacing:"0.55em",color:C.goldL,marginBottom:8,textShadow:"0 2px 20px rgba(201,169,110,0.25)"}}>사주명리</h1>
          <p style={{fontSize:"0.62rem",color:C.muted,letterSpacing:"0.18em"}}>四柱命理 · 조후분석 · 물상이미지</p>
        </div>
      </div>
      <div style={{padding:"12px 20px 100px",display:"flex",flexDirection:"column",gap:16,maxWidth:480,margin:"0 auto",animation:"fadeIn 0.6s ease 0.1s both"}}>
        <Field label="이름 (선택)"><SI placeholder="성함을 입력하세요" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
        <Field label="생년월일">
          <div style={{display:"flex",gap:8}}>
            <SI type="number" placeholder="년도" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} style={{flex:2}}/>
            <SI type="number" placeholder="월" value={form.month} onChange={e=>setForm({...form,month:e.target.value})} style={{flex:1}}/>
            <SI type="number" placeholder="일" value={form.day} onChange={e=>setForm({...form,day:e.target.value})} style={{flex:1}}/>
          </div>
        </Field>
        <Field label="출생 시각">
          <div style={{display:"flex",gap:8}}>
            <SS2 value={form.hour} onChange={e=>setForm({...form,hour:e.target.value})} style={{flex:1}}>{Array.from({length:24},(_,i)=><option key={i} value={i}>{i}시</option>)}</SS2>
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
    const johuScore=calcJohuScore(pillars,selDaeun?.branch);
    const{color:johuColor}=johuLabel(johuScore);
    const TABS=[{k:"chart",l:"오행",i:"⬠"},{k:"image",l:"물상이미지",i:"🎬"},{k:"compat",l:"궁합",i:"♡"}];

    return(
      <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
        <style>{globalStyle}</style>
        <div style={{padding:"44px 20px 16px",background:`linear-gradient(180deg,#1c1005 0%,${C.bg} 100%)`}}>
          <button onClick={()=>setScreen("input")} style={{fontSize:"0.7rem",color:C.muted,marginBottom:12,display:"block",background:"none",border:"none",cursor:"pointer",letterSpacing:"0.06em"}}>← 다시 입력</button>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{ZODIAC_E[zodiacIdx]}</span>
            <div>
              <h2 style={{fontSize:"1.1rem",fontWeight:900,fontFamily:"'Noto Serif KR',serif",color:C.goldL}}>{form.name?`${form.name}님의 사주`:"사주팔자"}</h2>
              <p style={{fontSize:"0.57rem",color:C.muted,marginTop:2}}>양력 {solar.year}.{solar.month}.{solar.day} {solar.hour}시{+solar.minute>0?` ${solar.minute}분`:""} · 음력 {lunar.year}.{lunar.isLeap?"윤":""}{lunar.month}.{lunar.day} · {ZODIAC[zodiacIdx]}띠</p>
            </div>
            <div style={{marginLeft:"auto",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:"1rem",fontWeight:900,color:johuColor,lineHeight:1}}>{johuScore}</span>
              <span style={{fontSize:"0.4rem",color:johuColor,opacity:0.75}}>조후점수</span>
            </div>
          </div>
        </div>

        <div style={{padding:"0 16px 100px",display:"flex",flexDirection:"column",gap:12,maxWidth:520,margin:"0 auto"}}>
          <Card style={{padding:"1rem 0.3rem"}}><SajuChart pillars={pillars} dayStem={dayStem}/></Card>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
            {TABS.map(({k,l,i})=><GhBtn key={k} active={tab===k} onClick={()=>setTab(k)}>{i} {l}</GhBtn>)}
          </div>
          <div style={{animation:"fadeIn 0.3s ease"}}>

            {/* ── 오행 탭 ── */}
            {tab==="chart"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <Card><CardTitle>오행 세력도</CardTitle><Pentagon pillars={pillars} dayStem={dayStem}/></Card>
                <Card>
                  <CardTitle>조후 균형 지수</CardTitle>
                  <div style={{display:"flex",alignItems:"center",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:14}}>
                    <JohuGauge score={johuScore}/>
                    <div style={{flex:1,minWidth:130}}>
                      <div style={{fontSize:"0.67rem",color:C.muted,lineHeight:2}}>
                        <span style={{color:C.goldL,fontWeight:700}}>월지</span> {pillars[2].branch}({EB_KR[pillars[2].branchIdx]}) 기준<br/>
                        <span style={{color:C.goldL,fontWeight:700}}>가중치</span> 일/월주 70% · 시/년주 30%
                        {selDaeun&&<><br/><span style={{color:C.water,fontWeight:700}}>대운 보정</span> {selDaeun.stem}{selDaeun.branch}</>}
                      </div>
                      {JOHU_NEED[pillars[2].branch]?.need.length>0&&<p style={{fontSize:"0.61rem",color:C.muted,marginTop:6,lineHeight:1.7}}>필요: {JOHU_NEED[pillars[2].branch].need.join(", ")}{JOHU_NEED[pillars[2].branch].avoid.length>0?` · 과다: ${JOHU_NEED[pillars[2].branch].avoid.join(", ")}`:""}</p>}
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardTitle>지장간</CardTitle>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                    {pillars.map((p,i)=>{
                      const fd=EBH[p.branch]||{};const items=[fd.yo,fd.jung,fd.bon].filter(Boolean);
                      return(
                        <div key={i} style={{textAlign:"center"}}>
                          <div style={{fontSize:"0.5rem",color:C.muted,marginBottom:5}}>{p.branch}({EB_KR[p.branchIdx]})</div>
                          {items.map(([stem,days],j)=>{
                            const sc=EL_COL[HS_EL[HS.indexOf(stem)]]||C.gold;
                            return(
                              <div key={j} style={{marginBottom:5,padding:"4px 2px",borderRadius:8,background:"rgba(255,255,255,0.02)"}}>
                                <span style={{fontSize:"1rem",color:sc,fontFamily:"'Noto Serif KR',serif",fontWeight:KANJI_DATA[stem]?.yang?900:300}}>{stem}</span>
                                <div style={{fontSize:"0.42rem",color:sc,opacity:0.75,fontWeight:700}}>{getSS(dayStem,stem)}</div>
                                <div style={{fontSize:"0.38rem",color:C.muted}}>{days}일</div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* ── 물상이미지 탭 ── */}
            {tab==="image"&&(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <PhysImageCard
                  key={`origin-${imgKey}`} title="나의 원국 물상"
                  prompt={buildOriginPrompt(dayStem,pillars[2].branch)} dayStem={dayStem} label="origin"
                  note={`일간 ${dayStem}(${HS_EL[pillars[1].stemIdx]}) · 월지 ${pillars[2].branch}(${EB_KR[pillars[2].branchIdx]})`}
                />
                <Card>
                  <CardTitle>대운 반영 물상</CardTitle>
                  <p style={{fontSize:"0.63rem",color:C.muted,textAlign:"center",marginBottom:12,lineHeight:1.8}}>
                    대운의 기운이 원국에 스며들 때 일어나는<br/>서사적 전환을 담은 이미지입니다
                  </p>
                  <DaeunPanel daeunList={daeunList} birthYear={+form.year} selDaeun={selDaeun} setSelDaeun={d=>{setSelDaeun(d);setImgKey(k=>k+1);}}/>
                  {selDaeun?(
                    <div style={{marginTop:14}}>
                      <div style={{padding:"8px 12px",borderRadius:10,background:`${C.gold}07`,border:`1px solid ${C.gold}15`,marginBottom:12}}>
                        <p style={{fontSize:"0.6rem",color:C.muted,lineHeight:1.8,textAlign:"center"}}>
                          <span style={{color:C.gold,fontWeight:700}}>{selDaeun.stem}{selDaeun.branch} 대운</span>{" "}({selDaeun.startAge}세~) 반영<br/>
                          <span style={{color:C.goldL,fontStyle:"italic",fontSize:"0.58rem"}}>
                            {buildNarrativeTransition(pillars[2].branch,selDaeun.branch).substring(0,55)}…
                          </span>
                        </p>
                      </div>
                      <PhysImageCard
                        key={`daeun-${imgKey}-${selDaeun.startYear}`}
                        title={`${selDaeun.stem}${selDaeun.branch} 대운 융합 물상`}
                        prompt={buildDaeunFusionPrompt(dayStem,pillars[2].branch,selDaeun.branch)}
                        dayStem={dayStem} label="daeun"
                        note={`원국 ${pillars[2].branch} + 대운 ${selDaeun.branch} 서사적 전환`}
                      />
                    </div>
                  ):(
                    <div style={{marginTop:12,padding:"14px",borderRadius:12,background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(201,169,110,0.15)",textAlign:"center"}}>
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
                    <Field label="생년월일">
                      <div style={{display:"flex",gap:8}}>
                        <SI type="number" placeholder="년도" value={form2.year} onChange={e=>setForm2({...form2,year:e.target.value})} style={{flex:2}}/>
                        <SI type="number" placeholder="월" value={form2.month} onChange={e=>setForm2({...form2,month:e.target.value})} style={{flex:1}}/>
                        <SI type="number" placeholder="일" value={form2.day} onChange={e=>setForm2({...form2,day:e.target.value})} style={{flex:1}}/>
                      </div>
                    </Field>
                    <Field label="출생 시각">
                      <div style={{display:"flex",gap:8}}>
                        <SS2 value={form2.hour} onChange={e=>setForm2({...form2,hour:e.target.value})} style={{flex:1}}>{Array.from({length:24},(_,i)=><option key={i} value={i}>{i}시</option>)}</SS2>
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

          <button onClick={()=>{setSaju(null);setSaju2(null);setCompat(null);setScreen("input");}} style={{marginTop:10,padding:14,borderRadius:12,background:"rgba(255,255,255,0.04)",color:C.muted,border:"none",cursor:"pointer",fontSize:"0.78rem",letterSpacing:"0.06em"}}>↺ 처음으로</button>
        </div>
      </div>
    );
  }
  return null;
}
