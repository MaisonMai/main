import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, Activity, Gift, Store, Package, MousePointer, Eye, X } from 'lucide-react';

type Stats = {
  totalUsers: number;
  newSignupsThisMonth: number;
  activeUsersLast7Days: number;
  totalGiftsSuggested: number;
  totalGiftPartners: number;
  newGiftPartnersThisMonth: number;
  productsListed: number;
  uniqueClicks: number;
  totalClicks: number;
};

type DetailView =
  | 'totalUsers'
  | 'newSignupsThisMonth'
  | 'activeUsersLast7Days'
  | 'totalGiftsSuggested'
  | 'totalGiftPartners'
  | 'newGiftPartnersThisMonth'
  | 'productsListed'
  | null;

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    newSignupsThisMonth: 0,
    activeUsersLast7Days: 0,
    totalGiftsSuggested: 0,
    totalGiftPartners: 0,
    newGiftPartnersThisMonth: 0,
    productsListed: 0,
    uniqueClicks: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: totalUsers },
        { count: newSignupsThisMonth },
        { count: activeUsersLast7Days },
        { count: totalGiftsSuggested },
        { count: totalGiftPartners },
        { count: newGiftPartnersThisMonth },
        { count: productsListed },
        uniqueClicksResult,
        { count: totalClicks },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', sevenDaysAgo),
        supabase.from('gift_ideas').select('*', { count: 'exact', head: true }),
        supabase.from('gift_partners').select('*', { count: 'exact', head: true }).eq('approval_status', 'approved'),
        supabase.from('gift_partners').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth).eq('approval_status', 'approved'),
        supabase.from('gift_partner_products').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('gift_partner_clicks').select('user_id', { count: 'exact' }).not('user_id', 'is', null),
        supabase.from('gift_partner_clicks').select('*', { count: 'exact', head: true }),
      ]);

      const uniqueUsers = new Set(uniqueClicksResult.data?.map(row => row.user_id) || []);

      setStats({
        totalUsers: totalUsers || 0,
        newSignupsThisMonth: newSignupsThisMonth || 0,
        activeUsersLast7Days: activeUsersLast7Days || 0,
        totalGiftsSuggested: totalGiftsSuggested || 0,
        totalGiftPartners: totalGiftPartners || 0,
        newGiftPartnersThisMonth: newGiftPartnersThisMonth || 0,
        productsListed: productsListed || 0,
        uniqueClicks: uniqueUsers.size,
        totalClicks: totalClicks || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading statistics...</p>
      </div>
    );
  }

  const loadDetailData = async (view: DetailView) => {
    if (!view) return;

    setDetailLoading(true);
    setDetailView(view);

    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      let data: any[] = [];

      switch (view) {
        case 'totalUsers':
          const { data: allUsers } = await supabase
            .from('profiles')
            .select('id, email, full_name, created_at')
            .order('created_at', { ascending: false });
          data = allUsers || [];
          break;

        case 'newSignupsThisMonth':
          const { data: newUsers } = await supabase
            .from('profiles')
            .select('id, email, full_name, created_at')
            .gte('created_at', firstDayOfMonth)
            .order('created_at', { ascending: false });
          data = newUsers || [];
          break;

        case 'activeUsersLast7Days':
          const { data: activeUsers } = await supabase
            .from('profiles')
            .select('id, email, full_name, updated_at')
            .gte('updated_at', sevenDaysAgo)
            .order('updated_at', { ascending: false });
          data = activeUsers || [];
          break;

        case 'totalGiftsSuggested':
          const { data: gifts } = await supabase
            .from('gift_ideas')
            .select('id, title, price, created_at, user_id, profiles!gift_ideas_user_id_fkey(email, full_name)')
            .order('created_at', { ascending: false });
          data = gifts || [];
          break;

        case 'totalGiftPartners':
          const { data: partners } = await supabase
            .from('gift_partners')
            .select('id, name, description, website_url, created_at, is_active')
            .eq('approval_status', 'approved')
            .order('created_at', { ascending: false });
          data = partners || [];
          break;

        case 'newGiftPartnersThisMonth':
          const { data: newPartners } = await supabase
            .from('gift_partners')
            .select('id, name, description, website_url, created_at, is_active')
            .gte('created_at', firstDayOfMonth)
            .eq('approval_status', 'approved')
            .order('created_at', { ascending: false });
          data = newPartners || [];
          break;

        case 'productsListed':
          const { data: products } = await supabase
            .from('gift_partner_products')
            .select('id, name, price, currency, created_at, gift_partners!gift_partner_products_partner_id_fkey(name)')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
          data = products || [];
          break;
      }

      setDetailData(data);
    } catch (error) {
      console.error('Error loading detail data:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', key: 'totalUsers' as DetailView },
    { label: 'New Signups (This Month)', value: stats.newSignupsThisMonth, icon: UserPlus, color: 'bg-green-500', key: 'newSignupsThisMonth' as DetailView },
    { label: 'Active Users (Last 7 Days)', value: stats.activeUsersLast7Days, icon: Activity, color: 'bg-purple-500', key: 'activeUsersLast7Days' as DetailView },
    { label: 'Total Gifts Suggested', value: stats.totalGiftsSuggested, icon: Gift, color: 'bg-pink-500', key: 'totalGiftsSuggested' as DetailView },
    { label: 'Total MaisonMai Partners', value: stats.totalGiftPartners, icon: Store, color: 'bg-orange-500', key: 'totalGiftPartners' as DetailView },
    { label: 'New MaisonMai Partners (This Month)', value: stats.newGiftPartnersThisMonth, icon: Store, color: 'bg-yellow-500', key: 'newGiftPartnersThisMonth' as DetailView },
    { label: 'Products Listed', value: stats.productsListed, icon: Package, color: 'bg-teal-500', key: 'productsListed' as DetailView },
    { label: 'Unique Clicks', value: stats.uniqueClicks, icon: MousePointer, color: 'bg-indigo-500', key: null },
    { label: 'Total Clicks', value: stats.totalClicks, icon: Eye, color: 'bg-red-500', key: null },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Overview</h2>
        <p className="text-gray-600">Real-time statistics and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isClickable = stat.key !== null;
          return (
            <button
              key={index}
              onClick={() => isClickable && loadDetailData(stat.key)}
              disabled={!isClickable}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left transition-all ${
                isClickable ? 'hover:shadow-md hover:border-primary-200 cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
                {isClickable && (
                  <p className="text-xs text-primary-600 mt-2">Click to view details</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">MaisonMai Partner Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Unique Clicks:</strong> Number of distinct users who clicked on any partner profile or product
          </div>
          <div>
            <strong>Total Clicks:</strong> Total number of partner profile or product clicks (includes repeat visits)
          </div>
        </div>
      </div>

      {detailView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {statCards.find((s) => s.key === detailView)?.label}
              </h3>
              <button
                onClick={() => setDetailView(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {detailData.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No data available</p>
                    </div>
                  ) : (
                    <>
                      {(detailView === 'totalUsers' ||
                        detailView === 'newSignupsThisMonth' ||
                        detailView === 'activeUsersLast7Days') && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Name</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Email</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">
                                  {detailView === 'activeUsersLast7Days' ? 'Last Active' : 'Joined'}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {detailData.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {user.full_name || 'No name set'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {new Date(
                                      detailView === 'activeUsersLast7Days'
                                        ? user.updated_at
                                        : user.created_at
                                    ).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {detailView === 'totalGiftsSuggested' && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Gift Title</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Price</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">User</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Created</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {detailData.map((gift: any) => (
                                <tr key={gift.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{gift.title}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {gift.price ? `$${gift.price}` : 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {gift.profiles?.email || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {new Date(gift.created_at).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {(detailView === 'totalGiftPartners' || detailView === 'newGiftPartnersThisMonth') && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Partner Name</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Description</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Website</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Created</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {detailData.map((partner: any) => (
                                <tr key={partner.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{partner.name}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                    {partner.description}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {partner.website_url ? (
                                      <a
                                        href={partner.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:underline"
                                      >
                                        Visit
                                      </a>
                                    ) : (
                                      'N/A'
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span
                                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                                        partner.is_active
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {partner.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {new Date(partner.created_at).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {detailView === 'productsListed' && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Product Name</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Partner</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Price</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Created</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {detailData.map((product: any) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {product.gift_partners?.name || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {product.currency} {product.price}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {new Date(product.created_at).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
