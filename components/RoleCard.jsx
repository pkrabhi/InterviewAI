import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function RoleCard({ role, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{role.emoji}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{role.label}</Text>
      <View style={styles.topics}>
        {role.topics.map((topic) => (
          <View key={topic} style={[styles.chip, selected && styles.chipSelected]}>
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{topic}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.cardLight,
  },
  emoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  labelSelected: {
    color: COLORS.primaryLight,
  },
  topics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: SPACING.xs,
  },
  chip: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  chipSelected: {
    backgroundColor: COLORS.primary + '33',
  },
  chipText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  chipTextSelected: {
    color: COLORS.primaryLight,
  },
});
