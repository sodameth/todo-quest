export const DIFFICULTY = {
  easy: { label: '쉬움', xp: 20, color: '#4ade80', emoji: '⭐', heal: 15 },
  medium: { label: '보통', xp: 50, color: '#facc15', emoji: '⭐⭐', heal: 30 },
  hard: { label: '어려움', xp: 100, color: '#f87171', emoji: '⭐⭐⭐', heal: 50 },
} as const;

export type DifficultyKey = keyof typeof DIFFICULTY;
export type RepeatType = 'none' | 'daily' | 'weekly';

export const LEVEL_XP = (lv: number) => lv * 80 + 40;

export const DRAGON_STAGES = [
  { name: '아기 드래곤', hp: 100, atk: 5, desc: '작지만 불꽃을 뿜는다!', color: '#6ee7b7', bodyColor: '#34d399', eyeColor: '#fbbf24', wingColor: '#6ee7b7', size: 0.55 },
  { name: '청년 드래곤', hp: 250, atk: 12, desc: '날개가 자라기 시작했다.', color: '#60a5fa', bodyColor: '#3b82f6', eyeColor: '#f87171', wingColor: '#93c5fd', size: 0.7 },
  { name: '성체 드래곤', hp: 500, atk: 25, desc: '하늘을 뒤덮는 거대한 존재.', color: '#f87171', bodyColor: '#ef4444', eyeColor: '#fbbf24', wingColor: '#fca5a5', size: 0.85 },
  { name: '고대 드래곤', hp: 1000, atk: 40, desc: '전설 속의 최종 보스.', color: '#a78bfa', bodyColor: '#7c3aed', eyeColor: '#f87171', wingColor: '#c4b5fd', size: 0.95 },
  { name: '어둠의 드래곤왕', hp: 2000, atk: 70, desc: '세계를 멸망시키려 한다!', color: '#f59e0b', bodyColor: '#1a1a2e', eyeColor: '#ef4444', wingColor: '#374151', size: 1.0 },
];

export const HERO_TITLES = [
  '초보 모험가', '견습 전사', '숙련된 검사', '정예 기사', '영웅',
  '전설의 용사', '신화의 전사', '드래곤 슬레이어', '세계의 수호자', '불멸의 영웅',
];

export const getHeroTitle = (lv: number) =>
  HERO_TITLES[Math.min(Math.floor((lv - 1) / 3), HERO_TITLES.length - 1)];

export const getHeroStats = (lv: number) => ({
  maxHp: 80 + lv * 20,
  atk: 8 + lv * 4,
  def: 3 + lv * 2,
});

export const getHeroTier = (lv: number) => {
  if (lv <= 2) return 0;
  if (lv <= 5) return 1;
  if (lv <= 9) return 2;
  if (lv <= 15) return 3;
  return 4;
};

export const HERO_TIERS = [
  { armor: '#8B7355', weapon: '#999', cape: null, aura: null, helmet: false, shield: false, label: '천옷' },
  { armor: '#6B8E6B', weapon: '#B8B8B8', cape: '#5C7A5C', aura: null, helmet: false, shield: true, label: '가죽' },
  { armor: '#4682B4', weapon: '#E8E8E8', cape: '#1E3A5F', aura: null, helmet: true, shield: true, label: '강철' },
  { armor: '#DAA520', weapon: '#FFD700', cape: '#8B0000', aura: '#FFD70044', helmet: true, shield: true, label: '황금' },
  { armor: '#E8E8FF', weapon: '#FF6B6B', cape: '#6B0099', aura: '#E8E8FF55', helmet: true, shield: true, label: '전설' },
];

export const DEADLINE_PRESETS = [
  { label: '30분', min: 30 },
  { label: '1시간', min: 60 },
  { label: '2시간', min: 120 },
  { label: '3시간', min: 180 },
  { label: '6시간', min: 360 },
  { label: '12시간', min: 720 },
  { label: '24시간', min: 1440 },
];

export const CAT_COLORS = [
  '#60a5fa', '#a78bfa', '#4ade80', '#fbbf24', '#f87171',
  '#f97316', '#ec4899', '#14b8a6', '#e879f9', '#84cc16',
];

