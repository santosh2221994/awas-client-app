import React from 'react';
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
import Button from '../../components/Button';
import { cn } from '../../utils/cn';

export default function CanvasToolbar() {
  const { 
    activeTab, 
    setActiveTab, 
    isRightPanelOpen, 
    toggleRightPanel 
  } = useUIStore();

  return (
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
          onClick={() => setActiveTab('run')}
          className="text-xs font-semibold px-3.5 py-1.5 shadow-sm"
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
  );
}
