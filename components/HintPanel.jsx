import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZE } from '../constants/theme';
import useThemeStore from '../store/useThemeStore';
import GlassCard from './GlassCard';

// Keyword → tip mapping for smart hints
const HINT_RULES = [
  { keys: ['jvm','heap','garbage','memory','gc'],           tip: 'Talk about heap vs stack, GC algorithms (G1, CMS), and how to detect memory leaks with tools like VisualVM.' },
  { keys: ['thread','concurrency','synchronized','lock','race'], tip: 'Mention Thread lifecycle, synchronized vs ReentrantLock, and how to avoid deadlocks and race conditions.' },
  { keys: ['spring','boot','autowired','bean','inject'],    tip: 'Cover auto-configuration, @Bean vs @Component, and how Spring resolves dependencies at startup.' },
  { keys: ['microservice','service','api','rest','http'],   tip: 'Think about service communication (REST/gRPC), circuit breakers (Hystrix/Resilience4j), and service discovery.' },
  { keys: ['database','sql','query','jpa','hibernate','index'], tip: 'Focus on query optimization, N+1 problem in JPA, and when to use indexes vs full table scans.' },
  { keys: ['design','pattern','solid','principle'],         tip: 'Give a concrete example from your project. Name the pattern, explain why you chose it, and what problem it solved.' },
  { keys: ['docker','container','kubernetes','deploy'],     tip: 'Explain containerization benefits, image vs container difference, and how Kubernetes handles scaling and failover.' },
  { keys: ['tell','yourself','background','experience'],    tip: 'Structure as: current role → key achievement → why this company. Keep it under 90 seconds.' },
  { keys: ['challenge','difficult','problem','situation'],  tip: 'Use STAR method: Situation → Task → Action → Result. Quantify the result if possible.' },
  { keys: ['salary','expect','package','compensation'],     tip: 'Research market rate first. Give a range based on your experience and say you\'re open to discuss the full package.' },
  { keys: ['weakness','improve','growth'],                  tip: 'Pick a real but non-critical weakness. Show self-awareness and what you\'re actively doing to improve it.' },
  { keys: ['react','hook','useeffect','usestate','redux'],  tip: 'Explain the hook\'s purpose, dependency array rules, and common pitfalls like stale closures.' },
  { keys: ['algorithm','complexity','big o','sort','search'], tip: 'State the time and space complexity upfront, then walk through your approach step by step.' },
];

function getSmartHint(question) {
  if (!question) return 'Think about a real example from your work. Structure your answer: context → action → result.';
  const lower = question.toLowerCase();
  for (const rule of HINT_RULES) {
    if (rule.keys.some((k) => lower.includes(k))) return rule.tip;
  }
  return 'Use a specific example from your experience. Be concise — 60 to 90 seconds is ideal for each answer.';
}

export default function HintPanel({ question }) {
  const [open, setOpen] = useState(false);
  const { COLORS } = useThemeStore();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const hint = useMemo(() => getSmartHint(question), [question]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <MaterialCommunityIcons name="lightbulb-outline" size={14} color={COLORS.accent} />
        <Text style={styles.triggerText}>{open ? 'Hide Hint' : '💡 Hint'}</Text>
        <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.accent} />
      </TouchableOpacity>

      {open && (
        <GlassCard style={styles.panel} intensity={22} tint={COLORS.accent + '18'} borderColor={COLORS.accent + '44'}>
          <View style={styles.panelInner}>
            <View style={styles.accentBar} />
            <Text style={[styles.hintText, { color: COLORS.text }]}>{hint}</Text>
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
    paddingHorizontal: SPACING.sm, paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.accent + '55',
  },
  triggerText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  panel: { marginTop: SPACING.sm, borderRadius: RADIUS.md },
  panelInner: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md },
  accentBar: { width: 3, borderRadius: 2, backgroundColor: COLORS.accent },
  hintText: { flex: 1, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
