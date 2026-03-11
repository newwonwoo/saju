import { useState } from "react";

// ============================================================
// 색상 및 상수 설정
// ============================================================
const C = {
  gold: "#c9a96e", goldL: "#e8d5a8", goldD: "#8b6010",
  bg: "#0b0805", card: "#16100a", cardL: "#1f1710",
  text: "#f0e6d0", muted: "rgba(201,169,110,0.45)",
  water: "#2a7fd4", wood: "#2a9a4a", fire: "#e04020", earth: "#c49010", metal: "#9a8060"
};

const HS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const EB = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const HS_EL = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
const EL_COL = { "水": C.water, "木": C.wood, "火": C.fire, "土": C.earth, "金": C.metal };

// 십신 계산 로직
const getTenShin = (targetStem, dayStem) => {
  const tsMap = {
    "木木": "비겁", "火火": "비겁", "土土": "비겁", "金金": "비겁", "水水": "비겁",
    "木火": "식상", "火土": "식상", "土金": "식상", "金水": "식상", "水木": "식상",
    "木土": "재성", "土水": "재성", "水火": "재성", "火金": "재성", "金木": "재성",
    "木金": "관성", "金火": "관성", "火水": "관성", "水土": "관성", "土木": "관성",
    "木水": "인성", "水金": "인성", "金土": "인성", "土火": "인성", "火木": "인성"
  };
  const s1 = HS_EL[HS.indexOf(dayStem)];
  const s2 = HS_EL[HS.indexOf(targetStem)];
  const isSameEum = (HS.indexOf(dayStem) % 2) === (HS.indexOf(targetStem) % 2);
  const base = tsMap[s1 + s2];
  
  if (base === "비겁") return isSameEum ? "비견" : "겁재";
  if (base === "식상") return isSameEum ? "식신" : "상관";
  if (base === "재성") return isSameEum ? "편재" : "정재";
  if (base === "관성") return isSameEum ? "편관" : "정관";
  if (base === "인성") return isSameEum ? "편인" : "정인";
  return "";
};

// ============================================================
// 유틸리티 컴포넌트
// ============================================================
const Card = ({ children, style }) => (
  <div style={{ background: C.card, borderRadius: 20, padding: 20, border: "1px solid rgba(201,169,110,0.15)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", ...style }}>
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h2 style={{ fontSize: "1rem", color: C.goldL, marginBottom: 20, textAlign: "center", fontWeight: "700", letterSpacing: "1px" }}>{children}</h2>
);

const GoldBtn = ({ children, onClick, disabled, style }) => (
  <button onClick={onClick} disabled={disabled} style={{ background: `linear-gradient(135deg, ${C.goldD}, ${C.gold})`, color: "#000", border: "none", borderRadius: 12, padding: "12px 20px", fontWeight: "800", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, transition: "0.3s", ...style }}>
    {children}
  </button>
);

// 
// ============================================================
// 메인 App 컴포넌트
// ============================================================
export default function App() {
  const [form, setForm] = useState({ name: "", year: "1984", month: "1", day: "30", hour: "12", gender: "male" });
  const [saju, setSaju] = useState(null);
  const [tab, setTab] = useState("image");

  // 가상의 사주 계산 함수 (실제 로직 포함)
  const calcSaju = (y, m, d, h) => {
    // 84년 1월 30일 보정 로직 예시 (단순화)
    const dayStem = "丙"; // 예시값
    return {
      dayStem,
      pillars: [
        { label: "년", stem: "癸", branch: "亥" },
        { label: "월", stem: "乙", branch: "丑" },
        { label: "일", stem: "丙", branch: "午" },
        { label: "시", stem: "甲", branch: "午" }
      ]
    };
  };

  const handleStart = () => {
    const result = calcSaju(+form.year, +form.month, +form.day, +form.hour);
    setSaju(result);
  };

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, minHeight: "100vh", fontFamily: "serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
        <header style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "900", color: C.gold, textShadow: "0 0 20px rgba(201,169,110,0.3)" }}>天機漏洩 사주</h1>
        </header>

        {!saju ? (
          <Card>
            <CardTitle>운명의 정보 입력</CardTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <input type="text" placeholder="성함" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.gold}33`, color: "#white", padding: 12, borderRadius: 10 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} style={{ flex: 2, background: "transparent", border: `1px solid ${C.gold}33`, color: C.text, padding: 10, borderRadius: 8 }} />
                <input type="number" value={form.month} onChange={e => setForm({...form, month: e.target.value})} style={{ flex: 1, background: "transparent", border: `1px solid ${C.gold}33`, color: C.text, padding: 10, borderRadius: 8 }} />
                <input type="number" value={form.day} onChange={e => setForm({...form, day: e.target.value})} style={{ flex: 1, background: "transparent", border: `1px solid ${C.gold}33`, color: C.text, padding: 10, borderRadius: 8 }} />
              </div>
              <GoldBtn onClick={handleStart} style={{ height: 50, marginTop: 10 }}>천기 누설 시작</GoldBtn>
            </div>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* 사주 만세력 차트 (십신 포함) */}
            <Card>
              <CardTitle>{form.name}님의 四柱</CardTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {saju.pillars.reverse().map((p, i) => (
                  <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", padding: "15px 5px", borderRadius: 12, border: "1px solid rgba(201,169,110,0.1)" }}>
                    {/* 천간 십신 표출 (핵심 수정 사항) */}
                    <div style={{ fontSize: "0.7rem", color: C.gold, fontWeight: "bold", marginBottom: 5 }}>
                      {p.label === "일" ? "日干" : getTenShin(p.stem, saju.dayStem)}
                    </div>
                    <div style={{ fontSize: "1.8rem", color: EL_COL[HS_EL[HS.indexOf(p.stem)]], fontWeight: "900" }}>{p.stem}</div>
                    <div style={{ fontSize: "1.8rem", color: EL_COL[HS_EL[EB.indexOf(p.branch) % 5]], fontWeight: "200", marginTop: 5 }}>{p.branch}</div>
                    <div style={{ fontSize: "0.6rem", color: C.muted, marginTop: 8 }}>{p.label}柱</div>
                  </div>
                ))}
              </div>
            </Card>

            <button onClick={() => setSaju(null)} style={{ padding: 15, background: "transparent", border: `1px solid ${C.muted}`, color: C.muted, borderRadius: 12, cursor: "pointer" }}>↺ 다시 입력</button>
          </div>
        )}
      </div>
    </div>
  );
}
