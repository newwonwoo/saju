import { useState, useRef, useEffect } from "react";

const TOILET_DB = {
  // ── 1호선 ──
  "회룡_1": { gate_in: true, gate_in_location: "의정부 경전철 환승 게이트 통과 후 대합실", gate_out: false },
  "도봉산_1": { gate_in: true, gate_in_location: "북쪽 1-1번 출구 쪽 7호선 환승통로 구역", gate_out: true, gate_out_location: "1번 출구 방향 대합실 내" },
  "도봉_1": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후 승강장 방향", gate_out: false },
  "방학_1": { gate_in: true, gate_in_location: "★ 승강장에서 바로 진입", gate_out: false },
  "창동_1": { gate_in: true, gate_in_location: "4호선 구역으로 이동", gate_out: false, other_lines: [{ line: "4", direction: "4호선 구역 개찰구 안 화장실" }] },
  "녹천_1": { gate_in: true, gate_in_location: "★ 승강장에서 바로 진입", gate_out: false },
  "월계_1": { gate_in: true, gate_in_location: "★ 상행선 10-4 승강장 옆 엘리베이터 근처", gate_out: false },
  "석계_1": { gate_in: true, gate_in_location: "승강장에서 내려왔을 때 오른편 (6호선 구역에도 있음)", gate_out: true, gate_out_location: "6호선 구역 대합실 밖", other_lines: [{ line: "6", direction: "6호선 구역 — 개찰구 밖에도 화장실 있음" }] },
  "신이문_1": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "외대앞_1": { gate_in: true, gate_in_location: "상행선 승강장 이동 계단 아래", gate_out: false },
  "청량리_1": { gate_in: true, gate_in_location: "1·경의중앙·수인분당 환승통로 (한국철도 관할이나 1호선에 가까움)", gate_out: true, gate_out_location: "한국철도 대합실", other_lines: [{ line: "경의중앙", direction: "경의중앙선 환승통로 동일 화장실" }] },
  "신설동_1": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "동묘앞_1": { gate_in: true, gate_in_location: "★ 양쪽 승강장에서 바로 진입 (하행 게이트 밖에도 있음)", gate_out: true, gate_out_location: "하행 승강장 쪽 게이트 밖" },
  "동대문_1": { gate_in: true, gate_in_location: "4호선 구역으로 이동", gate_out: true, gate_out_location: "1호선 대합실 밖", other_lines: [{ line: "4", direction: "4호선 구역 대합실 — 개찰구 안 화장실 있음" }] },
  "종로3가_1": { gate_in: true, gate_in_location: "3호선–5호선 환승통로 내", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "3", direction: "3호선–5호선 환승통로 동일 화장실" }, { line: "5", direction: "3호선–5호선 환승통로 동일 화장실" }] },
  "시청_1": { gate_in: true, gate_in_location: "2호선 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "2", direction: "2호선 구역 — 개찰구 안 화장실 있음" }] },
  "서울역_1": { gate_in: true, gate_in_location: "공항철도 구역으로 이동 (막장환승, 비상게이트 이용 권장)", gate_out: true, gate_out_location: "1호선 대합실 밖", other_lines: [{ line: "공항철도", direction: "공항철도 구역 — 개찰구 안 화장실 있음" }] },
  "남영_1": { gate_in: true, gate_in_location: "★ 승강장에서 바로 진입", gate_out: false },
  "용산_1": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후 (혼잡 주의)", gate_out: true, gate_out_location: "대합실 밖 (혼잡 주의)" },
  "노량진_1": { gate_in: true, gate_in_location: "9호선 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "9", direction: "9호선 구역 — 개찰구 안 화장실 있음" }] },
  "대방_1": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false, note: "역 외부 신림선 6번 출구 인근 공중화장실 있음" },
  "영등포_1": { gate_in: true, gate_in_location: "1번·2번 승강장 사이 환승통로", gate_out: true, gate_out_location: "4번 출구 개찰구 밖 (롯데백화점 안에도 있음)" },
  "신도림_1": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "2", direction: "2호선 구역에도 화장실 있음" }] },
  "구로_1": { gate_in: true, gate_in_location: "1번 출구 쪽 개찰구 안", gate_out: true, gate_out_location: "2~3번 출구 쪽 개찰구 밖" },
  "구일_1": { gate_in: true, gate_in_location: "1번 출구 쪽 개찰구 안", gate_out: true, gate_out_location: "2번 출구 쪽 개찰구 밖" },
  "온수_1": { gate_in: false, gate_out: true, gate_out_location: "7호선 승강장 직진 후 개찰구 밖 (비상게이트 상시 개방)", other_lines: [{ line: "7", direction: "7호선 쪽으로 이동 — 비상게이트 상시 개방" }] },
  "석수_1": { gate_in: true, gate_in_location: "★ 하행선 승강장에만 있음", gate_out: true, gate_out_location: "대합실 밖" },
  "관악_1": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "명학_1": { gate_in: true, gate_in_location: "★ 상행선 승강장에만 있음", gate_out: true, gate_out_location: "대합실 밖" },
  "금정_1": { gate_in: true, gate_in_location: "★ 승강장 나가는 계단 밑 (좁고 낡음)", gate_out: true, gate_out_location: "대합실 밖" },
  "화서_1": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "수원_1": { gate_in: true, gate_in_location: "수인분당선–1호선 환승통로 중간(지하 1층)", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "수인분당", direction: "수인분당선 환승통로 동일 화장실" }] },
  "가산디지털단지_1": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "7", direction: "7호선 구역 화장실 이용 가능" }] },

  // ── 2호선 ──
  "시청_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "1", direction: "1호선 구역에도 화장실 있음" }] },
  "을지로3가_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "3", direction: "3호선 구역에도 화장실 있음" }] },
  "동대문역사문화공원_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "12번 출구 쪽 대합실 밖" },
  "왕십리_2": { gate_in: true, gate_in_location: "5호선/경의중앙선/수인분당선 구역 환승통로 (5호선은 외선순환 쪽)", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "5", direction: "5호선 외선순환–5호선 환승통로" }, { line: "경의중앙", direction: "경의중앙선 대합실 화장실" }] },
  "건대입구_2": { gate_in: true, gate_in_location: "개찰구 안 (비상게이트 상시 개방으로 밖에서도 이용 가능)", gate_out: true, gate_out_location: "7호선 4번 출구 쪽 대합실 밖", other_lines: [{ line: "7", direction: "7호선 4번 출구 쪽 개찰구 밖 화장실" }] },
  "종합운동장_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "강남_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "사당_2": { gate_in: true, gate_in_location: "4호선 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "4", direction: "4호선 구역 — 개찰구 안 화장실 있음" }] },
  "신대방_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "구로디지털단지_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "대림_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "신도림_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "영등포구청_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "5호선 구역 대합실 밖", other_lines: [{ line: "5", direction: "5호선 구역 밖에만 화장실 있음" }] },
  "당산_2": { gate_in: true, gate_in_location: "8·9번 출구 쪽 개찰구 안", gate_out: true, gate_out_location: "9호선 구역 대합실 밖 (7·10~13번 출구 쪽)", other_lines: [{ line: "9", direction: "9호선 구역 밖에만 화장실 있음" }] },
  "홍대입구_2": { gate_in: true, gate_in_location: "공항철도 구역으로 이동 (막장환승, 비상게이트 이용 권장)", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "공항철도", direction: "공항철도 구역 — 개찰구 안 화장실 있음" }] },
  "신답_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "용두_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "신설동_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "양천구청_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "신촌_2": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "이대_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "충정로_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "5", direction: "5호선 환승통로 이동 후 화장실" }] },
  "잠실나루_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "잠실_2": { gate_in: true, gate_in_location: "8호선 환승통로 방향 대합실 내", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "8", direction: "8호선 환승통로 이동 후 화장실" }] },
  "강변_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "구의_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "성수_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "뚝섬_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "한양대_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "역삼_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "선릉_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "수인분당", direction: "수인분당선 환승통로 이동 후 화장실" }] },
  "삼성_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "낙성대_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "서울대입구_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "봉천_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "신림_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖 (신림선 개통 후 대합실 내부 변경)" },
  "교대_2": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "3", direction: "3호선 환승통로 이동 후 화장실" }] },

  // ── 3호선 ──
  "대곡_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "GTX-A/경의중앙 구역 대합실 밖" },
  "지축_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "연신내_3": { gate_in: true, gate_in_location: "3호선 구역 대합실", gate_out: true, gate_out_location: "6호선 구역 대합실 밖", other_lines: [{ line: "6", direction: "6호선 구역으로 이동 — 3호선에서 이동 필요" }] },
  "무악재_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "독립문_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "경복궁_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "종로3가_3": { gate_in: true, gate_in_location: "3호선–5호선 환승통로 내", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "1", direction: "1호선 환승통로 동일 화장실" }, { line: "5", direction: "5호선 환승통로 동일 화장실" }] },
  "을지로3가_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "2", direction: "2호선 구역에도 화장실 있음" }] },
  "충무로_3": { gate_in: true, gate_in_location: "3·4호선 환승통로 내", gate_out: false, other_lines: [{ line: "4", direction: "4호선 환승통로 동일 화장실" }] },
  "동대입구_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "약수_3": { gate_in: true, gate_in_location: "3호선 구역 대합실", gate_out: true, gate_out_location: "6호선 구역 대합실 밖", other_lines: [{ line: "6", direction: "6호선 구역 밖에만 화장실 있음" }] },
  "금호_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "옥수_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "경의중앙선 구역 대합실 밖", other_lines: [{ line: "경의중앙", direction: "경의중앙선 구역 — 안팎 모두 3호선 구역에 있음" }] },
  "잠원_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "고속터미널_3": { gate_in: true, gate_in_location: "9호선 구역으로 이동 (7호선 비상게이트 상시 개방)", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "9", direction: "9호선 구역 — 개찰구 안 화장실 있음 (가장 가까움)" }, { line: "7", direction: "7호선 구역 — 비상게이트 상시 개방" }] },
  "남부터미널_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "양재_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "신분당선 구역 대합실 밖", other_lines: [{ line: "신분당", direction: "신분당선 구역 밖에만 화장실 있음" }] },
  "대치_3": { gate_in: true, gate_in_location: "3·4·5·6번 출구 방향에만 있음", gate_out: false },
  "대청_3": { gate_in: true, gate_in_location: "대화 방면 승강장에만 있음 (오금 방면은 비상게이트 요청 필요)", gate_out: false },
  "수서_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "수인분당선/GTX-A/SRT 구역 대합실 밖" },
  "가락시장_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "8호선 구역 대합실 밖", other_lines: [{ line: "8", direction: "8호선 구역 밖에만 화장실 있음" }] },
  "경찰병원_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "오금_3": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },

  // ── 4호선 ──
  "별내별가람_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "상계_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "노원_4": { gate_in: true, gate_in_location: "4호선 개찰구 안 (비상게이트 상시 개방으로 밖에서도 이용 가능)", gate_out: true, gate_out_location: "4호선 개찰구 밖 (비상게이트 상시 개방)", other_lines: [{ line: "7", direction: "7호선은 개찰구 밖 — 막장환승이므로 비상게이트 이용 권장" }] },
  "창동_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "쌍문_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "성신여대입구_4": { gate_in: true, gate_in_location: "오이도행 승강장 바로 위층", gate_out: false },
  "동대문_4": { gate_in: true, gate_in_location: "4호선 구역 대합실", gate_out: true, gate_out_location: "1호선 구역 대합실 밖", other_lines: [{ line: "1", direction: "1호선 구역 밖에만 화장실 있음" }] },
  "동대문역사문화공원_4": { gate_in: true, gate_in_location: "지하 2층 4호선 대합실", gate_out: true, gate_out_location: "대합실 밖" },
  "충무로_4": { gate_in: true, gate_in_location: "3·4호선 환승통로 내", gate_out: false, other_lines: [{ line: "3", direction: "3호선 환승통로 동일 화장실" }] },
  "명동_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "회현_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "서울역_4": { gate_in: true, gate_in_location: "공항철도 구역으로 이동 (막장환승, 비상게이트 이용 권장)", gate_out: true, gate_out_location: "4호선 대합실 밖", other_lines: [{ line: "공항철도", direction: "공항철도 구역 — 개찰구 안 화장실 있음" }] },
  "삼각지_4": { gate_in: true, gate_in_location: "4호선 대합실 개찰구 안 (개찰구 위치 조정으로 변경)", gate_out: true, gate_out_location: "6호선 구역 대합실 밖", other_lines: [{ line: "6", direction: "6호선 구역 밖에만 화장실 있음" }] },
  "이촌_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "동작_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "9호선 구역 대합실 밖", other_lines: [{ line: "9", direction: "9호선 구역 밖에만 화장실 있음" }] },
  "총신대입구_4": { gate_in: true, gate_in_location: "4호선 대합실 개찰구 안", gate_out: true, gate_out_location: "7호선 구역 대합실 밖", other_lines: [{ line: "7", direction: "7호선 구역 밖에만 화장실 있음" }] },
  "사당_4": { gate_in: true, gate_in_location: "4호선 대합실 개찰구 안", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "2", direction: "2호선 구역에도 화장실 있음" }] },
  "남태령_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "과천_4": { gate_in: true, gate_in_location: "대합실 개찰구 안 (비상게이트 상시 개방)", gate_out: false },
  "정부과천청사_4": { gate_in: true, gate_in_location: "대합실 개찰구 안 (비상게이트 상시 개방)", gate_out: false },
  "금정_4": { gate_in: true, gate_in_location: "★ 승강장 나가는 계단 밑 (좁고 낡음)", gate_out: true, gate_out_location: "대합실 밖" },
  "상록수_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "한대앞_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "중앙_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후 (엘리베이터로는 이용 불가)", gate_out: false },
  "고잔_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "초지_4": { gate_in: true, gate_in_location: "4호선 대합실 (1번 출구 쪽)", gate_out: true, gate_out_location: "2~4번 출구 방면 서해선 대합실 밖" },
  "수유_4": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },

  // ── 5호선 ──
  "김포공항_5": { gate_in: true, gate_in_location: "9호선/공항철도/김포골드라인/서해선 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖" },
  "신정_5": { gate_in: true, gate_in_location: "2·3번 출구 방향 대합실 (1·4·5번 출구 방향은 되돌아가야 함)", gate_out: false },
  "양평_5": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "영등포구청_5": { gate_in: true, gate_in_location: "2호선 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "2", direction: "2호선 구역 — 개찰구 안 화장실 있음" }] },
  "여의도_5": { gate_in: true, gate_in_location: "9호선 개화 방면 승강장", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "9", direction: "9호선 개화 방면 승강장 — 개찰구 안 화장실 있음" }] },
  "공덕_5": { gate_in: true, gate_in_location: "공항철도 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "공항철도", direction: "공항철도 구역 — 개찰구 안 화장실 있음" }] },
  "종로3가_5": { gate_in: true, gate_in_location: "3호선–5호선 환승통로 내", gate_out: false, other_lines: [{ line: "1", direction: "1호선 환승통로 동일 화장실" }, { line: "3", direction: "3호선 환승통로 동일 화장실" }] },
  "동대문역사문화공원_5": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖 (2호선·4호선 구역에는 개찰구 안 화장실 있음)", other_lines: [{ line: "4", direction: "4호선 구역으로 이동 — 개찰구 안 화장실 있음 (더 가까움)" }, { line: "2", direction: "2호선 구역으로 이동 — 개찰구 안 화장실 있음" }] },
  "청구_5": { gate_in: false, gate_out: true, gate_out_location: "개찰구 밖 (6호선 하행 비상게이트 상시 개방)", other_lines: [{ line: "6", direction: "6호선 하행(신내) 측 비상게이트 상시 개방" }] },
  "왕십리_5": { gate_in: true, gate_in_location: "2호선·경의중앙선 환승 대합실", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "2", direction: "2호선 구역에도 화장실 있음" }] },
  "미사_5": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "1번 출구 엘리베이터 맞은편" },
  "올림픽공원_5": { gate_in: true, gate_in_location: "9호선 환승통로", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "9", direction: "9호선 환승통로 동일 화장실" }] },
  "오금_5": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "천호_5": { gate_in: true, gate_in_location: "8호선 환승통로 방향 대합실 내", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "8", direction: "8호선 환승통로 이동 후 화장실" }] },
  "충정로_5": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "2", direction: "2호선 환승통로 이동 후 화장실" }] },
  "광화문_5": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },

  // ── 6호선 ──
  "연신내_6": { gate_in: true, gate_in_location: "3호선 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "3", direction: "3호선 구역 — 개찰구 안 화장실 있음" }] },
  "디지털미디어시티_6": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "월드컵경기장_6": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "공덕_6": { gate_in: true, gate_in_location: "공항철도 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "공항철도", direction: "공항철도 구역 — 개찰구 안 화장실 있음" }] },
  "삼각지_6": { gate_in: true, gate_in_location: "4호선 구역으로 이동 (4호선 개찰구 조정으로 안쪽으로 들어옴)", gate_out: false, other_lines: [{ line: "4", direction: "4호선 구역 — 개찰구 안 화장실 있음" }] },
  "한강진_6": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "약수_6": { gate_in: true, gate_in_location: "3호선 구역으로 이동", gate_out: false, other_lines: [{ line: "3", direction: "3호선 구역 — 개찰구 안 화장실 있음" }] },
  "청구_6": { gate_in: false, gate_out: true, gate_out_location: "개찰구 밖 (하행 비상게이트 상시 개방, 상행은 직원 호출)" },
  "동묘앞_6": { gate_in: false, gate_out: true, gate_out_location: "1호선 승강장으로 이동 (양방향 모두)", other_lines: [{ line: "1", direction: "1호선 승강장 — ★ 승강장에서 바로 진입" }] },
  "창신_6": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "안암_6": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "고려대_6": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "석계_6": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },

  // ── 7호선 ──
  "도봉산_7": { gate_in: true, gate_in_location: "1-1번 출구 쪽 대합실", gate_out: true, gate_out_location: "대합실 밖" },
  "노원_7": { gate_in: true, gate_in_location: "4호선 구역으로 이동 (막장환승, 비상게이트/재승차 이용 권장)", gate_out: true, gate_out_location: "7호선 대합실 밖", other_lines: [{ line: "4", direction: "4호선 구역 — 개찰구 안 화장실 있음" }] },
  "상봉_7": { gate_in: true, gate_in_location: "지하1층 대합실 (개찰구 위치 조정으로 안쪽)", gate_out: false },
  "건대입구_7": { gate_in: true, gate_in_location: "★ 장암 방면(상행) 승강장에만 있음 (하행은 반대쪽으로 이동)", gate_out: true, gate_out_location: "4번 출구 쪽 개찰구 밖 (상가 사이에 있어 찾기 어려움)" },
  "자양_7": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "고속터미널_7": { gate_in: false, gate_out: true, gate_out_location: "7호선 대합실 밖 (비상게이트 상시 개방)", other_lines: [{ line: "9", direction: "9호선 구역 — 개찰구 안 화장실 있음 (가까움)" }] },
  "이수_7": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "4호선 구역 대합실 밖", other_lines: [{ line: "4", direction: "4호선(총신대입구) 구역 밖에만 화장실 있음" }] },
  "남성_7": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "대림_7": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "온수_7": { gate_in: false, gate_out: true, gate_out_location: "승강장 직진 후 올라가면 개찰구 밖 (비상게이트 상시 개방)" },
  "부천종합운동장_7": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "부평구청_7": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "석남_7": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "가산디지털단지_7": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "1", direction: "1호선 구역 화장실 이용 가능" }] },

  // ── 8호선 ──
  "별내_8": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "구리_8": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "석촌_8": { gate_in: true, gate_in_location: "9호선 환승 게이트 통과 후 (거리 멀어 비상게이트/재승차 권장)", gate_out: true, gate_out_location: "8호선 대합실 밖", other_lines: [{ line: "9", direction: "9호선 구역 — 개찰구 안 화장실 있음" }] },
  "가락시장_8": { gate_in: true, gate_in_location: "3호선 방향으로 내려가 계단 올라가야 함 (급하면 엘리베이터)", gate_out: true, gate_out_location: "3호선 구역 대합실 밖", other_lines: [{ line: "3", direction: "3호선 구역 밖에만 화장실 있음" }] },
  "잠실_8": { gate_in: true, gate_in_location: "2호선 환승통로 방향 대합실 내", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "2", direction: "2호선 환승통로 이동 후 화장실" }] },
  "천호_8": { gate_in: true, gate_in_location: "5호선 환승통로 방향 대합실 내", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "5", direction: "5호선 환승통로 이동 후 화장실" }] },
  "모란_8": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },

  // ── 9호선 ──
  "개화_9": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "김포공항_9": { gate_in: true, gate_in_location: "공항철도와 화장실 공유 (공항철도 관리)", gate_out: true, gate_out_location: "대합실 밖" },
  "마곡나루_9": { gate_in: true, gate_in_location: "공항철도 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "공항철도", direction: "공항철도 구역 — 개찰구 안 화장실 있음" }] },
  "당산_9": { gate_in: true, gate_in_location: "8·9번 출구 쪽 개찰구 안", gate_out: true, gate_out_location: "7·10~13번 출구 쪽 대합실 밖" },
  "국회의사당_9": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "여의도_9": { gate_in: true, gate_in_location: "★ 개화 방면 승강장", gate_out: true, gate_out_location: "대합실 밖" },
  "노량진_9": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "동작_9": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "고속터미널_9": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후 (가장 가까움)", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "3", direction: "3호선 구역에서도 이동 가능" }, { line: "7", direction: "7호선 구역 비상게이트 상시 개방" }] },
  "종합운동장_9": { gate_in: true, gate_in_location: "2호선 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "2", direction: "2호선 구역 — 개찰구 안 화장실 있음" }] },
  "석촌_9": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "8", direction: "8호선 구역에도 이동 가능" }] },
  "올림픽공원_9": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "5", direction: "5호선 환승통로 동일 화장실" }] },
  "중앙보훈병원_9": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "언주_9": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "선정릉_9": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "수인분당", direction: "수인분당선 환승통로 이동 후 화장실" }] },

  // ── 수인·분당선 ──
  "수원_수인분당": { gate_in: true, gate_in_location: "1호선 환승통로 중간(지하 1층)", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "1", direction: "1호선 환승통로 동일 화장실" }] },
  "한대앞_수인분당": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "중앙_수인분당": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "고잔_수인분당": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "초지_수인분당": { gate_in: true, gate_in_location: "수인분당선 대합실 개찰구 안", gate_out: true, gate_out_location: "2~4번 출구 방면 서해선 대합실 밖" },
  "청량리_수인분당": { gate_in: true, gate_in_location: "1호선 환승통로 (1호선에 가까움)", gate_out: false, other_lines: [{ line: "1", direction: "1호선 환승통로 동일 화장실" }] },
  "왕십리_수인분당": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "수서_수인분당": { gate_in: true, gate_in_location: "3호선 구역으로 이동", gate_out: false, other_lines: [{ line: "3", direction: "3호선 구역 — 개찰구 안 화장실 있음" }] },
  "정자_수인분당": { gate_in: true, gate_in_location: "신분당선 구역으로 이동 (화장실만 사용 후 복귀 시 추가운임 없음)", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "신분당", direction: "신분당선 구역 — 개찰구 안 화장실 있음" }] },
  "기흥_수인분당": { gate_in: true, gate_in_location: "수인분당선 대합실 개찰구 안", gate_out: true, gate_out_location: "용인 경전철 쪽 대합실 밖" },
  "원인재_수인분당": { gate_in: false, gate_out: true, gate_out_location: "5번 출구 쪽 대합실 밖", other_lines: [{ line: "인천1", direction: "인천1호선 구역 — 개찰구 안 화장실 있음" }] },
  "인천_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "복정_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "8", direction: "8호선 환승통로 이동 후 화장실" }] },
  "모란_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "8", direction: "8호선 환승통로 이동 후 화장실" }] },
  "미금_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "신분당", direction: "신분당선 환승통로 이동 후 화장실" }] },
  "야탑_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "서현_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "수내_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "죽전_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "영통_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "압구정로데오_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "강남구청_수인분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "7", direction: "7호선 환승통로 이동 후 화장실" }] },

  // ── 신분당선 ──
  "강남_신분당": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "양재_신분당": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "양재시민의숲_신분당": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "청계산입구_신분당": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "판교_신분당": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "경강선 구역 대합실 밖", other_lines: [{ line: "경강", direction: "경강선 구역 밖에만 화장실 있음" }] },
  "정자_신분당": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "수인분당선 구역 대합실 밖", other_lines: [{ line: "수인분당", direction: "수인분당선 구역 밖에만 화장실 있음" }] },
  "동천_신분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "수지구청_신분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "광교중앙_신분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "광교_신분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "미금_신분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "수인분당", direction: "수인분당선 환승통로 이동 후 화장실" }] },
  "신사_신분당": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },

  // ── 경의·중앙선 ──
  "대곡_경의중앙": { gate_in: true, gate_in_location: "3호선 개찰구 방면 대합실", gate_out: true, gate_out_location: "3호선/GTX-A 구역 대합실 밖" },
  "디지털미디어시티_경의중앙": { gate_in: true, gate_in_location: "6호선 구역으로 이동 (공항철도는 막장환승)", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "6", direction: "6호선 구역 — 개찰구 안 화장실 있음" }] },
  "홍대입구_경의중앙": { gate_in: true, gate_in_location: "공항철도 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "공항철도", direction: "공항철도 구역 — 개찰구 안 화장실 있음" }] },
  "공덕_경의중앙": { gate_in: true, gate_in_location: "공항철도 구역으로 이동", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "공항철도", direction: "공항철도 구역 — 개찰구 안 화장실 있음" }] },
  "용산_경의중앙": { gate_in: true, gate_in_location: "1호선·경의중앙선 승강장 올라오면 한 곳으로 연결", gate_out: true, gate_out_location: "대합실 밖" },
  "이촌_경의중앙": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "서빙고_경의중앙": { gate_in: true, gate_in_location: "★ 용문 방면 승강장", gate_out: true, gate_out_location: "대합실 밖" },
  "옥수_경의중앙": { gate_in: true, gate_in_location: "3호선 구역 안팎 모두", gate_out: true, gate_out_location: "3호선 구역 대합실 밖", other_lines: [{ line: "3", direction: "3호선 구역 — 안팎 모두 화장실 있음" }] },
  "응봉_경의중앙": { gate_in: true, gate_in_location: "★ 용문 방면 승강장", gate_out: false },
  "왕십리_경의중앙": { gate_in: true, gate_in_location: "2호선·5호선 환승 대합실", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "2", direction: "2호선 구역에도 화장실 있음" }] },
  "청량리_경의중앙": { gate_in: true, gate_in_location: "1호선 환승통로 (1호선에 가까움)", gate_out: false, other_lines: [{ line: "1", direction: "1호선 환승통로 동일 화장실" }] },
  "상봉_경의중앙": { gate_in: true, gate_in_location: "지하1층 대합실 (개찰구 위치 조정)", gate_out: false },
  "구리_경의중앙": { gate_in: true, gate_in_location: "8호선 구역 환승통로", gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "8", direction: "8호선 구역 환승통로 화장실" }] },
  "수색_경의중앙": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "능곡_경의중앙": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "일산_경의중앙": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "금촌_경의중앙": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "문산_경의중앙": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "양평_경의중앙": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "용문_경의중앙": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },

  // ── 공항철도 ──
  "서울역_공항철도": { gate_in: true, gate_in_location: "일반열차/당역종착 직통 운임구역 내 대합실", gate_out: true, gate_out_location: "대합실 밖" },
  "공덕_공항철도": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "홍대입구_공항철도": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "디지털미디어시티_공항철도": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "마곡나루_공항철도": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "김포공항_공항철도": { gate_in: true, gate_in_location: "9호선과 화장실 공유 (공항철도 관리)", gate_out: true, gate_out_location: "대합실 밖" },
  "계양_공항철도": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "검암_공항철도": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: true, gate_out_location: "대합실 밖" },
  "운서_공항철도": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "공항화물청사_공항철도": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "인천공항1터미널_공항철도": { gate_in: true, gate_in_location: "터미널 연결 대합실 내", gate_out: true, gate_out_location: "공항 3층 출발층 화장실" },
  "인천공항2터미널_공항철도": { gate_in: true, gate_in_location: "터미널 연결 대합실 내", gate_out: true, gate_out_location: "공항 3층 출발층 화장실" },

  // ── 우이신설선 ──
  "북한산우이_우이신설": { gate_in: true, gate_in_location: "★ 승강장에서 바로 진입", gate_out: false },
  "화계_우이신설": { gate_in: true, gate_in_location: "★ 신설동 방면 승강장에만 있음", gate_out: false },
  "성신여대입구_우이신설": { gate_in: true, gate_in_location: "4호선 구역으로 이동", gate_out: false, other_lines: [{ line: "4", direction: "4호선 구역 — 개찰구 안 화장실 있음" }] },
  "신설동_우이신설": { gate_in: true, gate_in_location: "대합실 개찰구 통과 후", gate_out: false },
  "보문_우이신설": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖", other_lines: [{ line: "6", direction: "6호선 환승통로 이동 후 화장실" }] },

  // ── GTX-A ──
  "수서_GTX-A": { gate_in: false, gate_out: true, gate_out_location: "수인분당선/3호선/SRT 구역 대합실 밖", other_lines: [{ line: "3", direction: "3호선 구역 화장실 이용 가능" }, { line: "수인분당", direction: "수인분당선 구역 화장실 이용 가능" }] },
  "성남_GTX-A": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },
  "동탄_GTX-A": { gate_in: false, gate_out: true, gate_out_location: "대합실 밖" },


};

