import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import HeroSVG from '../components/svg/HeroSVG';
import { getHeroTitle } from '../constants/heroData';

export default function VictoryScreen({ game }) {
  const { hero, heroTier, completedCount, restartAfterVictory } = game;

  const bounceScale = useSharedValue(1);

  useEffect(() => {
    bounceScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 250 }),
        withTiming(1.3, { duration: 250 }),
        withTiming(1.1, { duration: 250 }),
        withTiming(1, { duration: 250 })
      ),
      -1
    );
  }, []);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.trophy, trophyStyle]}>🏆</Animated.Text>
      <Text style={styles.title}>축하합니다!</Text>
      <HeroSVG tier={heroTier} size={90} animate />
      <Text style={styles.subtitle}>모든 드래곤을 처치했습니다!</Text>
      <Text style={styles.info}>Lv.{hero.level} {getHeroTitle(hero.level)} · 완료 {completedCount}건</Text>
      <Pressable onPress={restartAfterVictory} style={styles.restartBtn}>
        <Text style={styles.restartBtnText}>🔄 새로운 모험 시작</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#facc15',
    backgroundColor: 'rgba(30,25,50,0.97)',
  },
  trophy: { fontSize: 56, marginBottom: 12 },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#facc15',
    marginBottom: 8,
  },
  subtitle: { color: '#c4b5fd', marginBottom: 6, fontSize: 14 },
  info: { color: '#8b7fa0', marginBottom: 20, fontSize: 12 },
  restartBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#facc15',
  },
  restartBtnText: { color: '#1a1028', fontWeight: '900', fontSize: 14 },
});
