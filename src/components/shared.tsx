import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useGame } from '../context/GameContext';
import { DIFFICULTY, RARITY_COLOR } from '../constants';

/* ─── ProgressBar ─── */
export const ProgressBar: React.FC<{
  value: number;
  max: number;
  color: string;
  height?: number;
  label?: string;
}> = ({ value, max, color, height = 12, label }) => {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={[styles.barBg, { height }]}>
      <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color, height }]} />
      {label ? (
        <Text style={styles.barLabel}>{label}</Text>
      ) : null}
    </View>
  );
};

/* ─── FloatingTexts ─── */
export const FloatingTexts: React.FC = () => {
  const { floats } = useGame();
  return (
    <View style={styles.floatsContainer} pointerEvents="none">
      {floats.map(f => <FloatItem key={f.id} text={f.text} color={f.color} />)}
    </View>
  );
};

const FloatItem: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const y = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(y, { toValue: -50, duration: 1000, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.Text style={[styles.floatText, { color, transform: [{ translateY: y }], opacity: op }]}>
      {text}
    </Animated.Text>
  );
};

/* ─── Achievement Toast ─── */
export const AchievementToast: React.FC = () => {
  const { achToast, setAchToast } = useGame();
  const [visible, setVisible] = useState(false);
  const slide = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (achToast) {
      setVisible(true);
      Animated.sequence([
        Animated.spring(slide, { toValue: 0, useNativeDriver: true }),
        Animated.delay(3000),
        Animated.timing(slide, { toValue: -80, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        setVisible(false);
        setAchToast(null);
      });
    }
  }, [achToast]);

  if (!visible || !achToast) return null;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: slide }] }]}>
      <Text style={styles.toastEmoji}>{achToast.emoji}</Text>
      <View>
        <Text style={styles.toastTitle}>🏅 업적 달성!</Text>
        <Text style={styles.toastName}>{achToast.name}</Text>
        <Text style={styles.toastDesc}>{achToast.desc}</Text>
      </View>
    </Animated.View>
  );
};

