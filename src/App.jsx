import React, { useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import ChatSidebar from './features/chat-sidebar/ChatSidebar';
import FlowCanvas from './features/canvas/FlowCanvas';
import RightPanel from './features/right-panel/RightPanel';
import AgentsRepository from './features/agents/AgentsRepository';
import AgentDetail from './features/agents/AgentDetail';
import CrewStudioDashboard from './features/crew-studio/CrewStudioDashboard';
import ToolsPage from './features/tools/ToolsPage';
import AuthPage from './features/auth/AuthPage';
import { useUIStore } from './stores/useUIStore';
import { useSessionStore } from './stores/useSessionStore';

export default function App() {
  const { activeNavItem, selectedAgentId, selectedCrewAgentId } = useUIStore();
  const { isAuthenticated } = useSessionStore();

  // URL Hash to Store State Synchronizer
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) {
        useUIStore.setState({ activeNavItem: 'automations', selectedAgentId: null, selectedCrewAgentId: null });
        return;
      }

      const path = hash.replace(/^#\/?/, '');
      const parts = path.split('/');
      const navId = parts[0];

      if (navId === 'crew-studio' && parts[1] === 'edit' && parts[2]) {
        useUIStore.setState({ activeNavItem: 'crew-studio', selectedCrewAgentId: parts[2], selectedAgentId: null });
      } else if (navId === 'agents' && parts[1]) {
        useUIStore.setState({ activeNavItem: 'agents', selectedAgentId: parts[1], selectedCrewAgentId: null });
      } else {
        useUIStore.setState({ activeNavItem: navId || 'automations', selectedAgentId: null, selectedCrewAgentId: null });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Store State to URL Hash Synchronizer
  useEffect(() => {
    if (!isAuthenticated) return;

    let newHash = `/${activeNavItem}`;
    if (activeNavItem === 'crew-studio' && selectedCrewAgentId) {
      newHash = `/crew-studio/edit/${selectedCrewAgentId}`;
    } else if (activeNavItem === 'agents' && selectedAgentId) {
      newHash = `/agents/${selectedAgentId}`;
    }

    if (window.location.hash !== `#${newHash}`) {
      window.location.hash = newHash;
    }
  }, [activeNavItem, selectedAgentId, selectedCrewAgentId, isAuthenticated]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    if (activeNavItem === 'agents') {
      return selectedAgentId ? <AgentDetail /> : <AgentsRepository />;
    }

    if (activeNavItem === 'crew-studio' && !selectedCrewAgentId) {
      return (
        <>
          <ChatSidebar />
          <main className="flex-1 relative overflow-hidden flex h-full">
            <CrewStudioDashboard />
            <RightPanel />
          </main>
        </>
      );
    }

    if (activeNavItem === 'tools') {
      return <ToolsPage />;
    }

    return (
      <>
        <ChatSidebar />
        <main className="flex-1 relative overflow-hidden flex h-full">
          <FlowCanvas />
          <RightPanel />
        </main>
      </>
    );
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}