const LINES = {
  "1": { color: "#0052A4", name: "1호선" },
  "2": { color: "#00A84D", name: "2호선" },
  "3": { color: "#EF7C1C", name: "3호선" },
  "4": { color: "#00A5DE", name: "4호선" },
  "5": { color: "#996CAC", name: "5호선" },
  "6": { color: "#CD7C2F", name: "6호선" },
  "7": { color: "#747F00", name: "7호선" },
  "8": { color: "#E6186C", name: "8호선" },
  "9": { color: "#BDB092", name: "9호선" },
  "수인분당": { color: "#F5A200", name: "수인·분당선" },
  "신분당": { color: "#D4003B", name: "신분당선" },
  "경의중앙": { color: "#77C4A3", name: "경의·중앙선" },
  "공항철도": { color: "#4682B4", name: "공항철도" },
  "김포골드": { color: "#AD8B3A", name: "김포골드라인" },
  "우이신설": { color: "#B0CE18", name: "우이신설선" },
  "서해": { color: "#8BC341", name: "서해선" },
  "GTX-A": { color: "#8B0087", name: "GTX-A" },
};

const LINE_STATIONS = {
  "1": ["소요산","동두천","보산","동두천중앙","지행","덕정","덕계","양주","녹양","가능","의정부","회룡","망월사","도봉산","도봉","방학","창동","녹천","월계","광운대","석계","신이문","외대앞","회기","청량리","제기동","신설동","동묘앞","동대문","종로5가","종로3가","종각","시청","서울역","남영","용산","노량진","대방","신길","영등포","신도림","구일","구로","가산디지털단지","독산","금천구청","석수","관악","안양","명학","금정","군포","당정","의왕","성균관대","화서","수원","세류","병점","세마","오산대","오산","진위","송탄","서정리","지제","평택","성환","직산","두정","천안","봉명","쌍용","아산","배방","온양온천","신창"],
  "2": ["시청","을지로입구","을지로3가","을지로4가","동대문역사문화공원","신당","상왕십리","왕십리","한양대","뚝섬","성수","건대입구","구의","강변","잠실나루","잠실","잠실새내","종합운동장","삼성","선릉","역삼","강남","교대","서초","방배","사당","낙성대","서울대입구","봉천","신림","신대방","구로디지털단지","대림","신도림","문래","영등포구청","당산","합정","홍대입구","신촌","이대","아현","충정로"],
  "3": ["대화","주엽","정발산","마두","백석","대곡","화정","원당","원흥","삼송","지축","구파발","연신내","불광","녹번","홍제","무악재","독립문","경복궁","안국","종로3가","을지로3가","충무로","동대입구","약수","금호","옥수","압구정","신사","잠원","고속터미널","교대","남부터미널","양재","매봉","도곡","대치","학여울","대청","일원","수서","가락시장","경찰병원","오금"],
  "4": ["당고개","상계","노원","창동","쌍문","수유","미아","미아사거리","길음","성신여대입구","한성대입구","혜화","동대문","동대문역사문화공원","충무로","명동","회현","서울역","숙대입구","삼각지","신용산","이촌","동작","총신대입구","사당","남태령","선바위","경마공원","대공원","과천","정부과천청사","인덕원","평촌","범계","금정","산본","수리산","대야미","반월","상록수","한대앞","중앙","고잔","초지","안산","신길온천","정왕","오이도"],
  "5": ["방화","개화산","김포공항","송정","마곡","발산","우장산","화곡","까치산","신정","목동","오목교","양평","영등포구청","영등포시장","신길","여의도","여의나루","마포","공덕","애오개","충정로","서대문","광화문","종로3가","을지로4가","동대문역사문화공원","청구","신금호","행당","왕십리","마장","답십리","장한평","군자","아차산","광나루","천호","강동","길동","굽은다리","명일","고덕","상일동","강일","미사","하남풍산","하남시청","하남검단산"],
  "6": ["응암","역촌","불광","독바위","연신내","구산","새절","증산","디지털미디어시티","월드컵경기장","마포구청","망원","합정","상수","광흥창","대흥","공덕","효창공원앞","삼각지","녹사평","이태원","한강진","버티고개","약수","청구","신당","동묘앞","창신","보문","안암","고려대","월곡","상월곡","돌곶이","석계","태릉입구","화랑대","봉화산","신내"],
  "7": ["장암","도봉산","수락산","마들","노원","중계","하계","공릉","태릉입구","먹골","중화","상봉","면목","사가정","용마산","중곡","군자","어린이대공원","건대입구","뚝섬유원지","청담","강남구청","학동","논현","반포","고속터미널","내방","이수","남성","숭실대입구","상도","장승배기","신대방삼거리","보라매","신풍","대림","남구로","가산디지털단지","철산","광명사거리","천왕","온수","부천종합운동장","춘의","신중동","부천시청","상동","삼산체육관","굴포천","부평구청"],
  "8": ["암사","천호","강동구청","몽촌토성","잠실","석촌","송파","가락시장","문정","장지","복정","산성","남위례","모란"],
  "9": ["개화","김포공항","공항시장","신방화","마곡나루","양천향교","가양","증미","등촌","염창","신목동","선유도","당산","국회의사당","여의도","샛강","노량진","노들","흑석","동작","구반포","신반포","고속터미널","사평","신논현","언주","선정릉","삼성중앙","봉은사","종합운동장","삼전","석촌고분","석촌","송파나루","한성백제","올림픽공원","둔촌오륜","중앙보훈병원"],
  "수인분당": ["수원","고색","오목천","어천","야목","사리","한대앞","중앙","고잔","초지","안산","신길온천","정왕","오이도","달월","월곶","소래포구","인천논현","호구포","남동인더스파크","원인재","연수","송도","인하대","숭의","신포","인천","수원","매탄권선","수원시청","매교","수원","화서","성균관대","의왕","당정","군포","금정","범계","평촌","인덕원","정부과천청사","과천","대공원","경마공원","선바위","남태령","사당","이수","총신대입구","동작","서빙고","한남","압구정로데오","강남구청","선정릉","선릉","구룡","개포동","대모산입구","수서","복정","모란","태평","신흥","수진","단대오거리","신구대","경원대","야탑","이매","서현","수내","정자","미금","오리","죽전","보정","구성","신갈","기흥","상갈","청명","영통","망포","매탄권선","수원시청","매교","수원"],
  "신분당": ["신사","논현","신논현","강남","양재","양재시민의숲","청계산입구","판교","정자","미금","동천","수지구청","성복","상현","광교중앙","광교"],
  "경의중앙": ["문산","운천","임진강","금촌","금릉","파주","야당","탄현","일산","풍산","백마","곡산","능곡","행신","강매","화전","수색","디지털미디어시티","가좌","신촌","서울역","청파","공덕","서강대","홍대입구","마포","신촌","용산","이촌","서빙고","한남","옥수","응봉","왕십리","청량리","회기","중랑","양원","구리","도농","양정","덕소","도심","팔당","운길산","양수","신원","국수","아신","오빈","양평","원덕","용문","지평"],
  "공항철도": ["인천공항2터미널","인천공항1터미널","공항화물청사","영종","운서","청라국제도시","검암","계양","김포공항","디지털미디어시티","홍대입구","공덕","서울역"],
  "김포골드": ["김포공항","고촌","풍무","사우","마산","장기","운양","걸포북변","김포시청","도시개발","양촌","가현","누산","통진","마송","봉하","걸포"],
  "우이신설": ["북한산우이","솔밭공원","4.19민주묘지","가오리","화계","삼양","삼양사거리","솔샘","북한산보국문","정릉","성신여대입구","보문","신설동"],
  "서해": ["일산","탄현","대곡","능곡","김포공항","원종","부천종합운동장","소사","시흥대야","신천","신현","시흥시청","시흥능곡","달미","선부","초지","안산","어천","야목","사리","원시","팔곡","고잔","중앙","한대앞"],
  "GTX-A": ["수서","성남","구성","동탄"],
};

