import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, CheckCircle2, Terminal, RotateCcw, Zap, Clock, Bot, Layers, Activity, Square, AlertCircle, FileText, BarChart2 } from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useWorkflowHistoryStore } from '../../stores/useWorkflowHistoryStore';
import { listAgents } from '../../api/services/agentService';
import { streamAgentRun } from '../../api/services/runService';
import Badge from '../../components/Badge';

function detectVariables(nodes) {
  const varSet = new Set();
  nodes.forEach((n) => {
    const text = [n.data?.taskDescription, n.data?.description, n.data?.taskTitle, n.data?.title].filter(Boolean).join(' ');
    const matches = text.match(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g) || [];
    matches.forEach((m) => varSet.add(m.replace(/[{}]/g, '')));
  });
  return [...varSet];
}

function labelify(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function EmptyResults({ onRun, disabled }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 select-none py-16">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
        <Activity className="w-7 h-7 text-indigo-300" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-700">Run your crew to see outputs and logs</p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs mx-auto">
          Fill in the inputs on the left and click{' '}
          <span className="font-semibold text-indigo-500">Run Crew</span> to execute your workflow.
        </p>
      </div>
      <button onClick={onRun} disabled={disabled} className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-40 shadow-sm">
        <Play className="w-3.5 h-3.5" /> Run Crew
      </button>
    </div>
  );
}

function LogLine({ log }) {
  const colors = { info: 'text-slate-300', success: 'text-emerald-400', error: 'text-rose-400', warn: 'text-amber-400' };
  return (
    <div className={`flex gap-2 text-[11px] font-mono leading-relaxed ${colors[log.type] || colors.info}`}>
      <span className="text-slate-500 shrink-0">[{log.time}]</span>
      <span className="whitespace-pre-wrap break-all">{log.text}</span>
    </div>
  );
}

