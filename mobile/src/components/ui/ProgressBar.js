import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProgressBar({ value, max, color, height = 14, label }) {
  const pct = Math.max(0, (value / max) * 100);
  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${pct}%`,
            backgroundColor: color,
            height: '100%',
          },
        ]}
      />
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    borderRadius: 7,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  label: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
