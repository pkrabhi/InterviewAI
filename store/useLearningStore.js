import { create } from 'zustand';

const useLearningStore = create((set) => ({
  sessionId: null,
  messages:  [],
  isTyping:  false,

  setSessionId: (id)      => set({ sessionId: id }),
  addMessage:   (message) => set((state) => ({ messages: [...state.messages, message] })),
  setTyping:    (val)     => set({ isTyping: val }),
  resetSession: ()        => set({ sessionId: null, messages: [], isTyping: false }),
}));

export default useLearningStore;
