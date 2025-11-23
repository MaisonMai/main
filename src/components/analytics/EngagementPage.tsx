import { KpiCard } from './KpiCard';
import { ExportButton } from './ExportButton';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsEvent } from '../../lib/analyticsData';
import { getEventsByType, computeReminderStats, getDistinctUsers, computePageViewStats, exportToCsv } from '../../lib/analyticsHelpers';

type EngagementPageProps = {
  filteredEvents: AnalyticsEvent[];
};

export function EngagementPage({ filteredEvents }: EngagementPageProps) {
  const saves = getEventsByType(filteredEvents, 'gift_idea_saved');
  const totalSaves = saves.length;
  const distinctUsers = getDistinctUsers(filteredEvents).length;
  const avgSavesPerUser = distinctUsers > 0 ? (totalSaves / distinctUsers).toFixed(2) : '0';

  const savesByCategory: Record<string, number> = {};
  const savesByRelationship: Record<string, number> = {};

  saves.forEach((event) => {
    const category = event.metadata?.category || 'unknown';
    const relationship = event.metadata?.relationship_type || 'unknown';

    savesByCategory[category] = (savesByCategory[category] || 0) + 1;
    savesByRelationship[relationship] = (savesByRelationship[relationship] || 0) + 1;
  });

  const categoryData = Object.entries(savesByCategory).map(([name, value]) => ({ name, value }));
  const relationshipData = Object.entries(savesByRelationship).map(([name, value]) => ({ name, value }));

  const reminderStats = computeReminderStats(filteredEvents);

  const occasionData = Object.entries(reminderStats.byOccasion).map(([name, value]) => ({ name, value }));

  const outboundClicks = getEventsByType(filteredEvents, 'outbound_link_clicked');
  const totalClicks = outboundClicks.length;
  const avgClicksPerUser = distinctUsers > 0 ? (totalClicks / distinctUsers).toFixed(2) : '0';

  const urlClicks: Record<string, { url: string; shop: string; category: string; count: number }> = {};

  outboundClicks.forEach((event) => {
    const url = event.metadata?.url || '';
    const shop = event.metadata?.shop_name || 'Unknown';
    const category = event.metadata?.category || 'unknown';

    if (!urlClicks[url]) {
      urlClicks[url] = { url, shop, category, count: 0 };
    }
    urlClicks[url].count++;
  });

  const topUrls = Object.values(urlClicks).sort((a, b) => b.count - a.count).slice(0, 10);

  const pageViewStats = computePageViewStats(filteredEvents);

  const handleExportSaves = () => {
    const rows = categoryData.map((c) => ({ category: c.name, count: c.value }));
    exportToCsv('saves_by_category.csv', rows, ['category', 'count']);
  };

  const handleExportReminders = () => {
    exportToCsv('reminders.csv', reminderStats.upcomingList, ['date', 'occasion', 'users']);
  };

  const handleExportClicks = () => {
    exportToCsv('outbound_clicks.csv', topUrls, ['url', 'shop', 'category', 'count']);
  };

  const handleExportPageViews = () => {
    exportToCsv('page_views.csv', pageViewStats.pages, ['path', 'name', 'views', 'uniqueUsers']);
  };

  const COLORS = ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9', '#FF9800', '#2196F3', '#9C27B0', '#E91E63'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Engagement</h1>
        <p className="text-slate-600">Monitor saves, reminders, clicks, and page views</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Saves and wishlists</h2>
          <ExportButton onClick={handleExportSaves} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <KpiCard title="Total Saves" value={totalSaves} />
          <KpiCard title="Average Saves per User" value={avgSavesPerUser} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Saves by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#4CAF50" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Saves by Relationship Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={relationshipData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {relationshipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Reminders</h2>
          <ExportButton onClick={handleExportReminders} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <KpiCard title="Total Reminders" value={reminderStats.total} />
          <KpiCard title="Average Reminders per User" value={reminderStats.avgPerUser} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Upcoming Reminders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Date</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Occasion</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">Users</th>
                  </tr>
                </thead>
                <tbody>
                  {reminderStats.upcomingList.map((r, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-slate-900">{r.date}</td>
                      <td className="py-2 px-3 text-slate-900 capitalize">{r.occasion}</td>
                      <td className="py-2 px-3 text-slate-900 text-right">{r.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Reminders by Occasion</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={occasionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#FF9800" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Outbound clicks</h2>
          <ExportButton onClick={handleExportClicks} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <KpiCard title="Total Outbound Clicks" value={totalClicks} />
          <KpiCard title="Average Clicks per Active User" value={avgClicksPerUser} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Top 10 URLs by Click Count</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">URL</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Shop</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {topUrls.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900 truncate max-w-xs">{item.url}</td>
                    <td className="py-3 px-4 text-sm text-slate-900">{item.shop}</td>
                    <td className="py-3 px-4 text-sm text-slate-900 capitalize">{item.category}</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Page views</h2>
          <ExportButton onClick={handleExportPageViews} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <KpiCard title="Total Page Views" value={pageViewStats.total} />
          <KpiCard title="Average Page Views per User" value={pageViewStats.avgPerUser} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Page Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Path</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Page Views</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Unique Users</th>
              </tr>
            </thead>
            <tbody>
              {pageViewStats.pages.map((page, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-900">{page.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{page.path}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{page.views.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{page.uniqueUsers.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