// 전체 역 목록 (자동완성용)
const ALL_STATIONS = Object.entries(LINE_STATIONS).flatMap(([line, stations]) =>
  stations.map(s => ({ name: s, line }))
);
const UNIQUE_STATIONS = ALL_STATIONS.reduce((acc, cur) => {
  if (!acc.find(x => x.name === cur.name && x.line === cur.line)) acc.push(cur);
  return acc;
}, []);

function getToiletInfo(lineNum, stationName) {
  const key = `${stationName}_${lineNum}`;
  return TOILET_DB[key] || { gate_in: false, gate_out: true, gate_out_location: "대합실 내 (출구 방향)", other_lines: [] };
}
function getLineColor(lineNum) { return LINES[lineNum]?.color || "#888"; }
function getLineName(lineNum) { return LINES[lineNum]?.name || `${lineNum}호선`; }
// 노선별 방향 표기 (주요 거점역 기준)
const LINE_DIRECTION = {
  "1": { down: "신창 방향", up: "소요산 방향" },
  "2": { down: "성수·잠실 방향 (외선)", up: "시청·신도림 방향 (내선)" },
  "3": { down: "오금 방향", up: "대화 방향" },
  "4": { down: "오이도 방향", up: "당고개 방향" },
  "5": { down: "하남검단산·마천 방향", up: "방화 방향" },
  "6": { down: "신내 방향", up: "응암 방향" },
  "7": { down: "부평구청 방향", up: "장암 방향" },
  "8": { down: "모란 방향", up: "암사 방향" },
  "9": { down: "중앙보훈병원 방향", up: "개화 방향" },
  "수인분당": { down: "인천·수원 방향", up: "청량리 방향" },
  "신분당": { down: "광교 방향", up: "신사 방향" },
  "경의중앙": { down: "용문·지평 방향", up: "문산 방향" },
  "공항철도": { down: "인천공항2터미널 방향", up: "서울역 방향" },
  "김포골드": { down: "양촌 방향", up: "김포공항 방향" },
  "우이신설": { down: "신설동 방향", up: "북한산우이 방향" },
  "서해": { down: "일산 방향", up: "원시 방향" },
  "GTX-A": { down: "동탄 방향", up: "수서 방향" },
};

