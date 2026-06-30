import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import ScoreGauge from '../../components/ScoreGauge';
import { getReport } from '../../services/reportService';

const ScoreBar = ({ label, score }) => {
  const color = score >= 75 ? COLORS.success : score >= 50 ? COLORS.accent : COLORS.danger;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.barScore, { color }]}>{score}</Text>
    </View>
  );
};

const TagList = ({ items, color, bgColor }) => {
  if (!items || items.length === 0) return (
    <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>None recorded</Text>
  );
  return items.map((item, i) => (
    <View key={i} style={[styles.tag, { backgroundColor: bgColor }]}>
      <Text style={[styles.tagText, { color }]}>{item}</Text>
    </View>
  ));
};

const parseJsonField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
};

export default function ReportScreen({ route, navigation }) {
  const { sessionId } = route.params || {};
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const retriesRef = useRef(0); // useRef avoids stale closure
  const isMounted  = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchReport();
    return () => { isMounted.current = false; };
  }, []);

  const fetchReport = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getReport(sessionId);
      if (!isMounted.current) return;
      setReport({
        ...data,
        strengths:    parseJsonField(data.strengths),
        improvements: parseJsonField(data.improvements),
        nextTopics:   parseJsonField(data.nextTopics),
      });
    } catch (e) {
      if (!isMounted.current) return;
      // Report may still be generating — retry up to 5 times with increasing delay
      if (retriesRef.current < 5) {
        retriesRef.current += 1;
        setTimeout(fetchReport, 3000 * retriesRef.current);
      } else {
        setError(true);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  if (loading && !report) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Generating your report...</Text>
        <Text style={styles.loadingSubText}>AI is evaluating your performance</Text>
        {retriesRef.current > 0 && (
          <Text style={styles.loadingSubText}>Retry {retriesRef.current}/5...</Text>
        )}
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.danger} />
        <Text style={styles.loadingText}>Report not ready yet</Text>
        <Text style={styles.loadingSubText}>The AI may still be processing</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { retriesRef.current = 0; fetchReport(); }}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.scoreSection}>
        <ScoreGauge score={report.overallScore} size={160} label="Overall Score" />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Performance Breakdown</Text>
        <ScoreBar label="Technical"        score={report.technicalScore} />
        <ScoreBar label="Communication"    score={report.communicationScore} />
        <ScoreBar label="Problem Solving"  score={report.problemSolvingScore} />
        <ScoreBar label="Best Practices"   score={report.bestPracticesScore} />
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="thumb-up" size={18} color={COLORS.success} />
          <Text style={styles.sectionTitle}>Strengths</Text>
        </View>
        <View style={styles.tagContainer}>
          <TagList items={report.strengths} color={COLORS.success} bgColor={COLORS.success + '22'} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="trending-up" size={18} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>Areas to Improve</Text>
        </View>
        <View style={styles.tagContainer}>
          <TagList items={report.improvements} color={COLORS.accent} bgColor={COLORS.accent + '22'} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="book-open-variant" size={18} color={COLORS.primaryLight} />
          <Text style={styles.sectionTitle}>Study These Next</Text>
        </View>
        <View style={styles.tagContainer}>
          <TagList items={report.nextTopics} color={COLORS.primaryLight} bgColor={COLORS.primary + '22'} />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.tryAgainBtn} onPress={() => navigation.navigate('InterviewSetup')}>
          <MaterialCommunityIcons name="refresh" size={18} color={COLORS.text} />
          <Text style={styles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.homeBtnText}>Go Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.proNudge}>
        <Text style={styles.proNudgeTitle}>Get PDF Report</Text>
        <Text style={styles.proNudgeSubtitle}>Download & share your performance report</Text>
        <TouchableOpacity style={styles.proBtn}>
          <Text style={styles.proBtnText}>Upgrade to Pro — ₹299/month</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: {
    flex: 1, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', gap: SPACING.md,
  },
  loadingText: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  loadingSubText: { color: COLORS.textMuted, fontSize: 14 },
  retryBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.md, marginTop: SPACING.md,
  },
  retryBtnText: { color: COLORS.text, fontWeight: '600' },
  scoreSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.border, padding: SPACING.lg,
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginBottom: SPACING.md },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  barLabel: { color: COLORS.textMuted, fontSize: 13, width: 110 },
  barBg: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: RADIUS.full },
  barScore: { fontSize: 13, fontWeight: '600', width: 30, textAlign: 'right' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  tag: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  tagText: { fontSize: 13, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginHorizontal: SPACING.md, marginBottom: SPACING.md },
  tryAgainBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.md,
  },
  tryAgainText: { color: COLORS.text, fontWeight: '600' },
  homeBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, borderRadius: RADIUS.md,
  },
  homeBtnText: { color: COLORS.textMuted, fontWeight: '600' },
  proNudge: {
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.primary + '55',
    padding: SPACING.lg, marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    alignItems: 'center', gap: SPACING.sm,
  },
  proNudgeTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  proNudgeSubtitle: { color: COLORS.textMuted, fontSize: 13 },
  proBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.full, marginTop: SPACING.sm,
  },
  proBtnText: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
});
