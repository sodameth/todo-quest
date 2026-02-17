export const ITEM_POOL = [
  { id: "potion_s", name: "작은 포션", desc: "HP 30 회복", emoji: "🧪", type: "consumable", rarity: "common", effect: { heal: 30 } },
  { id: "potion_m", name: "중간 포션", desc: "HP 80 회복", emoji: "🧴", type: "consumable", rarity: "uncommon", effect: { heal: 80 } },
  { id: "potion_l", name: "큰 포션", desc: "HP 200 회복", emoji: "⚗️", type: "consumable", rarity: "rare", effect: { heal: 200 } },
  { id: "sword_1", name: "날카로운 검", desc: "공격력 +5", emoji: "🗡️", type: "equip_atk", rarity: "common", effect: { atk: 5 } },
  { id: "sword_2", name: "마법검", desc: "공격력 +12", emoji: "⚔️", type: "equip_atk", rarity: "uncommon", effect: { atk: 12 } },
  { id: "sword_3", name: "용살검", desc: "공격력 +25", emoji: "🔱", type: "equip_atk", rarity: "rare", effect: { atk: 25 } },
  { id: "shield_1", name: "나무 방패", desc: "방어력 +3", emoji: "🪵", type: "equip_def", rarity: "common", effect: { def: 3 } },
  { id: "shield_2", name: "강철 방패", desc: "방어력 +8", emoji: "🛡️", type: "equip_def", rarity: "uncommon", effect: { def: 8 } },
  { id: "shield_3", name: "드래곤 방패", desc: "방어력 +18", emoji: "🔰", type: "equip_def", rarity: "rare", effect: { def: 18 } },
  { id: "xp_book", name: "경험의 서", desc: "XP 50 즉시 획득", emoji: "📖", type: "consumable", rarity: "uncommon", effect: { xp: 50 } },
];

export const RARITY_COLOR = {
  common: "#9ca3af",
  uncommon: "#60a5fa",
  rare: "#a78bfa",
  legendary: "#fbbf24",
};

export function rollLoot(stage) {
  const count = 1 + (Math.random() < 0.3 ? 1 : 0);
  const items = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    const pool = r < 0.15
      ? ITEM_POOL.filter(x => x.rarity === "rare")
      : r < 0.45
        ? ITEM_POOL.filter(x => x.rarity === "uncommon")
        : ITEM_POOL.filter(x => x.rarity === "common");
    items.push({
      ...pool[Math.floor(Math.random() * pool.length)],
      uid: `loot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${i}`,
    });
  }
  return items;
}
