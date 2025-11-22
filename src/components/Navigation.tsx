import { LayoutDashboard, Users, Gift, Store, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'people', path: '/people', label: 'People', icon: Users },
    { id: 'gifts', path: '/gift-ideas', label: 'Gift Ideas', icon: Gift },
    { id: 'partners', path: '/partners', label: 'Partners', icon: Store },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/people') return 'people';
    if (path === '/gift-ideas') return 'gifts';
    if (path === '/partners') return 'partners';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between sm:justify-start sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  navigate(tab.path);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 border-b-2 font-semibold text-xs sm:text-sm transition-colors min-w-fit ${
                  isActive
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
