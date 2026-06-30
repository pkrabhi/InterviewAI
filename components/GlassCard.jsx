import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { ms } from '../utils/responsive';

/**
 * Glass card that actually blurs on both iOS and Android.
 *
 * iOS:     BlurView inside overflow:hidden (works perfectly)
 * Android: BlurView with borderRadius applied directly — expo-blur 56 supports
 *          this via RenderEffect (Android 12+). No overflow:hidden needed.
 * Web:     CSS backdropFilter fallback
 */
export default function GlassCard({
  children,
  style,
  intensity = 22,
  tint,
  borderColor = 'rgba(255, 255, 255, 0.13)',
  borderRadius: radiusProp,
  ...props
}) {
  const radius = radiusProp ?? ms(20);
  // Android gets a slightly more opaque tint since RenderEffect blur is subtler
  const resolvedTint = tint ?? (
    Platform.OS === 'android'
      ? 'rgba(12, 18, 36, 0.72)'
      : 'rgba(15, 23, 41, 0.48)'
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.base, { borderColor, borderRadius: radius, overflow: 'hidden' }, style]} {...props}>
        <View style={[StyleSheet.absoluteFill, { backdropFilter: 'blur(20px)', backgroundColor: resolvedTint, borderRadius: radius }]} />
        <View style={{ position: 'relative' }}>{children}</View>
      </View>
    );
  }

  if (Platform.OS === 'android') {
    // Android: BlurView with its own borderRadius — no overflow:hidden on parent
    // Content clipped inside its own overflow:hidden wrapper
    return (
      <View style={[styles.base, { borderColor, borderRadius: radius }, style]} {...props}>
        <BlurView
          intensity={intensity}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          experimentalBlurMethod="dimezisBlurView"
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: resolvedTint, borderRadius: radius }]} />
        <View style={{ borderRadius: radius, overflow: 'hidden' }}>{children}</View>
      </View>
    );
  }

  // iOS — classic approach with overflow:hidden on container
  return (
    <View style={[styles.base, { borderColor, borderRadius: radius, overflow: 'hidden' }, style]} {...props}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: resolvedTint }]} />
      <View style={{ position: 'relative' }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
});
