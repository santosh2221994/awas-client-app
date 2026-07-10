import { useChatStore } from '../stores/useChatStore';
import { generateAgentResponse } from '../api/services/chatService';

export function useChat(agentId) {
  const messages = useChatStore((s) => s.messages);
  const warnings = useChatStore((s) => s.warnings);
  const suggestions = useChatStore((s) => s.suggestions);
  const isLoading = useChatStore((s) => s.isLoading);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const dismissWarning = useChatStore((s) => s.dismissWarning);
  const dismissSuggestion = useChatStore((s) => s.dismissSuggestion);
  const clearChat = useChatStore((s) => s.clearChat);

  async function send(text) {
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setLoading(true);

    try {
      const history = useChatStore.getState().messages;
      const apiMessages = [...history, userMsg].map(({ role, content }) => ({ role, content }));
      const response = await generateAgentResponse(agentId, apiMessages);
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response?.text ?? response?.content ?? JSON.stringify(response),
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);
    } catch (err) {
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err.message ?? 'Request failed'}`,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  }

  function dismiss(id) {
    dismissWarning(id);
    dismissSuggestion(id);
  }

  function runAutomation() {
    send('Run the current automation');
  }

  return {
    messages,
    warnings,
    suggestions,
    isLoading,
    send,
    dismiss,
    clearChat,
    runAutomation,
  };
}
