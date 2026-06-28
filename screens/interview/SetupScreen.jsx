import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { ROLES, LEVELS, INTERVIEW_TYPES } from '../../constants/roles';
import RoleCard from '../../components/RoleCard';
import api from '../../services/api';

function StepBar({ current, total }) {
  return (
    <View style={styles.stepBar}>
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <View key={step} style={styles.stepItem}>
          <View style={[styles.stepDot, current >= step && styles.stepDotActive]}>
            <Text style={[styles.stepNum, current >= step && styles.stepNumActive]}>
              {step}
            </Text>
          </View>
          {step < total && (
            <View style={[styles.stepLine, current > step && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );
}

export default function SetupScreen({ navigation }) {
  const [step, setStep]                   = useState(1);
  const [selectedRole, setSelectedRole]   = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedType, setSelectedType]   = useState(null);
  const [jdText, setJdText]               = useState('');
  const [resumeFile, setResumeFile]       = useState(null);
  const [resumeSummary, setResumeSummary] = useState('');
  const [uploading, setUploading]         = useState(false);

  const TOTAL_STEPS = 4;

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
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
      formData.append('resume', {
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      });
      const response = await api.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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

  // ── Step 1: Role ──────────────────────────────────────────────────
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What role are you interviewing for?</Text>
      <FlatList
        data={ROLES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <RoleCard
            role={item}
            selected={selectedRole?.id === item.id}
            onPress={() => setSelectedRole(item)}
          />
        )}
        style={styles.roleGrid}
      />
      <TouchableOpacity
        style={[styles.nextBtn, !selectedRole && styles.nextBtnDisabled]}
        onPress={() => selectedRole && setStep(2)}
        disabled={!selectedRole}
      >
        <Text style={styles.nextBtnText}>Next</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );

  // ── Step 2: Level + Type ──────────────────────────────────────────
  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Your experience level?</Text>
      <View style={styles.levelRow}>
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.levelBtn, selectedLevel === level && styles.levelBtnActive]}
            onPress={() => setSelectedLevel(level)}
          >
            <Text style={[styles.levelText, selectedLevel === level && styles.levelTextActive]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.stepTitle, { marginTop: SPACING.lg }]}>Interview type?</Text>
      <View style={styles.typeGrid}>
        {INTERVIEW_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.typeCard, selectedType?.id === type.id && styles.typeCardActive]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={styles.typeEmoji}>{type.emoji}</Text>
            <Text style={[styles.typeLabel, selectedType?.id === type.id && styles.typeLabelActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.textMuted} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, (!selectedLevel || !selectedType) && styles.nextBtnDisabled]}
          onPress={() => selectedLevel && selectedType && setStep(3)}
          disabled={!selectedLevel || !selectedType}
        >
          <Text style={styles.nextBtnText}>Next</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ── Step 3: Resume upload ─────────────────────────────────────────
  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Upload your Resume (optional)</Text>
      <Text style={styles.stepSub}>
        AI will tailor every question to your actual skills, projects, and experience.
      </Text>

      <TouchableOpacity
        style={[styles.uploadBox, resumeFile && styles.uploadBoxDone]}
        onPress={pickResume}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.uploadingText}>Analysing your resume...</Text>
          </>
        ) : resumeFile ? (
          <>
            <MaterialCommunityIcons name="file-check" size={40} color={COLORS.success} />
            <Text style={styles.uploadedName} numberOfLines={1}>{resumeFile.name}</Text>
            <Text style={styles.uploadHint}>Tap to change</Text>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="file-upload-outline" size={40} color={COLORS.primary} />
            <Text style={styles.uploadTitle}>Tap to upload PDF</Text>
            <Text style={styles.uploadHint}>Max 5MB • PDF only</Text>
          </>
        )}
      </TouchableOpacity>

      {resumeSummary ? (
        <View style={styles.summaryBox}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="brain" size={16} color={COLORS.primary} />
            <Text style={styles.summaryTitle}>AI detected from your resume</Text>
          </View>
          <Text style={styles.summaryText}>{resumeSummary}</Text>
        </View>
      ) : null}

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.textMuted} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.startBtns}>
          <TouchableOpacity style={styles.skipBtn} onPress={() => setStep(4)}>
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextBtn, uploading && styles.nextBtnDisabled]}
            onPress={() => setStep(4)}
            disabled={uploading}
          >
            <Text style={styles.nextBtnText}>Next</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // ── Step 4: JD paste ──────────────────────────────────────────────
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Paste a Job Description (optional)</Text>
      <Text style={styles.stepSub}>
        AI will tailor every question to the specific JD. Great for company-specific prep.
      </Text>
      <TextInput
        style={styles.jdInput}
        multiline
        numberOfLines={8}
        placeholder="Paste the job description here..."
        placeholderTextColor={COLORS.textMuted}
        value={jdText}
        onChangeText={setJdText}
        textAlignVertical="top"
      />

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(3)}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.textMuted} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.startBtns}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleStart}>
            <Text style={styles.skipBtnText}>Skip & Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextBtn, !jdText.trim() && styles.nextBtnDisabled]}
            onPress={handleStart}
            disabled={!jdText.trim()}
          >
            <Text style={styles.nextBtnText}>Start with JD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StepBar current={step} total={TOTAL_STEPS} />
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepNum: { color: COLORS.textMuted, fontWeight: 'bold', fontSize: 13 },
  stepNumActive: { color: COLORS.text },
  stepLine: { width: 36, height: 2, backgroundColor: COLORS.border, marginHorizontal: SPACING.xs },
  stepLineActive: { backgroundColor: COLORS.primary },
  stepContent: { flex: 1, paddingHorizontal: SPACING.lg },
  stepTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  stepSub: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.md, lineHeight: 20 },
  roleGrid: { marginBottom: SPACING.lg },
  levelRow: { flexDirection: 'row', gap: SPACING.sm },
  levelBtn: {
    flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md,
    backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  levelBtnActive: { backgroundColor: COLORS.cardLight, borderColor: COLORS.primary },
  levelText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 14 },
  levelTextActive: { color: COLORS.primaryLight },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  typeCard: {
    width: '47%', backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, padding: SPACING.md,
    alignItems: 'center', gap: SPACING.xs,
  },
  typeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.cardLight },
  typeEmoji: { fontSize: 24 },
  typeLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  typeLabelActive: { color: COLORS.primaryLight },

  // Resume upload
  uploadBox: {
    borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
    borderRadius: RADIUS.lg, padding: SPACING.xl,
    alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.card, marginBottom: SPACING.md,
  },
  uploadBoxDone: { borderColor: COLORS.success, borderStyle: 'solid' },
  uploadTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  uploadHint: { color: COLORS.textMuted, fontSize: 12 },
  uploadingText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
  uploadedName: { color: COLORS.text, fontSize: 14, fontWeight: '600', maxWidth: '80%' },
  summaryBox: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.primary + '44',
    padding: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.md,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  summaryTitle: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  summaryText: { color: COLORS.text, fontSize: 13, lineHeight: 20 },

  // JD
  jdInput: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: SPACING.md,
    color: COLORS.text, fontSize: 14, minHeight: 180, marginBottom: SPACING.lg,
  },
  navRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: SPACING.lg, marginBottom: SPACING.xl,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, padding: SPACING.sm },
  backBtnText: { color: COLORS.textMuted, fontSize: 14 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md, borderRadius: RADIUS.md,
  },
  nextBtnDisabled: { backgroundColor: COLORS.border },
  nextBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  startBtns: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  skipBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  skipBtnText: { color: COLORS.textMuted, fontSize: 14 },
});
