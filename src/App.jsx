import React from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import ChatSidebar from './features/chat-sidebar/ChatSidebar';
import FlowCanvas from './features/canvas/FlowCanvas';
import RightPanel from './features/right-panel/RightPanel';

export default function App() {
  return (
    <DashboardLayout>
      {/* Inner Left Sidebar (Studio Chat) */}
      <ChatSidebar />

      {/* Center canvas and Right Tools drawer layout */}
      <main className="flex-1 relative overflow-hidden flex h-full">
        <FlowCanvas />
        <RightPanel />
      </main>
    </DashboardLayout>
  );
}
