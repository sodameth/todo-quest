import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Polygon, G } from 'react-native-svg';
import { DRAGON_STAGES } from '../constants';

interface Props {
  stage: number;
  size?: number;
  hit?: boolean;
}

export const DragonSVG: React.FC<Props> = ({ stage, size = 120, hit = false }) => {
  const d = DRAGON_STAGES[stage];
  const s = d.size;
  const float = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -6, duration: 1500, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    if (hit) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 80, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [hit]);

  return (
    <Animated.View style={{ transform: [{ translateY: float }, { scale }] }}>
      <Svg width={size} height={size} viewBox="0 0 140 140">
        {/* Shadow glow */}
        <Circle cx="70" cy="75" r={45 * s} fill={d.color} opacity={0.06} />
        {/* Wings */}
        <Path
          d={`M${70 - 20 * s},60 Q${70 - 55 * s},20 ${70 - 50 * s},55 Q${70 - 40 * s},45 ${70 - 15 * s},65`}
          fill={d.wingColor}
          stroke={d.bodyColor}
          strokeWidth="1.5"
          opacity={0.85}
        />
        <Path
          d={`M${70 + 20 * s},60 Q${70 + 55 * s},20 ${70 + 50 * s},55 Q${70 + 40 * s},45 ${70 + 15 * s},65`}
          fill={d.wingColor}
          stroke={d.bodyColor}
          strokeWidth="1.5"
          opacity={0.85}
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
        <Ellipse cx="70" cy={82} rx={14 * s} ry={12 * s} fill={d.color} opacity={0.3} />
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
};
