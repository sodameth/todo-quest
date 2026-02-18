import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// DIAGNOSTIC MODE: 최소한의 앱으로 Expo 연결 테스트
export default function App() {
  const [status, setStatus] = useState('Step 1: Basic render OK');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    async function diagnose() {
      const errs = [];

      // Step 2: Test expo-font
      try {
        const Font = require('expo-font');
        setStatus('Step 2: expo-font loaded');
        await Font.loadAsync({
          'PressStart2P': require('./assets/fonts/PressStart2P-Regular.ttf'),
        });
        setStatus('Step 2: Font loaded OK');
      } catch (e) {
        errs.push('expo-font: ' + e.message);
      }

      // Step 3: Test react-native-safe-area-context
      try {
        require('react-native-safe-area-context');
        setStatus('Step 3: safe-area-context OK');
      } catch (e) {
        errs.push('safe-area-context: ' + e.message);
      }

      // Step 4: Test react-native-reanimated
      try {
        require('react-native-reanimated');
        setStatus('Step 4: reanimated OK');
      } catch (e) {
        errs.push('reanimated: ' + e.message);
      }

      // Step 5: Test react-native-svg
      try {
        require('react-native-svg');
        setStatus('Step 5: svg OK');
      } catch (e) {
        errs.push('svg: ' + e.message);
      }

      // Step 6: Test expo-haptics
      try {
        require('expo-haptics');
        setStatus('Step 6: haptics OK');
      } catch (e) {
        errs.push('haptics: ' + e.message);
      }

      // Step 7: Test expo-image-picker
      try {
        require('expo-image-picker');
        setStatus('Step 7: image-picker OK');
      } catch (e) {
        errs.push('image-picker: ' + e.message);
      }

      // Step 8: Test our hooks
      try {
        require('./src/theme/colors');
        require('./src/hooks/useTimer');
        require('./src/hooks/useGameState');
        setStatus('Step 8: hooks OK');
      } catch (e) {
        errs.push('hooks: ' + e.message);
      }

      if (errs.length === 0) {
        setStatus('ALL OK! All modules loaded successfully.');
      }
      setErrors(errs);
    }
    diagnose();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TODO QUEST - Diagnostic</Text>
      <Text style={styles.status}>{status}</Text>
      {errors.length > 0 && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>ERRORS:</Text>
          {errors.map((e, i) => (
            <Text key={i} style={styles.errorText}>{e}</Text>
          ))}
        </View>
      )}
      {errors.length === 0 && status.includes('ALL OK') && (
        <Text style={styles.success}>All modules work! The issue is elsewhere.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c18',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    color: '#a78bfa',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 10,
    padding: 15,
    width: '100%',
  },
  errorTitle: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginBottom: 4,
  },
  success: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
