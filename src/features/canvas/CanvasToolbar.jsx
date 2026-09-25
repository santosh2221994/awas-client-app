import React, { useState } from 'react';
import { 
  Sparkles, 
  Variable, 
  Share2, 
  Download, 
  Upload, 
  Play, 
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useCanvasStore } from '../../stores/useCanvasStore';
import Button from '../../components/Button';
import ProjectValidationModal from './ProjectValidationModal';
import RunParametersModal from './RunParametersModal';
import { cn } from '../../utils/cn';

export default function CanvasToolbar() {
  const { 
    activeTab, 
    setActiveTab, 
    isRightPanelOpen, 
    toggleRightPanel 
  } = useUIStore();

  const { nodes } = useCanvasStore();
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationIssues, setValidationIssues] = useState([]);
  const [isRunParamsModalOpen, setIsRunParamsModalOpen] = useState(false);

  const handleRunClick = () => {
    // Collect tools across all agent nodes
    const agentNodes = nodes.filter((n) => n.type === 'agentNode');
    const issues = [];

    agentNodes.forEach((node) => {
      const tools = Array.isArray(node.data?.tools) ? node.data.tools : [];
      tools.forEach((t) => {
        if (!t) return;
        const rawName = typeof t === 'string' ? t : (t.name || t.title || t.id || '');
        const toolName = String(rawName).toLowerCase();
        if (toolName.includes('gmail') && !t.connected) {
          issues.push('gmail integration is not connected. Please connect before using it.');
        } else if (toolName.includes('slack') && !t.connected) {
          issues.push('slack integration is not connected. Please connect before using it.');
        } else if (toolName.includes('github') && !t.connected) {
          issues.push('github integration is not connected. Please connect before using it.');
        }
      });
    });

    if (issues.length > 0) {
      setValidationIssues(issues);
      setIsValidationModalOpen(true);
    } else {
      // Open the Run Parameters modal (CrewAI-style centered dialog)
      setIsRunParamsModalOpen(true);
    }
  };

  const handleExecuteFromModal = (inputs) => {
    setIsRunParamsModalOpen(false);
    // Store the inputs so WorkflowRunnerPanel can pick them up
    useUIStore.getState().setRunInputs(inputs);
    setActiveTab('run');
  };

  return (
    <>
      <ProjectValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        issues={validationIssues}
      />
      <RunParametersModal
        isOpen={isRunParamsModalOpen}
        onClose={() => setIsRunParamsModalOpen(false)}
        onExecute={handleExecuteFromModal}
      />

      <div className="flex items-center justify-between px-6 py-2 bg-white border-b border-gray-200 select-none">
        {/* Left Tabs (Canvas / Run) */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('canvas')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 outline-none",
              activeTab === 'canvas'
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Canvas
          </button>
          <button
            onClick={() => setActiveTab('run')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 outline-none",
              activeTab === 'run'
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Run
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={Sparkles}
            className="text-xs text-gray-500 font-medium px-2 py-1.5"
          >
            Try new view
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            icon={Variable}
            className="text-xs text-gray-500 font-medium px-2 py-1.5"
          >
            Environment variables
          </Button>

          <div className="w-px h-4 bg-gray-200 mx-1" />

          <Button 
            variant="secondary" 
            size="sm" 
            icon={Share2}
            className="text-xs text-gray-600 px-2.5 py-1.5"
          >
            Share
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={Download}
            className="text-xs text-gray-600 px-2.5 py-1.5"
          >
            Download
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={Upload}
            className="text-xs text-gray-600 px-2.5 py-1.5"
          >
            Publish
          </Button>

          <Button 
            variant="brand" 
            size="sm" 
            icon={Play}
            onClick={handleRunClick}
            className="text-xs font-semibold px-3.5 py-1.5 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Run
          </Button>

          <div className="w-px h-4 bg-gray-200 mx-1" />

          <button
            onClick={toggleRightPanel}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all outline-none"
            title={isRightPanelOpen ? "Close panel" : "Open tools & crew"}
          >
            {isRightPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

