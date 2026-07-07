import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Alert, Animated,
} from 'react-native';
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
import MessageBubble    from '../../components/MessageBubble';
import TypingIndicator  from '../../components/TypingIndicator';
import VoiceModal       from '../../components/VoiceModal';
import useLearningStore from '../../store/useLearningStore';
import { startLearningSession, sendLearningMessage, getLearningSessionMessages } from '../../services/learningService';

// Same TTS helpers and hands-free Voice Mode pattern as the interview SessionScreen — kept
// as an independent copy rather than a shared abstraction so interview mode (which needs to
// stay rock solid) is never at risk from changes made here.
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
    Speech.speak(text, { language: 'en-IN', rate: 0.9, pitch: 0.85, onDone, onStopped: onDone, onError: onDone });
  }
};

const stopSpeaking = () => {
  if (Platform.OS === 'web') {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  } else {
    Speech.stop();
  }
};

const SILENCE_MS = 1800;
const GRACE_MS    = 2000;

export default function LearningSessionScreen({ route, navigation }) {
  const { topic, resumeSessionId } = route.params || {};
  const { COLORS } = useThemeStore();

  const [inputText, setInputText]       = useState('');
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const voiceEnabledRef = useRef(true);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceTranscript, setVoiceTranscript]     = useState('');
  const [interactionMode, setInteractionMode]     = useState('text');
  const [voiceGraceSeconds, setVoiceGraceSeconds] = useState(null);
  const flatListRef    = useRef(null);
  const recognitionRef = useRef(null);
  const isMounted      = useRef(true);
  const pulseAnim      = useRef(new Animated.Value(1)).current;
  const voiceModalRef  = useRef(false);
  const isListeningRef = useRef(false);
  const autoListenActiveRef = useRef(false);
  const voiceTranscriptRef  = useRef('');
  const silenceTimerRef     = useRef(null);
  const graceIntervalRef    = useRef(null);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript || '';
    setVoiceTranscript(text);
    if (autoListenActiveRef.current) handleAutoSpeechResult(text);
  });
  useSpeechRecognitionEvent('end', () => {
    if ((voiceModalRef.current || autoListenActiveRef.current) && Platform.OS !== 'web' && isListeningRef.current) {
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

  const { sessionId, messages, isTyping, setSessionId, addMessage, setTyping, resetSession } = useLearningStore();

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
    resetSession();
    initSession();
    return () => {
      isMounted.current = false;
      stopVoiceRecording();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => { if (isMounted.current) flatListRef.current?.scrollToEnd({ animated: true }); }, 100);
    }
  }, [messages, isTyping]);

  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { voiceModalRef.current = voiceModalVisible; }, [voiceModalVisible]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { voiceTranscriptRef.current = voiceTranscript; }, [voiceTranscript]);
  useEffect(() => { autoListenActiveRef.current = interactionMode === 'voice'; }, [interactionMode]);

  useEffect(() => {
    if (!voiceEnabledRef.current) return;
    const last = messages[messages.length - 1];
    if (last && last.role === 'interviewer') {
      setIsSpeaking(true);
      speakText(last.content, () => {
        setIsSpeaking(false);
        if (autoListenActiveRef.current) startAutoListen();
      });
    }
  }, [messages]);

  useEffect(() => {
    if (interactionMode === 'voice' && !isSpeaking && !isTyping && messages.length > 0) {
      startAutoListen();
    } else if (interactionMode === 'text') {
      stopAutoListen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactionMode]);

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
        setSessionId(resumeSessionId);
        const history = await getLearningSessionMessages(resumeSessionId);
        history.forEach((msg) => addMessage({ role: msg.role === 'tutor' ? 'interviewer' : 'candidate', content: msg.content }));
      } else {
        const response = await startLearningSession(topic);
        setSessionId(response.sessionId);
        addMessage({ role: 'interviewer', content: response.openingMessage });
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        Alert.alert('Session Expired', 'Your login session has expired. Please log in again.', [{ text: 'OK', onPress: () => navigation.replace('Login') }]);
      } else if (!error?.response) {
        Alert.alert('No Connection', 'Could not reach the server. Check your internet connection.');
      } else {
        Alert.alert('Error', 'Could not start this session. Please try again.');
      }
    } finally {
      setTyping(false);
    }
  };

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || isTyping || !sessionId) return;
    stopSpeaking();
    stopAutoListen();
    if (!overrideText) setInputText('');
    addMessage({ role: 'candidate', content: text });
    setTyping(true);
    try {
      const response = await sendLearningMessage(sessionId, text);
      addMessage({ role: 'interviewer', content: response.aiMessage });
    } catch (error) {
      addMessage({ role: 'interviewer', content: 'I had a technical issue. Could you ask that again?' });
    } finally {
      setTyping(false);
    }
  };

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
        for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
        setVoiceTranscript(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.start();
      setIsListening(true);
      return;
    }

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
    isListeningRef.current = false;
    if (Platform.OS === 'web') {
      if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    } else {
      try { ExpoSpeechRecognitionModule.stop(); } catch (_) {}
    }
    setIsListening(false);
  };

  const startAutoListen = async () => {
    if (interactionMode !== 'voice') return;
    clearTimeout(silenceTimerRef.current);
    clearInterval(graceIntervalRef.current);
    setVoiceGraceSeconds(null);
    setVoiceTranscript('');
    voiceTranscriptRef.current = '';

    if (Platform.OS === 'web') {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      const recognition = new SR();
      recognition.lang = 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognitionRef.current = recognition;
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
        setVoiceTranscript(transcript);
        handleAutoSpeechResult(transcript);
      };
      recognition.onend = () => {
        if (autoListenActiveRef.current && isListeningRef.current) {
          try { recognition.start(); } catch (_) { setIsListening(false); isListeningRef.current = false; }
        } else {
          setIsListening(false);
        }
      };
      recognition.onerror = () => { setIsListening(false); isListeningRef.current = false; };
      recognition.start();
      setIsListening(true);
      isListeningRef.current = true;
      return;
    }

    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) { setInteractionMode('text'); return; }
    try {
      ExpoSpeechRecognitionModule.start({ lang: 'en-IN', interimResults: true, continuous: true });
      setIsListening(true);
      isListeningRef.current = true;
    } catch (_) {}
  };

  const stopAutoListen = () => {
    clearTimeout(silenceTimerRef.current);
    clearInterval(graceIntervalRef.current);
    setVoiceGraceSeconds(null);
    stopVoiceRecording();
  };

  const handleAutoSpeechResult = (text) => {
    voiceTranscriptRef.current = text;
    clearTimeout(silenceTimerRef.current);
    clearInterval(graceIntervalRef.current);
    setVoiceGraceSeconds(null);
    if (!text.trim()) return;
    silenceTimerRef.current = setTimeout(enterGracePhase, SILENCE_MS);
  };

  const enterGracePhase = () => {
    if (!autoListenActiveRef.current) return;
    const text = voiceTranscriptRef.current.trim();
    if (!text) return;
    let secondsLeft = Math.ceil(GRACE_MS / 1000);
    setVoiceGraceSeconds(secondsLeft);
    graceIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) { clearInterval(graceIntervalRef.current); commitAutoSend(); }
      else setVoiceGraceSeconds(secondsLeft);
    }, 1000);
  };

  const cancelGraceKeepTalking = () => {
    clearInterval(graceIntervalRef.current);
    setVoiceGraceSeconds(null);
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(enterGracePhase, SILENCE_MS);
  };

  const commitAutoSend = () => {
    const text = voiceTranscriptRef.current.trim();
    stopAutoListen();
    setVoiceTranscript('');
    voiceTranscriptRef.current = '';
    if (text) handleSend(text);
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

  const toggleMic = () => {
    if (interactionMode === 'voice') {
      if (isListening) stopAutoListen();
      else startAutoListen();
      return;
    }
    openVoiceModal();
  };

  const handleModeChange = (mode) => {
    if (mode === interactionMode) return;
    stopSpeaking();
    stopAutoListen();
    handleVoiceCancel();
    setInteractionMode(mode);
  };

  const toggleVoice = () => {
    if (isSpeaking) stopSpeaking();
    setVoiceEnabled((v) => !v);
  };

  const handleLeave = () => {
    stopSpeaking();
    stopVoiceRecording();
    navigation.goBack();
  };

  const isWeb = Platform.OS === 'web';

  return (
    <ScreenBackground style={{ flex: 1, ...(isWeb ? { height: '100%', display: 'flex', flexDirection: 'column' } : {}) }}>
      <KeyboardAvoidingView
        style={{ flex: 1, ...(isWeb ? { display: 'flex', flexDirection: 'column', minHeight: 0 } : {}) }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <GlassCard
          style={{ borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderTopWidth: 0 }}
          intensity={32}
          borderColor={COLORS.glassBorder}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1, marginRight: SPACING.sm }}>
              <LinearGradient
                colors={isSpeaking ? [COLORS.success, '#059669'] : [COLORS.primary, '#7C3AED']}
                style={{
                  width: 42, height: 42, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
                  ...(isSpeaking ? { shadowColor: COLORS.success, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 10, elevation: 8 } : {}),
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: FONT_SIZE.md }}>A</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: FONT_SIZE.md }}>
                  Aryan {isSpeaking ? '🔊' : ''}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }} numberOfLines={1}>
                  {topic || 'Ask me anything'}
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
              <TouchableOpacity onPress={handleLeave} style={{ padding: 6 }}>
                <MaterialCommunityIcons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

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

        <VoiceModal
          visible={voiceModalVisible}
          transcript={voiceTranscript}
          onStop={stopVoiceRecording}
          onSend={handleVoiceSend}
          onCancel={handleVoiceCancel}
        />

        <GlassCard
          style={{
            borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0,
            paddingTop: SPACING.sm,
            ...(isWeb ? { position: 'sticky', bottom: 0, zIndex: 50 } : {}),
          }}
          intensity={32}
          borderColor={COLORS.glassBorder}
        >
          <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.xs, gap: SPACING.xs }}>
            {[
              { id: 'text',  label: '💬 Text' },
              { id: 'voice', label: '🎙️ Voice' },
            ].map((m) => {
              const active = interactionMode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => handleModeChange(m.id)}
                  style={{
                    paddingHorizontal: SPACING.md, paddingVertical: 5, borderRadius: RADIUS.full,
                    backgroundColor: active ? COLORS.primary + '25' : COLORS.inputBg,
                    borderWidth: 1, borderColor: active ? COLORS.primary + '55' : COLORS.inputBorder,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: active ? COLORS.primaryLight : COLORS.textMuted }}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {interactionMode === 'text' && isListening && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingBottom: SPACING.xs }}>
              <MaterialCommunityIcons name="microphone" size={14} color={COLORS.danger} />
              <Text style={{ color: COLORS.danger, fontSize: 12, fontWeight: '500' }}>Listening... tap mic to stop</Text>
            </View>
          )}

          {interactionMode === 'voice' && !isTyping && (
            <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xs }}>
              {isSpeaking ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
                  <MaterialCommunityIcons name="volume-high" size={14} color={COLORS.success} />
                  <Text style={{ color: COLORS.success, fontSize: 12, fontWeight: '500' }}>Aryan is speaking...</Text>
                </View>
              ) : voiceGraceSeconds != null ? (
                <TouchableOpacity
                  onPress={cancelGraceKeepTalking}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
                    alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 4,
                    borderRadius: RADIUS.full, backgroundColor: COLORS.primary + '22',
                    borderWidth: 1, borderColor: COLORS.primary + '55',
                  }}
                >
                  <MaterialCommunityIcons name="send-clock" size={14} color={COLORS.primaryLight} />
                  <Text style={{ color: COLORS.primaryLight, fontSize: 12, fontWeight: '700' }}>
                    Sending in {voiceGraceSeconds}s — tap to keep talking
                  </Text>
                </TouchableOpacity>
              ) : isListening ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
                  <MaterialCommunityIcons name="microphone" size={14} color={COLORS.danger} />
                  <Text style={{ color: COLORS.danger, fontSize: 12, fontWeight: '500' }} numberOfLines={1}>
                    {voiceTranscript ? voiceTranscript : 'Listening...'}
                  </Text>
                </View>
              ) : (
                <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Tap the mic to start talking</Text>
              )}
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.md, paddingTop: SPACING.sm, gap: SPACING.sm }}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                onPress={toggleMic}
                disabled={isTyping}
                style={{
                  width: 44, height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
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
                flex: 1, backgroundColor: COLORS.inputBg, borderRadius: RADIUS.md, borderWidth: 1,
                borderColor: COLORS.inputBorder, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
                color: COLORS.text, fontSize: FONT_SIZE.md, maxHeight: 120,
              }}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isListening ? 'Listening...' : 'Type or speak your question...'}
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
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}
