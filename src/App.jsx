import React, { useEffect, lazy, Suspense } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import ChatSidebar from './features/chat-sidebar/ChatSidebar';
import RightPanel from './features/right-panel/RightPanel';
import AuthPage from './features/auth/AuthPage';
import { useUIStore } from './stores/useUIStore';
import { useSessionStore } from './stores/useSessionStore';

// Lazy loaded page components for code splitting & faster initial load
const AgentsRepository = lazy(() => import('./features/agents/AgentsRepository'));
const AgentDetail = lazy(() => import('./features/agents/AgentDetail'));
const CrewStudioDashboard = lazy(() => import('./features/crew-studio/CrewStudioDashboard'));
const ToolsPage = lazy(() => import('./features/tools/ToolsPage'));
const AutomationsPage = lazy(() => import('./features/automations/AutomationsPage'));
const TracesPage = lazy(() => import('./features/traces/TracesPage'));
const LLMConnectionsPage = lazy(() => import('./features/llm-connections/LLMConnectionsPage'));
const EnvVarsPage = lazy(() => import('./features/env-vars/EnvVarsPage'));
const UsagePage = lazy(() => import('./features/usage/UsagePage'));
const BillingPage = lazy(() => import('./features/billing/BillingPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const ResourcesPage = lazy(() => import('./features/resources/ResourcesPage'));
const FlowCanvas = lazy(() => import('./features/canvas/FlowCanvas'));

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-400 text-xs font-semibold select-none">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <span>Loading view...</span>
      </div>
    </div>
  );
}

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

    if (activeNavItem === 'automations') {
      return <AutomationsPage />;
    }

    if (activeNavItem === 'traces') {
      return <TracesPage />;
    }

    if (activeNavItem === 'llm-connections') {
      return <LLMConnectionsPage />;
    }

    if (activeNavItem === 'env-vars') {
      return <EnvVarsPage />;
    }

    if (activeNavItem === 'usage') {
      return <UsagePage />;
    }

    if (activeNavItem === 'billing') {
      return <BillingPage />;
    }

    if (activeNavItem === 'settings') {
      return <SettingsPage />;
    }

    if (activeNavItem === 'resources') {
      return <ResourcesPage />;
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
      <Suspense fallback={<LoadingFallback />}>
        {renderContent()}
      </Suspense>
    </DashboardLayout>
  );
}
