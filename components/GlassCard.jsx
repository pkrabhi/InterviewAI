import React from 'react';
import { View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import useThemeStore from '../store/useThemeStore';
import { ms } from '../utils/responsive';

/**
 * Liquid-glass card.
 *
 * iOS     — BlurView (overflow:hidden on container)
 * Android — BlurView with borderRadius on the view itself (expo-blur 56, Android 12+)
 *           experimentalBlurMethod="dimezisBlurView" for wider support
 * Web     — CSS backdropFilter
 *
 * Both tint and border automatically adapt to the active theme.
 */
export default function GlassCard({
  children,
  style,
  intensity = 24,
  tint,
  borderColor,
  borderRadius: radiusProp,
  ...props
}) {
  const { COLORS, isDark } = useThemeStore();
  const radius = radiusProp ?? ms(20);

  // Let callers override, otherwise use theme defaults
  const resolvedTint   = tint        ?? COLORS.glassTint;
  const resolvedBorder = borderColor ?? COLORS.glassBorder;

  // Android needs slightly higher intensity to look comparable to iOS
  const resolvedIntensity = Platform.OS === 'android'
    ? Math.min(intensity + 10, 60)
    : intensity;

  if (Platform.OS === 'web') {
    return (
      <View style={[{ borderRadius: radius, borderWidth: 1, borderColor: resolvedBorder, overflow: 'hidden' }, style]} {...props}>
        <View style={{ ...webBlur, backgroundColor: resolvedTint, borderRadius: radius }} />
        <View style={{ position: 'relative' }}>{children}</View>
      </View>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <View style={[{ borderRadius: radius, borderWidth: 1, borderColor: resolvedBorder }, style]} {...props}>
        <BlurView
          intensity={resolvedIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius }]}
          experimentalBlurMethod="dimezisBlurView"
        />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: resolvedTint, borderRadius: radius }} />
        <View style={{ borderRadius: radius, overflow: 'hidden' }}>{children}</View>
      </View>
    );
  }

  // iOS
  return (
    <View style={[{ borderRadius: radius, borderWidth: 1, borderColor: resolvedBorder, overflow: 'hidden' }, style]} {...props}>
      <BlurView intensity={resolvedIntensity} tint={isDark ? 'dark' : 'light'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: resolvedTint }} />
      <View style={{ position: 'relative' }}>{children}</View>
    </View>
  );
}

const webBlur = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
};