function getDirectionOptions(lineNum) {
  const s = LINE_STATIONS[lineNum];
  if (!s || s.length < 2) return [];
  const d = LINE_DIRECTION[lineNum];
  return [
    { value: "down", label: `▶ ${d ? d.down : s[s.length - 1] + " 방향"}` },
    { value: "up",   label: `◀ ${d ? d.up   : s[0] + " 방향"}` },
  ];
}
function findNearestGateInToilet(lineNum, currentStation, direction, skipCurrent = false) {
  const stations = LINE_STATIONS[lineNum];
  if (!stations) return null;
  const idx = stations.indexOf(currentStation);
  if (idx === -1) return null;
  const step = direction === "down" ? 1 : -1;
  // skipCurrent=true (탑승 중) 이면 현재 역 건너뛰고 다음 역부터 탐색
  const startIdx = skipCurrent ? idx + step : idx;
  for (let i = startIdx; i >= 0 && i < stations.length; i += step) {
    const info = getToiletInfo(lineNum, stations[i]);
    if (info.gate_in) return { station: stations[i], stops: Math.abs(i - idx), info };
  }
  for (let i = startIdx; i >= 0 && i < stations.length; i += step) {
    const info = getToiletInfo(lineNum, stations[i]);
    if (info.gate_out) return { station: stations[i], stops: Math.abs(i - idx), info, fallback: true };
  }
  return null;
}

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0c10; --surface: #12151c; --surface2: #1a1f2b;
    --border: rgba(255,255,255,0.07); --text: #e8eaf0; --text-dim: #7a8196;
    --accent: #4fffb0; --accent2: #00c8ff; --warn: #ff6b6b; --gold: #ffd166;
  }
  body { background: var(--bg); font-family: 'Noto Sans KR', sans-serif; color: var(--text); min-height: 100vh; }
  .app { max-width: 480px; margin: 0 auto; padding: 0 0 80px 0; }
  .header { padding: 28px 24px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg); z-index: 100; }
  .header-tag { font-size: 10px; letter-spacing: 3px; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-bottom: 6px; }
  .header-title { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
  .header-title span { color: var(--accent); }
  .header-sub { font-size: 12px; color: var(--text-dim); margin-top: 4px; }
  /* Steps */
  .steps { display: flex; align-items: center; padding: 14px 24px 0; }
  .step { display: flex; align-items: center; gap: 5px; font-size: 11px; font-family: 'JetBrains Mono', monospace; }
  .step-num { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
  .step.done .step-num { background: var(--accent); color: #0a0c10; }
  .step.active .step-num { background: var(--accent2); color: #0a0c10; }
  .step.pending .step-num { background: var(--surface2); color: var(--text-dim); }
  .step.done .step-label { color: var(--accent); }
  .step.active .step-label { color: var(--accent2); }
  .step.pending .step-label { color: var(--text-dim); }
  .step-arrow { color: var(--border); font-size: 10px; margin: 0 6px; }
  /* Search */
  .search-section { padding: 14px 24px; border-bottom: 1px solid var(--border); }
  .section-label { font-size: 10px; letter-spacing: 2px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; margin-bottom: 10px; text-transform: uppercase; }
  .search-wrap { position: relative; }
  .search-input { width: 100%; background: var(--surface2); border: 1.5px solid var(--border); border-radius: 12px; color: var(--text); font-family: 'Noto Sans KR', sans-serif; font-size: 15px; padding: 13px 44px 13px 16px; outline: none; transition: border-color 0.2s; }
  .search-input:focus { border-color: var(--accent); }
  .search-input::placeholder { color: var(--text-dim); font-size: 14px; }
  .search-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 17px; pointer-events: none; }
  .search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: var(--surface); border: 1px solid var(--border); border-radius: 50%; width: 22px; height: 22px; color: var(--text-dim); cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; }
  /* Dropdown */
  .dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: var(--surface); border: 1px solid rgba(79,255,176,0.2); border-radius: 12px; z-index: 999; max-height: 220px; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
  .dropdown-item { padding: 11px 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); transition: background 0.1s; }
  .dropdown-item:last-child { border-bottom: none; }
  .dropdown-item:hover, .dropdown-item.hi { background: var(--surface2); }
  .ac-name { font-size: 14px; font-weight: 600; }
  .ac-name em { color: var(--accent); font-style: normal; }
  .line-pill { border-radius: 5px; padding: 2px 7px; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; }
  /* Chip */
  .chip { display: flex; align-items: center; gap: 10px; background: rgba(79,255,176,0.06); border: 1px solid rgba(79,255,176,0.25); border-radius: 12px; padding: 11px 14px; margin-top: 10px; }
  .chip-name { font-size: 16px; font-weight: 700; flex: 1; }
  .chip-x { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 16px; padding: 2px 4px; }
  /* Mode */
  .mode-section { padding: 14px 24px; border-bottom: 1px solid var(--border); }
  .mode-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .mode-btn { padding: 13px 6px; border-radius: 11px; border: 1.5px solid var(--border); background: var(--surface2); color: var(--text-dim); cursor: pointer; font-family: 'Noto Sans KR', sans-serif; font-size: 12px; font-weight: 500; text-align: center; transition: all 0.18s; }
  .mode-icon { font-size: 22px; display: block; margin-bottom: 4px; }
  .mode-desc { font-size: 10px; color: var(--text-dim); display: block; margin-top: 2px; }
  .mode-btn.active { border-color: var(--accent); background: rgba(79,255,176,0.07); color: var(--text); }
  .mode-btn.active .mode-desc { color: var(--accent); }
  .mode-btn:hover:not(.active) { border-color: rgba(255,255,255,0.15); color: var(--text); }
  /* Dir */
  .dir-section { padding: 12px 24px; border-bottom: 1px solid var(--border); }
  .dir-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .dir-btn { padding: 11px 8px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--surface2); color: var(--text-dim); cursor: pointer; font-family: 'Noto Sans KR', sans-serif; font-size: 12px; text-align: center; transition: all 0.15s; }
  .dir-btn.active { border-color: var(--accent2); background: rgba(0,200,255,0.07); color: var(--text); }
  /* CTA */
  .cta-section { padding: 14px 24px; }
  .btn-primary { width: 100%; padding: 15px; background: var(--accent); color: #0a0c10; border: none; border-radius: 12px; font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.15s; }
  .btn-primary:hover { background: #3de89e; transform: translateY(-1px); }
  .btn-primary:disabled { background: var(--surface2); color: var(--text-dim); cursor: not-allowed; transform: none; }
  /* Results */
  .result-section { padding: 18px 24px; }
  .result-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; animation: slideUp 0.28s ease; margin-bottom: 12px; }
  @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .result-header { padding: 13px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 9px; }
  .result-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .result-header-text { font-size: 12px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }
  .result-body { padding: 16px 18px; }
  .found-station { font-size: 26px; font-weight: 900; letter-spacing: -1px; margin-bottom: 3px; }
  .station-suffix { font-size: 17px; font-weight: 500; color: var(--text); }
  .status-badge { display: inline-flex; align-items: center; gap: 5px; border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600; margin-bottom: 12px; margin-top: 5px; }
  .badge-green { background: rgba(79,255,176,0.1); border: 1px solid rgba(79,255,176,0.3); color: var(--accent); }
  .badge-gold  { background: rgba(255,209,102,0.1); border: 1px solid rgba(255,209,102,0.3); color: var(--gold); }
  .badge-red   { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); color: var(--warn); }
  .instruction-list { list-style: none; display: flex; flex-direction: column; gap: 9px; }
  .instruction-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; line-height: 1.55; }
  .inst-num { width: 21px; height: 21px; border-radius: 50%; background: var(--surface2); color: var(--accent); font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .location-box { margin-top: 12px; padding: 11px 13px; background: rgba(0,200,255,0.05); border: 1px solid rgba(0,200,255,0.2); border-radius: 9px; font-size: 13px; color: var(--accent2); display: flex; gap: 8px; }
  .note-box { margin-top: 9px; padding: 9px 13px; background: rgba(255,209,102,0.07); border: 1px solid rgba(255,209,102,0.2); border-radius: 8px; font-size: 12px; color: var(--gold); display: flex; gap: 7px; }
  .other-lines-title { font-size: 10px; letter-spacing: 1.5px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; margin-bottom: 7px; text-transform: uppercase; }
  .other-line-item { display: flex; align-items: flex-start; gap: 9px; padding: 9px 11px; background: var(--surface2); border-radius: 9px; margin-bottom: 6px; font-size: 12px; }
  .line-badge { display: inline-flex; align-items: center; border-radius: 5px; padding: 2px 7px; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; }
  .reset-btn { width: 100%; padding: 12px; background: none; border: 1px solid var(--border); border-radius: 12px; color: var(--text-dim); cursor: pointer; font-family: 'Noto Sans KR', sans-serif; font-size: 13px; transition: all 0.15s; }
  .reset-btn:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
  .tips-section { padding: 0 24px 20px; }
  .tip-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; margin-top: 10px; }
  .tip-title { font-size: 10px; letter-spacing: 2px; color: var(--accent2); font-family: 'JetBrains Mono', monospace; margin-bottom: 10px; text-transform: uppercase; }
  .tip-item { display: flex; gap: 8px; font-size: 12px; color: var(--text-dim); line-height: 1.5; margin-bottom: 7px; }
  .tip-item:last-child { margin-bottom: 0; }
  .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: var(--bg); border-top: 1px solid var(--border); padding: 10px 24px; display: flex; justify-content: space-around; }
  .nav-btn { background: none; border: none; color: var(--text-dim); font-family: 'Noto Sans KR', sans-serif; font-size: 11px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 4px 16px; border-radius: 8px; }
  .nav-btn.active { color: var(--accent); }
  .nav-btn .nav-icon { font-size: 20px; }
  .dropdown::-webkit-scrollbar { width: 4px; }
  .dropdown::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
