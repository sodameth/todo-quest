import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function FireBreath({ onDone }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(0.8, { duration: 300 });
    const t = setTimeout(() => onDone?.(), 700);
    return () => clearTimeout(t);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const colors = ['#FF4444', '#FF8C00', '#FFD700'];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Svg width={120} height={80} viewBox="0 0 120 80">
        {colors.map((color, i) => (
          <Ellipse
            key={i}
            cx={100 - i * 25}
            cy={40 + i * 5}
            rx={20 - i * 3}
            ry={15 - i * 2}
            fill={color}
            opacity="0.8"
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '30%',
    left: -20,
    zIndex: 50,
  },
});
