import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function WarningBanner({ warning, onDismiss }) {
  if (!warning) return null;
  const { title, message, dismissable } = warning;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 shadow-sm animate-fade-in relative">
      <div className="flex items-start gap-2.5 pr-6">
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            {title}
          </div>
          <div className="text-xs text-amber-700 mt-1 leading-relaxed">
            {/* Make sure warning description has bold/italic parts formatted */}
            One thing to take care of before running: <strong><em>Google Docs is not connected</em></strong>. Connect it in Tools & Integrations to enable the Storyboard Director to save outputs directly.
          </div>
        </div>
      </div>

      {dismissable && (
        <button
          onClick={() => onDismiss?.(warning.id)}
          className="absolute top-3 right-3 text-amber-400 hover:text-amber-600 transition-colors p-0.5 rounded-lg outline-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
