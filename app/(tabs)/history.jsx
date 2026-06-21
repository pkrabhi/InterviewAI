import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const MOCK_HISTORY = [
  { id: '1', role: 'Java Backend', type: 'Technical', score: 82, date: 'Jun 18, 2026', duration: '14 min' },
  { id: '2', role: 'HR Round',     type: 'HR',        score: 75, date: 'Jun 15, 2026', duration: '11 min' },
  { id: '3', role: 'Full Stack',   type: 'Mixed',     score: 68, date: 'Jun 10, 2026', duration: '18 min' },
];

function ScoreBadge({ score }) {
  const color = score >= 80 ? COLORS.success : score >= 60 ? COLORS.accent : COLORS.danger;
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{score}</Text>
    </View>
  );
}

function SessionCard({ item }) {
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.roleChip}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
        <Text style={styles.meta}>{item.type} · {item.date}</Text>
        <Text style={styles.duration}>⏱ {item.duration}</Text>
      </View>
      <ScoreBadge score={item.score} />
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Past Interviews</Text>
        <Text style={styles.subtitle}>{MOCK_HISTORY.length} sessions</Text>
      </View>

      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SessionCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No interviews yet.</Text>
            <Text style={styles.emptySubtext}>Start one from the Home tab.</Text>
          </View>
        }
      />
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
  },
  title: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLeft: {
    gap: SPACING.xs,
  },
  roleChip: {
    backgroundColor: COLORS.primary + '33',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.primaryLight,
  },
  meta: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  duration: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  badge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    minWidth: 48,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  empty: {
    paddingTop: SPACING.xxl * 2,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
});
