import { useState } from "react";

// ============================================================
// 1. 날짜 계산
// ============================================================
function getJD(y,m,d){const a=Math.floor((14-m)/12);const yy=y+4800-a;const mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
function jdToDate(jd){const L=Math.floor(jd)+68569;const N=Math.floor(4*L/146097);const L2=L-Math.floor((146097*N+3)/4);const I=Math.floor(4000*(L2+1)/1461001);const L3=L2-Math.floor(1461*I/4)+31;const J=Math.floor(80*L3/2447);const day=L3-Math.floor(2447*J/80);const L4=Math.floor(J/11);const month=J+2-12*L4;const year=100*(N-49)+I+L4;return{year,month,day};}
function sunLon(jd){const T=(jd-2451545)/36525;const L0=280.46646+36000.76983*T+0.0003032*T*T;const M=(357.52911+35999.05029*T-0.0001537*T*T)*Math.PI/180;const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);return((L0+C)%360+360)%360;}
function findTermJD(year,lon){const base=getJD(year,1,1);const approx=base+((lon-sunLon(base)+360)%360)/360*365.25;let jd1=approx-15,jd2=approx+15;for(let i=0;i<60;i++){const mid=(jd1+jd2)/2;let d=lon-sunLon(mid);if(d>180)d-=360;if(d<-180)d+=360;if(Math.abs(d)<0.00005)break;if(d>0)jd1=mid;else jd2=mid;}return(jd1+jd2)/2;}
const termCache={};
function getTerms(year){
  if(termCache[year])return termCache[year];
  const T=[{n:"입춘",l:315},{n:"경칩",l:345},{n:"청명",l:15},{n:"입하",l:45},{n:"망종",l:75},{n:"소서",l:105},{n:"입추",l:135},{n:"백로",l:165},{n:"한로",l:195},{n:"입동",l:225},{n:"대설",l:255},{n:"소한",l:285}];
  const r={};
  for(const t of T){const jd=findTermJD(year,t.l);const d=jdToDate(jd+9/24);r[t.n]={month:d.month,day:d.day,jd};}
  termCache[year]=r;return r;
}

// ============================================================
// 2. 음력
// ============================================================
const LDB=[[1900,[0,0x04AE53]],[1901,[0,0x0A5748]],[1902,[5,0x5526BD]],[1903,[0,0x0D2650]],[1904,[0,0x0D9544]],[1905,[4,0x46AA59]],[1906,[0,0x056AD0]],[1907,[9,0x9AD4DC]],[1908,[0,0x0B4AE8]],[1909,[0,0x0B4AE0]],[1910,[6,0x6A4DE5]],[1911,[0,0x0A4EB0]],[1912,[0,0x0D26E4]],[1913,[5,0x5529D0]],[1914,[0,0x0D2AE8]],[1915,[0,0x0D0AC4]],[1916,[4,0x46B553]],[1917,[0,0x056D50]],[1918,[0,0x05ABA5]],[1919,[3,0x25B650]],[1920,[0,0x095B50]],[1921,[8,0x84AFBF]],[1922,[0,0x04AE53]],[1923,[0,0x0A4FBA]],[1924,[5,0x5526B5]],[1925,[0,0x06A690]],[1926,[0,0x06AA48]],[1927,[6,0x6AD550]],[1928,[0,0x02B6A0]],[1929,[0,0x09B5A8]],[1930,[5,0x549DAA]],[1931,[0,0x04BA4A]],[1932,[0,0x0A5B50]],[1933,[4,0x452BA5]],[1934,[0,0x052BB0]],[1935,[0,0x0A9578]],[1936,[3,0x352952]],[1937,[0,0x0E9520]],[1938,[8,0x8AAA54]],[1939,[0,0x06AA50]],[1940,[0,0x056D40]],[1941,[5,0x4AADA5]],[1942,[0,0x02B6A0]],[1943,[0,0x09B748]],[1944,[4,0x452BA5]],[1945,[0,0x052B50]],[1946,[0,0x0A9540]],[1947,[2,0x2252BD]],[1948,[0,0x0694A0]],[1949,[7,0x668AA4]],[1950,[0,0x056AD0]],[1951,[0,0x09AD50]],[1952,[5,0x54BAB5]],[1953,[0,0x04B6A0]],[1954,[0,0x0ABA40]],[1955,[5,0x44AF46]],[1956,[0,0x0452A8]],[1957,[0,0x0AD550]],[1958,[3,0x2954D5]],[1959,[0,0x0556A0]],[1960,[0,0x0A6D40]],[1961,[4,0x452EB5]],[1962,[0,0x0552B0]],[1963,[0,0x0A5578]],[1964,[5,0x5452B7]],[1965,[0,0x0452A0]],[1966,[8,0x8496BD]],[1967,[0,0x04AEA0]],[1968,[0,0x0A4EB8]],[1969,[5,0x5526B5]],[1970,[0,0x06A690]],[1971,[0,0x0752A0]],[1972,[4,0x46B554]],[1973,[0,0x056B50]],[1974,[0,0x05AB50]],[1975,[3,0x252BB5]],[1976,[0,0x096D50]],[1977,[8,0x84AF5F]],[1978,[0,0x04AE53]],[1979,[0,0x0A4FBA]],[1980,[5,0x5526B4]],[1981,[0,0x06A690]],[1982,[0,0x06AA50]],[1983,[6,0x6AD555]],[1984,[0,0x02B6A0]],[1985,[0,0x09B5A0]],[1986,[5,0x542BB5]],[1987,[0,0x04BA50]],[1988,[0,0x0A5B50]],[1989,[4,0x452BB5]],[1990,[0,0x052B50]],[1991,[0,0x0A9578]],[1992,[3,0x352950]],[1993,[0,0x0E9520]],[1994,[8,0x8AA555]],[1995,[0,0x06AA50]],[1996,[0,0x056D48]],[1997,[5,0x4AADA5]],[1998,[0,0x02B6A0]],[1999,[0,0x09B5A8]],[2000,[4,0x452BA5]],[2001,[0,0x052B50]],[2002,[0,0x0A9540]],[2003,[2,0x2295BD]],[2004,[0,0x0694A0]],[2005,[7,0x668AA4]],[2006,[0,0x056AD0]],[2007,[0,0x09AD50]],[2008,[5,0x54BAB5]],[2009,[0,0x04B6A0]],[2010,[0,0x0ABA40]],[2011,[5,0x44AF45]],[2012,[0,0x0452A8]],[2013,[0,0x0AD550]],[2014,[4,0x2954D5]],[2015,[0,0x0556A0]],[2016,[0,0x0A6D40]],[2017,[6,0x452EB5]],[2018,[0,0x0552B0]],[2019,[0,0x0A5578]],[2020,[4,0x5452B7]],[2021,[0,0x0452A0]],[2022,[0,0x0496BD]],[2023,[2,0x04AEA0]],[2024,[0,0x0A4EB8]],[2025,[6,0x5526B5]],[2026,[0,0x06A690]],[2027,[0,0x0752A0]],[2028,[5,0x46B554]],[2029,[0,0x056B50]],[2030,[0,0x05AB50]]];
const LM=Object.fromEntries(LDB);
function lmd(y,mi){const d=LM[y];if(!d)return 30;return(d[1]>>(23-mi))&1?30:29;}
function solarToLunar(sy,sm,sd){
  const BASE=getJD(1900,1,31);
  let diff=getJD(sy,sm,sd)-BASE;
  let ly=1900,lm=1,ld=1,isLeap=false;
  for(let y=1900;y<=2050&&diff>=0;y++){
    const lp=LM[y]?.[0]||0;
    let mc=12+(lp>0?1:0);
    for(let i=0;i<mc&&diff>=0;i++){
      const md=lmd(y,i);
      if(diff<md){
        ly=y;ld=diff+1;
        if(lp>0&&i>=lp){if(i===lp){lm=lp;isLeap=true;}else lm=i;}
        else lm=i+1;
        return{year:ly,month:lm,day:ld,isLeap};
      }
      diff-=md;
    }
  }
  return{year:ly,month:lm,day:ld,isLeap};
}

