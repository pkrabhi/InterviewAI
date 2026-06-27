import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

export default function ScoreGauge({ score, size = 140, label = 'Overall Score' }) {
  const getColor = () => {
    if (score >= 75) return COLORS.success;
    if (score >= 50) return COLORS.accent;
    return COLORS.danger;
  };

  const color = getColor();
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={[styles.ring, { borderColor: COLORS.border, borderRadius: size / 2 }]} />
        <View
          style={[
            styles.ring,
            {
              borderColor: color,
              borderRadius: size / 2,
              borderTopColor: score > 25  ? color : 'transparent',
              borderRightColor: score > 50 ? color : 'transparent',
              borderBottomColor: score > 75 ? color : 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
        <View style={styles.inner}>
          <Text style={[styles.score, { color }]}>{score}</Text>
          <Text style={styles.outOf}>/100</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderWidth: 8,
    borderColor: COLORS.border,
    borderRadius: 999,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  outOf: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
