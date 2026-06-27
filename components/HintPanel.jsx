import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function HintPanel({ hint }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(!open)}>
        <MaterialCommunityIcons name="lightbulb-outline" size={18} color={COLORS.accent} />
        <Text style={styles.triggerText}>{open ? 'Hide Hint' : 'Get Hint'}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.accent}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.panel}>
          <Text style={styles.hintText}>{hint || 'Think about the core concept and a real example from your experience.'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.accent + '55',
  },
  triggerText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  panel: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.accent + '15',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  hintText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