// ============================================================
// 3. 사주 계산
// ============================================================
const HS=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const EB=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const HS_EL=["木","木","火","火","土","土","金","金","水","水"];
const EB_EL=["水","土","木","木","土","火","火","土","金","金","土","水"];
const ECB={"木":"#1a8a35","火":"#e03010","土":"#c49010","金":"#8a7550","水":"#0a5fa0"};
const SIPSIN_MAP={"甲甲":"비견","甲乙":"겁재","甲丙":"식신","甲丁":"상관","甲戊":"편재","甲己":"정재","甲庚":"편관","甲辛":"정관","甲壬":"편인","甲癸":"정인","乙乙":"비견","乙甲":"겁재","乙丁":"식신","乙丙":"상관","乙己":"편재","乙戊":"정재","乙辛":"편관","乙庚":"정관","乙癸":"편인","乙壬":"정인","丙丙":"비견","丙丁":"겁재","丙戊":"식신","丙己":"상관","丙庚":"편재","丙辛":"정재","丙壬":"편관","丙癸":"정관","丙甲":"편인","丙乙":"정인","丁丁":"비견","丁丙":"겁재","丁己":"식신","丁戊":"상관","丁辛":"편재","丁庚":"정재","丁癸":"편관","丁壬":"정관","丁乙":"편인","丁甲":"정인","戊戊":"비견","戊己":"겁재","戊庚":"식신","戊辛":"상관","戊壬":"편재","戊癸":"정재","戊甲":"편관","戊乙":"정관","戊丙":"편인","戊丁":"정인","己己":"비견","己戊":"겁재","己辛":"식신","己庚":"상관","己癸":"편재","己壬":"정재","己乙":"편관","己甲":"정관","己丁":"편인","己丙":"정인","庚庚":"비견","庚辛":"겁재","庚壬":"식신","庚癸":"상관","庚甲":"편재","庚乙":"정재","庚丙":"편관","庚丁":"정관","庚戊":"편인","庚己":"정인","辛辛":"비견","辛庚":"겁재","辛癸":"식신","辛壬":"상관","辛乙":"편재","辛甲":"정재","辛丁":"편관","辛丙":"정관","辛己":"편인","辛戊":"정인","壬壬":"비견","壬癸":"겁재","壬甲":"식신","壬乙":"상관","壬丙":"편재","壬丁":"정재","壬戊":"편관","壬己":"정관","壬庚":"편인","壬辛":"정인","癸癸":"비견","癸壬":"겁재","癸乙":"식신","癸甲":"상관","癸丁":"편재","癸丙":"정재","癸己":"편관","癸戊":"정관","癸辛":"편인","癸庚":"정인"};
const EBH_FULL={"子":{yo:["壬",7],jung:null,bon:["癸",23]},"丑":{yo:["癸",9],jung:["辛",3],bon:["己",18]},"寅":{yo:["戊",7],jung:["丙",7],bon:["甲",16]},"卯":{yo:["甲",10],jung:null,bon:["乙",20]},"辰":{yo:["乙",9],jung:["癸",3],bon:["戊",18]},"巳":{yo:["戊",7],jung:["庚",7],bon:["丙",16]},"午":{yo:["丙",10],jung:["己",9],bon:["丁",11]},"未":{yo:["丁",9],jung:["乙",3],bon:["己",18]},"申":{yo:["戊",7],jung:["壬",7],bon:["庚",16]},"酉":{yo:["庚",10],jung:null,bon:["辛",20]},"戌":{yo:["辛",9],jung:["丁",3],bon:["戊",18]},"亥":{yo:["戊",7],jung:["甲",5],bon:["壬",18]}};

