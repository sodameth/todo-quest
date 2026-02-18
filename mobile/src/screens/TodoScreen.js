import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, FlatList, StyleSheet } from 'react-native';
import { DIFFICULTY } from '../constants/difficulty';
import { CAT_EMOJIS } from '../constants/categories';
import { formatCountdown } from '../utils/formatCountdown';
import TimeSettingInput from '../components/TimeSettingInput';
import { Colors } from '../theme/colors';

export default function TodoScreen({ game, now }) {
  const {
    todos, input, setInput, difficulty, setDifficulty, deadlineMin, setDeadlineMin,
    categories, selectedCat, setSelectedCat, filterCat, setFilterCat,
    showCatManager, setShowCatManager, newCatName, setNewCatName, newCatEmoji, setNewCatEmoji,
    addTodo, addCategory, deleteCategory, deleteTodo,
    setProofModal, setUndoModal,
  } = game;

  const filtered = (filterCat === 'all' ? todos : filterCat === 'none' ? todos.filter(t => !t.category) : todos.filter(t => t.category === filterCat))
    .slice().sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (!a.done && !b.done) return (a.deadline || Infinity) - (b.deadline || Infinity);
      return 0;
    });

  const renderTodoItem = ({ item: todo }) => {
    const d = DIFFICULTY[todo.difficulty];
    const remaining = todo.deadline - now;
    const grace = (todo.deadline + 10 * 60 * 1000) - now;
    const isOverdue = !todo.done && remaining < 0;
    const isDebuff = !todo.done && grace < 0;
    const isUrgent = !todo.done && !isOverdue && remaining < 5 * 60 * 1000 && remaining > 0;
    const cat = todo.category ? categories.find(c => c.id === todo.category) : null;

    return (
      <View style={[styles.todoItem, {
        backgroundColor: todo.done ? 'rgba(74,222,128,0.05)' : isDebuff ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
        borderColor: todo.done ? 'rgba(74,222,128,0.15)' : isDebuff ? 'rgba(239,68,68,0.3)' : isUrgent ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.05)',
      }]}>
        <View style={[styles.todoStripe, {
          backgroundColor: todo.done ? '#4ade80' : isDebuff ? '#ef4444' : isUrgent ? '#fbbf24' : isOverdue ? '#f97316' : cat ? cat.color : 'transparent',
        }]} />
        <View style={styles.todoContent}>
          <Pressable
            onPress={() => todo.done ? setUndoModal(todo) : setProofModal(todo)}
            style={[styles.checkbox, { borderColor: todo.done ? '#4ade80' : d.color, backgroundColor: todo.done ? '#4ade8033' : 'transparent' }]}
          >
            {todo.done && <Text style={{ fontSize: 11, color: '#4ade80' }}>✓</Text>}
          </Pressable>
          <View style={{ flex: 1 }}>
            <View style={styles.todoTextRow}>
              {cat && (
                <Text style={[styles.catBadge, { color: cat.color, backgroundColor: cat.color + '15' }]}>
                  {cat.emoji} {cat.name}
                </Text>
              )}
              <Text
                style={[styles.todoText, { textDecorationLine: todo.done ? 'line-through' : 'none', color: todo.done ? '#6b5f7b' : '#e8e0f0' }]}
                numberOfLines={1}
              >
                {todo.text}
              </Text>
            </View>
            {!todo.done && (
              <Text style={[styles.timerText, {
                color: isDebuff ? '#ef4444' : isOverdue ? '#f97316' : isUrgent ? '#fbbf24' : '#8b7fa0',
                fontWeight: isDebuff || isUrgent ? '700' : '400',
              }]}>
                {isDebuff ? `💀 ${formatCountdown(-grace)} 초과` :
                  isOverdue ? `⚠️ 유예 ${formatCountdown(grace)}` :
                    isUrgent ? `🔥 ${formatCountdown(remaining)}` :
                      `⏰ ${formatCountdown(remaining)}`}
              </Text>
            )}
          </View>
          <Text style={[styles.xpBadge, { color: d.color, backgroundColor: d.color + '12' }]}>
            {todo.done ? '✓' : '+'}{d.xp}<Text style={{ color: '#4ade80' }}> +{d.heal}hp</Text>
          </Text>
          <Pressable onPress={() => deleteTodo(todo.id)} style={styles.deleteBtn}>
            <Text style={{ color: '#4a4258', fontSize: 16 }}>×</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View>
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 4, paddingBottom: 4 }}>
        <Pressable onPress={() => setFilterCat('all')} style={[styles.filterBtn, filterCat === 'all' && styles.filterBtnActive]}>
          <Text style={[styles.filterText, filterCat === 'all' && styles.filterTextActive]}>전체 ({todos.length})</Text>
        </Pressable>
        <Pressable onPress={() => setFilterCat('none')} style={[styles.filterBtn, filterCat === 'none' && styles.filterBtnActive]}>
          <Text style={[styles.filterText, filterCat === 'none' && { color: '#8b7fa0' }]}>미분류 ({todos.filter(t => !t.category).length})</Text>
        </Pressable>
        {categories.map(cat => (
          <Pressable key={cat.id} onPress={() => setFilterCat(cat.id)} style={[styles.filterBtn, filterCat === cat.id && { backgroundColor: cat.color + '18' }]}>
            <Text style={[styles.filterText, filterCat === cat.id && { color: cat.color }]}>{cat.emoji} {cat.name} ({todos.filter(t => t.category === cat.id).length})</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addTodo}
            placeholder="새로운 퀘스트를 입력하세요..."
            placeholderTextColor="#6b5f7b"
            style={styles.textInput}
            returnKeyType="done"
          />
          <Pressable onPress={addTodo} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </View>

        {/* Category selector */}
        <View style={{ marginBottom: 8 }}>
          <View style={styles.catHeader}>
            <Text style={styles.catLabel}>📂 카테고리</Text>
            {categories.length > 0 && (
              <Pressable onPress={() => setShowCatManager(!showCatManager)} style={styles.catManageBtn}>
                <Text style={styles.catManageBtnText}>⚙️ 관리</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.catRow}>
            <Pressable
              onPress={() => setSelectedCat(null)}
              style={[styles.catBtn, selectedCat === null && styles.catBtnActive]}
            >
              <Text style={[styles.catBtnText, selectedCat === null && { color: '#e8e0f0' }]}>없음</Text>
            </Pressable>
            {categories.map(cat => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCat(cat.id)}
                style={[styles.catBtn, selectedCat === cat.id && { backgroundColor: cat.color + '22' }]}
              >
                <Text style={[styles.catBtnText, selectedCat === cat.id && { color: cat.color }]}>{cat.emoji} {cat.name}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setShowCatManager(true)} style={styles.catAddBtn}>
              <Text style={{ color: '#5a4f6b', fontSize: 14 }}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Category Manager */}
        {showCatManager && (
          <View style={styles.catManager}>
            <View style={styles.catManagerHeader}>
              <Text style={styles.catManagerTitle}>📂 {categories.length > 0 ? '카테고리 관리' : '새 카테고리 만들기'}</Text>
              <Pressable onPress={() => setShowCatManager(false)}>
                <Text style={{ color: '#5a4f6b', fontSize: 14 }}>✕</Text>
              </Pressable>
            </View>
            {categories.map(cat => (
              <View key={cat.id} style={[styles.catListItem, { borderColor: cat.color + '22' }]}>
                <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
                <Text style={[styles.catListName, { color: cat.color }]}>{cat.name}</Text>
                <Text style={styles.catListCount}>{todos.filter(t => t.category === cat.id).length}개</Text>
                <Pressable onPress={() => deleteCategory(cat.id)}>
                  <Text style={{ color: '#4a4258', fontSize: 14 }}>×</Text>
                </Pressable>
              </View>
            ))}
            <View style={styles.catAddRow}>
              <View style={styles.emojiPicker}>
                <Text style={{ fontSize: 16 }}>{newCatEmoji}</Text>
              </View>
              <TextInput
                value={newCatName}
                onChangeText={setNewCatName}
                onSubmitEditing={addCategory}
                placeholder="카테고리 이름"
                placeholderTextColor="#6b5f7b"
                maxLength={10}
                style={styles.catNameInput}
              />
              <Pressable onPress={addCategory} style={styles.catAddSubmitBtn}>
                <Text style={styles.catAddSubmitText}>추가</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Difficulty */}
        <View style={styles.difficultyRow}>
          {Object.entries(DIFFICULTY).map(([key, d]) => (
            <Pressable
              key={key}
              onPress={() => setDifficulty(key)}
              style={[styles.diffBtn, difficulty === key && { backgroundColor: d.color + '22' }]}
            >
              <Text style={[styles.diffBtnText, { color: difficulty === key ? d.color : '#6b5f7b' }]}>
                {d.emoji} {d.label}
              </Text>
              <Text style={[styles.diffBtnSub, { color: difficulty === key ? d.color : '#6b5f7b' }]}>
                +{d.xp}xp +{d.heal}hp
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Time Setting - NEW FEATURE */}
        <TimeSettingInput value={deadlineMin} onChange={setDeadlineMin} />
      </View>

      {/* Todo List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }}>{filterCat === 'all' ? '📜' : '📂'}</Text>
          <Text style={styles.emptyText}>
            {filterCat === 'all' ? '퀘스트를 추가해서 모험을 시작하세요!' : '이 카테고리에 퀘스트가 없습니다'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={renderTodoItem}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 5 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterScroll: { marginBottom: 10 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  filterBtnActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  filterText: { fontSize: 10.5, fontWeight: '700', color: '#5a4f6b' },
  filterTextActive: { color: '#e8e0f0' },
  inputArea: {
    backgroundColor: Colors.bg.subtle,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  inputRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.bg.input,
    color: Colors.text.primary,
    fontSize: 14,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  catHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  catLabel: { fontSize: 10, color: Colors.text.secondary },
  catManageBtn: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  catManageBtnText: { fontSize: 8, color: '#5a4f6b' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  catBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 7 },
  catBtnActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  catBtnText: { fontSize: 10, fontWeight: '700', color: '#5a4f6b' },
  catAddBtn: {
    width: 26, height: 26, borderRadius: 7,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  catManager: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border.medium,
  },
  catManagerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  catManagerTitle: { flex: 1, fontSize: 10.5, color: '#fbbf24', fontWeight: '700' },
  catListItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, marginBottom: 4,
  },
  catListName: { flex: 1, fontSize: 12, fontWeight: '700' },
  catListCount: { fontSize: 8, color: '#5a4f6b' },
  catAddRow: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 6 },
  emojiPicker: {
    width: 34, height: 34, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border.light,
    backgroundColor: Colors.bg.input,
    justifyContent: 'center', alignItems: 'center',
  },
  catNameInput: {
    flex: 1, paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border.light,
    backgroundColor: Colors.bg.input, color: Colors.text.primary, fontSize: 12,
  },
  catAddSubmitBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 8, backgroundColor: '#6366f1',
  },
  catAddSubmitText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  difficultyRow: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  diffBtn: { flex: 1, paddingVertical: 5, borderRadius: 7, alignItems: 'center' },
  diffBtnText: { fontWeight: '700', fontSize: 10 },
  diffBtnSub: { fontSize: 8, opacity: 0.8, marginTop: 1 },
  todoItem: {
    flexDirection: 'row', borderRadius: 10, overflow: 'hidden',
    borderWidth: 1,
  },
  todoStripe: { width: 3 },
  todoContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, paddingHorizontal: 8 },
  checkbox: {
    width: 26, height: 26, borderRadius: 7, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  todoTextRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  catBadge: { fontSize: 8, fontWeight: '700', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  todoText: { fontSize: 13, flex: 1 },
  timerText: { fontSize: 9, marginTop: 2 },
  xpBadge: { fontSize: 9, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  deleteBtn: { paddingHorizontal: 2 },
  emptyState: { alignItems: 'center', padding: 36 },
  emptyText: { fontSize: 13, color: '#5a4f6b' },
});
