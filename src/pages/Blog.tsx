import { useNavigate } from 'react-router-dom';
import { BlogPage } from '../components/BlogPage';

export function Blog() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleNavigate = (view: 'privacy' | 'terms' | 'vendors' | 'about' | 'blog') => {
    navigate(`/${view}`);
  };

  return <BlogPage onGetStarted={handleGetStarted} onNavigate={handleNavigate} />;
}
