import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useToolStore = create(
  persist(
    (set, get) => ({
      tools: [],
      categories: [],
      searchQuery: '',
      expandedCategories: [],
      
      // Saved real tool credentials keyed by tool ID (e.g. 'github', 'openai', 'gemini')
      credentials: {
        github: {
          token: 'ghp_live_7894561230abcdef',
          repoOwner: 'devansh18',
          repoName: 'awas',
          status: 'Configured',
          updatedAt: new Date().toISOString()
        },
        openai: {
          apiKey: 'sk-proj-live-897123456789abcdef',
          status: 'Active',
          updatedAt: new Date().toISOString()
        },
        gemini: {
          apiKey: 'AIzaSyLiveSecretKey9876543210',
          status: 'Active',
          updatedAt: new Date().toISOString()
        }
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

      saveCredentials: (toolId, credData) => {
        set((state) => ({
          credentials: {
            ...state.credentials,
            [toolId]: {
              ...(state.credentials[toolId] || {}),
              ...credData,
              status: credData.status || 'Configured',
              updatedAt: new Date().toISOString()
            }
          }
        }));
      },

      removeCredentials: (toolId) => {
        set((state) => {
          const next = { ...state.credentials };
          delete next[toolId];
          return { credentials: next };
        });
      },

      getCredentials: (toolId) => {
        return get().credentials[toolId] || null;
      }
    }),
    {
      name: 'user_tool_credentials_store'
    }
  )
);
