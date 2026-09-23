import { create } from 'zustand';

export const useSessionStore = create((set) => ({
  user: null,
  organization: null,
  token: null,
  isAuthenticated: false,
  isHydrating: true, // true while we attempt silent refresh on load

  login: (userData, token) =>
    set({ user: userData, token, isAuthenticated: true, isHydrating: false }),

  logout: () =>
    set({ user: null, organization: null, token: null, isAuthenticated: false, isHydrating: false }),

  setOrganization: (org) => set({ organization: org }),

  setToken: (token) => set({ token }),

  setHydrating: (val) => set({ isHydrating: val }),
}));
