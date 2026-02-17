import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { RARITY_COLOR } from '../../constants/items';
import { Colors } from '../../theme/colors';

export default function LootModal({ items, onClose }) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🎁</Text>
          <Text style={styles.title}>전리품 획득!</Text>

          {items.map((it, i) => (
            <View
              key={i}
              style={[styles.itemRow, { borderColor: (RARITY_COLOR[it.rarity] || '#9ca3af') + '33' }]}
            >
              <Text style={{ fontSize: 22 }}>{it.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{it.name}</Text>
                <Text style={[styles.itemDesc, { color: RARITY_COLOR[it.rarity] }]}>{it.desc}</Text>
              </View>
              <Text style={[styles.rarityLabel, { color: RARITY_COLOR[it.rarity] }]}>
                {it.rarity}
              </Text>
            </View>
          ))}

          <Pressable onPress={onClose} style={styles.okBtn}>
            <Text style={styles.okBtnText}>확인</Text>
          </Pressable>
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
    borderColor: 'rgba(251,191,36,0.3)',
  },
  title: { fontSize: 16, fontWeight: '900', color: '#fbbf24', marginBottom: 16 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: Colors.bg.subtle,
    borderWidth: 1,
    width: '100%',
  },
  itemName: { fontSize: 13, color: Colors.text.primary, fontWeight: '700' },
  itemDesc: { fontSize: 10 },
  rarityLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  okBtn: {
    marginTop: 16,
    width: '100%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
  },
  okBtnText: { color: '#1a1028', fontWeight: '900', fontSize: 14 },
});
