import React from 'react';
import { ClipboardList, User, Plus } from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';

export default function CrewSection() {
  const { addNode, nodes } = useCanvasStore();

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
    </div>
  );
}
