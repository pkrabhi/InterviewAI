import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { getSessions } from '../../services/interviewService';

const ScoreBadge = ({ score }) => {
  if (!score) return null;
  const color = score >= 75 ? COLORS.success : score >= 50 ? COLORS.accent : COLORS.danger;
  return (
    <View style={[styles.scoreBadge, { borderColor: color + '55', backgroundColor: color + '18' }]}>
      <Text style={[styles.scoreBadgeText, { color }]}>{score}</Text>
    </View>
  );
};

const SessionCard = ({ session, onPress }) => {
  const date = new Date(session.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const isActive = session.status === 'ACTIVE';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassCard style={styles.card} intensity={18}>
        <View style={styles.cardLeft}>
          <View style={styles.roleRow}>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{session.role}</Text>
            </View>
            <View style={[styles.rolePill, styles.levelPill]}>
              <Text style={styles.rolePillText}>{session.level}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>{date}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: isActive ? COLORS.accent : COLORS.success }]} />
            <Text style={[styles.statusText, { color: isActive ? COLORS.accent : COLORS.success }]}>
              {session.status}
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          {isActive ? (
            <View style={styles.resumeBadge}>
              <MaterialCommunityIcons name="play-circle" size={14} color={COLORS.accent} />
              <Text style={styles.resumeBadgeText}>Resume</Text>
            </View>
          ) : (
            <ScoreBadge score={session.overallScore} />
          )}
          <MaterialCommunityIcons name="chevron-right" size={18} color="rgba(255,255,255,0.25)" />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

export default function HistoryScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchSessions();
    }, [])
  );

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <Text style={styles.heading}>Interview History</Text>
      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <GlassCard style={styles.emptyCard} intensity={18}>
            <MaterialCommunityIcons name="history" size={56} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>No interviews yet</Text>
            <Text style={styles.emptySubtitle}>Complete your first interview to see it here</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('InterviewSetup')}
              style={styles.startBtnWrapper}
            >
              <LinearGradient
                colors={['#6366F1', '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startBtn}
              >
                <Text style={styles.startBtnText}>Start Interview</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onPress={() => {
                if (item.status === 'COMPLETED') {
                  navigation.navigate('InterviewReport', { sessionId: item.id });
                } else {
                  navigation.navigate('InterviewSession', {
                    resumeSessionId: item.id,
                    role: { id: item.role, label: item.role },
                    level: item.level,
                    type: { id: item.interviewType, label: item.interviewType },
                  });
                }
              }}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  list: { padding: SPACING.md, gap: SPACING.sm },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  cardLeft: { gap: SPACING.xs, flex: 1 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  roleRow: { flexDirection: 'row', gap: SPACING.xs },
  rolePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  levelPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  rolePillText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: RADIUS.full },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  scoreBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  scoreBadgeText: { fontSize: 14, fontWeight: '700' },
  resumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  resumeBadgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  emptyState: { flex: 1, padding: SPACING.md, justifyContent: 'center' },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  emptySubtitle: { color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center' },
  startBtnWrapper: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  startBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
