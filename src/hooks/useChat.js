import { useRef } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { streamChatResponse } from '../api/services/chatService';

export function useChat(agentId) {
  const messages = useChatStore((s) => s.sessions.find((sess) => sess.id === s.activeSessionId)?.messages ?? []);
  const isLoading = useChatStore((s) => s.isLoading);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const clearChat = useChatStore((s) => s.clearChat);
  const updateMessageContent = useChatStore((s) => s.updateMessageContent);
  const updateMessageReasoning = useChatStore((s) => s.updateMessageReasoning);
  const setMessageUsage = useChatStore((s) => s.setMessageUsage);

  const resolvedAgentId = agentId || 'studio-chat-agent';
  const threadIdRef = useRef(crypto.randomUUID());

  async function send(text) {
    if (!text?.trim()) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // 1. Add user message immediately
    addMessage(userMsg);
    setLoading(true);

    // 2. Create a blank in-flight assistant message for streaming into
    const assistantMsgId = crypto.randomUUID();
    const assistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      reasoning: '',
      usage: null,
      timestamp: Date.now(),
      isStreaming: true,
    };
    addMessage(assistantMsg);

    // 3. Build the message history for the API call
    const { sessions, activeSessionId } = useChatStore.getState();
    const history = sessions.find((s) => s.id === activeSessionId)?.messages ?? [];
    // Include all messages up to (but not the new blank assistant) in history
    const raw = [
      ...history
        .filter((m) => m.id !== assistantMsgId && m.id !== userMsg.id)
        .map(({ role, content }) => ({ role, content })),
      { role: 'user', content: text },
    ];
    // Deduplicate consecutive same-role messages
    const apiMessages = raw.filter(
      (msg, i) => i === 0 || msg.role !== raw[i - 1].role
    );

    try {
      await streamChatResponse(resolvedAgentId, apiMessages, threadIdRef.current, {
        onToken: (tokenText) => {
          updateMessageContent(assistantMsgId, tokenText);
        },
        onReasoning: (reasoningText) => {
          updateMessageReasoning(assistantMsgId, reasoningText);
        },
        onUsage: (usage) => {
          setMessageUsage(assistantMsgId, usage);
        },
        onDone: () => {
          // Mark streaming as complete by removing the isStreaming flag
          useChatStore.setState((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                    ),
                  }
                : s
            ),
          }));
        },
        onError: (err) => {
          console.error('[useChat] stream error:', err);
          // Replace blank assistant message with error text
          useChatStore.setState((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, content: `⚠️ Error: ${err?.message ?? 'Stream failed'}`, isStreaming: false }
                        : m
                    ),
                  }
                : s
            ),
          }));
        },
      });
    } finally {
      // Safety net: always clear isStreaming even if onDone wasn't emitted
      useChatStore.setState((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === state.activeSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                ),
              }
            : s
        ),
      }));
      setLoading(false);
    }
  }

  return {
    messages,
    isLoading,
    send,
    clearChat,
  };
}