function getYP(y,m,d){
  const T=getTerms(y);const cb=T["입춘"];
  let sy=y;
  if(cb){const jd=getJD(y,m,d);if(jd<cb.jd)sy=y-1;}
  const s=((sy-4)%10+10)%10;const b=((sy-4)%12+12)%12;
  return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};
}
function getDP(y,m,d){
  const jd=getJD(y,m,d);
  const s=((jd+9)%10+10)%10;const b=((jd+1)%12+12)%12;
  return{stem:HS[s],branch:EB[b],stemIdx:s,branchIdx:b};
}
function getMP(y,m,d){
  const dateJD=getJD(y,m,d);
  const T=getTerms(y),PT=getTerms(y-1),NT=getTerms(y+1);
  const chunbunJD=T["입춘"].jd;
  const isBeforeChunbun=dateJD<chunbunJD;
  const sajuY=isBeforeChunbun?y-1:y;
  const yearStem=HS[((sajuY-4)%10+10)%10];
  const YMS={"甲":2,"己":2,"乙":4,"庚":4,"丙":6,"辛":6,"丁":8,"壬":8,"戊":0,"癸":0};
  const startStemIdx=YMS[yearStem];
  const branchMap=[2,3,4,5,6,7,8,9,10,11,0,1];
  const TN=["입춘","경칩","청명","입하","망종","소서","입추","백로","한로","입동","대설","소한"];
  const termJDs=TN.map((n,i)=>{
    let jd;
    if(i===11){jd=isBeforeChunbun?T["소한"].jd:NT["소한"].jd;}
    else{jd=isBeforeChunbun?PT[n].jd:T[n].jd;}
    return{mi:i+1,jd};
  });
  let mi=1;
  for(const t of termJDs){if(dateJD>=t.jd)mi=t.mi;}
  const stemIdx=(startStemIdx+(mi-1))%10;
  const branchIdx=branchMap[mi-1];
  return{stem:HS[stemIdx],branch:EB[branchIdx],stemIdx,branchIdx};
}
function getHourBranch(hour){
  const t=hour*60;
  if(t<90||t>=1410)return 0;
  return Math.floor((t-91)/120)+1;
}
function getHP(ds,hour){
  const bi=getHourBranch(hour);
  const base=ds*2+bi;
  const s=base%10;
  return{stem:HS[s],branch:EB[bi],stemIdx:s,branchIdx:bi};
}
function calcSaju(y,m,d,hour){
  const lunar=solarToLunar(y,m,d);
  const yp=getYP(y,m,d);const mp=getMP(y,m,d);const dp=getDP(y,m,d);const hp=getHP(dp.stemIdx,hour);
  return{pillars:[{label:"시",...hp},{label:"일",...dp},{label:"월",...mp},{label:"년",...yp}],dayStem:dp.stem,solar:{year:y,month:m,day:d},lunar};
}
function calcDaeun(by,bm,bd,gender,mp){
  const yp=getYP(by,bm,bd);
  const isYang=yp.stemIdx%2===0;const isMale=gender==="male";
  const fwd=(isYang&&isMale)||(!isYang&&!isMale);
  const T=getTerms(by);
  const FT=["경칩","청명","입하","망종","소서","입추","백로","한로","입동","대설","소한","입춘"];
  const BT=["입춘","소한","대설","입동","한로","백로","입추","소서","망종","입하","청명","경칩"];
  const tl=fwd?FT:BT;const bjd=getJD(by,bm,bd);
  let near=365;
  for(const tn of tl){
    const td=T[tn];if(!td)continue;
    const tjd=getJD(by,td.month,td.day);
    const df=fwd?tjd-bjd:bjd-tjd;
    if(df>0&&df<near)near=df;
  }
  const sa=Math.round(near/3);
  return Array.from({length:8},(_,i)=>{
    const off=fwd?i+1:-(i+1);
    const si=((mp.stemIdx+off)%10+10)%10;
    const bi=((mp.branchIdx+off)%12+12)%12;
    const age=sa+i*10;
    return{stem:HS[si],branch:EB[bi],stemIdx:si,branchIdx:bi,startAge:age,startYear:by+age,isForward:fwd};
  });
}
function getSS(ds,s){return SIPSIN_MAP[ds+s]||"-";}

// ============================================================
// 4. 이미지 프롬프트 + 생성
// ============================================================
const SUBJECT={
  "甲":"a towering ancient pine tree standing alone on a rocky cliff",
  "乙":"delicate wildflowers and vines swaying gently in the breeze",
  "丙":"a blazing bonfire leaping powerfully into the night sky",
  "丁":"a single candle flame glowing softly in deep darkness",
  "戊":"a vast mountain range with rugged rocky peaks",
  "己":"fertile farmland with soft rolling hills and rich soil",
  "庚":"a gleaming iron sword standing upright on a stone",
  "辛":"precious gemstones and crystals sparkling on dark rock",
  "壬":"a great river surging powerfully through a deep valley",
  "癸":"gentle rain falling softly on a still mountain pond"
};
const SEASON_MOD={
  "子":"covered in deep snow, frozen moonlit landscape, midnight",
  "丑":"frost on the ground, pale ice blue sky, before dawn",
  "寅":"bare branches with first tiny buds, lingering morning mist, dawn",
  "卯":"fresh spring green, soft petals beginning to bloom, morning",
  "辰":"late spring rain, lush green mist rolling through hills",
  "巳":"early summer heat haze, bright intense sunlight, late morning",
  "午":"scorching midsummer noon, dry cracked earth, blazing sun overhead",
  "未":"golden dry grass, late summer haze, heat lingering at dusk",
  "申":"first fallen red and gold leaves, crisp cool air, late afternoon",
  "酉":"deep autumn foliage, clear cold air, harvest moon rising at dusk",
  "戌":"late autumn bare branches, grey fog, fading sunset embers",
  "亥":"first winter chill, dark wet trees, cold rain, night"
};