`;


export default function App() {
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [hiIdx, setHiIdx] = useState(-1);
  const [selected, setSelected] = useState(null); // { name, line }
  const [mode, setMode] = useState(null); // "outside"|"concourse"|"onboard"
  const [direction, setDirection] = useState("down");
  const [result, setResult] = useState(null);

  // 검색어 기반 자동완성 목록
  const suggestions = query.trim().length > 0 && !selected
    ? UNIQUE_STATIONS.filter(s => s.name.includes(query.trim())).slice(0, 8)
    : [];

  const pickStation = (s) => {
    setSelected(s);
    setQuery(s.name);
    setShowDrop(false);
    setHiIdx(-1);
    setMode(null);
    setResult(null);
  };

  const clearStation = () => {
    setSelected(null);
    setQuery("");
    setShowDrop(false);
    setMode(null);
    setResult(null);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setSelected(null);
    setShowDrop(true);
    setHiIdx(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDrop || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHiIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHiIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && hiIdx >= 0) pickStation(suggestions[hiIdx]);
    if (e.key === "Escape") setShowDrop(false);
  };

  const handleSearch = () => {
    if (!selected || !mode) return;
    const { name, line } = selected;
    const info = getToiletInfo(line, name);
    if (mode === "outside") {
      setResult({ mode: "outside", station: name, lineNum: line, info });
    } else if (mode === "concourse") {
      setResult({ mode: "concourse", station: name, lineNum: line, info });
    } else {
      const found = findNearestGateInToilet(line, name, direction, true);
      setResult({ mode: "onboard", station: name, lineNum: line, direction, found });
    }
  };

  const reset = () => { setResult(null); setMode(null); };

  const dirOptions = selected ? getDirectionOptions(selected.line) : [];
  const step = !selected ? 1 : !mode ? 2 : 3;

  // 검색어 하이라이트
  const highlight = (text, q) => {
    if (!q) return text;
    const i = text.indexOf(q);
    if (i === -1) return text;
    return <><span>{text.slice(0, i)}</span><em>{text.slice(i, i + q.length)}</em><span>{text.slice(i + q.length)}</span></>;
  };

  const ResultCard = ({ children, dotColor, label }) => (
    <div className="result-card">
      <div className="result-header">
        <div className="result-dot" style={{ background: dotColor }} />
        <div className="result-header-text">{label}</div>
      </div>
      <div className="result-body">{children}</div>
    </div>
  );

  const OtherLines = ({ lines }) => lines?.length > 0 ? (
    <div className="result-card">
      <div className="result-header">
        <div className="result-dot" style={{ background: "var(--accent2)" }} />
        <div className="result-header-text">같은 역 다른 호선 화장실</div>
      </div>
      <div className="result-body">
        <div className="other-lines-title">환승 통로로 이동 가능</div>
        {lines.map((ol, i) => (
          <div key={i} className="other-line-item">
            <span className="line-badge" style={{ background: getLineColor(ol.line) }}>{getLineName(ol.line)}</span>
            <span style={{ color: "var(--text-dim)", lineHeight: 1.5 }}>{ol.direction}</span>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">

        {/* Header */}
        <div className="header">
          <div className="header-tag">🚇 Seoul Metro</div>
          <div className="header-title">지하철 <span>화장실</span> 안내</div>
          <div className="header-sub">추가 과금 없이 갈 수 있는 가장 가까운 화장실</div>
        </div>

        {tab === "search" && !result && (
          <>
            {/* Step indicator */}
            <div className="steps">
              <div className={`step ${step > 1 ? "done" : "active"}`}>
                <div className="step-num">{step > 1 ? "✓" : "1"}</div>
                <span className="step-label">역 선택</span>
              </div>
              <span className="step-arrow">›</span>
              <div className={`step ${step > 2 ? "done" : step === 2 ? "active" : "pending"}`}>
                <div className="step-num">{step > 2 ? "✓" : "2"}</div>
                <span className="step-label">상태 선택</span>
              </div>
              <span className="step-arrow">›</span>
              <div className={`step ${step === 3 ? "active" : "pending"}`}>
                <div className="step-num">3</div>
                <span className="step-label">결과 확인</span>
              </div>
            </div>

            {/* STEP 1: 역 검색 */}
            <div className="search-section">
              <div className="section-label">STEP 1 — 역 검색</div>
              <div className="search-wrap">
                <input
                  className="search-input"
                  type="text"
                  placeholder="역 이름을 입력하세요 (예: 강남, 홍대...)"
                  value={query}
                  onChange={handleQueryChange}
                  onFocus={() => query && setShowDrop(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {query
                  ? <button className="search-clear" onClick={clearStation}>✕</button>
                  : <span className="search-icon">🔍</span>
                }

                {/* 자동완성 드롭다운 */}
                {showDrop && suggestions.length > 0 && (
                  <div className="dropdown">
                    {suggestions.map((s, i) => (
                      <div
                        key={`${s.name}_${s.line}`}
                        className={`dropdown-item ${i === hiIdx ? "hi" : ""}`}
                        onMouseDown={(e) => { e.preventDefault(); pickStation(s); }}
                      >
                        <span className="line-pill" style={{ background: getLineColor(s.line) }}>
                          {getLineName(s.line)}
                        </span>
                        <span className="ac-name">{highlight(s.name, query.trim())}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 선택된 역 chip */}
              {selected && (
                <div className="chip">
                  <span className="line-pill" style={{ background: getLineColor(selected.line) }}>
                    {getLineName(selected.line)}
                  </span>
                  <span className="chip-name">{selected.name}역</span>
                  <button className="chip-x" onClick={clearStation}>✕</button>
                </div>
              )}
            </div>

            {/* STEP 2: 상태 선택 */}
            {selected && (
              <div className="mode-section">
                <div className="section-label">STEP 2 — 지금 어디 계세요?</div>
                <div className="mode-grid">
                  <button className={`mode-btn ${mode === "outside" ? "active" : ""}`} onClick={() => setMode("outside")}>
                    <span className="mode-icon">🚶</span>
                    개찰구 밖
                    <span className="mode-desc">하차 후 / 미탑승</span>
                  </button>
                  <button className={`mode-btn ${mode === "concourse" ? "active" : ""}`} onClick={() => setMode("concourse")}>
                    <span className="mode-icon">🎫</span>
                    개찰구 안
                    <span className="mode-desc">대합실 안에 있음</span>
                  </button>
                  <button className={`mode-btn ${mode === "onboard" ? "active" : ""}`} onClick={() => setMode("onboard")}>
                    <span className="mode-icon">🚇</span>
                    탑승 중
                    <span className="mode-desc">열차 안에 있음</span>
                  </button>
                </div>
              </div>
            )}

            {/* 방향 선택 (탑승중만) */}
            {selected && mode === "onboard" && (
              <div className="dir-section">
                <div className="section-label">방향 선택</div>
                <div className="dir-grid">
                  {dirOptions.map(o => (
                    <button key={o.value} className={`dir-btn ${direction === o.value ? "active" : ""}`} onClick={() => setDirection(o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {selected && mode && (
              <div className="cta-section">
                <button className="btn-primary" onClick={handleSearch}>
                  🚽 화장실 찾기
                </button>
              </div>
            )}

            {/* 팁 */}
            {!selected && (
              <div className="tips-section" style={{ paddingTop: 16 }}>
                <div className="tip-card">
                  <div className="tip-title">알아두면 유용한 정보</div>
                  <div className="tip-item"><span>⏱</span><span>서울교통공사 구간 하차 후 <strong>15분 이내 재승차</strong> 시 추가 요금 없음</span></div>
                  <div className="tip-item"><span>🚪</span><span>개찰구 안 화장실 = 탑승 중 무료 / 개찰구 밖 = 15분 규정 적용</span></div>
                  <div className="tip-item"><span>🔄</span><span>환승역은 다른 호선 구역 화장실도 이용 가능</span></div>
                  <div className="tip-item"><span>🆘</span><span>급할 땐 개찰구 옆 <strong>비상게이트 버튼</strong>으로 역무원 요청</span></div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── 결과 ── */}
        {tab === "search" && result && (
          <div className="result-section">

            {/* 개찰구 밖 */}
            {result.mode === "outside" && (() => {
              const { info, station, lineNum: ln } = result;
              return (<>
                <ResultCard
                  dotColor={info.gate_out ? "var(--accent)" : "var(--warn)"}
                  label={<><span className="line-badge" style={{ background: getLineColor(ln), marginRight: 6 }}>{getLineName(ln)}</span>{station}역 — 개찰구 밖</>}
                >
                  <div className="found-station" style={{ color: info.gate_out ? "var(--accent)" : "var(--warn)" }}>
                    {station}<span className="station-suffix">역</span>
                  </div>
                  {info.gate_out ? (<>
                    <div className="status-badge badge-green">✅ 개찰구 밖 화장실 있음</div>
                    <ul className="instruction-list">
                      <li className="instruction-item"><span className="inst-num">1</span><span>개찰구를 나온 뒤 아래 위치로 이동</span></li>
                    </ul>
                    {info.gate_out_location && <div className="location-box"><span>📍</span><span><strong>위치:</strong> {info.gate_out_location}</span></div>}
                  </>) : (<>
                    <div className="status-badge badge-red">❌ 개찰구 밖 화장실 없음</div>
                    {info.gate_in && <div className="note-box"><span>💡</span><span>개찰구 안에만 화장실 있음 — 승차 후 이용 또는 역무원 문의</span></div>}
                  </>)}
                </ResultCard>
                <OtherLines lines={info.other_lines} />
              </>);
            })()}

            {/* 개찰구 안 */}
            {result.mode === "concourse" && (() => {
              const { info, station, lineNum: ln } = result;
              return (<>
                <ResultCard
                  dotColor={info.gate_in ? "var(--accent)" : "var(--warn)"}
                  label={<><span className="line-badge" style={{ background: getLineColor(ln), marginRight: 6 }}>{getLineName(ln)}</span>{station}역 — 개찰구 안</>}
                >
                  <div className="found-station" style={{ color: info.gate_in ? "var(--accent)" : "var(--warn)" }}>
                    {station}<span className="station-suffix">역</span>
                  </div>
                  {info.gate_in ? (<>
                    <div className="status-badge badge-green">✅ 개찰구 안 화장실 있음</div>
                    <ul className="instruction-list">
                      <li className="instruction-item"><span className="inst-num">1</span><span>현재 위치에서 아래 위치로 이동</span></li>
                    </ul>
                    {info.gate_in_location && <div className="location-box"><span>📍</span><span><strong>위치:</strong> {info.gate_in_location}</span></div>}
                  </>) : (<>
                    <div className="status-badge badge-red">❌ 개찰구 안 화장실 없음</div>
                    {info.gate_out && <div className="note-box"><span>💡</span><span>개찰구 밖에 화장실 있음 — 나가서 이용 후 15분 내 재승차</span></div>}
                  </>)}
                </ResultCard>
                <OtherLines lines={info.other_lines} />
              </>);
            })()}

            {/* 탑승 중 */}
            {result.mode === "onboard" && (() => {
              const { found, direction: dir, lineNum: ln, station: cur } = result;
              if (!found) return (
                <div className="result-card">
                  <div className="result-body" style={{ textAlign: "center", padding: 28 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>😓</div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>해당 방향에 화장실 있는 역이 없습니다</div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)" }}>반대 방향도 확인해보세요.</div>
                  </div>
                </div>
              );
              const isFree = !found.fallback;
              // 탑승 중이므로 stops=0이어도 "지금 막 지나쳤거나 다음 정차" → 항상 "내려서" 안내
              const isNext = found.stops <= 1;
              return (
                <ResultCard
                  dotColor={isFree ? "var(--accent)" : "var(--gold)"}
                  label={isFree
                    ? `🚇 ${found.stops === 0 ? "지금 이 역" : found.stops + "정거장 후"} — 개찰구 안 화장실 (무료)`
                    : `🚇 ${found.stops === 0 ? "지금 이 역" : found.stops + "정거장 후"} — 개찰구 밖 (하차 필요)`}
                >
                  <div className="found-station" style={{ color: isFree ? "var(--accent)" : getLineColor(ln) }}>
                    {found.station}<span className="station-suffix">역</span>
                  </div>
                  <div className={`status-badge ${isFree ? "badge-green" : "badge-gold"}`}>
                    {found.stops === 0 ? "⚡ 지금 즉시 하차" : `🚇 ${found.stops}정거장 후 하차`}
                    {" — "}
                    {isFree ? "추가 과금 없음 ✅" : "15분 내 재승차 ⚠️"}
                  </div>

                  <ul className="instruction-list">
                    {found.stops === 0 ? (<>
                      <li className="instruction-item"><span className="inst-num">1</span>
                        <span>🔔 <strong>지금 바로 내리세요!</strong> 현재 정차 중인 <strong>{found.station}역</strong></span>
                      </li>
                      {isFree ? (<>
                        <li className="instruction-item"><span className="inst-num">2</span>
                          <span>승강장 내 개찰구 안 화장실 이용</span>
                        </li>
                        <li className="instruction-item"><span className="inst-num">3</span>
                          <span>다음 열차 탑승 — <strong>추가 과금 없음</strong></span>
                        </li>
                      </>) : (<>
                        <li className="instruction-item"><span className="inst-num">2</span>
                          <span>개찰구 밖으로 나가서 화장실 이용</span>
                        </li>
                        <li className="instruction-item"><span className="inst-num">3</span>
                          <span><strong>15분 이내 재승차</strong> 시 추가 요금 없음</span>
                        </li>
                      </>)}
                    </>) : (<>
                      <li className="instruction-item"><span className="inst-num">1</span>
                        <span>현재 방향으로 <strong>{found.stops}정거장</strong> 더 이동</span>
                      </li>
                      <li className="instruction-item"><span className="inst-num">2</span>
                        <span><strong>{found.station}역</strong> 도착 시 하차</span>
                      </li>
                      {isFree ? (<>
                        <li className="instruction-item"><span className="inst-num">3</span>
                          <span>승강장 내 개찰구 안 화장실 이용</span>
                        </li>
                        <li className="instruction-item"><span className="inst-num">4</span>
                          <span>다음 열차 탑승 — <strong>추가 과금 없음</strong></span>
                        </li>
                      </>) : (<>
                        <li className="instruction-item"><span className="inst-num">3</span>
                          <span>개찰구 밖 화장실 이용</span>
                        </li>
                        <li className="instruction-item"><span className="inst-num">4</span>
                          <span><strong>15분 이내 재승차</strong> 시 추가 요금 없음</span>
                        </li>
                      </>)}
                    </>)}
                  </ul>

                  {isFree && found.info.gate_in_location && <div className="location-box"><span>📍</span><span><strong>개찰구 안 위치:</strong> {found.info.gate_in_location}</span></div>}
                  {!isFree && found.info.gate_out_location && <div className="location-box"><span>📍</span><span><strong>개찰구 밖 위치:</strong> {found.info.gate_out_location}</span></div>}
                  {found.info.other_lines?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div className="other-lines-title">이 역 환승 화장실</div>
                      {found.info.other_lines.map((ol, i) => (
                        <div key={i} className="other-line-item">
                          <span className="line-badge" style={{ background: getLineColor(ol.line) }}>{getLineName(ol.line)}</span>
                          <span style={{ color: "var(--text-dim)", lineHeight: 1.5 }}>{ol.direction}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </ResultCard>
              );
            })()}

            <button className="reset-btn" onClick={reset}>↩ 다시 검색</button>
          </div>
        )}

        {/* 앱 정보 */}
        {tab === "info" && (
          <div className="result-section">
            <div className="tip-card">
              <div className="tip-title">📊 데이터 출처</div>
              <div className="tip-item"><span>🏛</span><span>공공데이터포털 (data.go.kr)</span></div>
              <div className="tip-item"><span>🗂</span><span>서울 열린데이터광장</span></div>
              <div className="tip-item"><span>🚇</span><span>서울교통공사 공식 노선도</span></div>
            </div>
            <div className="tip-card" style={{ marginTop: 10 }}>
              <div className="tip-title">🚀 향후 개발 방향</div>
              <div className="tip-item"><span>📍</span><span>GPS 기반 현재 위치 자동 감지</span></div>
              <div className="tip-item"><span>♿</span><span>장애인 화장실 별도 표시</span></div>
              <div className="tip-item"><span>🔴</span><span>실시간 혼잡도 연동</span></div>
              <div className="tip-item"><span>🌐</span><span>9호선·경의중앙선·수인분당선 확대</span></div>
            </div>
          </div>
        )}

        <div className="bottom-nav">
          <button className={`nav-btn ${tab === "search" ? "active" : ""}`} onClick={() => { setTab("search"); reset(); }}>
            <span className="nav-icon">🔍</span><span>재탐색</span>
          </button>
          <button className={`nav-btn ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")}>
            <span className="nav-icon">ℹ️</span><span>앱 정보</span>
          </button>
        </div>
      </div>
    </>
  );
}
