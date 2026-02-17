import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

export default function AchievementToast({ achievement, onDone }) {
  const translateY = useSharedValue(-30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 400 });
    opacity.value = withTiming(1, { duration: 400 });

    // Fade out after 8.5s
    const fadeTimer = setTimeout(() => {
      translateY.value = withTiming(-30, { duration: 1500 });
      opacity.value = withTiming(0, { duration: 1500 });
    }, 8500);

    const doneTimer = setTimeout(() => onDone?.(), 10000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={{ fontSize: 26 }}>{achievement.emoji}</Text>
      <Animated.View>
        <Text style={styles.label}>🏅 업적 달성!</Text>
        <Text style={styles.name}>{achievement.name}</Text>
        <Text style={styles.desc}>{achievement.desc}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 3000,
    backgroundColor: '#1e1932ee',
    borderWidth: 1.5,
    borderColor: 'rgba(251,191,36,0.4)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  label: { fontSize: 10, color: '#fbbf24', fontWeight: '700', marginBottom: 2 },
  name: { fontSize: 14, color: '#e8e0f0', fontWeight: '700' },
  desc: { fontSize: 10, color: '#8b7fa0' },
});
