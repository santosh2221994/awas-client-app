import React from 'react';
import { Position } from '@xyflow/react';
import { Zap, Clock, Hand } from 'lucide-react';
import NodeHandle from './NodeHandle';
import { useCanvasStore } from '../../../stores/useCanvasStore';

const iconMap = {
  Zap,
  Clock,
  Hand
};

export default function TriggerNode({ id, data }) {
  const { updateNodeData } = useCanvasStore();
  const triggers = data?.triggers || [];

  const handleTriggerToggle = (triggerId) => {
    const updated = triggers.map((t) => ({
      ...t,
      active: t.id === triggerId, // Single active trigger logic for visual display
    }));
    updateNodeData(id, { triggers: updated });
  };

  const getIcon = (iconName, isActive) => {
    const IconComponent = iconMap[iconName] || Zap;
    return (
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          isActive
            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
        }`}
      >
        <IconComponent className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="node-card min-w-[220px] p-0 bg-white dark:bg-slate-900 rounded-xl shadow-node border border-gray-200 dark:border-slate-800 hover:shadow-node-hover transition-shadow duration-200 select-none">
      {/* Starting trigger node has only source output handle */}
      <NodeHandle type="source" position={Position.Right} id="source-trigger" />

      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-850/50 rounded-t-xl">
        <Zap className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">
          Triggers
        </h3>
      </div>

      {/* Body List */}
      <div className="p-2 space-y-1.5">
        {triggers.map((trigger) => (
          <div
            key={trigger.id}
            onClick={() => handleTriggerToggle(trigger.id)}
            className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all duration-150 ${
              trigger.active
                ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-transparent hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            {getIcon(trigger.icon, trigger.active)}
            <div className="min-w-0">
              <span
                className={`text-xs font-semibold block truncate ${
                  trigger.active ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-slate-300'
                }`}
              >
                {trigger.label}
              </span>
              <span className="text-[9px] text-gray-400 dark:text-slate-500 block truncate max-w-[150px]">
                {trigger.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
