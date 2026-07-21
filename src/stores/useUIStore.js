import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isSidebarCollapsed: false,
  isRightPanelOpen: false,
  activeTab: 'canvas',
  activeNavItem: 'automations',
  selectedAgentId: null,
  selectedCrewAgentId: null,
  rightPanelView: 'tools',

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  toggleRightPanel: () =>
    set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  setRightPanelOpen: (open) => set({ isRightPanelOpen: open }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setActiveNavItem: (item) => set({ activeNavItem: item }),

  setSelectedAgentId: (agentId) => set({ selectedAgentId: agentId }),
  clearSelectedAgentId: () => set({ selectedAgentId: null }),

  setSelectedCrewAgentId: (agentId) => set({ selectedCrewAgentId: agentId }),
  clearSelectedCrewAgentId: () => set({ selectedCrewAgentId: null }),

  setRightPanelView: (view) => set({ rightPanelView: view }),
}));
