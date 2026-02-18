import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { ProgressBar } from '../components/shared';
import { HeroSVG } from '../components/HeroSVG';
import { RARITY_COLOR, getHeroStats, getHeroTier, PET_POOL } from '../constants';

export default function InventoryScreen() {
  const {
    hero, inventory, equipped, pets, activePet,
    useItem, unequipItem, craftItems, setActivePet, theme,
  } = useGame();

  const [craftSelected, setCraftSelected] = useState<string[]>([]);

  const toggleCraftSelect = (uid: string) => {
    setCraftSelected(prev => {
      if (prev.includes(uid)) return prev.filter(u => u !== uid);
      if (prev.length >= 3) return prev;
      return [...prev, uid];
    });
  };

  const selectedItems = craftSelected.map(uid => inventory.find(i => i.uid === uid)).filter(Boolean) as any[];
  const allSameRarity = selectedItems.length === 3 && selectedItems.every(i => i.rarity === selectedItems[0].rarity);
  const craftRarity = allSameRarity ? selectedItems[0].rarity : null;
  const nextRarity = craftRarity === 'common' ? 'uncommon' : craftRarity === 'uncommon' ? 'rare' : craftRarity === 'rare' ? 'legendary' : null;

  const handleCraft = () => {
    if (!allSameRarity) return;
    craftItems(craftSelected);
    setCraftSelected([]);
  };

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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={[styles.sectionTitle, { color: '#f59e0b', marginBottom: 0 }]}>🎒 아이템 ({inventory.length})</Text>
            {craftSelected.length > 0 && (
              <TouchableOpacity onPress={() => setCraftSelected([])}>
                <Text style={{ fontSize: 11, color: theme.textMuted }}>선택 취소</Text>
              </TouchableOpacity>
            )}
          </View>
          {craftSelected.length > 0 && (
            <Text style={[styles.craftHint, { color: theme.textMuted }]}>
              {craftSelected.length === 3
                ? allSameRarity
                  ? `✨ ${craftRarity} × 3 → ${nextRarity} 아이템 합성 가능!`
                  : '⚠️ 같은 등급 3개를 선택하세요'
                : `🔨 합성할 아이템 ${craftSelected.length}/3 선택됨`}
            </Text>
          )}
          {inventory.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textDim }]}>전리품이 없습니다. 드래곤을 처치하세요!</Text>
          ) : (
            [...inventory]
              .sort((a, b) => {
                const order: Record<string, number> = { equip_atk: 0, equip_def: 1, consumable: 2 };
                return (order[a.type] || 9) - (order[b.type] || 9);
              })
              .map((item) => {
                const origIdx = inventory.indexOf(item);
                const isEquip = item.type === 'equip_atk' || item.type === 'equip_def';
                const curEquip = item.type === 'equip_atk' ? equipped.atk : item.type === 'equip_def' ? equipped.def : null;
                const statDiff = isEquip
                  ? (item.type === 'equip_atk'
                    ? (item.effect.atk - (curEquip?.effect?.atk || 0))
                    : (item.effect.def - (curEquip?.effect?.def || 0)))
                  : 0;
                const isCraftSelected = craftSelected.includes(item.uid);

                return (
                  <TouchableOpacity
                    key={item.uid || origIdx}
                    style={[
                      styles.itemRow,
                      { borderColor: isCraftSelected ? '#fbbf24' : (RARITY_COLOR[item.rarity] || '#fff') + '22' },
                      isCraftSelected && { backgroundColor: 'rgba(251,191,36,0.08)' },
                    ]}
                    onLongPress={() => toggleCraftSelect(item.uid)}
                    delayLongPress={300}
                  >
                    {isCraftSelected && (
                      <View style={styles.craftCheckBadge}><Text style={{ fontSize: 10, color: '#fbbf24', fontWeight: '900' }}>✓</Text></View>
                    )}
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
                  </TouchableOpacity>
                );
              })
          )}
        </View>

        {/* Crafting Panel */}
        {inventory.length >= 3 && (
          <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: allSameRarity ? 'rgba(251,191,36,0.4)' : theme.border }]}>
            <Text style={[styles.sectionTitle, { color: '#fbbf24' }]}>🔨 아이템 합성</Text>
            <Text style={[styles.craftDesc, { color: theme.textMuted }]}>아이템을 길게 눌러 합성 재료로 선택하세요.</Text>
            <View style={styles.craftRecipes}>
              {[
                { from: 'common', to: 'uncommon', label: '일반 3개 → 고급', fromColor: '#9ca3af', toColor: '#60a5fa' },
                { from: 'uncommon', to: 'rare', label: '고급 3개 → 희귀', fromColor: '#60a5fa', toColor: '#a78bfa' },
                { from: 'rare', to: 'legendary', label: '희귀 3개 → 전설', fromColor: '#a78bfa', toColor: '#fbbf24' },
              ].map(r => {
                const count = inventory.filter(i => i.rarity === r.from).length;
                return (
                  <View key={r.from} style={[styles.recipeRow, { borderColor: theme.border }]}>
                    <Text style={[styles.recipeText, { color: r.fromColor }]}>{r.label}</Text>
                    <Text style={[styles.recipeCount, { color: count >= 3 ? '#4ade80' : theme.textDim }]}>{count}/3</Text>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.craftBtn, !allSameRarity && { opacity: 0.4 }]}
              onPress={handleCraft}
              disabled={!allSameRarity}
            >
              <Text style={styles.craftBtnText}>
                {allSameRarity ? `✨ 합성하기 (${craftRarity} → ${nextRarity})` : '재료 3개를 선택하세요'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  craftHint: { fontSize: 11, fontWeight: '700', marginBottom: 8, textAlign: 'center', padding: 6, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8 },
  craftCheckBadge: {
    position: 'absolute', top: 6, left: 6, zIndex: 10,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#fbbf24', alignItems: 'center', justifyContent: 'center',
  },
  craftDesc: { fontSize: 11, marginBottom: 10 },
  craftRecipes: { gap: 6, marginBottom: 12 },
  recipeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  recipeText: { fontSize: 11, fontWeight: '700' },
  recipeCount: { fontSize: 11, fontWeight: '900' },
  craftBtn: {
    backgroundColor: '#fbbf24', borderRadius: 12, padding: 12,
    alignItems: 'center',
  },
  craftBtnText: { fontSize: 13, fontWeight: '900', color: '#1a1028' },
});