function buildPrompt(hs,eb){
  const subject=SUBJECT[hs]||"natural landscape";
  const season=SEASON_MOD[eb]||"seasonal landscape";
  return `Traditional East Asian ink wash painting on aged rice paper. ${subject}. ${season}. Masterful brushwork with bleeding ink edges, subtle wash gradients, vast empty space as composition. Monochromatic with faint earth tones. No text, no people, no borders. Museum quality, highly detailed.`;
}

// ============================================================
// 4. 이미지 프롬프트 + 생성 (Replicate 유료 API 원상복구 + 에러 친절화)
// ============================================================

// (buildPrompt 함수는 그대로 두시면 됩니다)

async function generateImage(hs,eb,onProgress){
  const prompt=buildPrompt(hs,eb);
  onProgress(10,"프롬프트 전송 중...");
  
  try {
    const startRes=await fetch("/api/image",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({prompt})
    });
    
    // 에러 발생 시 Vercel 서버가 보내준 진짜 이유를 파싱해서 보여줌
    if(!startRes.ok) {
      const errData = await startRes.json().catch(()=>({}));
      throw new Error(errData.error || "서버 오류: " + startRes.status);
    }
    
    const prediction=await startRes.json();
    if(prediction.error) throw new Error(prediction.error);
    
    // wait 모드로 바로 결과가 나왔을 경우
    if(prediction.url){
      onProgress(100,"완료!");
      return prediction.url;
    }
    
    // 폴링(기다림)이 필요한 경우
    const id=prediction.id;
    let p=20;
    for(let i=0;i<40;i++){
      await new Promise(r=>setTimeout(r,1500));
      p=Math.min(90,p+Math.random()*8+3);
      onProgress(Math.floor(p),"고품질 수묵화 그리는 중...");
      
      const pollRes=await fetch("/api/image?id="+id);
      const poll=await pollRes.json();
      
      if(poll.status==="succeeded"){
        onProgress(100,"완료!");
        return poll.url;
      }
      if(poll.status==="failed") {
        throw new Error(poll.error || "생성 실패");
      }
    }
    throw new Error("시간 초과: 그림 생성이 너무 오래 걸립니다.");
    
  } catch (err) {
    console.error("Replicate API 에러:", err);
    throw new Error(err.message || "그림 생성에 실패했습니다.");
  }
}


// ============================================================
// 5. AI 통변
// ============================================================
async function callClaude(prompt){
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})
  });
  const d=await res.json();
  return d.content?.[0]?.text||"";
}

async function genReading(pillars,dayStem,daeun){
  const ctx=pillars.map(p=>{
    const ss=p.label==="일"?"일간":getSS(dayStem,p.stem);
    return p.label+"주: "+p.stem+p.branch+" ["+ss+"]";
  }).join(", ");
  const dCtx=daeun?"\n현재 대운: "+daeun.stem+daeun.branch+" ("+daeun.startAge+"~"+(daeun.startAge+9)+"세)":"";
  const dSection=daeun
    ? "**현재 대운 흐름** — "+daeun.stem+daeun.branch+" 대운 특징과 주의점 (3문장)"
    : "**인생 흐름** — 전반적 흐름 (2문장)";
  const prompt="당신은 최고의 사주명리 통변사입니다."+dCtx+"\n"+ctx+"\n\n아래 순서로 작성:\n**타고난 본성** — 일간과 월지 중심 기질 (3문장)\n**강점과 재능** — 특출한 능력과 적성 (2문장)\n**직업과 진로** — 유리한 직군 (2문장)\n**관계와 인연** — 연애/인간관계 패턴 (2문장)\n"+dSection+"\n\n따뜻하고 희망적 어조. **볼드** 유지.";
  return await callClaude(prompt);
}

