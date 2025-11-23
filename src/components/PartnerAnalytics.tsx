import { useState, useEffect } from 'react';
import { supabase, GiftPartner } from '../lib/supabase';
import { TrendingUp, MousePointer, Eye, Package, Users, Calendar } from 'lucide-react';

type PartnerAnalyticsProps = {
  partner: GiftPartner;
};

type PartnerStats = {
  totalClicks: number;
  uniqueUsers: number;
  websiteClicks: number;
  productViews: number;
  productClicks: number;
  productsListed: number;
  productsApproved: number;
  productsPending: number;
  clicksThisMonth: number;
  clicksLast7Days: number;
};

export function PartnerAnalytics({ partner }: PartnerAnalyticsProps) {
  const [stats, setStats] = useState<PartnerStats>({
    totalClicks: 0,
    uniqueUsers: 0,
    websiteClicks: 0,
    productViews: 0,
    productClicks: 0,
    productsListed: 0,
    productsApproved: 0,
    productsPending: 0,
    clicksThisMonth: 0,
    clicksLast7Days: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartnerStats();
  }, [partner.id]);

  const loadPartnerStats = async () => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: totalClicks },
        uniqueUsersResult,
        { count: websiteClicks },
        { count: productViews },
        { count: productClicks },
        { count: productsListed },
        { count: productsApproved },
        { count: productsPending },
        { count: clicksThisMonth },
        { count: clicksLast7Days },
      ] = await Promise.all([
        supabase
          .from('gift_partner_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id),
        supabase
          .from('gift_partner_clicks')
          .select('user_id')
          .eq('partner_id', partner.id)
          .not('user_id', 'is', null),
        supabase
          .from('gift_partner_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
          .eq('click_type', 'website_click'),
        supabase
          .from('gift_partner_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
          .eq('click_type', 'product_view'),
        supabase
          .from('gift_partner_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
          .eq('click_type', 'product_click'),
        supabase
          .from('gift_partner_products')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id),
        supabase
          .from('gift_partner_products')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
          .eq('status', 'approved'),
        supabase
          .from('gift_partner_products')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
          .eq('status', 'pending'),
        supabase
          .from('gift_partner_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
          .gte('clicked_at', firstDayOfMonth),
        supabase
          .from('gift_partner_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
          .gte('clicked_at', sevenDaysAgo),
      ]);

      const uniqueUsers = new Set(uniqueUsersResult.data?.map(row => row.user_id) || []);

      setStats({
        totalClicks: totalClicks || 0,
        uniqueUsers: uniqueUsers.size,
        websiteClicks: websiteClicks || 0,
        productViews: productViews || 0,
        productClicks: productClicks || 0,
        productsListed: productsListed || 0,
        productsApproved: productsApproved || 0,
        productsPending: productsPending || 0,
        clicksThisMonth: clicksThisMonth || 0,
        clicksLast7Days: clicksLast7Days || 0,
      });
    } catch (error) {
      console.error('Error loading partner stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading analytics...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Clicks', value: stats.totalClicks, icon: MousePointer, color: 'bg-primary-500' },
    { label: 'Unique Users', value: stats.uniqueUsers, icon: Users, color: 'bg-purple-500' },
    { label: 'Website Clicks', value: stats.websiteClicks, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Product Views', value: stats.productViews, icon: Eye, color: 'bg-orange-500' },
    { label: 'Product Clicks', value: stats.productClicks, icon: MousePointer, color: 'bg-pink-500' },
    { label: 'Products Listed', value: stats.productsListed, icon: Package, color: 'bg-teal-500' },
    { label: 'Products Approved', value: stats.productsApproved, icon: Package, color: 'bg-green-600' },
    { label: 'Products Pending', value: stats.productsPending, icon: Package, color: 'bg-yellow-500' },
    { label: 'Clicks This Month', value: stats.clicksThisMonth, icon: Calendar, color: 'bg-indigo-500' },
    { label: 'Clicks Last 7 Days', value: stats.clicksLast7Days, icon: Calendar, color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{partner.name} Analytics</h3>
        <p className="text-gray-600">Detailed performance metrics for this partner</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="font-semibold text-primary-900 mb-2">Analytics Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Unique Users:</strong> Number of distinct users who interacted with this partner
          </div>
          <div>
            <strong>Total Clicks:</strong> All interactions including website visits, product views, and clicks
          </div>
          <div>
            <strong>Website Clicks:</strong> Times users clicked to visit the partner's website
          </div>
          <div>
            <strong>Product Views:</strong> Times users viewed product details
          </div>
        </div>
      </div>
    </div>
  );
}
