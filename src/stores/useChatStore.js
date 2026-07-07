import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  warnings: [],
  suggestions: [],
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) => set({ messages }),

  addWarning: (warning) =>
    set((state) => ({ warnings: [...state.warnings, warning] })),

  dismissWarning: (id) =>
    set((state) => ({
      warnings: state.warnings.filter((w) => w.id !== id),
    })),

  addSuggestion: (suggestion) =>
    set((state) => ({ suggestions: [...state.suggestions, suggestion] })),

  dismissSuggestion: (id) =>
    set((state) => ({
      suggestions: state.suggestions.filter((s) => s.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  clearChat: () => set({ messages: [], warnings: [], suggestions: [] }),
}));
