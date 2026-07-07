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
          isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
        }`}
      >
        <IconComponent className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="node-card min-w-[220px] p-0 bg-white rounded-xl shadow-node border border-gray-200 hover:shadow-node-hover transition-shadow duration-200 select-none">
      {/* Starting trigger node has only source output handle */}
      <NodeHandle type="source" position={Position.Right} id="source-trigger" />

      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
        <Zap className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-gray-800">
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
                ? 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                : 'bg-white border-transparent hover:bg-gray-50'
            }`}
          >
            {getIcon(trigger.icon, trigger.active)}
            <div className="min-w-0">
              <span
                className={`text-xs font-semibold block truncate ${
                  trigger.active ? 'text-indigo-700' : 'text-gray-600'
                }`}
              >
                {trigger.label}
              </span>
              <span className="text-[9px] text-gray-400 block truncate max-w-[150px]">
                {trigger.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
