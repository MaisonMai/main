import { useState, useEffect } from 'react';
import { supabase, GiftPartner, GiftPartnerProduct } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Phone, MapPin, ExternalLink, Package, Tag } from 'lucide-react';
import { trackPartnerClick, trackProductClick } from '../lib/tracking';

type GiftPartnerDetailProps = {
  partnerId: string;
  onBack: () => void;
  onStartChat: (partnerId: string) => void;
};

export function GiftPartnerDetail({ partnerId, onBack, onStartChat }: GiftPartnerDetailProps) {
  const { user } = useAuth();
  const [partner, setPartner] = useState<GiftPartner | null>(null);
  const [products, setProducts] = useState<GiftPartnerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartnerData();
  }, [partnerId]);

  const loadPartnerData = async () => {
    try {
      const [partnerResult, productsResult] = await Promise.all([
        supabase
          .from('gift_partners')
          .select('*')
          .eq('id', partnerId)
          .maybeSingle(),
        supabase
          .from('gift_partner_products')
          .select('*')
          .eq('partner_id', partnerId)
          .eq('status', 'approved')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false }),
      ]);

      if (partnerResult.error) throw partnerResult.error;
      if (productsResult.error) throw productsResult.error;

      setPartner(partnerResult.data);
      setProducts(productsResult.data || []);

      trackPartnerClick(partnerId, 'partner_profile');
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: GiftPartnerProduct) => {
    trackProductClick(product.id, partnerId, 'product_click');
    window.open(product.product_url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Partner Not Found</h2>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {partner.logo_url && (
                <div className="flex-shrink-0">
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="w-32 h-32 object-contain rounded-lg bg-gray-50 p-4"
                  />
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{partner.name}</h1>
                <p className="text-gray-600 mb-6">{partner.description}</p>

                {partner.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {partner.categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                      >
                        <Package className="w-4 h-4" />
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {partner.discount_code && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary-900 mb-2">
                          EXCLUSIVE DISCOUNT
                        </p>
                        <code className="bg-white px-3 py-2 rounded text-lg font-bold text-primary-700 border border-primary-300">
                          {partner.discount_code}
                        </code>
                        {partner.discount_description && (
                          <p className="text-sm text-primary-700 mt-2">
                            {partner.discount_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {partner.address && (
                    <button
                      onClick={() => {
                        const address = [partner.address, partner.city, partner.state, partner.postal_code, partner.country]
                          .filter(Boolean)
                          .join(', ');
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <MapPin className="w-5 h-5" />
                      {[partner.city, partner.state].filter(Boolean).join(', ') || 'View Location'}
                    </button>
                  )}

                  {partner.website_url && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackPartnerClick(partnerId, 'website_click')}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>

          {products.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No products available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {product.image_url && (
                    <div className="h-48 bg-gray-50 flex items-center justify-center p-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {product.is_featured && (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded mb-2">
                        Featured
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        {product.currency} {product.price.toFixed(2)}
                      </span>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </div>
                    {product.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {product.categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
