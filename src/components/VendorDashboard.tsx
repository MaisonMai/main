import { useState, useEffect } from 'react';
import { supabase, GiftPartner } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Store, ArrowLeft, Upload, Save, BarChart3, MessageSquare } from 'lucide-react';
import { PartnerProductManagement } from './PartnerProductManagement';
import { VendorMessages } from './VendorMessages';

type VendorDashboardProps = {
  onBack: () => void;
};

export function VendorDashboard({ onBack }: VendorDashboardProps) {
  const { user } = useAuth();
  const [partner, setPartner] = useState<GiftPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'products' | 'messages' | 'stats'>('profile');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    website_url: '',
    discount_code: '',
    discount_description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });

  useEffect(() => {
    loadPartner();
  }, [user]);

  const loadPartner = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('gift_partners')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPartner(data);
        setFormData({
          name: data.name,
          description: data.description,
          logo_url: data.logo_url || '',
          website_url: data.website_url || '',
          discount_code: data.discount_code || '',
          discount_description: data.discount_description || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          postal_code: data.postal_code || '',
        });
      }
    } catch (error) {
      console.error('Error loading partner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('gift_partners')
        .update(formData)
        .eq('id', partner.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      await loadPartner();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Partner Profile</h2>
          <p className="text-gray-600 mb-6">
            You don't have a gift partner profile yet. Please contact our team to become a vendor.
          </p>
          <a
            href="mailto:vendors@maisonmai.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Contact Vendor Team
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-gray-900 p-2 rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Vendor Dashboard</span>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {partner.approval_status === 'pending' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Pending Approval:</strong> Your partner profile is currently under review. You can manage products, but they won't be visible until approved.
            </p>
          </div>
        )}

        {partner.approval_status === 'rejected' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              <strong>Profile Rejected:</strong> Your partner profile was not approved. Please contact our team for more information.
            </p>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{partner.name}</h1>
          <p className="text-gray-500 mt-1">Manage your vendor profile and products</p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'products'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'messages'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'stats'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Statistics
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="https://..."
                />
                {formData.logo_url && (
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="mt-2 h-20 object-contain"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Address Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code
                </label>
                <input
                  type="text"
                  value={formData.discount_code}
                  onChange={(e) => setFormData({ ...formData, discount_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="SAVE20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Description
                </label>
                <input
                  type="text"
                  value={formData.discount_description}
                  onChange={(e) => setFormData({ ...formData, discount_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="20% off your first order"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'products' && <PartnerProductManagement partner={partner} />}

        {activeTab === 'messages' && <VendorMessages partner={partner} />}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Statistics Coming Soon</h3>
            <p className="text-gray-600">
              Track your product views, clicks, and engagement metrics here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
