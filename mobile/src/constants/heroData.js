export const HERO_TITLES = [
  "초보 모험가", "견습 전사", "숙련된 검사", "정예 기사", "영웅",
  "전설의 용사", "신화의 전사", "드래곤 슬레이어", "세계의 수호자", "불멸의 영웅",
];

export const HERO_TIERS = [
  { armor: "#8B7355", weapon: "#999", cape: null, aura: null, helmet: false, shield: false, label: "천옷" },
  { armor: "#6B8E6B", weapon: "#B8B8B8", cape: "#5C7A5C", aura: null, helmet: false, shield: true, label: "가죽" },
  { armor: "#4682B4", weapon: "#E8E8E8", cape: "#1E3A5F", aura: null, helmet: true, shield: true, label: "강철" },
  { armor: "#DAA520", weapon: "#FFD700", cape: "#8B0000", aura: "#FFD70044", helmet: true, shield: true, label: "황금" },
  { armor: "#E8E8FF", weapon: "#FF6B6B", cape: "#6B0099", aura: "#E8E8FF55", helmet: true, shield: true, label: "전설" },
];

export function getHeroTitle(lv) {
  return HERO_TITLES[Math.min(Math.floor((lv - 1) / 3), HERO_TITLES.length - 1)];
}

export function getHeroStats(lv) {
  return { maxHp: 80 + lv * 20, atk: 8 + lv * 4, def: 3 + lv * 2 };
}

export function getHeroTier(lv) {
  if (lv <= 2) return 0;
  if (lv <= 5) return 1;
  if (lv <= 9) return 2;
  if (lv <= 15) return 3;
  return 4;
}
