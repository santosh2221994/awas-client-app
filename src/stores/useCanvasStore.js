import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { saveWorkflow, getWorkflow } from '../api/services/workflowService';

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

  saveWorkflowCanvas: async (workflowId, initialName = null) => {
    const { nodes, edges } = get();
    // Always mirror to localStorage as well so local cache is kept up-to-date
    try {
      localStorage.setItem(`canvas_${workflowId}`, JSON.stringify({ nodes, edges }));
    } catch { }

    try {
      let name = initialName || `Workflow ${workflowId}`;
      if (!initialName) {
        try {
          const existing = await getWorkflow(workflowId);
          name = existing?.name || name;
        } catch { /* new workflow */ }
      }

      await saveWorkflow({ workflowId, name, nodes, edges });
    } catch (err) {
      console.warn('[useCanvasStore] DB save failed, falling back to localStorage', err);
    }
  },

  loadWorkflowCanvas: async (workflowId) => {
    try {
      const wf = await getWorkflow(workflowId);
      if (wf) {
        let parsedNodes = wf.nodes || [];
        let parsedEdges = wf.edges || [];
        if (typeof parsedNodes === 'string') {
          try { parsedNodes = JSON.parse(parsedNodes); } catch { parsedNodes = []; }
        }
        if (typeof parsedEdges === 'string') {
          try { parsedEdges = JSON.parse(parsedEdges); } catch { parsedEdges = []; }
        }

        // If DB has empty nodes, fallback to cached localStorage if available
        if (!parsedNodes || parsedNodes.length === 0) {
          try {
            const stored = localStorage.getItem(`canvas_${workflowId}`);
            if (stored) {
              const { nodes: localNodes, edges: localEdges } = JSON.parse(stored);
              if (localNodes && localNodes.length > 0) {
                parsedNodes = localNodes;
                parsedEdges = localEdges || [];
                // Background backfill to MongoDB
                saveWorkflow({ workflowId, name: wf.name || `Workflow ${workflowId}`, nodes: parsedNodes, edges: parsedEdges }).catch(() => {});
              }
            }
          } catch { }
        }

        set({ nodes: parsedNodes, edges: parsedEdges, activeWorkflowId: workflowId });
        return true;
      }
    } catch {
      // Not in DB — try localStorage fallback
      try {
        const stored = localStorage.getItem(`canvas_${workflowId}`);
        if (stored) {
          const { nodes, edges } = JSON.parse(stored);
          set({ nodes: nodes || [], edges: edges || [], activeWorkflowId: workflowId });
          return true;
        }
      } catch { }
    }
    set({ nodes: [], edges: [], activeWorkflowId: workflowId });
    return false;
  },

  applyNodeActions: (actions) => {
    if (!Array.isArray(actions)) return;

    set((state) => {
      let currentNodes = [...state.nodes];
      let currentEdges = [...state.edges];

      // Filter to agent creation items (ignore standalone addTask items that lack distinct name)
      const agentActions = actions.filter(a => {
        const type = a.action || a.type || 'addAgent';
        if (type === 'addAgent' || type === 'addNode') return true;
        if (type === 'addTask' && (a.name || a.agentName)) return true;
        return false;
      });

      // If no explicit addAgent found but addTask exists, fallback to all actions
      const targetActions = agentActions.length > 0 ? agentActions : actions;

      targetActions.forEach((act, idx) => {
        const actionType = act.action || act.type || 'addAgent';
        const displayAgentName = act.name || act.agentName || act.title || `Agent ${idx + 1}`;

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

          // Guarantee trigger + process nodes exist
          if (!currentNodes.find(n => n.type === 'triggerNode')) {
            currentNodes.unshift({
              id: 'trigger-1', type: 'triggerNode',
              position: { x: 50, y: 250 },
              data: { triggers: [{ type: 'Manual', icon: 'Hand', active: true }] }
            });
          }
          if (!currentNodes.find(n => n.type === 'processNode')) {
            currentNodes.splice(1, 0, {
              id: 'process-1', type: 'processNode',
              position: { x: 350, y: 250 },
              data: { version: 'Version 1', processType: 'Sequential', options: ['Sequential', 'Parallel', 'Hierarchical'] }
            });
          }
          if (!currentEdges.find(e => e.source === 'trigger-1' && e.target === 'process-1')) {
            currentEdges.unshift({
              id: 'e-trigger-process', source: 'trigger-1', target: 'process-1',
              type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1.5 }
            });
          }
        }

        const ts = Date.now();
        const agentId = `agent-${ts}-${idx}`;
        const taskId = `task-${ts}-${idx}`;
        const taskTitle = act.taskTitle || act.task || `Run ${displayAgentName}`;
        const taskDesc = act.taskDescription || act.description || `Executes tasks assigned to ${displayAgentName}.`;

        const xPos = 680 + idx * 380;

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
          const prevTask = currentNodes.filter(n => n.type === 'taskNode' && n.id !== taskId).pop();
          if (prevTask) {
            currentEdges.push({
              id: `e-${prevTask.id}-${taskId}`,
              source: prevTask.id, target: taskId,
              type: 'smoothstep', style: { stroke: '#d1d5db', strokeWidth: 1.5 }
            });
          }
        }
      });

      return { nodes: currentNodes, edges: currentEdges };
    });

    // Persist canvas state for the active workflow after Zustand state flush.
    // 100ms delay ensures set() above has committed before we read nodes/edges.
    const { activeWorkflowId } = get();
    if (activeWorkflowId) {
      setTimeout(() => get().saveWorkflowCanvas(activeWorkflowId), 100);
    }
  },
}));
