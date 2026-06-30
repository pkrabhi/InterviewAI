import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ScreenBackground({ children, style, variant = 'default' }) {
  const { width, height } = useWindowDimensions();

  // Orb sizes scale with screen — large orbs give BlurView vivid colour to blur
  const orbL  = width * 1.0;   // large orb
  const orbM  = width * 0.75;  // medium orb
  const orbS  = width * 0.60;  // small orb

  return (
    <View style={[styles.root, style]}>
      {/* ── Background gradient orbs ────────────────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">

        {/* Top-left indigo glow */}
        <View style={[styles.orb, {
          width: orbL, height: orbL, borderRadius: orbL / 2,
          top: -orbL * 0.45, left: -orbL * 0.2,
        }]}>
          <LinearGradient colors={['#6366F160', '#4F46E530', 'transparent']} style={styles.fill} />
        </View>

        {/* Bottom-right amber glow */}
        <View style={[styles.orb, {
          width: orbM, height: orbM, borderRadius: orbM / 2,
          bottom: -orbM * 0.35, right: -orbM * 0.25,
        }]}>
          <LinearGradient colors={['#F59E0B45', '#EF444420', 'transparent']} style={styles.fill} />
        </View>

        {/* Mid-left purple tint */}
        <View style={[styles.orb, {
          width: orbS, height: orbS, borderRadius: orbS / 2,
          top: height * 0.35, left: -orbS * 0.45,
        }]}>
          <LinearGradient colors={['#818CF838', 'transparent']} style={styles.fill} />
        </View>

        {/* Center subtle indigo for interview screens */}
        <View style={[styles.orb, {
          width: orbM * 0.8, height: orbM * 0.8, borderRadius: (orbM * 0.8) / 2,
          top: height * 0.55, left: width * 0.3,
        }]}>
          <LinearGradient colors={['#6366F120', 'transparent']} style={styles.fill} />
        </View>

        {/* Auth variant — extra large hero orb */}
        {variant === 'auth' && (
          <View style={[styles.orb, {
            width: width * 1.3, height: width * 1.3, borderRadius: (width * 1.3) / 2,
            top: -width * 0.6, left: -width * 0.15,
          }]}>
            <LinearGradient colors={['#6366F155', '#818CF830', 'transparent']} style={styles.fill} />
          </View>
        )}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  orb: {
    position: 'absolute',
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    borderRadius: 9999,
  },
});
