import { create } from 'zustand';

export const useToolStore = create((set) => ({
  tools: [],
  categories: [],
  searchQuery: '',
  expandedCategories: [],

  setTools: (tools) => set({ tools }),

  setCategories: (categories) => set({ categories }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleCategory: (id) =>
    set((state) => ({
      expandedCategories: state.expandedCategories.includes(id)
        ? state.expandedCategories.filter((cid) => cid !== id)
        : [...state.expandedCategories, id],
    })),

  fetchTools: async () => {
    // Placeholder — replace with real API call
    set({ tools: [], categories: [] });
  },
}));
