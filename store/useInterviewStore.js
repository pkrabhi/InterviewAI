import { create } from 'zustand';

const useInterviewStore = create((set) => ({
  sessionId:    null,
  messages:     [],
  isTyping:     false,
  isComplete:   false,
  sessionConfig: null,

  setSessionId:     (id)       => set({ sessionId: id }),
  setSessionConfig: (config)   => set({ sessionConfig: config }),
  addMessage:       (message)  => set((state) => ({ messages: [...state.messages, message] })),
  setTyping:        (val)      => set({ isTyping: val }),
  setComplete:      (val)      => set({ isComplete: val }),
  resetSession:     ()         => set({
    sessionId: null,
    messages: [],
    isTyping: false,
    isComplete: false,
    sessionConfig: null,
  }),
}));

export default useInterviewStore;
