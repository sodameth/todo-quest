import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useGameState } from './src/hooks/useGameState';
import { useTimer } from './src/hooks/useTimer';
import HeroCard from './src/components/HeroCard';
import TabBar from './src/components/TabBar';
import DailyQuestBanner from './src/components/DailyQuestBanner';
import TodoScreen from './src/screens/TodoScreen';
import BattleScreen from './src/screens/BattleScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import VictoryScreen from './src/screens/VictoryScreen';
import ProofModal from './src/components/modals/ProofModal';
import UndoModal from './src/components/modals/UndoModal';
import LootModal from './src/components/modals/LootModal';
import AchievementToast from './src/components/modals/AchievementToast';
import LevelUpEffect from './src/components/modals/LevelUpEffect';
import { Colors } from './src/theme/colors';

function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      key: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.1,
    })),
    []
  );

  return (
    <View style={styles.starsContainer} pointerEvents="none">
      {stars.map(s => (
        <View
          key={s.key}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: '#fff',
            opacity: s.opacity,
          }}
        />
      ))}
    </View>
  );
}

function TodoRPG() {
  const now = useTimer();
  const game = useGameState(now);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />
      <Stars />

      {/* Overlays */}
      {game.showLevelUp && <LevelUpEffect level={game.showLevelUp} onDone={() => game.setShowLevelUp(null)} />}
      {game.achToast && <AchievementToast achievement={game.achToast} onDone={() => game.setAchToast(null)} />}
      {game.proofModal && (
        <ProofModal
          todo={game.proofModal}
          onConfirm={url => game.confirmComplete(game.proofModal.id, url)}
          onClose={() => game.setProofModal(null)}
        />
      )}
      {game.undoModal && (
        <UndoModal
          todo={game.undoModal}
          onConfirm={game.confirmUndo}
          onClose={() => game.setUndoModal(null)}
        />
      )}
      {game.lootModal && (
        <LootModal items={game.lootModal} onClose={() => game.setLootModal(null)} />
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>⚔️ TODO QUEST ⚔️</Text>
            <Text style={styles.subtitle}>할 일을 완료하고 용사를 키워 드래곤을 처치하라!</Text>
          </View>

          {/* Hero Card */}
          <HeroCard game={game} />

          {/* Daily Quest */}
          <DailyQuestBanner dailyQuest={game.dailyQuest} />

          {/* Tab Bar */}
          <TabBar game={game} />

          {/* Screens */}
          {game.screen === 'victory' && <VictoryScreen game={game} />}
          {game.screen === 'todo' && <TodoScreen game={game} now={now} />}
          {game.screen === 'battle' && <BattleScreen game={game} />}
          {game.screen === 'inventory' && <InventoryScreen game={game} />}
          {game.screen === 'achievements' && <AchievementsScreen game={game} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <TodoRPG />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  scrollContent: {
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#facc15',
    textShadowColor: '#b8860b',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#8b7fa0',
  },
});
