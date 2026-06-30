import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Alert, Animated,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import { ms } from '../../utils/responsive';
import MessageBubble    from '../../components/MessageBubble';
import TypingIndicator  from '../../components/TypingIndicator';
import HintPanel        from '../../components/HintPanel';
import VoiceModal       from '../../components/VoiceModal';
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
  const { role, level, type, jdText, resumeSummary, resumeSessionId } = route.params || {};
  const { width } = useWindowDimensions();

  const [inputText, setInputText]       = useState('');
  const [timer, setTimer]               = useState(0);
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const voiceEnabledRef = useRef(true);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceTranscript, setVoiceTranscript]     = useState('');
  const flatListRef    = useRef(null);
  const recognitionRef = useRef(null);
  const isMounted      = useRef(true);
  const pulseAnim      = useRef(new Animated.Value(1)).current;
  const hasSpokenFirst = useRef(false); // skip TTS on opening message

  // expo-speech-recognition events
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript || '';
    setVoiceTranscript(text);
  });
  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });
  useSpeechRecognitionEvent('error', () => {
    setIsListening(false);
  });

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
    isMounted.current = true;
    stopSpeaking();
    hasSpokenFirst.current = false;
    resetSession();
    initSession();
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
      stopVoiceRecording();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (isMounted.current) flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  // Keep ref in sync so TTS effect never reads a stale closure value
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);

  // Speak Aryan's messages — skip the opening message, speak from 2nd onward
  useEffect(() => {
    if (!voiceEnabledRef.current) return;
    const last = messages[messages.length - 1];
    if (last && last.role === 'interviewer') {
      if (!hasSpokenFirst.current) {
        hasSpokenFirst.current = true; // mark opening message seen, don't speak it
        return;
      }
      setIsSpeaking(true);
      speakText(last.content, () => setIsSpeaking(false));
    }
  }, [messages]);

  // Stop speaking when user navigates away
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      stopSpeaking();
      stopVoiceRecording();
    });
    return unsubscribe;
  }, [navigation]);

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
          resumeSummary: resumeSummary || '',
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

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || isTyping || isComplete || !sessionId) return;
    stopSpeaking();
    if (!overrideText) setInputText('');
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
  const openVoiceModal = async () => {
    stopSpeaking();
    setVoiceTranscript('');
    setVoiceModalVisible(true);

    if (Platform.OS === 'web') {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { Alert.alert('Not supported', 'Use Chrome for voice input on web.'); return; }
      const recognition = new SR();
      recognition.lang = 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognitionRef.current = recognition;
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.start();
      setIsListening(true);
      return;
    }

    // Android: use expo-speech-recognition
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission required', 'Microphone permission is needed for voice input.');
      setVoiceModalVisible(false);
      return;
    }
    ExpoSpeechRecognitionModule.start({ lang: 'en-IN', interimResults: true, continuous: true });
    setIsListening(true);
  };

  const stopVoiceRecording = () => {
    if (Platform.OS === 'web') {
      if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    } else {
      ExpoSpeechRecognitionModule.stop();
    }
    setIsListening(false);
  };

  const handleVoiceSend = () => {
    const text = voiceTranscript.trim();
    stopVoiceRecording();
    setVoiceModalVisible(false);
    setVoiceTranscript('');
    if (text) handleSend(text);
  };

  const handleVoiceCancel = () => {
    stopVoiceRecording();
    setVoiceModalVisible(false);
    setVoiceTranscript('');
  };

  const toggleMic = () => openVoiceModal();

  const toggleVoice = () => {
    if (isSpeaking) stopSpeaking();
    setVoiceEnabled((v) => !v);
  };

  const doEndInterview = async () => {
    if (!sessionId) return;
    stopSpeaking();
    stopVoiceRecording();
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Glass Header */}
      <View style={styles.headerWrapper}>
        {Platform.OS !== 'web' && (
          <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View style={[StyleSheet.absoluteFill, styles.headerTint]} />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={isSpeaking ? ['#10B981', '#059669'] : ['#6366F1', '#7C3AED']}
              style={[styles.avatar, isSpeaking && styles.avatarSpeaking]}
            >
              <Text style={styles.avatarText}>A</Text>
            </LinearGradient>
            <View>
              <Text style={styles.interviewerName}>
                Aryan {isSpeaking ? '🔊' : ''}
              </Text>
              <Text style={styles.roleLabel}>{role?.label || 'Java Backend'} • {level || 'Mid'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleVoice} style={styles.headerIconBtn}>
              <MaterialCommunityIcons
                name={voiceEnabled ? 'volume-high' : 'volume-off'}
                size={18}
                color={voiceEnabled ? COLORS.primaryLight : 'rgba(255,255,255,0.3)'}
              />
            </TouchableOpacity>
            <View style={styles.timerPill}>
              <Text style={styles.timer}>{formatTime(timer)}</Text>
            </View>
            <TouchableOpacity onPress={handleEndInterview} style={styles.endBtn}>
              <Text style={styles.endBtnText}>End</Text>
            </TouchableOpacity>
          </View>
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

      {/* Voice modal */}
      <VoiceModal
        visible={voiceModalVisible}
        transcript={voiceTranscript}
        onStop={stopVoiceRecording}
        onSend={handleVoiceSend}
        onCancel={handleVoiceCancel}
      />

      {/* Glass input area */}
      {!isComplete && (
        <View style={styles.inputAreaWrapper}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          )}
          <View style={[StyleSheet.absoluteFill, styles.inputAreaTint]} />
          <View style={styles.inputArea}>
            <HintPanel hint="Think about a real example from your work experience." />

            {isListening && (
              <View style={styles.listeningBar}>
                <MaterialCommunityIcons name="microphone" size={14} color={COLORS.danger} />
                <Text style={styles.listeningText}>Listening... tap mic to stop</Text>
              </View>
            )}

            <View style={styles.inputRow}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={[styles.micBtn, isListening && styles.micBtnActive]}
                  onPress={toggleMic}
                  disabled={isTyping}
                >
                  <MaterialCommunityIcons
                    name={isListening ? 'microphone' : 'microphone-outline'}
                    size={22}
                    color={isListening ? '#fff' : 'rgba(255,255,255,0.4)'}
                  />
                </TouchableOpacity>
              </Animated.View>

              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder={isListening ? 'Listening...' : 'Type or speak your answer...'}
                placeholderTextColor="rgba(255,255,255,0.28)"
                multiline
                maxLength={1000}
              />

              <TouchableOpacity
                onPress={handleSend}
                disabled={!inputText.trim() || isTyping}
                style={[styles.sendBtnWrapper, (!inputText.trim() || isTyping) && { opacity: 0.4 }]}
              >
                <LinearGradient
                  colors={['#6366F1', '#818CF8']}
                  style={styles.sendBtn}
                >
                  <MaterialCommunityIcons name="send" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
  headerWrapper: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerTint: {
    backgroundColor: 'rgba(10, 14, 26, 0.55)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSpeaking: {
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: FONT_SIZE.md },
  interviewerName: { color: COLORS.text, fontWeight: '600', fontSize: FONT_SIZE.md },
  roleLabel: { color: 'rgba(255,255,255,0.4)', fontSize: FONT_SIZE.xs },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerIconBtn: { padding: 6 },
  timerPill: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  timer: { color: 'rgba(255,255,255,0.55)', fontSize: FONT_SIZE.sm, fontFamily: 'monospace' },
  endBtn: {
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.5)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  endBtnText: { color: COLORS.danger, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  progressBg: { height: 2, backgroundColor: 'rgba(255,255,255,0.06)' },
  progressFill: { height: 2, backgroundColor: COLORS.primary },
  progressLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    paddingVertical: SPACING.xs,
  },
  chatContainer: {
    flex: 1,
    ...(Platform.OS === 'web' ? { overflowY: 'auto', minHeight: 0 } : { overflow: 'hidden' }),
  },
  chatContent: { paddingVertical: SPACING.md, paddingBottom: SPACING.xl },
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: RADIUS.md,
  },
  completeText: { color: COLORS.success, fontWeight: '600', fontSize: 14 },
  inputAreaWrapper: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    flexShrink: 0,
  },
  inputAreaTint: {
    backgroundColor: 'rgba(10, 14, 26, 0.60)',
  },
  inputArea: {
    paddingTop: SPACING.sm,
  },
  listeningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  listeningText: { color: COLORS.danger, fontSize: 12, fontWeight: '500' },
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  micBtnActive: {
    backgroundColor: 'rgba(239,68,68,0.85)',
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtnWrapper: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
