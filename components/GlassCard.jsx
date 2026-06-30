import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export default function GlassCard({
  children,
  style,
  intensity = 22,
  tint = 'rgba(15, 23, 41, 0.52)',
  borderColor = 'rgba(255, 255, 255, 0.10)',
  ...props
}) {
  return (
    <View style={[styles.container, { borderColor }, style]} {...props}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.webFallback]} />
      )}
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
