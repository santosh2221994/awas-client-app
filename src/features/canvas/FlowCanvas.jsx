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
import { useUIStore } from '../../stores/useUIStore';
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
  const { selectedCrewAgentId } = useUIStore();

  // Populate canvas on component mounting
  useEffect(() => {
    async function loadWorkflow() {
      if (!selectedCrewAgentId) {
        initializeFlow(initialNodes, initialEdges);
        return;
      }

      if (selectedCrewAgentId === 'agent-1' || selectedCrewAgentId === 'agent-2') {
        const filteredNodes = initialNodes.filter(node => {
          if (node.id === 'trigger-1' || node.id === 'process-1') return true;
          if (selectedCrewAgentId === 'agent-1') {
            return node.id === 'agent-1' || node.id === 'task-1';
          }
          if (selectedCrewAgentId === 'agent-2') {
            return node.id === 'agent-2' || node.id === 'task-2';
          }
          return true;
        });

        // Center agent and task vertically for individual view focus
        const positionedNodes = filteredNodes.map(node => {
          if (node.id === 'agent-1' || node.id === 'agent-2') {
            return {
              ...node,
              position: { x: 680, y: 250 }
            };
          }
          if (node.id === 'task-1' || node.id === 'task-2') {
            return {
              ...node,
              position: { x: 1050, y: 250 }
            };
          }
          return node;
        });

        const filteredNodeIds = positionedNodes.map(n => n.id);
        const filteredEdges = initialEdges.filter(edge => {
          return filteredNodeIds.includes(edge.source) && filteredNodeIds.includes(edge.target);
        });

        initializeFlow(positionedNodes, filteredEdges);
      } else {
        try {
          const { getAgentById } = await import('../../api/services/agentService');
          const agentData = await getAgentById(selectedCrewAgentId);

          const customNodes = [
            {
              id: 'trigger-1',
              type: 'triggerNode',
              position: { x: 50, y: 250 },
              data: {
                triggers: [
                  { type: 'Event', icon: 'Zap', active: true },
                  { type: 'Schedule', icon: 'Clock', active: false },
                  { type: 'Manual', icon: 'Hand', active: false },
                ],
              },
            },
            {
              id: 'process-1',
              type: 'processNode',
              position: { x: 380, y: 260 },
              data: {
                version: 'Version 1',
                processType: 'Sequential',
                options: ['Sequential', 'Parallel', 'Hierarchical'],
              },
            },
            {
              id: selectedCrewAgentId,
              type: 'agentNode',
              position: { x: 680, y: 250 },
              data: {
                name: agentData.name || 'Custom Agent',
                model: agentData.model || 'gpt-4o',
                tools: (agentData.tools || []).map(t => ({
                  name: t.name || t.description,
                  icon: 'Wrench',
                  connected: true
                }))
              }
            },
            {
              id: `task-${selectedCrewAgentId}`,
              type: 'taskNode',
              position: { x: 1050, y: 250 },
              data: {
                name: `Run ${agentData.name || 'Agent'}`,
                description: agentData.description || `Assigned workflow tasks for ${agentData.name || 'Agent'}.`
              }
            }
          ];

          const customEdges = [
            {
              id: 'e-trigger-process',
              source: 'trigger-1',
              target: 'process-1',
              type: 'smoothstep',
              style: { stroke: '#d1d5db', strokeWidth: 1.5 }
            },
            {
              id: 'e-process-agent',
              source: 'process-1',
              target: selectedCrewAgentId,
              type: 'smoothstep',
              style: { stroke: '#d1d5db', strokeWidth: 1.5 }
            },
            {
              id: `e-agent-task`,
              source: selectedCrewAgentId,
              target: `task-${selectedCrewAgentId}`,
              type: 'smoothstep',
              style: { stroke: '#d1d5db', strokeWidth: 1.5 }
            }
          ];

          initializeFlow(customNodes, customEdges);
        } catch (e) {
          console.error("Failed to load agent workflow dynamically", e);
          initializeFlow(initialNodes, initialEdges);
        }
      }
    }

    loadWorkflow();
  }, [selectedCrewAgentId, initializeFlow]);

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
