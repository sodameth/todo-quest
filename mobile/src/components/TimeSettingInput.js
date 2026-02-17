import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { DEADLINE_PRESETS } from '../constants/deadlinePresets';
import { Colors } from '../theme/colors';

function formatMinutes(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0 && min > 0) return `${h}시간 ${min}분`;
  if (h > 0) return `${h}시간`;
  return `${min}분`;
}

export default function TimeSettingInput({ value, onChange }) {
  const [inputText, setInputText] = useState(String(value));

  const handleSliderChange = useCallback((val) => {
    const rounded = Math.round(val);
    onChange(rounded);
    setInputText(String(rounded));
  }, [onChange]);

  const handleInputChange = useCallback((text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setInputText(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num >= 1 && num <= 1440) {
      onChange(num);
    }
  }, [onChange]);

  const handleInputBlur = useCallback(() => {
    let num = parseInt(inputText, 10);
    if (isNaN(num) || num < 1) num = 1;
    if (num > 1440) num = 1440;
    onChange(num);
    setInputText(String(num));
  }, [inputText, onChange]);

  const handlePreset = useCallback((min) => {
    onChange(min);
    setInputText(String(min));
  }, [onChange]);

  const isPreset = DEADLINE_PRESETS.some(p => p.min === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>⏰ 마감시간</Text>

      {/* Preset buttons */}
      <View style={styles.presetRow}>
        {DEADLINE_PRESETS.map((p) => (
          <Pressable
            key={p.min}
            onPress={() => handlePreset(p.min)}
            style={[
              styles.presetBtn,
              value === p.min && styles.presetBtnActive,
            ]}
          >
            <Text
              style={[
                styles.presetText,
                value === p.min && styles.presetTextActive,
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Slider */}
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={1440}
        step={1}
        value={value}
        onValueChange={handleSliderChange}
        minimumTrackTintColor="#fbbf24"
        maximumTrackTintColor="rgba(255,255,255,0.1)"
        thumbTintColor="#fbbf24"
      />

      {/* Direct input + formatted display */}
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.numberInput}
            value={inputText}
            onChangeText={handleInputChange}
            onBlur={handleInputBlur}
            keyboardType="number-pad"
            maxLength={4}
            selectTextOnFocus
          />
          <Text style={styles.unitText}>분</Text>
        </View>
        <Text style={styles.formattedText}>= {formatMinutes(value)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginBottom: 8,
  },
  presetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetBtnActive: {
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  presetText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.muted,
  },
  presetTextActive: {
    color: '#fbbf24',
  },
  slider: {
    width: '100%',
    height: 32,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.input,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  numberInput: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '900',
    minWidth: 40,
    textAlign: 'center',
    paddingVertical: 2,
  },
  unitText: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
  formattedText: {
    color: Colors.text.secondary,
    fontSize: 11,
  },
});
