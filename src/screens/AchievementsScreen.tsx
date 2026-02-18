import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS } from '../constants';

export default function AchievementsScreen() {
  const { unlockedAch, completedCount, victoryDragons, maxCombo, hero, theme } = useGame();

  const earnedCount = unlockedAch.length;
  const totalCount = ACHIEVEMENTS.length;
  const pct = Math.round((earnedCount / totalCount) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.bgCard, borderColor: 'rgba(251,191,36,0.2)' }]}>
          <Text style={styles.summaryEmoji}>🏆</Text>
          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryTitle, { color: '#fbbf24' }]}>업적 달성 현황</Text>
            <Text style={[styles.summaryCount, { color: theme.text }]}>
              {earnedCount} / {totalCount}
            </Text>
            <View style={styles.progressBarWrapper}>
              <View style={[styles.progressBar, { width: `${pct}%` as any }]} />
            </View>
            <Text style={[styles.summaryPct, { color: theme.textMuted }]}>{pct}% 달성</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={[styles.statsCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 통계</Text>
          <View style={styles.statsGrid}>
            {[
              { label: '완료한 퀘스트', value: completedCount, emoji: '✅', color: '#4ade80' },
              { label: '처치한 드래곤', value: victoryDragons, emoji: '🐉', color: '#f87171' },
              { label: '최대 콤보', value: maxCombo, emoji: '🔥', color: '#f97316' },
              { label: '현재 레벨', value: `Lv.${hero.level}`, emoji: '⭐', color: '#facc15' },
            ].map((s, i) => (
              <View key={i} style={[styles.statCell, { backgroundColor: theme.bgCardSecondary, borderColor: theme.border }]}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievement List */}
        <View style={[styles.achCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: '#fbbf24' }]}>🏅 업적 목록</Text>
          {ACHIEVEMENTS.map(a => {
            const earned = unlockedAch.includes(a.id);
            return (
              <View
                key={a.id}
                style={[
                  styles.achItem,
                  {
                    backgroundColor: earned ? 'rgba(251,191,36,0.06)' : 'rgba(0,0,0,0.12)',
                    borderColor: earned ? 'rgba(251,191,36,0.2)' : theme.border,
                    opacity: earned ? 1 : 0.5,
                  },
                ]}
              >
                <View style={[
                  styles.achBadge,
                  {
                    backgroundColor: earned ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: earned ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.06)',
                    opacity: earned ? 1 : 0.3,
                  },
                ]}>
                  <Text style={styles.achEmoji}>{a.emoji}</Text>
                </View>
                <View style={styles.achInfo}>
                  <Text style={[styles.achName, { color: earned ? '#fbbf24' : theme.textDim }]}>{a.name}</Text>
                  <Text style={[styles.achDesc, { color: earned ? theme.textMuted : theme.textDim }]}>{a.desc}</Text>
                </View>
                {earned && (
                  <Text style={styles.achCheck}>✓</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24, gap: 10 },
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 16, borderRadius: 14, borderWidth: 1,
  },
  summaryEmoji: { fontSize: 40 },
  summaryInfo: { flex: 1 },
  summaryTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  summaryCount: { fontSize: 24, fontWeight: '900', marginBottom: 6 },
  progressBarWrapper: {
    height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden', marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  summaryPct: { fontSize: 11 },
  statsCard: { borderRadius: 14, padding: 14, borderWidth: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: {
    flex: 1, minWidth: '45%', padding: 12,
    borderRadius: 10, borderWidth: 1, alignItems: 'center',
  },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 10, textAlign: 'center' },
  achCard: { borderRadius: 14, padding: 14, borderWidth: 1 },
  achItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 6,
  },
  achBadge: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  achEmoji: { fontSize: 18 },
  achInfo: { flex: 1 },
  achName: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  achDesc: { fontSize: 10 },
  achCheck: { fontSize: 14, color: '#4ade80', fontWeight: '700' },
});
