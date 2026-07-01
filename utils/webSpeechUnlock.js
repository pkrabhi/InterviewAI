import { Platform } from 'react-native';

/**
 * Browsers block speech-synthesis audio unless it's triggered by (or shortly after) a
 * genuine user gesture like a tap. Call this synchronously inside the onPress handler that
 * starts an interview — it "unlocks" the SpeechSynthesis API with a near-silent utterance so
 * that later async speak() calls (e.g. the AI's opening greeting, which only arrives after a
 * network round-trip) aren't silently dropped by the browser's autoplay policy.
 * No-op on native, where this restriction doesn't exist.
 */
export function unlockSpeechSynthesis() {
  if (Platform.OS !== 'web') return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const utter = new window.SpeechSynthesisUtterance(' ');
    utter.volume = 0;
    window.speechSynthesis.speak(utter);
  } catch (_) {
    // Best-effort — if this fails, speech may still work depending on the browser.
  }
}
