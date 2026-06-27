import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
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
  const { user }                  = useAuthStore();
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (e) {
      console.error('getSessions failed:', e?.response?.status, e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  };

  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length)
    : 0;
  const bestScore = completedSessions.length > 0
    ? Math.max(...completedSessions.map((s) => s.overallScore || 0))
    : 0;

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>Ready to practice today?</Text>
        </View>
        <View style={[styles.planBadge, { backgroundColor: user?.plan === 'PRO' ? COLORS.accent + '22' : COLORS.card }]}>
          <Text style={[styles.planText, { color: user?.plan === 'PRO' ? COLORS.accent : COLORS.textMuted }]}>
            {user?.plan || 'FREE'}
          </Text>
        </View>
      </View>

      {/* CTA card */}
      <TouchableOpacity
        style={styles.ctaCard}
        onPress={() => navigation.navigate('InterviewSetup')}
        activeOpacity={0.9}
      >
        <View>
          <Text style={styles.ctaTitle}>Start New Interview</Text>
          <Text style={styles.ctaSubtitle}>Practice with AI Interviewer Aryan</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right-circle" size={40} color={COLORS.text} />
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{sessions.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{avgScore || '—'}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{bestScore || '—'}</Text>
          <Text style={styles.statLabel}>Best Score</Text>
        </View>
      </View>

      {/* Quick start roles */}
      <Text style={styles.sectionTitle}>Quick Start</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={styles.chip}
            onPress={() => navigation.navigate('InterviewSetup', { preselectedRole: role })}
          >
            <Text style={styles.chipEmoji}>{role.emoji}</Text>
            <Text style={styles.chipLabel}>{role.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recent sessions */}
      <Text style={styles.sectionTitle}>Recent Sessions</Text>
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ margin: SPACING.lg }} />
      ) : sessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No interviews yet. Start your first one!</Text>
        </View>
      ) : (
        sessions.slice(0, 3).map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionCard}
            onPress={() => {
              if (session.status === 'COMPLETED') {
                navigation.navigate('InterviewReport', { sessionId: session.id });
              } else {
                alert('This session was not completed. Start a new interview.');
              }
            }}
          >
            <View style={styles.sessionLeft}>
              <Text style={styles.sessionRole}>{session.role} • {session.level}</Text>
              <Text style={styles.sessionDate}>
                {new Date(session.createdAt).toLocaleDateString('en-IN')}
              </Text>
            </View>
            {session.overallScore && (
              <Text style={[styles.sessionScore, {
                color: session.overallScore >= 75 ? COLORS.success :
                       session.overallScore >= 50 ? COLORS.accent : COLORS.danger
              }]}>
                {session.overallScore}
              </Text>
            )}
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  planBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  planText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  ctaTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ctaSubtitle: {
    color: COLORS.text,
    opacity: 0.8,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  chipsScroll: {
    paddingLeft: SPACING.md,
    marginBottom: SPACING.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sessionLeft: {
    gap: 4,
  },
  sessionRole: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  sessionDate: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  sessionScore: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
