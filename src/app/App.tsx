import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { refreshSession } from '@/api/session';
import { AppProviders } from './providers/AppProviders';
import { router } from './router';

export function App() {
  // On start-up, try to restore the session from the HttpOnly refresh cookie.
  useEffect(() => {
    void refreshSession();
  }, []);

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
