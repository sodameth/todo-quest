import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { RARITY_COLOR } from '../constants/items';
import { PET_POOL } from '../constants/pets';
import { Colors } from '../theme/colors';

export default function InventoryScreen({ game }) {
  const {
    hero, stats, totalAtk, totalDef, equipAtk, equipDef,
    inventory, equipped, pets, activePet,
    useItem, unequipItem, setActivePet,
  } = game;

  const sortedInventory = [...inventory].sort((a, b) => {
    const order = { equip_atk: 0, equip_def: 1, consumable: 2 };
    return (order[a.type] || 9) - (order[b.type] || 9);
  });

  return (
    <View>
      {/* Stats Summary */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>📊 전투 스탯</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>공격력</Text>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{totalAtk}</Text>
            <Text style={styles.statSub}>
              기본 {stats.atk}{equipAtk > 0 && <Text style={{ color: '#fbbf24' }}> +{equipAtk}</Text>}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>방어력</Text>
            <Text style={[styles.statValue, { color: '#60a5fa' }]}>{totalDef}</Text>
            <Text style={styles.statSub}>
              기본 {stats.def}{equipDef > 0 && <Text style={{ color: '#fbbf24' }}> +{equipDef}</Text>}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>HP</Text>
            <Text style={[styles.statValue, { color: '#4ade80' }]}>{hero.hp}</Text>
            <Text style={styles.statSub}>/ {stats.maxHp}</Text>
          </View>
        </View>
      </View>

      {/* Equipped */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#fbbf24' }]}>⚔️ 장착 중</Text>
        <View style={styles.equippedRow}>
          {[
            { slot: 'atk', label: '무기', statLabel: '공격력', empty: '🗡️', statColor: '#ef4444' },
            { slot: 'def', label: '방패', statLabel: '방어력', empty: '🛡️', statColor: '#60a5fa' },
          ].map(s => {
            const item = equipped[s.slot];
            return (
              <View key={s.slot} style={[styles.equipSlot, {
                backgroundColor: item ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.12)',
                borderColor: item ? (RARITY_COLOR[item.rarity] || '#9ca3af') + '55' : Colors.border.medium,
              }]}>
                <Text style={{ fontSize: 28, marginBottom: 4 }}>{item ? item.emoji : s.empty}</Text>
                <Text style={[styles.equipName, { color: item ? RARITY_COLOR[item.rarity] : '#5a4f6b' }]}>
                  {item ? item.name : `${s.label} 없음`}
                </Text>
                {item && (
                  <Text style={[styles.equipStat, { color: s.statColor }]}>
                    {s.statLabel} +{item.type === 'equip_atk' ? item.effect.atk : item.effect.def}
                  </Text>
                )}
                {!item && <Text style={styles.emptySlot}>비어 있음</Text>}
                {item && (
                  <Pressable onPress={() => unequipItem(s.slot)} style={styles.unequipBtn}>
                    <Text style={styles.unequipBtnText}>해제하기</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Pets */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#a78bfa' }]}>🐾 동료 ({pets.length}/{PET_POOL.length})</Text>
        {pets.length === 0 ? (
          <Text style={styles.emptyText}>드래곤을 처치하면 동료를 얻을 수 있어요!</Text>
        ) : (
          <View style={styles.petsRow}>
            {pets.map(pet => (
              <Pressable
                key={pet.id}
                onPress={() => setActivePet(activePet?.id === pet.id ? null : pet)}
                style={[styles.petCard, {
                  borderColor: activePet?.id === pet.id ? pet.color + '66' : Colors.border.medium,
                  backgroundColor: activePet?.id === pet.id ? pet.color + '15' : 'rgba(0,0,0,0.15)',
                }]}
              >
                <Text style={{ fontSize: 20 }}>{pet.emoji}</Text>
                <Text style={[styles.petName, { color: pet.color }]}>{pet.name}</Text>
                <Text style={styles.petSkill}>{pet.skill}</Text>
                {activePet?.id === pet.id && <Text style={[styles.petActive, { color: pet.color }]}>✓ 활성</Text>}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Inventory Items */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>🎒 아이템 ({inventory.length})</Text>
        {inventory.length === 0 ? (
          <Text style={styles.emptyText}>전리품이 없습니다. 드래곤을 처치하세요!</Text>
        ) : (
          sortedInventory.map((item, sortedIdx) => {
            const origIdx = inventory.indexOf(item);
            const isEquipType = item.type === 'equip_atk' || item.type === 'equip_def';
            const currentEquip = item.type === 'equip_atk' ? equipped.atk : item.type === 'equip_def' ? equipped.def : null;
            const statDiff = isEquipType
              ? (item.type === 'equip_atk' ? (item.effect.atk - (currentEquip?.effect?.atk || 0)) : (item.effect.def - (currentEquip?.effect?.def || 0)))
              : 0;

            return (
              <View key={item.uid || origIdx} style={[styles.itemRow, { borderColor: (RARITY_COLOR[item.rarity] || '#9ca3af') + '22' }]}>
                <Text style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemNameRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={[styles.rarityTag, { color: RARITY_COLOR[item.rarity], backgroundColor: (RARITY_COLOR[item.rarity] || '#9ca3af') + '15' }]}>
                      {item.rarity}
                    </Text>
                  </View>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                  {isEquipType && statDiff !== 0 && (
                    <Text style={[styles.statDiff, { color: statDiff > 0 ? '#4ade80' : '#f87171' }]}>
                      {currentEquip ? `현재 장비 대비 ${statDiff > 0 ? '+' : ''}${statDiff}` : '장착 시 스탯 증가'}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => useItem(item, origIdx)}
                  style={[styles.useBtn, {
                    backgroundColor: item.type === 'consumable' ? '#22c55e' : item.type === 'equip_atk' ? '#dc2626' : '#3b82f6',
                  }]}
                >
                  <Text style={[styles.useBtnText, { color: item.type === 'consumable' ? '#0f0c18' : '#fff' }]}>
                    {item.type === 'consumable' ? '사용' : currentEquip ? '교체' : '장착'}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.15)',
    backgroundColor: 'rgba(30,25,50,0.9)',
  },
  sectionTitle: { fontSize: 11, color: '#fbbf24', fontWeight: '700', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCol: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 9, color: '#8b7fa0', marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: '900' },
  statSub: { fontSize: 8, color: '#8b7fa0' },
  divider: { width: 1, backgroundColor: Colors.border.medium },
  section: {
    backgroundColor: Colors.bg.subtle,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  equippedRow: { flexDirection: 'row', gap: 8 },
  equipSlot: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  equipName: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  equipStat: { fontSize: 10.5, fontWeight: '700', marginBottom: 4 },
  emptySlot: { fontSize: 9, color: '#4a4258', marginBottom: 4 },
  unequipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  unequipBtnText: { color: '#e8e0f0', fontSize: 10, fontWeight: '700' },
  emptyText: { fontSize: 11, color: '#5a4f6b', textAlign: 'center', padding: 12 },
  petsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  petCard: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 80,
  },
  petName: { fontSize: 10, fontWeight: '700' },
  petSkill: { fontSize: 8, color: '#8b7fa0' },
  petActive: { fontSize: 7, marginTop: 2 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    marginBottom: 4,
  },
  itemNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemName: { fontSize: 12, color: Colors.text.primary, fontWeight: '700' },
  rarityTag: { fontSize: 7, fontWeight: '700', textTransform: 'uppercase', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  itemDesc: { fontSize: 9, color: '#8b7fa0', marginTop: 1 },
  statDiff: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  useBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  useBtnText: { fontSize: 10, fontWeight: '800' },
});
