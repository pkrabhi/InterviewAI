import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import useThemeStore from '../../store/useThemeStore';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import { VERTICAL_SWIPE_STYLE } from '../../utils/webTouch';
import { unlockSpeechSynthesis } from '../../utils/webSpeechUnlock';
import { getSuggestedTopics, getLearningSessions } from '../../services/learningService';

export default function LearnScreen({ navigation }) {
  const { COLORS } = useThemeStore();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);

  const [topics, setTopics]     = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [question, setQuestion] = useState('');

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const fetchData = async () => {
    setLoading(true);
    try {
      const [topicsData, sessionsData] = await Promise.all([
        getSuggestedTopics().catch(() => []),
        getLearningSessions().catch(() => []),
      ]);
      setTopics(topicsData);
      setSessions(sessionsData);
    } finally {
      setLoading(false);
    }
  };

  const startWithTopic = (topic) => {
    unlockSpeechSynthesis();
    navigation.navigate('LearningSession', { topic });
  };

  const startFreeform = () => {
    if (!question.trim()) return;
    unlockSpeechSynthesis();
    // The typed question doubles as the "topic" — the tutor prompt treats it as something
    // to explain/answer, so the AI's first message directly addresses it.
    navigation.navigate('LearningSession', { topic: question.trim() });
    setQuestion('');
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
        <Text style={styles.heading}>Learn</Text>
        <Text style={styles.subheading}>Ask Aryan anything, by voice or text</Text>

        {/* Ask anything box */}
        <GlassCard style={styles.askCard} intensity={22}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm }}>
            <MaterialCommunityIcons name="school-outline" size={16} color={COLORS.primary} />
            <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '700' }}>Ask anything</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-end' }}>
            <TextInput
              style={[styles.askInput, { color: COLORS.text, borderColor: COLORS.inputBorder, backgroundColor: COLORS.inputBg }]}
              value={question}
              onChangeText={setQuestion}
              placeholder="e.g. Explain JVM garbage collection"
              placeholderTextColor={COLORS.textMuted}
              multiline
            />
            <TouchableOpacity
              onPress={startFreeform}
              disabled={!question.trim()}
              style={[{ borderRadius: RADIUS.full, overflow: 'hidden', opacity: question.trim() ? 1 : 0.4 }, VERTICAL_SWIPE_STYLE]}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.askBtn}>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Suggested topics — pulled from past report weak areas */}
        {topics.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Suggested for you</Text>
            <Text style={styles.sectionSub}>Based on what you struggled with in past interviews</Text>
            <View style={{ paddingHorizontal: SPACING.md, gap: SPACING.sm }}>
              {topics.map((topic, i) => (
                <TouchableOpacity key={i} onPress={() => startWithTopic(topic)} style={VERTICAL_SWIPE_STYLE}>
                  <GlassCard style={styles.topicCard} intensity={18}>
                    <View style={styles.topicIconWrap}>
                      <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={COLORS.accent} />
                    </View>
                    <Text style={[styles.topicText, { color: COLORS.text }]} numberOfLines={2}>{topic}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted + '55'} />
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Past learning sessions */}
        {sessions.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Recent sessions</Text>
            <View style={{ paddingHorizontal: SPACING.md, gap: SPACING.sm }}>
              {sessions.slice(0, 5).map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => { unlockSpeechSynthesis(); navigation.navigate('LearningSession', { resumeSessionId: s.id, topic: s.topic }); }}
                  style={VERTICAL_SWIPE_STYLE}
                >
                  <GlassCard style={styles.topicCard} intensity={16}>
                    <View style={styles.topicIconWrap}>
                      <MaterialCommunityIcons name="chat-processing-outline" size={18} color={COLORS.primaryLight} />
                    </View>
                    <Text style={[styles.topicText, { color: COLORS.textMuted }]} numberOfLines={1}>
                      {s.topic || 'Free-form conversation'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted + '55'} />
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {topics.length === 0 && sessions.length === 0 && (
          <GlassCard style={[styles.emptyCard, { marginHorizontal: SPACING.md, marginTop: SPACING.md }]} intensity={18}>
            <MaterialCommunityIcons name="school-outline" size={40} color={COLORS.textMuted} />
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, textAlign: 'center' }}>
              Complete an interview to get personalised topic suggestions, or just ask Aryan anything above.
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (COLORS) => StyleSheet.create({
  heading: {
    fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.text,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, letterSpacing: -0.3,
  },
  subheading: {
    fontSize: FONT_SIZE.sm, color: COLORS.textMuted,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.md,
  },
  askCard: { marginHorizontal: SPACING.md, marginBottom: SPACING.lg, padding: SPACING.md },
  askInput: {
    flex: 1, borderWidth: 1, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm, maxHeight: 90,
  },
  askBtn: { width: 40, height: 40, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: {
    color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: SPACING.lg, marginBottom: 2, marginTop: SPACING.md,
  },
  sectionSub: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  topicCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg },
  topicIconWrap: {
    width: 34, height: 34, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center',
  },
  topicText: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  emptyCard: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.md, borderRadius: RADIUS.xl },
});
