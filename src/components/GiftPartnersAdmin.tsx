import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, ExternalLink, Save, AlertCircle, BarChart3, MapPin } from 'lucide-react';
import { supabase, GiftPartner } from '../lib/supabase';
import { PartnerAnalytics } from './PartnerAnalytics';

type GiftPartnersAdminProps = {
  onClose: () => void;
};

type PartnerForm = Omit<GiftPartner, 'id' | 'created_at' | 'updated_at'>;

export function GiftPartnersAdmin({ onClose }: GiftPartnersAdminProps) {
  const [partners, setPartners] = useState<GiftPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<GiftPartner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewingAnalytics, setViewingAnalytics] = useState<GiftPartner | null>(null);
  const [formData, setFormData] = useState<PartnerForm>({
    name: '',
    description: '',
    logo_url: null,
    website_url: null,
    discount_code: null,
    discount_description: null,
    categories: [],
    is_active: true,
    display_order: 0,
    user_id: null,
    approval_status: 'approved',
    address: null,
    city: null,
    state: null,
    country: null,
    postal_code: null,
  });
  const [categoryInput, setCategoryInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_partners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (err) {
      console.error('Error loading MaisonMai Partners:', err);
      setError('Failed to load MaisonMai Partners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingPartner) {
        const { error: updateError } = await supabase
          .from('gift_partners')
          .update(formData)
          .eq('id', editingPartner.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('gift_partners')
          .insert(formData);

        if (insertError) throw insertError;
      }

      await loadPartners();
      resetForm();
    } catch (err: any) {
      console.error('Error saving partner:', err);
      setError(err.message || 'Failed to save partner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;

    try {
      const { error } = await supabase
        .from('gift_partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadPartners();
    } catch (err) {
      console.error('Error deleting partner:', err);
      setError('Failed to delete partner');
    }
  };

  const handleEdit = (partner: GiftPartner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      description: partner.description,
      logo_url: partner.logo_url,
      website_url: partner.website_url,
      discount_code: partner.discount_code,
      discount_description: partner.discount_description,
      categories: partner.categories,
      is_active: partner.is_active,
      display_order: partner.display_order,
      user_id: partner.user_id,
      approval_status: partner.approval_status,
      address: partner.address,
      city: partner.city,
      state: partner.state,
      country: partner.country,
      postal_code: partner.postal_code,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      description: '',
      logo_url: null,
      website_url: null,
      discount_code: null,
      discount_description: null,
      categories: [],
      is_active: true,
      display_order: 0,
      user_id: null,
      approval_status: 'approved',
      address: null,
      city: null,
      state: null,
      country: null,
      postal_code: null,
    });
    setCategoryInput('');
    setShowForm(false);
  };

  const addCategory = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()],
      }));
      setCategoryInput('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">MaisonMai Partners Admin</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Partner
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.website_url || ''}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value || null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.logo_url || ''}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Code (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.discount_code || ''}
                    onChange={(e) => setFormData({ ...formData, discount_code: e.target.value || null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Description (optional)
                </label>
                <input
                  type="text"
                  value={formData.discount_description || ''}
                  onChange={(e) => setFormData({ ...formData, discount_description: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Address Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value || null })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value || null })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value || null })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.country || ''}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value || null })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code || ''}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value || null })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                    placeholder="Add category"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-lg text-sm"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingPartner ? 'Update' : 'Create'} Partner
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No MaisonMai Partners added yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
                >
                  {partner.logo_url && (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-50"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{partner.name}</h4>
                      {!partner.is_active && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">{partner.description}</p>
                    {partner.discount_code && (
                      <code className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded mt-1 inline-block">
                        {partner.discount_code}
                      </code>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {partner.website_url && (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Visit website"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                    {partner.address && (
                      <button
                        onClick={() => {
                          const address = [partner.address, partner.city, partner.state, partner.postal_code, partner.country]
                            .filter(Boolean)
                            .join(', ');
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View on map"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setViewingAnalytics(partner)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View analytics"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(partner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit partner"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete partner"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewingAnalytics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Partner Analytics</h3>
              <button
                onClick={() => setViewingAnalytics(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <PartnerAnalytics partner={viewingAnalytics} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
