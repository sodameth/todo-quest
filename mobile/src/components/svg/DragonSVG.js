import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Line, Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { DRAGON_STAGES } from '../../constants/dragonStages';

export default function DragonSVG({ stage, shaking = false, size = 140, hit = false }) {
  const d = DRAGON_STAGES[stage];
  const s = d.size;

  const floatY = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (!shaking) {
      floatY.value = withRepeat(
        withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [shaking]);

  useEffect(() => {
    if (shaking) {
      shakeX.value = withSequence(
        withTiming(8, { duration: 70 }),
        withTiming(-8, { duration: 70 }),
        withTiming(5, { duration: 70 }),
        withTiming(-5, { duration: 70 }),
        withTiming(0, { duration: 70 })
      );
    }
  }, [shaking]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { translateX: shakeX.value },
      { scale: 0.7 + s * 0.3 },
    ],
    opacity: hit ? 1.5 : 1,
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, containerStyle]}>
      <Svg width={size} height={size} viewBox="0 0 140 140">
        {/* Aura */}
        <Circle cx="70" cy="75" r={45 * s} fill={d.color} opacity="0.08" />
        {/* Wings */}
        <Path
          d={`M${70 - 20 * s},60 Q${70 - 55 * s},20 ${70 - 50 * s},55 Q${70 - 40 * s},45 ${70 - 15 * s},65`}
          fill={d.wingColor}
          stroke={d.bodyColor}
          strokeWidth="1.5"
          opacity="0.8"
        />
        <Path
          d={`M${70 + 20 * s},60 Q${70 + 55 * s},20 ${70 + 50 * s},55 Q${70 + 40 * s},45 ${70 + 15 * s},65`}
          fill={d.wingColor}
          stroke={d.bodyColor}
          strokeWidth="1.5"
          opacity="0.8"
        />
        {/* Tail */}
        <Path
          d={`M${70 + 10 * s},85 Q${70 + 35 * s},95 ${70 + 45 * s},80 Q${70 + 50 * s},70 ${70 + 55 * s},72`}
          fill="none"
          stroke={d.bodyColor}
          strokeWidth={5 * s}
          strokeLinecap="round"
        />
        {/* Body */}
        <Ellipse cx="70" cy={78} rx={22 * s} ry={18 * s} fill={d.bodyColor} />
        <Ellipse cx="70" cy={82} rx={14 * s} ry={12 * s} fill={d.color} opacity="0.3" />
        {/* Legs */}
        <Ellipse cx={70 - 12 * s} cy={96} rx={6 * s} ry={8 * s} fill={d.bodyColor} />
        <Ellipse cx={70 + 12 * s} cy={96} rx={6 * s} ry={8 * s} fill={d.bodyColor} />
        {/* Head */}
        <Ellipse cx="70" cy={38 * s + 12} rx={14 * s} ry={10 * s} fill={d.bodyColor} />
        {/* Horns */}
        <Line
          x1={70 - 8 * s} y1={38 * s + 5}
          x2={70 - 14 * s} y2={38 * s - 8}
          stroke={d.color} strokeWidth={2.5 * s} strokeLinecap="round"
        />
        <Line
          x1={70 + 8 * s} y1={38 * s + 5}
          x2={70 + 14 * s} y2={38 * s - 8}
          stroke={d.color} strokeWidth={2.5 * s} strokeLinecap="round"
        />
        {/* Eyes */}
        <Ellipse cx={70 - 5 * s} cy={38 * s + 10} rx={3.5 * s} ry={3 * s} fill={d.eyeColor} />
        <Ellipse cx={70 + 5 * s} cy={38 * s + 10} rx={3.5 * s} ry={3 * s} fill={d.eyeColor} />
        <Ellipse cx={70 - 5 * s} cy={38 * s + 10} rx={1.5 * s} ry={2.5 * s} fill="#111" />
        <Ellipse cx={70 + 5 * s} cy={38 * s + 10} rx={1.5 * s} ry={2.5 * s} fill="#111" />
        {/* Crown for final stage */}
        {stage === 4 && (
          <Polygon
            points={`${70 - 10},${38 * s} ${70 - 6},${38 * s - 10} ${70 - 2},${38 * s - 3} ${70 + 2},${38 * s - 12} ${70 + 6},${38 * s - 3} ${70 + 10},${38 * s}`}
            fill="#FFD700"
            stroke="#DAA520"
            strokeWidth="1"
          />
        )}
      </Svg>
    </Animated.View>
  );
}
