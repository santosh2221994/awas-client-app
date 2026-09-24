import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { listTools, listToolConnections, saveToolConnection, deleteToolConnection } from '../api/services/toolService';

export const useToolStore = create(
  persist(
    (set, get) => ({
      tools: [],
      toolsList: [],
      categories: [],
      searchQuery: '',
      expandedCategories: [],
      isToolsLoading: false,
      toolsError: null,

      // Modal state for Sandbox & Schema viewing
      activeToolForSandbox: null,
      activeToolForSchema: null,

      // Saved real tool credentials keyed by tool ID (e.g. 'github', 'openai', 'gemini')
      credentials: {
        github: {
          token: 'ghp_live_7894561230abcdef',
          repoOwner: 'devansh18',
          repoName: 'awas',
          status: 'Configured',
          updatedAt: new Date().toISOString(),
        },
        openai: {
          apiKey: 'sk-proj-live-897123456789abcdef',
          status: 'Active',
          updatedAt: new Date().toISOString(),
        },
        gemini: {
          apiKey: 'AIzaSyLiveSecretKey9876543210',
          status: 'Active',
          updatedAt: new Date().toISOString(),
        },
      },

      setTools: (tools) => set({ tools }),

      setCategories: (categories) => set({ categories }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      toggleCategory: (id) =>
        set((state) => ({
          expandedCategories: state.expandedCategories.includes(id)
            ? state.expandedCategories.filter((cid) => cid !== id)
            : [...state.expandedCategories, id],
        })),

      openSandboxModal: (tool) => set({ activeToolForSandbox: tool }),
      closeSandboxModal: () => set({ activeToolForSandbox: null }),

      openSchemaModal: (tool) => set({ activeToolForSchema: tool }),
      closeSchemaModal: () => set({ activeToolForSchema: null }),

      fetchTools: async (category, query) => {
        set({ isToolsLoading: true, toolsError: null });
        try {
          const list = await listTools(category, query);
          const safeList = Array.isArray(list) ? list : [];
          set({ toolsList: safeList, tools: safeList, isToolsLoading: false });
          return safeList;
        } catch (err) {
          console.warn('[useToolStore] Failed to fetch tools from backend:', err);
          set({ isToolsLoading: false, toolsError: err.message || 'Failed to load tools' });
          return get().toolsList;
        }
      },

      syncBackendConnections: async () => {
        try {
          const connections = await listToolConnections();
          if (Array.isArray(connections) && connections.length > 0) {
            const nextCreds = { ...get().credentials };
            for (const conn of connections) {
              nextCreds[conn.id] = {
                ...(nextCreds[conn.id] || {}),
                name: conn.name,
                type: conn.type,
                status: conn.status,
                token: conn.tokenMasked || nextCreds[conn.id]?.token,
                apiKey: conn.apiKeyMasked || nextCreds[conn.id]?.apiKey,
                ...(conn.config || {}),
                updatedAt: conn.updatedAt || new Date().toISOString(),
              };
            }
            set({ credentials: nextCreds });
          }
        } catch (err) {
          console.warn('[useToolStore] Note syncing backend connections:', err);
        }
      },

      saveCredentials: (toolId, credData) => {
        set((state) => ({
          credentials: {
            ...state.credentials,
            [toolId]: {
              ...(state.credentials[toolId] || {}),
              ...credData,
              status: credData.status || 'Configured',
              updatedAt: new Date().toISOString(),
            },
          },
        }));

        // Fire-and-forget sync to backend MongoDB
        saveToolConnection(toolId, credData).catch(() => {});
      },

      removeCredentials: (toolId) => {
        set((state) => {
          const next = { ...state.credentials };
          delete next[toolId];
          return { credentials: next };
        });

        // Fire-and-forget delete from backend
        deleteToolConnection(toolId).catch(() => {});
      },

      getCredentials: (toolId) => {
        return get().credentials[toolId] || null;
      },
    }),
    {
      name: 'user_tool_credentials_store',
      partialize: (state) => ({ credentials: state.credentials }),
    }
  )
);
