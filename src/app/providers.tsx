'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { SceneEntryProvider } from '@/contexts/SceneEntryContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SceneEntryProvider>{children}</SceneEntryProvider>
    </Provider>
  );
}
