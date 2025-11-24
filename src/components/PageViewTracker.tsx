import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/tracking';

export function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const pageName = location.pathname.split('/').filter(Boolean).join(' / ') || 'home';
    trackPageView(pageName, location.pathname);
  }, [location]);

  return null;
}
