import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '../context/GameContext';
import { HeroSVG } from '../components/HeroSVG';
import { DragonSVG } from '../components/DragonSVG';
import { ProgressBar, FloatingTexts } from '../components/shared';
import { DRAGON_STAGES, getHeroStats, getHeroTier, SKILLS } from '../constants';

export default function BattleScreen() {
  const {
    hero, dragonStage, dragonHp, battleLog, skillCooldowns, activeBuffs,
    attack, useSkill, theme, activePet,
  } = useGame();

  const logRef = useRef<ScrollView>(null);
  const heroShake = useRef(new Animated.Value(0)).current;
  const dragonShake = useRef(new Animated.Value(0)).current;
  const dragonFlash = useRef(new Animated.Value(0)).current;
  const attackBtnScale = useRef(new Animated.Value(1)).current;
  const healPulse = useRef(new Animated.Value(1)).current;
  const petBounce = useRef(new Animated.Value(0)).current;
  const petGlow = useRef(new Animated.Value(0)).current;
  const prevHpRef = useRef(hero.hp);
  const prevDragonHpRef = useRef(dragonHp);

  const stats = getHeroStats(hero.level);
  const dragon = DRAGON_STAGES[dragonStage];
  const heroTier = getHeroTier(hero.level);
  const canBattle = hero.level >= 2 && hero.hp > 0;
  const isDead = hero.hp <= 0;

  useEffect(() => {
    logRef.current?.scrollToEnd({ animated: true });
  }, [battleLog]);

  const shakeHero = () => {
    Animated.sequence([
      Animated.timing(heroShake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(heroShake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(heroShake, { toValue: -5, duration: 60, useNativeDriver: true }),
      Animated.timing(heroShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const shakeDragon = () => {
    Animated.sequence([
      Animated.timing(dragonShake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(dragonShake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(dragonShake, { toValue: -7, duration: 50, useNativeDriver: true }),
      Animated.timing(dragonShake, { toValue: 7, duration: 50, useNativeDriver: true }),
      Animated.timing(dragonShake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const flashDragon = () => {
    Animated.sequence([
      Animated.timing(dragonFlash, { toValue: 0.6, duration: 80, useNativeDriver: true }),
      Animated.timing(dragonFlash, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const animateAttackBtn = () => {
    Animated.sequence([
      Animated.timing(attackBtnScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(attackBtnScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(attackBtnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  // Start heal pulse loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(healPulse, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(healPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Pet bounce animation loop
  useEffect(() => {
    if (!activePet) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(petBounce, { toValue: -6, duration: 400, useNativeDriver: true }),
        Animated.timing(petBounce, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [activePet]);

  // Pet glow pulse
  useEffect(() => {
    if (!activePet) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(petGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(petGlow, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [activePet]);

  // Pet attack flash when dragon takes damage
  const flashPet = () => {
    if (!activePet) return;
    Animated.sequence([
      Animated.timing(petGlow, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(petGlow, { toValue: 0.3, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  // 피격 시 흔들림 효과
  useEffect(() => {
    if (hero.hp < prevHpRef.current) {
      shakeHero();
    }
    prevHpRef.current = hero.hp;
  }, [hero.hp]);

  // 드래곤 피격 시 흔들림 + 플래시
  useEffect(() => {
    if (dragonHp < prevDragonHpRef.current) {
      shakeDragon();
      flashDragon();
      flashPet();
    }
    prevDragonHpRef.current = dragonHp;
  }, [dragonHp]);

  const handleAttack = () => {
    if (!canBattle) return;
    animateAttackBtn();
    attack(); // GameContext 내부에서 Haptics.Medium 처리
  };

  const handleSkill = (skill: typeof SKILLS[0]) => {
    useSkill(skill); // GameContext 내부에서 Haptics.Heavy 처리
  };

  if (!canBattle && !isDead) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedEmoji}>🔒</Text>
          <Text style={[styles.lockedTitle, { color: theme.text }]}>레벨 2 필요</Text>
          <Text style={[styles.lockedDesc, { color: theme.textMuted }]}>
            퀘스트를 완료해서 레벨 2가 되면{'\n'}드래곤 전투에 도전할 수 있어요!
          </Text>
          <Text style={[styles.lockedLevel, { color: theme.accent }]}>현재 레벨: {hero.level}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Battle Arena */}
      <View style={[styles.arena, { backgroundColor: 'rgba(40,10,10,0.8)', borderColor: 'rgba(239,68,68,0.15)' }]}>
        <Text style={[styles.arenaLabel, { color: 'rgba(248,113,113,0.4)' }]}>— BATTLE —</Text>

        <View style={styles.combatants}>
          {/* Hero */}
          <Animated.View style={[styles.heroSide, { transform: [{ translateX: heroShake }] }]}>
            <View style={styles.heroWithPet}>
              <HeroSVG tier={heroTier} size={85} hpRatio={hero.hp / stats.maxHp} />
              {activePet && (
                <Animated.View style={[
                  styles.petCompanion,
                  { transform: [{ translateY: petBounce }] },
                ]}>
                  <Animated.View style={[
                    styles.petGlowRing,
                    { borderColor: activePet.color, opacity: petGlow },
                  ]} />
                  <Text style={styles.petCompanionEmoji}>{activePet.emoji}</Text>
                </Animated.View>
              )}
            </View>
            <View style={styles.hpBarSmall}>
              <ProgressBar value={hero.hp} max={stats.maxHp} color="#4ade80" height={7} label={`${hero.hp}`} />
            </View>
            <Text style={[styles.combatantName, { color: '#4ade80' }]}>용사{activePet ? ` + ${activePet.name}` : ''}</Text>
          </Animated.View>

          {/* VS */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
            {activeBuffs.crit && <Text style={styles.buffIcon}>⚡</Text>}
            {activeBuffs.shield && <Text style={styles.buffIcon}>🛡️</Text>}
            {activeBuffs.fury > 0 && <Text style={styles.buffIcon}>🔥×{activeBuffs.fury}</Text>}
          </View>

          {/* Dragon */}
          <Animated.View style={[styles.dragonSide, { transform: [{ translateX: dragonShake }] }]}>
            <View style={styles.dragonWrapper}>
              <DragonSVG stage={dragonStage} size={110} />
              <Animated.View style={[styles.dragonHitFlash, { opacity: dragonFlash }]} pointerEvents="none" />
            </View>
            <View style={styles.hpBarSmall}>
              <ProgressBar value={dragonHp} max={dragon.hp} color="#ef4444" height={7} label={`${dragonHp}`} />
            </View>
            <Text style={[styles.combatantName, { color: '#ef4444' }]}>{dragon.name}</Text>
            <Text style={[styles.stageLabel, { color: theme.textMuted }]}>({dragonStage + 1}/{DRAGON_STAGES.length})</Text>
          </Animated.View>
        </View>

        {isDead && (
          <View style={styles.deadOverlay}>
            <Text style={styles.deadText}>💔 쓰러졌다...</Text>
            <Text style={[styles.deadSub, { color: theme.textMuted }]}>퀘스트를 완료해서 HP를 회복하세요!</Text>
          </View>
        )}
      </View>

      <FloatingTexts />

      {/* Skills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.skillsScroll} contentContainerStyle={styles.skillsContent}>
        {SKILLS.filter(s => hero.level >= s.unlock).map(skill => {
          const cd = skillCooldowns[skill.id] || 0;
          const isActive = (skill.id === 'crit' && activeBuffs.crit) ||
            (skill.id === 'shield' && activeBuffs.shield) ||
            (skill.id === 'fury' && activeBuffs.fury > 0);
          const isAvailable = cd === 0 && !isDead;
          const isHealPulsing = skill.id === 'heal' && isAvailable && hero.hp < getHeroStats(hero.level).maxHp;
          return (
            <Animated.View key={skill.id} style={isHealPulsing ? { transform: [{ scale: healPulse }] } : undefined}>
              <TouchableOpacity
                style={[
                  styles.skillBtn,
                  { borderColor: isActive ? skill.color + '88' : cd > 0 ? 'transparent' : skill.color + '55' },
                  isActive && { backgroundColor: skill.color + '22' },
                  isAvailable && !isActive && { backgroundColor: skill.color + '11', borderWidth: 2 },
                  isHealPulsing && {
                    shadowColor: skill.color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 8,
                    elevation: 6,
                  },
                  cd > 0 && { opacity: 0.4 },
                ]}
                onPress={() => cd === 0 && handleSkill(skill)}
                disabled={cd > 0 || isDead}
              >
                <Text style={styles.skillEmoji}>{skill.emoji}</Text>
                <Text style={[styles.skillName, { color: cd > 0 ? theme.textDim : skill.color }]}>{skill.name}</Text>
                <Text style={[styles.skillDesc, { color: theme.textMuted }]}>{skill.desc}</Text>
                {cd > 0 && <Text style={styles.skillCd}>CD:{cd}</Text>}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Attack Button */}
      <Animated.View style={{ transform: [{ scale: attackBtnScale }] }}>
        <TouchableOpacity
          style={[styles.attackBtn, isDead && styles.attackBtnDisabled]}
          onPress={handleAttack}
          disabled={isDead}
          activeOpacity={0.8}
        >
          <Text style={styles.attackBtnText}>
            {isDead ? '💔 쓰러짐...' : '⚔️ 공격하기!'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Dragon Info */}
      <View style={[styles.dragonInfo, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.dragonInfoName, { color: '#ef4444' }]}>{dragon.name}</Text>
        <Text style={[styles.dragonInfoDesc, { color: theme.textMuted }]}>{dragon.desc}</Text>
        <Text style={[styles.dragonInfoStats, { color: theme.textDim }]}>
          ⚔️ ATK {dragon.atk} | ❤️ {dragonHp}/{dragon.hp}
        </Text>
      </View>

      {/* Battle Log */}
      <ScrollView
        ref={logRef}
        style={[styles.logContainer, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: theme.border }]}
      >
        {battleLog.length === 0 ? (
          <Text style={[styles.logEmpty, { color: theme.textDim }]}>전투 시작!</Text>
        ) : (
          battleLog.slice(-15).map((log, i) => (
            <Text
              key={i}
              style={[
                styles.logEntry,
                { color: log.includes('처치') || log.includes('보너스') ? '#4ade80' : log.includes('쓰러') ? '#f87171' : log.includes('등장') ? '#facc15' : theme.textMuted },
              ]}
            >
              {log}
            </Text>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  arena: {
    margin: 12, borderRadius: 18, padding: 14,
    borderWidth: 1, minHeight: 200, overflow: 'hidden',
  },
  arenaLabel: {
    textAlign: 'center', fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 4, marginBottom: 8,
  },
  combatants: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', minHeight: 150 },
  heroSide: { alignItems: 'center', flex: 1 },
  heroWithPet: { position: 'relative', alignItems: 'center' },
  petCompanion: {
    position: 'absolute', bottom: 0, right: -8,
    alignItems: 'center', justifyContent: 'center',
  },
  petGlowRing: {
    position: 'absolute', width: 38, height: 38,
    borderRadius: 19, borderWidth: 2,
  },
  petCompanionEmoji: { fontSize: 26 },
  dragonSide: { alignItems: 'center', flex: 1 },
  dragonWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  dragonHitFlash: {
    position: 'absolute', inset: 0,
    backgroundColor: '#ff4444',
    borderRadius: 20,
  },
  hpBarSmall: { width: 90, marginTop: 4 },
  combatantName: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  stageLabel: { fontSize: 9 },
  vsContainer: { alignItems: 'center', paddingBottom: 20, gap: 4 },
  vsText: { fontSize: 18, fontWeight: '900', color: 'rgba(255,255,255,0.2)', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  buffIcon: { fontSize: 12, color: '#fbbf24' },
  deadOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 18 },
  deadText: { fontSize: 24, marginBottom: 8 },
  deadSub: { fontSize: 12, textAlign: 'center' },
  skillsScroll: { maxHeight: 90 },
  skillsContent: { paddingHorizontal: 12, gap: 8, flexDirection: 'row', alignItems: 'center' },
  skillBtn: {
    minWidth: 80, padding: 8, borderRadius: 10, alignItems: 'center',
    borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  skillEmoji: { fontSize: 20, marginBottom: 2 },
  skillName: { fontSize: 11, fontWeight: '700' },
  skillDesc: { fontSize: 8, textAlign: 'center', marginTop: 2 },
  skillCd: { fontSize: 9, color: '#f87171', fontWeight: '700' },
  attackBtn: {
    marginHorizontal: 12, marginVertical: 8, padding: 16,
    borderRadius: 14, backgroundColor: '#dc2626', alignItems: 'center',
    shadowColor: '#dc2626', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10,
    elevation: 6,
  },
  attackBtnDisabled: { backgroundColor: '#555', shadowOpacity: 0 },
  attackBtnText: { fontSize: 18, fontWeight: '900', color: '#fff', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  dragonInfo: {
    marginHorizontal: 12, marginBottom: 8, borderRadius: 10,
    padding: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  dragonInfoName: { fontSize: 12, fontWeight: '900' },
  dragonInfoDesc: { flex: 1, fontSize: 10 },
  dragonInfoStats: { fontSize: 10 },
  logContainer: {
    flex: 1, marginHorizontal: 12, marginBottom: 12,
    borderRadius: 10, padding: 10, borderWidth: 1, maxHeight: 130,
  },
  logEmpty: { fontSize: 11, textAlign: 'center', padding: 8 },
  logEntry: { fontSize: 11, paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)' },
  lockedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  lockedEmoji: { fontSize: 60, marginBottom: 16 },
  lockedTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  lockedDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  lockedLevel: { fontSize: 18, fontWeight: '900', marginTop: 16 },
});