export const CAT_EMOJIS = [
  '📌', '💼', '📚', '💪', '🏠', '🎨', '🎵', '🍽️', '🛒', '🏃',
  '💻', '✈️', '🎯', '🔧', '📱', '🌱', '🐾', '❤️', '🧹', '💰',
];

export const formatCountdown = (ms: number): string | null => {
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}시간 ${m}분 ${sec}초`;
  if (m > 0) return `${m}분 ${sec}초`;
  return `${sec}초`;
};

export const SKILLS = [
  { id: 'heal', name: '치유', desc: 'HP 25% 회복', emoji: '💚', unlock: 2, cooldown: 3, color: '#4ade80' },
  { id: 'crit', name: '치명타', desc: '다음 공격 2.5배', emoji: '⚡', unlock: 4, cooldown: 4, color: '#fbbf24' },
  { id: 'shield', name: '방어막', desc: '다음 피격 데미지 80% 감소', emoji: '🛡️', unlock: 6, cooldown: 5, color: '#60a5fa' },
  { id: 'fury', name: '분노', desc: '3턴간 공격력 2배', emoji: '🔥', unlock: 9, cooldown: 6, color: '#ef4444' },
];

export const ITEM_POOL = [
  { id: 'potion_s', name: '작은 포션', desc: 'HP 30 회복', emoji: '🧪', type: 'consumable', rarity: 'common', effect: { heal: 30 } },
  { id: 'potion_m', name: '중간 포션', desc: 'HP 80 회복', emoji: '🧴', type: 'consumable', rarity: 'uncommon', effect: { heal: 80 } },
  { id: 'potion_l', name: '큰 포션', desc: 'HP 200 회복', emoji: '⚗️', type: 'consumable', rarity: 'rare', effect: { heal: 200 } },
  { id: 'sword_1', name: '날카로운 검', desc: '공격력 +5', emoji: '🗡️', type: 'equip_atk', rarity: 'common', effect: { atk: 5 } },
  { id: 'sword_2', name: '마법검', desc: '공격력 +12', emoji: '⚔️', type: 'equip_atk', rarity: 'uncommon', effect: { atk: 12 } },
  { id: 'sword_3', name: '용살검', desc: '공격력 +25', emoji: '🔱', type: 'equip_atk', rarity: 'rare', effect: { atk: 25 } },
  { id: 'shield_1', name: '나무 방패', desc: '방어력 +3', emoji: '🪵', type: 'equip_def', rarity: 'common', effect: { def: 3 } },
  { id: 'shield_2', name: '강철 방패', desc: '방어력 +8', emoji: '🛡️', type: 'equip_def', rarity: 'uncommon', effect: { def: 8 } },
  { id: 'shield_3', name: '드래곤 방패', desc: '방어력 +18', emoji: '🔰', type: 'equip_def', rarity: 'rare', effect: { def: 18 } },
  { id: 'xp_book', name: '경험의 서', desc: 'XP 50 즉시 획득', emoji: '📖', type: 'consumable', rarity: 'uncommon', effect: { xp: 50 } },
];

export const RARITY_COLOR: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#60a5fa',
  rare: '#a78bfa',
  legendary: '#fbbf24',
};

export const rollLoot = (stage: number) => {
  const count = 1 + (Math.random() < 0.3 ? 1 : 0);
  const items = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    const pool = r < 0.15
      ? ITEM_POOL.filter(x => x.rarity === 'rare')
      : r < 0.45
        ? ITEM_POOL.filter(x => x.rarity === 'uncommon')
        : ITEM_POOL.filter(x => x.rarity === 'common');
    items.push({
      ...pool[Math.floor(Math.random() * pool.length)],
      uid: `loot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${i}`,
    });
  }
  return items;
};

export const ACHIEVEMENTS = [
  { id: 'first_quest', name: '첫 발걸음', desc: '첫 번째 퀘스트 완료', emoji: '🌱', check: (s: any) => s.completedCount >= 1 },
  { id: 'quest_10', name: '모험가', desc: '퀘스트 10개 완료', emoji: '📋', check: (s: any) => s.completedCount >= 10 },
  { id: 'quest_50', name: '퀘스트 마스터', desc: '퀘스트 50개 완료', emoji: '📜', check: (s: any) => s.completedCount >= 50 },
  { id: 'first_kill', name: '드래곤 헌터', desc: '첫 드래곤 처치', emoji: '🐉', check: (s: any) => s.dragonsKilled >= 1 },
  { id: 'kill_5', name: '드래곤 슬레이어', desc: '드래곤 5마리 처치', emoji: '🔥', check: (s: any) => s.dragonsKilled >= 5 },
  { id: 'combo_3', name: '연속 달성!', desc: '3 콤보 달성', emoji: '🔥', check: (s: any) => s.maxCombo >= 3 },
  { id: 'combo_10', name: '콤보 마스터', desc: '10 콤보 달성', emoji: '💥', check: (s: any) => s.maxCombo >= 10 },
  { id: 'level_5', name: '성장하는 전사', desc: '레벨 5 달성', emoji: '⬆️', check: (s: any) => s.level >= 5 },
  { id: 'level_10', name: '베테랑', desc: '레벨 10 달성', emoji: '🏅', check: (s: any) => s.level >= 10 },
  { id: 'ontime_5', name: '시간 엄수', desc: '시간 내 완료 5회', emoji: '⏰', check: (s: any) => s.onTimeCount >= 5 },
  { id: 'hard_3', name: '도전자', desc: '어려움 퀘스트 3개 완료', emoji: '💪', check: (s: any) => s.hardCount >= 3 },
  { id: 'daily_3', name: '일일 미션 수행자', desc: '일일 퀘스트 3회 완료', emoji: '🎯', check: (s: any) => s.dailyCompleted >= 3 },
  { id: 'pet_first', name: '동물 친구', desc: '첫 펫 획득', emoji: '🐾', check: (s: any) => s.petCount >= 1 },
];

export const PET_POOL = [
  { id: 'cat', name: '고양이', emoji: '🐱', skill: '치유의 야옹', desc: '매 턴 HP 5 회복', effect: { healPerTurn: 5 }, color: '#fbbf24' },
  { id: 'wolf', name: '늑대', emoji: '🐺', skill: '공격 지원', desc: '매 공격 시 추가 데미지 +8', effect: { bonusDmg: 8 }, color: '#94a3b8' },
  { id: 'owl', name: '올빼미', emoji: '🦉', skill: '지혜의 눈', desc: 'XP 획득량 20% 증가', effect: { xpBonus: 0.2 }, color: '#a78bfa' },
  { id: 'phoenix', name: '불사조', emoji: '🐦‍🔥', skill: '부활의 불꽃', desc: 'HP 0 시 1회 50%로 부활', effect: { revive: true }, color: '#ef4444' },
  { id: 'turtle', name: '거북이', emoji: '🐢', skill: '단단한 등껍질', desc: '받는 데미지 30% 감소', effect: { dmgReduce: 0.3 }, color: '#4ade80' },
  { id: 'dragon_baby', name: '아기 용', emoji: '🐲', skill: '용의 브레스', desc: '추가 데미지 +15 & HP 3 회복', effect: { bonusDmg: 15, healPerTurn: 3 }, color: '#f97316' },
];

export const generateDailyQuest = (seed: number) => {
  const quests = [
    { type: 'complete_any', target: 3, desc: '퀘스트 3개 완료하기', emoji: '📋', xp: 60, label: '아무 퀘스트 3개' },
    { type: 'complete_hard', target: 1, desc: '어려움 퀘스트 1개 완료하기', emoji: '💪', xp: 80, label: '어려움 1개' },
    { type: 'complete_ontime', target: 2, desc: '시간 내에 퀘스트 2개 완료하기', emoji: '⏰', xp: 70, label: '제시간에 2개' },
    { type: 'battle_win', target: 1, desc: '전투에서 1회 승리하기', emoji: '⚔️', xp: 50, label: '전투 1승' },
    { type: 'combo_reach', target: 3, desc: '3 콤보 달성하기', emoji: '🔥', xp: 60, label: '3 콤보' },
    { type: 'use_skill', target: 2, desc: '스킬 2회 사용하기', emoji: '⚡', xp: 40, label: '스킬 2회' },
  ];
  return { ...quests[seed % quests.length], progress: 0, completed: false, day: seed };
};

export const REPEAT_OPTIONS: { label: string; value: RepeatType }[] = [
  { label: '반복 없음', value: 'none' },
  { label: '매일 반복', value: 'daily' },
  { label: '매주 반복', value: 'weekly' },
];
