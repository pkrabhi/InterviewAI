import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Alert, Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import MessageBubble    from '../../components/MessageBubble';
import TypingIndicator  from '../../components/TypingIndicator';
import HintPanel        from '../../components/HintPanel';
import useInterviewStore from '../../store/useInterviewStore';
import { startSession, sendMessage, endSession, getSessionMessages } from '../../services/interviewService';

// ── TTS helpers ───────────────────────────────────────────────────────
const speakText = (text, onDone) => {
  if (Platform.OS === 'web') {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang  = 'en-IN';
    utter.rate  = 0.95;
    utter.pitch = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const male   = voices.find((v) => v.lang.startsWith('en') && /male|david|mark|guy|james/i.test(v.name));
    if (male) utter.voice = male;
    utter.onend = onDone;
    window.speechSynthesis.speak(utter);
  } else {
    Speech.speak(text, {
      language: 'en-IN',
      rate: 0.9,
      pitch: 0.85,
      onDone,
      onStopped: onDone,
      onError: onDone,
    });
  }
};

const stopSpeaking = () => {
  if (Platform.OS === 'web') {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  } else {
    Speech.stop();
  }
};

// ── Main component ────────────────────────────────────────────────────
export default function SessionScreen({ route, navigation }) {
  const { role, level, type, jdText, resumeSessionId } = route.params || {};

  const [inputText, setInputText]     = useState('');
  const [timer, setTimer]             = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const flatListRef  = useRef(null);
  const recognitionRef = useRef(null);
  const pulseAnim    = useRef(new Animated.Value(1)).current;

  const {
    sessionId, messages, isTyping, isComplete,
    setSessionId, addMessage, setTyping, setComplete, resetSession,
  } = useInterviewStore();

  // Pulse animation for mic button while listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  useEffect(() => {
    resetSession();
    initSession();
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => {
      clearInterval(interval);
      stopListening();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  // Speak Aryan's messages automatically when voice is enabled
  useEffect(() => {
    if (!voiceEnabled) return;
    const last = messages[messages.length - 1];
    if (last && last.role === 'interviewer') {
      setIsSpeaking(true);
      speakText(last.content, () => setIsSpeaking(false));
    }
  }, [messages]);

  const initSession = async () => {
    try {
      setTyping(true);

      if (resumeSessionId) {
        // Resume: load existing messages from backend
        setSessionId(resumeSessionId);
        const history = await getSessionMessages(resumeSessionId);
        history.forEach((msg) => addMessage({ role: msg.role, content: msg.content }));
      } else {
        // New session
        const response = await startSession({
          role:          role?.id || 'java',
          level:         level || 'Mid',
          interviewType: type?.id || 'technical',
          jdText:        jdText || '',
        });
        setSessionId(response.sessionId);
        addMessage({ role: 'interviewer', content: response.openingMessage });
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Could not connect to the interview server. Make sure the backend is running.');
    } finally {
      setTyping(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isTyping || isComplete) return;
    stopSpeaking();
    setInputText('');
    addMessage({ role: 'candidate', content: text });
    setTyping(true);
    try {
      const response = await sendMessage(sessionId, text);
      addMessage({ role: 'interviewer', content: response.aiMessage });
      if (response.interviewComplete) setComplete(true);
    } catch (error) {
      addMessage({ role: 'interviewer', content: 'I had a technical issue. Could you repeat your last answer?' });
    } finally {
      setTyping(false);
    }
  };

  // ── Speech recognition ───────────────────────────────────────────
  const startListening = async () => {
    stopSpeaking();

    if (Platform.OS === 'web') {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { Alert.alert('Not supported', 'Voice input is only supported in Chrome.'); return; }
      const recognition = new SR();
      recognition.lang = 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognitionRef.current = recognition;
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.start();
      setIsListening(true);
      return;
    }

    // Android: voice input not yet supported, prompt to type
    Alert.alert('Voice Input', 'Voice-to-text is coming soon for Android. Please type your answer.');
    return;
  };

  const stopListening = async () => {
    if (Platform.OS === 'web') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleVoice = () => {
    if (isSpeaking) stopSpeaking();
    setVoiceEnabled((v) => !v);
  };

  const doEndInterview = async () => {
    stopSpeaking();
    stopListening();
    try { await endSession(sessionId); } catch (_) {}
    navigation.navigate('InterviewReport', { sessionId });
  };

  const handleEndInterview = () => {
    stopSpeaking();
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to end the interview early?')) {
        doEndInterview();
      }
      return;
    }
    Alert.alert('End Interview', 'Are you sure you want to end the interview early?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: doEndInterview },
    ]);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const candidateAnswers = messages.filter((m) => m.role === 'candidate').length;
  const progress = Math.min(candidateAnswers / 7, 1);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, isSpeaking && styles.avatarSpeaking]}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View>
            <Text style={styles.interviewerName}>
              Aryan {isSpeaking ? '🔊' : ''}
            </Text>
            <Text style={styles.roleLabel}>{role?.label || 'Java Backend'} • {level || 'Mid'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* Voice toggle */}
          <TouchableOpacity onPress={toggleVoice} style={styles.voiceToggle}>
            <MaterialCommunityIcons
              name={voiceEnabled ? 'volume-high' : 'volume-off'}
              size={20}
              color={voiceEnabled ? COLORS.primary : COLORS.textMuted}
            />
          </TouchableOpacity>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
          <TouchableOpacity onPress={handleEndInterview} style={styles.endBtn}>
            <Text style={styles.endBtnText}>End</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{candidateAnswers}/7 questions answered</Text>

      {/* Chat messages */}
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <MessageBubble role={item.role} content={item.content} />
          )}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={true}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </View>

      {/* Interview complete banner */}
      {isComplete && (
        <TouchableOpacity
          style={styles.completeBanner}
          onPress={() => navigation.navigate('InterviewReport', { sessionId })}
        >
          <Text style={styles.completeText}>Interview complete! Tap to view your report</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.text} />
        </TouchableOpacity>
      )}

      {/* Input area */}
      {!isComplete && (
        <View style={styles.inputArea}>
          <HintPanel hint="Think about a real example from your work experience." />

          {/* Listening indicator */}
          {isListening && (
            <View style={styles.listeningBar}>
              <MaterialCommunityIcons name="microphone" size={14} color={COLORS.danger} />
              <Text style={styles.listeningText}>Listening... tap mic to stop</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            {/* Mic button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.micBtn, isListening && styles.micBtnActive]}
                onPress={toggleMic}
                disabled={isTyping}
              >
                <MaterialCommunityIcons
                  name={isListening ? 'microphone' : 'microphone-outline'}
                  size={22}
                  color={isListening ? COLORS.text : COLORS.textMuted}
                />
              </TouchableOpacity>
            </Animated.View>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isListening ? 'Listening...' : 'Type or speak your answer...'}
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || isTyping) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
            >
              <MaterialCommunityIcons name="send" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      maxHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    } : {}),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSpeaking: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  avatarText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  interviewerName: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 15,
  },
  roleLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  voiceToggle: {
    padding: 6,
  },
  timer: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  endBtn: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  endBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  progressBg: {
    height: 3,
    backgroundColor: COLORS.border,
  },
  progressFill: {
    height: 3,
    backgroundColor: COLORS.primary,
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: SPACING.xs,
  },
  chatContainer: {
    flex: 1,
    ...(Platform.OS === 'web' ? { overflowY: 'auto', minHeight: 0 } : { overflow: 'hidden' }),
  },
  chatContent: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: RADIUS.md,
  },
  completeText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  inputArea: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    flexShrink: 0,
  },
  listeningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  listeningText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  micBtnActive: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
  },
});
