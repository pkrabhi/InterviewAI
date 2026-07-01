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
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import useThemeStore from '../../store/useThemeStore';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
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
  const { COLORS, isDark } = useThemeStore();

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
  const voiceModalRef  = useRef(false); // track modal open state without closure staleness
  const isListeningRef = useRef(false); // track listening without stale closure

  // expo-speech-recognition events
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript || '';
    setVoiceTranscript(text);
  });
  useSpeechRecognitionEvent('end', () => {
    // Android ASR stops after brief silence — restart if modal is still open
    if (voiceModalRef.current && Platform.OS !== 'web' && isListeningRef.current) {
      try {
        ExpoSpeechRecognitionModule.start({ lang: 'en-IN', interimResults: true, continuous: true });
      } catch (_) {
        setIsListening(false);
        isListeningRef.current = false;
      }
    } else {
      setIsListening(false);
      isListeningRef.current = false;
    }
  });
  useSpeechRecognitionEvent('error', () => {
    setIsListening(false);
    isListeningRef.current = false;
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

  // Keep refs in sync
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { voiceModalRef.current = voiceModalVisible; }, [voiceModalVisible]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

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
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        Alert.alert(
          'Session Expired',
          'Your login session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      } else if (status === 500) {
        Alert.alert('Server Error', 'The AI server had an issue. Please try again in a moment.');
      } else if (!error?.response) {
        Alert.alert('No Connection', 'Could not reach the server. Check your internet connection.');
      } else {
        Alert.alert('Error', error?.response?.data?.message || 'Could not start the interview. Please try again.');
      }
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
    isListeningRef.current = true;
  };

  const stopVoiceRecording = () => {
    isListeningRef.current = false; // stop auto-restart before calling stop
    if (Platform.OS === 'web') {
      if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    } else {
      try { ExpoSpeechRecognitionModule.stop(); } catch (_) {}
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

  const isWeb = Platform.OS === 'web';

  return (
    <ScreenBackground style={{ flex: 1, ...(isWeb ? { height: '100%', display: 'flex', flexDirection: 'column' } : {}) }}>
      <KeyboardAvoidingView
        style={{ flex: 1, ...(isWeb ? { display: 'flex', flexDirection: 'column', minHeight: 0 } : {}) }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Glass Header */}
        <GlassCard
          style={{ borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderTopWidth: 0 }}
          intensity={32}
          borderColor={COLORS.glassBorder}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <LinearGradient
                colors={isSpeaking ? [COLORS.success, '#059669'] : [COLORS.primary, '#7C3AED']}
                style={{
                  width: 42, height: 42, borderRadius: RADIUS.full,
                  alignItems: 'center', justifyContent: 'center',
                  ...(isSpeaking ? { shadowColor: COLORS.success, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 10, elevation: 8 } : {}),
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: FONT_SIZE.md }}>A</Text>
              </LinearGradient>
              <View>
                <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: FONT_SIZE.md }}>
                  Aryan {isSpeaking ? '🔊' : ''}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>
                  {role?.label || 'Java Backend'} • {level || 'Mid'}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <TouchableOpacity onPress={toggleVoice} style={{ padding: 6 }}>
                <MaterialCommunityIcons
                  name={voiceEnabled ? 'volume-high' : 'volume-off'}
                  size={18}
                  color={voiceEnabled ? COLORS.primaryLight : COLORS.textMuted}
                />
              </TouchableOpacity>
              <GlassCard style={{ paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full }} intensity={18}>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontFamily: 'monospace' }}>
                  {formatTime(timer)}
                </Text>
              </GlassCard>
              <TouchableOpacity
                onPress={handleEndInterview}
                style={{ borderWidth: 1, borderColor: COLORS.danger + '88', borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 5, backgroundColor: COLORS.danger + '15' }}
              >
                <Text style={{ color: COLORS.danger, fontSize: FONT_SIZE.sm, fontWeight: '700' }}>End</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* Progress bar */}
        <View style={{ height: 2, backgroundColor: COLORS.glassBorder }}>
          <View style={{ height: 2, backgroundColor: COLORS.primary, width: `${progress * 100}%` }} />
        </View>
        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, textAlign: 'center', paddingVertical: SPACING.xs }}>
          {candidateAnswers}/7 questions answered
        </Text>

        {/* Chat messages */}
        <View style={{ flex: 1, minHeight: 0, ...(isWeb ? { overflowY: 'auto', WebkitOverflowScrolling: 'touch' } : { overflow: 'hidden' }) }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <MessageBubble
                role={item.role}
                content={item.content}
                animate={index === messages.length - 1 && item.role === 'interviewer'}
              />
            )}
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
            contentContainerStyle={{ paddingVertical: SPACING.md, paddingBottom: SPACING.xl }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        </View>

        {/* Interview complete banner */}
        {isComplete && (
          <TouchableOpacity
            onPress={() => navigation.navigate('InterviewReport', { sessionId })}
            style={{ margin: SPACING.md, borderRadius: RADIUS.md, overflow: 'hidden' }}
          >
            <GlassCard
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md }}
              tint={COLORS.success + '20'}
              borderColor={COLORS.success + '55'}
              intensity={24}
            >
              <Text style={{ color: COLORS.success, fontWeight: '600', fontSize: FONT_SIZE.sm }}>
                Interview complete! Tap to view your report
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.success} />
            </GlassCard>
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

        {/* Glass input area — sticky on web so keyboard never hides it */}
        {!isComplete && (
          <GlassCard
            style={{
              borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0,
              paddingTop: SPACING.sm,
              ...(isWeb ? { position: 'sticky', bottom: 0, zIndex: 50 } : {}),
            }}
            intensity={32}
            borderColor={COLORS.glassBorder}
          >
            <HintPanel question={[...messages].reverse().find((m) => m.role === 'interviewer')?.content} />

            {isListening && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingBottom: SPACING.xs }}>
                <MaterialCommunityIcons name="microphone" size={14} color={COLORS.danger} />
                <Text style={{ color: COLORS.danger, fontSize: 12, fontWeight: '500' }}>Listening... tap mic to stop</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.md, paddingTop: SPACING.sm, gap: SPACING.sm }}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  onPress={toggleMic}
                  disabled={isTyping}
                  style={{
                    width: 44, height: 44, borderRadius: RADIUS.full,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isListening ? COLORS.danger : COLORS.inputBg,
                    borderWidth: 1, borderColor: isListening ? 'transparent' : COLORS.inputBorder,
                  }}
                >
                  <MaterialCommunityIcons
                    name={isListening ? 'microphone' : 'microphone-outline'}
                    size={22}
                    color={isListening ? '#fff' : COLORS.textMuted}
                  />
                </TouchableOpacity>
              </Animated.View>

              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: COLORS.inputBg,
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: COLORS.inputBorder,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  color: COLORS.text,
                  fontSize: FONT_SIZE.md,
                  maxHeight: 120,
                }}
                value={inputText}
                onChangeText={setInputText}
                placeholder={isListening ? 'Listening...' : 'Type or speak your answer...'}
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={1000}
              />

              <TouchableOpacity
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                style={{ borderRadius: RADIUS.full, overflow: 'hidden', opacity: (!inputText.trim() || isTyping) ? 0.4 : 1 }}
              >
                <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={{ width: 44, height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="send" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}
