import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

export default function FloatingText({ text, color, onDone }) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(0, { duration: 900, easing: Easing.out(Easing.ease) });
    translateY.value = withTiming(-50, { duration: 900, easing: Easing.out(Easing.ease) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text
      style={[
        styles.text,
        { color, textShadowColor: color },
        animatedStyle,
      ]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    fontWeight: '900',
    fontSize: 18,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    zIndex: 100,
  },
});
