import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SPACING, RADIUS } from '../constants/theme';
import useThemeStore from '../store/useThemeStore';
import GlassCard from './GlassCard';

export default function RoleCard({ role, selected, onPress }) {
  const { COLORS } = useThemeStore();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
      <GlassCard
        style={[styles.card, selected && { borderColor: COLORS.primary, borderWidth: 2 }]}
        intensity={selected ? 40 : 28}
        tint={selected ? COLORS.primary + '22' : undefined}
        borderColor={selected ? COLORS.primary : undefined}
      >
        <Text style={styles.emoji}>{role.emoji}</Text>
        <Text style={[styles.label, selected && { color: COLORS.primaryLight }]}>{role.label}</Text>
        <View style={styles.topics}>
          {role.topics.map((topic) => (
            <View key={topic} style={[styles.chip, selected && { backgroundColor: COLORS.primary + '33', borderColor: COLORS.primary + '55' }]}>
              <Text style={[styles.chipText, selected && { color: COLORS.primaryLight }]}>{topic}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const makeStyles = (COLORS) => StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: SPACING.xs,
  },
  card: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  emoji: { fontSize: 28, marginBottom: SPACING.xs },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: SPACING.xs },
  chip: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  chipText: { fontSize: 11, color: COLORS.textMuted },
});
