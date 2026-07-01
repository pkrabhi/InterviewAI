import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS } from '../../constants/theme';
import useThemeStore from '../../store/useThemeStore';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import ScoreGauge from '../../components/ScoreGauge';
import { getReport } from '../../services/reportService';

// Animated score bar
function ScoreBar({ label, score, COLORS }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: score,
      duration: 900,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const color = score >= 75 ? COLORS.success : score >= 50 ? COLORS.accent : COLORS.danger;
  const widthPct = widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.barRow}>
      <Text style={[styles.barLabel, { color: COLORS.textMuted }]}>{label}</Text>
      <View style={[styles.barBg, { backgroundColor: COLORS.border }]}>
        <Animated.View style={[styles.barFill, { width: widthPct, backgroundColor: color }]} />
      </View>
      <Text style={[styles.barScore, { color }]}>{score}</Text>
    </View>
  );
}

// Animated overall score counter
function AnimatedScore({ score, COLORS }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(score / 40);
    const interval = setInterval(() => {
      current = Math.min(current + step, score);
      setDisplayed(current);
      if (current >= score) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [score]);

  const color = score >= 75 ? COLORS.success : score >= 50 ? COLORS.accent : COLORS.danger;
  return (
    <Text style={[styles.bigScore, { color }]}>{displayed}</Text>
  );
}

const TagList = ({ items, color, bgColor }) => {
  if (!items || items.length === 0) return (
    <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>None recorded</Text>
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
  const { COLORS } = useThemeStore();
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const retriesRef = useRef(0);
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
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: COLORS.text }]}>Generating your report...</Text>
          <Text style={[styles.loadingSubText, { color: COLORS.textMuted }]}>AI is evaluating your performance</Text>
          {retriesRef.current > 0 && (
            <Text style={[styles.loadingSubText, { color: COLORS.textMuted }]}>Retry {retriesRef.current}/5...</Text>
          )}
        </View>
      </ScreenBackground>
    );
  }

  if (error || !report) {
    return (
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={[styles.loadingText, { color: COLORS.text }]}>Report not ready yet</Text>
          <Text style={[styles.loadingSubText, { color: COLORS.textMuted }]}>The AI may still be processing</Text>
          <TouchableOpacity style={styles.retryBtnWrapper} onPress={() => { retriesRef.current = 0; fetchReport(); }}>
            <LinearGradient colors={['#6366F1', '#818CF8']} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Animated score section */}
        <View style={styles.scoreSection}>
          <ScoreGauge score={report.overallScore} size={160} label="Overall Score" />
          <AnimatedScore score={report.overallScore} COLORS={COLORS} />
          <Text style={[styles.scoreLabel, { color: COLORS.textMuted }]}>out of 100</Text>
        </View>

        <GlassCard style={styles.card} intensity={20}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Performance Breakdown</Text>
          <ScoreBar label="Technical"       score={report.technicalScore}       COLORS={COLORS} />
          <ScoreBar label="Communication"   score={report.communicationScore}   COLORS={COLORS} />
          <ScoreBar label="Problem Solving" score={report.problemSolvingScore}  COLORS={COLORS} />
          <ScoreBar label="Best Practices"  score={report.bestPracticesScore}   COLORS={COLORS} />
        </GlassCard>

        <GlassCard style={styles.card} intensity={20}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="thumb-up" size={18} color={COLORS.success} />
            <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Strengths</Text>
          </View>
          <View style={styles.tagContainer}>
            <TagList items={report.strengths} color={COLORS.success} bgColor={COLORS.success + '22'} />
          </View>
        </GlassCard>

        <GlassCard style={styles.card} intensity={20}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="trending-up" size={18} color={COLORS.accent} />
            <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Areas to Improve</Text>
          </View>
          <View style={styles.tagContainer}>
            <TagList items={report.improvements} color={COLORS.accent} bgColor={COLORS.accent + '22'} />
          </View>
        </GlassCard>

        <GlassCard style={styles.card} intensity={20}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="book-open-variant" size={18} color={COLORS.primaryLight} />
            <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Study These Next</Text>
          </View>
          <View style={styles.tagContainer}>
            <TagList items={report.nextTopics} color={COLORS.primaryLight} bgColor={COLORS.primary + '22'} />
          </View>
        </GlassCard>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.tryAgainBtnWrapper}
            onPress={() => navigation.navigate('InterviewSetup')}
          >
            <LinearGradient colors={['#6366F1', '#818CF8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.tryAgainBtn}>
              <MaterialCommunityIcons name="refresh" size={16} color="#fff" />
              <Text style={styles.tryAgainText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.homeBtn, { backgroundColor: COLORS.inputBg, borderColor: COLORS.glassBorder }]} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={[styles.homeBtnText, { color: COLORS.textMuted }]}>Go Home</Text>
          </TouchableOpacity>
        </View>

        <GlassCard
          style={styles.proNudge}
          tint="rgba(99,102,241,0.12)"
          borderColor="rgba(99,102,241,0.3)"
          intensity={18}
        >
          <Text style={[styles.proNudgeTitle, { color: COLORS.text }]}>Get PDF Report</Text>
          <Text style={[styles.proNudgeSubtitle, { color: COLORS.textMuted }]}>Download & share your performance report</Text>
          <TouchableOpacity style={styles.proBtnWrapper}>
            <LinearGradient colors={['#6366F1', '#818CF8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.proBtn}>
              <Text style={styles.proBtnText}>Upgrade to Pro — ₹299/month</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { fontSize: 18, fontWeight: '600' },
  loadingSubText: { fontSize: 14 },
  retryBtnWrapper: { marginTop: SPACING.md, borderRadius: RADIUS.md, overflow: 'hidden' },
  retryBtn: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  scoreSection: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.xs },
  bigScore: { fontSize: 56, fontWeight: '800', letterSpacing: -2 },
  scoreLabel: { fontSize: 13 },
  card: { padding: SPACING.lg, marginHorizontal: SPACING.md, marginBottom: SPACING.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: SPACING.md },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  barLabel: { fontSize: 13, width: 110 },
  barBg: { flex: 1, height: 8, borderRadius: RADIUS.full, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: RADIUS.full },
  barScore: { fontSize: 13, fontWeight: '600', width: 30, textAlign: 'right' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  tag: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  tagText: { fontSize: 13, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginHorizontal: SPACING.md, marginBottom: SPACING.md },
  tryAgainBtnWrapper: { flex: 1, borderRadius: RADIUS.md, overflow: 'hidden' },
  tryAgainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md },
  tryAgainText: { color: '#fff', fontWeight: '700' },
  homeBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, padding: SPACING.md, borderRadius: RADIUS.md },
  homeBtnText: { fontWeight: '600' },
  proNudge: { padding: SPACING.lg, marginHorizontal: SPACING.md, marginBottom: SPACING.md, alignItems: 'center', gap: SPACING.sm },
  proNudgeTitle: { fontSize: 16, fontWeight: '700' },
  proNudgeSubtitle: { fontSize: 13 },
  proBtnWrapper: { borderRadius: RADIUS.full, overflow: 'hidden', marginTop: SPACING.sm },
  proBtn: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.full },
  proBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
