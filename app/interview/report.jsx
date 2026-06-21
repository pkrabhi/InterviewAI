import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

// Placeholder report data — Phase 6 will load this from the backend
const MOCK_REPORT = {
  overallScore:         82,
  technicalScore:       85,
  communicationScore:   78,
  problemSolvingScore:  80,
  bestPracticesScore:   84,
  strengths: [
    'Strong understanding of Spring Boot auto-configuration mechanism',
    'Good use of real-world examples from production experience',
    'Clear explanation of @Conditional annotations',
  ],
  improvements: [
    'Could elaborate more on edge cases in thread safety',
    'Consider discussing performance implications of bean creation order',
    'Add more depth on Spring Security filter chain',
  ],
  nextTopics: [
    'Spring Security',
    'JPA N+1 Problem',
    'Circuit Breaker Pattern',
    'Docker Compose',
  ],
};

// Circular score gauge (simple version using nested Views)
function ScoreGauge({ score }) {
  const color = score >= 80 ? COLORS.success : score >= 60 ? COLORS.accent : COLORS.danger;
  return (
    <View style={styles.gaugeContainer}>
      <View style={[styles.gaugeOuter, { borderColor: color + '33' }]}>
        <View style={[styles.gaugeInner, { borderColor: color }]}>
          <Text style={[styles.gaugeScore, { color }]}>{score}</Text>
          <Text style={styles.gaugeLabel}>/ 100</Text>
        </View>
      </View>
      <Text style={styles.gaugeTitle}>Overall Score</Text>
    </View>
  );
}

// Horizontal bar for category scores
function CategoryBar({ label, score }) {
  const color = score >= 80 ? COLORS.success : score >= 60 ? COLORS.accent : COLORS.danger;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.barScore, { color }]}>{score}</Text>
    </View>
  );
}

export default function ReportScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Interview Report</Text>
        <Text style={styles.subtitle}>Java Backend · Senior · Technical</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Score Gauge */}
        <ScoreGauge score={MOCK_REPORT.overallScore} />

        {/* Category Scores */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score Breakdown</Text>
          <CategoryBar label="Technical"      score={MOCK_REPORT.technicalScore} />
          <CategoryBar label="Communication"  score={MOCK_REPORT.communicationScore} />
          <CategoryBar label="Problem Solving" score={MOCK_REPORT.problemSolvingScore} />
          <CategoryBar label="Best Practices" score={MOCK_REPORT.bestPracticesScore} />
        </View>

        {/* Strengths */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ Strengths</Text>
          {MOCK_REPORT.strengths.map((s, i) => (
            <View key={i} style={[styles.feedbackItem, { borderLeftColor: COLORS.success }]}>
              <Text style={styles.feedbackText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Improvements */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔧 Areas to Improve</Text>
          {MOCK_REPORT.improvements.map((s, i) => (
            <View key={i} style={[styles.feedbackItem, { borderLeftColor: COLORS.accent }]}>
              <Text style={styles.feedbackText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Study next */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Study These Next</Text>
          <View style={styles.topicsWrap}>
            {MOCK_REPORT.nextTopics.map((t) => (
              <View key={t} style={styles.topicChip}>
                <Text style={styles.topicText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pro nudge */}
        <View style={styles.proNudge}>
          <Text style={styles.proNudgeTitle}>Get Your PDF Report 📄</Text>
          <Text style={styles.proNudgeSub}>
            Upgrade to Pro (₹299/mo) to download a full PDF report you can share with mentors.
          </Text>
          <TouchableOpacity style={styles.proBtn}>
            <Text style={styles.proBtnText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Text style={styles.secondaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/interview/setup')}
          >
            <Text style={styles.primaryBtnText}>Try Again 🔄</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  gaugeContainer: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  gaugeOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeScore: {
    fontSize: 40,
    fontFamily: FONTS.bold,
  },
  gaugeLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  gaugeTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  barLabel: {
    width: 110,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.cardLight,
    borderRadius: 3,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  barScore: {
    width: 28,
    fontSize: 13,
    fontFamily: FONTS.bold,
    textAlign: 'right',
  },
  feedbackItem: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.md,
  },
  feedbackText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  topicsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  topicChip: {
    backgroundColor: COLORS.primary + '22',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary + '55',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  topicText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.primaryLight,
  },
  proNudge: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
    padding: SPACING.lg,
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  proNudgeTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  proNudgeSub: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  proBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  proBtnText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#FFFFFF',
  },
});
