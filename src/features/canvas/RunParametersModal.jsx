import React, { useState, useEffect, useMemo } from 'react';
import { X, Paperclip, Play } from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';

function detectVariables(nodes) {
  const varSet = new Set();
  nodes.forEach((n) => {
    const data = n.data || {};
    [
      data.taskDescription, data.description, data.taskTitle, data.title,
      data.name, data.goal, data.backstory, data.expectedOutput,
      data.instructions, data.prompt, data.systemPrompt,
      data.input, data.output, data.context,
    ].filter(Boolean).forEach((text) => {
      if (typeof text !== 'string') return;
      (text.match(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g) || [])
        .forEach((m) => varSet.add(m.replace(/[{}]/g, '')));
    });
  });
  return [...varSet];
}

function buildPreviewSegments(text) {
  if (!text) return [];
  const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const segments = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex)
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    segments.push({ type: 'var', value: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length)
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  return segments;
}

function hintFromDesc(desc) {
  if (!desc) return '';
  const first = desc.split(/[.!?]/)[0].trim();
  return first.length > 80 ? first.slice(0, 77) + '...' : first;
}

export default function RunParametersModal({ isOpen, onClose, onExecute }) {
  const { nodes } = useCanvasStore();

  const detectedVars = useMemo(() => detectVariables(nodes), [nodes]);

  const agentInputs = useMemo(() => {
    const agentNodes = nodes.filter((n) => n.type === 'agentNode');
    const taskNodes  = nodes.filter((n) => n.type === 'taskNode');
    return agentNodes.map((agent, i) => {
      const rawName   = agent.data?.title || agent.data?.name || ('Agent ' + (i + 1));
      const agentName = typeof rawName === 'string' ? rawName : (rawName?.name || ('Agent ' + (i + 1)));
      const task      = taskNodes[i];
      const rawDesc   = task?.data?.taskDescription || task?.data?.description || agent.data?.description || '';
      const taskDesc  = typeof rawDesc === 'string' ? rawDesc : '';
      const key       = '__agent_' + i + '__' + String(agentName).replace(/\s+/g, '_').toLowerCase();
      return { key, agentName: String(agentName), hint: hintFromDesc(taskDesc) };
    });
  }, [nodes]);

  const hasVars   = detectedVars.length > 0;
  const hasAgents = agentInputs.length > 0;
  const [varInputs, setVarInputs] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setVarInputs((prev) => {
      const next = {};
      if (hasVars) {
        detectedVars.forEach((v) => { next[v] = prev[v] ?? ''; });
      } else if (hasAgents) {
        agentInputs.forEach(({ key }) => { next[key] = prev[key] ?? ''; });
      } else {
        next.__input = prev.__input ?? '';
      }
      return next;
    });
  }, [isOpen, hasVars, hasAgents, detectedVars, agentInputs]);

  const previewNodes = useMemo(() => {
    const agentNodes = nodes.filter((n) => n.type === 'agentNode');
    const taskNodes  = nodes.filter((n) => n.type === 'taskNode');
    const entries = [];
    let idx = 1;
    taskNodes.forEach((task, i) => {
      const agent        = agentNodes[i];
      const rawAgentName = agent?.data?.title || agent?.data?.name || '';
      const agentName    = typeof rawAgentName === 'string' ? rawAgentName : (rawAgentName?.name || '');
      const rawTaskName  = task.data?.title || task.data?.name || ('Task ' + idx);
      const taskName     = typeof rawTaskName === 'string' ? rawTaskName : ('Task ' + idx);
      const rawDesc      = task.data?.taskDescription || task.data?.description || '';
      const desc         = typeof rawDesc === 'string' ? rawDesc : '';
      entries.push({ index: idx++, name: agentName || taskName, description: desc });
    });
    if (entries.length === 0) {
      agentNodes.forEach((agent) => {
        const rawName = agent.data?.title || agent.data?.name || ('Agent ' + idx);
        const name    = typeof rawName === 'string' ? rawName : ('Agent ' + idx);
        const rawDesc = agent.data?.description || '';
        const desc    = typeof rawDesc === 'string' ? rawDesc : '';
        entries.push({ index: idx++, name, description: desc });
      });
    }
    return entries;
  }, [nodes]);

  if (!isOpen) return null;

  const handleExecute = () => onExecute(varInputs);
  const setInput = (key, val) => setVarInputs((prev) => ({ ...prev, [key]: val }));

  const inputSubtitle = hasVars
    ? 'Provide values for the required variables'
    : hasAgents
    ? 'Provide context for each agent in your workflow'
    : 'Provide an input prompt for your crew';

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition bg-white placeholder:text-gray-300';
  const clipBtnCls = 'absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Run parameters</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* LEFT — Inputs */}
          <div className="w-1/2 border-r border-gray-100 flex flex-col overflow-hidden">
            <div className="px-7 pt-6 pb-2 shrink-0">
              <h3 className="text-sm font-bold text-gray-900">Inputs</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{inputSubtitle}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-7 pb-6 pt-3 space-y-5">

              {/* MODE A — explicit {variable} placeholders */}
              {hasVars && detectedVars.map((varName) => (
                <div key={varName} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    {varName}<span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={varInputs[varName] || ''}
                      onChange={(e) => setInput(varName, e.target.value)}
                      placeholder={'Enter ' + varName + '...'}
                      className={inputCls}
                    />
                    <button type="button" className={clipBtnCls} title="Attach file">
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* MODE B — one input per agent (no {variables} found) */}
              {!hasVars && hasAgents && agentInputs.map(({ key, agentName, hint }) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    {agentName}<span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={varInputs[key] || ''}
                      onChange={(e) => setInput(key, e.target.value)}
                      placeholder={hint ? ('e.g. ' + hint) : ('Enter input for ' + agentName + '...')}
                      className={inputCls}
                    />
                    <button type="button" className={clipBtnCls} title="Attach file">
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* MODE C — fallback single textarea */}
              {!hasVars && !hasAgents && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Input<span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={varInputs.__input || ''}
                    onChange={(e) => setInput('__input', e.target.value)}
                    placeholder="Describe the task or topic for your crew..."
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition resize-none bg-white placeholder:text-gray-300"
                  />
                </div>
              )}

            </div>
          </div>

          {/* RIGHT — Preview */}
          <div className="w-1/2 flex flex-col overflow-hidden bg-gray-50/60">
            <div className="px-7 pt-6 pb-2 shrink-0">
              <h3 className="text-sm font-bold text-gray-900">Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                This is how your input parameters will be applied:
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-7 pb-6 pt-3 space-y-5">
              {previewNodes.length > 0 ? (
                previewNodes.map((entry) => (
                  <div key={entry.index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shrink-0">
                        {entry.index}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{entry.name}</span>
                    </div>
                    {entry.description && (
                      <div className="ml-7">
                        <p className="text-[11px] font-semibold text-gray-500 mb-1">Description:</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {buildPreviewSegments(entry.description).map((seg, i) =>
                            seg.type === 'var' ? (
                              <span key={i} className="inline-block mx-0.5 px-2 py-0.5 text-[11px] font-bold rounded-md bg-indigo-600 text-white">
                                {seg.value}
                              </span>
                            ) : (
                              <span key={i}>{seg.value}</span>
                            )
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 italic mt-4">
                  Add agents to your workflow to see a preview of how your parameters will be applied.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors rounded-xl outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}
