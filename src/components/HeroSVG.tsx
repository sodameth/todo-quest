import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Rect, Path, Polygon, G, Ellipse, Line } from 'react-native-svg';
import { HERO_TIERS } from '../constants';

interface Props {
  tier: number;
  size?: number;
  animate?: boolean;
  hpRatio?: number;
}

export const HeroSVG: React.FC<Props> = ({ tier, size = 80, animate = false, hpRatio = 1 }) => {
  const t = HERO_TIERS[tier] || HERO_TIERS[0];
  const w = hpRatio < 0.3;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) { breathe.setValue(0); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: -3, duration: 1200, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animate]);

  return (
    <Animated.View style={{ transform: [{ translateY: breathe }] }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* Cape */}
        {t.cape && (
          <Path d={`M42,52 L38,105 Q60,115 82,105 L78,52`} fill={t.cape} opacity={0.85} />
        )}
        {/* Legs */}
        <Rect x="48" y="90" width="10" height="20" rx="3" fill="#5C4033" />
        <Rect x="62" y="90" width="10" height="20" rx="3" fill="#5C4033" />
        <Rect x="46" y="104" width="14" height="8" rx="4" fill={tier >= 2 ? t.armor : '#6B4226'} />
        <Rect x="60" y="104" width="14" height="8" rx="4" fill={tier >= 2 ? t.armor : '#6B4226'} />
        {/* Body */}
        <Rect x="42" y="52" width="36" height="40" rx="6" fill={t.armor} />
        <Rect x="46" y="56" width="28" height="8" rx="2" fill={tier >= 3 ? '#FFF5' : '#0002'} opacity={0.5} />
        {/* Arms */}
        <Rect x="30" y="55" width="12" height="28" rx="5" fill={t.armor} />
        <Rect x="78" y="55" width="12" height="28" rx="5" fill={t.armor} />
        <Circle cx="36" cy="86" r="5" fill="#FDBCB4" />
        <Circle cx="84" cy="86" r="5" fill="#FDBCB4" />
        {/* Shield */}
        {t.shield && (
          <G transform="translate(22,62)">
            <Path d="M0,0 L16,0 L16,20 L8,26 L0,20 Z" fill={tier >= 3 ? '#DAA520' : '#6B8E6B'} stroke="#FFF3" strokeWidth={1} />
          </G>
        )}
        {/* Weapon */}
        <G transform="translate(82,50) rotate(15)">
          <Rect x="-2" y="-30" width="4" height="26" rx="1" fill={t.weapon} />
          <Polygon points="-5,-30 5,-30 0,-40" fill={t.weapon} />
          <Rect x="-6" y="-6" width="12" height="3" rx="1.5" fill="#8B6914" />
        </G>
        {/* Head */}
        <Circle cx="60" cy="40" r="16" fill={w ? '#C0A898' : '#FDBCB4'} />
        <Path d="M44,36 Q44,22 60,22 Q76,22 76,36" fill="#4A3728" />
        <Circle cx="54" cy="40" r="2.5" fill="#2C1810" />
        <Circle cx="66" cy="40" r="2.5" fill="#2C1810" />
        <Circle cx="55" cy="39" r="1" fill="#FFF" />
        <Circle cx="67" cy="39" r="1" fill="#FFF" />
        <Path d={w ? 'M56,47 Q60,45 64,47' : 'M56,47 Q60,50 64,47'} fill="none" stroke="#8B4513" strokeWidth={1.5} strokeLinecap="round" />
        {/* Helmet */}
        {t.helmet && (
          <>
            <Path d="M43,34 Q43,16 60,14 Q77,16 77,34" fill={tier >= 3 ? '#DAA520' : '#6B8E8B'} opacity={0.9} />
            <Rect x="55" y="12" width="10" height="6" rx="2" fill={tier >= 4 ? '#FF6B6B' : '#888'} />
          </>
        )}
        {/* Aura */}
        {t.aura && (
          <Circle cx="60" cy="65" r="50" fill="none" stroke={t.aura} strokeWidth="3" opacity={0.4} />
        )}
      </Svg>
    </Animated.View>
  );
};
