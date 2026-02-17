import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function TabBar({ game }) {
  const {
    screen, setScreen, canBattle, isDead, hero, inventory, unlockedAch,
  } = game;

  const tabs = [
    { id: 'todo', label: '📋 할 일', color: '#6366f1' },
    {
      id: 'battle',
      label: '⚔️ 전투',
      color: '#ef4444',
      lock: !canBattle,
      lockLabel: isDead ? '💀 HP 필요' : hero.level < 2 ? '🔒 Lv.2' : '⚔️ 전투',
    },
    { id: 'inventory', label: `🎒 ${inventory.length}`, color: '#f59e0b' },
    { id: 'achievements', label: `🏅 ${unlockedAch.length}`, color: '#a78bfa' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <Pressable
          key={tab.id}
          onPress={() => !tab.lock && setScreen(tab.id)}
          style={[
            styles.tab,
            {
              backgroundColor: screen === tab.id
                ? tab.color
                : 'rgba(255,255,255,0.04)',
              opacity: tab.lock ? 0.4 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: screen === tab.id ? '#fff' : tab.lock ? '#4a4258' : '#8b7fa0',
              },
            ]}
          >
            {tab.lock ? tab.lockLabel || tab.label : tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '700',
    fontSize: 11.5,
  },
});
