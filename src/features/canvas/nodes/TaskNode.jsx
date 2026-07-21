import React, { useState, useEffect } from 'react';
import { Position } from '@xyflow/react';
import { ClipboardList, Trash2 } from 'lucide-react';
import NodeHandle from './NodeHandle';
import { useCanvasStore } from '../../../stores/useCanvasStore';
import { listAgents } from '../../../api/services/agentService';

export default function TaskNode({ id, data }) {
  const { removeNode, updateNodeData } = useCanvasStore();
  const { title, description, expectedOutput, assignedAgent } = data;
  const [agentsList, setAgentsList] = useState([]);

  useEffect(() => {
    listAgents()
      .then((list) => {
        setAgentsList(list);
        if (list.length > 0 && !assignedAgent) {
          updateNodeData(id, { assignedAgent: list[0].name });
        }
      })
      .catch((err) => console.error('Failed to load agents in task node', err));
  }, [id, assignedAgent, updateNodeData]);

  const parseDescription = (desc) => {
    if (!desc) return '';
    // Split by curly brace variables like {file_path}
    const parts = desc.split(/({[^}]+})/g);
    return parts.map((part, index) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        return (
          <span
            key={index}
            className="inline-block bg-purple-50 text-purple-700 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border border-purple-100 mx-0.5"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="node-card border-l-4 border-l-purple-500 min-w-[260px] max-w-[300px] p-0 bg-white rounded-xl shadow-node border border-gray-200 hover:shadow-node-hover transition-shadow duration-200 select-none group/node">
      {/* Node Handles */}
      <NodeHandle type="target" position={Position.Left} id="target-task" />
      <NodeHandle type="source" position={Position.Right} id="source-task" />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50 rounded-tr-xl">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="min-w-0 font-sans">
            <h3 className="text-sm font-semibold text-gray-800 truncate" title={title}>
              {title}
            </h3>
            <span className="text-[10px] text-gray-400 block truncate">
              Task Runner
            </span>
          </div>
        </div>

        {/* Delete node button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeNode(id);
          }}
          className="opacity-0 group-hover/node:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-100 transition-all duration-150 outline-none"
          title="Delete Task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="text-xs text-gray-500 leading-relaxed font-sans">
          {parseDescription(description)}
        </div>

        {/* Expected Output */}
        {expectedOutput && (
          <div className="mt-3.5 border-t border-gray-100 pt-3">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
              Expected Output
            </span>
            <p className="text-xs text-gray-600 bg-gray-50/50 border border-gray-100 rounded-lg p-2 leading-relaxed font-sans">
              {expectedOutput}
            </p>
          </div>
        )}

        {/* Assigned Agent */}
        <div className="mt-3.5 border-t border-gray-100 pt-3">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
            Assigned Agent
          </span>
          <select
            value={assignedAgent || ''}
            onChange={(e) => {
              updateNodeData(id, { assignedAgent: e.target.value });
            }}
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-700 outline-none hover:bg-gray-100/50 cursor-pointer font-sans"
          >
            <option value="">Unassigned</option>
            {agentsList.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
