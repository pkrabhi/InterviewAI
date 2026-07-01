import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import useThemeStore from '../../store/useThemeStore';
import { ROLES, LEVELS, INTERVIEW_TYPES, LENGTHS } from '../../constants/roles';
import GlassCard from '../../components/GlassCard';
import ScreenBackground from '../../components/ScreenBackground';
import api from '../../services/api';

function StepBar({ current, total, COLORS, styles }) {
  return (
    <View style={styles.stepBar}>
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <View key={step} style={styles.stepItem}>
          <View style={[styles.stepDot, current >= step && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
            <Text style={[styles.stepNum, current >= step && { color: '#fff' }]}>{step}</Text>
          </View>
          {step < total && (
            <View style={[styles.stepLine, current > step && { backgroundColor: COLORS.primary }]} />
          )}
        </View>
      ))}
    </View>
  );
}

export default function SetupScreen({ navigation, route }) {
  const preselectedRole = route?.params?.preselectedRole ?? null;

  const [step, setStep]                   = useState(preselectedRole ? 2 : 1);
  const [selectedRole, setSelectedRole]   = useState(preselectedRole);
  const [selectedLevel, setSelectedLevel]   = useState(null);
  const [selectedType, setSelectedType]     = useState(null);
  const [selectedLength, setSelectedLength] = useState(LENGTHS[1]); // default: Standard
  const [jdText, setJdText]               = useState('');
  const [resumeFile, setResumeFile]       = useState(null);
  const [resumeSummary, setResumeSummary] = useState('');
  const [uploading, setUploading]         = useState(false);

  const { COLORS } = useThemeStore();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);

  const TOTAL_STEPS = 4;

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (result.canceled) return;
      const file = result.assets[0];
      setResumeFile(file);
      setResumeSummary('');
      await uploadResume(file);
    } catch (e) {
      Alert.alert('Error', 'Could not pick file: ' + e.message);
    }
  };

  const uploadResume = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', { uri: file.uri, name: file.name, type: 'application/pdf' });
      const response = await api.post('/api/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResumeSummary(response.data.summary);
    } catch (e) {
      Alert.alert('Upload failed', 'Could not process resume. You can skip this step.');
      setResumeFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleStart = () => {
    navigation.navigate('InterviewSession', {
      role: selectedRole,
      level: selectedLevel,
      type: selectedType,
      length: selectedLength,
      jdText: jdText.trim(),
      resumeSummary: resumeSummary.trim(),
    });
  };

  // Shared bottom nav bar
  const NavBar = ({ onBack, onNext, nextLabel = 'Next', nextDisabled = false, extras = null }) => (
    <GlassCard
      style={styles.navBar}
      intensity={20}
      borderColor={COLORS.glassBorder}
    >
      {onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.textMuted} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      ) : <View style={{ width: 60 }} />}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
        {extras}
        <TouchableOpacity
          onPress={onNext}
          disabled={nextDisabled}
          style={{ borderRadius: RADIUS.md, overflow: 'hidden', opacity: nextDisabled ? 0.4 : 1 }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.nextBtnGradient}
          >
            <Text style={styles.nextBtnText}>{nextLabel}</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  // ── Step 1: Role — auto-fit grid, no scroll ────────────────────────
  const rows = ROLES.reduce((acc, item, i) => {
    if (i % 2 === 0) acc.push([]);
    acc[acc.length - 1].push(item);
    return acc;
  }, []);

  const renderStep1 = () => (
    <>
      <View style={styles.contentArea}>
        <Text style={styles.stepTitle}>What role are you interviewing for?</Text>
        {/* Grid — each row gets equal flex height, fills all available space */}
        <View style={{ flex: 1, gap: SPACING.xs }}>
          {rows.map((row, ri) => (
            <View key={ri} style={{ flex: 1, flexDirection: 'row', gap: SPACING.xs }}>
              {row.map((item) => {
                const active = selectedRole?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedRole(item)}
                    activeOpacity={0.8}
                    style={{ flex: 1 }}
                  >
                    <GlassCard
                      style={[styles.roleCard, active && { borderColor: COLORS.primary, borderWidth: 2 }]}
                      intensity={active ? 40 : 24}
                      tint={active ? COLORS.primary + '22' : undefined}
                      borderColor={active ? COLORS.primary : undefined}
                    >
                      <Text style={styles.roleEmoji}>{item.emoji}</Text>
                      <Text style={[styles.roleLabel, active && { color: COLORS.primaryLight }]}>{item.label}</Text>
                      <Text style={[styles.roleSub, active && { color: COLORS.primaryLight + 'BB' }]} numberOfLines={1}>
                        {item.topics?.[0] || ''}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>
      </View>

      <NavBar
        onBack={null}
        onNext={() => selectedRole && setStep(2)}
        nextLabel={selectedRole ? `${selectedRole.label}  →` : 'Select a role'}
        nextDisabled={!selectedRole}
      />
    </>
  );

  // ── Step 2: Level + Type — auto-fit, no scroll ────────────────────
  const typeRows = INTERVIEW_TYPES.reduce((acc, item, i) => {
    if (i % 2 === 0) acc.push([]);
    acc[acc.length - 1].push(item);
    return acc;
  }, []);

  const renderStep2 = () => (
    <>
      <View style={styles.contentArea}>
        <Text style={styles.stepTitle}>Experience & Interview Type</Text>

        {/* Level row */}
        <Text style={styles.sectionLabel}>Your level</Text>
        <View style={{ flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.md }}>
          {LEVELS.map((level) => {
            const active = selectedLevel === level;
            return (
              <TouchableOpacity key={level} onPress={() => setSelectedLevel(level)} style={{ flex: 1 }} activeOpacity={0.8}>
                <GlassCard
                  style={[styles.levelCard, active && { borderColor: COLORS.primary, borderWidth: 2 }]}
                  intensity={active ? 40 : 22}
                  tint={active ? COLORS.primary + '20' : undefined}
                  borderColor={active ? COLORS.primary : undefined}
                >
                  <Text style={[styles.levelText, active && { color: COLORS.primaryLight, fontWeight: '700' }]}>{level}</Text>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Length row */}
        <Text style={styles.sectionLabel}>Interview length</Text>
        <View style={{ flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.md }}>
          {LENGTHS.map((length) => {
            const active = selectedLength?.id === length.id;
            return (
              <TouchableOpacity key={length.id} onPress={() => setSelectedLength(length)} style={{ flex: 1 }} activeOpacity={0.8}>
                <GlassCard
                  style={[styles.levelCard, active && { borderColor: COLORS.primary, borderWidth: 2 }]}
                  intensity={active ? 40 : 22}
                  tint={active ? COLORS.primary + '20' : undefined}
                  borderColor={active ? COLORS.primary : undefined}
                >
                  <Text style={[styles.levelText, active && { color: COLORS.primaryLight, fontWeight: '700' }]}>{length.label}</Text>
                  <Text style={[styles.lengthSub, active && { color: COLORS.primaryLight + 'CC' }]}>{length.sub}</Text>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Type grid — fills remaining space */}
        <Text style={styles.sectionLabel}>Interview type</Text>
        <View style={{ flex: 1, gap: SPACING.xs }}>
          {typeRows.map((row, ri) => (
            <View key={ri} style={{ flex: 1, flexDirection: 'row', gap: SPACING.xs }}>
              {row.map((type) => {
                const active = selectedType?.id === type.id;
                return (
                  <TouchableOpacity key={type.id} onPress={() => setSelectedType(type)} style={{ flex: 1 }} activeOpacity={0.8}>
                    <GlassCard
                      style={[styles.typeCard, active && { borderColor: COLORS.primary, borderWidth: 2 }]}
                      intensity={active ? 40 : 22}
                      tint={active ? COLORS.primary + '20' : undefined}
                      borderColor={active ? COLORS.primary : undefined}
                    >
                      <Text style={styles.typeEmoji}>{type.emoji}</Text>
                      <Text style={[styles.typeLabel, active && { color: COLORS.primaryLight, fontWeight: '700' }]}>{type.label}</Text>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>
      </View>

      <NavBar
        onBack={() => setStep(1)}
        onNext={() => selectedLevel && selectedType && setStep(3)}
        nextDisabled={!selectedLevel || !selectedType}
      />
    </>
  );

  // ── Step 3: Resume — fits without scroll ─────────────────────────
  const renderStep3 = () => (
    <>
      <View style={styles.contentArea}>
        <Text style={styles.stepTitle}>Upload your Resume</Text>
        <Text style={styles.stepSub}>AI tailors questions to your actual skills and experience.</Text>

        <TouchableOpacity onPress={pickResume} disabled={uploading} activeOpacity={0.8} style={{ flex: 1 }}>
          <GlassCard
            style={[styles.uploadBox, resumeFile && { borderColor: COLORS.success, borderWidth: 2 }]}
            intensity={22}
            borderColor={resumeFile ? COLORS.success : COLORS.glassBorder}
          >
            {uploading ? (
              <>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Text style={[styles.uploadHint, { color: COLORS.primary }]}>Analysing your resume...</Text>
              </>
            ) : resumeFile ? (
              <>
                <MaterialCommunityIcons name="file-check" size={44} color={COLORS.success} />
                <Text style={[styles.uploadTitle, { color: COLORS.success }]} numberOfLines={2}>{resumeFile.name}</Text>
                <Text style={styles.uploadHint}>Tap to change</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="file-upload-outline" size={44} color={COLORS.primary} />
                <Text style={styles.uploadTitle}>Tap to upload PDF</Text>
                <Text style={styles.uploadHint}>Max 5MB • PDF only</Text>
              </>
            )}
          </GlassCard>
        </TouchableOpacity>

        {resumeSummary ? (
          <GlassCard style={styles.summaryBox} intensity={20} tint={COLORS.primary + '15'} borderColor={COLORS.primary + '44'}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs }}>
              <MaterialCommunityIcons name="brain" size={15} color={COLORS.primary} />
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>AI detected</Text>
            </View>
            <Text style={styles.stepSub} numberOfLines={3}>{resumeSummary}</Text>
          </GlassCard>
        ) : null}
      </View>

      <NavBar
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        nextDisabled={uploading}
        extras={
          <TouchableOpacity style={styles.skipBtn} onPress={() => setStep(4)}>
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        }
      />
    </>
  );

  // ── Step 4: JD paste ──────────────────────────────────────────────
  const renderStep4 = () => (
    <>
      <View style={styles.contentArea}>
        <Text style={styles.stepTitle}>Paste Job Description</Text>
        <Text style={styles.stepSub}>AI tailors questions to the specific role. Great for company prep.</Text>
        <GlassCard style={{ flex: 1 }} intensity={22}>
          <TextInput
            style={[styles.jdInput, { color: COLORS.text }]}
            multiline
            placeholder="Paste the job description here..."
            placeholderTextColor={COLORS.textMuted}
            value={jdText}
            onChangeText={setJdText}
            textAlignVertical="top"
          />
        </GlassCard>
      </View>

      <NavBar
        onBack={() => setStep(3)}
        onNext={handleStart}
        nextLabel="Start Interview"
        extras={
          <TouchableOpacity style={styles.skipBtn} onPress={handleStart}>
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        }
      />
    </>
  );

  return (
    <ScreenBackground style={{ flex: 1 }}>
      <StepBar current={step} total={TOTAL_STEPS} COLORS={COLORS} styles={styles} />
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </ScreenBackground>
  );
}

const makeStyles = (COLORS) => StyleSheet.create({
  stepBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl,
  },
  stepItem:  { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 30, height: 30, borderRadius: RADIUS.full,
    backgroundColor: COLORS.inputBg, borderWidth: 1.5, borderColor: COLORS.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum:  { color: COLORS.textMuted, fontWeight: 'bold', fontSize: 12 },
  stepLine: { width: 32, height: 1.5, backgroundColor: COLORS.glassBorder, marginHorizontal: SPACING.xs },

  // Content area — fills all space between StepBar and NavBar
  contentArea: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },

  stepTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  stepSub:   { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginBottom: SPACING.sm, lineHeight: 19 },
  sectionLabel: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.textMuted, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Role cards — fill flex rows, no fixed height
  roleCard: {
    flex: 1,
    padding: SPACING.sm,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 3,
  },
  roleEmoji: { fontSize: 22 },
  roleLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  roleSub:   { fontSize: 11, color: COLORS.textMuted },

  // Level cards
  levelCard: { padding: SPACING.sm, alignItems: 'center', justifyContent: 'center' },
  levelText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONT_SIZE.sm },
  lengthSub: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },

  // Type cards
  typeCard:  { flex: 1, padding: SPACING.sm, alignItems: 'center', justifyContent: 'center', gap: 4 },
  typeEmoji: { fontSize: 20 },
  typeLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', textAlign: 'center' },

  // Resume upload
  uploadBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  uploadTitle: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '600', textAlign: 'center' },
  uploadHint:  { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  summaryBox:  { padding: SPACING.sm },

  // JD input
  jdInput: { flex: 1, fontSize: FONT_SIZE.sm, padding: SPACING.md },

  // Nav bar — always at bottom
  navBar: {
    borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, padding: SPACING.xs },
  backBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  nextBtnGradient: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  nextBtnText: { color: '#fff', fontSize: FONT_SIZE.sm, fontWeight: '700' },
  skipBtn:     { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  skipBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
});
