import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import {
  ACHIEVEMENTS,
  DIFFICULTY,
  DRAGON_STAGES,
  DifficultyKey,
  RepeatType,
  generateDailyQuest,
  getHeroStats,
  LEVEL_XP,
  PET_POOL,
  rollLoot,
  CAT_COLORS,
} from '../constants';
import { loadSave, writeSave, loadTheme, saveTheme } from '../storage';
import { darkTheme, lightTheme, Theme } from '../theme';

/* ─── Types ─── */
export interface Todo {
  id: number;
  text: string;
  difficulty: DifficultyKey;
  done: boolean;
  proofUri?: string | null;
  createdAt: number;
  deadline: number;
  deadlineMin: number;
  category: string | null;
  memo: string;
  repeat: RepeatType;
  nextRepeat?: number;
  notificationId?: string | null;
  completedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface HeroState {
  level: number;
  xp: number;
  hp: number;
}

export interface ItemType {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  type: string;
  rarity: string;
  effect: Record<string, number>;
  uid?: string;
}

interface GameContextValue {
  /* state */
  todos: Todo[];
  categories: Category[];
  hero: HeroState;
  dragonStage: number;
  dragonHp: number;
  completedCount: number;
  victoryDragons: number;
  combo: number;
  maxCombo: number;
  inventory: ItemType[];
  equipped: { atk: ItemType | null; def: ItemType | null };
  unlockedAch: string[];
  hardCount: number;
  onTimeCount: number;
  pets: typeof PET_POOL;
  activePet: (typeof PET_POOL)[0] | null;
  dailyQuest: ReturnType<typeof generateDailyQuest> & { progress: number; completed: boolean };
  dailyCompleted: number;
  dragonsKilled: number;
  skillCooldowns: Record<string, number>;
  activeBuffs: { crit: boolean; shield: boolean; fury: number };
  skillUseCount: number;
  battleLog: string[];
  achToast: (typeof ACHIEVEMENTS)[0] | null;
  theme: Theme;
  themeMode: 'dark' | 'light';
  now: number;

  /* actions */
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addTodo: (text: string, difficulty: DifficultyKey, deadlineMin: number, category: string | null, memo: string, repeat: RepeatType) => void;
  deleteTodo: (id: number) => void;
  startComplete: (todo: Todo) => void;
  confirmComplete: (todoId: number, proofUri: string | null) => void;
  confirmUndo: (todoId: number, xpLost: number) => void;
  addCategory: (name: string, emoji: string) => void;
  deleteCategory: (catId: string) => void;
  attack: () => void;
  useSkill: (skill: (typeof import('../constants').SKILLS)[0]) => void;
  useItem: (item: ItemType, idx: number) => void;
  unequipItem: (slot: 'atk' | 'def') => void;
  setActivePet: (pet: (typeof PET_POOL)[0] | null) => void;
  setBattleLog: React.Dispatch<React.SetStateAction<string[]>>;
  setAchToast: (ach: (typeof ACHIEVEMENTS)[0] | null) => void;
  toggleTheme: () => void;
  restartAfterVictory: () => void;
  addFloat: (text: string, color: string) => void;
  floats: { text: string; color: string; id: number }[];
}

const GameContext = createContext<GameContextValue | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
};

/* ─── Notifications Setup ─── */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function scheduleTodoNotification(todo: Todo): Promise<string | null> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return null;
    const triggerTime = new Date(todo.deadline - 30 * 60 * 1000);
    if (triggerTime <= new Date()) return null;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ 퀘스트 마감 30분 전!',
        body: todo.text,
        data: { todoId: todo.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerTime },
    });
    return id;
  } catch {
    return null;
  }
}

async function cancelNotification(id: string | null | undefined) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
}

