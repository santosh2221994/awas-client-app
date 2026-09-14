import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import ReasoningPanel from './ReasoningPanel';
import { Zap, CheckCircle2, Play, Sparkles, Bot, Plus, Search } from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';

/**
 * Extracts and validates workflow/node JSON schema from assistant messages.
 * Strips raw action tags [CANVAS_ACTION] from the user-facing text.
 */
function extractAndValidateNodeSchema(content) {
  if (!content || typeof content !== 'string') return { actions: null, cleanText: content };

  let cleanText = content.replace(/\[\/?(CANVAS_ACTION|AGENT_ACTION)\]/gi, '').trim();
  let actions = null;

  try {
    // 1. Check for [CANVAS_ACTION] or [AGENT_ACTION] tag format
    const tagMatch = content.match(/\[(?:CANVAS_ACTION|AGENT_ACTION)\]\s*(\{[\s\S]*?\}|\[[\s\S]*?\])/i);
    if (tagMatch) {
      cleanText = content.replace(/\[\/?(CANVAS_ACTION|AGENT_ACTION)\]\s*(\{[\s\S]*?\}|\[[\s\S]*?\])?/gi, '').trim();
      const parsed = JSON.parse(tagMatch[1]);
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
        cleanText = content.replace(jsonMatch[0], '').replace(/\[\/?CANVAS_ACTION\]/gi, '').trim();
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

  // 3. Fallback for prompt instructions, plan summaries, or confirmation messages
  if (content.includes('CANVAS_ACTION') || content.toLowerCase().includes('plan summary') || content.toLowerCase().includes('summary of the plan') || content.toLowerCase().includes('create a plan') || content.toLowerCase().includes('confirm') || content.toLowerCase().includes('github')) {
    const lower = content.toLowerCase();

    if (lower.includes('github') || lower.includes('issue')) {
      actions = [
        {
          action: 'addAgent',
          name: 'GitHub Issue Analyzer',
          title: 'GitHub Issue Analyzer',
          role: 'Issue Classification Specialist',
          model: 'gpt-4o-mini',
          description: 'Fetches latest open issues from specified GitHub repository and classifies into bug, feature request, or documentation.',
          tools: [{ name: 'GitHub Toolkit', icon: 'FileText', connected: true }]
        },
        {
          action: 'addAgent',
          name: 'GitHub Issue Triage Manager',
          title: 'GitHub Issue Triage Manager',
          role: 'Issue Triage & Team Assignment Manager',
          model: 'gpt-4o-mini',
          description: 'Applies labels (bug, enhancement, documentation), assigns team members based on domain expertise, and posts assessment comments.',
          tools: [{ name: 'GitHub Toolkit', icon: 'FileText', connected: true }]
        }
      ];

      return { actions, cleanText: cleanText || 'Generated GitHub Issue Auto-Triage multi-agent workflow.' };
    }

    let inferredName = '';
    
    // Attempt 1: Direct agent role or name patterns
    const nameMatch = content.match(/Agent Role:\s*\*?\s*([^*\n]+)/i) || 
                      content.match(/agent\s+(?:named?|called?|is)\s+["']?([^"'\n,.]+)/i) ||
                      content.match(/create\s+a\s+["']?([^"'\n,.]+)\s+agent/i);

    if (nameMatch && nameMatch[1]) {
      inferredName = nameMatch[1].trim();
    } else {
      // Attempt 2: Extract key action from bullet points in plan (e.g., ticket, support, whatsapp, database, summary)
      if (lower.includes('ticket') || lower.includes('support')) {
        inferredName = 'Support Ticket Categorizer & Summarizer';
      } else if (lower.includes('whatsapp') || lower.includes('order')) {
        inferredName = 'WhatsApp Order Message Parser';
      } else if (lower.includes('database') || lower.includes('db')) {
        inferredName = 'Database Sync & Entry Creator';
      } else if (lower.includes('report') || lower.includes('summary')) {
        inferredName = 'Automated Summary & Report Generator';
      } else {
        // Attempt 3: Grab first bullet point text action
        const bulletMatch = content.match(/[*•-]\s*([^\n*•]+)/);
        if (bulletMatch && bulletMatch[1]) {
          inferredName = bulletMatch[1].trim().slice(0, 35);
        } else {
          inferredName = 'Task Specialist Agent';
        }
      }
    }

    actions = [{
      action: 'addAgent',
      name: inferredName,
      title: inferredName,
      role: inferredName,
      model: 'google/gemma-3-4b',
      description: `Autonomous AI agent configured for ${inferredName}.`,
      tools: []
    }];

    return { actions, cleanText: cleanText || `Action plan generated for ${inferredName}.` };
  }

  return { actions: null, cleanText };
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
      const defaults = [
        { id: 'custom-github-triage', name: 'GitHub Issue Auto-Triage', role: 'Issue Classification Specialist', description: 'Pulls closed issues, classifies them into categories, and posts summaries.' },
        { id: 'custom-support-ticket', name: 'Support Ticket Categorizer & Summarizer', role: 'Support Specialist', description: 'Categorizes support requests and aggregates recurring issues.' }
      ];
      const combined = [...customList, ...defaults];
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

  const handleConfirmAction = () => {
    if (!nodeActions || isApplied) return;

    // Persist agent to localStorage custom_agents if createAgent/addAgent action is present
    const createAct = nodeActions.find(a => a.action === 'createAgent' || a.action === 'addAgent');
    if (createAct && createAct.name) {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('custom_agents') : null;
        const existing = stored ? JSON.parse(stored) : [];
        const agentCustomId = `custom-${Date.now()}`;
        const nameStr = createAct.name;
        const typeStr = createAct.type || createAct.role || 'Assistant';
        const descStr = createAct.description || `Autonomous AI agent for ${nameStr}.`;
        const instructionsStr = createAct.instructions || 
          `You are ${nameStr}, an autonomous AI specialist for ${typeStr}.\n\n` +
          `Role & Mission:\n${descStr}\n\n` +
          `Behavior:\n- Execute tasks accurately.\n- Provide clear output.`;

        const exists = existing.some(a => a.name?.toLowerCase() === nameStr.toLowerCase());
        if (!exists) {
          const newAgentObj = {
            id: agentCustomId,
            name: nameStr,
            description: descStr,
            type: typeStr,
            model: createAct.model || 'gpt-4o-mini',
            instructions: instructionsStr,
            price: 'Free',
            rating: 5.0,
            category: typeStr,
            tools: Array.isArray(createAct.tools) ? createAct.tools : []
          };
          localStorage.setItem('custom_agents', JSON.stringify([...existing, newAgentObj]));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('agent_updated'));
          }
        }
      } catch (err) {
        console.warn('[ChatMessage] Failed to register created agent in custom_agents', err);
      }
    }

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
            {/* Renaming project header line */}
            {!isUser && nodeActions && nodeActions[0]?.name && nodeActions[0]?.action !== 'checkExistingAgents' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Renaming project to {nodeActions[0].name}</span>
              </div>
            )}

            {isUser ? content : formatContent(cleanText)}

            {/* CrewAI Studio v2 "What was created" Table Card */}
            {!isUser && nodeActions && nodeActions.length > 0 && nodeActions[0]?.action !== 'checkExistingAgents' && (
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

                {/* ⚠️ Before running warning box matching CrewAI Studio v2 */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <span>⚠️ Before running</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    <strong>Connect your GitHub account</strong> — Go to the tools & integrations panel to connect GitHub. The automation is fully built and ready; it just needs the connection to be active.
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Also make sure the labels <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">"bug"</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">"enhancement"</code>, and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">"documentation"</code> already exist in your repository (GitHub requires labels to exist before they can be applied).
                  </p>
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
        {!isUser && nodeActions && !isStreaming && (
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
