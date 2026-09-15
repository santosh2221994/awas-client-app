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

  activeWorkflowId: null,

  initializeFlow: (nodes, edges) => set({ nodes, edges }),

  setActiveWorkflowId: (id) => set({ activeWorkflowId: id }),

  saveWorkflowCanvas: (workflowId) => {
    const { nodes, edges } = get();
    try {
      localStorage.setItem(`canvas_${workflowId}`, JSON.stringify({ nodes, edges }));
    } catch (err) {
      console.warn('[useCanvasStore] Failed to save workflow canvas', err);
    }
  },

  loadWorkflowCanvas: (workflowId) => {
    try {
      const stored = localStorage.getItem(`canvas_${workflowId}`);
      if (stored) {
        const { nodes, edges } = JSON.parse(stored);
        set({ nodes: nodes || [], edges: edges || [], activeWorkflowId: workflowId });
        return true;
      }
    } catch (err) {
      console.warn('[useCanvasStore] Failed to load workflow canvas', err);
    }
    set({ nodes: [], edges: [], activeWorkflowId: workflowId });
    return false;
  },

  applyNodeActions: (actions) => {
    if (!Array.isArray(actions)) return;

    set((state) => {
      let currentNodes = [...state.nodes];
      let currentEdges = [...state.edges];

      actions.forEach((act, idx) => {
        const actionType = act.action || act.type || 'addAgent';
        // Normalize addTask (AI output: {action:"addTask", agentId, description}) → addAgent
        const normalizedAction = actionType === 'addTask' ? 'addAgent' : actionType;
        const nodeName = act.name || act.agentId || 'New Node';

        if (normalizedAction === 'addAgent' || normalizedAction === 'addNode') {

          if (idx === 0) {
            // Remove old agent and task nodes when starting fresh action application
            const oldAgentTaskIds = new Set(
              currentNodes
                .filter(n => n.type === 'agentNode' || n.type === 'taskNode')
                .map(n => n.id)
            );
            currentNodes = currentNodes.filter(n => !oldAgentTaskIds.has(n.id));
            currentEdges = currentEdges.filter(
              e => !oldAgentTaskIds.has(e.source) && !oldAgentTaskIds.has(e.target)
            );

            // Ensure trigger + process nodes exist
            if (!currentNodes.find(n => n.type === 'triggerNode')) {
              currentNodes.push({
                id: 'trigger-1', type: 'triggerNode',
                position: { x: 60, y: 270 },
                data: { triggers: [{ type: 'Manual', icon: 'Hand', active: true }] }
              });
            }
            if (!currentNodes.find(n => n.type === 'processNode')) {
              currentNodes.push({
                id: 'process-1', type: 'processNode',
                position: { x: 340, y: 270 },
                data: { version: 'Version 1', processType: 'Sequential', options: ['Sequential', 'Parallel', 'Hierarchical'] }
              });
              currentEdges.push({
                id: 'e-trigger-process', source: 'trigger-1', target: 'process-1',
                type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1.5 }
              });
            }
          }

          const ts = Date.now();
          const agentId = `agent-${ts}-${idx}`;
          const taskId = `task-${ts}-${idx}`;
          const displayAgentName = act.name || act.title || `Agent ${idx + 1}`;
          const taskTitle = act.taskTitle || act.task || `Run ${displayAgentName}`;
          const taskDesc = act.taskDescription || act.description || `Executes tasks assigned to ${displayAgentName}.`;

          const xPos = 640 + idx * 380;

          currentNodes.push(
            {
              id: agentId,
              type: 'agentNode',
              position: { x: xPos, y: 120 },
              data: {
                name: displayAgentName,
                title: displayAgentName,
                model: act.model || 'gpt-4o-mini',
                role: act.role || displayAgentName,
                description: act.description || `Autonomous AI agent for ${displayAgentName}.`,
                tools: Array.isArray(act.tools)
                  ? act.tools.map(t => typeof t === 'string' ? { name: t, icon: 'Wrench', connected: true } : t)
                  : []
              }
            },
            {
              id: taskId,
              type: 'taskNode',
              position: { x: xPos, y: 420 },
              data: {
                name: taskTitle,
                title: taskTitle,
                assignedAgent: displayAgentName,
                description: taskDesc
              }
            }
          );

          // Persist to custom_agents localStorage
          try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('custom_agents') : null;
            const existing = stored ? JSON.parse(stored) : [];
            const agentRole = act.role || act.type || displayAgentName;
            const agentDesc = act.description || `Autonomous AI agent for ${displayAgentName}.`;
            const existsIdx = existing.findIndex(a => a.name?.toLowerCase() === displayAgentName.toLowerCase());
            const newAgentObj = {
              id: existsIdx !== -1 ? existing[existsIdx].id : `custom-${ts}-${idx}`,
              name: displayAgentName,
              description: agentDesc,
              type: agentRole,
              model: act.model || 'gpt-4o-mini',
              instructions: act.instructions || `You are ${displayAgentName}, an autonomous AI specialist.\n\n${agentDesc}`,
              price: 'Free', rating: 5.0, category: 'Assistant',
              tools: Array.isArray(act.tools) ? act.tools : []
            };
            if (existsIdx !== -1) existing[existsIdx] = { ...existing[existsIdx], ...newAgentObj };
            else existing.push(newAgentObj);
            localStorage.setItem('custom_agents', JSON.stringify(existing));
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('agent_updated'));
          } catch (err) {
            console.warn('[useCanvasStore] Failed to save custom agent to localStorage', err);
          }

          // Vertical edge: agent → task
          currentEdges.push({
            id: `e-v-${agentId}-${taskId}`,
            source: agentId, target: taskId,
            type: 'smoothstep', style: { stroke: '#6366f1', strokeWidth: 2 }
          });

          // Horizontal edge: process-1 → agent (first agent) or prev task → current task
          if (idx === 0) {
            currentEdges.push({
              id: `e-process-${agentId}`,
              source: 'process-1', target: agentId,
              type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1.5 }
            });
          } else {
            const prevTaskId = `task-${currentNodes.find(n => n.id.startsWith('task-') && n.id !== taskId)?.id?.split('-').slice(-1)[0] || (ts)}-${idx - 1}`;
            const prevTask = currentNodes.find(n => n.type === 'taskNode' && n.id !== taskId);
            if (prevTask) {
              currentEdges.push({
                id: `e-${prevTask.id}-${taskId}`,
                source: prevTask.id, target: taskId,
                type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1.5 }
              });
            }
          }
        } else if (normalizedAction === 'openWorkflow') {
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
        } else if (normalizedAction === 'updateWorkflow' || normalizedAction === 'updateNode') {
          if (act.nodeId) {
            currentNodes = currentNodes.map(n =>
              n.id === act.nodeId ? { ...n, data: { ...n.data, ...act.data } } : n
            );
          }
        }

      });

      return { nodes: currentNodes, edges: currentEdges };
    });

    // Persist canvas state for the active workflow after state flush
    const { activeWorkflowId } = get();
    if (activeWorkflowId) {
      setTimeout(() => get().saveWorkflowCanvas(activeWorkflowId), 0);
    }
  },
}));
