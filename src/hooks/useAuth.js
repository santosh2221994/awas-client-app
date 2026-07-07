import { useSessionStore } from '../stores/useSessionStore';

export function useAuth() {
  const user = useSessionStore((s) => s.user);
  const organization = useSessionStore((s) => s.organization);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const login = useSessionStore((s) => s.login);
  const logout = useSessionStore((s) => s.logout);

  return { user, organization, isAuthenticated, login, logout };
}
