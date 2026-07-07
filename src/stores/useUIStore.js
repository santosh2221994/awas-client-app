import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isSidebarCollapsed: false,
  isRightPanelOpen: false,
  activeTab: 'canvas',
  activeNavItem: 'automations',
  rightPanelView: 'tools',

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  toggleRightPanel: () =>
    set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  setRightPanelOpen: (open) => set({ isRightPanelOpen: open }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setActiveNavItem: (item) => set({ activeNavItem: item }),

  setRightPanelView: (view) => set({ rightPanelView: view }),
}));
