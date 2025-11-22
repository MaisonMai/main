import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LandingPage } from '../components/LandingPage';
import { useEffect } from 'react';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleNavigate = (view: 'privacy' | 'terms' | 'vendors' | 'about' | 'blog') => {
    navigate(`/${view}`);
  };

  return <LandingPage onGetStarted={handleGetStarted} onNavigate={handleNavigate} />;
}
