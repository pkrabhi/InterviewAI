import React, { useMemo, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, RADIUS, FONT_SIZE } from '../constants/theme';
import useThemeStore from '../store/useThemeStore';
import GlassCard from './GlassCard';

export default function MessageBubble({ role, content, animate = false }) {
  const { COLORS } = useThemeStore();
  const isInterviewer = role === 'interviewer';
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);

  const [displayed, setDisplayed] = useState(animate ? '' : content);
  const intervalRef = useRef(null);

  useEffect(() => {
    // When content changes and animate=false, show immediately
    if (!animate || !isInterviewer) {
      setDisplayed(content);
      return;
    }
    // Word-by-word reveal for interviewer messages
    const words = content.split(' ');
    let i = 0;
    setDisplayed('');
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayed(words.slice(0, i).join(' '));
      if (i >= words.length) clearInterval(intervalRef.current);
    }, 55);
    return () => clearInterval(intervalRef.current);
  }, [content, animate]);

  return (
    <View style={[styles.row, isInterviewer ? styles.rowLeft : styles.rowRight]}>
      {isInterviewer && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      )}
      {isInterviewer ? (
        <GlassCard style={styles.bubbleLeft} intensity={28}>
          <Text style={[styles.content, { color: COLORS.text }]}>{displayed}</Text>
          {animate && displayed.length < content.length && (
            <Text style={{ color: COLORS.primary, fontSize: 16, marginTop: 2 }}>▌</Text>
          )}
        </GlassCard>
      ) : (
        <View style={styles.bubbleRight}>
          <Text style={[styles.content, { color: '#fff' }]}>{content}</Text>
        </View>
      )}
    </View>
  );
}

const makeStyles = (COLORS) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'flex-end',
  },
  rowLeft:  { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: FONT_SIZE.sm },
  bubbleLeft: {
    maxWidth: '75%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.sm,
  },
  bubbleRight: {
    maxWidth: '75%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  content: { fontSize: FONT_SIZE.md, lineHeight: 22 },
});
