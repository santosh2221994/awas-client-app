import { useEffect } from 'react';
import { useSessionStore } from '../stores/useSessionStore';

export function SessionProvider({ children }) {
  const { setOrganization } = useSessionStore();

  useEffect(() => {
    setOrganization({ id: '1', name: 'Local Workspace' });
  }, [setOrganization]);

  return children;
}

