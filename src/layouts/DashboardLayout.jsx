import React from 'react';
import GlobalSidebar from '../features/global-sidebar/GlobalSidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white select-none">
      {/* Narrow Global Sidebar Navigation */}
      <GlobalSidebar />

      {/* Main Feature Viewport */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}
