import React from 'react';
import { 
  Brain, 
  Zap, 
  Database, 
  FileText, 
  MessageSquare, 
  Code,
  Sparkles,
  Image,
  Mic,
  Layers,
  Globe,
  Clock,
  HardDrive,
  Server,
  FileSpreadsheet,
  Table,
  File,
  Mail,
  MessageCircle,
  GitBranch,
  Box,
  Terminal,
  Plus
} from 'lucide-react';
import Accordion from '../../components/Accordion';
import { useCanvasStore } from '../../stores/useCanvasStore';

const iconMap = {
  Brain,
  Zap,
  Database,
  FileText,
  MessageSquare,
  Code,
  Sparkles,
  Image,
  Mic,
  Layers,
  Globe,
  Clock,
  HardDrive,
  Server,
  FileSpreadsheet,
  Table,
  File,
  Mail,
  MessageCircle,
  GitBranch,
  Box,
  Terminal
};

export default function ToolCategoryAccordion({ category, isExpanded, onToggle }) {
  const { nodes, updateNodeData } = useCanvasStore();
  const CategoryIcon = iconMap[category.icon] || Code;

  // Add tool to selected Agent node
  const handleAddTool = (tool) => {
    // Find the first agentNode on the canvas
    const agentNode = nodes.find(n => n.type === 'agentNode');
    if (agentNode) {
      const currentTools = agentNode.data.tools || [];
      // Avoid duplicate tools
      if (!currentTools.some(t => t.name === tool.name)) {
        updateNodeData(agentNode.id, {
          tools: [...currentTools, { id: tool.id, name: tool.name, icon: tool.icon || 'FileText', connected: true }]
        });
      }
    }
  };

  const getToolIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || FileText;
    return <IconComponent className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />;
  };

  return (
    <Accordion
      title={category.name}
      isOpen={isExpanded}
      onToggle={onToggle}
      icon={CategoryIcon}
    >
      <div className="space-y-1.5 pl-2 pr-1 py-1">
        {category.tools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleAddTool(tool)}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all group/tool select-none"
            title="Click to add this tool to the first agent node"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {getToolIcon(tool.icon)}
              <div className="min-w-0">
                <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 block truncate">
                  {tool.name}
                </span>
                <span className="text-[10px] text-gray-400 block truncate max-w-[170px]">
                  {tool.description}
                </span>
              </div>
            </div>
            
            <button className="opacity-0 group-hover/tool:opacity-100 p-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all outline-none">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </Accordion>
  );
}
