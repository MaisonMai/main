import { useState } from 'react';
import { BarChart3, Filter, TrendingUp, Package, Users, Activity, LayoutDashboard, FileText, ShoppingBag, Mail, Handshake, UserCog, Menu, X } from 'lucide-react';

type SidebarProps = {
  currentView: string;
  onViewChange: (view: string) => void;
};

const menuItems = [
  { id: 'platform', label: 'Platform Statistics', icon: LayoutDashboard },
  { id: 'overview', label: 'Analytics Overview', icon: BarChart3 },
  { id: 'funnel', label: 'Funnel', icon: Filter },
  { id: 'engagement', label: 'Engagement', icon: TrendingUp },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'retention', label: 'Retention', icon: Users },
  { id: 'events', label: 'Events (Raw logs)', icon: Activity },
  { id: 'blog', label: 'Blog Management', icon: FileText },
  { id: 'product-review', label: 'Product Review', icon: ShoppingBag },
  { id: 'contact', label: 'Contact Submissions', icon: Mail },
  { id: 'partnerships', label: 'Partnership Enquiries', icon: Handshake },
  { id: 'convert', label: 'Convert User to Partner', icon: UserCog }
];

export function AnalyticsSidebar({ currentView, onViewChange }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleItemClick = (viewId: string) => {
    onViewChange(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 no-print
        transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
