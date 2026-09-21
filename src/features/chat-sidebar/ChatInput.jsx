import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Paperclip, Mic, MicOff, Send, Cpu, ChevronDown, FileText, X } from 'lucide-react';
import Button from '../../components/Button';
import SuggestionList from './Suggestion';
import { useUIStore } from '../../stores/useUIStore';
import { getConnectedLLMModels } from '../../utils/llmConnectionService';

const DEFAULT_WORKFLOW_SUGGESTIONS = [
  "Build a Market Research Workflow",
  "Parse resume -> Extract skills -> Auto-fill job portals -> Send HR email",
  "E-Commerce product description generator",
  "Customer support ticket classifier & auto-responder",
  "SEO content writer & summary pipeline",
  "Code review & security vulnerability scanner",
];

export default function ChatInput({ onSend, suggestions = DEFAULT_WORKFLOW_SUGGESTIONS }) {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const selectedModel = useUIStore((s) => s.selectedModel);
  const setSelectedModel = useUIStore((s) => s.setSelectedModel);

  const modelOptions = useMemo(() => getConnectedLLMModels(), []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const baseTextRef = useRef('');

  // Speech Recognition Handler
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
      return;
    }

    try {
      baseTextRef.current = text.trim();
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' ';
          } else {
            interimTranscript += res[0].transcript + ' ';
          }
        }
        const sessionTranscript = (finalTranscript + interimTranscript).replace(/\s+/g, ' ').trim();
        if (sessionTranscript) {
          const base = baseTextRef.current;
          setText(base ? `${base} ${sessionTranscript}` : sessionTranscript);
        }
      };

      recognition.onerror = (err) => {
        console.warn('[SpeechRecognition Error]', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn('[SpeechRecognition Start Failed]', err);
      setIsListening(false);
    }
  };

  // File Upload Handler
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setAttachedFiles((prev) => [...prev, ...files]);
    // Reset file input value so same file can be re-selected if deleted
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (indexToRemove) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const canSend = text.trim().length > 0 || attachedFiles.length > 0;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (overrideText) => {
    const rawText = (overrideText || text).trim();
    if (!rawText && attachedFiles.length === 0) return;

    let finalPrompt = rawText;
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map((f) => f.name).join(', ');
      finalPrompt = rawText
        ? `[Attached Files: ${fileNames}]\n\n${rawText}`
        : `[Attached Files: ${fileNames}] Please inspect these files and assist with my workflow.`;
    }

    onSend?.(finalPrompt);
    setText('');
    setAttachedFiles([]);
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
    }
  };

  const handleSelectSuggestion = (suggestionText) => {
    handleSubmit(suggestionText);
  };

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [text]);

  return (
    <div className="bg-white border-t border-gray-200 p-3 space-y-2 select-none">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {/* Suggestion Row */}
      <SuggestionList suggestions={suggestions} onSelect={handleSelectSuggestion} />

      <div className="bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
        {/* Attached Files Chips */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-1 mb-1.5 border-b border-gray-100">
            {attachedFiles.map((file, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-lg">
                <FileText className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate max-w-[110px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="hover:text-red-500 transition-colors p-0.5 outline-none"
                  title="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... Speak into your microphone" : "Ask, build,... (Shift + Enter for new line)"}
          rows={1}
          className={`w-full resize-none bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 px-2 py-1 min-h-[32px] max-h-[120px] scrollbar-thin ${isListening ? 'placeholder-red-500 font-medium' : ''}`}
        />
        
        <div className="flex items-center justify-between mt-1 px-1 border-t border-gray-50 pt-2 gap-1.5 min-w-0">
          <div className="flex items-center gap-1 shrink min-w-0">
            {/* Paperclip / File Upload Button */}
            <button
              type="button"
              onClick={handleFileClick}
              className={`p-1.5 rounded-lg transition-colors outline-none shrink-0 ${attachedFiles.length > 0 ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Mic / Speech Input Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-1.5 rounded-lg transition-all outline-none shrink-0 ${isListening ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Model Selector Dropdown - compact & truncated to prevent overflow */}
            <div className="relative flex items-center min-w-0 max-w-[125px]">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium transition-all group cursor-pointer relative w-full overflow-hidden">
                <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-transparent text-[11px] font-medium text-gray-800 outline-none cursor-pointer appearance-none pr-3 select-none truncate w-full"
                  title="Select AI Model"
                >
                  {modelOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 pointer-events-none absolute right-1 shrink-0 bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Always Clickable Send Button when prompt text or files attached */}
          <Button
            variant="primary"
            size="sm"
            disabled={!canSend}
            onClick={() => handleSubmit()}
            className={`rounded-lg px-3.5 py-1.5 shrink-0 transition-all ${canSend ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs' : 'opacity-50 cursor-not-allowed'}`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
