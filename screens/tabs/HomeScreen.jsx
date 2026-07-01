import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, useWindowDimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import useThemeStore from '../../store/useThemeStore';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import useAuthStore from '../../store/useAuthStore';
import { getSessions } from '../../services/interviewService';
import { ROLES } from '../../constants/roles';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen({ navigation }) {
  const { user }                = useAuthStore();
  const { COLORS }              = useThemeStore();
  const { width }               = useWindowDimensions();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  const styles = useMemo(() => makeStyles(COLORS, width), [COLORS, width]);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try { const data = await getSessions(); setSessions(data); }
    catch (_) {}
    finally { setLoading(false); }
  };

  const completed = sessions.filter((s) => s.status === 'COMPLETED');
  const avgScore  = completed.length ? Math.round(completed.reduce((s, x) => s + (x.overallScore || 0), 0) / completed.length) : null;
  const bestScore = completed.length ? Math.max(...completed.map((x) => x.overallScore || 0)) : null;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <ScreenBackground>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xxl }}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: SPACING.sm }}>
            <Text style={styles.greeting} numberOfLines={1}>{getGreeting()}, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Ready to practice today?</Text>
          </View>
          <View style={[styles.planBadge, user?.plan === 'PRO' && styles.planBadgePro]}>
            <Text style={[styles.planText, user?.plan === 'PRO' && { color: COLORS.accent }]}>
              {user?.plan === 'PRO' ? '⭐ PRO' : 'FREE'}
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('InterviewSetup')} style={styles.ctaWrapper}>
          <GlassCard
            style={styles.ctaCard}
            intensity={45}
            tint={COLORS.primary + '40'}
            borderColor={COLORS.primary + '80'}
            borderRadius={RADIUS.xl}
          >
            {/* Inner colour gradient so glass picks up rich indigo colour */}
            <LinearGradient
              colors={[COLORS.primary + 'BB', '#7C3AED88', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: RADIUS.xl }}
              pointerEvents="none"
            />
            <View style={styles.ctaGlow} pointerEvents="none" />
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Start New Interview</Text>
              <Text style={styles.ctaSub}>Practice with AI Interviewer Aryan</Text>
            </View>
            <LinearGradient
              colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.12)']}
              style={{ width: Math.round(width * 0.11), height: Math.round(width * 0.11), borderRadius: Math.round(width * 0.055), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }}
            >
              <MaterialCommunityIcons name="arrow-right" size={Math.round(width * 0.065)} color="#fff" />
            </LinearGradient>
          </GlassCard>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: sessions.length || '—', label: 'Total' },
            { value: avgScore ?? '—',        label: 'Avg' },
            { value: bestScore ?? '—',       label: 'Best' },
          ].map((s) => (
            <GlassCard key={s.label} style={styles.statCard} intensity={20}>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Quick Start */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: SPACING.md, paddingRight: SPACING.sm }}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => navigation.navigate('InterviewSetup', { preselectedRole: role })}
              style={{ marginRight: SPACING.sm }}
            >
              <GlassCard style={styles.chip} intensity={16}>
                <Text style={{ fontSize: FONT_SIZE.lg }}>{role.emoji}</Text>
                <Text style={styles.chipLabel} numberOfLines={1}>{role.label}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Sessions */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Recent Sessions</Text>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ margin: SPACING.lg }} />
        ) : sessions.length === 0 ? (
          <GlassCard style={[styles.emptyCard, { marginHorizontal: SPACING.md }]}>
            <MaterialCommunityIcons name="history" size={32} color={COLORS.textMuted} />
            <Text style={[styles.statLabel, { textAlign: 'center' }]}>No interviews yet. Start your first one!</Text>
          </GlassCard>
        ) : (
          sessions.slice(0, 3).map((session) => {
            const scoreColor = session.overallScore >= 75 ? COLORS.success
              : session.overallScore >= 50 ? COLORS.accent : COLORS.danger;
            return (
              <TouchableOpacity
                key={session.id}
                onPress={() => {
                  if (session.status === 'COMPLETED') {
                    navigation.navigate('InterviewReport', { sessionId: session.id, role: session.role, level: session.level });
                  } else {
                    navigation.navigate('InterviewSession', {
                      resumeSessionId: session.id,
                      role: { id: session.role, label: session.role },
                      level: session.level,
                      type: { id: session.interviewType, label: session.interviewType },
                    });
                  }
                }}
                style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.sm }}
              >
                <GlassCard style={styles.sessionCard} intensity={18}>
                  <View style={{ flex: 1, gap: 4, marginRight: SPACING.sm }}>
                    <Text style={styles.sessionRole} numberOfLines={1}>
                      {session.role}  •  {session.level}
                    </Text>
                    <Text style={styles.sessionDate}>
                      {new Date(session.createdAt).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                  {session.overallScore ? (
                    <Text style={[styles.sessionScore, { color: scoreColor }]}>{session.overallScore}</Text>
                  ) : (
                    <Text style={[styles.sessionActive, { color: COLORS.accent }]}>ACTIVE</Text>
                  )}
                </GlassCard>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (COLORS, width) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting:    { fontSize: FONT_SIZE.xl, color: COLORS.text, fontWeight: 'bold', letterSpacing: -0.3 },
  subGreeting: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginTop: 2 },
  planBadge: {
    paddingHorizontal: SPACING.sm, paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  planBadgePro: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent + '55' },
  planText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.textMuted },

  ctaWrapper: {
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    elevation: 14,
  },
  ctaCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.lg, paddingVertical: SPACING.xl,
    borderRadius: RADIUS.xl, minHeight: 120,
  },
  ctaGlow: {
    position: 'absolute', top: -40, left: '30%',
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  ctaTitle: { color: '#fff', fontSize: FONT_SIZE.xl, fontWeight: 'bold', marginBottom: 4, letterSpacing: -0.3 },
  ctaSub:   { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZE.sm },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard:  { flex: 1, padding: SPACING.sm, alignItems: 'center', gap: 2 },
  statValue: { color: COLORS.text, fontSize: FONT_SIZE.xl, fontWeight: 'bold' },
  statLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },

  sectionTitle: {
    color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '700',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm, letterSpacing: -0.2,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  chipLabel: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '500', maxWidth: width * 0.22 },

  emptyCard: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm },

  sessionCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, borderRadius: RADIUS.lg,
  },
  sessionRole:   { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '500', textTransform: 'capitalize' },
  sessionDate:   { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  sessionScore:  { fontSize: FONT_SIZE.xl, fontWeight: 'bold' },
  sessionActive: { fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 0.5 },
});
