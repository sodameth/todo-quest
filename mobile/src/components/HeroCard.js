import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HeroSVG from './svg/HeroSVG';
import ProgressBar from './ui/ProgressBar';
import FloatingText from './ui/FloatingText';
import { getHeroTitle } from '../constants/heroData';
import { Colors } from '../theme/colors';

export default function HeroCard({ game }) {
  const {
    hero, stats, heroTier, xpNeeded, floats,
    combo, totalAtk, totalDef, equipAtk, equipDef,
    completedCount, victoryDragons, overdueCount, isDead, activePet,
  } = game;

  return (
    <View style={styles.card}>
      {floats.map(f => <FloatingText key={f.id} {...f} />)}
      <View style={styles.row}>
        <View style={styles.heroCol}>
          <HeroSVG tier={heroTier} size={80} animate hpRatio={hero.hp / stats.maxHp} />
          {activePet && (
            <Text style={[styles.petLabel, { color: activePet.color }]}>
              {activePet.emoji} {activePet.name}
            </Text>
          )}
        </View>
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.heroName}>Lv.{hero.level} {getHeroTitle(hero.level)}</Text>
            {combo > 0 && (
              <Text style={styles.comboBadge}>
                🔥 {combo}콤보 x{combo >= 10 ? '2.0' : combo >= 5 ? '1.5' : combo >= 3 ? '1.2' : '1.0'}
              </Text>
            )}
          </View>

          <View style={{ marginBottom: 4 }}>
            <View style={styles.barLabel}>
              <Text style={[styles.barLabelText, { color: '#ef4444' }]}>❤️ HP</Text>
              <Text style={styles.barValue}>{hero.hp}/{stats.maxHp}</Text>
            </View>
            <ProgressBar value={hero.hp} max={stats.maxHp} color="#ef4444" height={9} />
          </View>

          <View style={{ marginBottom: 4 }}>
            <View style={styles.barLabel}>
              <Text style={[styles.barLabelText, { color: '#818cf8' }]}>✨ XP</Text>
              <Text style={styles.barValue}>{hero.xp}/{xpNeeded}</Text>
            </View>
            <ProgressBar value={hero.xp} max={xpNeeded} color="#818cf8" height={9} />
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statText}>⚔️ {totalAtk}{equipAtk > 0 ? `(+${equipAtk})` : ''}</Text>
            <Text style={styles.statText}>🛡️ {totalDef}{equipDef > 0 ? `(+${equipDef})` : ''}</Text>
            <Text style={[styles.statText, { color: '#8b7fa0' }]}>완료{completedCount} 처치{victoryDragons}</Text>
          </View>

          {overdueCount > 0 && (
            <View style={styles.debuffBanner}>
              <Text style={styles.debuffText}>💀 시간 초과 {overdueCount}건 · HP 감소 중</Text>
            </View>
          )}

          {isDead && (
            <View style={styles.deadBanner}>
              <Text style={styles.deadTitle}>💀 용사가 쓰러졌습니다!</Text>
              <Text style={styles.deadSub}>퀘스트를 완료하면 HP가 회복됩니다 (쉬움 +15 / 보통 +30 / 어려움 +50)</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.2)',
    backgroundColor: 'rgba(30,25,50,0.95)',
    position: 'relative',
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 3,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroCol: { alignItems: 'center' },
  petLabel: { fontSize: 9, marginTop: -2 },
  infoCol: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  heroName: { fontWeight: '900', fontSize: 14, color: '#facc15' },
  comboBadge: {
    fontSize: 10,
    color: '#f97316',
    fontWeight: '900',
    backgroundColor: 'rgba(249,115,22,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  barLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  barLabelText: { fontSize: 10 },
  barValue: { fontSize: 10, color: Colors.text.primary },
  statsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statText: { fontSize: 10.5, color: '#a5b4fc' },
  debuffBanner: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  debuffText: { fontSize: 9, color: '#f87171', fontWeight: '700' },
  deadBanner: {
    marginTop: 4,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.35)',
    alignItems: 'center',
  },
  deadTitle: { fontSize: 12, color: '#f87171', fontWeight: '900', marginBottom: 2 },
  deadSub: { fontSize: 9, color: '#f8717199' },
});