/* ─── Provider ─── */
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hero, setHero] = useState<HeroState>({ level: 1, xp: 0, hp: 100 });
  const [dragonStage, setDragonStage] = useState(0);
  const [dragonHp, setDragonHp] = useState(DRAGON_STAGES[0].hp);
  const [completedCount, setCompletedCount] = useState(0);
  const [victoryDragons, setVictoryDragons] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [inventory, setInventory] = useState<ItemType[]>([]);
  const [equipped, setEquipped] = useState<{ atk: ItemType | null; def: ItemType | null }>({ atk: null, def: null });
  const [unlockedAch, setUnlockedAch] = useState<string[]>([]);
  const [hardCount, setHardCount] = useState(0);
  const [onTimeCount, setOnTimeCount] = useState(0);
  const [pets, setPets] = useState<typeof PET_POOL>([]);
  const [activePet, setActivePetState] = useState<(typeof PET_POOL)[0] | null>(null);
  const [dailyCompleted, setDailyCompleted] = useState(0);
  const [dragonsKilled, setDragonsKilled] = useState(0);
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
  const [activeBuffs, setActiveBuffs] = useState({ crit: false, shield: false, fury: 0 });
  const [skillUseCount, setSkillUseCount] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [achToast, setAchToast] = useState<(typeof ACHIEVEMENTS)[0] | null>(null);
  const [attacking, setAttacking] = useState(false);
  const [usedRevive, setUsedRevive] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [now, setNow] = useState(Date.now());
  const [floats, setFloats] = useState<{ text: string; color: string; id: number }[]>([]);

  const dayKey = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const [dailyQuest, setDailyQuest] = useState(() => generateDailyQuest(dayKey));

  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatId = useRef(0);
  const prevLevel = useRef(1);

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  /* Load save */
  useEffect(() => {
    (async () => {
      const [saved, savedTheme] = await Promise.all([loadSave(), loadTheme()]);
      if (saved) {
        setTodos(saved.todos || []);
        setCategories(saved.categories || []);
        setHero(saved.hero || { level: 1, xp: 0, hp: 100 });
        setDragonStage(saved.dragonStage || 0);
        setDragonHp(saved.dragonHp ?? DRAGON_STAGES[0].hp);
        setCompletedCount(saved.completedCount || 0);
        setVictoryDragons(saved.victoryDragons || 0);
        setCombo(saved.combo || 0);
        setMaxCombo(saved.maxCombo || 0);
        setInventory(saved.inventory || []);
        setEquipped(saved.equipped || { atk: null, def: null });
        setUnlockedAch(saved.unlockedAch || []);
        setHardCount(saved.hardCount || 0);
        setOnTimeCount(saved.onTimeCount || 0);
        setPets(saved.pets || []);
        setActivePetState(saved.activePet || null);
        setDailyCompleted(saved.dailyCompleted || 0);
        setDragonsKilled(saved.dragonsKilled || 0);
        setSkillUseCount(saved.skillUseCount || 0);
        const dk = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        setDailyQuest(saved.dailyQuest?.day === dk ? saved.dailyQuest : generateDailyQuest(dk));
        prevLevel.current = saved.hero?.level || 1;
      }
      setThemeMode(savedTheme);
      setLoaded(true);
    })();
  }, []);

  /* Auto-save */
  useEffect(() => {
    if (!loaded) return;
    writeSave({
      todos, categories, hero, dragonStage, dragonHp, completedCount, victoryDragons,
      combo, maxCombo, inventory, equipped, unlockedAch, hardCount, onTimeCount,
      pets, activePet, dailyQuest, dailyCompleted, dragonsKilled, skillUseCount,
    });
  }, [loaded, todos, categories, hero, dragonStage, dragonHp, completedCount,
    victoryDragons, combo, maxCombo, inventory, equipped, unlockedAch,
    hardCount, onTimeCount, pets, activePet, dailyQuest, dailyCompleted,
    dragonsKilled, skillUseCount]);

  /* Timer */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Debuff tick */
  useEffect(() => {
    const t = setInterval(() => {
      setTodos(prev => {
        const overdue = prev.filter(t => !t.done && t.deadline && Date.now() > t.deadline + 10 * 60 * 1000);
        if (overdue.length > 0) {
          const dmg = overdue.length * 3;
          setHero(h => {
            if (h.hp <= 0) return h;
            return { ...h, hp: Math.max(0, h.hp - dmg) };
          });
          addFloat(`💀 -${dmg} HP`, '#f87171');
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(t);
  }, []);

  /* Daily quest refresh */
  useEffect(() => {
    const d = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    if (d !== dailyQuest.day) setDailyQuest(generateDailyQuest(d));
  }, [now]);

  /* Skill cooldown tick */
  useEffect(() => {
    const t = setInterval(() => {
      setSkillCooldowns(prev => {
        const next = { ...prev };
        let changed = false;
        for (const k in next) {
          if (next[k] > 0) { next[k]--; changed = true; }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const addFloat = useCallback((text: string, color: string) => {
    const id = ++floatId.current;
    setFloats(f => [...f, { text, color, id }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1200);
  }, []);

  const checkAch = useCallback((extra: Record<string, any> = {}) => {
    const s = {
      completedCount: extra.cc ?? completedCount,
      dragonsKilled: extra.dk ?? dragonsKilled,
      maxCombo: extra.mc ?? maxCombo,
      level: extra.lv ?? hero.level,
      onTimeCount: extra.ot ?? onTimeCount,
      hardCount: extra.hc ?? hardCount,
      dailyCompleted: extra.dc ?? dailyCompleted,
      petCount: pets.length + (extra.newPet ? 1 : 0),
    };
    ACHIEVEMENTS.forEach(a => {
      if (!unlockedAch.includes(a.id) && a.check(s)) {
        setUnlockedAch(p => [...p, a.id]);
        setAchToast(a);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });
  }, [completedCount, dragonsKilled, maxCombo, hero.level, onTimeCount, hardCount, dailyCompleted, pets, unlockedAch]);

  const gainXp = useCallback((amount: number) => {
    setHero(prev => {
      let xp = prev.xp + amount, lv = prev.level, nd = LEVEL_XP(lv);
      while (xp >= nd) { xp -= nd; lv++; nd = LEVEL_XP(lv); }
      const ns = getHeroStats(lv);
      if (lv > prev.level) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return { level: lv, xp, hp: lv > prev.level ? ns.maxHp : prev.hp };
    });
    addFloat(`+${amount} XP`, '#facc15');
  }, [addFloat]);

  const loseXp = useCallback((amount: number) => {
    setHero(prev => {
      let xp = prev.xp - amount, lv = prev.level;
      while (xp < 0 && lv > 1) { lv--; xp += LEVEL_XP(lv); }
      if (xp < 0) xp = 0;
      const ns = getHeroStats(lv);
      return { level: lv, xp, hp: Math.min(prev.hp, ns.maxHp) };
    });
    addFloat(`-${amount} XP`, '#f87171');
  }, [addFloat]);

  const updateDaily = useCallback((type: string) => {
    setDailyQuest(prev => {
      if (prev.completed || prev.type !== type) return prev;
      const np = prev.progress + 1;
      if (np >= prev.target) {
        setDailyCompleted(d => d + 1);
        gainXp(prev.xp);
        addFloat(`🎯 일일 미션 +${prev.xp}XP`, '#fbbf24');
        return { ...prev, progress: np, completed: true };
      }
      return { ...prev, progress: np };
    });
  }, [gainXp, addFloat]);

  const addTodo = useCallback(async (
    text: string,
    difficulty: DifficultyKey,
    deadlineMin: number,
    category: string | null,
    memo: string,
    repeat: RepeatType,
  ) => {
    const t = Date.now();
    const newTodo: Todo = {
      id: t,
      text: text.trim(),
      difficulty,
      done: false,
      proofUri: null,
      createdAt: t,
      deadline: t + deadlineMin * 60 * 1000,
      deadlineMin,
      category,
      memo,
      repeat,
      notificationId: null,
    };
    const notifId = await scheduleTodoNotification(newTodo);
    newTodo.notificationId = notifId;
    setTodos(p => [...p, newTodo]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos(prev => {
      const todo = prev.find(t => t.id === id);
      if (todo?.notificationId) cancelNotification(todo.notificationId);
      return prev.filter(x => x.id !== id);
    });
  }, []);

  const startComplete = useCallback((todo: Todo) => {
    // handled by screen modal
  }, []);

  const confirmComplete = useCallback((todoId: number, proofUri: string | null) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id !== todoId || todo.done) return todo;
      const diff = DIFFICULTY[todo.difficulty];
      const xpMult = (activePet?.effect?.xpBonus ? 1 + activePet.effect.xpBonus : 1) *
        (combo >= 10 ? 2.0 : combo >= 5 ? 1.5 : combo >= 3 ? 1.2 : 1.0);
      const xp = Math.floor(diff.xp * xpMult);
      gainXp(xp);
      setHero(h => ({ ...h, hp: Math.min(getHeroStats(h.level).maxHp, h.hp + diff.heal) }));
      addFloat(`+${diff.heal} HP`, '#4ade80');
      if (todo.difficulty === 'hard') setHardCount(h => h + 1);
      const isOnTime = todo.deadline && Date.now() <= todo.deadline;
      if (isOnTime) setOnTimeCount(o => o + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => setCombo(0), 30 * 60 * 1000);
      updateDaily('complete_any');
      if (todo.difficulty === 'hard') updateDaily('complete_hard');
      if (isOnTime) updateDaily('complete_ontime');
      if (newCombo >= 3) updateDaily('combo_reach');
      setTimeout(() => checkAch({ cc: completedCount + 1, mc: Math.max(maxCombo, newCombo) }), 100);
      cancelNotification(todo.notificationId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // handle repeat
      if (todo.repeat !== 'none') {
        const now = Date.now();
        const nextDeadline = todo.repeat === 'daily'
          ? now + 24 * 60 * 60 * 1000
          : now + 7 * 24 * 60 * 60 * 1000;
        const resetTodo: Todo = {
          ...todo,
          done: false,
          proofUri: null,
          createdAt: now,
          deadline: nextDeadline,
          completedAt: now,
          notificationId: null,
        };
        // Schedule notification for next occurrence
        scheduleTodoNotification(resetTodo).then(nid => {
          setTodos(p => p.map(t2 => t2.id === todoId ? { ...resetTodo, notificationId: nid } : t2));
        });
        return { ...todo, done: true, proofUri, completedAt: now };
      }

      return { ...todo, done: true, proofUri, completedAt: Date.now() };
    }));
    setCompletedCount(c => c + 1);
  }, [activePet, combo, maxCombo, completedCount, gainXp, addFloat, updateDaily, checkAch]);

  const confirmUndo = useCallback((todoId: number, xpLost: number) => {
    setTodos(t => t.map(todo => todo.id === todoId ? { ...todo, done: false, proofUri: null } : todo));
    loseXp(xpLost);
    setCombo(0);
    setCompletedCount(c => Math.max(0, c - 1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [loseXp]);

  const addCategory = useCallback((name: string, emoji: string) => {
    const id = 'cat_' + Date.now();
    setCategories(c => [...c, { id, name: name.trim(), emoji, color: CAT_COLORS[c.length % CAT_COLORS.length] }]);
  }, []);

  const deleteCategory = useCallback((catId: string) => {
    setCategories(c => c.filter(x => x.id !== catId));
    setTodos(t => t.map(todo => todo.category === catId ? { ...todo, category: null } : todo));
  }, []);

  /* ─── BATTLE ─── */
  const attack = useCallback(() => {
    if (attacking || hero.hp <= 0) return;
    setAttacking(true);
    const dragon = DRAGON_STAGES[dragonStage];
    const stats = getHeroStats(hero.level);
    const equipAtk = equipped.atk?.effect?.atk || 0;
    const equipDef = equipped.def?.effect?.def || 0;
    const totalAtk = stats.atk + equipAtk;
    const totalDef = stats.def + equipDef;
    const petBonus = activePet?.effect || {};

    let atkMult = 1;
    if (activeBuffs.crit) { atkMult = 2.5; setActiveBuffs(b => ({ ...b, crit: false })); }
    if (activeBuffs.fury > 0) atkMult *= 2;

    const heroDmg = Math.max(1, Math.floor((totalAtk * atkMult) - dragon.atk * 0.2 + Math.random() * 6) + ((petBonus as any).bonusDmg || 0));
    const rawDragonDmg = Math.max(1, dragon.atk - totalDef + Math.floor(Math.random() * 4));
    const dragonDmg = activeBuffs.shield
      ? Math.floor(rawDragonDmg * 0.2)
      : Math.floor(rawDragonDmg * (1 - ((petBonus as any).dmgReduce || 0)));
    if (activeBuffs.shield) setActiveBuffs(b => ({ ...b, shield: false }));
    if (activeBuffs.fury > 0) setActiveBuffs(b => ({ ...b, fury: b.fury - 1 }));

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Pet heal per turn
    const petHeal = (petBonus as any).healPerTurn || 0;

    const logs: string[] = [];
    if (activeBuffs.crit) logs.push(`⚡ 치명타! ${heroDmg} 대미지!`);
    else logs.push(`⚔️ 공격! ${heroDmg} 대미지!`);
    if (petHeal > 0) {
      setHero(h => ({ ...h, hp: Math.min(stats.maxHp, h.hp + petHeal) }));
      logs.push(`🐾 ${activePet?.name} 회복 +${petHeal} HP`);
    }

    const newDragonHp = Math.max(0, dragonHp - heroDmg);
    setDragonHp(newDragonHp);

    setTimeout(() => {
      if (newDragonHp <= 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const loot = rollLoot(dragonStage) as unknown as ItemType[];
        setInventory(inv => [...inv, ...loot]);
        const newPet = PET_POOL[Math.floor(Math.random() * PET_POOL.length)];
        const alreadyHas = pets.some(p => p.id === newPet.id);
        const xpReward = 50 + dragonStage * 30;
        gainXp(xpReward);
        const newDk = dragonsKilled + 1;
        setDragonsKilled(newDk);
        setVictoryDragons(v => v + 1);
        updateDaily('battle_win');
        if (!alreadyHas) {
          setPets(p => [...p, newPet]);
          logs.push(`🐾 새 동료 획득: ${newPet.emoji} ${newPet.name}!`);
          checkAch({ dk: newDk, newPet: true });
        } else {
          checkAch({ dk: newDk });
        }
        const nextStage = dragonStage < DRAGON_STAGES.length - 1 ? dragonStage + 1 : 0;
        setBattleLog(b => [...b, ...logs, `🏆 ${dragon.name} 처치! +${xpReward}XP!`]);
        setTimeout(() => {
          setDragonStage(nextStage);
          setDragonHp(DRAGON_STAGES[nextStage].hp);
          setUsedRevive(false);
          setAttacking(false);
        }, 1500);
        return;
      }

      // Dragon counter-attack
      setHero(prev => {
        const newHp = Math.max(0, prev.hp - dragonDmg);
        if (newHp <= 0 && !usedRevive && activePet?.id === 'phoenix') {
          setUsedRevive(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          logs.push(`🐦‍🔥 ${activePet.name}의 부활! HP 50% 회복!`);
          setBattleLog(b => [...b, ...logs]);
          setAttacking(false);
          return { ...prev, hp: Math.floor(stats.maxHp * 0.5) };
        }
        if (newHp <= 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          logs.push('💔 용사가 쓰러졌다...');
          setBattleLog(b => [...b, ...logs]);
          setAttacking(false);
          return { ...prev, hp: 0 };
        }
        logs.push(`🔥 ${dragon.name}이(가) ${dragonDmg} 피해!${activeBuffs.shield ? ' (방어막!)' : ''}`);
        setBattleLog(b => [...b, ...logs]);
        setAttacking(false);
        return { ...prev, hp: newHp };
      });
    }, 600);
  }, [attacking, hero, dragonStage, dragonHp, equipped, activePet, activeBuffs, pets, dragonsKilled, usedRevive, gainXp, updateDaily, checkAch]);

  const useSkill = useCallback((skill: any) => {
    if ((skillCooldowns[skill.id] || 0) > 0) return;
    setSkillCooldowns(c => ({ ...c, [skill.id]: skill.cooldown }));
    setSkillUseCount(c => c + 1);
    updateDaily('use_skill');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const stats = getHeroStats(hero.level);
    if (skill.id === 'heal') {
      const heal = Math.floor(stats.maxHp * 0.25);
      setHero(h => ({ ...h, hp: Math.min(stats.maxHp, h.hp + heal) }));
      addFloat(`+${heal} HP`, '#4ade80');
      setBattleLog(b => [...b, `💚 치유! HP ${heal} 회복!`]);
    } else if (skill.id === 'crit') {
      setActiveBuffs(b => ({ ...b, crit: true }));
      setBattleLog(b => [...b, '⚡ 치명타 준비! 다음 공격 2.5배!']);
    } else if (skill.id === 'shield') {
      setActiveBuffs(b => ({ ...b, shield: true }));
      setBattleLog(b => [...b, '🛡️ 방어막 활성화! 다음 피격 80% 감소!']);
    } else if (skill.id === 'fury') {
      setActiveBuffs(b => ({ ...b, fury: 3 }));
      setBattleLog(b => [...b, '🔥 분노! 3턴간 공격력 2배!']);
    }
  }, [skillCooldowns, hero.level, updateDaily, addFloat]);

  const useItem = useCallback((item: ItemType, idx: number) => {
    const stats = getHeroStats(hero.level);
    if (item.type === 'consumable') {
      if (item.effect.heal) {
        const h = item.effect.heal;
        setHero(p => ({ ...p, hp: Math.min(stats.maxHp, p.hp + h) }));
        addFloat(`+${h} HP`, '#4ade80');
      }
      if (item.effect.xp) gainXp(item.effect.xp);
      setInventory(inv => inv.filter((_, j) => j !== idx));
    } else if (item.type === 'equip_atk') {
      const oldItem = equipped.atk;
      setEquipped(e => ({ ...e, atk: item }));
      setInventory(inv => { let next = inv.filter((_, j) => j !== idx); if (oldItem) next = [...next, oldItem]; return next; });
      addFloat(`⚔️ ${item.name} 장착!`, '#fbbf24');
    } else if (item.type === 'equip_def') {
      const oldItem = equipped.def;
      setEquipped(e => ({ ...e, def: item }));
      setInventory(inv => { let next = inv.filter((_, j) => j !== idx); if (oldItem) next = [...next, oldItem]; return next; });
      addFloat(`🛡️ ${item.name} 장착!`, '#60a5fa');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [hero.level, equipped, gainXp, addFloat]);

  const unequipItem = useCallback((slot: 'atk' | 'def') => {
    const item = equipped[slot];
    if (!item) return;
    setEquipped(e => ({ ...e, [slot]: null }));
    setInventory(inv => [...inv, item]);
    addFloat(`${item.name} 해제`, '#8b7fa0');
  }, [equipped, addFloat]);

  const setActivePet = useCallback((pet: (typeof PET_POOL)[0] | null) => {
    setActivePetState(pet);
    if (pet) addFloat(`${pet.emoji} ${pet.name} 활성화!`, pet.color);
  }, [addFloat]);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const restartAfterVictory = useCallback(() => {
    setDragonStage(0);
    setDragonHp(DRAGON_STAGES[0].hp);
    setBattleLog([]);
  }, []);

  if (!loaded) return null;

  const value: GameContextValue = {
    todos, categories, hero, dragonStage, dragonHp, completedCount, victoryDragons,
    combo, maxCombo, inventory, equipped, unlockedAch, hardCount, onTimeCount,
    pets, activePet, dailyQuest: dailyQuest as any, dailyCompleted, dragonsKilled,
    skillCooldowns, activeBuffs, skillUseCount, battleLog, achToast, theme: theme as any, themeMode, now, floats,
    setTodos, setCategories, addTodo, deleteTodo, startComplete,
    confirmComplete, confirmUndo, addCategory, deleteCategory,
    attack, useSkill, useItem, unequipItem, setActivePet, setBattleLog,
    setAchToast, toggleTheme, restartAfterVictory, addFloat,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
