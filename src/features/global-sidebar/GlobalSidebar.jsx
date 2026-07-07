import React from 'react';
import { PanelLeftClose, PanelLeftOpen, BookOpen } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useSessionStore } from '../../stores/useSessionStore';
import { NAV_GROUPS } from '../../utils/constants';
import OrgSelector from './OrgSelector';
import NavGroup from './NavGroup';
import NavItem from './NavItem';
import { cn } from '../../utils/cn';

export default function GlobalSidebar() {
  const { isSidebarCollapsed, toggleSidebar, activeNavItem, setActiveNavItem } = useUIStore();
  const { organization } = useSessionStore();

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-white border-r border-gray-200 transition-all duration-300 select-none z-30",
        isSidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Top Organization Selector */}
      <div className="pt-2">
        <OrgSelector organization={organization} isCollapsed={isSidebarCollapsed} />
      </div>

      <div className="border-b border-gray-100 mx-3 my-1" />

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-1">
        {NAV_GROUPS.map((group) => (
          <NavGroup
            key={group.title}
            title={group.title}
            items={group.items}
            isCollapsed={isSidebarCollapsed}
            activeItem={activeNavItem}
            onItemClick={setActiveNavItem}
          />
        ))}
      </div>

      <div className="border-b border-gray-100 mx-3 my-1" />

      {/* Bottom Actions */}
      <div className="p-2 space-y-1">
        {/* Resources collapsed/expanded */}
        <NavItem
          id="resources"
          label="Resources"
          icon="BookOpen"
          isActive={activeNavItem === 'resources'}
          isCollapsed={isSidebarCollapsed}
          onClick={setActiveNavItem}
        />

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-150 outline-none",
            isSidebarCollapsed ? "justify-center" : "justify-start"
          )}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 flex-shrink-0" />
              <span>Collapse Nav</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
