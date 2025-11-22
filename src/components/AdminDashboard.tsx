import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Store,
  MessageSquare,
  Users,
  LogOut,
  Shield,
  ArrowLeft,
  Package,
  BarChart3,
  Briefcase,
  UserPlus,
  FileText
} from 'lucide-react';
import { GiftPartnersAdmin } from './GiftPartnersAdmin';
import { ContactSubmissions } from './ContactSubmissions';
import { ProductReview } from './ProductReview';
import { AdminStats } from './AdminStats';
import { PartnershipEnquiries } from './PartnershipEnquiries';
import { UserToPartnerConverter } from './UserToPartnerConverter';
import { BlogManagement } from './BlogManagement';

type AdminView = 'overview' | 'partners' | 'submissions' | 'products' | 'stats' | 'partnerships' | 'convert' | 'blog';

type AdminDashboardProps = {
  onBack: () => void;
};

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { isAdmin, adminRole, loading } = useAdmin();
  const { user, signOut } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [showPartnersAdmin, setShowPartnersAdmin] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showProductReview, setShowProductReview] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showPartnershipEnquiries, setShowPartnershipEnquiries] = useState(false);
  const [showUserConverter, setShowUserConverter] = useState(false);
  const [showBlogManagement, setShowBlogManagement] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const adminCards = [
    {
      id: 'stats' as const,
      title: 'Platform Statistics',
      description: 'Real-time analytics and metrics',
      icon: BarChart3,
      color: 'bg-purple-500',
      onClick: () => setShowStats(true),
    },
    {
      id: 'partners' as const,
      title: 'Maison Mai Partners',
      description: 'Manage vendor partnerships and deals',
      icon: Store,
      color: 'bg-blue-500',
      onClick: () => setShowPartnersAdmin(true),
    },
    {
      id: 'products' as const,
      title: 'Product Review',
      description: 'Review and approve partner products',
      icon: Package,
      color: 'bg-orange-500',
      onClick: () => setShowProductReview(true),
    },
    {
      id: 'submissions' as const,
      title: 'Contact Submissions',
      description: 'View and manage user inquiries',
      icon: MessageSquare,
      color: 'bg-green-500',
      onClick: () => setShowSubmissions(true),
    },
    {
      id: 'partnerships' as const,
      title: 'Partnership Enquiries',
      description: 'Manage partnership applications',
      icon: Briefcase,
      color: 'bg-indigo-500',
      onClick: () => setShowPartnershipEnquiries(true),
    },
    {
      id: 'convert' as const,
      title: 'Convert User to Partner',
      description: 'Convert existing users to partner accounts',
      icon: UserPlus,
      color: 'bg-teal-500',
      onClick: () => setShowUserConverter(true),
    },
    {
      id: 'blog' as const,
      title: 'Blog Management',
      description: 'Create and manage blog posts',
      icon: FileText,
      color: 'bg-pink-500',
      onClick: () => setShowBlogManagement(true),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back to App</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="bg-gray-900 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Admin Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                {adminRole && (
                  <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded mt-1">
                    {adminRole.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage your Maison Mai platform from here
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Platform overview and analytics
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={card.onClick}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all text-left group"
                >
                  <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {showStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Platform Statistics</h3>
              <button onClick={() => setShowStats(false)} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <AdminStats />
            </div>
          </div>
        </div>
      )}
      {showPartnersAdmin && (
        <GiftPartnersAdmin onClose={() => setShowPartnersAdmin(false)} />
      )}
      {showProductReview && (
        <ProductReview onClose={() => setShowProductReview(false)} />
      )}
      {showSubmissions && (
        <ContactSubmissions onClose={() => setShowSubmissions(false)} />
      )}
      {showPartnershipEnquiries && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Partnership Enquiries</h3>
              <button onClick={() => setShowPartnershipEnquiries(false)} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <PartnershipEnquiries />
            </div>
          </div>
        </div>
      )}
      {showUserConverter && (
        <UserToPartnerConverter onClose={() => setShowUserConverter(false)} />
      )}
      {showBlogManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Blog Management</h3>
              <button onClick={() => setShowBlogManagement(false)} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <BlogManagement />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
