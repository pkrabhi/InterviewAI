import { Dimensions, PixelRatio } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// Base design target: 390dp wide (Pixel 6 / iPhone 14)
const BASE_W = 390;
const BASE_H = 844;

/** Scales a size proportionally to screen width */
export const scale = (size) => (W / BASE_W) * size;

/** Scales a size proportionally to screen height */
export const vScale = (size) => (H / BASE_H) * size;

/**
 * Moderate scale — blends fixed + proportional.
 * factor=0 → no scaling, factor=1 → full scale.
 * Default 0.45 keeps fonts readable on small and large screens.
 */
export const ms = (size, factor = 0.45) =>
  Math.round(size + (scale(size) - size) * factor);

export const SCREEN_W = W;
export const SCREEN_H = H;

/** True if the screen is "small" — e.g. Galaxy A-series (<360dp) */
export const isSmallScreen = W < 360;
/** True if the screen is "large" — e.g. Galaxy S Ultra (>420dp) */
export const isLargeScreen = W > 420;
