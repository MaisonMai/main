import { useState, useEffect } from 'react';
import { supabase, GiftPartner, GiftPartnerProduct } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Gift, Package, Edit, Plus, X, Check, Loader, Save, ExternalLink, Upload } from 'lucide-react';

export function PartnerDashboard() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<GiftPartner | null>(null);
  const [products, setProducts] = useState<GiftPartnerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<GiftPartnerProduct | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [profileForm, setProfileForm] = useState({
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
    categories: [] as string[],
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    image_url: '',
    product_url: '',
    categories: [] as string[],
  });

  useEffect(() => {
    loadPartnerData();
  }, [user]);

  const loadPartnerData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: partnerData, error: partnerError } = await supabase
        .from('gift_partners')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (partnerError) throw partnerError;

      if (partnerData) {
        setPartner(partnerData);
        setProfileForm({
          name: partnerData.name || '',
          description: partnerData.description || '',
          logo_url: partnerData.logo_url || '',
          website_url: partnerData.website_url || '',
          discount_code: partnerData.discount_code || '',
          discount_description: partnerData.discount_description || '',
          address: partnerData.address || '',
          city: partnerData.city || '',
          state: partnerData.state || '',
          country: partnerData.country || '',
          postal_code: partnerData.postal_code || '',
          categories: partnerData.categories || [],
        });

        const { data: productsData, error: productsError } = await supabase
          .from('gift_partner_products')
          .select('*')
          .eq('partner_id', partnerData.id)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !partner) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${partner.id}/logo-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('partner-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('partner-logos')
        .getPublicUrl(data.path);

      setProfileForm({ ...profileForm, logo_url: urlData.publicUrl });
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. You can still use a logo URL instead.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!partner) return;

    try {
      const isProfileComplete = !!(
        profileForm.name &&
        profileForm.description &&
        profileForm.website_url
      );

      const { error } = await supabase
        .from('gift_partners')
        .update({
          ...profileForm,
          profile_completed: isProfileComplete,
        })
        .eq('id', partner.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      setEditingProfile(false);
      loadPartnerData();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleAddProduct = async () => {
    if (!partner) return;

    try {
      const { error } = await supabase
        .from('gift_partner_products')
        .insert({
          partner_id: partner.id,
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          currency: productForm.currency,
          image_url: productForm.image_url || null,
          product_url: productForm.product_url,
          categories: productForm.categories,
          submitted_by: user?.id,
          status: 'pending',
        });

      if (error) throw error;

      alert('Product submitted for review!');
      setAddingProduct(false);
      setProductForm({
        name: '',
        description: '',
        price: '',
        currency: 'USD',
        image_url: '',
        product_url: '',
        categories: [],
      });
      loadPartnerData();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('gift_partner_products')
        .update({
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          currency: productForm.currency,
          image_url: productForm.image_url || null,
          product_url: productForm.product_url,
          categories: productForm.categories,
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      alert('Product updated successfully!');
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        currency: 'USD',
        image_url: '',
        product_url: '',
        categories: [],
      });
      loadPartnerData();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('gift_partner_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      alert('Product deleted successfully!');
      loadPartnerData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const startEditingProduct = (product: GiftPartnerProduct) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      currency: product.currency,
      image_url: product.image_url || '',
      product_url: product.product_url,
      categories: product.categories,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Partner Account Found</h2>
          <p className="text-gray-600">
            You don't have a partner account yet. Please contact an administrator to set up your partner account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Partner Dashboard</span>
            </div>
            {!partner.profile_completed && (
              <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
                Complete your profile to appear in listings
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Partner Profile</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {editingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL *
                    </label>
                    <input
                      type="url"
                      value={profileForm.website_url}
                      onChange={(e) => setProfileForm({ ...profileForm, website_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Partner Logo
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="text-center text-sm text-gray-500">or</div>
                      <input
                        type="url"
                        value={profileForm.logo_url}
                        onChange={(e) => setProfileForm({ ...profileForm, logo_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter logo URL..."
                        disabled={uploadingLogo}
                      />
                      {profileForm.logo_url && (
                        <img
                          src={profileForm.logo_url}
                          alt="Logo preview"
                          className="w-32 h-32 object-contain rounded-lg border border-gray-200 bg-gray-50 p-2"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Code
                    </label>
                    <input
                      type="text"
                      value={profileForm.discount_code}
                      onChange={(e) => setProfileForm({ ...profileForm, discount_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Description
                    </label>
                    <input
                      type="text"
                      value={profileForm.discount_description}
                      onChange={(e) => setProfileForm({ ...profileForm, discount_description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={profileForm.postal_code}
                      onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Profile
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {partner.logo_url && (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h3>
                    <p className="text-gray-600 mb-2">{partner.description}</p>
                    {partner.website_url && (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>

                {partner.discount_code && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-primary-900">
                      Discount Code: <span className="font-bold">{partner.discount_code}</span>
                    </p>
                    {partner.discount_description && (
                      <p className="text-sm text-primary-700 mt-1">{partner.discount_description}</p>
                    )}
                  </div>
                )}

                {partner.address && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">Address:</p>
                    <p>{partner.address}</p>
                    <p>
                      {[partner.city, partner.state, partner.postal_code, partner.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <button
              onClick={() => setAddingProduct(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {(addingProduct || editingProduct) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency *
                    </label>
                    <select
                      value={productForm.currency}
                      onChange={(e) => setProductForm({ ...productForm, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product URL *
                    </label>
                    <input
                      type="url"
                      value={productForm.product_url}
                      onChange={(e) => setProductForm({ ...productForm, product_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {editingProduct ? 'Update Product' : 'Submit Product'}
                  </button>
                  <button
                    onClick={() => {
                      setAddingProduct(false);
                      setEditingProduct(null);
                      setProductForm({
                        name: '',
                        description: '',
                        price: '',
                        currency: 'USD',
                        image_url: '',
                        product_url: '',
                        categories: [],
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        product.status === 'approved'
                          ? 'bg-primary-100 text-primary-800'
                          : product.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <p className="text-lg font-bold text-primary-600 mb-3">
                    {product.currency} {product.price.toFixed(2)}
                  </p>

                  {product.status === 'rejected' && product.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                      <p className="text-xs text-red-800">
                        <span className="font-medium">Rejection reason:</span> {product.rejection_reason}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditingProduct(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && !addingProduct && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first product for review.
              </p>
              <button
                onClick={() => setAddingProduct(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