function bold(t){return(t||"").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");}

// ============================================================
// 6. 오행 오각형
// ============================================================
function OhaengPentagon({pillars,dayStem}){
  const cnt={"水":0,"木":0,"火":0,"土":0,"金":0};
  pillars.forEach(p=>{
    const se=HS_EL[p.stemIdx];if(cnt[se]!==undefined)cnt[se]+=1.5;
    const be=EB_EL[p.branchIdx];if(cnt[be]!==undefined)cnt[be]+=1;
  });
  const max=Math.max(...Object.values(cnt),1);
  const ORDER=["水","木","火","土","金"];
  const COLORS={"水":"#2060c0","木":"#1a8a35","火":"#e03010","土":"#c49010","金":"#8a6a30"};
  const cx=130,cy=130,R=85;
  const pts=ORDER.map((_,i)=>{const ang=(i*72-90)*Math.PI/180;return{x:cx+R*Math.cos(ang),y:cy+R*Math.sin(ang)};});
  const radarPts=ORDER.map((el,i)=>{
    const ratio=cnt[el]/max;const ang=(i*72-90)*Math.PI/180;const rr=14+(R-14)*ratio;
    return{x:cx+rr*Math.cos(ang),y:cy+rr*Math.sin(ang)};
  });
  const radarD=radarPts.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z";
  const dayEl=HS_EL[HS.indexOf(dayStem)];
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <svg width="260" height="260" viewBox="0 0 260 260">
        <rect width="260" height="260" fill="#faf6ef" rx="16"/>
        {[0.33,0.66,1.0].map((lv,gi)=>{
          const gpts=ORDER.map((_,i)=>{const ang=(i*72-90)*Math.PI/180;const rr=(R-14)*lv+14;return{x:cx+rr*Math.cos(ang),y:cy+rr*Math.sin(ang)};});
          return <path key={gi} d={gpts.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z"} fill="none" stroke="#e0d8cc" strokeWidth={gi===2?1.5:0.8}/>;
        })}
        {pts.map((p,i)=><line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e0d8cc" strokeWidth="0.8"/>)}
        <path d={radarD} fill="rgba(201,169,110,0.12)" stroke={COLORS[dayEl]||"#c9a96e"} strokeWidth="2"/>
        {ORDER.map((el,i)=>{
          const ratio=cnt[el]/max;const r=14+(42-14)*ratio;const isDay=el===dayEl;
          return(
            <g key={el}>
              <circle cx={pts[i].x} cy={pts[i].y} r={r+4} fill={COLORS[el]} fillOpacity="0.08"/>
              <circle cx={pts[i].x} cy={pts[i].y} r={r} fill={COLORS[el]} fillOpacity={0.25+ratio*0.5} stroke={isDay?COLORS[el]:"none"} strokeWidth={isDay?2:0}/>
              <text x={pts[i].x} y={pts[i].y} textAnchor="middle" dominantBaseline="middle" fontSize={r>22?18:14} fontWeight="900" fontFamily="serif" fill={COLORS[el]} fillOpacity="0.9">{el}</text>
              <text x={pts[i].x} y={pts[i].y+r+10} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={COLORS[el]} fillOpacity="0.8">{cnt[el].toFixed(1)}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="14" fill={COLORS[dayEl]||"#c9a96e"} fillOpacity="0.15" stroke={COLORS[dayEl]||"#c9a96e"} strokeWidth="1.5"/>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fontFamily="serif" fill={COLORS[dayEl]||"#c9a96e"}>{dayStem}</text>
      </svg>
    </div>
  );
}

// ============================================================
// 7. 이미지 컴포넌트
// ============================================================
function SajuImage({hs,eb}){
  const [imgUrl,setImgUrl]=useState(null);
  const [status,setStatus]=useState("idle");
  const [progress,setProgress]=useState(0);
  const [progressMsg,setProgressMsg]=useState("");
  const [error,setError]=useState("");
  const elColor=ECB[HS_EL[HS.indexOf(hs)]]||"#c9a96e";

  async function handleGenerate(){
    setStatus("loading");setError("");setImgUrl(null);setProgress(0);
    try{
      const url=await generateImage(hs,eb,(p,msg)=>{setProgress(p);setProgressMsg(msg);});
      setImgUrl(url);setStatus("done");
    }catch(e){
      setError(e.message);setStatus("error");
    }
  }

  return(
    <div style={{borderRadius:"1rem",overflow:"hidden",background:"#1a1008",minHeight:"180px",position:"relative"}}>
      {status==="idle"&&(
        <div style={{minHeight:"180px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <button onClick={handleGenerate} style={{padding:"12px 28px",borderRadius:"12px",background:"rgba(201,169,110,0.15)",color:"#c9a96e",border:"1px solid rgba(201,169,110,0.4)",cursor:"pointer",fontSize:"0.85rem",fontWeight:700}}>
            🖼 수묵화 생성
          </button>
        </div>
      )}
      {status==="loading"&&(
        <div style={{minHeight:"180px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"14px",padding:"1.5rem"}}>
          <div style={{fontSize:"2.5rem",color:elColor,opacity:0.5,fontFamily:"serif"}}>{hs}{eb}</div>
          <div style={{width:"100%",maxWidth:"240px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
              <span style={{fontSize:"0.7rem",color:"#7a5a3a"}}>{progressMsg}</span>
              <span style={{fontSize:"0.75rem",fontWeight:700,color:elColor}}>{progress}%</span>
            </div>
            <div style={{height:"6px",borderRadius:"99px",background:"rgba(201,169,110,0.15)"}}>
              <div style={{height:"100%",borderRadius:"99px",background:"linear-gradient(to right,"+elColor+",#c9a96e)",width:progress+"%",transition:"width 0.4s ease"}}/>
            </div>
          </div>
        </div>
      )}
      {status==="done"&&imgUrl&&(
        <div style={{position:"relative"}}>
          <img src={imgUrl} alt="수묵화" style={{width:"100%",display:"block"}}/>
          <button onClick={handleGenerate} style={{position:"absolute",bottom:"10px",right:"10px",width:"34px",height:"34px",borderRadius:"50%",background:"rgba(0,0,0,0.55)",border:"1px solid rgba(201,169,110,0.5)",color:"#c9a96e",fontSize:"16px",cursor:"pointer"}}>↺</button>
        </div>
      )}
      {status==="error"&&(
        <div style={{minHeight:"180px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"10px"}}>
          <p style={{color:"#b06040",fontSize:"0.75rem",margin:0}}>⚠ {error}</p>
          <button onClick={handleGenerate} style={{padding:"8px 20px",borderRadius:"10px",background:"rgba(201,169,110,0.15)",color:"#c9a96e",border:"1px solid rgba(201,169,110,0.3)",cursor:"pointer",fontSize:"0.75rem"}}>↺ 다시 시도</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 8. 메인 App
// ============================================================
const C="#c9a96e",BG="#f5f0e8",DK="#130d07",DK2="#231508";

export default function App(){
  const [screen,setScreen]=useState("input");
  const [form,setForm]=useState({name:"",year:"1984",month:"1",day:"30",hour:"15",gender:"male"});
  const [saju,setSaju]=useState(null);
  const [daeunList,setDaeunList]=useState([]);
  const [selDaeun,setSelDaeun]=useState(null);
  const [tab,setTab]=useState("chart");
  const [err,setErr]=useState("");
  const [reading,setReading]=useState("");
  const [dReading,setDReading]=useState("");
  const [loadingAI,setLoadingAI]=useState(false);
  const [aiErr,setAiErr]=useState("");

  function handleCalc(){
    setErr("");
    if(!form.year||!form.month||!form.day){setErr("생년월일을 입력해주세요.");return;}
    try{
      const r=calcSaju(+form.year,+form.month,+form.day,+form.hour);
      const dl=calcDaeun(+form.year,+form.month,+form.day,form.gender,r.pillars[2]);
      setSaju(r);setDaeunList(dl);setSelDaeun(null);
      setReading("");setDReading("");setAiErr("");
      setTab("chart");setScreen("result");
    }catch(e){setErr("계산 오류: "+e.message);}
  }

  async function handleAI(){
    if(!saju)return;
    setLoadingAI(true);setAiErr("");
    try{const r=await genReading(saju.pillars,saju.dayStem,null);setReading(r);}
    catch(e){setAiErr("AI 오류: "+e.message);}
    finally{setLoadingAI(false);}
  }

  async function handleDaeunAI(){
    if(!saju||!selDaeun)return;
    setLoadingAI(true);setAiErr("");
    try{const r=await genReading(saju.pillars,saju.dayStem,selDaeun);setDReading(r);}
    catch(e){setAiErr("AI 오류: "+e.message);}
    finally{setLoadingAI(false);}
  }

  if(screen==="input") return(
    <div style={{minHeight:"100vh",background:BG}}>
      <div style={{padding:"3.5rem 1.25rem 1.5rem",background:"linear-gradient(160deg,"+DK+","+DK2+")"}}>
        <h2 style={{fontSize:"1.3rem",fontWeight:700,letterSpacing:"0.15em",color:"#f5e6c8",fontFamily:"serif",margin:0}}>사주팔자</h2>
        <p style={{fontSize:"0.7rem",marginTop:"0.35rem",color:"rgba(201,169,110,0.55)"}}>생년월일시를 입력하세요</p>
      </div>
      <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"1.25rem",paddingBottom:"5rem"}}>
        <div>
          <label style={{fontSize:"0.72rem",fontWeight:700,color:"#6b5040",display:"block",marginBottom:"0.5rem"}}>이름</label>
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{width:"100%",padding:"12px 16px",borderRadius:"12px",border:"1.5px solid #e0d5c5",background:"#fff",color:"#2a1a0a",fontSize:"1rem",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{fontSize:"0.72rem",fontWeight:700,color:"#6b5040",display:"block",marginBottom:"0.5rem"}}>생년월일</label>
          <div style={{display:"flex",gap:"8px"}}>
            <input type="number" placeholder="년도" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} style={{flex:1,padding:"12px 8px",borderRadius:"12px",border:"1.5px solid #e0d5c5",background:"#fff",color:"#2a1a0a",fontSize:"1rem",outline:"none",textAlign:"center"}}/>
            <input type="number" placeholder="월" value={form.month} onChange={e=>setForm({...form,month:e.target.value})} style={{width:"60px",padding:"12px 4px",borderRadius:"12px",border:"1.5px solid #e0d5c5",background:"#fff",color:"#2a1a0a",fontSize:"1rem",outline:"none",textAlign:"center"}}/>
            <input type="number" placeholder="일" value={form.day} onChange={e=>setForm({...form,day:e.target.value})} style={{width:"60px",padding:"12px 4px",borderRadius:"12px",border:"1.5px solid #e0d5c5",background:"#fff",color:"#2a1a0a",fontSize:"1rem",outline:"none",textAlign:"center"}}/>
          </div>
        </div>
        <div>
          <label style={{fontSize:"0.72rem",fontWeight:700,color:"#6b5040",display:"block",marginBottom:"0.5rem"}}>출생 시각</label>
          <select value={form.hour} onChange={e=>setForm({...form,hour:e.target.value})} style={{width:"100%",padding:"12px 16px",borderRadius:"12px",border:"1.5px solid #e0d5c5",background:"#fff",color:"#2a1a0a",fontSize:"1rem",outline:"none"}}>
            {Array.from({length:24},(_,i)=><option key={i} value={i}>{i}시</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:"0.72rem",fontWeight:700,color:"#6b5040",display:"block",marginBottom:"0.5rem"}}>성별</label>
          <div style={{display:"flex",gap:"8px"}}>
            {[{v:"male",l:"남"},{v:"female",l:"여"}].map(({v,l})=>(
              <button key={v} onClick={()=>setForm({...form,gender:v})} style={{flex:1,padding:"12px",borderRadius:"12px",background:form.gender===v?DK2:"#fff",color:form.gender===v?C:"#8b6a4a",border:form.gender===v?"1.5px solid "+C:"1.5px solid #e0d5c5",cursor:"pointer",fontWeight:600}}>{l}</button>
            ))}
          </div>
        </div>
        {err&&<p style={{background:"#fff0ee",color:"#c03020",padding:"10px 16px",borderRadius:"12px",fontSize:"0.85rem",margin:0}}>{err}</p>}
        <button onClick={handleCalc} style={{width:"100%",padding:"16px",borderRadius:"16px",background:"linear-gradient(135deg,"+C+",#8b6010)",color:DK,fontWeight:700,fontSize:"1rem",letterSpacing:"0.15em",border:"none",cursor:"pointer"}}>팔자 산출하기</button>
      </div>
    </div>
  );

  if(screen==="result"&&saju){
    const{pillars,dayStem,solar,lunar}=saju;
    const TABS=[{k:"chart",l:"오행"},{k:"image",l:"그림"},{k:"read",l:"풀이"},{k:"daeun",l:"대운"}];
    return(
      <div style={{minHeight:"100vh",background:BG}}>
        <div style={{padding:"3.5rem 1.25rem 1.5rem",background:"linear-gradient(160deg,"+DK+","+DK2+")"}}>
          <button onClick={()=>setScreen("input")} style={{fontSize:"0.8rem",color:C,opacity:0.7,marginBottom:"1rem",display:"block",background:"none",border:"none",cursor:"pointer"}}>← 다시 입력</button>
          <h2 style={{fontSize:"1.3rem",fontWeight:700,letterSpacing:"0.15em",color:"#f0e0c0",fontFamily:"serif",margin:0}}>{form.name?form.name+"님의 ":""}사주팔자</h2>
          <p style={{fontSize:"0.7rem",marginTop:"0.35rem",color:"rgba(201,169,110,0.55)"}}>양력 {solar.year}.{solar.month}.{solar.day} · 음력 {lunar.year}.{lunar.month}.{lunar.day}</p>
        </div>
        <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"1rem",paddingBottom:"5rem"}}>

          {/* 팔자표 */}
          <div style={{borderRadius:"1.5rem",overflow:"hidden",background:"linear-gradient(145deg,"+DK+","+DK2+")",boxShadow:"0 8px 40px rgba(0,0,0,0.4)"}}>
            <div style={{display:"flex",padding:"1.5rem 1rem"}}>
              {pillars.map((p,i)=>{
                const isDay=i===1;
                const stemColor=ECB[HS_EL[p.stemIdx]];
                const branchColor=ECB[EB_EL[p.branchIdx]];
                const ss=isDay?"일간":getSS(dayStem,p.stem);
                return(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"0.9rem 0.15rem 0.7rem",background:isDay?"rgba(201,169,110,0.1)":"transparent",borderRadius:"1rem",borderRight:i<3?"1px solid rgba(201,169,110,0.08)":"none"}}>
                    <span style={{fontSize:"0.65rem",color:isDay?"rgba(201,169,110,0.85)":"rgba(201,169,110,0.4)",marginBottom:"0.4rem"}}>{p.label}주</span>
                    <div style={{fontSize:"3.2rem",lineHeight:1,color:stemColor,fontFamily:"serif",fontWeight:p.stemIdx%2===0?900:300,marginBottom:"0.15rem"}}>{p.stem}</div>
                    <span style={{fontSize:"0.6rem",color:stemColor,fontWeight:700,background:stemColor+"22",borderRadius:"4px",padding:"1px 4px",marginBottom:"0.5rem"}}>{HS_EL[p.stemIdx]}</span>
                    <div style={{width:"20px",height:"1px",background:"linear-gradient(to right,transparent,"+C+"55,transparent)",marginBottom:"0.5rem"}}/>
                    <div style={{fontSize:"3.2rem",lineHeight:1,color:branchColor,fontFamily:"serif",fontWeight:p.branchIdx%2===0?900:300,marginBottom:"0.15rem"}}>{p.branch}</div>
                    <span style={{fontSize:"0.6rem",color:branchColor,fontWeight:700,background:branchColor+"22",borderRadius:"4px",padding:"1px 4px",marginBottom:"0.6rem"}}>{EB_EL[p.branchIdx]}</span>
                    <div style={{fontSize:"0.85rem",fontWeight:800,color:isDay?C:"rgba(201,169,110,0.75)",padding:"0.2rem 0.5rem",background:isDay?"rgba(201,169,110,0.18)":"rgba(255,255,255,0.05)",borderRadius:"6px"}}>{ss}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 탭 */}
          <div style={{display:"flex",gap:"6px"}}>
            {TABS.map(({k,l})=>(
              <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"10px",borderRadius:"12px",background:tab===k?DK2:"#fff",color:tab===k?C:"#9a7a5a",border:tab===k?"1.5px solid "+C:"1.5px solid #e0d5c5",cursor:"pointer",fontSize:"0.8rem",fontWeight:600}}>{l}</button>
            ))}
          </div>

          {/* 오행 탭 */}
          {tab==="chart"&&(
            <div style={{background:"#fff",borderRadius:"1.25rem",padding:"1.25rem",boxShadow:"0 2px 16px rgba(0,0,0,0.05)"}}>
              <p style={{textAlign:"center",fontWeight:700,color:"#3a2010",fontFamily:"serif",marginBottom:"1rem",fontSize:"0.9rem"}}>오행 세력도</p>
              <OhaengPentagon pillars={pillars} dayStem={dayStem}/>
              <p style={{textAlign:"center",fontWeight:700,color:"#3a2010",fontFamily:"serif",margin:"1.25rem 0 0.75rem",fontSize:"0.9rem"}}>지장간</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px"}}>
                {pillars.map((p,i)=>{
                  const fd=EBH_FULL[p.branch]||{};
                  const brCol=ECB[EB_EL[p.branchIdx]]||"#9a7a5a";
                  return(
                    <div key={i} style={{borderRadius:"12px",textAlign:"center",overflow:"hidden",background:"#faf6ef",border:"1px solid "+brCol+"33"}}>
                      <div style={{background:brCol+"18",padding:"0.4rem 0.2rem",borderBottom:"1px solid "+brCol+"22"}}>
                        <div style={{fontSize:"1.4rem",fontFamily:"serif",fontWeight:700,color:brCol}}>{p.branch}</div>
                        <div style={{fontSize:"0.55rem",color:"#9a7a5a"}}>{p.label}주</div>
                      </div>
                      <div style={{padding:"0.4rem 0.2rem"}}>
                        {fd.yo&&(()=>{const hi=HS.indexOf(fd.yo[0]);const col=ECB[HS_EL[hi]]||"#9a7a5a";return(<div style={{marginBottom:"0.2rem"}}><div style={{fontSize:"1rem",fontFamily:"serif",color:col}}>{fd.yo[0]}</div><div style={{fontSize:"0.5rem",color:col,opacity:0.75}}>여기 {fd.yo[1]}일</div></div>);})()}
                        <div style={{minHeight:"2rem",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:"0.2rem"}}>
                          {fd.jung
                            ?(()=>{const hi=HS.indexOf(fd.jung[0]);const col=ECB[HS_EL[hi]]||"#9a7a5a";return(<><div style={{fontSize:"1rem",fontFamily:"serif",color:col}}>{fd.jung[0]}</div><div style={{fontSize:"0.5rem",color:col,opacity:0.75}}>중기 {fd.jung[1]}일</div></>);})()
                            :<div style={{fontSize:"0.5rem",color:"#c0b09a",fontStyle:"italic"}}>왕지</div>
                          }
                        </div>
                        {fd.bon&&(()=>{const hi=HS.indexOf(fd.bon[0]);const col=ECB[HS_EL[hi]]||"#9a7a5a";return(<div><div style={{fontSize:"1rem",fontFamily:"serif",color:col}}>{fd.bon[0]}</div><div style={{fontSize:"0.5rem",color:col,opacity:0.75}}>본기 {fd.bon[1]}일</div></div>);})()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 그림 탭 */}
          {tab==="image"&&(
            <div style={{background:"#fff",borderRadius:"1.25rem",padding:"1.25rem",boxShadow:"0 2px 16px rgba(0,0,0,0.05)"}}>
              <p style={{textAlign:"center",fontWeight:700,color:"#3a2010",fontFamily:"serif",marginBottom:"1rem",fontSize:"0.9rem"}}>원국 물상 수묵화</p>
              <SajuImage hs={saju.pillars[1].stem} eb={saju.pillars[2].branch}/>
            </div>
          )}

          {/* 풀이 탭 */}
          {tab==="read"&&(
            <div style={{background:"#fff",borderRadius:"1.25rem",padding:"1.25rem",boxShadow:"0 2px 16px rgba(0,0,0,0.05)"}}>
              {!reading
                ?<button onClick={handleAI} disabled={loadingAI} style={{width:"100%",padding:"14px",borderRadius:"12px",background:loadingAI?"#9a7a5a":"linear-gradient(135deg,"+C+",#8b6010)",color:DK,fontWeight:700,fontSize:"0.9rem",border:"none",cursor:loadingAI?"not-allowed":"pointer"}}>{loadingAI?"⏳ AI 풀이 생성 중...":"✦ AI 사주 통변 풀이 받기"}</button>
                :<div style={{fontSize:"0.88rem",lineHeight:1.8,color:"#3a2010",whiteSpace:"pre-line"}} dangerouslySetInnerHTML={{__html:bold(reading)}}/>
              }
              {aiErr&&<p style={{color:"#c03020",fontSize:"0.75rem",marginTop:"0.5rem",textAlign:"center"}}>{aiErr}</p>}
            </div>
          )}

          {/* 대운 탭 */}
          {tab==="daeun"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              <div style={{background:"#fff",borderRadius:"1.25rem",padding:"1.25rem",boxShadow:"0 2px 16px rgba(0,0,0,0.05)"}}>
                <p style={{fontSize:"0.72rem",fontWeight:700,color:"#9a7a5a",textAlign:"center",marginBottom:"0.75rem"}}>대운수: {daeunList[0]&&daeunList[0].startAge}세 시작 · {daeunList[0]&&daeunList[0].isForward?"순행":"역행"}</p>
                <div style={{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px"}}>
                  {daeunList.map((d,i)=>(
                    <button key={i} onClick={()=>{setSelDaeun(d);setDReading("");setAiErr("");}}
                      style={{flexShrink:0,width:"68px",borderRadius:"16px",padding:"10px 4px",textAlign:"center",background:selDaeun===d?DK2:"#faf6ef",border:selDaeun===d?"2px solid "+C:"1.5px solid #e0d5c5",cursor:"pointer",marginTop:"8px"}}>
                      <div style={{fontSize:"1.8rem",color:ECB[HS_EL[d.stemIdx]],fontFamily:"serif"}}>{d.stem}</div>
                      <div style={{fontSize:"1.8rem",color:ECB[EB_EL[d.branchIdx]],fontFamily:"serif"}}>{d.branch}</div>
                      <div style={{fontSize:"0.65rem",color:selDaeun===d?"#c9a96e":"#9a7a5a",marginTop:"4px"}}>{d.startAge}세</div>
                    </button>
                  ))}
                </div>
              </div>
              {selDaeun&&(
                <div style={{background:"#fff",borderRadius:"1.25rem",padding:"1.25rem",boxShadow:"0 2px 16px rgba(0,0,0,0.05)",display:"flex",flexDirection:"column",gap:"1rem"}}>
                  <p style={{textAlign:"center",fontWeight:700,color:"#3a2010",fontFamily:"serif",fontSize:"0.9rem",margin:0}}>
                    {selDaeun.stem}{selDaeun.branch} 대운 수묵화 ({selDaeun.startAge}~{selDaeun.startAge+9}세)
                  </p>
                  <SajuImage hs={selDaeun.stem} eb={selDaeun.branch}/>
                  {!dReading
                    ?<button onClick={handleDaeunAI} disabled={loadingAI} style={{width:"100%",padding:"14px",borderRadius:"12px",background:loadingAI?"#9a7a5a":"linear-gradient(135deg,"+C+",#8b6010)",color:DK,fontWeight:700,fontSize:"0.9rem",border:"none",cursor:loadingAI?"not-allowed":"pointer"}}>{loadingAI?"⏳ 분석 중...":"✦ 이 대운 AI 풀이 보기"}</button>
                    :<div style={{background:"#faf6ef",borderRadius:"12px",padding:"1rem",fontSize:"0.88rem",lineHeight:1.8,color:"#3a2010",whiteSpace:"pre-line"}} dangerouslySetInnerHTML={{__html:bold(dReading)}}/>
                  }
                  {aiErr&&<p style={{color:"#c03020",fontSize:"0.75rem",textAlign:"center",margin:0}}>{aiErr}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}
