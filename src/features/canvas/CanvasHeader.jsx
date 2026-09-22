import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sun, Moon, Laptop } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { getAgentById } from '../../api/services/agentService';
import { getWorkflow } from '../../api/services/workflowService';

function formatSlugToTitle(slug) {
  if (!slug) return '';
  return slug
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map(w => w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function CanvasHeader() {
  const { selectedCrewAgentId, clearSelectedCrewAgentId, projectTitle, theme, toggleTheme } = useUIStore();
  const [agentName, setAgentName] = useState('Agent & Workflow Studio');
  const [agentDesc, setAgentDesc] = useState('Build, test, and deploy your AI agent automation.');

  // Read workflow name/description from MongoDB for wf- IDs
  const loadWorkflowMeta = async (wfId) => {
    try {
      const wf = await getWorkflow(wfId);
      setAgentName(wf?.name || formatSlugToTitle(wfId));
      setAgentDesc(wf?.description || 'Workflow canvas.');
    } catch {
      setAgentName(formatSlugToTitle(wfId));
      setAgentDesc('Workflow canvas.');
    }
  };

  useEffect(() => {
    if (projectTitle) {
      setAgentName(projectTitle);
      return;
    }

    if (!selectedCrewAgentId) {
      setAgentName('Agent & Workflow Studio');
      setAgentDesc('Build, test, and deploy your AI agent automation.');
      return;
    }

    if (selectedCrewAgentId === 'agent-1') {
      setAgentName('Scene Reader');
      setAgentDesc('Parses the screenplay file and extracts visual elements.');
      return;
    }
    if (selectedCrewAgentId === 'agent-2') {
      setAgentName('Storyboard Director');
      setAgentDesc('Generates frames using DALL-E based on parses.');
      return;
    }

    // All workflow IDs start with "wf-" (set by handleCreateWorkflow)
    if (selectedCrewAgentId.startsWith('wf-')) {
      loadWorkflowMeta(selectedCrewAgentId);
      return;
    }

    // Unknown ID — first try workflow lookup, then agent lookup
    const fallbackTitle = formatSlugToTitle(selectedCrewAgentId);

    getWorkflow(selectedCrewAgentId)
      .then((wf) => {
        if (wf?.name) {
          setAgentName(wf.name);
          setAgentDesc(wf.description || 'Workflow canvas.');
        } else {
          throw new Error('no name');
        }
      })
      .catch(() => {
        // Not a workflow — try agent lookup
        getAgentById(selectedCrewAgentId)
          .then((data) => {
            setAgentName(data.name || fallbackTitle);
            setAgentDesc(data.description || 'Build, test, and deploy your AI agent automation.');
          })
          .catch(() => {
            setAgentName(fallbackTitle);
            setAgentDesc('Build, test, and deploy your AI agent automation.');
          });
      });

  }, [selectedCrewAgentId, projectTitle]);


  return (
    <div className="px-6 pt-4 pb-2 bg-white dark:bg-slate-900 select-none flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        {selectedCrewAgentId && (
          <button
            onClick={clearSelectedCrewAgentId}
            className="p-1.5 rounded-lg border border-gray-250 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition"
            title="Back to My Agents"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-gray-950 dark:text-slate-100 leading-tight">
            {agentName}
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {agentDesc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-750 bg-gray-50/80 dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-750 transition shadow-xs"
          title={`Active Theme: ${theme}. Click to switch theme.`}
        >
          {theme === 'Dark' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          ) : theme === 'Light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Laptop className="w-3.5 h-3.5 text-blue-500" />
          )}
          <span className="hidden sm:inline capitalize">{theme}</span>
        </button>
      </div>
    </div>
  );
}
