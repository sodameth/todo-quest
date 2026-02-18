import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Switch,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';

import { useGame, Todo } from '../context/GameContext';
import { ProgressBar, ProofModal, UndoModal, FloatingTexts, AchievementToast, MemoModal } from '../components/shared';
import { HeroSVG } from '../components/HeroSVG';
import {
  DIFFICULTY,
  DEADLINE_PRESETS,
  CAT_EMOJIS,
  DifficultyKey,
  RepeatType,
  REPEAT_OPTIONS,
  getHeroStats,
  getHeroTitle,
  getHeroTier,
  formatCountdown,
  LEVEL_XP,
} from '../constants';

export default function TodoScreen() {
  const {
    todos, setTodos, categories, setCategories, hero, combo, completedCount, victoryDragons,
    activePet, addTodo, deleteTodo, confirmComplete, confirmUndo,
    addCategory, deleteCategory, theme, now, dailyQuest,
  } = useGame();

  const [input, setInput] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyKey>('easy');
  const [deadlineMin, setDeadlineMin] = useState(30);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [memo, setMemo] = useState('');
  const [repeat, setRepeat] = useState<RepeatType>('none');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📌');

  const [proofTodo, setProofTodo] = useState<Todo | null>(null);
  const [undoTodo, setUndoTodo] = useState<Todo | null>(null);
  const [memoTodo, setMemoTodo] = useState<Todo | null>(null);

  const stats = getHeroStats(hero.level);
  const xpNeeded = LEVEL_XP(hero.level);
  const heroTier = getHeroTier(hero.level);

  const handleAddTodo = useCallback(() => {
    if (!input.trim()) return;
    addTodo(input.trim(), difficulty, deadlineMin, selectedCat, memo, repeat);
    setInput('');
    setMemo('');
    setShowAddForm(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [input, difficulty, deadlineMin, selectedCat, memo, repeat, addTodo]);

  const handleShare = useCallback(async () => {
    const text = `⚔️ TODO QUEST 진행현황\n\n` +
      `👤 Lv.${hero.level} ${getHeroTitle(hero.level)}\n` +
      `✅ 퀘스트 완료: ${completedCount}개\n` +
      `🐉 드래곤 처치: ${victoryDragons}마리\n` +
      `🔥 최대 콤보: ${combo}\n\n` +
      `같이 도전해보세요! #TodoQuest`;
    try {
      const supported = await Sharing.isAvailableAsync();
      if (supported) {
        const fileUri = `${documentDirectory}todoquest_stats.txt`;
        await writeAsStringAsync(fileUri, text);
        await Sharing.shareAsync(fileUri, { mimeType: 'text/plain' });
      } else {
        Alert.alert('공유', text);
      }
    } catch {
      Alert.alert('공유', text);
    }
  }, [hero, completedCount, victoryDragons, combo]);

  const filteredTodos = (
    filterCat === 'all' ? todos
      : filterCat === 'none' ? todos.filter(t => !t.category)
        : todos.filter(t => t.category === filterCat)
  ).slice().sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (!a.done && !b.done) return (a.deadline || Infinity) - (b.deadline || Infinity);
    return 0;
  });

  const renderTodoItem = useCallback(({ item: todo, drag, isActive }: RenderItemParams<Todo>) => {
    const d = DIFFICULTY[todo.difficulty];
    const remaining = todo.deadline - now;
    const grace = (todo.deadline + 10 * 60 * 1000) - now;
    const isOverdue = !todo.done && remaining < 0;
    const isDebuff = !todo.done && grace < 0;
    const isUrgent = !todo.done && !isOverdue && remaining < 5 * 60 * 1000 && remaining > 0;
    const cat = todo.category ? categories.find(c => c.id === todo.category) : null;

    const borderColor = todo.done ? 'rgba(74,222,128,0.15)'
      : isDebuff ? 'rgba(239,68,68,0.35)'
        : isUrgent ? 'rgba(251,191,36,0.35)'
          : 'rgba(255,255,255,0.05)';
    const bgColor = todo.done ? 'rgba(74,222,128,0.05)'
      : isDebuff ? 'rgba(239,68,68,0.06)'
        : 'rgba(255,255,255,0.03)';
    const accentColor = todo.done ? '#4ade80'
      : isDebuff ? '#ef4444'
        : isUrgent ? '#fbbf24'
          : isOverdue ? '#f97316'
            : cat ? cat.color : 'transparent';

    const timeText = isDebuff ? `💀 ${formatCountdown(-grace)} 초과`
      : isOverdue ? `⚠️ 유예 ${formatCountdown(grace)}`
        : isUrgent ? `🔥 ${formatCountdown(remaining)}`
          : `⏰ ${formatCountdown(remaining)}`;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          activeOpacity={0.9}
        >
          <View style={[styles.todoItem, { backgroundColor: bgColor, borderColor }, isActive && styles.todoItemActive]}>
            <View style={[styles.todoAccent, { backgroundColor: accentColor }]} />
            <TouchableOpacity
              style={[styles.checkBtn, { borderColor: todo.done ? '#4ade80' : d.color, backgroundColor: todo.done ? '#4ade8033' : 'transparent' }]}
              onPress={() => todo.done ? setUndoTodo(todo) : setProofTodo(todo)}
            >
              {todo.done && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
            <View style={styles.todoContent}>
              <View style={styles.todoTopRow}>
                {cat && (
                  <View style={[styles.catChip, { backgroundColor: cat.color + '20' }]}>
                    <Text style={[styles.catChipText, { color: cat.color }]}>{cat.emoji} {cat.name}</Text>
                  </View>
                )}
                {todo.repeat !== 'none' && (
                  <View style={styles.repeatChip}>
                    <Text style={styles.repeatChipText}>{todo.repeat === 'daily' ? '🔄 매일' : '📅 매주'}</Text>
                  </View>
                )}
                <Text style={[styles.todoText, { color: todo.done ? theme.textDim : theme.text, textDecorationLine: todo.done ? 'line-through' : 'none' }]} numberOfLines={2}>
                  {todo.text}
                </Text>
              </View>
              {todo.memo ? (
                <Text style={[styles.todoMemo, { color: theme.textMuted }]} numberOfLines={1}>📝 {todo.memo}</Text>
              ) : null}
              {!todo.done && (
                <Text style={[styles.timeText, { color: isDebuff ? '#ef4444' : isOverdue ? '#f97316' : isUrgent ? '#fbbf24' : theme.textMuted }]}>
                  {timeText}
                </Text>
              )}
            </View>
            <View style={styles.todoRight}>
              <Text style={[styles.xpBadge, { color: d.color }]}>+{d.xp}xp</Text>
              <TouchableOpacity
                style={styles.memoEditBtn}
                onPress={() => setMemoTodo(todo)}
              >
                <Text style={{ fontSize: 14, color: theme.textDim }}>📝</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteTodo(todo.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.deleteBtn, { color: theme.textDim }]}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, [now, categories, theme, deleteTodo]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <AchievementToast />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚔️ TODO QUEST ⚔️</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>할 일을 완료하고 용사를 키워 드래곤을 처치하라!</Text>
        </View>

        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.bgCard, borderColor: theme.borderActive }]}>
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <HeroSVG tier={heroTier} size={80} animate hpRatio={hero.hp / stats.maxHp} />
              {activePet && (
                <Text style={[styles.petLabel, { color: activePet.color }]}>{activePet.emoji} {activePet.name}</Text>
              )}
            </View>
            <View style={styles.heroInfo}>
              <View style={styles.heroTitleRow}>
                <Text style={[styles.heroLevel, { color: theme.accent }]}>Lv.{hero.level} {getHeroTitle(hero.level)}</Text>
                {combo > 0 && (
                  <View style={styles.comboBadge}>
                    <Text style={styles.comboText}>🔥 {combo}콤보</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.statLabel, { color: '#ef4444' }]}>❤️ HP {hero.hp}/{stats.maxHp}</Text>
              <ProgressBar value={hero.hp} max={stats.maxHp} color="#ef4444" height={8} />
              <View style={{ height: 4 }} />
              <Text style={[styles.statLabel, { color: '#818cf8' }]}>✨ XP {hero.xp}/{xpNeeded}</Text>
              <ProgressBar value={hero.xp} max={xpNeeded} color="#818cf8" height={8} />
              <View style={styles.heroStats}>
                <Text style={[styles.statSmall, { color: '#a5b4fc' }]}>⚔️ {stats.atk}</Text>
                <Text style={[styles.statSmall, { color: '#a5b4fc' }]}>🛡️ {stats.def}</Text>
                <Text style={[styles.statSmall, { color: theme.textMuted }]}>완료{completedCount}</Text>
              </View>
            </View>
          </View>
          <FloatingTexts />
        </View>

        {/* Daily Quest */}
        {!dailyQuest.completed && (
          <View style={[styles.dailyCard, { backgroundColor: theme.bgCard, borderColor: 'rgba(251,191,36,0.2)' }]}>
            <Text style={styles.dailyEmoji}>{dailyQuest.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dailyTitle, { color: '#fbbf24' }]}>일일 퀘스트</Text>
              <Text style={[styles.dailyDesc, { color: theme.text }]}>{dailyQuest.desc}</Text>
            </View>
            <Text style={[styles.dailyProgress, { color: '#fbbf24' }]}>{dailyQuest.progress}/{dailyQuest.target}</Text>
          </View>
        )}

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catFilter} contentContainerStyle={styles.catFilterContent}>
          {[
            { id: 'all', name: `전체 (${todos.length})`, emoji: '📋', color: theme.textMuted },
            { id: 'none', name: `미분류 (${todos.filter(t => !t.category).length})`, emoji: '📌', color: theme.textMuted },
            ...categories.map(c => ({ ...c, name: `${c.emoji} ${c.name} (${todos.filter(t => t.category === c.id).length})` })),
          ].map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catFilterBtn, filterCat === cat.id && { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: cat.color }]}
              onPress={() => setFilterCat(cat.id)}
            >
              <Text style={[styles.catFilterText, { color: filterCat === cat.id ? theme.text : theme.textDim }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Todo List */}
        <View style={{ flex: 1 }}>
          <DraggableFlatList
            data={filteredTodos}
            keyExtractor={item => item.id.toString()}
            renderItem={renderTodoItem}
            onDragEnd={({ data }) => {
              // Merge reordered filtered back into full list
              setTodos(prev => {
                const reorderedIds = data.map(t => t.id);
                const others = prev.filter(t => !reorderedIds.includes(t.id));
                return [...data, ...others];
              });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📜</Text>
                <Text style={[styles.emptyText, { color: theme.textDim }]}>퀘스트를 추가해서 모험을 시작하세요!</Text>
              </View>
            }
          />
        </View>

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddForm(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.fabShare]} onPress={handleShare}>
          <Text style={styles.fabText}>📤</Text>
        </TouchableOpacity>

        {/* Add Todo Modal */}
        <Modal visible={showAddForm} transparent animationType="slide" onRequestClose={() => setShowAddForm(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={styles.addModalOverlay}>
              <View style={[styles.addModalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={styles.addModalHeader}>
                  <Text style={[styles.addModalTitle, { color: theme.text }]}>새 퀘스트</Text>
                  <TouchableOpacity onPress={() => setShowAddForm(false)}>
                    <Text style={[styles.closeBtn, { color: theme.textMuted }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.input, { backgroundColor: theme.bgInput, color: theme.text, borderColor: theme.border }]}
                  value={input}
                  onChangeText={setInput}
                  placeholder="퀘스트를 입력하세요..."
                  placeholderTextColor={theme.textDim}
                  returnKeyType="next"
                  autoFocus
                />

                <TextInput
                  style={[styles.input, styles.memoInputSmall, { backgroundColor: theme.bgInput, color: theme.text, borderColor: theme.border }]}
                  value={memo}
                  onChangeText={setMemo}
                  placeholder="메모 (선택사항)"
                  placeholderTextColor={theme.textDim}
                />

                {/* Difficulty */}
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>난이도</Text>
                <View style={styles.diffRow}>
                  {(Object.entries(DIFFICULTY) as [DifficultyKey, typeof DIFFICULTY[DifficultyKey]][]).map(([key, d]) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.diffBtn, difficulty === key && { backgroundColor: d.color + '22', borderColor: d.color + '66' }]}
                      onPress={() => setDifficulty(key)}
                    >
                      <Text style={[styles.diffBtnText, { color: difficulty === key ? d.color : theme.textDim }]}>{d.emoji}</Text>
                      <Text style={[styles.diffBtnLabel, { color: difficulty === key ? d.color : theme.textDim }]}>{d.label}</Text>
                      <Text style={[styles.diffBtnXp, { color: difficulty === key ? d.color : theme.textDim }]}>+{d.xp}xp</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Deadline */}
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>⏰ 마감 시간</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={styles.presetRow}>
                    {DEADLINE_PRESETS.map(p => (
                      <TouchableOpacity
                        key={p.min}
                        style={[styles.presetBtn, deadlineMin === p.min && { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: '#fbbf24' }]}
                        onPress={() => setDeadlineMin(p.min)}
                      >
                        <Text style={[styles.presetText, { color: deadlineMin === p.min ? '#fbbf24' : theme.textDim }]}>{p.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Repeat */}
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>🔄 반복</Text>
                <View style={styles.repeatRow}>
                  {REPEAT_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.repeatBtn, repeat === opt.value && { backgroundColor: 'rgba(129,140,248,0.15)', borderColor: '#818cf8' }]}
                      onPress={() => setRepeat(opt.value)}
                    >
                      <Text style={[styles.repeatBtnText, { color: repeat === opt.value ? '#818cf8' : theme.textDim }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Category */}
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>📂 카테고리</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={styles.catRow}>
                    <TouchableOpacity
                      style={[styles.catBtn, selectedCat === null && { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                      onPress={() => setSelectedCat(null)}
                    >
                      <Text style={[styles.catBtnText, { color: selectedCat === null ? theme.text : theme.textDim }]}>없음</Text>
                    </TouchableOpacity>
                    {categories.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.catBtn, selectedCat === cat.id && { backgroundColor: cat.color + '22', borderColor: cat.color + '44' }]}
                        onPress={() => setSelectedCat(cat.id)}
                      >
                        <Text style={[styles.catBtnText, { color: selectedCat === cat.id ? cat.color : theme.textDim }]}>{cat.emoji} {cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[styles.catBtn, { borderStyle: 'dashed' }]}
                      onPress={() => setShowCatManager(true)}
                    >
                      <Text style={[styles.catBtnText, { color: theme.textDim }]}>+ 추가</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.addBtn, !input.trim() && styles.addBtnDisabled]}
                  onPress={handleAddTodo}
                  disabled={!input.trim()}
                >
                  <Text style={styles.addBtnText}>퀘스트 추가하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Category Manager Modal */}
        <Modal visible={showCatManager} transparent animationType="slide" onRequestClose={() => setShowCatManager(false)}>
          <View style={styles.addModalOverlay}>
            <View style={[styles.addModalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={styles.addModalHeader}>
                <Text style={[styles.addModalTitle, { color: theme.text }]}>📂 카테고리 관리</Text>
                <TouchableOpacity onPress={() => setShowCatManager(false)}>
                  <Text style={[styles.closeBtn, { color: theme.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>
              {categories.map(cat => (
                <View key={cat.id} style={[styles.catManageItem, { borderColor: cat.color + '22' }]}>
                  <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                  <Text style={[styles.catManageName, { color: cat.color }]}>{cat.name}</Text>
                  <Text style={[styles.catManageCount, { color: theme.textDim }]}>{todos.filter(t => t.category === cat.id).length}개</Text>
                  <TouchableOpacity onPress={() => deleteCategory(cat.id)}>
                    <Text style={{ fontSize: 16, color: theme.textDim }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.newCatRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 60 }}>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {CAT_EMOJIS.slice(0, 5).map(e => (
                      <TouchableOpacity key={e} onPress={() => setNewCatEmoji(e)}
                        style={[styles.emojiBtn, newCatEmoji === e && { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                        <Text style={{ fontSize: 18 }}>{e}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: theme.bgInput, color: theme.text, borderColor: theme.border, marginBottom: 0 }]}
                  value={newCatName}
                  onChangeText={setNewCatName}
                  placeholder="카테고리 이름"
                  placeholderTextColor={theme.textDim}
                  maxLength={10}
                />
                <TouchableOpacity
                  style={[styles.addBtn, { paddingHorizontal: 12, paddingVertical: 10, marginTop: 0 }]}
                  onPress={() => { if (newCatName.trim()) { addCategory(newCatName.trim(), newCatEmoji); setNewCatName(''); } }}
                >
                  <Text style={styles.addBtnText}>추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Proof/Undo/Memo Modals */}
        <ProofModal
          visible={!!proofTodo}
          todo={proofTodo}
          onConfirm={uri => { if (proofTodo) { confirmComplete(proofTodo.id, uri); setProofTodo(null); } }}
          onClose={() => setProofTodo(null)}
        />
        <UndoModal
          visible={!!undoTodo}
          todo={undoTodo}
          onConfirm={(id, xp) => { confirmUndo(id, xp); setUndoTodo(null); }}
          onClose={() => setUndoTodo(null)}
        />
        <MemoModal
          visible={!!memoTodo}
          initialMemo={memoTodo?.memo || ''}
          todoText={memoTodo?.text || ''}
          onSave={m => {
            if (memoTodo) {
              setTodos(prev => prev.map(t => t.id === memoTodo.id ? { ...t, memo: m } : t));
            }
            setMemoTodo(null);
          }}
          onClose={() => setMemoTodo(null)}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  title: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 16, color: '#facc15', fontWeight: '900', letterSpacing: 2 },
  subtitle: { fontSize: 11, marginTop: 2 },
  heroCard: {
    marginHorizontal: 12, marginBottom: 8, borderRadius: 16,
    padding: 14, borderWidth: 1.5, position: 'relative', overflow: 'hidden',
  },
  heroRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  heroLeft: { alignItems: 'center' },
  petLabel: { fontSize: 10, fontWeight: '700', marginTop: -4 },
  heroInfo: { flex: 1 },
  heroTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  heroLevel: { fontSize: 13, fontWeight: '900' },
  comboBadge: { backgroundColor: 'rgba(249,115,22,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  comboText: { fontSize: 10, color: '#f97316', fontWeight: '900' },
  statLabel: { fontSize: 10, marginBottom: 2 },
  heroStats: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statSmall: { fontSize: 10 },
  dailyCard: {
    marginHorizontal: 12, marginBottom: 8, borderRadius: 12,
    padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1,
  },
  dailyEmoji: { fontSize: 20 },
  dailyTitle: { fontSize: 10, fontWeight: '700' },
  dailyDesc: { fontSize: 12 },
  dailyProgress: { fontSize: 14, fontWeight: '900' },
  catFilter: { marginBottom: 6 },
  catFilterContent: { paddingHorizontal: 12, gap: 6, flexDirection: 'row' },
  catFilterBtn: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: 'transparent',
  },
  catFilterText: { fontSize: 11, fontWeight: '700' },
  listContent: { paddingHorizontal: 12, paddingBottom: 100 },
  todoItem: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 10,
    marginBottom: 5, borderWidth: 1, overflow: 'hidden',
  },
  todoItemActive: { opacity: 0.8, transform: [{ scale: 1.02 }] },
  todoAccent: { width: 3, alignSelf: 'stretch' },
  checkBtn: {
    width: 26, height: 26, borderRadius: 7, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', margin: 10, flexShrink: 0,
  },
  checkMark: { fontSize: 12, color: '#4ade80', fontWeight: '700' },
  todoContent: { flex: 1, paddingVertical: 8 },
  todoTopRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginBottom: 2 },
  catChip: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  catChipText: { fontSize: 9, fontWeight: '700' },
  repeatChip: { backgroundColor: 'rgba(129,140,248,0.15)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  repeatChipText: { fontSize: 9, color: '#818cf8', fontWeight: '700' },
  todoText: { fontSize: 13, flexShrink: 1 },
  todoMemo: { fontSize: 10, marginTop: 2 },
  timeText: { fontSize: 10, marginTop: 2, fontWeight: '600' },
  todoRight: { flexDirection: 'column', alignItems: 'center', paddingRight: 10, gap: 4 },
  xpBadge: { fontSize: 9, fontWeight: '700' },
  memoEditBtn: { padding: 2 },
  deleteBtn: { fontSize: 18, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyEmoji: { fontSize: 40, marginBottom: 10, opacity: 0.5 },
  emptyText: { fontSize: 13 },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
    elevation: 8,
  },
  fabShare: { right: 88, backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  fabText: { fontSize: 24, color: '#fff', fontWeight: '700' },
  addModalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  addModalCard: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  addModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  addModalTitle: { fontSize: 18, fontWeight: '900' },
  closeBtn: { fontSize: 20, fontWeight: '700' },
  input: {
    borderWidth: 1, borderRadius: 10, padding: 12,
    fontSize: 15, marginBottom: 12,
  },
  memoInputSmall: { minHeight: 0 },
  sectionLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
  diffRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  diffBtn: {
    flex: 1, padding: 8, borderRadius: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  diffBtnText: { fontSize: 16, marginBottom: 2 },
  diffBtnLabel: { fontSize: 10, fontWeight: '700' },
  diffBtnXp: { fontSize: 9 },
  presetRow: { flexDirection: 'row', gap: 6 },
  presetBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  presetText: { fontSize: 11, fontWeight: '700' },
  repeatRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  repeatBtn: {
    flex: 1, padding: 8, borderRadius: 8, alignItems: 'center',
    borderWidth: 1, borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  repeatBtnText: { fontSize: 11, fontWeight: '700' },
  catRow: { flexDirection: 'row', gap: 6 },
  catBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  catBtnText: { fontSize: 11, fontWeight: '700' },
  addBtn: {
    backgroundColor: '#6366f1', borderRadius: 12,
    padding: 14, alignItems: 'center', marginTop: 4,
  },
  addBtnDisabled: { backgroundColor: 'rgba(99,102,241,0.4)' },
  addBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },
  catManageItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  catManageName: { flex: 1, fontSize: 13, fontWeight: '700' },
  catManageCount: { fontSize: 11 },
  newCatRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
  emojiBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
