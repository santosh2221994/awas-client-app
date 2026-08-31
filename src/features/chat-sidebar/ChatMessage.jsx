import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import ReasoningPanel from './ReasoningPanel';
import { Zap, CheckCircle2, Play } from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';

/**
 * Extracts and validates workflow/node JSON schema from assistant messages.
 * Strips raw action tags [CANVAS_ACTION] from the user-facing text.
 */
function extractAndValidateNodeSchema(content) {
  if (!content || typeof content !== 'string') return { actions: null, cleanText: content };

  let cleanText = content;
  let actions = null;

  try {
    // 1. Check for [CANVAS_ACTION] tag format e.g. [CANVAS_ACTION] {"action":"addAgent"...}
    const canvasTagMatch = content.match(/\[CANVAS_ACTION\]\s*(\{[\s\S]*?\}|\[[\s\S]*?\])/i);
    if (canvasTagMatch) {
      cleanText = content.replace(/\[CANVAS_ACTION\]\s*(\{[\s\S]*?\}|\[[\s\S]*?\])/gi, '').trim();
      const parsed = JSON.parse(canvasTagMatch[1]);
      actions = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      // 2. Match markdown code block ```json [...] ``` or inline JSON
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                        content.match(/(?:json\s*)?(\[\s*\{\s*"action"[\s\S]*\}\s*\])/i) ||
                        content.match(/(?:json\s*)?(\{\s*"action"[\s\S]*?\})/i);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        actions = Array.isArray(parsed) ? parsed : [parsed];
        cleanText = content.replace(jsonMatch[0], '').trim();
      }
    }

    if (actions) {
      const isValid = actions.length > 0 && actions.every(item => 
        typeof item === 'object' && item !== null && (item.action || item.name || item.type)
      );

      if (isValid) {
        return { actions, cleanText: cleanText || 'Action plan generated for canvas.' };
      }
    }
  } catch (err) {
    console.warn('[extractAndValidateNodeSchema] Error parsing action JSON', err);
  }

  return { actions: null, cleanText: content };
}

export default function ChatMessage({ message, isThinking = false }) {
  const { role, content, type, timestamp, reasoning, usage, isStreaming } = message;
  const isUser = role === 'user';
  const isCode = type === 'code';
  const [isApplied, setIsApplied] = useState(false);

  const { actions: nodeActions, cleanText } = useMemo(() => {
    if (isUser || isCode) return { actions: null, cleanText: content };
    return extractAndValidateNodeSchema(content);
  }, [content, isUser, isCode]);

  const handleConfirmAction = () => {
    if (!nodeActions || isApplied) return;
    useCanvasStore.getState().applyNodeActions(nodeActions);
    setIsApplied(true);
  };

  const formatContent = (text) => {
    if (!text) return null;
    // Basic Markdown parser for **bold** text and `inline code`
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="font-mono text-xs bg-gray-100 text-indigo-600 px-1 py-0.5 rounded">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const totalTokens = usage ? (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0) : null;

  return (
    <div className={cn('flex w-full mb-3 group', isUser ? 'justify-end' : 'justify-start')}>
      <div className="flex flex-col max-w-[85%]">
        {/* Reasoning / thinking panel for assistant messages */}
        {!isUser && (
          <ReasoningPanel
            isThinking={isThinking || (isStreaming && !content && !reasoning)}
            reasoning={reasoning}
          />
        )}

        {isCode ? (
          <div 
            className="font-mono text-xs bg-gray-800 text-emerald-400 rounded-xl px-4 py-3 shadow-sm border border-gray-700/50 whitespace-pre overflow-x-auto scrollbar-thin"
          >
            {content}
          </div>
        ) : (
          <div
            className={cn(
              'px-4 py-2.5 text-sm leading-relaxed shadow-sm',
              isUser
                ? 'bg-gray-900 text-white rounded-2xl rounded-tr-none'
                : 'bg-zinc-50 text-zinc-800 rounded-2xl rounded-tl-none border border-zinc-200'
            )}
          >
            {isUser ? content : formatContent(cleanText)}
            {/* Blinking cursor during active streaming */}
            {!isUser && isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 align-middle animate-pulse" />
            )}
          </div>
        )}

        {/* Interactive Confirm & Apply to Canvas Button */}
        {!isUser && nodeActions && !isStreaming && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleConfirmAction}
              disabled={isApplied}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs select-none',
                isApplied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:shadow-md cursor-pointer active:scale-95'
              )}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Applied to Canvas</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Confirm & Apply to Canvas</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Token usage pill — shown below completed assistant messages */}
        {!isUser && totalTokens !== null && !isStreaming && (
          <div className="flex items-center gap-1.5 mt-1 px-1 select-none">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] text-amber-600 font-mono">
              {totalTokens.toLocaleString()} tokens
            </span>
            {usage?.duration && (
              <span className="text-[10px] text-gray-500 font-mono ml-0.5">
                {usage.duration}
              </span>
            )}
            {usage && (
              <span className="text-[10px] font-mono ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-1 select-none">
                <span className="text-indigo-500">Input: {(usage.promptTokens ?? 0).toLocaleString()}</span>
                <span className="text-gray-400">/</span>
                <span className="text-emerald-500">Output: {(usage.completionTokens ?? 0).toLocaleString()}</span>
              </span>
            )}
          </div>
        )}

        {isUser && formattedTime && (
          <span className="text-[10px] text-gray-400 mt-0.5 px-1 text-right">
            {formattedTime}
          </span>
        )}

        {!isUser && totalTokens === null && formattedTime && (
          <span className="text-[10px] text-gray-400 mt-0.5 px-1 text-left">
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}
