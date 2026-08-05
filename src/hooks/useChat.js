import { useRef } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { generateAgentResponse } from '../api/services/chatService';

export function useChat(agentId) {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const clearChat = useChatStore((s) => s.clearChat);
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
    setLoading(true);

    try {
      const history = useChatStore.getState().messages;
      const raw = [
        ...history.map(({ role, content }) => ({ role, content })),
        { role: 'user', content: text },
      ];
      const apiMessages = raw.filter(
        (msg, i) => i === 0 || msg.role !== raw[i - 1].role
      );
      addMessage(userMsg);
      const response = await generateAgentResponse(resolvedAgentId, apiMessages, threadIdRef.current);
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response?.text ?? response?.content ?? JSON.stringify(response),
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);
    } catch (err) {
      console.error('[Studio Chat] generate failed:', err);
    } finally {
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
