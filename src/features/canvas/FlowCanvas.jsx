import React, { useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { initialNodes } from '../../mocks/nodes';
import { initialEdges } from '../../mocks/edges';
import CanvasHeader from './CanvasHeader';
import CanvasToolbar from './CanvasToolbar';

export default function FlowCanvas() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    initializeFlow,
    setEdges
  } = useCanvasStore();

  // Populate canvas on component mounting
  useEffect(() => {
    initializeFlow(initialNodes, initialEdges);
  }, []);

  const onConnect = (params) => {
    const newEdge = {
      ...params,
      id: `e-${params.source}-${params.target}`,
      type: 'smoothstep',
      style: { stroke: '#d1d5db', strokeWidth: 1.5 }
    };
    setEdges([...edges, newEdge]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50/50">
      {/* Top Header & Interactive Toolbar Section */}
      <CanvasHeader />
      <CanvasToolbar />

      {/* Main React Flow Grid Workspce */}
      <div className="flex-1 h-full relative outline-none select-none">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          defaultEdgeOptions={{ 
            type: 'smoothstep', 
            style: { stroke: '#d1d5db', strokeWidth: 1.5 } 
          }}
          connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 1.8 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          {/* Subtle grid pattern background */}
          <Background variant="dots" gap={18} size={1} color="#e2e8f0" />
          
          {/* Bottom left zoom actions */}
          <Controls 
            showInteractive={false} 
            className="!bg-white !border-gray-200 !shadow-sm !rounded-lg overflow-hidden border" 
          />
          
          {/* Navigation overlay view */}
          <MiniMap 
            nodeStrokeWidth={3} 
            nodeColor={(node) => {
              if (node.type === 'agentNode') return '#dbeafe';
              if (node.type === 'taskNode') return '#f3e8ff';
              if (node.type === 'processNode') return '#e2e8f0';
              return '#f1f5f9';
            }} 
            maskColor="rgba(255, 255, 255, 0.75)" 
            className="!rounded-xl !border !border-gray-200 !shadow-sm overflow-hidden" 
          />
        </ReactFlow>
      </div>
    </div>
  );
}
