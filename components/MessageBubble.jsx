import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function MessageBubble({ role, content }) {
  const isInterviewer = role === 'interviewer';

  return (
    <View style={[styles.row, isInterviewer ? styles.rowLeft : styles.rowRight]}>
      {isInterviewer && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      )}
      <View style={[styles.bubble, isInterviewer ? styles.bubbleLeft : styles.bubbleRight]}>
        <Text style={styles.content}>{content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  bubble: {
    maxWidth: '75%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  bubbleLeft: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: RADIUS.sm,
  },
  bubbleRight: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: RADIUS.sm,
  },
  content: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
