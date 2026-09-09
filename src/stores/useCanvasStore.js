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
          }

          const agentId = `agent-${Date.now()}-${idx}`;
          const taskId = `task-${Date.now()}-${idx}`;

          const displayAgentName = act.name || act.title || 'Support Ticket Categorizer & Summarizer';

          let explicitTaskTitle = act.taskTitle;
          let explicitTaskDesc = act.description;

          if (displayAgentName.includes('Analyzer') || idx === 0) {
            explicitTaskTitle = 'Fetch and Classify New Issues';
            explicitTaskDesc = 'Fetch the most recent open issues from the GitHub repository {repo_owner}/{repo_name} (filter to issues created in the last 24 hours)...';
          } else if (displayAgentName.includes('Triage') || idx === 1) {
            explicitTaskTitle = 'Triage and Respond to Issues';
            explicitTaskDesc = 'For each classified GitHub issue in {repo_owner}/{repo_name}: apply labels (bug, enhancement, documentation), assign team members, and post tailored initial assessment comments.';
          } else {
            explicitTaskTitle = `Task Runner - ${displayAgentName}`;
          }

          // CrewAI 2-Tier Topology: Agents on top row (y = 120), Tasks on bottom row (y = 420)
          const xPos = 680 + idx * 380;

          // Ensure Process node is positioned at top-left (y = 120) and Trigger at bottom-left (y = 420)
          currentNodes = currentNodes.map(n => {
            if (n.id === 'process-1' || n.type === 'processNode') {
              return { ...n, position: { x: 340, y: 120 } };
            }
            if (n.id === 'trigger-1' || n.type === 'triggerNode') {
              return { ...n, position: { x: 340, y: 420 } };
            }
            return n;
          });

          const newAgentNode = {
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
                : [{ name: 'GitHub', icon: 'FileText', connected: true }]
            }
          };

          const newTaskNode = {
            id: taskId,
            type: 'taskNode',
            position: { x: xPos, y: 420 },
            data: {
              name: explicitTaskTitle,
              title: explicitTaskTitle,
              assignedAgent: displayAgentName,
              description: explicitTaskDesc
            }
          };

          currentNodes.push(newAgentNode, newTaskNode);

          // Persist created agent to custom_agents in localStorage so it appears in Agents Repository
          try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('custom_agents') : null;
            const existing = stored ? JSON.parse(stored) : [];
            const agentCustomId = `custom-${Date.now()}-${idx}`;
            const exists = existing.some(a => a.name.toLowerCase() === displayAgentName.toLowerCase());
            if (!exists) {
              const newAgentObj = {
                id: agentCustomId,
                name: displayAgentName,
                description: act.description || `Autonomous AI agent configured for ${displayAgentName}.`,
                type: act.role || 'Assistant',
                model: act.model || 'gpt-4o-mini',
                price: 'Free',
                rating: 5.0,
                category: 'Assistant',
                tools: Array.isArray(act.tools) ? act.tools : [{ name: 'GitHub', icon: 'FileText' }]
              };
              localStorage.setItem('custom_agents', JSON.stringify([...existing, newAgentObj]));
            }
          } catch (err) {
            console.warn('[useCanvasStore] Failed to save custom agent to localStorage', err);
          }

          // Find preceding task or trigger for horizontal bottom-row chain
          const triggerNode = currentNodes.find(n => n.id === 'trigger-1' || n.type === 'triggerNode');
          const prevTaskNode = currentNodes.find(n => n.type === 'taskNode' && n.id !== taskId && n.id.endsWith(`-${idx - 1}`));
          const sourceHorizontalId = idx > 0 && prevTaskNode ? prevTaskNode.id : (triggerNode ? triggerNode.id : 'process-1');

          currentEdges.push(
            // Vertical edge from Agent down to Task
            {
              id: `e-v-${agentId}-${taskId}`,
              source: agentId,
              target: taskId,
              sourceHandle: 'source-agent-bottom',
              targetHandle: 'target-task-top',
              type: 'smoothstep',
              style: { stroke: '#6366f1', strokeWidth: 2 }
            },
            // Horizontal edge connecting Trigger / Prev Task -> Current Task
            {
              id: `e-h-${sourceHorizontalId}-${taskId}`,
              source: sourceHorizontalId,
              target: taskId,
              sourceHandle: sourceHorizontalId.startsWith('trigger') ? 'source-trigger' : 'source-task',
              targetHandle: 'target-task',
              type: 'smoothstep',
              style: { stroke: '#6366f1', strokeWidth: 2 }
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
