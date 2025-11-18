import { LayoutDashboard, Users, Gift, Store, Settings } from 'lucide-react';

type NavigationProps = {
  activeTab: 'dashboard' | 'people' | 'gifts' | 'partners' | 'settings';
  onTabChange: (tab: 'dashboard' | 'people' | 'gifts' | 'partners' | 'settings') => void;
};

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'people' as const, label: 'People', icon: Users },
    { id: 'gifts' as const, label: 'Gift Ideas', icon: Gift },
    { id: 'partners' as const, label: 'Partners', icon: Store },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

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
                  onTabChange(tab.id);
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
