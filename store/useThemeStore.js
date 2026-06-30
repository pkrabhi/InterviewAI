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
  bg:           '#060912',
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
  glassTint:    'rgba(8, 14, 40, 0.45)',
  glassBorder:  'rgba(255, 255, 255, 0.18)',
  inputBg:      'rgba(255, 255, 255, 0.07)',
  inputBorder:  'rgba(255, 255, 255, 0.14)',
  // orbs — vivid so BlurView has rich color to blur over
  orb1: ['#6366F1CC', '#4338CAA0', '#7C3AED44', 'transparent'],
  orb2: ['#F59E0BAA', '#EF444470', '#EC489960', 'transparent'],
  orb3: ['#818CF8AA', '#6366F160', 'transparent'],
  orb4: ['#7C3AEDBB', '#A855F770', 'transparent'],
};

// ── Light theme (warm golden liquid glass like reference image) ─────────
export const LIGHT_COLORS = {
  bg:           '#E8C97A',
  card:         '#FDF6E3',
  primary:      '#5B5FEF',
  primaryLight: '#7B7FF5',
  accent:       '#D97706',
  success:      '#059669',
  danger:       '#DC2626',
  text:         '#1C1006',
  textMuted:    '#7A5C30',
  border:       'rgba(180, 120, 40, 0.35)',
  // glass-specific — translucent warm amber glass
  glassTint:    'rgba(255, 210, 120, 0.28)',
  glassBorder:  'rgba(255, 200, 80, 0.50)',
  inputBg:      'rgba(180, 110, 20, 0.14)',
  inputBorder:  'rgba(200, 140, 40, 0.35)',
  // orbs — deep saturated amber/coral/orange for vivid glass blur
  orb1: ['#F59E0BEE', '#FBBF24CC', '#FDE68A80', 'transparent'],
  orb2: ['#EF4444CC', '#F97316BB', '#FB923C80', 'transparent'],
  orb3: ['#FCD34DEE', '#F59E0BAA', 'transparent'],
  orb4: ['#FB923CCC', '#FDE047AA', 'transparent'],
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
