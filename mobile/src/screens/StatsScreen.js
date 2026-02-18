import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { BarChart } from 'react-native-chart-kit';
import { Colors } from '../theme/colors';
import { ACHIEVEMENTS } from '../constants/achievements';

const screenWidth = Dimensions.get('window').width - 64;

export default function StatsScreen({ game }) {
  const {
    completedCount,
    hero,
    maxCombo,
    victoryDragons,
    unlockedAch,
    hardCount,
    onTimeCount,
    dragonsKilled,
    inventory,
    pets,
    heroTier,
    xpNeeded,
    todos,
  } = game;

  const pendingCount = todos.filter(t => !t.done).length;
  const doneCount = todos.filter(t => t.done).length;

  const chartData = {
    labels: ['완료', '어려움', '정시', '드래곤', '업적'],
    datasets: [
      {
        data: [
          completedCount || 0,
          hardCount || 0,
          onTimeCount || 0,
          dragonsKilled || 0,
          unlockedAch.length || 0,
        ],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#1a1028',
    backgroundGradientTo: '#1a1028',
    color: (opacity = 1) => `rgba(163, 139, 250, ${opacity})`,
    labelColor: () => '#8b7fa0',
    barPercentage: 0.6,
    decimalPlaces: 0,
    propsForBackgroundLines: {
      stroke: 'rgba(255,255,255,0.05)',
    },
  };

  const handleExport = async () => {
    const statsData = {
      exportedAt: new Date().toISOString(),
      hero: {
        level: hero.level,
        xp: hero.xp,
        xpNeeded,
        tier: heroTier,
        hp: hero.hp,
      },
      todos: {
        completed: completedCount,
        pending: pendingCount,
        done: doneCount,
      },
      battle: {
        dragonsKilled: dragonsKilled || 0,
        victoryDragons: victoryDragons || 0,
      },
      records: {
        maxCombo: maxCombo || 0,
        hardCompleted: hardCount || 0,
        onTimeCompleted: onTimeCount || 0,
      },
      achievements: {
        unlocked: unlockedAch.length,
        total: ACHIEVEMENTS.length,
        ids: unlockedAch,
      },
      inventory: inventory.length,
      pets: pets.length,
    };

    try {
      const json = JSON.stringify(statsData, null, 2);
      const filename = `todo-quest-stats-${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'TODO QUEST 스탯 내보내기',
        });
      } else {
        Alert.alert('저장 완료', `파일이 저장되었습니다:\n${fileUri}`);
      }
    } catch (e) {
      Alert.alert('오류', '내보내기에 실패했습니다: ' + e.message);
    }
  };

  const statRows = [
    { icon: '✅', label: '완료한 퀘스트', value: completedCount || 0, color: Colors.green },
    { icon: '⚔️', label: '처치한 드래곤', value: dragonsKilled || 0, color: Colors.hp },
    { icon: '🏆', label: '빅토리 횟수', value: victoryDragons || 0, color: Colors.gold },
    { icon: '🔥', label: '최대 콤보', value: maxCombo || 0, color: Colors.orange },
    { icon: '💎', label: '어려운 퀘스트', value: hardCount || 0, color: Colors.purple },
    { icon: '⏰', label: '정시 완료', value: onTimeCount || 0, color: Colors.blue },
    { icon: '🏅', label: '업적 달성', value: `${unlockedAch.length}/${ACHIEVEMENTS.length}`, color: Colors.gold },
    { icon: '🎒', label: '보유 아이템', value: inventory.length, color: Colors.orange },
    { icon: '🐾', label: '보유 펫', value: pets.length, color: Colors.pink },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 스탯 & 기록</Text>

      {/* Hero Summary */}
      <View style={styles.heroSummary}>
        <View style={styles.heroSummaryRow}>
          <Text style={styles.heroTierText}>{heroTier}</Text>
          <Text style={styles.heroLevelText}>Lv.{hero.level}</Text>
        </View>
        <View style={styles.xpBar}>
          <View
            style={[
              styles.xpFill,
              { width: `${Math.min(100, (hero.xp / (xpNeeded || 1)) * 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.xpText}>
          XP {hero.xp} / {xpNeeded}
        </Text>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={screenWidth}
          height={160}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars
          withInnerLines
        />
      </View>

      {/* Stat Rows */}
      <View style={styles.statsGrid}>
        {statRows.map((row, i) => (
          <View key={i} style={styles.statRow}>
            <Text style={styles.statIcon}>{row.icon}</Text>
            <Text style={styles.statLabel}>{row.label}</Text>
            <Text style={[styles.statValue, { color: row.color }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Export Button */}
      <Pressable style={styles.exportButton} onPress={handleExport}>
        <Text style={styles.exportButtonText}>📤 스탯 내보내기 (JSON)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg.subtle,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  title: {
    fontSize: 11,
    color: Colors.gold,
    fontWeight: '700',
    marginBottom: 12,
  },
  heroSummary: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.gold,
  },
  heroSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroTierText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  heroLevelText: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '700',
  },
  xpBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpFill: {
    height: '100%',
    backgroundColor: Colors.xp,
    borderRadius: 3,
  },
  xpText: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(26,16,40,0.8)',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  chart: {
    borderRadius: 10,
  },
  statsGrid: {
    gap: 4,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  statIcon: {
    fontSize: 14,
    width: 24,
  },
  statLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  exportButton: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  exportButtonText: {
    fontSize: 12,
    color: Colors.indigo,
    fontWeight: '700',
  },
});
