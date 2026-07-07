import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSessionStore = create(
  persist(
    (set) => ({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) =>
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          organization: null,
          token: null,
          isAuthenticated: false,
        }),

      setOrganization: (org) => set({ organization: org }),

      setToken: (token) => set({ token }),

      hydrate: () => {
        const state = useSessionStore.getState();
        if (state.token && state.user) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'agi-session',
    }
  )
);
