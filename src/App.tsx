import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { PartnerProvider } from './contexts/PartnerContext';
import { router } from './router';

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
