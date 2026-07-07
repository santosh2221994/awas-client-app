import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';
import Button from '../../components/Button';

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText('');
  };

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [text]);

  return (
    <div className="bg-white border-t border-gray-200 p-3">
      <div className="bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask, build,... (Shift + Enter for new line)"
          rows={1}
          className="w-full resize-none bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 px-2 py-1 min-h-[32px] max-h-[120px] scrollbar-thin"
        />
        
        <div className="flex items-center justify-between mt-1 px-1 border-t border-gray-50 pt-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors outline-none"
              title="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors outline-none"
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={!text.trim()}
            onClick={handleSubmit}
            className="rounded-lg px-3 py-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
