import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

// BlurView inside overflow:hidden is silently dropped on Android.
// iOS gets true blur; Android and web get the tint-only fallback.

export default function GlassCard({
  children,
  style,
  intensity = 22,
  tint = Platform.OS === 'android' ? 'rgba(15, 23, 41, 0.78)' : 'rgba(15, 23, 41, 0.52)',
  borderColor = 'rgba(255, 255, 255, 0.10)',
  ...props
}) {
  return (
    <View style={[styles.container, { borderColor }, style]} {...props}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      ) : Platform.OS === 'web' ? (
        <View style={[StyleSheet.absoluteFill, styles.webFallback]} />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  webFallback: {
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(15, 23, 41, 0.6)',
  },
  inner: {
    position: 'relative',
  },
});
