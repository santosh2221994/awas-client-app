import { useChatStore } from '../stores/useChatStore';

export function useChat() {
  const messages = useChatStore((s) => s.messages);
  const warnings = useChatStore((s) => s.warnings);
  const suggestions = useChatStore((s) => s.suggestions);
  const isLoading = useChatStore((s) => s.isLoading);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const dismissWarning = useChatStore((s) => s.dismissWarning);
  const dismissSuggestion = useChatStore((s) => s.dismissSuggestion);
  const clearChat = useChatStore((s) => s.clearChat);

  function send(text) {
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setLoading(true);

    setTimeout(() => {
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Understood. I'll process your request: "${text}"`,
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);
      setLoading(false);
    }, 1000);
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
