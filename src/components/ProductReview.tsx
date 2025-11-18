import { useState, useEffect } from 'react';
import { supabase, GiftPartnerProduct, GiftPartner } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Check, XCircle, ExternalLink, Package, AlertCircle } from 'lucide-react';

type ProductReviewProps = {
  onClose: () => void;
};

type ProductWithPartner = GiftPartnerProduct & {
  partner: GiftPartner;
};

export function ProductReview({ onClose }: ProductReviewProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductWithPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [reviewingProduct, setReviewingProduct] = useState<ProductWithPartner | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('gift_partner_products')
        .select(`
          *,
          partner:gift_partners(*)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const productsWithPartner = (data || []).map(item => ({
        ...item,
        partner: Array.isArray(item.partner) ? item.partner[0] : item.partner,
      })) as ProductWithPartner[];

      setProducts(productsWithPartner);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    if (!confirm('Approve this product?')) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('gift_partner_products')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', productId);

      if (error) throw error;

      alert('Product approved!');
      await loadProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Failed to approve product');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewingProduct || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('gift_partner_products')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim(),
        })
        .eq('id', reviewingProduct.id);

      if (error) throw error;

      alert('Product rejected');
      setReviewingProduct(null);
      setRejectionReason('');
      await loadProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Failed to reject product');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Permanently delete this product? This action cannot be undone.')) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('gift_partner_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      alert('Product deleted');
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const pendingCount = products.filter(p => p.status === 'pending').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Product Review</h3>
            {pendingCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {pendingCount} product{pendingCount !== 1 ? 's' : ''} awaiting review
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            by <strong>{product.partner.name}</strong>
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(product.status)}`}>
                          {product.status}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{product.description}</p>

                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-xl font-bold text-gray-900">
                          {product.currency} {product.price.toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          {product.categories.map((cat) => (
                            <span key={cat} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {product.rejection_reason && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Rejection reason:</strong> {product.rejection_reason}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Product
                        </a>

                        {product.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(product.id)}
                              disabled={processing}
                              className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => setReviewingProduct(product)}
                              disabled={processing}
                              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={processing}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Delete
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <p>Submitted: {new Date(product.created_at).toLocaleDateString()}</p>
                        {product.reviewed_at && (
                          <p>Reviewed: {new Date(product.reviewed_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {reviewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Reject Product</h4>
            <p className="text-sm text-gray-600 mb-4">
              Provide a reason for rejecting <strong>{reviewingProduct.name}</strong>:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent mb-4"
              placeholder="Please explain why this product is being rejected..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReviewingProduct(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Reject Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
