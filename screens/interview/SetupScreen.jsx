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
import { ROLES, LEVELS, INTERVIEW_TYPES } from '../../constants/roles';
import RoleCard from '../../components/RoleCard';
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
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedType, setSelectedType]   = useState(null);
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
      jdText: jdText.trim(),
      resumeSummary: resumeSummary.trim(),
    });
  };

  // ── Step 1: Role ───────────────────────────────────────────────────
  const renderStep1 = () => (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs, paddingBottom: SPACING.md }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepTitle}>What role are you interviewing for?</Text>
        <View style={styles.roleGrid}>
          {ROLES.reduce((rows, item, i) => {
            if (i % 2 === 0) rows.push([]);
            rows[rows.length - 1].push(item);
            return rows;
          }, []).map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row' }}>
              {row.map((item) => (
                <RoleCard
                  key={item.id}
                  role={item}
                  selected={selectedRole?.id === item.id}
                  onPress={() => setSelectedRole(item)}
                />
              ))}
              {row.length === 1 && <View style={{ flex: 1, margin: SPACING.xs }} />}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Next button — sits below ScrollView, always visible */}
      <GlassCard
        style={{ borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md }}
        intensity={20}
        borderColor={COLORS.glassBorder}
      >
        <TouchableOpacity
          onPress={() => selectedRole && setStep(2)}
          disabled={!selectedRole}
          style={{ borderRadius: RADIUS.full, overflow: 'hidden', opacity: !selectedRole ? 0.4 : 1 }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.nextBtnGradient}
          >
            <Text style={styles.nextBtnText}>
              {selectedRole ? `Next  →  ${selectedRole.label}` : 'Select a role to continue'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>
    </>
  );

  // ── Step 2: Level + Type ───────────────────────────────────────────
  const renderStep2 = () => (
    <>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs, paddingBottom: SPACING.md }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepTitle}>Your experience level?</Text>
        <View style={styles.levelRow}>
          {LEVELS.map((level) => {
            const active = selectedLevel === level;
            return (
              <TouchableOpacity key={level} onPress={() => setSelectedLevel(level)} style={{ flex: 1 }}>
                <GlassCard
                  style={[styles.levelCard, active && { borderColor: COLORS.primary, borderWidth: 2 }]}
                  intensity={active ? 40 : 22}
                  tint={active ? COLORS.primary + '20' : undefined}
                  borderColor={active ? COLORS.primary : undefined}
                >
                  <Text style={[styles.levelText, active && { color: COLORS.primaryLight, fontWeight: '700' }]}>
                    {level}
                  </Text>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.stepTitle, { marginTop: SPACING.lg }]}>Interview type?</Text>
        <View style={styles.typeGrid}>
          {INTERVIEW_TYPES.map((type) => {
            const active = selectedType?.id === type.id;
            return (
              <TouchableOpacity key={type.id} onPress={() => setSelectedType(type)} style={styles.typeWrapper}>
                <GlassCard
                  style={[styles.typeCard, active && { borderColor: COLORS.primary, borderWidth: 2 }]}
                  intensity={active ? 40 : 22}
                  tint={active ? COLORS.primary + '20' : undefined}
                  borderColor={active ? COLORS.primary : undefined}
                >
                  <Text style={styles.typeEmoji}>{type.emoji}</Text>
                  <Text style={[styles.typeLabel, active && { color: COLORS.primaryLight, fontWeight: '700' }]}>
                    {type.label}
                  </Text>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <GlassCard
        style={{ borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        intensity={20}
        borderColor={COLORS.glassBorder}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.textMuted} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!selectedLevel || !selectedType}
          onPress={() => selectedLevel && selectedType && setStep(3)}
          style={{ borderRadius: RADIUS.md, overflow: 'hidden', opacity: (!selectedLevel || !selectedType) ? 0.45 : 1 }}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGradient}>
            <Text style={styles.nextBtnText}>Next</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>
    </>
  );

  // ── Step 3: Resume upload ──────────────────────────────────────────
  const renderStep3 = () => (
    <>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs, paddingBottom: SPACING.md }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepTitle}>Upload your Resume (optional)</Text>
        <Text style={styles.stepSub}>AI will tailor every question to your actual skills, projects, and experience.</Text>

        <TouchableOpacity onPress={pickResume} disabled={uploading} activeOpacity={0.8}>
          <GlassCard
            style={[styles.uploadBox, resumeFile && { borderColor: COLORS.success }]}
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
                <MaterialCommunityIcons name="file-check" size={40} color={COLORS.success} />
                <Text style={[styles.uploadTitle, { color: COLORS.success }]} numberOfLines={1}>{resumeFile.name}</Text>
                <Text style={styles.uploadHint}>Tap to change</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="file-upload-outline" size={40} color={COLORS.primary} />
                <Text style={styles.uploadTitle}>Tap to upload PDF</Text>
                <Text style={styles.uploadHint}>Max 5MB • PDF only</Text>
              </>
            )}
          </GlassCard>
        </TouchableOpacity>

        {resumeSummary ? (
          <GlassCard style={styles.summaryBox} intensity={20} tint={COLORS.primary + '15'} borderColor={COLORS.primary + '44'}>
            <View style={styles.summaryHeader}>
              <MaterialCommunityIcons name="brain" size={16} color={COLORS.primary} />
              <Text style={[styles.summaryTitle, { color: COLORS.primary }]}>AI detected from your resume</Text>
            </View>
            <Text style={[styles.stepSub, { marginBottom: 0 }]}>{resumeSummary}</Text>
          </GlassCard>
        ) : null}
      </ScrollView>

      <GlassCard
        style={{ borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        intensity={20}
        borderColor={COLORS.glassBorder}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.textMuted} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.startBtns}>
          <TouchableOpacity style={styles.skipBtn} onPress={() => setStep(4)}>
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={uploading}
            onPress={() => setStep(4)}
            style={{ borderRadius: RADIUS.md, overflow: 'hidden', opacity: uploading ? 0.45 : 1 }}
          >
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGradient}>
              <Text style={styles.nextBtnText}>Next</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </>
  );

  // ── Step 4: JD paste ───────────────────────────────────────────────
  const renderStep4 = () => (
    <>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs, paddingBottom: SPACING.md }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepTitle}>Paste a Job Description (optional)</Text>
        <Text style={styles.stepSub}>AI will tailor every question to the specific JD. Great for company-specific prep.</Text>
        <GlassCard style={styles.jdCard} intensity={22}>
          <TextInput
            style={[styles.jdInput, { color: COLORS.text }]}
            multiline
            numberOfLines={8}
            placeholder="Paste the job description here..."
            placeholderTextColor={COLORS.textMuted}
            value={jdText}
            onChangeText={setJdText}
            textAlignVertical="top"
          />
        </GlassCard>
      </ScrollView>

      <GlassCard
        style={{ borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        intensity={20}
        borderColor={COLORS.glassBorder}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(3)}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.textMuted} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.startBtns}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleStart}>
            <Text style={styles.skipBtnText}>Skip & Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleStart}
            style={{ borderRadius: RADIUS.md, overflow: 'hidden' }}
          >
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGradient}>
              <Text style={styles.nextBtnText}>Start Interview</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </GlassCard>
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
    paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: COLORS.inputBg, borderWidth: 1.5, borderColor: COLORS.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { color: COLORS.textMuted, fontWeight: 'bold', fontSize: 13 },
  stepLine: { width: 36, height: 1.5, backgroundColor: COLORS.glassBorder, marginHorizontal: SPACING.xs },

  stepContent: { flex: 1, paddingHorizontal: SPACING.lg },
  stepTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  stepSub: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginBottom: SPACING.md, lineHeight: 20 },

  roleGrid: { marginBottom: SPACING.lg, flexDirection: 'column' },

  levelRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  levelCard: { padding: SPACING.md, alignItems: 'center' },
  levelText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONT_SIZE.sm },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  typeWrapper: { width: '47%' },
  typeCard: { padding: SPACING.md, alignItems: 'center', gap: SPACING.xs },
  typeEmoji: { fontSize: 24 },
  typeLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '600' },

  uploadBox: {
    padding: SPACING.xl, alignItems: 'center', gap: SPACING.md,
    marginBottom: SPACING.md, minHeight: 140, justifyContent: 'center',
  },
  uploadTitle: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '600' },
  uploadHint: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },

  summaryBox: { padding: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.md },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  summaryTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600' },

  jdCard: { marginBottom: SPACING.lg },
  jdInput: { fontSize: FONT_SIZE.sm, minHeight: 180, padding: SPACING.md },

  navRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: SPACING.lg, marginBottom: SPACING.xl,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, padding: SPACING.sm },
  backBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },

  nextBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnGradient: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  nextBtnText: { color: '#fff', fontSize: FONT_SIZE.sm, fontWeight: '700' },

  startBtns: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  skipBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  skipBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
});
