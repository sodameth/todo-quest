import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACHIEVEMENTS } from '../constants/achievements';
import Badge from '../components/ui/Badge';
import { Colors } from '../theme/colors';

export default function AchievementsScreen({ game }) {
  const { unlockedAch } = game;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏅 업적 ({unlockedAch.length}/{ACHIEVEMENTS.length})</Text>
      {ACHIEVEMENTS.map(a => {
        const earned = unlockedAch.includes(a.id);
        return (
          <View
            key={a.id}
            style={[styles.achRow, {
              backgroundColor: earned ? 'rgba(251,191,36,0.06)' : 'rgba(0,0,0,0.15)',
              borderColor: earned ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.04)',
              opacity: earned ? 1 : 0.5,
            }]}
          >
            <Badge emoji={a.emoji} name={a.name} earned={earned} small />
            <View style={{ flex: 1 }}>
              <Text style={[styles.achName, { color: earned ? '#fbbf24' : '#6b5f7b' }]}>{a.name}</Text>
              <Text style={[styles.achDesc, { color: earned ? '#8b7fa0' : '#4a4258' }]}>{a.desc}</Text>
            </View>
            {earned && <Text style={styles.achCheck}>✓</Text>}
          </View>
        );
      })}
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
  title: { fontSize: 11, color: '#fbbf24', fontWeight: '700', marginBottom: 12 },
  achRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  achName: { fontSize: 13, fontWeight: '700' },
  achDesc: { fontSize: 10 },
  achCheck: { fontSize: 10, color: '#4ade80', fontWeight: '700' },
});
