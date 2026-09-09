import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { getAgentById } from '../../api/services/agentService';

function formatSlugToTitle(slug) {
  if (!slug) return '';
  return slug
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map(w => w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function CanvasHeader() {
  const { selectedCrewAgentId, clearSelectedCrewAgentId, projectTitle } = useUIStore();
  const [agentName, setAgentName] = useState('Agent & Workflow Studio');
  const [agentDesc, setAgentDesc] = useState('Build, test, and deploy your AI agent automation.');

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

    const fallbackTitle = formatSlugToTitle(selectedCrewAgentId);

    getAgentById(selectedCrewAgentId)
      .then((data) => {
        setAgentName(data.name || fallbackTitle);
        setAgentDesc(data.description || 'Build, test, and deploy your AI agent automation.');
      })
      .catch(() => {
        setAgentName(fallbackTitle);
        setAgentDesc('Build, test, and deploy your AI agent automation.');
      });
  }, [selectedCrewAgentId, projectTitle]);

  return (
    <div className="px-6 pt-4 pb-2 bg-white select-none flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center gap-3">
        {selectedCrewAgentId && (
          <button
            onClick={clearSelectedCrewAgentId}
            className="p-1.5 rounded-lg border border-gray-250 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition"
            title="Back to My Agents"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-gray-950 leading-tight">
            {agentName}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {agentDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
