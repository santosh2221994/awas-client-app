import { useEffect } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { streamChatResponse } from '../api/services/chatService';
import { getThreadMessages } from '../api/services/agentService';

export function useChat(agentId) {
  const resolvedAgentId = agentId || 'studio-chat-agent';

  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const isLoading = useChatStore((s) => s.isLoading);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const clearChat = useChatStore((s) => s.clearChat);
  const updateMessageContent = useChatStore((s) => s.updateMessageContent);
  const updateMessageReasoning = useChatStore((s) => s.updateMessageReasoning);
  const setMessageUsage = useChatStore((s) => s.setMessageUsage);
  const newChat = useChatStore((s) => s.newChat);
  const switchSession = useChatStore((s) => s.switchSession);

  // Filter sessions for this agent
  const agentSessions = sessions.filter((s) => s.agentId === resolvedAgentId);

  // Find current session for this agent
  let currentSession = agentSessions.find((s) => s.id === activeSessionId);
  if (!currentSession && agentSessions.length > 0) {
    currentSession = agentSessions[0];
  }

  useEffect(() => {
    if (agentSessions.length === 0) {
      newChat(resolvedAgentId);
    } else if (currentSession && currentSession.id !== activeSessionId) {
      switchSession(currentSession.id);
    }
  }, [resolvedAgentId, agentSessions.length, currentSession?.id, activeSessionId, newChat, switchSession]);

  const messages = currentSession?.messages ?? [];
  const threadId = currentSession?.id || 'default-thread';

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
    const { sessions: currentSessions, activeSessionId: currentActiveSessionId } = useChatStore.getState();
    const history = currentSessions.find((s) => s.id === currentActiveSessionId)?.messages ?? [];
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
      await streamChatResponse('studio-chat-agent', apiMessages, threadId, {
        onToken: (tokenText) => {
          updateMessageContent(assistantMsgId, tokenText);
        },
        onReasoning: (reasoningText) => {
          updateMessageReasoning(assistantMsgId, reasoningText);
        },
        onUsage: (usage) => {
          setMessageUsage(assistantMsgId, usage);
        },
        onDone: async () => {
          // Wait 150ms for backend database write to finish
          await new Promise((r) => setTimeout(r, 150));
          try {
            const msgs = await getThreadMessages(threadId);
            // The last assistant message in the thread is the one we just generated
            const dbMsgs = msgs.filter((m) => m.content?.parts?.some((p) => p.type === 'text'));
            const lastDbMsg = dbMsgs[dbMsgs.length - 1];
            const usagePart = lastDbMsg?.content?.parts?.find((p) => p.type === 'usage');
            const usage = usagePart ? usagePart.usage : null;

            useChatStore.setState((state) => ({
              sessions: state.sessions.map((s) =>
                s.id === state.activeSessionId
                  ? {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMsgId
                          ? { ...m, isStreaming: false, usage: usage ? { ...m.usage, ...usage } : m.usage }
                          : m
                      ),
                    }
                  : s
              ),
            }));
          } catch (err) {
            console.error('Failed to get thread usage on done:', err);
            // fallback: mark streaming as complete
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
          }
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
