import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const QUICK_ROLES = [
  { id: 'java',     label: 'Java ☕' },
  { id: 'fullstack',label: 'Full Stack 🧩' },
  { id: 'hr',       label: 'HR 🤝' },
];

const MOCK_RECENT = [
  { id: 1, role: 'Java Backend', type: 'Technical', score: 82, date: 'Jun 18' },
  { id: 2, role: 'HR Round',     type: 'HR',        score: 75, date: 'Jun 15' },
];

function ScoreBadge({ score }) {
  const color = score >= 80 ? COLORS.success : score >= 60 ? COLORS.accent : COLORS.danger;
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{score}</Text>
    </View>
  );
}

export default function HomeScreen() {
  function startInterview() {
    router.push('/interview/setup');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, Abhijeet 👋</Text>
          <Text style={styles.subtitle}>Ready for your next interview?</Text>
        </View>

        {/* Main CTA */}
        <TouchableOpacity style={styles.ctaCard} onPress={startInterview} activeOpacity={0.85}>
          <Text style={styles.ctaEmoji}>🎯</Text>
          <Text style={styles.ctaTitle}>Start New Interview</Text>
          <Text style={styles.ctaSubtitle}>AI-powered · Dynamic follow-ups · Instant report</Text>
        </TouchableOpacity>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>79</Text>
            <Text style={styles.statLabel}>Avg. Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>82</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
        </View>

        {/* Quick-start role chips */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.chipsRow}>
          {QUICK_ROLES.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.chip}
              onPress={startInterview}
            >
              <Text style={styles.chipText}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent sessions */}
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {MOCK_RECENT.map((s) => (
          <View key={s.id} style={styles.sessionRow}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionRole}>{s.role}</Text>
              <Text style={styles.sessionMeta}>{s.type} · {s.date}</Text>
            </View>
            <ScoreBadge score={s.score} />
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  header: {
    gap: SPACING.xs,
  },
  greeting: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  ctaCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaEmoji: {
    fontSize: 48,
  },
  ctaTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  ctaSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.primaryLight,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    marginBottom: -SPACING.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  sessionRow: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sessionInfo: {
    gap: SPACING.xs,
  },
  sessionRole: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  sessionMeta: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  badge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
});
