import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeStore from '../store/useThemeStore';
import { ms } from '../utils/responsive';

/**
 * Liquid glass card.
 *
 * Technique:
 *  1. BlurView behind everything (frosted layer)
 *  2. Warm/cool tint overlay
 *  3. Top-shine gradient  — simulates light hitting glass surface
 *  4. Left-rim highlight  — simulates glass edge thickness
 *  5. Bottom depth shadow — gives the card a "resting on surface" feel
 *  6. Bright top border   — glass rim
 *
 * Result: visible glass effect even on devices where BlurView is flat.
 */
export default function GlassCard({
  children,
  style,
  intensity = 40,
  tint,
  borderColor,
  borderRadius: radiusProp,
  ...props
}) {
  const { COLORS, isDark } = useThemeStore();
  const radius = radiusProp ?? ms(20);

  const resolvedTint   = tint        ?? COLORS.glassTint;
  const resolvedBorder = borderColor ?? COLORS.glassBorder;

  const resolvedIntensity = Platform.OS === 'android'
    ? Math.min(intensity + 20, 80)
    : intensity;

  // ── Glass visual layers ──────────────────────────────────────────
  // Top shine — the brightest part simulating light on glass
  const shineTop = isDark
    ? ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)', 'transparent']
    : ['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.32)', 'rgba(255,255,255,0.06)', 'transparent'];

  // Bottom shadow — glass sitting on surface
  const depthBottom = isDark
    ? ['transparent', 'rgba(0,0,0,0.22)']
    : ['transparent', 'rgba(160, 80, 0, 0.14)'];

  // Inner gradient tint — gives glass its "color"
  const innerTint = isDark
    ? ['rgba(100,110,255,0.10)', 'rgba(60,70,180,0.06)', 'rgba(0,0,0,0.0)']
    : ['rgba(255,200,80,0.22)', 'rgba(255,160,30,0.10)', 'rgba(255,255,255,0.0)'];

  const GlassLayers = () => (
    <>
      {/* Inner color tint — top to bottom gradient */}
      <LinearGradient
        colors={innerTint}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        pointerEvents="none"
      />

      {/* Top shine — covers top 55% of card */}
      <LinearGradient
        colors={shineTop}
        locations={[0, 0.35, 0.65, 1]}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '58%',
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
        }}
        pointerEvents="none"
      />

      {/* Bottom depth */}
      <LinearGradient
        colors={depthBottom}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '35%',
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
        }}
        pointerEvents="none"
      />

      {/* Left-edge rim — glass thickness illusion */}
      <LinearGradient
        colors={isDark
          ? ['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)']
          : ['rgba(255,255,255,0.80)', 'rgba(255,255,255,0.30)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: 'absolute', top: 3, left: 0, bottom: 3, width: ms(4),
          borderTopLeftRadius: radius,
          borderBottomLeftRadius: radius,
        }}
        pointerEvents="none"
      />

      {/* Top-edge rim highlight */}
      <LinearGradient
        colors={isDark
          ? ['rgba(255,255,255,0.40)', 'rgba(255,255,255,0.10)', 'transparent']
          : ['rgba(255,255,255,0.90)', 'rgba(255,255,255,0.35)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute', top: 0, left: 3, right: 3, height: ms(3),
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
        }}
        pointerEvents="none"
      />
    </>
  );

  // ── Render ───────────────────────────────────────────────────────
  const outerStyle = {
    borderRadius: radius,
    borderWidth: 1,
    borderColor: resolvedBorder,
    shadowColor: isDark ? '#000' : '#A06010',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDark ? 0.30 : 0.22,
    shadowRadius: 28,
    elevation: 12,
  };

  if (Platform.OS === 'android') {
    return (
      <View style={[outerStyle, style]} {...props}>
        {/* Blur */}
        <BlurView
          intensity={resolvedIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius }}
          experimentalBlurMethod="dimezisBlurView"
        />
        {/* Base tint */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: resolvedTint, borderRadius: radius,
        }} />
        {/* Glass shine layers */}
        <GlassLayers />
        {/* Content */}
        <View style={{ borderRadius: radius, overflow: 'hidden' }}>
          {children}
        </View>
      </View>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={[outerStyle, { overflow: 'hidden' }, style]} {...props}>
        <BlurView
          intensity={resolvedIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: resolvedTint }} />
        <GlassLayers />
        <View style={{ position: 'relative' }}>{children}</View>
      </View>
    );
  }

  // Web
  return (
    <View style={[outerStyle, { overflow: 'hidden' }, style]} {...props}>
      <View style={[StyleSheet.absoluteFill, webBlur, { backgroundColor: resolvedTint }]} />
      <GlassLayers />
      <View style={{ position: 'relative' }}>{children}</View>
    </View>
  );
}

const webBlur = {
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
};
