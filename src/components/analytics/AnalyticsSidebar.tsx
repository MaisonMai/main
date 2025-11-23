import { BarChart3, Filter, TrendingUp, Package, Users, Activity, LayoutDashboard, FileText, ShoppingBag, Mail, Handshake, UserCog } from 'lucide-react';

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
  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 no-print">
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
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
  );
}
