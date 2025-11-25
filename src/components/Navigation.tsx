import { LayoutDashboard, Users, Gift, Store, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'people', path: '/people', label: 'People', icon: Users },
    { id: 'gifts', path: '/gift-ideas', label: 'Gift Ideas', icon: Gift },
    { id: 'giftshops', path: '/gift-shops', label: 'Gift Shops', icon: Store },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/people') return 'people';
    if (path === '/gift-ideas') return 'gifts';
    if (path === '/gift-shops' || path === '/partners') return 'giftshops';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="bg-white border-t sm:border-t-0 sm:border-b border-gray-200 fixed sm:sticky bottom-0 sm:top-0 left-0 right-0 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] sm:shadow-none">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="flex justify-around sm:justify-start sm:space-x-8 overflow-x-auto">
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
                className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-4 sm:px-4 py-2.5 sm:py-4 border-b-0 sm:border-b-2 font-medium text-[10px] sm:text-sm transition-all min-w-fit flex-1 sm:flex-initial ${
                  isActive
                    ? 'sm:border-primary-500 text-primary-600 sm:text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 sm:hover:bg-transparent sm:hover:border-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 sm:w-5 sm:h-5 ${isActive ? 'text-primary-600' : ''}`} />
                <span className="leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
