import React, { useState, useEffect } from 'react';
import { Position } from '@xyflow/react';
import {
  User,
  Cpu,
  FileText,
  FileSpreadsheet,
  Image,
  Brain,
  Zap,
  Link2Off,
  Link2,
  Trash2,
  Globe,
  Mail,
  MessageSquare,
  GitBranch,
  Database,
  Wrench,
} from 'lucide-react';
import NodeHandle from './NodeHandle';
import Badge from '../../../components/Badge';
import { useCanvasStore } from '../../../stores/useCanvasStore';
import { listAgents } from '../../../api/services/agentService';

const iconMap = {
  User,
  Cpu,
  FileText,
  FileSpreadsheet,
  Image,
  Brain,
  Zap,
  Globe,
  Mail,
  MessageSquare,
  GitBranch,
  Database,
  Wrench,
};

export default function AgentNode({ id, data }) {
  const { removeNode, updateNodeData } = useCanvasStore();
  const { title, name, description, model, tools, role } = data;
  const displayTitle = title || name;
  const [agentsList, setAgentsList] = useState([]);

  useEffect(() => {
    listAgents()
      .then((list) => {
        setAgentsList(list);
        if (list.length > 0 && !displayTitle) {
          const firstAgent = list[0];
          updateNodeData(id, {
            title: firstAgent.name,
            name: firstAgent.name,
            description: firstAgent.description,
            model: firstAgent.model,
            role: firstAgent.type || 'Agent',
            tools: firstAgent.tools.map((t) => ({
              name: t.name,
              id: t.id,
              icon: 'FileText',
              connected: true
            }))
          });
        }
      })
      .catch((err) => console.error('Failed to load agents list in node', err));
  }, [id, displayTitle, updateNodeData]);

  const getToolIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />;
  };

  // Resolve tools and capabilities dynamically
  const rawCandidateTools = (Array.isArray(tools) && tools.length > 0)
    ? tools
    : (Array.isArray(data?.capabilities) && data.capabilities.length > 0)
    ? data.capabilities
    : (Array.isArray(data?.integrations) && data.integrations.length > 0)
    ? data.integrations
    : [];

  const matchedRepoAgent = agentsList.find((a) => a.name === displayTitle || a.id === data?.id);
  const candidateList = rawCandidateTools.length > 0 ? rawCandidateTools : (matchedRepoAgent?.tools || []);

  const normaliseToolItem = (t) => {
    if (typeof t === 'string') {
      const lower = t.toLowerCase();
      let icon = 'Wrench';
      if (lower.includes('search') || lower.includes('web') || lower.includes('google')) icon = 'Globe';
      else if (lower.includes('mail') || lower.includes('gmail')) icon = 'Mail';
      else if (lower.includes('slack') || lower.includes('chat') || lower.includes('message')) icon = 'MessageSquare';
      else if (lower.includes('doc') || lower.includes('file') || lower.includes('record') || lower.includes('content') || lower.includes('pdf')) icon = 'FileText';
      else if (lower.includes('git') || lower.includes('code')) icon = 'GitBranch';
      else if (lower.includes('sql') || lower.includes('database') || lower.includes('data')) icon = 'Database';
      else if (lower.includes('brain') || lower.includes('reason') || lower.includes('ai') || lower.includes('specialist')) icon = 'Brain';
      return { name: t, icon, connected: true };
    }
    if (t && typeof t === 'object') {
      return {
        name: t.name || t.tool || t.capability || t.title || 'Tool',
        icon: t.icon || 'Wrench',
        connected: t.connected !== false,
      };
    }
    return null;
  };

  let resolvedDisplayTools = candidateList.map(normaliseToolItem).filter(Boolean);

  // If still empty, infer sensible tools/capabilities based on agent role & description
  if (resolvedDisplayTools.length === 0) {
    const hint = `${displayTitle || ''} ${role || ''} ${description || ''}`.toLowerCase();
    if (hint.includes('check-in') || hint.includes('patient') || hint.includes('token') || hint.includes('queue')) {
      resolvedDisplayTools.push({ name: 'Queue & Token Manager', icon: 'FileText', connected: true });
      resolvedDisplayTools.push({ name: 'Patient Record Lookup', icon: 'Database', connected: true });
    } else if (hint.includes('verification') || hint.includes('eligibility') || hint.includes('appointment')) {
      resolvedDisplayTools.push({ name: 'Appointment Verifier', icon: 'Zap', connected: true });
      resolvedDisplayTools.push({ name: 'Eligibility Checker', icon: 'Database', connected: true });
    } else if (hint.includes('navigation') || hint.includes('directions') || hint.includes('schedule')) {
      resolvedDisplayTools.push({ name: 'Clinic Navigation Guide', icon: 'Globe', connected: true });
      resolvedDisplayTools.push({ name: 'Calendar Scheduler', icon: 'FileText', connected: true });
    } else if (hint.includes('search') || hint.includes('research')) {
      resolvedDisplayTools.push({ name: 'Web Search', icon: 'Globe', connected: true });
    } else {
      resolvedDisplayTools.push({ name: 'AI Reasoning Engine', icon: 'Brain', connected: true });
    }
  }

  return (
    <div className="node-card border-l-4 border-l-blue-500 min-w-[260px] max-w-[300px] p-0 bg-white rounded-xl shadow-node border border-gray-200 hover:shadow-node-hover transition-shadow duration-200 select-none group/node">
      {/* Node Handles */}
      <NodeHandle type="target" position={Position.Left} id="target-agent" />
      <NodeHandle type="source" position={Position.Right} id="source-agent" />
      <NodeHandle type="target" position={Position.Top} id="target-agent-top" />
      <NodeHandle type="source" position={Position.Bottom} id="source-agent-bottom" />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50 rounded-tr-xl">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <select
              value={displayTitle || ''}
              onChange={(e) => {
                const selectedAgent = agentsList.find((a) => a.name === e.target.value);
                if (selectedAgent) {
                  updateNodeData(id, {
                    title: selectedAgent.name,
                    name: selectedAgent.name,
                    description: selectedAgent.description,
                    model: selectedAgent.model,
                    role: selectedAgent.type || 'Agent',
                    tools: (selectedAgent.tools || []).map((t) => ({
                      name: typeof t === 'string' ? t : t.name,
                      id: t.id || t.name,
                      icon: 'FileText',
                      connected: true
                    }))
                  });
                } else {
                  updateNodeData(id, { title: e.target.value, name: e.target.value });
                }
              }}
              className="text-xs font-bold text-gray-900 bg-transparent border-b border-dashed border-gray-250 focus:border-indigo-500 outline-none pr-2 cursor-pointer w-full font-sans truncate"
            >
              {displayTitle && !agentsList.some((a) => a.name === displayTitle) && (
                <option value={displayTitle}>{displayTitle}</option>
              )}
              <option value="" disabled>Select Repository Agent...</option>
              {agentsList.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} ({a.model || 'Default'})
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-gray-400 block truncate">
                {role || 'Agent'}
              </span>
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100/60">
                Auth Repo
              </span>
            </div>
          </div>
        </div>

        {/* Delete node trigger on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeNode(id);
          }}
          className="opacity-0 group-hover/node:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-100 transition-all duration-150 outline-none"
          title="Delete Agent"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* Model Badge */}
        <div className="mt-2.5">
          <Badge variant="default" size="sm" className="bg-gray-50 text-gray-600 border border-gray-200">
            <Cpu className="w-3 h-3 text-gray-400" />
            <span>{model || 'gpt-4o-mini'}</span>
          </Badge>
        </div>

        {/* Tools Section */}
        <div className="mt-3.5 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 block">
              Tools & Capabilities
            </span>
            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
              {resolvedDisplayTools.length} Active
            </span>
          </div>
          <div className="space-y-1.5">
            {resolvedDisplayTools.length > 0 ? (
              resolvedDisplayTools.map((tool, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-gray-50 text-[11px] text-gray-600 border border-gray-100 hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getToolIcon(tool.icon)}
                    <span className="truncate font-medium">{tool.name}</span>
                  </div>

                  {/* Status Indicator */}
                  {tool.connected !== undefined && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${tool.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'
                          }`}
                      />
                      <span className="text-[9px] text-gray-400">
                        {tool.connected ? 'Active' : 'Unconnected'}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-[11px] text-gray-400 italic text-center py-1 bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
                No tools attached
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
