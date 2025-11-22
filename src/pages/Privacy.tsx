import { useNavigate } from 'react-router-dom';
import { PrivacyPolicy } from '../components/PrivacyPolicy';

export function Privacy() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleNavigate = (view: 'privacy' | 'terms' | 'vendors' | 'about' | 'blog') => {
    navigate(`/${view}`);
  };

  return <PrivacyPolicy onGetStarted={handleGetStarted} onNavigate={handleNavigate} />;
}
