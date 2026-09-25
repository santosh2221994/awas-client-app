import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { saveWorkflow, getWorkflow } from '../api/services/workflowService';

export function syncWorkflowAgentsToRepository(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) return;
  const agentNodes = nodes.filter((n) => n.type === 'agentNode');
  if (agentNodes.length === 0) return;

  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('custom_agents') : null;
    let existing = stored ? JSON.parse(stored) : [];
    let updated = false;

    agentNodes.forEach((node, idx) => {
      const d = node.data || {};
      const rawName = d.title || d.name || `Agent ${idx + 1}`;
      const name = typeof rawName === 'string' ? rawName : (rawName?.name || `Agent ${idx + 1}`);
      const role = d.role || d.type || name;
      const desc = d.description || `Autonomous AI agent for ${name}.`;
      const tools = Array.isArray(d.tools) && d.tools.length > 0
        ? d.tools
        : (Array.isArray(d.capabilities) && d.capabilities.length > 0 ? d.capabilities : []);

      const systemPrompt = d.systemPrompt || d.instructions ||
        `You are ${name}, an autonomous AI specialist for ${role}.\n\n` +
        `Role & Primary Goal:\n${desc}\n\n` +
        `Task Execution & Rules:\n` +
        `- Analyze workflow inputs carefully.\n` +
        `- Execute node tasks accurately.\n` +
        `- Return clear, structured, and high quality responses.`;

      const existsIdx = existing.findIndex((a) =>
        (a.id && (a.id === node.id || a.id === `custom-${node.id}` || `custom-${a.id}` === node.id)) ||
        (a.name && a.name.toLowerCase() === name.toLowerCase())
      );

      const agentId = existsIdx !== -1 
        ? existing[existsIdx].id 
        : (node.id.startsWith('custom-') ? node.id : `custom-${node.id}`);

      const fallbackTools = [
        { name: 'AI Reasoning Engine', icon: 'Brain', connected: true },
        { name: 'Web Search', icon: 'Globe', connected: true }
      ];

      const newAgent = {
        id: agentId,
        name,
        description: desc,
        type: role,
        model: d.model || 'gpt-4o-mini',
        systemPrompt,
        instructions: systemPrompt,
        tools: tools.length > 0 ? tools : fallbackTools,
        capabilities: tools.length > 0 ? tools : fallbackTools,
        price: 'Free',
        rating: 5.0,
        category: 'Assistant',
        username: 'Crew Studio'
      };

      if (existsIdx !== -1) {
        existing[existsIdx] = { ...existing[existsIdx], ...newAgent };
      } else {
        existing.push(newAgent);
      }
      updated = true;

      // Sync to agent_versions in localStorage for AgentDetail Editor
      const versionKey = `agent_versions_${agentId}`;
      const existingVersions = localStorage.getItem(versionKey);
      if (!existingVersions) {
        const v1 = [{
          id: 'v1',
          name: 'v1',
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          published: true,
          instructions: systemPrompt,
          systemPrompt,
          variables: [
            { name: 'user-id', type: 'string' },
            { name: 'user-tier', type: 'string' },
            { name: 'tenant-id', type: 'string' },
            { name: 'locale', type: 'string' },
          ],
          tools: newAgent.tools
        }];
        localStorage.setItem(versionKey, JSON.stringify(v1));
      } else {
        try {
          const vList = JSON.parse(existingVersions);
          let vUpdated = false;
          vList.forEach(v => {
            if (!v.instructions) {
              v.instructions = systemPrompt;
              v.systemPrompt = systemPrompt;
              vUpdated = true;
            }
          });
          if (vUpdated) {
            localStorage.setItem(versionKey, JSON.stringify(vList));
          }
        } catch {}
      }
    });

    if (updated) {
      localStorage.setItem('custom_agents', JSON.stringify(existing));
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('agent_updated'));
    }
  } catch (err) {
    console.warn('[useCanvasStore] Failed to sync workflow agents to repository', err);
  }
}

