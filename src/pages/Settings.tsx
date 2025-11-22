import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { SettingsView } from '../components/SettingsView';
import { ProfileCompletion } from '../components/ProfileCompletion';
import { AdBanner } from '../components/AdBanner';
import { Gift, Shield } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

export function Settings() {
  const { user, loading, profileComplete } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  if (!profileComplete) {
    return <ProfileCompletion />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gray-900 p-2 rounded-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MaisonMai</span>
            </button>
          </div>
        </div>
      </header>

      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettingsView />
      </main>

      <AdBanner />

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/privacy')}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate('/terms')}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Terms of Service
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm transition-colors font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 MaisonMai by Virtual Speed Date Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
