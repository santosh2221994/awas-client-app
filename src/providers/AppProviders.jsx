import { ReactFlowProvider } from '@xyflow/react';
import { SessionProvider } from './SessionProvider';

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </SessionProvider>
  );
}
