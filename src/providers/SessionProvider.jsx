import { useEffect } from 'react';
import { useSessionStore } from '../stores/useSessionStore';

export function SessionProvider({ children }) {
  const { login, setOrganization } = useSessionStore();

  useEffect(() => {
    login({ id: '1', name: 'User', email: '<email>' }, 'local');
    setOrganization({ id: '1', name: 'Local Workspace' });
  }, []);

  return children;
}
