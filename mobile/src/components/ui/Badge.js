import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Badge({ emoji, name, earned, small }) {
  const size = small ? 32 : 40;
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          backgroundColor: earned ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
          borderColor: earned ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.06)',
          opacity: earned ? 1 : 0.3,
        },
      ]}
    >
      <Text style={{ fontSize: small ? 14 : 18 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
