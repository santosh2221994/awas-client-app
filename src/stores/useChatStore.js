import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const newSession = (label) => ({
  id: `session-${Date.now()}`,
  label: label || `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
  messages: [],
  createdAt: Date.now(),
});

export const useChatStore = create(
  persist(
    (set, get) => {
      const initial = newSession('New Chat');
      return {
        sessions: [initial],
        activeSessionId: initial.id,
        warnings: [],
        suggestions: [],
        isLoading: false,

        addMessage: (message) =>
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? { ...s, messages: [...s.messages, message] }
                : s
            ),
          })),

        setMessages: (messages) =>
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId ? { ...s, messages } : s
            ),
          })),

        newChat: () => {
          const session = newSession();
          set((state) => ({ sessions: [session, ...state.sessions], activeSessionId: session.id }));
        },

        switchSession: (id) => set({ activeSessionId: id }),

        addWarning: (warning) =>
          set((state) => ({ warnings: [...state.warnings, warning] })),

        dismissWarning: (id) =>
          set((state) => ({ warnings: state.warnings.filter((w) => w.id !== id) })),

        addSuggestion: (suggestion) =>
          set((state) => ({ suggestions: [...state.suggestions, suggestion] })),

        dismissSuggestion: (id) =>
          set((state) => ({ suggestions: state.suggestions.filter((s) => s.id !== id) })),

        setLoading: (isLoading) => set({ isLoading }),

        clearChat: () =>
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId ? { ...s, messages: [] } : s
            ),
            warnings: [],
            suggestions: [],
          })),
      };
    },
    {
      name: 'awas-chat-sessions',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
