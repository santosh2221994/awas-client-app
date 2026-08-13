import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const newSession = (label, agentId) => ({
  id: `session-${Date.now()}`,
  label: label || `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
  messages: [],
  createdAt: Date.now(),
  agentId: agentId || 'studio-chat-agent',
});

export const useChatStore = create(
  persist(
    (set, get) => {
      const initial = newSession('New Chat', 'studio-chat-agent');
      return {
        sessions: [initial],
        activeSessionId: initial.id,
        warnings: [],
        suggestions: [],
        isLoading: false,
        streamingMessageId: null, // tracks the in-flight assistant message id

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

        /**
         * Append a token chunk to an in-flight assistant message content.
         */
        updateMessageContent: (messageId, textChunk) =>
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === messageId
                        ? { ...m, content: (m.content ?? '') + textChunk }
                        : m
                    ),
                  }
                : s
            ),
          })),

        /**
         * Append a reasoning/thinking chunk to an in-flight assistant message.
         */
        updateMessageReasoning: (messageId, reasoningChunk) =>
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === messageId
                        ? { ...m, reasoning: (m.reasoning ?? '') + reasoningChunk }
                        : m
                    ),
                  }
                : s
            ),
          })),

        /**
         * Stamp token usage onto a completed assistant message.
         */
        setMessageUsage: (messageId, usage) =>
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === messageId ? { ...m, usage } : m
                    ),
                  }
                : s
            ),
          })),

        newChat: (agentId) => {
          const session = newSession(null, agentId);
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

        setStreamingMessageId: (id) => set({ streamingMessageId: id }),

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
