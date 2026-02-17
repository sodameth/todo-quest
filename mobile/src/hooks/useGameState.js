import { useState, useRef, useCallback, useEffect } from 'react';
import { DIFFICULTY } from '../constants/difficulty';
import { DRAGON_STAGES } from '../constants/dragonStages';
import { getHeroStats, getHeroTier, getHeroTitle } from '../constants/heroData';
import { LEVEL_XP } from '../utils/levelXp';
import { SKILLS } from '../constants/skills';
import { rollLoot } from '../constants/items';
import { PET_POOL } from '../constants/pets';
import { generateDailyQuest } from '../constants/dailyQuests';
import { useAchievements } from './useAchievements';

export function useGameState(now) {
  // Core todo state
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [deadlineMin, setDeadlineMin] = useState(30);

  // Categories
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📌');

  // Hero
  const [hero, setHero] = useState({ level: 1, xp: 0, hp: 100 });
  const [dragonStage, setDragonStage] = useState(0);
  const [dragonHp, setDragonHp] = useState(DRAGON_STAGES[0].hp);
  const [battleLog, setBattleLog] = useState([]);
  const [screen, setScreen] = useState('todo');
  const [floats, setFloats] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [victoryDragons, setVictoryDragons] = useState(0);

  // Combo
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const comboTimer = useRef(null);

  // Animation
  const [heroShaking, setHeroShaking] = useState(false);
  const [dragonShaking, setDragonShaking] = useState(false);
  const [dragonHit, setDragonHit] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [showFire, setShowFire] = useState(false);
  const [dmgNums, setDmgNums] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [attacking, setAttacking] = useState(false);

  // Modals
  const [proofModal, setProofModal] = useState(null);
  const [undoModal, setUndoModal] = useState(null);
  const [lootModal, setLootModal] = useState(null);

  // Skills
  const [skillCooldowns, setSkillCooldowns] = useState({});
  const [activeBuffs, setActiveBuffs] = useState({ crit: false, shield: false, fury: 0 });
  const [skillUseCount, setSkillUseCount] = useState(0);

  // Items & Equipment
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({ atk: null, def: null });

  // Achievements
  const { unlockedAch, achToast, setAchToast, checkAch } = useAchievements();
  const [hardCount, setHardCount] = useState(0);
  const [onTimeCount, setOnTimeCount] = useState(0);

  // Pets
  const [pets, setPets] = useState([]);
  const [activePet, setActivePet] = useState(null);
  const [usedRevive, setUsedRevive] = useState(false);

  // Daily quest
  const dayKey = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const [dailyQuest, setDailyQuest] = useState(() => generateDailyQuest(dayKey));
  const [dailyCompleted, setDailyCompleted] = useState(0);

  // Kill count
  const [dragonsKilled, setDragonsKilled] = useState(0);

  const floatId = useRef(0);
  const dmgId = useRef(0);
  const logRef = useRef(null);
  const prevLevel = useRef(hero.level);

  // Derived state
  const stats = getHeroStats(hero.level);
  const xpNeeded = LEVEL_XP(hero.level);
  const dragon = DRAGON_STAGES[dragonStage];
  const heroTier = getHeroTier(hero.level);
  const equipAtk = equipped.atk ? equipped.atk.effect.atk : 0;
  const equipDef = equipped.def ? equipped.def.effect.def : 0;
  const totalAtk = stats.atk + equipAtk;
  const totalDef = stats.def + equipDef;
  const petBonus = activePet?.effect || {};
  const xpMultiplier = (1 + (petBonus.xpBonus || 0)) * (combo >= 10 ? 2.0 : combo >= 5 ? 1.5 : combo >= 3 ? 1.2 : 1.0);
  const canBattle = hero.level >= 2 && hero.hp > 0;
  const isDead = hero.hp <= 0;
  const overdueCount = todos.filter(t => !t.done && t.deadline && now > t.deadline + 10 * 60 * 1000).length;

  // Level up detection
  useEffect(() => {
    if (hero.level > prevLevel.current) setShowLevelUp(hero.level);
    prevLevel.current = hero.level;
  }, [hero.level]);

  // Debuff tick
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

  // Daily quest day check
  useEffect(() => {
    const d = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    if (d !== dailyQuest.day) setDailyQuest(generateDailyQuest(d));
  }, [now]);

  // Helpers
  const addFloat = (text, color) => {
    const id = ++floatId.current;
    setFloats(f => [...f, { text, color, id }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1000);
  };

  const addDmg = (v, c, x, y) => {
    const id = ++dmgId.current;
    setDmgNums(d => [...d, { value: v, color: c, x, y, id }]);
  };

  const removeDmg = useCallback(id => {
    setDmgNums(d => d.filter(x => x.id !== id));
  }, []);

  const gainXp = (amount) => {
    setHero(prev => {
      let xp = prev.xp + amount, lv = prev.level, nd = LEVEL_XP(lv);
      while (xp >= nd) { xp -= nd; lv++; nd = LEVEL_XP(lv); }
      const ns = getHeroStats(lv);
      return { level: lv, xp, hp: lv > prev.level ? ns.maxHp : prev.hp };
    });
    addFloat(`+${amount} XP`, '#facc15');
  };

  const loseXp = (amount) => {
    setHero(prev => {
      let xp = prev.xp - amount, lv = prev.level;
      while (xp < 0 && lv > 1) { lv--; xp += LEVEL_XP(lv); }
      if (xp < 0) xp = 0;
      const ns = getHeroStats(lv);
      return { level: lv, xp, hp: Math.min(prev.hp, ns.maxHp) };
    });
    addFloat(`-${amount} XP`, '#f87171');
  };

  const updateDaily = (type) => {
    setDailyQuest(prev => {
      if (prev.completed || prev.type !== type) return prev;
      const np = prev.progress + 1;
      if (np >= prev.target) {
        setDailyCompleted(d => d + 1);
        gainXp(prev.xp);
        addFloat(`🎯 일일 미션 +${prev.xp}XP`, '#fbbf24');
        setTimeout(() => checkAch({
          completedCount, dragonsKilled, maxCombo, level: hero.level,
          onTimeCount, hardCount, dailyCompleted: dailyCompleted + 1, petCount: pets.length,
        }), 200);
        return { ...prev, progress: np, completed: true };
      }
      return { ...prev, progress: np };
    });
  };

  // TODO ACTIONS
  const addTodo = () => {
    if (!input.trim()) return;
    const t = Date.now();
    setTodos(p => [...p, {
      id: t, text: input.trim(), difficulty, done: false, proofUrl: null,
      createdAt: t, deadline: t + deadlineMin * 60 * 1000, deadlineMin,
      category: selectedCat,
    }]);
    setInput('');
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const id = 'cat_' + Date.now();
    setCategories(c => [...c, {
      id, name: newCatName.trim(), emoji: newCatEmoji,
      color: ['#60a5fa', '#a78bfa', '#4ade80', '#fbbf24', '#f87171', '#f97316', '#ec4899', '#14b8a6', '#e879f9', '#84cc16'][c.length % 10],
    }]);
    setNewCatName('');
    setNewCatEmoji('📌');
    setShowCatManager(true);
  };

  const deleteCategory = (catId) => {
    setCategories(c => c.filter(x => x.id !== catId));
    setTodos(t => t.map(todo => todo.category === catId ? { ...todo, category: null } : todo));
    if (filterCat === catId) setFilterCat('all');
    if (selectedCat === catId) setSelectedCat(null);
  };

  const confirmComplete = (todoId, proofUrl) => {
    setTodos(t => t.map(todo => {
      if (todo.id === todoId && !todo.done) {
        const diff = DIFFICULTY[todo.difficulty];
        const xp = Math.floor(diff.xp * xpMultiplier);
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
        setTimeout(() => checkAch({
          completedCount: completedCount + 1, dragonsKilled, maxCombo: Math.max(maxCombo, newCombo),
          level: hero.level, onTimeCount: isOnTime ? onTimeCount + 1 : onTimeCount,
          hardCount: todo.difficulty === 'hard' ? hardCount + 1 : hardCount,
          dailyCompleted, petCount: pets.length,
        }), 100);
        return { ...todo, done: true, proofUrl };
      }
      return todo;
    }));
    setCompletedCount(c => c + 1);
    setProofModal(null);
  };

  const confirmUndo = (todoId, xpLost) => {
    setTodos(t => t.map(todo => todo.id === todoId ? { ...todo, done: false, proofUrl: null } : todo));
    loseXp(xpLost);
    setCombo(0);
    setCompletedCount(c => Math.max(0, c - 1));
    setUndoModal(null);
  };

  const deleteTodo = id => setTodos(t => t.filter(x => x.id !== id));

  // SKILLS
  const useSkill = (skill) => {
    if (skillCooldowns[skill.id] > 0) return;
    setSkillCooldowns(c => ({ ...c, [skill.id]: skill.cooldown }));
    setSkillUseCount(c => c + 1);
    updateDaily('use_skill');
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
  };

  // ITEMS
  const useItem = (item, idx) => {
    if (item.type === 'consumable') {
      if (item.effect.heal) {
        const h = item.effect.heal;
        setHero(p => ({ ...p, hp: Math.min(getHeroStats(p.level).maxHp, p.hp + h) }));
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
  };

  const unequipItem = (slot) => {
    const item = equipped[slot];
    if (!item) return;
    setEquipped(e => ({ ...e, [slot]: null }));
    setInventory(inv => [...inv, item]);
    addFloat(`${item.name} 해제`, '#8b7fa0');
  };

  // BATTLE
  const attack = () => {
    if (attacking) return;
    setAttacking(true);
    let atkMult = 1;
    if (activeBuffs.crit) { atkMult = 2.5; setActiveBuffs(b => ({ ...b, crit: false })); }
    if (activeBuffs.fury > 0) atkMult *= 2;
    const heroDmg = Math.max(1, Math.floor((totalAtk * atkMult) - dragon.atk * 0.2 + Math.random() * 6) + (petBonus.bonusDmg || 0));
    const rawDragonDmg = Math.max(1, dragon.atk - totalDef + Math.floor(Math.random() * 4));
    const dragonDmg = activeBuffs.shield ? Math.floor(rawDragonDmg * 0.2) : Math.floor(rawDragonDmg * (1 - (petBonus.dmgReduce || 0)));
    if (activeBuffs.shield) setActiveBuffs(b => ({ ...b, shield: false }));
    if (activeBuffs.fury > 0) setActiveBuffs(b => ({ ...b, fury: b.fury - 1 }));
    setSkillCooldowns(c => { const n = {}; Object.keys(c).forEach(k => { if (c[k] > 0) n[k] = c[k] - 1; }); return n; });

    setShowSlash(true);
    setTimeout(() => {
      setDragonShaking(true); setDragonHit(true);
      setTimeout(() => { setDragonShaking(false); setDragonHit(false); }, 350);
      addDmg(heroDmg, atkMult > 1 ? '#FF4444' : '#FFD700', 90, 20);
    }, 200);

    const newDhp = Math.max(0, dragonHp - heroDmg);
    const logs = [`⚔️ 용사가 ${heroDmg}의 피해를 입혔다!${atkMult > 1 ? ' (강화!)' : ''}`];

    setTimeout(() => {
      setDragonHp(newDhp);
      if (petBonus.healPerTurn) {
        setHero(h => ({ ...h, hp: Math.min(stats.maxHp, h.hp + petBonus.healPerTurn) }));
      }

      if (newDhp <= 0) {
        logs.push(`🎉 ${dragon.name} 처치!`);
        const bonusXp = (dragonStage + 1) * 60;
        logs.push(`💎 보너스 +${bonusXp}XP!`);
        gainXp(bonusXp);
        const loot = rollLoot(dragonStage);
        setInventory(inv => [...inv, ...loot]);
        if (Math.random() < 0.25 && pets.length < PET_POOL.length) {
          const available = PET_POOL.filter(p => !pets.find(pp => pp.id === p.id));
          if (available.length > 0) {
            const newPet = available[Math.floor(Math.random() * available.length)];
            setPets(p => [...p, newPet]);
            loot.push({ ...newPet, name: `🐾 ${newPet.name}`, desc: newPet.skill, rarity: 'legendary', emoji: newPet.emoji });
            logs.push(`🐾 새 동료 ${newPet.name} 합류!`);
            setTimeout(() => checkAch({
              completedCount, dragonsKilled: dragonsKilled + 1, maxCombo, level: hero.level,
              onTimeCount, hardCount, dailyCompleted, petCount: pets.length + 1,
            }), 300);
          }
        }
        setDragonsKilled(d => d + 1);
        updateDaily('battle_win');
        setTimeout(() => {
          setLootModal(loot);
          checkAch({
            completedCount, dragonsKilled: dragonsKilled + 1, maxCombo, level: hero.level,
            onTimeCount, hardCount, dailyCompleted, petCount: pets.length,
          });
        }, 800);
        if (dragonStage < DRAGON_STAGES.length - 1) {
          const next = dragonStage + 1;
          setDragonStage(next);
          setDragonHp(DRAGON_STAGES[next].hp);
          logs.push(`🐲 ${DRAGON_STAGES[next].name} 등장!`);
        } else {
          setVictoryDragons(v => v + 1);
          setScreen('victory');
        }
        setBattleLog(b => [...b, ...logs]);
        setAttacking(false);
        setUsedRevive(false);
        return;
      }

      setTimeout(() => {
        setShowFire(true);
        setTimeout(() => {
          setHeroShaking(true);
          setTimeout(() => setHeroShaking(false), 350);
          addDmg(dragonDmg, '#EF4444', 30, 70);
          setHero(prev => {
            const newHp = Math.max(0, prev.hp - dragonDmg);
            if (newHp <= 0) {
              if (petBonus.revive && !usedRevive) {
                setUsedRevive(true);
                logs.push(`🐦‍🔥 ${activePet.name}의 부활! HP 50% 회복!`);
                setBattleLog(b => [...b, ...logs]);
                setAttacking(false);
                return { ...prev, hp: Math.floor(stats.maxHp * 0.5) };
              }
              logs.push('💔 용사가 쓰러졌다...');
              setBattleLog(b => [...b, ...logs]);
              setTimeout(() => setScreen('todo'), 1500);
              return { ...prev, hp: 0 };
            }
            logs.push(`🔥 ${dragon.name}이(가) ${dragonDmg} 피해!${activeBuffs.shield ? ' (방어막!)' : ''}`);
            setBattleLog(b => [...b, ...logs]);
            return { ...prev, hp: newHp };
          });
          setAttacking(false);
        }, 300);
      }, 400);
    }, 500);
  };

  const restartAfterVictory = () => {
    setDragonStage(0);
    setDragonHp(DRAGON_STAGES[0].hp);
    setBattleLog([]);
    setScreen('todo');
  };

  return {
    // State
    todos, input, difficulty, deadlineMin, categories, selectedCat, filterCat,
    showCatManager, newCatName, newCatEmoji, hero, dragonStage, dragonHp,
    battleLog, screen, floats, completedCount, victoryDragons, combo, maxCombo,
    heroShaking, dragonShaking, dragonHit, showSlash, showFire, dmgNums,
    showLevelUp, attacking, proofModal, undoModal, lootModal, achToast,
    skillCooldowns, activeBuffs, skillUseCount, inventory, equipped,
    unlockedAch, hardCount, onTimeCount, pets, activePet, usedRevive,
    dailyQuest, dailyCompleted, dragonsKilled,
    // Derived
    stats, xpNeeded, dragon, heroTier, equipAtk, equipDef, totalAtk, totalDef,
    petBonus, xpMultiplier, canBattle, isDead, overdueCount,
    // Refs
    logRef,
    // Setters
    setInput, setDifficulty, setDeadlineMin, setSelectedCat, setFilterCat,
    setShowCatManager, setNewCatName, setNewCatEmoji, setScreen, setShowLevelUp,
    setProofModal, setUndoModal, setLootModal, setAchToast, setActivePet,
    setShowSlash, setShowFire,
    // Actions
    addTodo, addCategory, deleteCategory, confirmComplete, confirmUndo, deleteTodo,
    useSkill, useItem, unequipItem, attack, restartAfterVictory,
    removeDmg, addFloat,
  };
}
