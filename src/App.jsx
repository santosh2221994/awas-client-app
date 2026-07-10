import React from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import ChatSidebar from './features/chat-sidebar/ChatSidebar';
import FlowCanvas from './features/canvas/FlowCanvas';
import RightPanel from './features/right-panel/RightPanel';
import AgentsRepository from './features/agents/AgentsRepository';
import AgentDetail from './features/agents/AgentDetail';
import { useUIStore } from './stores/useUIStore';

export default function App() {
  const { activeNavItem, selectedAgentId } = useUIStore();

  const renderContent = () => {
    if (activeNavItem === 'agents') {
      return selectedAgentId ? <AgentDetail /> : <AgentsRepository />;
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
