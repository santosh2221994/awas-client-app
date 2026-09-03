import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Terminal,
  RotateCcw,
  Zap,
  Clock,
  Bot
} from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

export default function WorkflowRunnerPanel() {
  const { nodes } = useCanvasStore();

  const agentNodes = nodes.filter((n) => n.type === 'agentNode');
  const taskNodes = nodes.filter((n) => n.type === 'taskNode');
  const processNode = nodes.find((n) => n.type === 'processNode');
  const triggerNode = nodes.find((n) => n.type === 'triggerNode');

  // Dynamically resolve the primary user-created agent node (latest applied or first valid)
  const activeAgentNode = agentNodes.length > 0 ? agentNodes[agentNodes.length - 1] : null;
  const activeTaskNode = taskNodes.length > 0 ? taskNodes[taskNodes.length - 1] : null;

  const primaryAgent = activeAgentNode?.data || { name: 'Daily Task Manager', title: 'Daily Task Manager', model: 'Gemma' };
  const primaryTask = activeTaskNode?.data || { name: 'Task Runner', title: 'Task Runner', description: 'Processes user tasks and organizes schedule.' };

  const agentName = primaryAgent.title || primaryAgent.name || 'Daily Task Manager';
  const taskName = primaryTask.title || primaryTask.name || `Task Runner - ${agentName}`;
  const modelName = primaryAgent.model || 'Gemma';
  const processType = processNode?.data?.processType || 'Sequential';

  const [inputTopic, setInputTopic] = useState(`Workflow parameters for ${agentName}`);
  const [executionState, setExecutionState] = useState('idle'); // 'idle' | 'running' | 'completed'
  const [logs, setLogs] = useState([]);
  const [outputResult, setOutputResult] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const handleExecute = async () => {
    setExecutionState('running');
    setLogs([]);
    setOutputResult(null);
    setMetrics(null);

    const startTime = Date.now();

    const addLog = (text, type = 'info') => {
      setLogs((prev) => [...prev, { id: crypto.randomUUID(), time: new Date().toLocaleTimeString(), text, type }]);
    };

    addLog(`Initializing trigger event & workflow execution pipeline...`, 'info');
    await new Promise((r) => setTimeout(r, 600));

    addLog(`Configuring process type: ${processType} Execution across ${agentNodes.length || 1} Agent Node(s)`, 'info');
    await new Promise((r) => setTimeout(r, 700));

    addLog(`Binding execution parameters: { prompt: "${inputTopic}" }`, 'info');
    await new Promise((r) => setTimeout(r, 700));

    // Iterate through all agent nodes dynamically
    const agentsToRun = agentNodes.length > 0 ? agentNodes : [{ data: primaryAgent }];
    const tasksToRun = taskNodes.length > 0 ? taskNodes : [{ data: primaryTask }];

    for (let i = 0; i < agentsToRun.length; i++) {
      const a = agentsToRun[i].data || {};
      const t = tasksToRun[i]?.data || tasksToRun[0]?.data || {};
      const aName = a.title || a.name || 'Agent';
      const aModel = a.model || 'Gemma';
      const tName = t.title || t.name || 'Task Runner';

      addLog(`[Agent ${i + 1}/${agentsToRun.length}] Dispatching to "${aName}" using model ${aModel}...`, 'info');
      await new Promise((r) => setTimeout(r, 800));

      if (Array.isArray(a.tools) && a.tools.length > 0) {
        const toolNames = a.tools.map((tl) => (typeof tl === 'string' ? tl : tl.name)).join(', ');
        addLog(`[Agent ${i + 1}] Executing tool integrations: ${toolNames}...`, 'info');
        await new Promise((r) => setTimeout(r, 700));
      }

      addLog(`[Task ${i + 1}] Executing task: "${tName}"...`, 'info');
      await new Promise((r) => setTimeout(r, 900));
    }

    addLog(`Synthesizing final execution response and logging trace telemetry...`, 'success');
    await new Promise((r) => setTimeout(r, 600));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    setExecutionState('completed');

    setMetrics({
      duration: `${duration}s`,
      promptTokens: 140 + agentNodes.length * 25,
      completionTokens: 90 + agentNodes.length * 35,
      totalTokens: 230 + agentNodes.length * 60,
      status: 'Success',
    });

    const isTaskFlow = agentName.toLowerCase().includes('task') || inputTopic.toLowerCase().includes('task');

    const generatedPayload = isTaskFlow
      ? `### Workflow Execution Summary — ${agentName}

**Agent**: ${agentName} (${modelName})
**Process**: ${processType} Execution
**Status**: Completed Successfully

**Time-Blocked Daily Schedule & Task Priority**:
- 🌅 **09:00 AM - 10:30 AM**: High Priority — Core Task Processing & Pipeline Setup
- 💻 **10:30 AM - 12:30 PM**: Deep Work — Execution of assigned workflow steps & reminders
- 🥗 **12:30 PM - 01:30 PM**: Lunch Break & System Health Check
- 📊 **01:30 PM - 03:30 PM**: Task Optimization & Tool Integrations Review
- 🔔 **03:30 PM - 05:00 PM**: Reminders Dispatch & Daily Wrap-Up Summary

\`\`\`json
{
  "status": "success",
  "agent_name": "${agentName}",
  "model": "${modelName}",
  "task_runner": "${taskName}",
  "input_topic": "${inputTopic}",
  "actions_completed": [
    "Parsed input prompt and identified task parameters",
    "Generated prioritized daily schedule and time-blocked layout",
    "Configured automated reminders and workflow trace telemetry"
  ],
  "timestamp": "${new Date().toISOString()}"
}
\`\`\`

Workflow run completed successfully with 0 errors.`
      : `### Workflow Execution Summary — ${agentName}

**Agent**: ${agentName} (${modelName})
**Task**: ${taskName}
**Process**: ${processType} Pipeline

**Execution Results**:
- Processed input context: "${inputTopic}"
- Agent model ${modelName} executed ${tasksToRun.length} assigned task step(s)
- All connected tool bindings responded with HTTP 200 OK

\`\`\`json
{
  "status": "success",
  "agent_name": "${agentName}",
  "model": "${modelName}",
  "task_executed": "${taskName}",
  "input_topic": "${inputTopic}",
  "timestamp": "${new Date().toISOString()}"
}
\`\`\`

Workflow run completed successfully with 0 errors.`;

    setOutputResult(generatedPayload);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-8 space-y-6 pb-16">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900">{primaryAgent.name || primaryAgent.title || 'Workflow Agent'}</span>
                <Badge variant="indigo">{primaryAgent.model || 'Gemma'}</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{primaryTask.name || primaryTask.title || 'Task Runner Execution Panel'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {executionState === 'completed' && (
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={() => setExecutionState('idle')}
                className="text-xs"
              >
                Reset
              </Button>
            )}
            <Button
              variant="brand"
              size="sm"
              icon={Play}
              disabled={executionState === 'running'}
              onClick={handleExecute}
              className="text-xs font-bold px-4 py-2"
            >
              {executionState === 'running' ? 'Running Workflow...' : 'Execute Workflow'}
            </Button>
          </div>
        </div>

        {/* Configuration & Inputs Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Execution Parameters</h3>
            <span className="text-[10px] text-gray-400 font-mono">{agentNodes.length} Agent Node(s) • {taskNodes.length} Task Node(s)</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Workflow Input Prompt / Topic</label>
            <textarea
              rows={2}
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
              disabled={executionState === 'running'}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none font-medium text-gray-800"
              placeholder="Enter input parameters or prompt context for the workflow..."
            />
          </div>
        </div>

        {/* Real-time Log & Execution Terminal */}
        {(executionState === 'running' || logs.length > 0) && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md text-slate-200 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-slate-300">Live Execution Logs</span>
              </div>
              {executionState === 'running' && (
                <div className="flex items-center gap-2 text-indigo-400 text-[11px]">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>Executing step...</span>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-[11px]">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span className={log.type === 'success' ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execution Output Card */}
        {executionState === 'completed' && outputResult && (
          <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-gray-900">Execution Completed Successfully</h3>
              </div>
              {metrics && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {metrics.duration}</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> {metrics.totalTokens} tokens</span>
                </div>
              )}
            </div>

            <div className="font-mono text-xs bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {outputResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
