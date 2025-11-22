import { useNavigate } from 'react-router-dom';
import { AboutPage } from '../components/AboutPage';

export function About() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleNavigate = (view: 'privacy' | 'terms' | 'vendors' | 'about' | 'blog') => {
    navigate(`/${view}`);
  };

  return <AboutPage onGetStarted={handleGetStarted} onNavigate={handleNavigate} />;
}
