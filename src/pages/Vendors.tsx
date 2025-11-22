import { useNavigate } from 'react-router-dom';
import { VendorPage } from '../components/VendorPage';

export function Vendors() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleNavigate = (view: 'privacy' | 'terms' | 'vendors' | 'about' | 'blog') => {
    navigate(`/${view}`);
  };

  return <VendorPage onGetStarted={handleGetStarted} onNavigate={handleNavigate} />;
}
