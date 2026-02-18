import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

export default function DamageNumber({ value, color, x, y, onDone }) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-60, { duration: 900, easing: Easing.out(Easing.ease) });
    scale.value = withSequence(
      withTiming(1.3, { duration: 270 }),
      withTiming(0.8, { duration: 630 })
    );
    opacity.value = withTiming(0, { duration: 900, easing: Easing.out(Easing.ease) }, () => {
      if (onDone) runOnJS(onDone)();
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.Text
      style={[
        styles.text,
        { color, left: x, top: y },
        animatedStyle,
      ]}
    >
      {value > 0 ? `-${value}` : value}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    fontWeight: '900',
    fontSize: 20,
    fontFamily: 'PressStart2P',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    zIndex: 60,
  },
});
