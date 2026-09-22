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
    <div className="flex items-center justify-between px-6 py-2 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 select-none">
      {/* Left Tabs (Canvas / Run) */}
      <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg border border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('canvas')}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 outline-none",
            activeTab === 'canvas'
              ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
          )}
        >
          Canvas
        </button>
        <button
          onClick={() => setActiveTab('run')}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 outline-none",
            activeTab === 'run'
              ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
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
          className="text-xs text-gray-500 dark:text-slate-400 font-medium px-2 py-1.5"
        >
          Try new view
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          icon={Variable}
          className="text-xs text-gray-500 dark:text-slate-400 font-medium px-2 py-1.5"
        >
          Environment variables
        </Button>

        <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />

        <Button 
          variant="secondary" 
          size="sm" 
          icon={Share2}
          className="text-xs text-gray-600 dark:text-slate-300 px-2.5 py-1.5"
        >
          Share
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={Download}
          className="text-xs text-gray-600 dark:text-slate-300 px-2.5 py-1.5"
        >
          Download
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={Upload}
          className="text-xs text-gray-600 dark:text-slate-300 px-2.5 py-1.5"
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

        <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />

        <button
          onClick={toggleRightPanel}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all outline-none"
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