export const useCanvasStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },

  setNodes: (nodes) => {
    syncWorkflowAgentsToRepository(nodes);
    set({ nodes });
  },

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

  initializeFlow: (nodes, edges) => {
    syncWorkflowAgentsToRepository(nodes);
    set({ nodes, edges });
  },

  setActiveWorkflowId: (id) => set({ activeWorkflowId: id }),

  saveWorkflowCanvas: async (workflowId, initialName = null, initialDesc = null) => {
    const { nodes, edges } = get();
    // Always mirror to localStorage as well so local cache is kept up-to-date
    try {
      localStorage.setItem(`canvas_${workflowId}`, JSON.stringify({ nodes, edges }));
    } catch { }

    try {
      let name = initialName || `Workflow ${workflowId}`;
      let description = initialDesc;

      try {
        const existing = await getWorkflow(workflowId);
        if (existing) {
          name = initialName || existing.name || name;
          if (description === null || description === undefined) {
            description = existing.description !== undefined ? existing.description : '';
          }
        }
      } catch { /* new workflow */ }

      const payload = { workflowId, name, nodes, edges };
      if (description !== null && description !== undefined) {
        payload.description = description;
      }

      await saveWorkflow(payload);
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
                saveWorkflow({ workflowId, name: wf.name || `Workflow ${workflowId}`, description: wf.description || '', nodes: parsedNodes, edges: parsedEdges }).catch(() => {});
              }
            }
          } catch { }
        }

        set({ nodes: parsedNodes, edges: parsedEdges, activeWorkflowId: workflowId });
        syncWorkflowAgentsToRepository(parsedNodes);
        return true;
      }
    } catch {
      // Not in DB — try localStorage fallback
      try {
        const stored = localStorage.getItem(`canvas_${workflowId}`);
        if (stored) {
          const { nodes, edges } = JSON.parse(stored);
          set({ nodes: nodes || [], edges: edges || [], activeWorkflowId: workflowId });
          syncWorkflowAgentsToRepository(nodes || []);
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

        // ── Resolve tools from every possible field the AI might provide ──────
        // Priority: act.tools → act.capabilities → act.integrations → inferred
        const normaliseTool = (t) => {
          if (typeof t === 'string') return { name: t, icon: 'Wrench', connected: true };
          if (t && typeof t === 'object') {
            return {
              name: t.name || t.tool || t.capability || t.integration || 'Tool',
              icon: t.icon || 'Wrench',
              connected: t.connected !== false,
            };
          }
          return null;
        };

        let resolvedTools = [];
        if (Array.isArray(act.tools) && act.tools.length > 0) {
          resolvedTools = act.tools.map(normaliseTool).filter(Boolean);
        } else if (Array.isArray(act.capabilities) && act.capabilities.length > 0) {
          resolvedTools = act.capabilities.map(normaliseTool).filter(Boolean);
        } else if (Array.isArray(act.integrations) && act.integrations.length > 0) {
          resolvedTools = act.integrations.map(normaliseTool).filter(Boolean);
        } else {
          // Infer sensible defaults from the agent name / role / description
          const hint = `${displayAgentName} ${act.role || ''} ${act.description || ''}`.toLowerCase();
          if (hint.includes('search') || hint.includes('research') || hint.includes('web'))
            resolvedTools.push({ name: 'Web Search', icon: 'Globe', connected: true });
          if (hint.includes('email') || hint.includes('gmail') || hint.includes('mail'))
            resolvedTools.push({ name: 'Gmail', icon: 'Mail', connected: false });
          if (hint.includes('slack') || hint.includes('notify') || hint.includes('message'))
            resolvedTools.push({ name: 'Slack', icon: 'MessageSquare', connected: false });
          if (hint.includes('github') || hint.includes('git') || hint.includes('code'))
            resolvedTools.push({ name: 'GitHub', icon: 'GitBranch', connected: false });
          if (hint.includes('sheet') || hint.includes('spreadsheet') || hint.includes('google doc'))
            resolvedTools.push({ name: 'Google Docs', icon: 'FileSpreadsheet', connected: true });
          if (hint.includes('image') || hint.includes('dalle') || hint.includes('visual') || hint.includes('storyboard'))
            resolvedTools.push({ name: 'DALL·E Image Gen', icon: 'Image', connected: true });
          if (hint.includes('file') || hint.includes('read') || hint.includes('document') || hint.includes('pdf'))
            resolvedTools.push({ name: "Read a file's content", icon: 'FileText', connected: true });
          if (hint.includes('scrape') || hint.includes('website') || hint.includes('url'))
            resolvedTools.push({ name: 'Read website content', icon: 'Globe', connected: true });
          if (hint.includes('sql') || hint.includes('database') || hint.includes('query'))
            resolvedTools.push({ name: 'SQL Query', icon: 'Database', connected: false });
          // Generic fallback so no node ever shows blank
          if (resolvedTools.length === 0)
            resolvedTools.push({ name: 'AI Reasoning', icon: 'Brain', connected: true });
        }

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
              systemPrompt: act.systemPrompt || act.system_prompt || act.instructions ||
                `You are ${displayAgentName}, an autonomous AI specialist for ${act.role || displayAgentName}.\n\n` +
                `Role & Primary Goal:\n${act.description || `Autonomous AI agent for ${displayAgentName}.`}\n\n` +
                `Task Execution & Rules:\n` +
                `- Analyze workflow inputs carefully.\n` +
                `- Execute node tasks accurately.\n` +
                `- Return clear, structured, and high quality responses.`,
              instructions: act.instructions || act.systemPrompt || act.system_prompt,
              tools: resolvedTools,
              capabilities: resolvedTools,
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
              // Store in BOTH fields so every consumer (RunParametersModal, WorkflowRunnerPanel) can find it
              description: taskDesc,
              taskDescription: taskDesc,
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
          const agentSysPrompt = act.systemPrompt || act.system_prompt || act.instructions ||
            `You are ${displayAgentName}, an autonomous AI specialist for ${agentRole}.\n\n` +
            `Role & Primary Goal:\n${agentDesc}\n\n` +
            `Task Execution & Rules:\n` +
            `- Analyze workflow inputs carefully.\n` +
            `- Execute node tasks accurately.\n` +
            `- Return clear, structured, and high quality responses.`;

          const agentIdForRepo = existsIdx !== -1 ? existing[existsIdx].id : `custom-${ts}-${idx}`;
          const newAgentObj = {
            id: agentIdForRepo,
            name: displayAgentName,
            description: agentDesc,
            type: agentRole,
            model: act.model || 'gpt-4o-mini',
            systemPrompt: agentSysPrompt,
            instructions: agentSysPrompt,
            price: 'Free', rating: 5.0, category: 'Assistant',
            tools: resolvedTools,
            capabilities: resolvedTools,
            username: 'Crew Studio'
          };
          if (existsIdx !== -1) existing[existsIdx] = { ...existing[existsIdx], ...newAgentObj };
          else existing.push(newAgentObj);
          localStorage.setItem('custom_agents', JSON.stringify(existing));

          // Also set agent_versions for AgentDetail Editor
          const vKey = `agent_versions_${agentIdForRepo}`;
          if (!localStorage.getItem(vKey)) {
            const v1 = [{
              id: 'v1',
              name: 'v1',
              timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              published: true,
              instructions: agentSysPrompt,
              systemPrompt: agentSysPrompt,
              variables: [
                { name: 'user-id', type: 'string' },
                { name: 'user-tier', type: 'string' },
                { name: 'tenant-id', type: 'string' },
                { name: 'locale', type: 'string' },
              ],
              tools: resolvedTools
            }];
            localStorage.setItem(vKey, JSON.stringify(v1));
          }

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
