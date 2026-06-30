import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { getSessions } from '../../services/interviewService';

const ScoreBadge = ({ score }) => {
  if (!score) return null;
  const color = score >= 75 ? COLORS.success : score >= 50 ? COLORS.accent : COLORS.danger;
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[styles.badgeText, { color }]}>{score}</Text>
    </View>
  );
};

const SessionCard = ({ session, onPress }) => {
  const date = new Date(session.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const statusColor = session.status === 'COMPLETED' ? COLORS.success : COLORS.accent;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        <View style={styles.roleRow}>
          <View style={[styles.rolePill, { backgroundColor: COLORS.primary + '22' }]}>
            <Text style={styles.rolePillText}>{session.role}</Text>
          </View>
          <View style={[styles.rolePill, { backgroundColor: COLORS.cardLight }]}>
            <Text style={styles.rolePillText}>{session.level}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{date}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{session.status}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        {session.status === 'ACTIVE' ? (
          <View style={[styles.badge, { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent + '55' }]}>
            <Text style={[styles.badgeText, { color: COLORS.accent, fontSize: 11 }]}>Resume</Text>
          </View>
        ) : (
          <ScoreBadge score={session.overallScore} />
        )}
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
      </View>
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
    } catch (error) {
      // No sessions yet or not logged in
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Interview History</Text>
      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="history" size={64} color={COLORS.border} />
          <Text style={styles.emptyTitle}>No interviews yet</Text>
          <Text style={styles.emptySubtitle}>Complete your first interview to see it here</Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate('InterviewSetup')}
          >
            <Text style={styles.startBtnText}>Start Interview</Text>
          </TouchableOpacity>
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
                  // Resume active session
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    gap: SPACING.xs,
    flex: 1,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  rolePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  rolePillText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  startBtnText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});
