import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Animated, Platform, useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../constants/theme';
import { ms } from '../utils/responsive';

const MAX_SECONDS = 120;
const BAR_COUNT = 7;

// Single animated waveform bar
function WaveBar({ visible, delay, color }) {
  const anim = useRef(new Animated.Value(0.15)).current;
  const loopRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      loopRef.current?.stop();
      anim.setValue(0.15);
      return;
    }
    const randomDuration = () => 250 + Math.random() * 350;
    const runLoop = () => {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 0.2 + Math.random() * 0.8, duration: randomDuration(), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.1 + Math.random() * 0.3, duration: randomDuration(), useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
    };
    runLoop();
    return () => loopRef.current?.stop();
  }, [visible]);

  return (
    <Animated.View style={{
      width: ms(5),
      height: ms(40),
      borderRadius: ms(3),
      backgroundColor: color,
      transform: [{ scaleY: anim }],
      marginHorizontal: ms(3),
    }} />
  );
}

export default function VoiceModal({ visible, transcript, onStop, onSend, onCancel }) {
  const { width } = useWindowDimensions();
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const MIC_SIZE  = Math.round(width * 0.16);
  const cardRadius = ms(28);
  const cardTintColor = Platform.OS === 'android' ? 'rgba(10, 14, 26, 0.94)' : 'rgba(15, 23, 41, 0.65)';

  useEffect(() => {
    if (visible && elapsed >= MAX_SECONDS) {
      clearInterval(timerRef.current);
      onStop();
    }
  }, [elapsed, visible]);

  useEffect(() => {
    if (!visible) {
      clearInterval(timerRef.current);
      setElapsed(0);
      return;
    }
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [visible]);

  const timeLeft  = MAX_SECONDS - elapsed;
  const isWarning = timeLeft <= 10;
  const mins = Math.floor(elapsed / 60);
  const secs = String(elapsed % 60).padStart(2, '0');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {Platform.OS === 'ios' && (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View style={[StyleSheet.absoluteFill, styles.overlayTint]} />

        <View style={[styles.card, { borderRadius: cardRadius, width: width - SPACING.lg * 2 }]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={28} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: cardRadius }]} />
          ) : Platform.OS === 'android' ? (
            <BlurView intensity={26} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: cardRadius }]} experimentalBlurMethod="dimezisBlurView" />
          ) : null}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: cardTintColor, borderRadius: cardRadius }]} />

          <View style={styles.content}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.recDot} />
              <Text style={styles.listeningLabel}>LISTENING</Text>
              <Text style={[styles.timerText, isWarning && styles.timerWarning]}>
                {mins}:{secs}
              </Text>
            </View>

            {/* Mic button */}
            <TouchableOpacity onPress={onStop} activeOpacity={0.85}>
              <LinearGradient
                colors={['#6366F1', '#7C3AED']}
                style={[styles.micCircle, { width: MIC_SIZE, height: MIC_SIZE, borderRadius: MIC_SIZE / 2 }]}
              >
                <MaterialCommunityIcons name="microphone" size={MIC_SIZE * 0.46} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Waveform bars */}
            <View style={styles.waveform}>
              {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <WaveBar
                  key={i}
                  visible={visible}
                  delay={i * 80}
                  color={i === Math.floor(BAR_COUNT / 2) ? COLORS.primaryLight : `rgba(99,102,241,${0.4 + (i % 3) * 0.2})`}
                />
              ))}
            </View>

            {/* Transcript */}
            <View style={styles.transcriptBox}>
              <Text style={[styles.transcriptText, !transcript && styles.transcriptPlaceholder]} numberOfLines={4}>
                {transcript || 'Start speaking...'}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBtnWrapper, !transcript && { opacity: 0.4 }]}
                onPress={onSend}
                disabled={!transcript}
              >
                <LinearGradient
                  colors={['#6366F1', '#818CF8']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.sendBtn}
                >
                  <MaterialCommunityIcons name="send" size={ms(16)} color="#fff" />
                  <Text style={styles.sendText}>Send Answer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg },
  overlayTint: { backgroundColor: 'rgba(5, 8, 22, 0.80)' },
  card: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  content: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.md },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, width: '100%', justifyContent: 'center' },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  listeningLabel: { color: COLORS.primaryLight, fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 2 },
  timerText: { color: COLORS.primaryLight, fontSize: FONT_SIZE.sm, fontWeight: '700', fontFamily: 'monospace', marginLeft: SPACING.sm },
  timerWarning: { color: COLORS.danger },

  micCircle: {
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6, shadowRadius: 14, elevation: 10,
  },

  waveform: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: ms(50), paddingVertical: ms(5),
  },

  transcriptBox: {
    width: '100%', minHeight: ms(70),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    padding: SPACING.md, justifyContent: 'center',
  },
  transcriptText: { color: COLORS.text, fontSize: FONT_SIZE.md, lineHeight: ms(22), textAlign: 'center' },
  transcriptPlaceholder: { color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' },

  actions: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  cancelBtn: {
    flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelText: { color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: FONT_SIZE.md },
  sendBtnWrapper: { flex: 2, borderRadius: RADIUS.full, overflow: 'hidden' },
  sendBtn: {
    flexDirection: 'row', paddingVertical: SPACING.md, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center', gap: SPACING.xs,
  },
  sendText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.md },
});
