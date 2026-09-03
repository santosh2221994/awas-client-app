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
  Trash2
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
  Zap
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

  return (
    <div className="node-card border-l-4 border-l-blue-500 min-w-[260px] max-w-[300px] p-0 bg-white rounded-xl shadow-node border border-gray-200 hover:shadow-node-hover transition-shadow duration-200 select-none group/node">
      {/* Node Handles */}
      <NodeHandle type="target" position={Position.Left} id="target-agent" />
      <NodeHandle type="source" position={Position.Right} id="source-agent" />

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
                    tools: selectedAgent.tools.map((t) => ({
                      name: t.name,
                      id: t.id,
                      icon: 'FileText',
                      connected: true
                    }))
                  });
                } else {
                  updateNodeData(id, { title: e.target.value, name: e.target.value });
                }
              }}
              className="text-xs font-semibold text-gray-800 bg-transparent border-b border-dashed border-gray-300 focus:border-indigo-500 outline-none pr-4 cursor-pointer max-w-[130px] font-sans truncate"
            >
              <option value="">Select Agent...</option>
              {displayTitle && !agentsList.some(a => a.name === displayTitle) && (
                <option value={displayTitle}>{displayTitle}</option>
              )}
              {agentsList.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-gray-400 block truncate">
              {role || 'Agent'}
            </span>
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
          <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">
            Tools & Capabilities
          </span>
          <div className="space-y-1.5">
            {tools && tools.length > 0 ? (
              tools.map((tool, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-gray-50 text-[11px] text-gray-600 border border-gray-100 hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getToolIcon(tool.icon)}
                    <span className="truncate">{tool.name}</span>
                  </div>

                  {/* Status Indicator */}
                  {tool.connected !== undefined && (
                    <div className="flex items-center gap-1.5">
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
