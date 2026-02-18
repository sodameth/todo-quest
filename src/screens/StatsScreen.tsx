import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Dimensions, Platform, Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import { BarChart } from 'react-native-chart-kit';
import { useGame } from '../context/GameContext';
import { DIFFICULTY, getHeroTitle } from '../constants';

const SCREEN_W = Dimensions.get('window').width;

export default function StatsScreen() {
  const { todos, categories, hero, completedCount, victoryDragons, maxCombo, combo, hardCount, onTimeCount, theme, toggleTheme, themeMode } = useGame();

  const stats = useMemo(() => {
    const done = todos.filter(t => t.done);
    const pending = todos.filter(t => !t.done);

    // Difficulty breakdown
    const byDiff = {
      easy: done.filter(t => t.difficulty === 'easy').length,
      medium: done.filter(t => t.difficulty === 'medium').length,
      hard: done.filter(t => t.difficulty === 'hard').length,
    };

    // Category breakdown (top 5)
    const byCat = categories.map(cat => ({
      name: cat.name,
      emoji: cat.emoji,
      color: cat.color,
      count: todos.filter(t => t.category === cat.id && t.done).length,
      total: todos.filter(t => t.category === cat.id).length,
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Weekly completion (last 7 days)
    const now = Date.now();
    const week: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = now - i * 86400000;
      const end = start + 86400000;
      week.push(done.filter(t => t.completedAt && t.completedAt >= start && t.completedAt < end).length);
    }

    // Repeat todos
    const repeatDaily = todos.filter(t => t.repeat === 'daily').length;
    const repeatWeekly = todos.filter(t => t.repeat === 'weekly').length;

    // Completion rate
    const total = todos.length;
    const rate = total > 0 ? Math.round((done.length / total) * 100) : 0;

    return { done, pending, byDiff, byCat, week, repeatDaily, repeatWeekly, total, rate };
  }, [todos, categories]);

  const chartData = {
    labels: ['일', '월', '화', '수', '목', '금', '토'].slice(),
    datasets: [{ data: stats.week.length > 0 ? stats.week : [0, 0, 0, 0, 0, 0, 0] }],
  };

  // Last 7 days labels (actual day names)
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const weekLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    weekLabels.push(dayNames[d.getDay()]);
  }
  chartData.labels = weekLabels;

  const handleShareStats = async () => {
    const text = `⚔️ TODO QUEST 통계 리포트\n\n` +
      `👤 Lv.${hero.level} ${getHeroTitle(hero.level)}\n` +
      `✅ 완료: ${completedCount}개 (완료율 ${stats.rate}%)\n` +
      `📋 진행 중: ${stats.pending.length}개\n` +
      `🐉 드래곤 처치: ${victoryDragons}마리\n` +
      `🔥 최대 콤보: ${maxCombo}\n` +
      `💪 어려움 완료: ${hardCount}개\n` +
      `⏰ 시간 내 완료: ${onTimeCount}회\n\n` +
      `난이도별:\n` +
      `  ⭐ 쉬움: ${stats.byDiff.easy}개\n` +
      `  ⭐⭐ 보통: ${stats.byDiff.medium}개\n` +
      `  ⭐⭐⭐ 어려움: ${stats.byDiff.hard}개\n\n` +
      `#TodoQuest #습관형성 #퀘스트`;

    try {
      const supported = await Sharing.isAvailableAsync();
      if (supported) {
        const fileUri = `${documentDirectory}todoquest_report.txt`;
        await writeAsStringAsync(fileUri, text);
        await Sharing.shareAsync(fileUri, { mimeType: 'text/plain' });
      } else {
        Alert.alert('통계 공유', text);
      }
    } catch {
      Alert.alert('통계', text);
    }
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: themeMode === 'dark' ? '#1e1932' : '#f0eef8',
    backgroundGradientTo: themeMode === 'dark' ? '#16131f' : '#f0eef8',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => theme.textMuted,
    style: { borderRadius: 12 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#6366f1' },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Theme Toggle */}
        <View style={styles.themeRow}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>📊 통계</Text>
          <TouchableOpacity style={[styles.themeBtn, { backgroundColor: theme.bgCard, borderColor: theme.border }]} onPress={toggleTheme}>
            <Text style={{ fontSize: 18 }}>{themeMode === 'dark' ? '🌙' : '☀️'}</Text>
            <Text style={[styles.themeBtnText, { color: theme.textMuted }]}>{themeMode === 'dark' ? '다크' : '라이트'}</Text>
          </TouchableOpacity>
        </View>

        {/* Overview */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>🎯 전체 현황</Text>
          <View style={styles.overviewGrid}>
            {[
              { label: '전체 퀘스트', value: stats.total, color: theme.text },
              { label: '완료', value: stats.done.length, color: '#4ade80' },
              { label: '진행 중', value: stats.pending.length, color: '#fbbf24' },
              { label: '완료율', value: `${stats.rate}%`, color: '#818cf8' },
            ].map((item, i) => (
              <View key={i} style={[styles.overviewCell, { backgroundColor: theme.bgCardSecondary, borderColor: theme.border }]}>
                <Text style={[styles.overviewValue, { color: item.color }]}>{item.value}</Text>
                <Text style={[styles.overviewLabel, { color: theme.textMuted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>📅 최근 7일 완료</Text>
          <BarChart
            data={chartData}
            width={SCREEN_W - 56}
            height={160}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

        {/* Difficulty Breakdown */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>⭐ 난이도별 완료</Text>
          {(Object.entries(stats.byDiff) as [string, number][]).map(([key, count]) => {
            const d = DIFFICULTY[key as keyof typeof DIFFICULTY];
            const total = todos.filter(t => t.difficulty === key && t.done).length;
            const allTotal = todos.filter(t => t.difficulty === key).length;
            const pct = allTotal > 0 ? (count / allTotal) * 100 : 0;
            return (
              <View key={key} style={styles.diffRow}>
                <Text style={[styles.diffLabel, { color: d.color }]}>{d.emoji} {d.label}</Text>
                <View style={styles.diffBarBg}>
                  <View style={[styles.diffBarFill, { width: `${pct}%`, backgroundColor: d.color }]} />
                </View>
                <Text style={[styles.diffCount, { color: theme.textMuted }]}>{count}/{allTotal}</Text>
              </View>
            );
          })}
        </View>

        {/* Category Breakdown */}
        {stats.byCat.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>📂 카테고리별 완료</Text>
            {stats.byCat.map((cat, i) => {
              const pct = cat.total > 0 ? (cat.count / cat.total) * 100 : 0;
              return (
                <View key={i} style={styles.diffRow}>
                  <Text style={[styles.diffLabel, { color: cat.color }]}>{cat.emoji} {cat.name}</Text>
                  <View style={styles.diffBarBg}>
                    <View style={[styles.diffBarFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                  </View>
                  <Text style={[styles.diffCount, { color: theme.textMuted }]}>{cat.count}/{cat.total}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Repeat Todos */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>🔄 반복 퀘스트</Text>
          <View style={styles.repeatGrid}>
            <View style={[styles.repeatCell, { backgroundColor: theme.bgCardSecondary, borderColor: theme.border }]}>
              <Text style={styles.repeatEmoji}>📆</Text>
              <Text style={[styles.repeatValue, { color: '#818cf8' }]}>{stats.repeatDaily}</Text>
              <Text style={[styles.repeatLabel, { color: theme.textMuted }]}>매일 반복</Text>
            </View>
            <View style={[styles.repeatCell, { backgroundColor: theme.bgCardSecondary, borderColor: theme.border }]}>
              <Text style={styles.repeatEmoji}>📅</Text>
              <Text style={[styles.repeatValue, { color: '#a78bfa' }]}>{stats.repeatWeekly}</Text>
              <Text style={[styles.repeatLabel, { color: theme.textMuted }]}>매주 반복</Text>
            </View>
          </View>
        </View>

        {/* Battle Stats */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>⚔️ 전투 기록</Text>
          <View style={styles.battleGrid}>
            {[
              { label: '드래곤 처치', value: victoryDragons, emoji: '🐉', color: '#f87171' },
              { label: '최대 콤보', value: maxCombo, emoji: '🔥', color: '#f97316' },
              { label: '어려움 완료', value: hardCount, emoji: '💪', color: '#fbbf24' },
              { label: '제시간 완료', value: onTimeCount, emoji: '⏰', color: '#4ade80' },
            ].map((s, i) => (
              <View key={i} style={[styles.battleCell, { backgroundColor: theme.bgCardSecondary, borderColor: theme.border }]}>
                <Text style={styles.battleEmoji}>{s.emoji}</Text>
                <Text style={[styles.battleValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.battleLabel, { color: theme.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Share */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShareStats}>
          <Text style={styles.shareBtnText}>📤 통계 공유하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24, gap: 10 },
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pageTitle: { fontSize: 20, fontWeight: '900' },
  themeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1,
  },
  themeBtnText: { fontSize: 12, fontWeight: '700' },
  card: { borderRadius: 14, padding: 14, borderWidth: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  overviewCell: {
    flex: 1, minWidth: '45%', padding: 12,
    borderRadius: 10, borderWidth: 1, alignItems: 'center',
  },
  overviewValue: { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  overviewLabel: { fontSize: 10 },
  chart: { borderRadius: 12, marginHorizontal: -4 },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  diffLabel: { fontSize: 12, fontWeight: '700', width: 70 },
  diffBarBg: { flex: 1, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  diffBarFill: { height: '100%', borderRadius: 5 },
  diffCount: { fontSize: 11, width: 36, textAlign: 'right' },
  repeatGrid: { flexDirection: 'row', gap: 8 },
  repeatCell: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  repeatEmoji: { fontSize: 24, marginBottom: 4 },
  repeatValue: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  repeatLabel: { fontSize: 10 },
  battleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  battleCell: {
    flex: 1, minWidth: '45%', padding: 12,
    borderRadius: 10, borderWidth: 1, alignItems: 'center',
  },
  battleEmoji: { fontSize: 22, marginBottom: 4 },
  battleValue: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  battleLabel: { fontSize: 10, textAlign: 'center' },
  shareBtn: {
    backgroundColor: '#6366f1', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 4,
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 6,
  },
  shareBtnText: { fontSize: 16, fontWeight: '900', color: '#fff' },
});
