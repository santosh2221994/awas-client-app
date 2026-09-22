import { create } from 'zustand';

export function computeIsDark(theme) {
  if (typeof window === 'undefined') return false;
  const t = (theme || '').toLowerCase();
  if (t === 'dark') return true;
  if (t === 'light') return false;
  // 'system' or default
  return !!(
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function applyThemeClass(theme) {
  if (typeof window === 'undefined') return false;
  const isDark = computeIsDark(theme);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return isDark;
}

const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'Light';
  return localStorage.getItem('awas-theme') || 'Light';
};

const initialTheme = getStoredTheme();
const initialIsDark = applyThemeClass(initialTheme);

export const useUIStore = create((set, get) => {
  // Listen for OS color scheme changes when in System mode
  if (typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const current = (get()?.theme || 'Light').toLowerCase();
      if (current === 'system') {
        const isDark = e.matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ isDarkMode: isDark });
      }
    });
  }

  return {
    theme: initialTheme,
    isDarkMode: initialIsDark,

    setTheme: (theme, syncBackend = true) => {
      const normalized =
        theme === 'Dark' || theme === 'dark'
          ? 'Dark'
          : theme === 'Light' || theme === 'light'
          ? 'Light'
          : 'System';

      if (typeof window !== 'undefined') {
        localStorage.setItem('awas-theme', normalized);
      }
      const isDark = applyThemeClass(normalized);
      set({ theme: normalized, isDarkMode: isDark });

      if (syncBackend && typeof window !== 'undefined') {
        import('../api/services/settingsService.js')
          .then((m) => (m.default || m.settingsService)?.updateAppearance({ theme: normalized }))
          .catch(() => {});
      }
    },

    toggleTheme: () => {
      // Direct toggle between Light and Dark: if currently dark, switch to Light; else Dark.
      const isCurrentlyDark = get().isDarkMode;
      const next = isCurrentlyDark ? 'Light' : 'Dark';
      get().setTheme(next);
    },

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

  projectTitle: null,
  setProjectTitle: (title) => set({ projectTitle: title }),

  setRightPanelView: (view) => set({ rightPanelView: view }),
  };
});

