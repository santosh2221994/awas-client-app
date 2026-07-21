import React, { useState, useEffect } from 'react';
import { ClipboardList, User, Plus } from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { listAgents } from '../../api/services/agentService';

export default function CrewSection() {
  const { addNode, nodes } = useCanvasStore();
  const [agentsList, setAgentsList] = useState([]);

  useEffect(() => {
    listAgents()
      .then(setAgentsList)
      .catch((err) => console.error('Failed to load agents list in panel', err));
  }, []);

  const handleAddAgent = () => {
    const id = `agent-${nodes.length + 1}`;
    const newAgent = {
      id,
      type: 'agentNode',
      // Stagger spawn position slightly
      position: { x: 750 + (nodes.length * 20) % 150, y: 150 + (nodes.length * 20) % 150 },
      data: {
        title: `Custom Agent ${nodes.length - 2}`,
        role: 'Assistant Agent',
        description: 'Describe the agent duties, goals, capabilities and primary task delegation targets.',
        model: 'gpt-4o-mini',
        tools: [],
      },
    };
    addNode(newAgent);
  };

  const handleAddSpecificAgent = (agent) => {
    const id = `agent-${nodes.length + 1}-${agent.id}`;
    const newAgent = {
      id,
      type: 'agentNode',
      // Stagger spawn position slightly
      position: { x: 750 + (nodes.length * 20) % 150, y: 150 + (nodes.length * 20) % 150 },
      data: {
        title: agent.name,
        role: agent.type || 'Assistant Agent',
        description: agent.description,
        model: agent.model || 'gpt-4o-mini',
        tools: agent.tools.map((t) => ({
          name: t.name,
          id: t.id,
          icon: 'FileText',
          connected: true
        })),
      },
    };
    addNode(newAgent);
  };

  const handleAddTask = () => {
    const id = `task-${nodes.length + 1}`;
    const newTask = {
      id,
      type: 'taskNode',
      position: { x: 1100 + (nodes.length * 20) % 150, y: 200 + (nodes.length * 20) % 150 },
      data: {
        title: `Custom Task ${nodes.length - 2}`,
        description: 'Describe the tasks instructions, including variable parameters enclosed in {curly_braces}.',
        expectedOutput: 'Clear description of the expected output artifact.',
      },
    };
    addNode(newTask);
  };

  return (
    <div className="select-none">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 mb-2.5">
        Crew Nodes
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {/* Add Agent Spawner Card */}
        <div
          onClick={handleAddAgent}
          className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-150 group"
          title="Click to spawn an Agent Node on canvas"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <User className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
            Agent
          </span>
          <Plus className="w-3.5 h-3.5 text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Add Task Spawner Card */}
        <div
          onClick={handleAddTask}
          className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all duration-150 group"
          title="Click to spawn a Task Node on canvas"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <ClipboardList className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
            Task
          </span>
          <Plus className="w-3.5 h-3.5 text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* List of Agents from Repository */}
      {agentsList.length > 0 && (
        <div className="mt-4.5 space-y-2.5">
          <h5 className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-1">
            Add Specific Agent
          </h5>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 scrollbar-thin">
            {agentsList.map((agent) => (
              <div
                key={agent.id}
                onClick={() => handleAddSpecificAgent(agent)}
                className="flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg border border-gray-100 bg-white hover:border-blue-200 hover:shadow-2xs cursor-pointer transition-all group/agent select-none"
                title={`Click to add ${agent.name} to the canvas`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-gray-700 block truncate group-hover:text-gray-900 transition-colors">
                      {agent.name}
                    </span>
                    <span className="text-[9px] text-gray-400 block truncate max-w-[170px]">
                      {agent.model || 'gpt-4o-mini'}
                    </span>
                  </div>
                </div>
                <button className="opacity-0 group-hover/agent:opacity-100 p-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all outline-none">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
