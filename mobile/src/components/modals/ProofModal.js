import React, { useState } from 'react';
import { View, Text, Modal, Pressable, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { DIFFICULTY } from '../../constants/difficulty';
import { Colors } from '../../theme/colors';

export default function ProofModal({ todo, onConfirm, onClose }) {
  const [url, setUrl] = useState(null);
  const d = DIFFICULTY[todo.difficulty];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setUrl(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setUrl(result.assets[0].uri);
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={{ fontSize: 28, marginBottom: 6 }}>📸</Text>
            <Text style={styles.title}>퀘스트 완료 인증</Text>
            <Text style={styles.subtitle}>사진 인증은 선택사항입니다.</Text>
          </View>

          <View style={styles.questInfo}>
            <Text style={[styles.badge, { color: d.color, backgroundColor: d.color + '18' }]}>
              {d.emoji}
            </Text>
            <Text style={styles.questText} numberOfLines={1}>{todo.text}</Text>
            <Text style={[styles.xpText, { color: d.color }]}>+{d.xp}xp</Text>
          </View>

          {!url ? (
            <View style={styles.photoArea}>
              <Text style={{ fontSize: 28, marginBottom: 6, opacity: 0.5 }}>📷</Text>
              <Text style={styles.photoHint}>사진 인증 (선택)</Text>
              <View style={styles.photoButtons}>
                <Pressable onPress={takePhoto} style={styles.photoBtn}>
                  <Text style={styles.photoBtnText}>📸 촬영</Text>
                </Pressable>
                <Pressable onPress={pickImage} style={styles.photoBtn}>
                  <Text style={styles.photoBtnText}>🖼️ 갤러리</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: url }} style={styles.preview} />
              <Pressable onPress={() => setUrl(null)} style={styles.retakeBtn}>
                <Text style={styles.retakeBtnText}>🔄 다시</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.actionRow}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(url || null)}
              style={[styles.confirmBtn, { backgroundColor: url ? '#22c55e' : '#6366f1' }]}
            >
              <Text style={[styles.confirmBtnText, { color: url ? '#0f0c18' : '#fff' }]}>
                {url ? '📸 인증과 함께 완료!' : '⚔️ 바로 완료하기'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.bg.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#1e1932',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '900', color: Colors.text.primary, marginBottom: 4 },
  subtitle: { fontSize: 12, color: Colors.text.secondary },
  questInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.subtle,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  badge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  questText: { flex: 1, fontSize: 14, color: Colors.text.primary },
  xpText: { fontSize: 11, fontWeight: '700' },
  photoArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border.light,
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  photoHint: { fontSize: 12, color: '#a09ab0', marginBottom: 12 },
  photoButtons: { flexDirection: 'row', gap: 10 },
  photoBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  photoBtnText: { fontSize: 12, color: Colors.text.primary, fontWeight: '700' },
  previewContainer: { marginBottom: 16, position: 'relative' },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(74,222,128,0.3)',
  },
  retakeBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  retakeBtnText: { fontSize: 10, color: Colors.text.primary },
  actionRow: { flexDirection: 'row', gap: 8 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  cancelBtnText: { color: Colors.text.secondary, fontWeight: '700', fontSize: 14 },
  confirmBtn: {
    flex: 2,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: { fontWeight: '900', fontSize: 14 },
});
