import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeStore from '../store/useThemeStore';

export default function ScreenBackground({ children, style, variant = 'default' }) {
  const { width, height } = useWindowDimensions();
  const { COLORS, isDark } = useThemeStore();

  const XL = width * 1.3;
  const L  = width * 1.0;
  const M  = width * 0.75;
  const S  = width * 0.55;

  return (
    <View style={[styles.root, { backgroundColor: COLORS.bg }, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">

        {/* Top-left primary orb — largest, most saturated */}
        <View style={[styles.orb, { width: XL, height: XL, borderRadius: XL / 2, top: -XL * 0.40, left: -XL * 0.20 }]}>
          <LinearGradient colors={COLORS.orb1} style={styles.fill} />
        </View>

        {/* Bottom-right secondary orb */}
        <View style={[styles.orb, { width: L, height: L, borderRadius: L / 2, bottom: -L * 0.35, right: -L * 0.22 }]}>
          <LinearGradient colors={COLORS.orb2} style={styles.fill} />
        </View>

        {/* Mid-left accent orb */}
        <View style={[styles.orb, { width: M, height: M, borderRadius: M / 2, top: height * 0.28, left: -M * 0.38 }]}>
          <LinearGradient colors={COLORS.orb3} style={styles.fill} />
        </View>

        {/* Center fourth orb */}
        <View style={[styles.orb, { width: S, height: S, borderRadius: S / 2, top: height * 0.52, left: width * 0.33 }]}>
          <LinearGradient colors={COLORS.orb4} style={styles.fill} />
        </View>

        {/* Fifth orb — top-right for richer color behind cards */}
        <View style={[styles.orb, { width: M * 0.8, height: M * 0.8, borderRadius: M * 0.4, top: height * 0.10, right: -M * 0.15 }]}>
          <LinearGradient
            colors={isDark
              ? ['#EC4899AA', '#F43F5E60', 'transparent']
              : ['#F97316CC', '#FBBF2480', 'transparent']}
            style={styles.fill}
          />
        </View>

        {/* Auth variant — extra hero orb */}
        {variant === 'auth' && (
          <View style={[styles.orb, { width: width * 1.5, height: width * 1.5, borderRadius: width * 0.75, top: -width * 0.65, left: -width * 0.25 }]}>
            <LinearGradient
              colors={isDark
                ? ['#6366F1AA', '#818CF870', '#4338CA40', 'transparent']
                : ['#F59E0BDD', '#FBBF24AA', '#FDE68A55', 'transparent']}
              style={styles.fill}
            />
          </View>
        )}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, ...(Platform.OS === 'web' ? { height: '100%' } : {}) },
  orb:  { position: 'absolute', overflow: 'hidden' },
  fill: { flex: 1, borderRadius: 9999 },
});
