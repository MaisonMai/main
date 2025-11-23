import { createBrowserRouter } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { About } from './pages/About';
import { Blog } from './pages/Blog';
import { Privacy } from './pages/Privacy';
import { TermsPage } from './pages/Terms';
import { Vendors } from './pages/Vendors';
import { DashboardPage } from './pages/Dashboard';
import { People } from './pages/People';
import { GiftIdeas } from './pages/GiftIdeas';
import { Partners } from './pages/Partners';
import { Settings } from './pages/Settings';
import { AdminPage } from './pages/Admin';
import { PartnerPage } from './pages/Partner';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/blog',
    element: <Blog />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/vendors',
    element: <Vendors />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/people',
    element: <People />,
  },
  {
    path: '/gift-ideas',
    element: <GiftIdeas />,
  },
  {
    path: '/gift-shops',
    element: <Partners />,
  },
  {
    path: '/partners',
    element: <Partners />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '/partner',
    element: <PartnerPage />,
  },
]);
