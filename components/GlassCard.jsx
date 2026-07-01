import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeStore from '../store/useThemeStore';
import { ms } from '../utils/responsive';

/**
 * GlassCard — liquid glass card.
 *
 * IMPORTANT layout note:
 * The glass effect uses absolutely-positioned layers behind the content.
 * All padding/flex layout props are forwarded to the content wrapper View
 * so they actually affect children (not just the outer sizing shell).
 */
export default function GlassCard({
  children,
  style,
  intensity = 32,
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
    ? Math.min(intensity + 16, 80)
    : intensity;

  // ── Extract layout/padding props from style so they go to content wrapper ──
  const flatStyle = StyleSheet.flatten([style]) || {};
  const {
    padding, paddingTop, paddingBottom, paddingLeft, paddingRight,
    paddingHorizontal, paddingVertical,
    flexDirection, alignItems, justifyContent, flexWrap,
    gap, rowGap, columnGap,
    flex: _flex, // don't forward flex to content wrapper
    minHeight, height,
    // visual props stay on outer — borderRadius, borderWidth, margin*, width, etc.
    ...outerOnlyStyle
  } = flatStyle;

  const contentStyle = {
    flexDirection, alignItems, justifyContent, flexWrap,
    padding, paddingTop, paddingBottom, paddingLeft, paddingRight,
    paddingHorizontal, paddingVertical,
    gap, rowGap, columnGap,
    minHeight, height,
  };

  // ── Glass shine layers (always the same regardless of platform) ────
  const shineTop = isDark
    ? ['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.01)', 'transparent']
    : ['rgba(255,255,255,0.68)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0.04)', 'transparent'];

  const depthBottom = isDark
    ? ['transparent', 'rgba(0,0,0,0.20)']
    : ['transparent', 'rgba(160,80,0,0.12)'];

  const innerTint = isDark
    ? ['rgba(100,110,255,0.08)', 'transparent']
    : ['rgba(255,200,80,0.18)', 'transparent'];

  const GlassLayers = () => (
    <>
      <LinearGradient colors={innerTint} style={[StyleSheet.absoluteFill, { borderRadius: radius }]} pointerEvents="none" />
      <LinearGradient
        colors={shineTop} locations={[0, 0.35, 0.65, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58%', borderTopLeftRadius: radius, borderTopRightRadius: radius }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={depthBottom}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', borderBottomLeftRadius: radius, borderBottomRightRadius: radius }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={isDark ? ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.06)'] : ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.10)']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 3, left: 0, bottom: 3, width: ms(4), borderTopLeftRadius: radius, borderBottomLeftRadius: radius }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={isDark ? ['rgba(255,255,255,0.38)', 'transparent'] : ['rgba(255,255,255,0.85)', 'transparent']}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 3, right: 3, height: ms(3), borderTopLeftRadius: radius, borderTopRightRadius: radius }}
        pointerEvents="none"
      />
    </>
  );

  const outerShell = {
    borderRadius: radius,
    borderWidth: 1,
    borderColor: resolvedBorder,
    shadowColor: isDark ? '#000' : '#A06010',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.28 : 0.18,
    shadowRadius: 24,
    elevation: 10,
  };

  if (Platform.OS === 'android') {
    return (
      // Outer view carries elevation/shadow WITHOUT overflow:hidden — Android clips
      // the elevation shadow if the same view also clips its content.
      <View style={[outerShell, style]} {...props}>
        {/* Inner clip container — this is what actually rounds the blur/gradient layers.
            Without it, the BlurView's native surface bleeds past the rounded corners
            and the card edges render square on Android. */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius, overflow: 'hidden' }}>
          <BlurView
            intensity={resolvedIntensity}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod="dimezisBlurView"
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: resolvedTint }]} />
          <GlassLayers />
        </View>
        {/* Content wrapper — carries all layout/padding so children are correctly placed */}
        <View style={[{ borderRadius: radius, overflow: 'hidden' }, contentStyle]}>
          {children}
        </View>
      </View>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={[outerShell, { overflow: 'hidden' }, style]} {...props}>
        <BlurView intensity={resolvedIntensity} tint={isDark ? 'dark' : 'light'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: resolvedTint }} />
        <GlassLayers />
        <View style={contentStyle}>{children}</View>
      </View>
    );
  }

  // Web — lightweight single layer (no heavy gradient stack, smooth performance)
  const webShine = isDark
    ? 'linear-gradient(160deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 100%)'
    : 'linear-gradient(160deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.18) 40%, transparent 100%)';

  return (
    <View
      style={[outerShell, {
        overflow: 'hidden',
        position: 'relative',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: resolvedTint,
        backgroundImage: webShine,
      }, style]}
      {...props}
    >
      {/* Top rim highlight */}
      <View style={{ position: 'absolute', top: 0, left: 4, right: 4, height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.80)', borderRadius: 1 }} />
      <View style={[{ position: 'relative' }, contentStyle]}>{children}</View>
    </View>
  );
}
