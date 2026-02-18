export const PET_POOL = [
  { id: "cat", name: "고양이", emoji: "🐱", skill: "치유의 야옹", desc: "매 턴 HP 5 회복", effect: { healPerTurn: 5 }, color: "#fbbf24" },
  { id: "wolf", name: "늑대", emoji: "🐺", skill: "공격 지원", desc: "매 공격 시 추가 데미지 +8", effect: { bonusDmg: 8 }, color: "#94a3b8" },
  { id: "owl", name: "올빼미", emoji: "🦉", skill: "지혜의 눈", desc: "XP 획득량 20% 증가", effect: { xpBonus: 0.2 }, color: "#a78bfa" },
  { id: "phoenix", name: "불사조", emoji: "🐦‍🔥", skill: "부활의 불꽃", desc: "HP 0 시 1회 50%로 부활", effect: { revive: true }, color: "#ef4444" },
  { id: "turtle", name: "거북이", emoji: "🐢", skill: "단단한 등껍질", desc: "받는 데미지 30% 감소", effect: { dmgReduce: 0.3 }, color: "#4ade80" },
  { id: "dragon_baby", name: "아기 용", emoji: "🐲", skill: "용의 브레스", desc: "추가 데미지 +15 & HP 3 회복", effect: { bonusDmg: 15, healPerTurn: 3 }, color: "#f97316" },
];
