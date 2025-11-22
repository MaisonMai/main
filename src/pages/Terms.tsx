import { useNavigate } from 'react-router-dom';
import { Terms } from '../components/Terms';

export function TermsPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleNavigate = (view: 'privacy' | 'terms' | 'vendors' | 'about' | 'blog') => {
    navigate(`/${view}`);
  };

  return <Terms onGetStarted={handleGetStarted} onNavigate={handleNavigate} />;
}
