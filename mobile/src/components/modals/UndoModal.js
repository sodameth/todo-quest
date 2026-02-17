import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { DIFFICULTY } from '../../constants/difficulty';
import { Colors } from '../../theme/colors';

export default function UndoModal({ todo, onConfirm, onClose }) {
  const d = DIFFICULTY[todo.difficulty];

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>⚠️</Text>
          <Text style={styles.title}>퀘스트 완료를 취소할까요?</Text>
          <Text style={styles.questText}>{todo.text}</Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>경험치 {d.xp}xp 차감 & 콤보 초기화</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>아니오</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(todo.id, d.xp)}
              style={styles.confirmBtn}
            >
              <Text style={styles.confirmBtnText}>취소하기</Text>
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
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
  },
  title: { fontSize: 15, fontWeight: '900', color: '#f87171', marginBottom: 8 },
  questText: { fontSize: 13, color: '#a09ab0', marginBottom: 6 },
  warningBox: {
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.15)',
    width: '100%',
    alignItems: 'center',
  },
  warningText: { fontSize: 12, color: '#f87171', fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 8, width: '100%' },
  cancelBtn: {
    flex: 1,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  cancelBtnText: { color: Colors.text.secondary, fontWeight: '700', fontSize: 14 },
  confirmBtn: {
    flex: 1,
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
