import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { getHeroTitle } from '../../constants/heroData';

export default function LevelUpEffect({ level, onDone }) {
  const overlayOpacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const iconRotation = useSharedValue(0);
  const iconScale = useSharedValue(0.5);

  useEffect(() => {
    overlayOpacity.value = withSequence(
      withTiming(1, { duration: 220 }),
      withTiming(1, { duration: 1560 }),
      withTiming(0, { duration: 420 })
    );
    scale.value = withSequence(
      withTiming(1.15, { duration: 360 }),
      withTiming(1, { duration: 240 })
    );
    iconRotation.value = withTiming(360, { duration: 800, easing: Easing.out(Easing.ease) });
    iconScale.value = withSequence(
      withTiming(1.3, { duration: 400 }),
      withTiming(1, { duration: 400 })
    );
    const t = setTimeout(() => onDone?.(), 2200);
    return () => clearTimeout(t);
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${iconRotation.value}deg` },
      { scale: iconScale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <Animated.Text style={[styles.icon, iconStyle]}>⬆️</Animated.Text>
        <Text style={styles.label}>LEVEL UP!</Text>
        <Text style={styles.level}>Lv.{level}</Text>
        <Text style={styles.title}>{getHeroTitle(level)}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 56,
    marginBottom: 8,
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 18,
    color: '#FFD700',
    textShadowColor: '#FFD70088',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  level: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  title: {
    fontSize: 14,
    color: '#FBBF24',
    marginTop: 8,
  },
});
