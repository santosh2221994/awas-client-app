import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ProjectValidationModal({ isOpen, onClose, issues = [] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden transition-all">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Project validation</h2>
            <p className="text-xs text-gray-500 mt-1">
              The following issues must be resolved before going forward.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-xs font-bold text-gray-800">
              Configuration Issues
            </span>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded-full">
              {issues.length}
            </span>
          </div>

          <div className="space-y-2">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl p-3.5 text-xs text-gray-700 leading-relaxed font-normal shadow-2xs"
              >
                {issue}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
