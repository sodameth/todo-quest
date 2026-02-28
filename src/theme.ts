export const darkTheme = {
  mode: 'dark' as const,
  bg: '#0f0c18',
  bgCard: 'rgba(30,25,50,0.95)',
  bgCardSecondary: 'rgba(20,18,35,0.95)',
  bgInput: 'rgba(0,0,0,0.3)',
  border: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(250,204,21,0.3)',
  text: '#e8e0f0',
  textMuted: '#8b7fa0',
  textDim: '#5a4f6b',
  accent: '#facc15',
  accentGlow: 'rgba(250,204,21,0.2)',
  tabBar: '#0f0c18',
  tabBarBorder: 'rgba(255,255,255,0.06)',
};

export const lightTheme = {
  mode: 'light' as const,
  bg: '#f0eef8',
  bgCard: 'rgba(255,255,255,0.95)',
  bgCardSecondary: 'rgba(240,238,248,0.95)',
  bgInput: 'rgba(255,255,255,0.8)',
  border: 'rgba(0,0,0,0.08)',
  borderActive: 'rgba(250,180,21,0.5)',
  text: '#1a1028',
  textMuted: '#5a4f6b',
  textDim: '#8b7fa0',
  accent: '#b8860b',
  accentGlow: 'rgba(250,204,21,0.15)',
  tabBar: '#ffffff',
  tabBarBorder: 'rgba(0,0,0,0.08)',
};

export interface Theme {
  mode: 'dark' | 'light';
  bg: string;
  bgCard: string;
  bgCardSecondary: string;
  bgInput: string;
  border: string;
  borderActive: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  accentGlow: string;
  tabBar: string;
  tabBarBorder: string;
}
