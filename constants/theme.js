import { ms } from '../utils/responsive';

export const COLORS = {
  bg:           '#0A0E1A',
  card:         '#141C2E',
  cardLight:    '#1A2440',
  primary:      '#6366F1',
  primaryLight: '#818CF8',
  accent:       '#F59E0B',
  success:      '#10B981',
  danger:       '#EF4444',
  text:         '#F8FAFF',
  textMuted:    '#94A3B8',
  border:       '#2D4068',
};

export const FONTS = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
  mono:     'SpaceMono_400Regular',
};

// All spacing and radius values scale with screen width (moderate scale)
export const SPACING = {
  xs:  ms(4),
  sm:  ms(8),
  md:  ms(16),
  lg:  ms(24),
  xl:  ms(32),
  xxl: ms(48),
};

export const RADIUS = {
  sm:   ms(8),
  md:   ms(12),
  lg:   ms(16),
  xl:   ms(24),
  full: 999,
};

// Responsive font scale — use these in StyleSheets instead of hard-coding px
export const FONT_SIZE = {
  xs:   ms(11),
  sm:   ms(13),
  md:   ms(15),
  lg:   ms(18),
  xl:   ms(22),
  xxl:  ms(28),
  hero: ms(34),
};
