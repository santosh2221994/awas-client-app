import React from 'react';
import GlobalSidebar from '../features/global-sidebar/GlobalSidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 select-none transition-colors duration-200">
      {/* Narrow Global Sidebar Navigation */}
      <GlobalSidebar />

      {/* Main Feature Viewport */}
      <div className="flex-1 flex overflow-hidden bg-white dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
}
