import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SKILLS } from '../constants/skills';
import { DRAGON_STAGES } from '../constants/dragonStages';
import HeroSVG from '../components/svg/HeroSVG';
import DragonSVG from '../components/svg/DragonSVG';
import SlashEffect from '../components/svg/SlashEffect';
import FireBreath from '../components/svg/FireBreath';
import DamageNumber from '../components/ui/DamageNumber';
import ProgressBar from '../components/ui/ProgressBar';
import { Colors } from '../theme/colors';

export default function BattleScreen({ game }) {
  const {
    hero, stats, heroTier, dragonStage, dragonHp, dragon,
    heroShaking, dragonShaking, dragonHit, showSlash, showFire,
    dmgNums, attacking, skillCooldowns, activeBuffs, battleLog,
    attack, useSkill, removeDmg, setShowSlash, setShowFire, logRef,
  } = game;

  return (
    <View>
      {/* Battle Arena */}
      <View style={styles.arena}>
        <Text style={styles.arenaTitle}>— BATTLE —</Text>
        <View style={styles.fighters}>
          <View style={styles.heroSide}>
            <HeroSVG tier={heroTier} size={85} animate={!attacking} shaking={heroShaking} hpRatio={hero.hp / stats.maxHp} />
            <View style={{ width: 85 }}>
              <ProgressBar value={hero.hp} max={stats.maxHp} color="#4ade80" height={7} label={`${hero.hp}`} />
            </View>
          </View>

          {showSlash && <SlashEffect onDone={() => setShowSlash(false)} />}
          {showFire && <FireBreath onDone={() => setShowFire(false)} />}
          {dmgNums.map(d => (
            <DamageNumber key={d.id} {...d} onDone={() => removeDmg(d.id)} />
          ))}

          <View style={styles.dragonSide}>
            <DragonSVG stage={dragonStage} shaking={dragonShaking} size={115} hit={dragonHit} />
            <View style={{ width: 90 }}>
              <ProgressBar value={dragonHp} max={dragon.hp} color="#ef4444" height={7} label={`${dragonHp}`} />
            </View>
            <Text style={styles.dragonName}>{dragon.name} ({dragonStage + 1}/{DRAGON_STAGES.length})</Text>
          </View>
        </View>
      </View>

      {/* Skills */}
      <View style={styles.skillsRow}>
        {SKILLS.filter(s => hero.level >= s.unlock).map(skill => {
          const cd = skillCooldowns[skill.id] || 0;
          const active = (skill.id === 'crit' && activeBuffs.crit) ||
            (skill.id === 'shield' && activeBuffs.shield) ||
            (skill.id === 'fury' && activeBuffs.fury > 0);

          return (
            <Pressable
              key={skill.id}
              onPress={() => cd === 0 && !attacking && useSkill(skill)}
              disabled={cd > 0 || attacking}
              style={[styles.skillBtn, {
                borderColor: active ? skill.color + '88' : cd > 0 ? 'transparent' : skill.color + '33',
                backgroundColor: active ? skill.color + '22' : cd > 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                opacity: cd > 0 ? 0.5 : 1,
              }]}
            >
              <Text style={{ fontSize: 18 }}>{skill.emoji}</Text>
              <Text style={[styles.skillName, { color: cd > 0 ? '#4a4258' : skill.color }]}>{skill.name}</Text>
              {cd > 0 && <Text style={styles.skillCD}>CD:{cd}</Text>}
            </Pressable>
          );
        })}
      </View>

      {/* Attack Button */}
      <Pressable
        onPress={attack}
        disabled={attacking}
        style={[styles.attackBtn, {
          backgroundColor: attacking ? '#555' : '#dc2626',
          opacity: attacking ? 0.6 : 1,
        }]}
      >
        <Text style={styles.attackBtnText}>
          {attacking ? '⏳ 전투 중...' : '⚔️ 공격하기!'}
        </Text>
      </Pressable>

      {/* Battle Log */}
      <ScrollView ref={logRef} style={styles.logContainer} nestedScrollEnabled>
        {battleLog.length === 0 ? (
          <Text style={styles.logEmpty}>전투 시작!</Text>
        ) : (
          battleLog.slice(-15).map((log, i) => (
            <Text
              key={i}
              style={[styles.logEntry, {
                color: log.includes('처치') || log.includes('보너스') || log.includes('합류') ? '#4ade80' :
                  log.includes('쓰러') ? '#f87171' :
                    log.includes('등장') ? '#facc15' : '#a09ab0',
              }]}
            >
              {log}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  arena: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    backgroundColor: 'rgba(15,10,30,0.95)',
    minHeight: 240,
    overflow: 'hidden',
    position: 'relative',
  },
  arenaTitle: {
    textAlign: 'center',
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#f8717155',
    letterSpacing: 3,
    marginBottom: 6,
  },
  fighters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    minHeight: 170,
    position: 'relative',
  },
  heroSide: { alignItems: 'center', zIndex: 10 },
  dragonSide: { alignItems: 'center', zIndex: 10 },
  dragonName: { fontSize: 8, color: '#f87171', marginTop: 2 },
  skillsRow: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  skillBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  skillName: { fontWeight: '700', fontSize: 10.5, marginTop: 2 },
  skillCD: { fontSize: 8, color: '#f87171', marginTop: 1 },
  attackBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 5,
  },
  attackBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  logContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 10,
    maxHeight: 130,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  logEmpty: { color: '#4a4258', fontSize: 11, textAlign: 'center', padding: 8 },
  logEntry: {
    fontSize: 11,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
  },
});
