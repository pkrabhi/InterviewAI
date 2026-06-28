import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Animated, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function VoiceModal({ visible, transcript, onStop, onSend, onCancel }) {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      pulse1.stopAnimation(); pulse1.setValue(1);
      pulse2.stopAnimation(); pulse2.setValue(1);
      pulse3.stopAnimation(); pulse3.setValue(1);
      return;
    }
    const animate = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1.6, duration: 800, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
        ])
      ).start();

    animate(pulse1, 0);
    animate(pulse2, 250);
    animate(pulse3, 500);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.listeningLabel}>Listening...</Text>

          {/* Pulsing rings */}
          <View style={styles.micWrapper}>
            <Animated.View style={[styles.ring, styles.ring3, { transform: [{ scale: pulse3 }] }]} />
            <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: pulse2 }] }]} />
            <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: pulse1 }] }]} />
            <TouchableOpacity style={styles.micCircle} onPress={onStop}>
              <MaterialCommunityIcons name="microphone" size={36} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>Tap mic to stop recording</Text>

          {/* Live transcript */}
          <View style={styles.transcriptBox}>
            <Text style={[styles.transcriptText, !transcript && styles.transcriptPlaceholder]}>
              {transcript || 'Start speaking...'}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendBtn, !transcript && styles.sendBtnDisabled]}
              onPress={onSend}
              disabled={!transcript}
            >
              <MaterialCommunityIcons name="send" size={18} color="#fff" />
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    gap: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listeningLabel: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  micWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  ring1: {
    width: 90,
    height: 90,
    borderColor: COLORS.primary + '80',
  },
  ring2: {
    width: 115,
    height: 115,
    borderColor: COLORS.primary + '50',
  },
  ring3: {
    width: 140,
    height: 140,
    borderColor: COLORS.primary + '25',
  },
  micCircle: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: -SPACING.sm,
  },
  transcriptBox: {
    width: '100%',
    minHeight: 80,
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  transcriptText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  transcriptPlaceholder: {
    color: COLORS.textMuted,
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
  sendBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
