import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeStore from '../store/useThemeStore';

export default function ScreenBackground({ children, style, variant = 'default' }) {
  const { width, height } = useWindowDimensions();
  const { COLORS, isDark } = useThemeStore();

  const L  = width * 1.1;
  const M  = width * 0.80;
  const S  = width * 0.60;

  return (
    <View style={[styles.root, { backgroundColor: COLORS.bg }, style]}>
      {/* Gradient orbs — vivid so BlurView has rich colour to blur over */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">

        {/* Top-left primary orb */}
        <View style={[styles.orb, { width: L, height: L, borderRadius: L / 2, top: -L * 0.45, left: -L * 0.18 }]}>
          <LinearGradient colors={COLORS.orb1} style={styles.fill} />
        </View>

        {/* Bottom-right secondary orb */}
        <View style={[styles.orb, { width: M, height: M, borderRadius: M / 2, bottom: -M * 0.30, right: -M * 0.20 }]}>
          <LinearGradient colors={COLORS.orb2} style={styles.fill} />
        </View>

        {/* Mid-left accent orb */}
        <View style={[styles.orb, { width: S, height: S, borderRadius: S / 2, top: height * 0.32, left: -S * 0.42 }]}>
          <LinearGradient colors={COLORS.orb3} style={styles.fill} />
        </View>

        {/* Center-bottom fourth orb */}
        <View style={[styles.orb, { width: S * 0.9, height: S * 0.9, borderRadius: S * 0.45, top: height * 0.58, left: width * 0.35 }]}>
          <LinearGradient colors={COLORS.orb4} style={styles.fill} />
        </View>

        {/* Auth variant — hero orb */}
        {variant === 'auth' && (
          <View style={[styles.orb, { width: width * 1.4, height: width * 1.4, borderRadius: width * 0.7, top: -width * 0.65, left: -width * 0.2 }]}>
            <LinearGradient colors={isDark ? ['#6366F165', '#818CF840', 'transparent'] : ['#F59E0B70', '#FBBF2445', 'transparent']} style={styles.fill} />
          </View>
        )}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb:  { position: 'absolute', overflow: 'hidden' },
  fill: { flex: 1, borderRadius: 9999 },
});
