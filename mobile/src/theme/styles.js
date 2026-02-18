import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const SharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scrollContent: {
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardSubtle: {
    backgroundColor: Colors.bg.subtle,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textXS: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  textSM: {
    fontSize: 12,
    color: Colors.text.primary,
  },
  textMD: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  textBold: {
    fontWeight: '700',
  },
  textBlack: {
    fontWeight: '900',
  },
});
