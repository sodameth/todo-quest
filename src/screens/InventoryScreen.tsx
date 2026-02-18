import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { ProgressBar } from '../components/shared';
import { HeroSVG } from '../components/HeroSVG';
import { RARITY_COLOR, getHeroStats, getHeroTier, PET_POOL } from '../constants';

export default function InventoryScreen() {
  const {
    hero, inventory, equipped, pets, activePet,
    useItem, unequipItem, setActivePet, theme,
  } = useGame();

  const stats = getHeroStats(hero.level);
  const equipAtk = equipped.atk?.effect?.atk || 0;
  const equipDef = equipped.def?.effect?.def || 0;
  const totalAtk = stats.atk + equipAtk;
  const totalDef = stats.def + equipDef;
  const heroTier = getHeroTier(hero.level);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Preview */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.heroPreviewRow}>
            <HeroSVG tier={heroTier} size={80} animate />
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>공격력</Text>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>{totalAtk}</Text>
                {equipAtk > 0 && <Text style={[styles.statBonus, { color: '#fbbf24' }]}>+{equipAtk}</Text>}
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>방어력</Text>
                <Text style={[styles.statValue, { color: '#60a5fa' }]}>{totalDef}</Text>
                {equipDef > 0 && <Text style={[styles.statBonus, { color: '#fbbf24' }]}>+{equipDef}</Text>}
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>HP</Text>
                <Text style={[styles.statValue, { color: '#4ade80' }]}>{hero.hp}</Text>
                <Text style={[styles.statBonus, { color: theme.textDim }]}>/{stats.maxHp}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Equipment */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: '#fbbf24' }]}>⚔️ 장착 중</Text>
          <View style={styles.equipRow}>
            {[
              { slot: 'atk' as const, label: '무기', empty: '🗡️', color: '#ef4444' },
              { slot: 'def' as const, label: '방패', empty: '🛡️', color: '#60a5fa' },
            ].map(s => {
              const item = equipped[s.slot];
              return (
                <View
                  key={s.slot}
                  style={[styles.equipSlot, { borderColor: item ? (RARITY_COLOR[item.rarity] + '55') : theme.border }]}
                >
                  <Text style={styles.equipEmoji}>{item ? item.emoji : s.empty}</Text>
                  <Text style={[styles.equipName, { color: item ? RARITY_COLOR[item.rarity] : theme.textDim }]}>
                    {item ? item.name : `${s.label} 없음`}
                  </Text>
                  {item && (
                    <Text style={[styles.equipStat, { color: s.color }]}>
                      {s.slot === 'atk' ? `공격력 +${item.effect.atk}` : `방어력 +${item.effect.def}`}
                    </Text>
                  )}
                  {item && (
                    <TouchableOpacity style={[styles.unequipBtn, { borderColor: theme.border }]} onPress={() => unequipItem(s.slot)}>
                      <Text style={[styles.unequipText, { color: theme.textMuted }]}>해제</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Pets */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: '#a78bfa' }]}>🐾 동료 ({pets.length}/{PET_POOL.length})</Text>
          {pets.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textDim }]}>드래곤을 처치하면 동료를 얻을 수 있어요!</Text>
          ) : (
            <View style={styles.petsGrid}>
              {pets.map(pet => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petCard,
                    { borderColor: activePet?.id === pet.id ? pet.color + '88' : theme.border },
                    activePet?.id === pet.id && { backgroundColor: pet.color + '15' },
                  ]}
                  onPress={() => setActivePet(activePet?.id === pet.id ? null : pet)}
                >
                  <Text style={styles.petEmoji}>{pet.emoji}</Text>
                  <Text style={[styles.petName, { color: pet.color }]}>{pet.name}</Text>
                  <Text style={[styles.petSkill, { color: theme.textMuted }]}>{pet.skill}</Text>
                  <Text style={[styles.petDesc, { color: theme.textDim }]}>{pet.desc}</Text>
                  {activePet?.id === pet.id && (
                    <Text style={[styles.petActive, { color: pet.color }]}>✓ 활성</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Inventory */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>🎒 아이템 ({inventory.length})</Text>
          {inventory.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textDim }]}>전리품이 없습니다. 드래곤을 처치하세요!</Text>
          ) : (
            [...inventory]
              .sort((a, b) => {
                const order: Record<string, number> = { equip_atk: 0, equip_def: 1, consumable: 2 };
                return (order[a.type] || 9) - (order[b.type] || 9);
              })
              .map((item, sortedIdx) => {
                const origIdx = inventory.indexOf(item);
                const isEquip = item.type === 'equip_atk' || item.type === 'equip_def';
                const curEquip = item.type === 'equip_atk' ? equipped.atk : item.type === 'equip_def' ? equipped.def : null;
                const statDiff = isEquip
                  ? (item.type === 'equip_atk'
                    ? (item.effect.atk - (curEquip?.effect?.atk || 0))
                    : (item.effect.def - (curEquip?.effect?.def || 0)))
                  : 0;

                return (
                  <View key={item.uid || origIdx} style={[styles.itemRow, { borderColor: (RARITY_COLOR[item.rarity] || '#fff') + '22' }]}>
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                    <View style={styles.itemInfo}>
                      <View style={styles.itemNameRow}>
                        <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.itemRarity, { color: RARITY_COLOR[item.rarity], backgroundColor: (RARITY_COLOR[item.rarity]) + '15' }]}>
                          {item.rarity}
                        </Text>
                      </View>
                      <Text style={[styles.itemDesc, { color: theme.textMuted }]}>{item.desc}</Text>
                      {isEquip && statDiff !== 0 && (
                        <Text style={[styles.statDiff, { color: statDiff > 0 ? '#4ade80' : '#f87171' }]}>
                          {curEquip ? `현재 대비 ${statDiff > 0 ? '+' : ''}${statDiff}` : '장착 시 스탯 증가'}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[styles.useBtn, {
                        backgroundColor: item.type === 'consumable' ? '#4ade80'
                          : item.type === 'equip_atk' ? '#ef4444' : '#60a5fa',
                      }]}
                      onPress={() => useItem(item, origIdx)}
                    >
                      <Text style={styles.useBtnText}>
                        {item.type === 'consumable' ? '사용' : curEquip ? '교체' : '장착'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24, gap: 10 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1 },
  heroPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statsGrid: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, marginBottom: 2 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statBonus: { fontSize: 10, fontWeight: '700' },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.06)' },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  equipRow: { flexDirection: 'row', gap: 8 },
  equipSlot: {
    flex: 1, padding: 12, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.12)',
  },
  equipEmoji: { fontSize: 28, marginBottom: 4 },
  equipName: { fontSize: 11, fontWeight: '700', marginBottom: 2, textAlign: 'center' },
  equipStat: { fontSize: 11, fontWeight: '700', marginBottom: 8 },
  unequipBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  unequipText: { fontSize: 10, fontWeight: '700' },
  emptyText: { fontSize: 12, textAlign: 'center', padding: 16 },
  petsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  petCard: {
    padding: 10, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', minWidth: 90, backgroundColor: 'rgba(0,0,0,0.1)',
  },
  petEmoji: { fontSize: 24, marginBottom: 2 },
  petName: { fontSize: 11, fontWeight: '700' },
  petSkill: { fontSize: 9, marginTop: 2 },
  petDesc: { fontSize: 8, textAlign: 'center', marginTop: 2 },
  petActive: { fontSize: 9, fontWeight: '700', marginTop: 4 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 6,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  itemEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  itemInfo: { flex: 1 },
  itemNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  itemName: { fontSize: 13, fontWeight: '700' },
  itemRarity: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  itemDesc: { fontSize: 10 },
  statDiff: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  useBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  useBtnText: { fontSize: 10, fontWeight: '800', color: '#fff' },
});
