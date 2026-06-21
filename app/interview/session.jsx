import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

// Placeholder messages — Phase 5 will replace with real Claude API data
const INITIAL_MESSAGES = [
  {
    id: '1',
    role: 'interviewer',
    content:
      "Hello! I'm Aryan, Senior Technical Lead here. Thanks for joining us today. Let's dive right in — can you walk me through how Spring Boot auto-configuration works under the hood?",
  },
];

// Single chat bubble
function MessageBubble({ msg }) {
  const isAI = msg.role === 'interviewer';
  return (
    <View style={[styles.bubbleRow, isAI ? styles.bubbleRowLeft : styles.bubbleRowRight]}>
      {isAI && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>A</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isAI ? styles.bubbleAI : styles.bubbleUser,
        ]}
      >
        <Text style={[styles.bubbleText, { color: isAI ? COLORS.text : '#FFFFFF' }]}>
          {msg.content}
        </Text>
      </View>
    </View>
  );
}

// Animated "AI is typing" dots (3 dots, simple version for Phase 1)
function TypingIndicator() {
  return (
    <View style={[styles.bubbleRow, styles.bubbleRowLeft]}>
      <View style={styles.aiAvatar}>
        <Text style={styles.aiAvatarText}>A</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        <Text style={styles.typingDots}>● ● ●</Text>
      </View>
    </View>
  );
}

export default function SessionScreen() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput]       = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const listRef = useRef(null);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg = {
      id:      Date.now().toString(),
      role:    'candidate',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Phase 5: send to backend → Claude → get real follow-up
    // For now, simulate a 1.5s delay then show a mock follow-up
    setTimeout(() => {
      setIsTyping(false);
      setQuestionCount((c) => c + 1);

      if (questionCount >= 6) {
        setMessages((prev) => [
          ...prev,
          {
            id:      Date.now().toString(),
            role:    'interviewer',
            content:
              'INTERVIEW_COMPLETE — Great session! You showed solid understanding of Spring Boot internals. I\'ll have your detailed report ready shortly.',
          },
        ]);
        setTimeout(() => router.push('/interview/report'), 1500);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id:      Date.now().toString(),
          role:    'interviewer',
          content:
            "Interesting. You mentioned @ConditionalOnMissingBean — could you give me a real-world example of when you've used that in a production service?",
        },
      ]);
    }, 1500);
  }

  function handleEndInterview() {
    Alert.alert(
      'End Interview?',
      'Your session will be saved and a report will be generated.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End & Get Report',
          style: 'destructive',
          onPress: () => router.push('/interview/report'),
        },
      ],
    );
  }

  const flatData = isTyping
    ? [...messages, { id: '__typing__', role: '__typing__' }]
    : messages;

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.aiInfo}>
          <View style={styles.aiHeaderAvatar}>
            <Text style={styles.aiAvatarText}>A</Text>
          </View>
          <View>
            <Text style={styles.aiName}>Aryan</Text>
            <Text style={styles.aiRole}>Senior Technical Lead</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.endBtn} onPress={handleEndInterview}>
          <Text style={styles.endBtnText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(questionCount / 8) * 100}%` }]} />
      </View>

      {/* Chat */}
      <FlatList
        ref={listRef}
        data={flatData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          item.id === '__typing__'
            ? <TypingIndicator />
            : <MessageBubble msg={item} />
        }
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Hint panel */}
      {hintVisible && (
        <View style={styles.hintPanel}>
          <Text style={styles.hintTitle}>💡 Hint</Text>
          <Text style={styles.hintText}>
            Think about the @Conditional annotations family. Auto-configuration classes use @ConditionalOnClass, @ConditionalOnMissingBean, etc., to decide whether to create a bean.
          </Text>
        </View>
      )}

      {/* Input bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.hintBtn}
            onPress={() => setHintVisible((v) => !v)}
          >
            <Text style={styles.hintBtnText}>💡</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type your answer..."
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  aiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  aiHeaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiName: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  aiRole: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  endBtn: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  endBtnText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.danger,
  },
  progressTrack: {
    height: 3,
    backgroundColor: COLORS.border,
  },
  progressFill: {
    height: 3,
    backgroundColor: COLORS.primary,
  },
  chatContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  bubbleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  bubbleRowLeft: {
    justifyContent: 'flex-start',
    paddingRight: '15%',
  },
  bubbleRowRight: {
    justifyContent: 'flex-end',
    paddingLeft: '15%',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 4,
  },
  aiAvatarText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  bubble: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    maxWidth: '90%',
  },
  bubbleAI: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: RADIUS.sm,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  typingBubble: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  typingDots: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 4,
  },
  hintPanel: {
    backgroundColor: COLORS.accent + '22',
    borderTopWidth: 1,
    borderTopColor: COLORS.accent + '44',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  hintTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.accent,
  },
  hintText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  hintBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent + '22',
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBtnText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  sendBtnText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
  },
});
