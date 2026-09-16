import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import ReasoningPanel from './ReasoningPanel';
import { Zap, CheckCircle2, Play, Sparkles, Bot, Plus, Search } from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useUIStore } from '../../stores/useUIStore';
import { saveWorkflow } from '../../api/services/workflowService';

/**
 * Extracts and validates workflow/node JSON schema from assistant messages.
 * Strips raw action tags [CANVAS_ACTION] from the user-facing text.
 */
/**
 * Extracts and validates workflow/node JSON schema from assistant messages.
 * Handles: [CANVAS_ACTION] tags, markdown code blocks, inline JSON arrays,
 * partial streaming fragments, addTask format, and canvasDefinition payloads.
 */
function extractAndValidateNodeSchema(content) {
  if (!content || typeof content !== 'string') return { actions: null, cleanText: content };

  // Strip entire [CANVAS_ACTION]...[/CANVAS_ACTION] blocks, or [CANVAS_ACTION] ... to end of string
  let cleanText = content
    .replace(/\[(?:CANVAS_ACTION|AGENT_ACTION)\][\s\S]*?\[\/(?:CANVAS_ACTION|AGENT_ACTION)\]/gi, '')
    .replace(/\[(?:CANVAS_ACTION|AGENT_ACTION)\][\s\S]*/gi, '')
    .replace(/\[\/(?:CANVAS_ACTION|AGENT_ACTION)\]/gi, '')
    .trim();
  let actions = null;

  // Helper: try to parse a string as JSON, return null on failure
  const tryParse = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  // Helper: validate a parsed actions array
  const isValidActions = (arr) =>
    Array.isArray(arr) && arr.length > 0 &&
    arr.every(item => typeof item === 'object' && item !== null && (item.action || item.name || item.type));

  try {
    // ── 1. [CANVAS_ACTION] or [AGENT_ACTION] tag format ─────────────────────
    const tagMatch = content.match(/\[(?:CANVAS_ACTION|AGENT_ACTION)\]\s*([\s\S]*?)(?:\[\/(?:CANVAS_ACTION|AGENT_ACTION)\]|$)/i);
    if (tagMatch) {
      const tagContent = tagMatch[1].trim();
      const parsed = tryParse(tagContent);
      if (parsed) {
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        if (isValidActions(arr)) {
          // cleanText is already stripped at top of function
          return { actions: arr, cleanText: cleanText || 'Action plan generated for canvas.' };
        }
      }
    }

    // ── 2. Markdown code block ```json [...] ``` ─────────────────────────────
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      const parsed = tryParse(codeBlockMatch[1].trim());
      if (parsed) {
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        if (isValidActions(arr)) {
          cleanText = content.replace(codeBlockMatch[0], '').trim();
          return { actions: arr, cleanText: cleanText || 'Action plan generated for canvas.' };
        }
        // Also handle canvasDefinition format from generateCanvasWorkflow tool
        if (parsed.canvasDefinition?.nodes?.length > 0) {
          actions = parsed.canvasDefinition.nodes.map(n => ({
            action: 'addAgent',
            name: n.label || n.id,
            description: n.config?.description || '',
            model: n.config?.model || 'gpt-4o-mini',
          }));
          if (isValidActions(actions)) {
            cleanText = content.replace(codeBlockMatch[0], '').trim();
            return { actions, cleanText: cleanText || 'Workflow generated for canvas.' };
          }
        }
      }
    }

    // ── 3. Complete JSON array: [...] anywhere in the text ───────────────────
    const fullArrayMatch = content.match(/(\[\s*\{\s*"action"[\s\S]*?\}\s*\])/i);
    if (fullArrayMatch) {
      const parsed = tryParse(fullArrayMatch[1]);
      if (parsed && isValidActions(parsed)) {
        cleanText = content.replace(fullArrayMatch[0], '').trim();
        return { actions: parsed, cleanText: cleanText || 'Action plan generated for canvas.' };
      }
    }

    // ── 4. Complete single JSON object with action field ─────────────────────
    const singleObjMatch = content.match(/(\{\s*"action"[\s\S]*?\})/i);
    if (singleObjMatch) {
      const parsed = tryParse(singleObjMatch[1]);
      if (parsed && isValidActions([parsed])) {
        cleanText = content.replace(singleObjMatch[0], '').trim();
        return { actions: [parsed], cleanText: cleanText || 'Action generated for canvas.' };
      }
    }

    // ── 5. Partial / streaming fragment recovery ─────────────────────────────
    // The AI may stream fragments like:  }, {"action": "addTask", ...}]
    // Try to recover by finding all complete {...} objects inside the text
    const objectMatches = [...content.matchAll(/\{\s*"action"\s*:\s*"[^"]+"[^}]*\}/g)];
    if (objectMatches.length > 0) {
      const recovered = [];
      for (const m of objectMatches) {
        const parsed = tryParse(m[0]);
        if (parsed && (parsed.action || parsed.name || parsed.type)) recovered.push(parsed);
      }
      if (recovered.length > 0) {
        // Strip the matched JSON fragments from the display text
        cleanText = content;
        for (const m of objectMatches) cleanText = cleanText.replace(m[0], '');
        cleanText = cleanText.replace(/[,\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
        return { actions: recovered, cleanText: cleanText || 'Action plan generated for canvas.' };
      }
    }

    // ── 6. addTask format: {"action":"addTask","id":...,"agentId":...,"description":...}
    // These don't have a top-level "name" but are still valid canvas actions
    const taskObjectMatches = [...content.matchAll(/\{\s*"action"\s*:\s*"addTask"[\s\S]*?\}/g)];
    if (taskObjectMatches.length > 0) {
      const recovered = [];
      for (const m of taskObjectMatches) {
        const parsed = tryParse(m[0]);
        if (parsed?.action) recovered.push(parsed);
      }
      if (recovered.length > 0) {
        cleanText = content;
        for (const m of taskObjectMatches) cleanText = cleanText.replace(m[0], '');
        cleanText = cleanText.replace(/[,\[\]{}\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
        return { actions: recovered, cleanText: cleanText || 'Workflow tasks generated for canvas.' };
      }
    }

  } catch (err) {
    console.warn('[extractAndValidateNodeSchema] Error parsing action JSON', err);
  }

  return { actions: null, cleanText };
}


export default function ChatMessage({ message, isThinking = false, messageIndex = 0 }) {
  const { role, content, type, timestamp, reasoning, usage, isStreaming } = message;
  const isUser = role === 'user';
  const isCode = type === 'code';
  const [isApplied, setIsApplied] = useState(false);

  const { actions: nodeActions, cleanText } = useMemo(() => {
    if (isUser || isCode) return { actions: null, cleanText: content };
    return extractAndValidateNodeSchema(content);
  }, [content, isUser, isCode]);

  const isBuildAction = useMemo(() => {
    if (!nodeActions) return false;
    const buildTypes = ['addAgent', 'addNode', 'addTask', 'connectEdges', 'generateCanvasWorkflow'];
    return nodeActions.some(a => buildTypes.includes(a.action));
  }, [nodeActions]);

  const isCheckingExisting = useMemo(() => {
    if (isUser) return false;
    if (nodeActions?.some(a => a.action === 'checkExistingAgents')) return true;
    const lower = (content || '').toLowerCase();
    return lower.includes('checkexistingagents') || (lower.includes('search') && lower.includes('agent'));
  }, [isUser, nodeActions, content]);

  const matchedExistingAgents = useMemo(() => {
    if (!isCheckingExisting) return [];
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('custom_agents') : null;
      const customList = stored ? JSON.parse(stored) : [];
      const combined = [...customList];
      const seen = new Set();
      return combined.filter(a => {
        const name = a.name || 'Agent';
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
    } catch {
      return [];
    }
  }, [isCheckingExisting]);

  const handleSelectExisting = (ag) => {
    useCanvasStore.getState().applyNodeActions([{ action: 'openWorkflow', agent: ag.name }]);
    setIsApplied(true);
  };

  const handleCreateNewAgent = () => {
    const textarea = document.querySelector('textarea[placeholder*="Shift + Enter"], textarea');
    if (textarea) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeSetter.call(textarea, "I want to create a new agent for this workflow. Please ask Q1-Q4 to build it.");
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      const form = textarea.closest('form');
      if (form) {
        form.requestSubmit();
      } else {
        const sendBtn = textarea.parentElement?.querySelector('button[type="submit"], button:has(svg)');
        sendBtn?.click();
      }
    } else if (nodeActions) {
      useCanvasStore.getState().applyNodeActions(nodeActions);
      setIsApplied(true);
    }
  };

  const handleConfirmAction = async () => {
    if (!nodeActions || isApplied) return;

    // Ensure the active workflow ID is set so applyNodeActions can save
    const { selectedCrewAgentId, setSelectedCrewAgentId } = useUIStore.getState();
    const canvasStore = useCanvasStore.getState();

    if (selectedCrewAgentId?.startsWith('wf-') && !canvasStore.activeWorkflowId) {
      canvasStore.setActiveWorkflowId(selectedCrewAgentId);
    }

    canvasStore.applyNodeActions(nodeActions);
    setIsApplied(true);

    // If user is not already on the canvas, navigate there
    if (!selectedCrewAgentId?.startsWith('wf-')) {
      // Create a new workflow in MongoDB and navigate into it
      const wfId = `wf-${Date.now()}`;
      const firstName = nodeActions.find(a => a.name)?.name || 'New Workflow';
      canvasStore.setActiveWorkflowId(wfId);
      await canvasStore.saveWorkflowCanvas(wfId, firstName);
      setSelectedCrewAgentId(wfId);
    }
  };

  const formatContent = (text) => {
    if (!text) return null;
    // Split on newlines first, then apply inline markdown to each line
    const lines = text.split('\n');
    const result = [];
    lines.forEach((line, lineIdx) => {
      if (lineIdx > 0) result.push(<br key={`br-${lineIdx}`} />);
      // Apply inline markdown: **bold** and `code`
      const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      parts.forEach((part, partIdx) => {
        const key = `${lineIdx}-${partIdx}`;
        if (part.startsWith('**') && part.endsWith('**')) {
          result.push(<strong key={key} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>);
        } else if (part.startsWith('`') && part.endsWith('`')) {
          result.push(<code key={key} className="font-mono text-xs bg-gray-100 text-indigo-600 px-1 py-0.5 rounded">{part.slice(1, -1)}</code>);
        } else {
          result.push(<React.Fragment key={key}>{part}</React.Fragment>);
        }
      });
    });
    return result;
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
            isThinking={isThinking || (isStreaming && !content)}
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
            {/* Renaming project header line */}
            {!isUser && isBuildAction && nodeActions[0]?.name && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Renaming project to {nodeActions[0].name}</span>
              </div>
            )}

            {isUser ? content : formatContent(cleanText)}

            {/* CrewAI Studio v2 "What was created" Table Card */}
            {!isUser && isBuildAction && nodeActions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-zinc-200/80 space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">
                    Here's your <strong className="text-indigo-600">{nodeActions[0]?.name || 'Agent'}</strong> automation, fully built! 🎉
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>What was created</span>
                  </div>

                  <div className="overflow-hidden border border-zinc-200 rounded-xl bg-white text-xs shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-zinc-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                          <th className="px-3 py-2 w-1/3">Component</th>
                          <th className="px-3 py-2 w-2/3">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-[11px] text-gray-700">
                        {nodeActions.map((act, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 font-bold text-gray-900 font-sans">
                              {act.name || act.title || `Agent ${idx + 1}`}
                            </td>
                            <td className="px-3 py-2 text-gray-600 leading-normal">
                              {act.description || act.role || `Executes workflow tasks.`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>


              </div>
            )}

            {/* Interactive Agent Repository Match Card */}
            {!isUser && isCheckingExisting && (
              <div className="mt-3 p-3 bg-indigo-50/90 border border-indigo-200 rounded-2xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <Bot className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-indigo-950">Agent Repository Check</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {matchedExistingAgents.length} Found
                  </span>
                </div>

                <p className="text-xs text-indigo-900 leading-relaxed">
                  We checked your existing agent repository for matching capabilities:
                </p>

                {matchedExistingAgents.length > 0 ? (
                  <div className="space-y-1.5">
                    {matchedExistingAgents.map((ag) => (
                      <div key={ag.id || ag.name} className="flex items-center justify-between p-2 bg-white border border-indigo-100 rounded-xl shadow-2xs">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-gray-900 truncate">{ag.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{ag.description || ag.role || 'Available in repository'}</p>
                        </div>
                        <button
                          onClick={() => handleSelectExisting(ag)}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 rounded-lg transition-all shrink-0 cursor-pointer"
                        >
                          Use Existing
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 bg-white border border-indigo-100 rounded-xl text-xs text-gray-500">
                    No matching agents found in repository.
                  </div>
                )}

                <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-indigo-900 font-semibold">Or build a custom workflow:</span>
                  <button
                    onClick={handleCreateNewAgent}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Agent</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interactive Confirm & Apply to Canvas Button */}
        {!isUser && isBuildAction && !isStreaming && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleConfirmAction}
              disabled={isApplied}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs select-none',
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