/* ─── QR Scanner Modal ─── */
// 카메라 뷰는 반드시 transparent={false} 인 별도 Modal에서 렌더링해야 합니다.
// transparent Modal 안에 CameraView를 넣으면 iOS/Android 모두 흰 화면(white screen)이 발생합니다.
const QRScannerModal: React.FC<{
  visible: boolean;
  onScanned: (data: string) => void;
  onClose: () => void;
}> = ({ visible, onScanned, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  if (!visible) return null;

  if (!permission) {
    return (
      // transparent={false} 필수: 카메라 렌더링 시 흰 화면 방지
      <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
        <View style={styles.qrContainer}>
          <Text style={styles.qrPermissionText}>카메라 권한을 확인 중...</Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
        <View style={styles.qrContainer}>
          <Text style={styles.qrPermissionText}>카메라 접근 권한이 필요합니다</Text>
          <TouchableOpacity style={styles.qrPermissionBtn} onPress={requestPermission}>
            <Text style={styles.qrPermissionBtnText}>권한 허용</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.qrPermissionBtn, { backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 8 }]} onPress={onClose}>
            <Text style={[styles.qrPermissionBtnText, { color: '#aaa' }]}>취소</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    // transparent={false} 필수: CameraView가 흰 화면 없이 정상 렌더링됩니다
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <View style={styles.qrContainer}>
        <Text style={styles.qrTitle}>📷 QR 코드 스캔</Text>
        <Text style={styles.qrSubTitle}>완료 증명용 QR 코드를 화면에 비춰주세요</Text>

        <CameraView
          style={styles.qrCamera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : ({ data }) => {
            setScanned(true);
            onScanned(data);
          }}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />

        <View style={styles.qrOverlay}>
          <View style={styles.qrFrame} />
        </View>

        <TouchableOpacity style={styles.qrCloseBtn} onPress={onClose}>
          <Text style={styles.qrCloseBtnText}>✕ 닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

/* ─── Proof Modal ─── */
export const ProofModal: React.FC<{
  visible: boolean;
  todo: any;
  onConfirm: (uri: string | null) => void;
  onClose: () => void;
}> = ({ visible, todo, onConfirm, onClose }) => {
  const { theme } = useGame();
  const [showQR, setShowQR] = useState(false);
  if (!todo) return null;
  const d = DIFFICULTY[todo.difficulty as keyof typeof DIFFICULTY];

  const handleClose = () => {
    setShowQR(false);
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={styles.modalTitle}>⚔️ 퀘스트 완료</Text>
            <Text style={[styles.modalSubTitle, { color: theme.textMuted }]}>정말 완료하셨나요?</Text>

            <View style={[styles.todoPreview, { backgroundColor: theme.bgCardSecondary, borderColor: theme.border }]}>
              <Text style={[styles.diffBadge, { color: d.color }]}>{d.emoji}</Text>
              <Text style={[styles.todoPreviewText, { color: theme.text }]} numberOfLines={2}>{todo.text}</Text>
              <Text style={[styles.xpText, { color: d.color }]}>+{d.xp}xp</Text>
            </View>

            {todo.memo ? (
              <View style={[styles.memoBox, { backgroundColor: theme.bgCardSecondary, borderColor: theme.border }]}>
                <Text style={[styles.memoLabel, { color: theme.textMuted }]}>메모</Text>
                <Text style={[styles.memoText, { color: theme.text }]}>{todo.memo}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.qrScanBtn, { borderColor: theme.border }]}
              onPress={() => setShowQR(true)}
            >
              <Text style={[styles.qrScanBtnText, { color: theme.textMuted }]}>📷 QR 스캔으로 완료</Text>
            </TouchableOpacity>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: theme.border }]} onPress={handleClose}>
                <Text style={[styles.modalBtnText, { color: theme.textMuted }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={() => onConfirm(null)}
              >
                <Text style={styles.modalBtnPrimaryText}>완료하기!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR 스캐너: transparent={false} 별도 Modal로 렌더링하여 흰 화면 방지 */}
      <QRScannerModal
        visible={showQR}
        onScanned={(data) => {
          setShowQR(false);
          onConfirm(data);
        }}
        onClose={() => setShowQR(false)}
      />
    </>
  );
};

/* ─── Undo Modal ─── */
export const UndoModal: React.FC<{
  visible: boolean;
  todo: any;
  onConfirm: (id: number, xp: number) => void;
  onClose: () => void;
}> = ({ visible, todo, onConfirm, onClose }) => {
  const { theme } = useGame();
  if (!todo) return null;
  const d = DIFFICULTY[todo.difficulty as keyof typeof DIFFICULTY];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: 'rgba(248,113,113,0.2)' }]}>
          <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>⚠️</Text>
          <Text style={[styles.modalTitle, { color: '#f87171' }]}>퀘스트 완료를 취소할까요?</Text>
          <Text style={[styles.modalSubTitle, { color: theme.textMuted }]} numberOfLines={2}>{todo.text}</Text>
          <View style={[styles.warningBox, { backgroundColor: 'rgba(248,113,113,0.08)' }]}>
            <Text style={{ fontSize: 12, color: '#f87171', fontWeight: '700', textAlign: 'center' }}>
              경험치 {d.xp}xp 차감 & 콤보 초기화
            </Text>
          </View>
          <View style={styles.modalBtns}>
            <TouchableOpacity style={[styles.modalBtn, { borderColor: theme.border }]} onPress={onClose}>
              <Text style={[styles.modalBtnText, { color: theme.textMuted }]}>아니오</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: '#ef4444', borderColor: '#ef4444' }]}
              onPress={() => onConfirm(todo.id, d.xp)}
            >
              <Text style={[styles.modalBtnPrimaryText, { color: '#fff' }]}>취소하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ─── Loot Modal ─── */
