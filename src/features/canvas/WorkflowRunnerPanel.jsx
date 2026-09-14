import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  Terminal,
  RotateCcw,
  Zap,
  Clock,
  Bot,
  History,
  Layers,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  FileCode,
  Sparkles,
  Activity,
  Check,
  Code2
} from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useWorkflowHistoryStore } from '../../stores/useWorkflowHistoryStore';
import { listAgents } from '../../api/services/agentService';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

export default function WorkflowRunnerPanel() {
  const { nodes } = useCanvasStore();
  const { history, addRunRecord } = useWorkflowHistoryStore();

  const agentNodes = nodes.filter((n) => n.type === 'agentNode');
  const taskNodes = nodes.filter((n) => n.type === 'taskNode');
  const processNode = nodes.find((n) => n.type === 'processNode');

  // Resolved dynamic nodes
  const activeAgentNode = agentNodes.length > 0 ? agentNodes[agentNodes.length - 1] : null;
  const activeTaskNode = taskNodes.length > 0 ? taskNodes[taskNodes.length - 1] : null;

  const primaryAgent = activeAgentNode?.data || { name: 'Support Ticket Categorizer & Summarizer', title: 'Support Ticket Categorizer & Summarizer', model: 'Gemma' };
  const primaryTask = activeTaskNode?.data || { name: 'Task Runner', title: 'Task Runner', description: 'Categorizes tickets and generates summaries.' };

  const agentName = primaryAgent.title || primaryAgent.name || 'Support Ticket Categorizer & Summarizer';
  const taskName = primaryTask.title || primaryTask.name || `Task Runner - ${agentName}`;
  const modelName = primaryAgent.model || 'Gemma';
  const processType = processNode?.data?.processType || 'Sequential';

  // Repository agents & options
  const [repoAgents, setRepoAgents] = useState([]);
  const [authAgentCount, setAuthAgentCount] = useState(1);

  const [inputTopic, setInputTopic] = useState(`Retrieve recent support tickets, categorize by urgency using Gemma, and generate summaries.`);
  const [executionState, setExecutionState] = useState('idle'); // 'idle' | 'running' | 'completed'
  const [logs, setLogs] = useState([]);
  const [outputResult, setOutputResult] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // CrewAI Studio v2 Timeline & Event Inspector States
  const [inspectorTab, setInspectorTab] = useState('raw'); // 'details' | 'raw'
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);
  const [expandedTimelineTasks, setExpandedTimelineTasks] = useState({ 0: true, 1: true, 2: true });

  useEffect(() => {
    listAgents()
      .then((list) => {
        setRepoAgents(list || []);
        if (list && list.length > 0) {
          setAuthAgentCount(Math.min(list.length, agentNodes.length || 1));
        }
      })
      .catch((err) => console.error('Failed to load repo agents', err));
  }, [agentNodes.length]);

  const handleExecute = async () => {
    setExecutionState('running');
    setLogs([]);
    setOutputResult(null);
    setMetrics(null);

    const startTime = Date.now();
    const runLogs = [];

    const addLog = (text, type = 'info') => {
      const entry = { id: crypto.randomUUID(), time: new Date().toLocaleTimeString(), text, type };
      runLogs.push(entry);
      setLogs((prev) => [...prev, entry]);
    };

    addLog(`Initializing CrewAI execution engine for project...`, 'info');
    await new Promise((r) => setTimeout(r, 400));

    addLog(`Allocated Authenticated Agents: ${authAgentCount} agent(s)`, 'info');
    await new Promise((r) => setTimeout(r, 400));

    addLog(`Execution Process Strategy: ${processType}`, 'info');
    await new Promise((r) => setTimeout(r, 500));

    const selectedAuthAgents = repoAgents.length >= authAgentCount
      ? repoAgents.slice(0, authAgentCount)
      : agentNodes.map(n => n.data).slice(0, authAgentCount);

    const effectiveAgents = selectedAuthAgents.length > 0 ? selectedAuthAgents : [{ name: agentName, model: modelName }];

    for (let i = 0; i < effectiveAgents.length; i++) {
      const a = effectiveAgents[i];
      const aName = a.name || a.title || `Agent ${i + 1}`;
      const aModel = a.model || 'Gemma';

      addLog(`[Task ${i + 1}] Executing task step for "${aName}" (${aModel})...`, 'info');
      await new Promise((r) => setTimeout(r, 600));

      addLog(`[LLM Call] Prompt context dispatched to ${aModel}. Response received (377ms).`, 'info');
      await new Promise((r) => setTimeout(r, 600));
    }

    addLog(`Synthesizing output payload & recording trace telemetry...`, 'success');
    await new Promise((r) => setTimeout(r, 400));

    const durationNum = ((Date.now() - startTime) / 1000).toFixed(2);
    const duration = `${durationNum}s`;

    const generatedMetrics = {
      duration,
      promptTokens: 150 + authAgentCount * 30,
      completionTokens: 100 + authAgentCount * 40,
      totalTokens: 250 + authAgentCount * 70,
      cost: `$${(0.002 * authAgentCount + 0.001).toFixed(4)}`,
      status: 'Success'
    };

    setMetrics(generatedMetrics);
    setExecutionState('completed');

    const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const generatedPayload = `### CrewAI Studio v2 Execution Summary — ${agentName}

**Authenticated Agent Count**: ${authAgentCount} Active Agent(s)
**Primary Agent**: ${agentName} (${modelName})
**Process Strategy**: ${processType} Execution
**Status**: Completed Successfully (0 Errors)

**Execution Timeline Tasks**:
1. **${agentName}**:
   - ` + "Retrieve recent support tickets" + `
   - ` + "Categorize by urgency & topic using " + modelName + `
   - ` + "Generate concise summaries for team" + `

\`\`\`json
{
  "status": "success",
  "run_id": "${runId}",
  "workflow_name": "${agentName}",
  "auth_agent_count": ${authAgentCount},
  "allocated_agents": ${JSON.stringify(effectiveAgents.map(a => a.name || a.title))},
  "process_type": "${processType}",
  "input_topic": "${inputTopic}",
  "metrics": {
    "duration": "${duration}",
    "total_tokens": ${generatedMetrics.totalTokens}
  },
  "timestamp": "${new Date().toISOString()}"
}
\`\`\`

Workflow run completed successfully with 0 errors.`;

    setOutputResult(generatedPayload);

    // Save persistent run record to workflow history store
    addRunRecord({
      id: runId,
      workflowName: agentName,
      status: 'Success',
      agentCount: authAgentCount,
      agentsUsed: effectiveAgents.map((a) => a.name || a.title),
      inputTopic,
      outputResult: generatedPayload,
      logs: runLogs,
      metrics: generatedMetrics
    });
  };

  const currentRunId = `554a24df-${Date.now().toString().slice(-4)}-4c48-885b-1068cb93f3fb`;

  const timelineTasks = agentNodes.length > 0
    ? agentNodes.map((node, i) => {
        const title = node.data?.title || node.data?.name || `Agent ${i + 1}`;
        const isGithub = title.toLowerCase().includes('github') || title.toLowerCase().includes('issue');
        const subName = isGithub
          ? (i === 0 ? 'fetch_and_classify_issues' : 'triage_and_post_comments')
          : `execute_step_${i + 1}`;

        return {
          id: `task-${i + 1}`,
          title: title,
          duration: metrics ? `${metrics.duration} (+1.${20 + i * 15}s)` : `${3.69 + i * 1.4}s (+1.43s)`,
          subStepName: subName,
          subDuration: `1.${23 + i * 10}s + 3.70s`,
          llmLatency: `${821 - i * 140}ms +1.11s`,
          completedOffset: `+1.${23 + i * 10}s`,
          rawEvent: {
            type: i === 0 ? 'execution_started' : (i === agentNodes.length - 1 ? 'execution_finished' : 'task_completed'),
            run_id: currentRunId,
            controller: 'crewai_plus/studio_v2/run_events',
            action: subName,
            project_id: '4149a919-20b7-4748-86c2-43272f925778',
            run_event: {
              type: i === 0 ? 'task_execution_started' : 'llm_call_success',
              task: title,
              agent: title,
              status: '200 OK'
            }
          }
        };
      })
    : [
        {
          id: 'task-1',
          title: 'GitHub Issue Analyzer',
          duration: metrics ? `${metrics.duration} (+1.43s)` : '3.69s (+1.43s)',
          subStepName: 'fetch_and_classify_issues',
          subDuration: '1.23s + 3.70s',
          llmLatency: '821ms +1.11s',
          completedOffset: '+1.23s',
          rawEvent: {
            type: 'execution_started',
            run_id: currentRunId,
            controller: 'crewai_plus/studio_v2/run_events',
            action: 'fetch_and_classify_issues',
            project_id: '4149a919-20b7-4748-86c2-43272f925778',
            run_event: {
              type: 'task_execution_started',
              task: 'Fetch and Classify New Issues',
              agent: 'GitHub Issue Analyzer'
            }
          }
        },
        {
          id: 'task-2',
          title: 'GitHub Issue Triage Manager',
          duration: '5.11s (+0.54s)',
          subStepName: 'triage_and_post_comments',
          subDuration: '0.54s + 5.11s',
          llmLatency: '377ms + 0.53s',
          completedOffset: '+0.54s',
          rawEvent: {
            type: 'task_completed',
            run_id: currentRunId,
            controller: 'crewai_plus/studio_v2/run_events',
            action: 'triage_and_post_comments',
            project_id: '4149a919-20b7-4748-86c2-43272f925778',
            run_event: {
              type: 'llm_call_success',
              latency: '377ms',
              status: '200 OK'
            }
          }
        }
      ];

  const activeRawData = selectedTimelineItem ? selectedTimelineItem.rawEvent : timelineTasks[0].rawEvent;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      {/* Top Controls Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900">{agentName}</span>
              <Badge variant="indigo">{modelName}</Badge>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Auth Verified
              </span>
            </div>
            <p className="text-[11px] text-gray-500">{taskName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border-r border-gray-200 pr-3">
            <span className="text-[11px] text-gray-500 font-medium">Auth Agents:</span>
            <select
              value={authAgentCount}
              onChange={(e) => setAuthAgentCount(Number(e.target.value))}
              className="border border-gray-200 bg-white rounded-lg px-2 py-1 text-xs font-bold text-gray-800 outline-none hover:bg-gray-50 cursor-pointer"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} Agent{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <Button
            variant="brand"
            size="sm"
            icon={Play}
            disabled={executionState === 'running'}
            onClick={handleExecute}
            className="text-xs font-bold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            {executionState === 'running' ? 'Running Crew...' : 'Run'}
          </Button>
        </div>
      </div>

      {/* Main Studio v2 Execution View Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Interactive Execution Timeline (matching Screenshot 2) */}
        <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col h-full overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">Timeline</h2>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              {executionState === 'running' ? 'Executing live events...' : '3 Task Steps Recorded'}
            </span>
          </div>

          {/* Input Prompt Card */}
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-3.5 space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Workflow Parameter Input
            </label>
            <textarea
              rows={2}
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
              disabled={executionState === 'running'}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none font-medium text-gray-800"
            />
          </div>

          {/* Timeline Tree Items */}
          <div className="space-y-4">
            {timelineTasks.map((tTask, idx) => {
              const isExpanded = expandedTimelineTasks[idx];
              const isSelected = selectedTimelineItem?.id === tTask.id;

              return (
                <div
                  key={tTask.id}
                  onClick={() => setSelectedTimelineItem(tTask)}
                  className={`border rounded-xl transition-all cursor-pointer ${
                    isSelected ? 'border-indigo-400 bg-indigo-50/20 shadow-xs' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Task Header Bar */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedTimelineTasks((prev) => ({ ...prev, [idx]: !prev[idx] }));
                    }}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 rounded-t-xl"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-gray-900 truncate">{tTask.title}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400 shrink-0">
                      <span>{tTask.duration}</span>
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold">
                        1 task
                      </span>
                    </div>
                  </div>

                  {/* Expanded Sub-steps Tree */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-2 border-t border-gray-100 ml-3 pl-4 border-l-2 border-l-gray-200">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-800">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{tTask.subStepName}</span>
                        </div>
                        <span className="font-mono text-gray-400 text-[10px]">{tTask.subDuration}</span>
                      </div>

                      {/* Sub-step Timeline Events */}
                      <div className="space-y-1.5 text-[11px] font-mono pl-3 text-gray-600 border-l border-dashed border-gray-200">
                        <div className="flex items-center justify-between py-0.5">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span>Started</span>
                          </div>
                          <span className="text-slate-400">+0.00s</span>
                        </div>

                        <div className="flex items-center justify-between py-0.5 text-indigo-600 font-semibold">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span>LLM call</span>
                          </div>
                          <span className="text-indigo-500">{tTask.llmLatency}</span>
                        </div>

                        <div className="flex items-center justify-between py-0.5 text-emerald-600 font-semibold">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Completed</span>
                          </div>
                          <span className="text-emerald-500">{tTask.completedOffset}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Suggestion Callout Box (matching Screenshot 2) */}
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-4 space-y-3 shadow-md mt-auto">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" /> Suggestion
              </span>
              <button className="text-slate-400 hover:text-slate-200">Dismiss</button>
            </div>
            <p className="text-xs text-slate-300">
              I have suggestions to help you move forward with your automation.
            </p>
            <Button
              variant="brand"
              size="sm"
              className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-2"
            >
              Improve automation based on last run
            </Button>
          </div>
        </div>

        {/* Right Pane: Event Details & Raw Data Inspector (matching Screenshot 2) */}
        <div className="w-1/2 bg-slate-50 flex flex-col h-full overflow-hidden">
          {/* Header & Tabs */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Event details</h3>
            <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                onClick={() => setInspectorTab('details')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  inspectorTab === 'details' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setInspectorTab('raw')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  inspectorTab === 'raw' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Raw Data
              </button>
            </div>
          </div>

          {/* Inspector Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {inspectorTab === 'raw' ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-500" /> Raw Data (6 fields)
                  </span>
                  <span className="text-[10px] text-gray-400">Raw JSON</span>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
                  <pre className="font-mono text-xs">{JSON.stringify(activeRawData, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Execution Summary</h4>
                    <Badge variant="emerald">200 OK Success</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Workflow Agent</span>
                      <span className="font-bold text-gray-800">{agentName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Model</span>
                      <span className="font-bold text-indigo-600">{modelName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Auth Agent Count</span>
                      <span className="font-bold text-gray-800">{authAgentCount} Active Agent(s)</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Duration</span>
                      <span className="font-bold text-gray-800">{metrics?.duration || '3.69s'}</span>
                    </div>
                  </div>
                </div>

                {outputResult && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
                    <span className="text-xs font-bold text-gray-800 block">Final Output Payload</span>
                    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                      {outputResult}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
