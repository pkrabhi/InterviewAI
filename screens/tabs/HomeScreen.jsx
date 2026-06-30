import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import useAuthStore from '../../store/useAuthStore';
import { getSessions } from '../../services/interviewService';
import { ROLES } from '../../constants/roles';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen({ navigation }) {
  const { user }                = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (e) {
      console.error('getSessions failed:', e?.response?.status, e?.message);
    } finally {
      setLoading(false);
    }
  };

  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length)
    : null;
  const bestScore = completedSessions.length > 0
    ? Math.max(...completedSessions.map((s) => s.overallScore || 0))
    : null;

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <ScreenBackground>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Ready to practice today?</Text>
          </View>
          <View style={[styles.planBadge, user?.plan === 'PRO' && styles.planBadgePro]}>
            <Text style={[styles.planText, user?.plan === 'PRO' && styles.planTextPro]}>
              {user?.plan === 'PRO' ? '⭐ PRO' : 'FREE'}
            </Text>
          </View>
        </View>

        {/* CTA card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('InterviewSetup')}
          style={styles.ctaWrapper}
        >
          <LinearGradient
            colors={['#5B5FEF', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            {/* Subtle inner glow */}
            <View style={styles.ctaGlow} />
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Start New Interview</Text>
              <Text style={styles.ctaSubtitle}>Practice with AI Interviewer Aryan</Text>
            </View>
            <View style={styles.ctaIcon}>
              <MaterialCommunityIcons name="arrow-right-circle" size={44} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: sessions.length || '—', label: 'Total' },
            { value: avgScore ?? '—', label: 'Avg Score' },
            { value: bestScore ?? '—', label: 'Best Score' },
          ].map((stat) => (
            <GlassCard key={stat.label} style={styles.statCard} intensity={18}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Quick start */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => navigation.navigate('InterviewSetup', { preselectedRole: role })}
              style={styles.chipWrapper}
            >
              <GlassCard style={styles.chip} intensity={15}>
                <Text style={styles.chipEmoji}>{role.emoji}</Text>
                <Text style={styles.chipLabel}>{role.label}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent sessions */}
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ margin: SPACING.lg }} />
        ) : sessions.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <MaterialCommunityIcons name="history" size={32} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>No interviews yet. Start your first one!</Text>
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
                    navigation.navigate('InterviewReport', { sessionId: session.id });
                  } else {
                    navigation.navigate('InterviewSession', {
                      resumeSessionId: session.id,
                      role: { id: session.role, label: session.role },
                      level: session.level,
                      type: { id: session.interviewType, label: session.interviewType },
                    });
                  }
                }}
              >
                <GlassCard style={styles.sessionCard} intensity={16}>
                  <View style={styles.sessionLeft}>
                    <Text style={styles.sessionRole}>{session.role} • {session.level}</Text>
                    <Text style={styles.sessionDate}>
                      {new Date(session.createdAt).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                  {session.overallScore ? (
                    <Text style={[styles.sessionScore, { color: scoreColor }]}>
                      {session.overallScore}
                    </Text>
                  ) : (
                    <Text style={styles.sessionActive}>ACTIVE</Text>
                  )}
                </GlassCard>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.text,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  subGreeting: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  planBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  planBadgePro: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  planText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: 'rgba(255,255,255,0.45)' },
  planTextPro: { color: COLORS.accent },
  ctaWrapper: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  ctaGlow: {
    position: 'absolute',
    top: -40,
    left: '30%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  ctaContent: { flex: 1 },
  ctaTitle: {
    color: '#fff',
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  ctaSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: FONT_SIZE.sm },
  ctaIcon: { marginLeft: SPACING.sm },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { color: COLORS.text, fontSize: FONT_SIZE.xl, fontWeight: 'bold' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: FONT_SIZE.xs },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
    letterSpacing: -0.2,
  },
  chipsScroll: { paddingLeft: SPACING.md, marginBottom: SPACING.md },
  chipWrapper: { marginRight: SPACING.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  chipEmoji: { fontSize: 16 },
  chipLabel: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  emptyCard: {
    padding: SPACING.xl,
    marginHorizontal: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center' },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  sessionLeft: { gap: 4 },
  sessionRole: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  sessionDate: { color: 'rgba(255,255,255,0.35)', fontSize: FONT_SIZE.xs },
  sessionScore: { fontSize: FONT_SIZE.xl, fontWeight: 'bold' },
  sessionActive: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
});
