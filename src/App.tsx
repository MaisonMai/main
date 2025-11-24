import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { PartnerProvider } from './contexts/PartnerContext';
import { router } from './router';
import { trackPageView } from './lib/tracking';

function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const pageName = location.pathname.split('/').filter(Boolean).join(' / ') || 'home';
    trackPageView(pageName, location.pathname);
  }, [location]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <PartnerProvider>
          <RouterProvider router={router} />
        </PartnerProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
