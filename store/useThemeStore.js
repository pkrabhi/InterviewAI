import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ms } from '../utils/responsive';

// ── Shared non-color tokens ────────────────────────────────────────────
export const SPACING = {
  xs: ms(4), sm: ms(8), md: ms(16), lg: ms(24), xl: ms(32), xxl: ms(48),
};
export const RADIUS = {
  sm: ms(8), md: ms(12), lg: ms(16), xl: ms(24), full: 999,
};
export const FONT_SIZE = {
  xs: ms(11), sm: ms(13), md: ms(15), lg: ms(18), xl: ms(22), xxl: ms(28), hero: ms(34),
};

// ── Dark theme (deep navy with indigo glass) ───────────────────────────
export const DARK_COLORS = {
  bg:           '#080B14',
  card:         '#111827',
  primary:      '#6366F1',
  primaryLight: '#818CF8',
  accent:       '#F59E0B',
  success:      '#10B981',
  danger:       '#EF4444',
  text:         '#F8FAFF',
  textMuted:    '#94A3B8',
  border:       '#1E3A5F',
  // glass-specific
  glassTint:    'rgba(10, 16, 32, 0.55)',
  glassBorder:  'rgba(255, 255, 255, 0.13)',
  inputBg:      'rgba(255, 255, 255, 0.07)',
  inputBorder:  'rgba(255, 255, 255, 0.12)',
  // orbs
  orb1: ['#6366F180', '#4338CA50', 'transparent'],
  orb2: ['#F59E0B55', '#EF444430', 'transparent'],
  orb3: ['#818CF845', 'transparent'],
  orb4: ['#7C3AED30', 'transparent'],
};

// ── Light theme (warm golden liquid glass like reference image) ─────────
export const LIGHT_COLORS = {
  bg:           '#F5E6C8',
  card:         '#FDF6E3',
  primary:      '#5B5FEF',
  primaryLight: '#7B7FF5',
  accent:       '#D97706',
  success:      '#059669',
  danger:       '#DC2626',
  text:         '#1C1006',
  textMuted:    '#7A5C30',
  border:       'rgba(180, 120, 40, 0.3)',
  // glass-specific
  glassTint:    'rgba(255, 240, 190, 0.32)',
  glassBorder:  'rgba(220, 160, 60, 0.35)',
  inputBg:      'rgba(180, 120, 40, 0.12)',
  inputBorder:  'rgba(180, 120, 40, 0.25)',
  // orbs — warm amber/golden/coral palette
  orb1: ['#F59E0B90', '#FBBF2460', 'transparent'],
  orb2: ['#EF444455', '#F9731640', 'transparent'],
  orb3: ['#FCD34D50', 'transparent'],
  orb4: ['#FB923C40', 'transparent'],
};

const useThemeStore = create((set, get) => ({
  isDark:  true,
  COLORS:  DARK_COLORS,

  toggleTheme: async () => {
    const next = !get().isDark;
    set({ isDark: next, COLORS: next ? DARK_COLORS : LIGHT_COLORS });
    await AsyncStorage.setItem('app_theme', next ? 'dark' : 'light');
  },

  loadTheme: async () => {
    const saved = await AsyncStorage.getItem('app_theme');
    const isDark = saved !== 'light';
    set({ isDark, COLORS: isDark ? DARK_COLORS : LIGHT_COLORS });
  },
}));

export default useThemeStore;
