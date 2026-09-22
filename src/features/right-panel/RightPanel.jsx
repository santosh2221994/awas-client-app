import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import CrewSection from './CrewSection';
import ToolsSection from './ToolsSection';

export default function RightPanel() {
  const { isRightPanelOpen, toggleRightPanel } = useUIStore();

  if (!isRightPanelOpen) return null;

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-panel z-40 animate-slide-in-right flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-850/50">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleRightPanel}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-all outline-none border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
            title="Collapse Panel"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-gray-800 dark:text-slate-100">
            Tools & Crew
          </span>
        </div>

        <button
          onClick={toggleRightPanel}
          className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Crew Nodes Section */}
        <CrewSection />

        <div className="border-b border-gray-100 dark:border-slate-800 my-4" />

        {/* Dynamic Tool Library Section */}
        <ToolsSection />
      </div>
    </div>
  );
}
