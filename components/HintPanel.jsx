import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZE } from '../constants/theme';
import useThemeStore from '../store/useThemeStore';
import GlassCard from './GlassCard';

export default function HintPanel({ hint }) {
  const [open, setOpen] = useState(false);
  const { COLORS } = useThemeStore();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <MaterialCommunityIcons name="lightbulb-outline" size={16} color={COLORS.accent} />
        <Text style={styles.triggerText}>{open ? 'Hide Hint' : 'Get Hint'}</Text>
        <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.accent} />
      </TouchableOpacity>

      {open && (
        <GlassCard
          style={styles.panel}
          intensity={22}
          tint={COLORS.accent + '18'}
          borderColor={COLORS.accent + '44'}
        >
          <View style={styles.panelInner}>
            <View style={styles.accentBar} />
            <Text style={[styles.hintText, { color: COLORS.text }]}>
              {hint || 'Think about the core concept and a real example from your experience.'}
            </Text>
          </View>
        </GlassCard>
      )}
    </View>
  );
}

const makeStyles = (COLORS) => StyleSheet.create({
  container: { marginHorizontal: SPACING.md, marginBottom: SPACING.sm },
  trigger: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.accent + '55',
  },
  triggerText: { color: COLORS.accent, fontSize: FONT_SIZE.xs, fontWeight: '700' },
  panel: { marginTop: SPACING.sm, borderRadius: RADIUS.md },
  panelInner: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md },
  accentBar: { width: 3, borderRadius: 2, backgroundColor: COLORS.accent },
  hintText: { flex: 1, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
