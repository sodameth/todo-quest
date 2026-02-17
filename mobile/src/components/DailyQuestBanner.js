import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DailyQuestBanner({ dailyQuest }) {
  const completed = dailyQuest.completed;

  return (
    <View style={[styles.container, {
      backgroundColor: completed ? 'rgba(74,222,128,0.08)' : 'rgba(251,191,36,0.06)',
      borderColor: completed ? 'rgba(74,222,128,0.2)' : 'rgba(251,191,36,0.15)',
    }]}>
      <Text style={{ fontSize: 18 }}>{dailyQuest.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: completed ? '#4ade80' : '#fbbf24' }]}>
          🎯 일일 퀘스트{completed ? ' ✓ 완료!' : ''}
        </Text>
        <Text style={styles.desc}>{dailyQuest.desc}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.progress, { color: completed ? '#4ade80' : '#fbbf24' }]}>
          {dailyQuest.progress}/{dailyQuest.target}
        </Text>
        <Text style={styles.xp}>+{dailyQuest.xp}xp</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
  },
  label: { fontSize: 10, fontWeight: '700', marginBottom: 1 },
  desc: { fontSize: 12, color: '#e8e0f0' },
  progress: { fontSize: 11, fontWeight: '900' },
  xp: { fontSize: 9, color: '#8b7fa0' },
});
