import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVE_KEY = 'todoquest_save_v2';

export async function loadSave(): Promise<any | null> {
  try {
    const data = await AsyncStorage.getItem(SAVE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function writeSave(data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {}
}

export async function clearSave(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch {}
}

const THEME_KEY = 'todoquest_theme';
export async function loadTheme(): Promise<'dark' | 'light'> {
  try {
    const t = await AsyncStorage.getItem(THEME_KEY);
    return (t as 'dark' | 'light') || 'dark';
  } catch {
    return 'dark';
  }
}

export async function saveTheme(theme: 'dark' | 'light'): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch {}
}
