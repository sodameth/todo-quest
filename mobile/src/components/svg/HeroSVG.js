import React, { useEffect } from 'react';
import Svg, { Rect, Circle, Ellipse, Path, Polygon, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { HERO_TIERS } from '../../constants/heroData';

const AnimatedSvgView = Animated.createAnimatedComponent(
  require('react-native').View
);

export default function HeroSVG({ tier, size = 120, animate = false, shaking = false, hpRatio = 1 }) {
  const t = HERO_TIERS[tier] || HERO_TIERS[0];
  const w = hpRatio < 0.3;

  const breatheY = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const auraScale = useSharedValue(0.92);

  useEffect(() => {
    if (animate && !shaking) {
      breatheY.value = withRepeat(
        withTiming(-3, { duration: 1250, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [animate, shaking]);

  useEffect(() => {
    if (shaking) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 70 }),
        withTiming(8, { duration: 70 }),
        withTiming(-5, { duration: 70 }),
        withTiming(5, { duration: 70 }),
        withTiming(0, { duration: 70 })
      );
    }
  }, [shaking]);

  useEffect(() => {
    if (t.aura) {
      auraScale.value = withRepeat(
        withTiming(1.04, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [t.aura]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: breatheY.value },
      { translateX: shakeX.value },
    ],
    opacity: w ? 0.7 : 1,
  }));

  return (
    <AnimatedSvgView style={[{ width: size, height: size }, containerStyle]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* Aura */}
        {t.aura && (
          <Circle cx="60" cy="65" r="50" fill="none" stroke={t.aura} strokeWidth="3" opacity="0.6" />
        )}
        {/* Cape */}
        {t.cape && (
          <Path
            d="M42,52 L38,105 Q60,115 82,105 L78,52"
            fill={t.cape}
            opacity="0.85"
          />
        )}
        {/* Legs */}
        <Rect x="48" y="90" width="10" height="20" rx="3" fill="#5C4033" />
        <Rect x="62" y="90" width="10" height="20" rx="3" fill="#5C4033" />
        {/* Boots */}
        <Rect x="46" y="104" width="14" height="8" rx="4" fill={tier >= 2 ? t.armor : "#6B4226"} />
        <Rect x="60" y="104" width="14" height="8" rx="4" fill={tier >= 2 ? t.armor : "#6B4226"} />
        {/* Body */}
        <Rect x="42" y="52" width="36" height="40" rx="6" fill={t.armor} />
        <Rect x="46" y="56" width="28" height="8" rx="2" fill={tier >= 3 ? "#FFF5" : "#0002"} opacity="0.5" />
        {/* Arms */}
        <Rect x="30" y="55" width="12" height="28" rx="5" fill={t.armor} />
        <Rect x="78" y="55" width="12" height="28" rx="5" fill={t.armor} />
        {/* Hands */}
        <Circle cx="36" cy="86" r="5" fill="#FDBCB4" />
        <Circle cx="84" cy="86" r="5" fill="#FDBCB4" />
        {/* Shield */}
        {t.shield && (
          <G transform="translate(22,62)">
            <Path
              d="M0,0 L16,0 L16,20 L8,26 L0,20 Z"
              fill={tier >= 3 ? "#DAA520" : "#6B8E6B"}
              stroke="#FFF3"
              strokeWidth="1"
            />
          </G>
        )}
        {/* Weapon */}
        <G transform="translate(82,50) rotate(15)">
          <Rect x="-2" y="-30" width="4" height="26" rx="1" fill={t.weapon} />
          <Polygon points="-5,-30 5,-30 0,-40" fill={t.weapon} />
          <Rect x="-6" y="-6" width="12" height="3" rx="1.5" fill="#8B6914" />
        </G>
        {/* Head */}
        <Circle cx="60" cy="40" r="16" fill="#FDBCB4" />
        <Path d="M44,36 Q44,22 60,22 Q76,22 76,36" fill="#4A3728" />
        {/* Eyes */}
        <Circle cx="54" cy="40" r="2.5" fill="#2C1810" />
        <Circle cx="66" cy="40" r="2.5" fill="#2C1810" />
        <Circle cx="55" cy="39" r="1" fill="#FFF" />
        <Circle cx="67" cy="39" r="1" fill="#FFF" />
        {/* Mouth */}
        <Path
          d={w ? "M56,47 Q60,45 64,47" : "M56,47 Q60,50 64,47"}
          fill="none"
          stroke="#8B4513"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Helmet */}
        {t.helmet && (
          <>
            <Path
              d="M43,34 Q43,16 60,14 Q77,16 77,34"
              fill={tier >= 3 ? "#DAA520" : "#6B8E8B"}
              opacity="0.9"
            />
            <Rect x="55" y="12" width="10" height="6" rx="2" fill={tier >= 4 ? "#FF6B6B" : "#888"} />
          </>
        )}
        {/* Sparkle for tier >= 3 */}
        {tier >= 3 && (
          <Circle cx="35" cy="30" r="2" fill="#FFD700" opacity="0.8" />
        )}
      </Svg>
    </AnimatedSvgView>
  );
}
