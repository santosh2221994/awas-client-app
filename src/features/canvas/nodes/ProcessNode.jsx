import React from 'react';
import { Position } from '@xyflow/react';
import NodeHandle from './NodeHandle';
import Dropdown from '../../../components/Dropdown';
import { useCanvasStore } from '../../../stores/useCanvasStore';

export default function ProcessNode({ id, data }) {
  const { updateNodeData } = useCanvasStore();
  const processType = data?.processType || 'Sequential';
  const version = data?.version || 'Version 1';
  const options = data?.options || ['Sequential', 'Parallel', 'Hierarchical'];

  const dropdownOptions = options.map((opt) => ({
    value: opt,
    label: opt,
  }));

  const handleTypeChange = (newType) => {
    updateNodeData(id, { processType: newType });
  };

  return (
    <div className="node-card min-w-[200px] p-4 relative bg-white rounded-xl shadow-node border border-gray-200 hover:shadow-node-hover transition-shadow duration-200 select-none">
      {/* Node Input/Output Handles */}
      <NodeHandle type="target" position={Position.Left} id="target-process" />
      <NodeHandle type="source" position={Position.Right} id="source-process" />

      {/* Header Info */}
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {version}
        </span>
        <h3 className="text-sm font-semibold text-gray-800 mt-1">
          Process Type
        </h3>
      </div>

      {/* Content Select Dropdown */}
      <div className="mt-3">
        <Dropdown
          options={dropdownOptions}
          value={processType}
          onChange={handleTypeChange}
          className="w-full text-xs"
        />
      </div>
    </div>
  );
}
