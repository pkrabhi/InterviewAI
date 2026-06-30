import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeStore from '../store/useThemeStore';
import { ms } from '../utils/responsive';

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

  // Android needs higher intensity
  const resolvedIntensity = Platform.OS === 'android'
    ? Math.min(intensity + 16, 70)
    : intensity;

  // Top shine colors — warm for light theme, cool white for dark
  const shineColors = isDark
    ? ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.06)', 'transparent']
    : ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.18)', 'transparent'];

  // Bottom depth shadow
  const depthColors = isDark
    ? ['transparent', 'rgba(0,0,0,0.18)']
    : ['transparent', 'rgba(180,100,0,0.10)'];

  const GlassContent = ({ children: c }) => (
    <>
      {/* Top shine — the "glass surface" reflection */}
      <LinearGradient
        colors={shineColors}
        style={[StyleSheet.absoluteFill, {
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          bottom: '50%',
        }]}
        pointerEvents="none"
      />
      {/* Bottom depth */}
      <LinearGradient
        colors={depthColors}
        style={[StyleSheet.absoluteFill, {
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
          top: '60%',
        }]}
        pointerEvents="none"
      />
      {/* Left-edge rim highlight */}
      <View
        style={{
          position: 'absolute', top: 2, left: 1, bottom: 2, width: 1,
          backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.6)',
          borderRadius: 1,
        }}
        pointerEvents="none"
      />
      {c}
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[{
        borderRadius: radius, borderWidth: 1, borderColor: resolvedBorder,
        overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18, shadowRadius: 24,
      }, style]} {...props}>
        <View style={{ ...webBlur, backgroundColor: resolvedTint, borderRadius: radius }} />
        <GlassContent>
          <View style={{ position: 'relative' }}>{children}</View>
        </GlassContent>
      </View>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <View style={[{
        borderRadius: radius, borderWidth: 1, borderColor: resolvedBorder,
        elevation: 10,
        shadowColor: isDark ? '#000' : '#C07820',
      }, style]} {...props}>
        {/* Blur layer */}
        <BlurView
          intensity={resolvedIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius }}
          experimentalBlurMethod="dimezisBlurView"
        />
        {/* Color tint */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: resolvedTint, borderRadius: radius,
        }} />
        {/* Glass highlights */}
        <GlassContent>
          <View style={{ borderRadius: radius, overflow: 'hidden' }}>{children}</View>
        </GlassContent>
      </View>
    );
  }

  // iOS
  return (
    <View style={[{
      borderRadius: radius, borderWidth: 1, borderColor: resolvedBorder, overflow: 'hidden',
      shadowColor: isDark ? '#000' : '#C07820',
      shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 24,
      elevation: 10,
    }, style]} {...props}>
      <BlurView
        intensity={resolvedIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: resolvedTint }} />
      <GlassContent>
        <View style={{ position: 'relative' }}>{children}</View>
      </GlassContent>
    </View>
  );
}

const webBlur = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
};
