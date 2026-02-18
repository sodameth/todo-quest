import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, PanResponder } from 'react-native';
import { DEADLINE_PRESETS } from '../constants/deadlinePresets';
import { Colors } from '../theme/colors';

function JSSlider({ minimumValue, maximumValue, step, value, onValueChange, minimumTrackTintColor, maximumTrackTintColor, thumbTintColor, style }) {
  const trackRef = useRef(null);
  const trackWidth = useRef(0);

  const fraction = (value - minimumValue) / (maximumValue - minimumValue);

  const valueFromX = (x) => {
    const ratio = Math.max(0, Math.min(1, x / trackWidth.current));
    let val = minimumValue + ratio * (maximumValue - minimumValue);
    if (step) val = Math.round(val / step) * step;
    return Math.max(minimumValue, Math.min(maximumValue, val));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.locationX;
        onValueChange(valueFromX(x));
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX;
        onValueChange(valueFromX(x));
      },
    })
  ).current;

  return (
    <View
      style={[{ height: 32, justifyContent: 'center' }, style]}
      ref={trackRef}
      onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
      {...panResponder.panHandlers}
    >
      <View style={{ height: 4, borderRadius: 2, backgroundColor: maximumTrackTintColor || 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <View style={{ width: `${fraction * 100}%`, height: '100%', backgroundColor: minimumTrackTintColor || '#fbbf24', borderRadius: 2 }} />
      </View>
      <View style={{
        position: 'absolute',
        left: `${fraction * 100}%`,
        marginLeft: -10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: thumbTintColor || '#fbbf24',
      }} />
    </View>
  );
}

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
      <JSSlider
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
