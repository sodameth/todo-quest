import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function SlashEffect({ onDone }) {
  const opacity1 = useSharedValue(0);

  useEffect(() => {
    opacity1.value = withTiming(1, { duration: 50 });
    const t = setTimeout(() => onDone?.(), 600);
    return () => clearTimeout(t);
  }, []);

  const style1 = useAnimatedStyle(() => ({
    opacity: opacity1.value,
  }));

  return (
    <Animated.View style={[styles.container, style1]}>
      <Svg width={180} height={180} viewBox="0 0 180 180">
        <Line x1="20" y1="160" x2="160" y2="20" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
        <Line x1="160" y1="140" x2="30" y2="30" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -90,
    marginLeft: -90,
    zIndex: 50,
  },
});
