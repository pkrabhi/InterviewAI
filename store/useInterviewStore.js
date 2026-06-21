import { create } from 'zustand';

// Global state for the current interview session.
// Phase 5 will expand this with real API data.
const useInterviewStore = create((set) => ({
  // Setup choices
  role:      null,
  level:     null,
  type:      null,
  jdText:    '',

  // Active session
  sessionId: null,
  messages:  [],

  // Actions
  setSetup: (role, level, type, jdText) => set({ role, level, type, jdText }),
  setSessionId: (sessionId) => set({ sessionId }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  resetSession: () => set({ sessionId: null, messages: [], role: null, level: null, type: null, jdText: '' }),
}));

export default useInterviewStore;
