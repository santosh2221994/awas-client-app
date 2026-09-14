import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

export const useCanvasStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  updateNodeData: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  setViewport: (viewport) => set({ viewport }),

  initializeFlow: (nodes, edges) => set({ nodes, edges }),

  applyNodeActions: (actions) => {
    if (!Array.isArray(actions)) return;

    set((state) => {
      let currentNodes = [...state.nodes];
      let currentEdges = [...state.edges];

      actions.forEach((act, idx) => {
        const actionType = act.action || act.type || 'addAgent';
        const nodeName = act.name || 'New Node';

        if (actionType === 'addAgent' || actionType === 'addNode') {
          // Remove old agent and task nodes to replace them with the new user-created ones
          const oldAgentTaskIds = new Set(
            currentNodes
              .filter(n => n.type === 'agentNode' || n.type === 'taskNode')
              .map(n => n.id)
          );

          currentNodes = currentNodes.filter(n => !oldAgentTaskIds.has(n.id));
          currentEdges = currentEdges.filter(
            e => !oldAgentTaskIds.has(e.source) && !oldAgentTaskIds.has(e.target)
          );

          const agentId = `agent-${Date.now()}-${idx}`;
          const taskId = `task-${Date.now()}-${idx}`;

          const newAgentNode = {
            id: agentId,
            type: 'agentNode',
            position: { x: 680, y: 250 },
            data: {
              name: nodeName,
              title: nodeName,
              model: act.model || 'Gemma',
              role: act.role || 'Agent',
              description: act.description || `Autonomous AI agent for ${nodeName}.`,
              tools: Array.isArray(act.tools)
                ? act.tools.map(t => typeof t === 'string' ? { name: t, icon: 'Wrench', connected: true } : t)
                : []
            }
          };

          const newTaskNode = {
            id: taskId,
            type: 'taskNode',
            position: { x: 1050, y: 250 },
            data: {
              name: `Task Runner - ${nodeName}`,
              title: `Task Runner - ${nodeName}`,
              assignedAgent: nodeName,
              description: act.description || `Reviews and executes assigned workflow tasks for ${nodeName}.`
            }
          };

          currentNodes.push(newAgentNode, newTaskNode);

          // Persist created agent with generated system instructions to custom_agents in localStorage
          try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('custom_agents') : null;
            const existing = stored ? JSON.parse(stored) : [];
            const agentCustomId = `custom-${Date.now()}-${idx}`;
            const agentRole = act.role || act.type || nodeName;
            const agentDesc = act.description || `Autonomous AI agent for ${nodeName}.`;
            const systemInstructions = act.instructions || 
              `You are ${nodeName}, an autonomous AI specialist for ${agentRole}.\n\n` +
              `Role & Primary Goal:\n` +
              `${agentDesc}\n\n` +
              `Task Execution & Rules:\n` +
              `- Analyze incoming inputs and workflow requests carefully.\n` +
              `- Follow assigned node task instructions with precision.\n` +
              `- Return clear, structured, and deterministic outputs.`;

            const existsIdx = existing.findIndex(a => a.name?.toLowerCase() === nodeName.toLowerCase());
            const newAgentObj = {
              id: existsIdx !== -1 ? existing[existsIdx].id : agentCustomId,
              name: nodeName,
              description: agentDesc,
              type: agentRole,
              model: act.model || 'gpt-4o-mini',
              instructions: systemInstructions,
              price: 'Free',
              rating: 5.0,
              category: 'Assistant',
              tools: Array.isArray(act.tools) ? act.tools : []
            };

            if (existsIdx !== -1) {
              existing[existsIdx] = { ...existing[existsIdx], ...newAgentObj };
              localStorage.setItem('custom_agents', JSON.stringify(existing));
            } else {
              localStorage.setItem('custom_agents', JSON.stringify([...existing, newAgentObj]));
            }
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('agent_updated'));
            }
          } catch (err) {
            console.warn('[useCanvasStore] Failed to save custom agent to localStorage', err);
          }

          // Connect from process-1 or trigger-1 if present
          const processNode = currentNodes.find(n => n.id === 'process-1' || n.type === 'processNode');
          const sourceId = processNode ? processNode.id : (currentNodes[0]?.id || 'trigger-1');

          currentEdges.push(
            {
              id: `e-${sourceId}-${agentId}`,
              source: sourceId,
              target: agentId,
              type: 'smoothstep',
              style: { stroke: '#6366f1', strokeWidth: 1.8 }
            },
            {
              id: `e-${agentId}-${taskId}`,
              source: agentId,
              target: taskId,
              type: 'smoothstep',
              style: { stroke: '#6366f1', strokeWidth: 1.8 }
            }
          );
        } else if (actionType === 'openWorkflow') {
          const targetAgent = act.agent || act.name || 'Agent';
          currentNodes = currentNodes.map(n => {
            if (n.type === 'agentNode') {
              return { ...n, data: { ...n.data, name: targetAgent, title: targetAgent } };
            }
            if (n.type === 'taskNode') {
              return { ...n, data: { ...n.data, assignedAgent: targetAgent } };
            }
            return n;
          });
        } else if (actionType === 'updateWorkflow' || actionType === 'updateNode') {
          if (act.nodeId) {
            currentNodes = currentNodes.map(n =>
              n.id === act.nodeId ? { ...n, data: { ...n.data, ...act.data } } : n
            );
          }
        }
      });

      return { nodes: currentNodes, edges: currentEdges };
    });
  },
}));