export default function WorkflowRunnerPanel() {
  const { nodes } = useCanvasStore();
  const { addRunRecord } = useWorkflowHistoryStore();
  const agentNodes = nodes.filter((n) => n.type === 'agentNode');
  const processNode = nodes.find((n) => n.type === 'processNode');
  const hasWorkflow = agentNodes.length > 0;
  const primaryAgent = agentNodes[agentNodes.length - 1]?.data || {};
  const agentName = primaryAgent.title || primaryAgent.name || 'Crew Workflow';
  const modelName = primaryAgent.model || 'gpt-4o';
  const processType = processNode?.data?.processType || 'Sequential';

  const detectedVars = useMemo(() => detectVariables(nodes), [nodes]);
  const hasDynamicVars = detectedVars.length > 0;

  const [varInputs, setVarInputs] = useState({});
  const [inputTopic, setInputTopic] = useState('Analyze latest task requirements and synthesize step-by-step resolution.');

  useEffect(() => {
    setVarInputs((prev) => {
      const next = {};
      detectedVars.forEach((v) => { next[v] = prev[v] ?? ''; });
      return next;
    });
  }, [detectedVars.join(',')]);

  const [repoAgents, setRepoAgents] = useState([]);
  const [executionState, setExecutionState] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [outputResult, setOutputResult] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [streamingOutputs, setStreamingOutputs] = useState({});
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [resultTab, setResultTab] = useState('outputs');

  const abortControllerRef = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    listAgents().then((list) => setRepoAgents(list || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (resultTab === 'logs') logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, resultTab]);

  const buildPrompt = () => {
    if (!hasDynamicVars) return inputTopic;
    return Object.entries(varInputs).map(([k, v]) => `${k}: ${v || '(not provided)'}`).join('\n');
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setExecutionState('idle');
    setLogs((prev) => [...prev, { id: crypto.randomUUID(), time: new Date().toLocaleTimeString(), text: 'Execution cancelled by user.', type: 'warn' }]);
  };

  const handleRun = async () => {
    setExecutionState('running');
    setResultTab('outputs');
    setLogs([]);
    setOutputResult(null);
    setMetrics(null);
    setErrorMessage(null);
    setStreamingOutputs({});
    setActiveStepIndex(0);

    const startTime = Date.now();
    const runLogs = [];
    abortControllerRef.current = new AbortController();

    const log = (text, type = 'info') => {
      const entry = { id: crypto.randomUUID(), time: new Date().toLocaleTimeString(), text, type };
      runLogs.push(entry);
      setLogs((prev) => [...prev, entry]);
    };

    const prompt = buildPrompt();
    log(`Starting "${agentName}" — ${agentNodes.length} agent(s), ${processType} execution`);
    log(`Input: ${prompt.slice(0, 120)}${prompt.length > 120 ? '…' : ''}`);

    const effectiveAgents = repoAgents.length > 0 ? repoAgents.slice(0, agentNodes.length) : agentNodes.map((n) => n.data);
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let combinedOutput = '';
    const perAgentMetrics = [];

    try {
      for (let i = 0; i < effectiveAgents.length; i++) {
        if (abortControllerRef.current?.signal.aborted) break;
        setActiveStepIndex(i);
        const agentObj = effectiveAgents[i];
        const aName = agentObj.name || agentObj.title || `Agent ${i + 1}`;
        const targetId = agentObj.id || 'weather-agent';
        log(`[Agent ${i + 1}/${effectiveAgents.length}] Dispatching to "${aName}" (${targetId})…`);
        let stepText = '';
        const agentStart = Date.now();

        await streamAgentRun(targetId, prompt, {
          onToken: (token) => { stepText += token; setStreamingOutputs((prev) => ({ ...prev, [i]: (prev[i] || '') + token })); },
          onEvent: (evt) => { if (evt.usage) { totalPromptTokens += evt.usage.promptTokens || 0; totalCompletionTokens += evt.usage.completionTokens || 0; } },
          onDone: (res) => {
            const pt = res?.usage?.promptTokens || 150 + i * 20;
            const ct = res?.usage?.completionTokens || 100 + i * 30;
            totalPromptTokens += pt;
            totalCompletionTokens += ct;
            const agentDuration = ((Date.now() - agentStart) / 1000).toFixed(2) + 's';
            perAgentMetrics.push({ name: aName, model: agentObj.model || modelName, promptTokens: pt, completionTokens: ct, duration: agentDuration });
            log(`[Agent ${i + 1}] "${aName}" completed in ${agentDuration}`, 'success');
          },
          onError: (err) => log(`[Agent ${i + 1} Error] ${err.message}`, 'error'),
        }, abortControllerRef.current.signal);

        if (stepText) combinedOutput += (i > 0 ? '\n\n---\n\n' : '') + stepText;
      }

      if (abortControllerRef.current?.signal.aborted) { setExecutionState('idle'); return; }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
      const totalTokens = totalPromptTokens + totalCompletionTokens;
      const cost = `$${(totalTokens * 0.000005).toFixed(4)}`;
      const generatedMetrics = { duration, promptTokens: totalPromptTokens || 240, completionTokens: totalCompletionTokens || 160, totalTokens: totalTokens || 400, cost, status: 'Success', perAgent: perAgentMetrics };
      setMetrics(generatedMetrics);
      setOutputResult(combinedOutput.trim() || `Workflow "${agentName}" completed in ${duration}.`);
      setExecutionState('completed');
      setActiveStepIndex(-1);
      log(`Completed in ${duration} — ${totalTokens} tokens — ${cost}`, 'success');
      addRunRecord({ id: `run-${Date.now()}`, workflowName: agentName, status: 'Success', agentCount: effectiveAgents.length, agentsUsed: effectiveAgents.map((a) => a.name || a.title), inputTopic: prompt, outputResult: combinedOutput, logs: runLogs, metrics: generatedMetrics });
    } catch (err) {
      console.error('[WorkflowRunnerPanel] Execution failed:', err);
      setExecutionState('error');
      setErrorMessage(err.message || 'Workflow execution failed');
      log(`Workflow failed: ${err.message}`, 'error');
      setActiveStepIndex(-1);
    }
  };

  const allStreamingText = Object.values(streamingOutputs).join('\n\n---\n\n');
  const TABS = [{ id: 'outputs', label: 'Outputs', Icon: FileText }, { id: 'logs', label: 'Execution Logs', Icon: Terminal }, { id: 'traces', label: 'Traces', Icon: BarChart2 }];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      {!hasWorkflow ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Layers className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">No workflow built yet</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Switch to the <span className="font-semibold text-indigo-500">Canvas</span> tab and add agents to your workflow, then come back to run it.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* ── LEFT COLUMN — Inputs ────────────────────────────────────────── */}
          <div className="w-2/5 border-r border-gray-200 bg-white flex flex-col h-full overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <h2 className="text-sm font-bold text-gray-900">Inputs</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {hasDynamicVars ? 'Provide values for the required variables to execute your crew' : 'Provide an input prompt to execute your crew'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {hasDynamicVars ? (
                detectedVars.map((varName) => (
                  <div key={varName} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      {labelify(varName)}
                      <span className="ml-1.5 font-mono text-[10px] text-gray-400 font-normal">{'{'}{varName}{'}'}</span>
                    </label>
                    <input
                      type="text"
                      value={varInputs[varName] || ''}
                      onChange={(e) => setVarInputs((prev) => ({ ...prev, [varName]: e.target.value }))}
                      disabled={executionState === 'running'}
                      placeholder={`Enter ${labelify(varName).toLowerCase()}…`}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition bg-slate-50 placeholder:text-gray-300 disabled:opacity-50"
                    />
                  </div>
                ))
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">Input</label>
                  <textarea
                    rows={5}
                    value={inputTopic}
                    onChange={(e) => setInputTopic(e.target.value)}
                    disabled={executionState === 'running'}
                    placeholder="Describe the task or topic for your crew…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition resize-none bg-slate-50 placeholder:text-gray-300 disabled:opacity-50"
                  />
                </div>
              )}

              {/* Crew agent list */}
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Crew</p>
                <div className="space-y-1.5">
                  {agentNodes.map((n, i) => {
                    const aName = n.data?.title || n.data?.name || `Agent ${i + 1}`;
                    const aModel = n.data?.model || modelName;
                    const isActive = activeStepIndex === i;
                    return (
                      <div key={n.id} className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${isActive ? 'border-indigo-300 bg-indigo-50 text-indigo-800' : 'border-gray-200 bg-white text-gray-700'}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          {isActive ? (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
                          ) : executionState === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Bot className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          )}
                          <span className="font-semibold truncate">{aName}</span>
                        </div>
                        <span className="font-mono text-[10px] text-gray-400 shrink-0 ml-2">{aModel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Run / Stop button */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0">
              {executionState === 'running' ? (
                <button onClick={handleStop} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm">
                  <Square className="w-3.5 h-3.5" /> Stop Execution
                </button>
              ) : (
                <button onClick={handleRun} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-40">
                  <Play className="w-3.5 h-3.5" />{executionState === 'completed' ? 'Re-run Crew' : 'Run Crew'}
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Results ───────────────────────────────────────── */}
          <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
            {/* Tab header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-0.5 bg-gray-100/80 p-0.5 rounded-xl border border-gray-200/50">
                {TABS.map(({ id, label, Icon }) => (
                  <button key={id} onClick={() => setResultTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${resultTab === id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {id === 'logs' && logs.length > 0 && (
                      <span className="ml-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 rounded-full">{logs.length}</span>
                    )}
                  </button>
                ))}
              </div>
              {executionState === 'completed' && metrics && (
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{metrics.duration}</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" />{metrics.totalTokens} tokens</span>
                  <span className="text-emerald-600 font-semibold">{metrics.cost}</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* OUTPUTS TAB */}
              {resultTab === 'outputs' && (
                <>
                  {errorMessage && (
                    <div className="m-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                      <div><p className="font-bold">Execution Error</p><p className="mt-0.5">{errorMessage}</p></div>
                    </div>
                  )}
                  {executionState === 'idle' && !outputResult && !errorMessage && (
                    <EmptyResults onRun={handleRun} disabled={false} />
                  )}
                  {(executionState === 'running' || outputResult) && (
                    <div className="p-6">
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                          <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            {executionState === 'running' ? 'Live Output' : 'Output'}
                          </span>
                          <Badge variant={executionState === 'completed' ? 'emerald' : executionState === 'running' ? 'indigo' : 'slate'}>
                            {executionState === 'running' ? 'Streaming' : executionState === 'completed' ? 'Completed' : 'Ready'}
                          </Badge>
                        </div>
                        <div className="p-5">
                          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs leading-relaxed min-h-[240px] max-h-[60vh] overflow-y-auto whitespace-pre-wrap border border-slate-800">
                            {executionState === 'running'
                              ? (allStreamingText || <span className="text-slate-500 animate-pulse">Initializing agent stream…</span>)
                              : outputResult}
                            {executionState === 'running' && <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-ping" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* EXECUTION LOGS TAB */}
              {resultTab === 'logs' && (
                <div className="p-6">
                  {logs.length === 0 ? (
                    <EmptyResults onRun={handleRun} disabled={executionState === 'running'} />
                  ) : (
                    <div className="bg-slate-900 rounded-2xl p-4 space-y-1 min-h-[240px] max-h-[70vh] overflow-y-auto border border-slate-800">
                      <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-3">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Execution Logs</span>
                      </div>
                      {logs.map((log) => <LogLine key={log.id} log={log} />)}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              )}

              {/* TRACES TAB */}
              {resultTab === 'traces' && (
                <div className="p-6 space-y-4">
                  {!metrics ? (
                    <EmptyResults onRun={handleRun} disabled={executionState === 'running'} />
                  ) : (
                    <>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Duration', value: metrics.duration, Icon: Clock, color: 'text-indigo-600' },
                          { label: 'Total Tokens', value: metrics.totalTokens.toLocaleString(), Icon: Zap, color: 'text-amber-600' },
                          { label: 'Prompt Tokens', value: metrics.promptTokens.toLocaleString(), Icon: Activity, color: 'text-blue-600' },
                          { label: 'Est. Cost', value: metrics.cost, Icon: BarChart2, color: 'text-emerald-600' },
                        ].map(({ label, value, Icon, color }) => (
                          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                            <div className={`${color} mb-1`}><Icon className="w-4 h-4" /></div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                            <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>

                      {metrics.perAgent?.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-gray-900">Per-Agent Breakdown</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-gray-100">
                                  {['Agent', 'Model', 'Prompt Tokens', 'Completion Tokens', 'Duration'].map((h) => (
                                    <th key={h} className={`${h === 'Agent' || h === 'Model' ? 'text-left' : 'text-right'} px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400`}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {metrics.perAgent.map((row, i) => (
                                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-3 font-semibold text-gray-800">{row.name}</td>
                                    <td className="px-5 py-3 font-mono text-gray-500">{row.model}</td>
                                    <td className="px-5 py-3 text-right text-gray-700">{row.promptTokens}</td>
                                    <td className="px-5 py-3 text-right text-gray-700">{row.completionTokens}</td>
                                    <td className="px-5 py-3 text-right font-mono text-indigo-600">{row.duration}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <button onClick={handleRun} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-xs font-semibold text-gray-700 hover:text-indigo-700 transition-all">
                        <RotateCcw className="w-3.5 h-3.5" /> Re-run with same inputs
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
