import { useEffect } from 'react';
import { useSessionStore } from '../stores/useSessionStore';

export function SessionProvider({ children }) {
  const login = useSessionStore((s) => s.login);
  const setOrganization = useSessionStore((s) => s.setOrganization);

  useEffect(() => {
    const mockUser = {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@crewai.com',
    };
    const mockOrg = {
      id: '1',
      name: 'Your organization',
    };

    login(mockUser, null);
    setOrganization(mockOrg);
  }, [login, setOrganization]);

  return children;
}
