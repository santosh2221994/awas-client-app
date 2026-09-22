import React, { useState, useMemo } from 'react';
import { Bot, User, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useUIStore } from '../../stores/useUIStore';

function ReasoningPanel({ isThinking, reasoning }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isThinking && !reasoning) return null;

  return (
    <div className="mb-2 border border-indigo-100 bg-indigo-50/50 rounded-xl overflow-hidden font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-indigo-700 hover:bg-indigo-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isThinking ? (
            <>
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span>Thinking &amp; reasoning...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Thought process</span>
            </>
          )}
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {isOpen && reasoning && (
        <div className="px-3 py-2 text-xs text-indigo-900/80 bg-white border-t border-indigo-100 font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
          {reasoning}
        </div>
      )}
    </div>
  );
}


function extractAndValidateNodeSchema(content) {
  if (!content) return { actions: null, cleanText: '' };

  let cleanText = content;

  const tryParse = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  try {
    // ── 1. [CANVAS_ACTION] prefix format ─────────────────────────────────────
    if (content.includes('[CANVAS_ACTION]')) {
      const parts = content.split('[CANVAS_ACTION]');
      cleanText = parts[0].trim();
      const rawJson = parts[1]?.trim() || '';

      const jsonMatch = rawJson.match(/\[[\s\S]*\]/) || rawJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = tryParse(jsonMatch[0]);
        if (parsed) {
          const actionArr = Array.isArray(parsed) ? parsed : [parsed];
          return { actions: actionArr, cleanText: cleanText || 'Canvas action plan proposed.' };
        }
      }
    }

    // ── 2. ```json code block containing actions ──────────────────────────────
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      const parsed = tryParse(codeBlockMatch[1].trim());
      if (parsed) {
        let actions = null;
        if (Array.isArray(parsed) && parsed.some(a => a.action || a.name || a.type)) {
          actions = parsed;
        } else if (parsed.actions && Array.isArray(parsed.actions)) {
          actions = parsed.actions;
        } else if (parsed.action || parsed.name || parsed.type) {
          actions = [parsed];
        }
        if (actions) {
          cleanText = content.replace(/```(?:json)?\s*[\s\S]*?```/g, '').trim();
          return { actions, cleanText: cleanText || 'Canvas action plan proposed.' };
        }
      }
    }

    // ── 3. Bare JSON array: [{"action": ...}] ────────────────────────────────
    const bareArrayMatch = content.match(/\[\s*\{\s*"action"[\s\S]*\}\s*\]/);
    if (bareArrayMatch) {
      const parsed = tryParse(bareArrayMatch[0]);
      if (parsed && Array.isArray(parsed)) {
        cleanText = content.replace(bareArrayMatch[0], '').trim();
        return { actions: parsed, cleanText: cleanText || 'Canvas action plan proposed.' };
      }
    }

    // ── 4. Bare JSON object: {"action": ...} ─────────────────────────────────
    const bareObjMatch = content.match(/\{\s*"action"\s*:\s*"[^"]+"[\s\S]*?\}/);
    if (bareObjMatch) {
      const parsed = tryParse(bareObjMatch[0]);
      if (parsed && parsed.action) {
        cleanText = content.replace(bareObjMatch[0], '').trim();
        return { actions: [parsed], cleanText: cleanText || 'Canvas action plan proposed.' };
      }
    }

    // ── 5. Partial / streaming fragment recovery ─────────────────────────────
    const objectMatches = [...content.matchAll(/\{\s*"action"\s*:\s*"[^"]+"[^}]*\}/g)];
    if (objectMatches.length > 0) {
      const recovered = [];
      for (const m of objectMatches) {
        const parsed = tryParse(m[0]);
        if (parsed && (parsed.action || parsed.name || parsed.type)) recovered.push(parsed);
      }
      if (recovered.length > 0) {
        cleanText = content;
        for (const m of objectMatches) cleanText = cleanText.replace(m[0], '');
        cleanText = cleanText.replace(/[,\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
        return { actions: recovered, cleanText: cleanText || 'Action plan generated for canvas.' };
      }
    }

    // ── 6. addTask format: {"action":"addTask","id":...,"agentId":...,"description":...}
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
    return (
      lower.includes('list_repository_agents') ||
      lower.includes('agent repository') ||
      lower.includes('checkexistingagents') ||
      (lower.includes('found') && lower.includes('agent') && lower.includes('repositor'))
    );
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

    const { selectedCrewAgentId, setSelectedCrewAgentId } = useUIStore.getState();
    const canvasStore = useCanvasStore.getState();

    if (selectedCrewAgentId?.startsWith('wf-')) {
      // Ensure activeWorkflowId is set before applying
      if (!canvasStore.activeWorkflowId) {
        canvasStore.setActiveWorkflowId(selectedCrewAgentId);
      }

      // Apply nodes to canvas
      canvasStore.applyNodeActions(nodeActions);
      setIsApplied(true);

      // Explicitly save 150ms after apply so Zustand state is fully flushed.
      await new Promise((r) => setTimeout(r, 150));
      await canvasStore.saveWorkflowCanvas(selectedCrewAgentId);
    } else {
      // Not yet on a workflow — create one, apply, then save
      const wfId = `wf-${Date.now()}`;
      const firstName = nodeActions.find(a => a.name)?.name || 'New Workflow';
      canvasStore.setActiveWorkflowId(wfId);
      canvasStore.applyNodeActions(nodeActions);
      setIsApplied(true);

      // Wait for state flush then save
      await new Promise((r) => setTimeout(r, 150));
      await canvasStore.saveWorkflowCanvas(wfId, firstName);
      setSelectedCrewAgentId(wfId);
    }
  };

  const formatContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const result = [];
    lines.forEach((line, lineIdx) => {
      if (lineIdx > 0) result.push(<br key={`br-${lineIdx}`} />);
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
                    Here's your <strong className="text-indigo-600">{nodeActions[0]?.name || 'Agent'}</strong> automation proposal! 🚀
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Click <strong>Apply to Canvas</strong> below to display these agents on your workflow canvas.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Proposed Workflow Components</span>
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

        {/* Interactive Manual Confirm & Apply to Canvas Button */}
        {!isUser && isBuildAction && !isStreaming && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleConfirmAction}
              disabled={isApplied}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm select-none',
                isApplied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:shadow-md cursor-pointer active:scale-95'
              )}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Applied to Canvas</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Apply to Canvas</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
