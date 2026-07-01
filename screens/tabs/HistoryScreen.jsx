import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import useThemeStore from '../../store/useThemeStore';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { getSessions } from '../../services/interviewService';
import { getReport } from '../../services/reportService';
import { downloadReportPdf } from '../../utils/pdfReport';
import { VERTICAL_SWIPE_STYLE } from '../../utils/webTouch';
import { unlockSpeechSynthesis } from '../../utils/webSpeechUnlock';

const ScoreBadge = ({ score, COLORS }) => {
  if (!score) return null;
  const color = score >= 75 ? COLORS.success : score >= 50 ? COLORS.accent : COLORS.danger;
  return (
    <View style={{ paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: color + '55', backgroundColor: color + '18' }}>
      <Text style={{ color, fontSize: FONT_SIZE.sm, fontWeight: '700' }}>{score}</Text>
    </View>
  );
};

const parseJsonField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
};

export default function HistoryScreen({ navigation }) {
  const { COLORS } = useThemeStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);

  useFocusEffect(useCallback(() => { fetchSessions(); }, []));

  const fetchSessions = async () => {
    setLoading(true);
    try { const data = await getSessions(); setSessions(data); }
    catch (_) {}
    finally { setLoading(false); }
  };

  const handleDownloadPdf = async (session) => {
    if (downloadingId) return;
    setDownloadingId(session.id);
    try {
      const data = await getReport(session.id);
      const report = { ...data, qaReview: parseJsonField(data.qaReview) };
      await downloadReportPdf(report, { role: session.role, level: session.level });
    } catch (e) {
      const msg = 'Could not download the report. Please try again.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Download Failed', msg);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <ScreenBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <Text style={styles.heading}>Interview History</Text>

      {sessions.length === 0 ? (
        <View style={{ flex: 1, padding: SPACING.md, justifyContent: 'center' }}>
          <GlassCard style={styles.emptyCard} intensity={18}>
            <MaterialCommunityIcons name="history" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No interviews yet</Text>
            <Text style={styles.emptySubtitle}>Complete your first interview to see it here</Text>
            <TouchableOpacity onPress={() => navigation.navigate('InterviewSetup')} style={{ borderRadius: RADIUS.full, overflow: 'hidden', marginTop: SPACING.sm }}>
              <LinearGradient colors={['#6366F1', '#818CF8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.full }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.sm }}>Start Interview</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: SPACING.md, gap: SPACING.sm }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const date = new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const isActive = item.status === 'ACTIVE';
            return (
              <TouchableOpacity
                onPress={() => {
                  if (item.status === 'COMPLETED') {
                    navigation.navigate('InterviewReport', { sessionId: item.id, role: item.role, level: item.level });
                  } else {
                    unlockSpeechSynthesis();
                    navigation.navigate('InterviewSession', {
                      resumeSessionId: item.id,
                      role: { id: item.role, label: item.role },
                      level: item.level,
                      type: { id: item.interviewType, label: item.interviewType },
                      length: { questions: item.questionCount || 8 },
                    });
                  }
                }}
                activeOpacity={0.8}
                style={VERTICAL_SWIPE_STYLE}
              >
                <GlassCard style={styles.card} intensity={18}>
                  <View style={{ flex: 1, gap: SPACING.xs }}>
                    <View style={{ flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap' }}>
                      <View style={styles.rolePill}><Text style={styles.rolePillText} numberOfLines={1}>{item.role}</Text></View>
                      <View style={[styles.rolePill, { backgroundColor: COLORS.inputBg, borderColor: COLORS.glassBorder }]}>
                        <Text style={[styles.rolePillText, { color: COLORS.textMuted }]}>{item.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.dateText}>{date}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isActive ? COLORS.accent : COLORS.success }} />
                      <Text style={{ color: isActive ? COLORS.accent : COLORS.success, fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'capitalize' }}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                    {isActive ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm, backgroundColor: COLORS.accent + '20', borderWidth: 1, borderColor: COLORS.accent + '40' }}>
                        <MaterialCommunityIcons name="play-circle" size={14} color={COLORS.accent} />
                        <Text style={{ color: COLORS.accent, fontSize: FONT_SIZE.xs, fontWeight: '700' }}>Resume</Text>
                      </View>
                    ) : (
                      <>
                        <ScoreBadge score={item.overallScore} COLORS={COLORS} />
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation?.(); handleDownloadPdf(item); }}
                          disabled={downloadingId === item.id}
                          style={styles.downloadIconBtn}
                        >
                          {downloadingId === item.id ? (
                            <ActivityIndicator size="small" color={COLORS.primaryLight} />
                          ) : (
                            <MaterialCommunityIcons name="file-pdf-box" size={18} color={COLORS.primaryLight} />
                          )}
                        </TouchableOpacity>
                      </>
                    )}
                    <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted + '55'} />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </ScreenBackground>
  );
}

const makeStyles = (COLORS) => StyleSheet.create({
  heading: {
    fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.text,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm, letterSpacing: -0.3,
  },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg },
  rolePill: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full, backgroundColor: COLORS.primary + '25', borderWidth: 1, borderColor: COLORS.primary + '45' },
  rolePillText: { color: COLORS.primaryLight, fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'capitalize' },
  dateText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  emptyCard: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.md, borderRadius: RADIUS.xl },
  emptyTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '600' },
  emptySubtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, textAlign: 'center' },
  downloadIconBtn: {
    width: 30, height: 30, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary + '18', borderWidth: 1, borderColor: COLORS.primary + '35',
  },
});
