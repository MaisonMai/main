import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { PartnerProvider } from './contexts/PartnerContext';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Terms } from './components/Terms';
import { VendorPage } from './components/VendorPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutPage } from './components/AboutPage';
import { BlogPage } from './components/BlogPage';
import { PartnerDashboard } from './components/PartnerDashboard';

type AppView = 'landing' | 'auth' | 'dashboard' | 'privacy' | 'terms' | 'vendors' | 'admin' | 'about' | 'blog' | 'partner';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' && user) {
      setCurrentView('admin');
    } else if (path === '/partner' && user) {
      setCurrentView('partner');
    }
  }, [user]);

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

  if (user && currentView === 'landing') {
    setCurrentView('dashboard');
  }

  if (currentView === 'privacy') {
    return <PrivacyPolicy onBack={() => setCurrentView(user ? 'dashboard' : 'landing')} />;
  }

  if (currentView === 'terms') {
    return <Terms onBack={() => setCurrentView(user ? 'dashboard' : 'landing')} />;
  }

  if (currentView === 'vendors') {
    return <VendorPage onBack={() => setCurrentView(user ? 'dashboard' : 'landing')} />;
  }

  if (currentView === 'about') {
    return <AboutPage onBack={() => setCurrentView(user ? 'dashboard' : 'landing')} />;
  }

  if (currentView === 'blog') {
    return <BlogPage onBack={() => setCurrentView(user ? 'dashboard' : 'landing')} />;
  }

  if (currentView === 'admin') {
    if (!user) {
      setCurrentView('auth');
      return null;
    }
    return <AdminDashboard onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'partner') {
    if (!user) {
      setCurrentView('auth');
      return null;
    }
    return <PartnerDashboard />;
  }

  if (user) {
    return <Dashboard onNavigate={setCurrentView} />;
  }

  if (currentView === 'auth') {
    return <AuthForm onBackToLanding={() => setCurrentView('landing')} />;
  }

  return <LandingPage onGetStarted={() => setCurrentView('auth')} onNavigate={setCurrentView} />;
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <PartnerProvider>
          <AppContent />
        </PartnerProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
