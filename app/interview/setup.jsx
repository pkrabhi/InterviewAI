import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { ROLES, LEVELS, INTERVIEW_TYPES } from '../../constants/roles';

// Step indicator at the top
function StepBar({ current, total }) {
  return (
    <View style={styles.stepBar}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            {
              backgroundColor: i < current ? COLORS.primary : COLORS.border,
              flex: i < current ? 1.2 : 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Step 1: Pick a role ─────────────────────────────────────────────────────
function StepRole({ selected, onSelect }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What role?</Text>
      <Text style={styles.stepSubtitle}>Pick the position you're preparing for.</Text>

      <View style={styles.roleGrid}>
        {ROLES.map((role) => {
          const active = selected === role.id;
          return (
            <TouchableOpacity
              key={role.id}
              style={[styles.roleCard, active && styles.roleCardActive]}
              onPress={() => onSelect(role.id)}
            >
              <Text style={styles.roleEmoji}>{role.emoji}</Text>
              <Text style={[styles.roleLabel, active && { color: COLORS.primary }]}>
                {role.label}
              </Text>
              <View style={styles.topicsRow}>
                {role.topics.map((t) => (
                  <View key={t} style={styles.topicChip}>
                    <Text style={styles.topicText}>{t}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Step 2: Level + Type ─────────────────────────────────────────────────────
function StepLevelType({ level, type, onLevel, onType }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Experience & Format</Text>
      <Text style={styles.stepSubtitle}>Tailors the difficulty and question style.</Text>

      <Text style={styles.subheading}>Experience Level</Text>
      <View style={styles.levelsRow}>
        {LEVELS.map((l) => {
          const active = level === l.id;
          return (
            <TouchableOpacity
              key={l.id}
              style={[styles.levelCard, active && styles.levelCardActive]}
              onPress={() => onLevel(l.id)}
            >
              <Text style={[styles.levelLabel, active && { color: COLORS.primary }]}>
                {l.label}
              </Text>
              <Text style={styles.levelSub}>{l.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.subheading, { marginTop: SPACING.lg }]}>Interview Type</Text>
      <View style={styles.typeGrid}>
        {INTERVIEW_TYPES.map((t) => {
          const active = type === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeCard, active && styles.typeCardActive]}
              onPress={() => onType(t.id)}
            >
              <Text style={styles.typeEmoji}>{t.emoji}</Text>
              <Text style={[styles.typeLabel, active && { color: COLORS.primary }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Step 3: JD paste ────────────────────────────────────────────────────────
function StepJD({ jd, onJD }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Job Description</Text>
      <Text style={styles.stepSubtitle}>
        Optional — paste the JD so the AI tailors the interview to the exact role.
      </Text>

      <TextInput
        style={styles.jdInput}
        placeholder="Paste the job description here..."
        placeholderTextColor={COLORS.textMuted}
        multiline
        numberOfLines={10}
        value={jd}
        onChangeText={onJD}
        textAlignVertical="top"
      />
    </View>
  );
}

// ─── Main Setup Screen ────────────────────────────────────────────────────────
export default function SetupScreen() {
  const [step, setStep]   = useState(1);
  const [role, setRole]   = useState(null);
  const [level, setLevel] = useState(null);
  const [type, setType]   = useState(null);
  const [jd, setJD]       = useState('');

  function canProceed() {
    if (step === 1) return !!role;
    if (step === 2) return !!level && !!type;
    return true;
  }

  function handleNext() {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Phase 5 will send these to the backend and navigate to session
      router.push('/interview/session');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        {step > 1 ? (
          <TouchableOpacity onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtn}>‹ Back</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>✕</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.stepCounter}>Step {step} of 3</Text>
        <View style={{ width: 48 }} />
      </View>

      <StepBar current={step} total={3} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 1 && <StepRole selected={role} onSelect={setRole} />}
        {step === 2 && <StepLevelType level={level} type={type} onLevel={setLevel} onType={setType} />}
        {step === 3 && <StepJD jd={jd} onJD={setJD} />}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        {step === 3 && (
          <TouchableOpacity style={styles.skipBtn} onPress={handleNext}>
            <Text style={styles.skipText}>Skip & Start</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextBtnText}>
            {step === 3 ? (jd.length > 10 ? 'Start with JD 🚀' : 'Start Interview 🚀') : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    width: 48,
  },
  stepCounter: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
  },
  stepBar: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    height: 4,
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  stepContent: {
    gap: SPACING.md,
  },
  stepTitle: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  stepSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  subheading: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Role grid
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  roleCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  roleEmoji: {
    fontSize: 28,
  },
  roleLabel: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  topicChip: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  topicText: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  // Levels
  levelsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  levelCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 4,
  },
  levelCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  levelLabel: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  levelSub: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  // Types
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  typeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  typeEmoji: {
    fontSize: 20,
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  // JD
  jdInput: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 14,
    minHeight: 200,
    lineHeight: 22,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
  },
  nextBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  nextBtnText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: '#FFFFFF',
  },
});
