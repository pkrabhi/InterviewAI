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

export default function VoiceModal({ visible, transcript, onStop, onSend, onCancel }) {
  const { width } = useWindowDimensions();
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const MIC_SIZE  = Math.round(width * 0.18);   // 18% of screen width
  const RING1     = Math.round(width * 0.22);
  const RING2     = Math.round(width * 0.28);
  const RING3     = Math.round(width * 0.34);
  const WRAP_SIZE = Math.round(width * 0.38);

  useEffect(() => {
    if (visible && elapsed >= MAX_SECONDS) {
      clearInterval(timerRef.current);
      onStop();
    }
  }, [elapsed, visible]);

  useEffect(() => {
    if (!visible) {
      pulse1.stopAnimation(); pulse1.setValue(1);
      pulse2.stopAnimation(); pulse2.setValue(1);
      pulse3.stopAnimation(); pulse3.setValue(1);
      clearInterval(timerRef.current);
      setElapsed(0);
      return;
    }
    const animate = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1.7, duration: 900, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
        ])
      ).start();

    animate(pulse1, 0);
    animate(pulse2, 280);
    animate(pulse3, 560);

    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [visible]);

  const timeLeft = MAX_SECONDS - elapsed;
  const isWarning = timeLeft <= 10;
  const mins = Math.floor(elapsed / 60);
  const secs = String(elapsed % 60).padStart(2, '0');

  const cardRadius = ms(28);
  const cardTintColor = Platform.OS === 'android' ? 'rgba(10, 14, 26, 0.92)' : 'rgba(15, 23, 41, 0.60)';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Overlay blur — iOS only (Android Modal can't blur across window layers) */}
        {Platform.OS === 'ios' && (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View style={[StyleSheet.absoluteFill, styles.overlayTint]} />

        {/* Card */}
        <View style={[styles.card, { borderRadius: cardRadius, width: width - SPACING.lg * 2 }]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={28} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: cardRadius }]} />
          ) : Platform.OS === 'android' ? (
            <BlurView
              intensity={26}
              tint="dark"
              style={[StyleSheet.absoluteFill, { borderRadius: cardRadius }]}
              experimentalBlurMethod="dimezisBlurView"
            />
          ) : null}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: cardTintColor, borderRadius: cardRadius }]} />

          <View style={styles.content}>
            <Text style={styles.listeningLabel}>Listening</Text>
            <Text style={styles.listeningDots}>● ● ●</Text>

            {/* Pulsing mic rings */}
            <View style={[styles.micWrapper, { width: WRAP_SIZE, height: WRAP_SIZE }]}>
              <Animated.View style={[styles.ring, {
                width: RING3, height: RING3, borderRadius: RING3 / 2,
                transform: [{ scale: pulse3 }], borderColor: 'rgba(99,102,241,0.15)',
              }]} />
              <Animated.View style={[styles.ring, {
                width: RING2, height: RING2, borderRadius: RING2 / 2,
                transform: [{ scale: pulse2 }], borderColor: 'rgba(99,102,241,0.30)',
              }]} />
              <Animated.View style={[styles.ring, {
                width: RING1, height: RING1, borderRadius: RING1 / 2,
                transform: [{ scale: pulse1 }], borderColor: 'rgba(99,102,241,0.55)',
              }]} />
              <TouchableOpacity onPress={onStop} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#6366F1', '#7C3AED']}
                  style={[styles.micCircle, { width: MIC_SIZE, height: MIC_SIZE, borderRadius: MIC_SIZE / 2 }]}
                >
                  <MaterialCommunityIcons name="microphone" size={MIC_SIZE * 0.46} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.timerRow}>
              <Text style={styles.timerHint}>Tap mic to stop  •  </Text>
              <Text style={[styles.timerText, isWarning && styles.timerWarning]}>
                {mins}:{secs} / 2:00
              </Text>
            </View>

            <View style={styles.transcriptBox}>
              <Text style={[styles.transcriptText, !transcript && styles.transcriptPlaceholder]}>
                {transcript || 'Start speaking...'}
              </Text>
            </View>

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
                  <Text style={styles.sendText}>Send</Text>
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
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  overlayTint: {
    backgroundColor: 'rgba(5, 8, 22, 0.78)',
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  content: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.lg,
  },
  listeningLabel: {
    color: COLORS.primaryLight,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  listeningDots: {
    color: COLORS.primary,
    fontSize: ms(10),
    letterSpacing: 4,
    marginTop: -SPACING.md,
  },
  micWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  micCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -SPACING.sm,
  },
  timerHint: { color: 'rgba(255,255,255,0.35)', fontSize: FONT_SIZE.sm },
  timerText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primaryLight,
    fontFamily: 'monospace',
  },
  timerWarning: { color: COLORS.danger },
  transcriptBox: {
    width: '100%',
    minHeight: ms(80),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: SPACING.md,
    justifyContent: 'center',
  },
  transcriptText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    lineHeight: ms(22),
    textAlign: 'center',
  },
  transcriptPlaceholder: {
    color: 'rgba(255,255,255,0.25)',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelText: { color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: FONT_SIZE.md },
  sendBtnWrapper: {
    flex: 2,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  sendBtn: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  sendText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.md },
});