export const LootModal: React.FC<{
  visible: boolean;
  items: any[];
  onClose: () => void;
}> = ({ visible, items, onClose }) => {
  const { theme } = useGame();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: 'rgba(251,191,36,0.3)' }]}>
          <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 8 }}>🎁</Text>
          <Text style={[styles.modalTitle, { color: '#fbbf24' }]}>전리품 획득!</Text>
          {items.map((it, i) => (
            <View key={i} style={[styles.lootItem, { borderColor: (RARITY_COLOR[it.rarity] || '#fff') + '33' }]}>
              <Text style={{ fontSize: 24 }}>{it.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lootName, { color: theme.text }]}>{it.name}</Text>
                <Text style={[styles.lootDesc, { color: RARITY_COLOR[it.rarity] }]}>{it.desc}</Text>
              </View>
              <Text style={[styles.rarityLabel, { color: RARITY_COLOR[it.rarity] }]}>{it.rarity}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.lootBtn} onPress={onClose}>
            <Text style={styles.lootBtnText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/* ─── Memo Modal ─── */
export const MemoModal: React.FC<{
  visible: boolean;
  initialMemo: string;
  todoText: string;
  onSave: (memo: string) => void;
  onClose: () => void;
}> = ({ visible, initialMemo, todoText, onSave, onClose }) => {
  const { theme } = useGame();
  const [memo, setMemo] = useState(initialMemo);
  useEffect(() => { setMemo(initialMemo); }, [initialMemo]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>📝 메모 편집</Text>
          <Text style={[styles.modalSubTitle, { color: theme.textMuted }]} numberOfLines={1}>{todoText}</Text>
          <TextInput
            style={[styles.memoInput, { backgroundColor: theme.bgInput, color: theme.text, borderColor: theme.border }]}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모를 입력하세요..."
            placeholderTextColor={theme.textDim}
            multiline
            numberOfLines={4}
          />
          <View style={styles.modalBtns}>
            <TouchableOpacity style={[styles.modalBtn, { borderColor: theme.border }]} onPress={onClose}>
              <Text style={[styles.modalBtnText, { color: theme.textMuted }]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={() => onSave(memo)}>
              <Text style={styles.modalBtnPrimaryText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  barBg: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    borderRadius: 6,
  },
  barLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  floatsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  floatText: {
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginVertical: 2,
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30,25,50,0.95)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(251,191,36,0.4)',
    zIndex: 3000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  toastEmoji: { fontSize: 28 },
  toastTitle: { fontSize: 10, color: '#fbbf24', fontWeight: '700', marginBottom: 2 },
  toastName: { fontSize: 13, color: '#e8e0f0', fontWeight: '700' },
  toastDesc: { fontSize: 10, color: '#8b7fa0' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#e8e0f0',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  todoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    gap: 8,
  },
  diffBadge: { fontSize: 16, fontWeight: '700' },
  todoPreviewText: { flex: 1, fontSize: 14 },
  xpText: { fontSize: 12, fontWeight: '700' },
  memoBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  memoLabel: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
  memoText: { fontSize: 13 },
  modalBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalBtnText: { fontSize: 14, fontWeight: '700' },
  modalBtnPrimary: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  modalBtnPrimaryText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  warningBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  lootItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  lootName: { fontSize: 13, fontWeight: '700' },
  lootDesc: { fontSize: 10, marginTop: 1 },
  rarityLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  lootBtn: {
    marginTop: 12,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  lootBtnText: { fontSize: 14, fontWeight: '900', color: '#1a1028' },
  memoInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  qrScanBtn: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  qrScanBtnText: { fontSize: 13, fontWeight: '700' },
  // QR Scanner Modal styles
  qrContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#e8e0f0',
    marginBottom: 6,
    textAlign: 'center',
  },
  qrSubTitle: {
    fontSize: 12,
    color: '#8b7fa0',
    marginBottom: 24,
    textAlign: 'center',
  },
  qrCamera: {
    width: 280,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
  },
  qrOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  qrFrame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 12,
    marginTop: 60,
  },
  qrCloseBtn: {
    marginTop: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  qrCloseBtnText: { fontSize: 14, fontWeight: '700', color: '#e8e0f0' },
  qrPermissionText: {
    fontSize: 15,
    color: '#e8e0f0',
    textAlign: 'center',
    marginBottom: 20,
  },
  qrPermissionBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  qrPermissionBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
