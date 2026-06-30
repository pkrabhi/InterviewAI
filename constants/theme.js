// Re-export shared layout tokens and default color set.
// Screens should prefer: const { COLORS } = useThemeStore()
// so colors react to the user's chosen theme.
export { SPACING, RADIUS, FONT_SIZE, DARK_COLORS as COLORS } from '../store/useThemeStore';
