import { useState } from 'react';
import { KpiCard } from './KpiCard';
import { ExportButton } from './ExportButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Eye, Gift, ExternalLink, Bell, FileText, Printer } from 'lucide-react';
import { AnalyticsEvent, RealAnalyticsData } from '../../lib/analyticsHelpers';
import { computeKPIs, computeDailyMetrics, computeCategoryStats, exportToCsv } from '../../lib/analyticsHelpers';
import {
  TotalUsersModal,
  PageViewsModal,
  QuestionnairesModal,
  GiftIdeasModal,
  GiftSavesModal,
  OutboundClicksModal,
  RemindersModal,
} from './AnalyticsDetailModals';

type OverviewPageProps = {
  filteredEvents: AnalyticsEvent[];
  previousPeriodEvents: AnalyticsEvent[];
  currentRangeLabel: string;
  onViewChange: (view: string) => void;
  realData: RealAnalyticsData | null;
  prevRealData: RealAnalyticsData | null;
};

export function OverviewPage({ filteredEvents, previousPeriodEvents, currentRangeLabel, onViewChange, realData, prevRealData }: OverviewPageProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const kpis = computeKPIs(filteredEvents, previousPeriodEvents, realData || undefined, prevRealData || undefined);
  const dailyMetrics = computeDailyMetrics(filteredEvents);
  const categoryStats = computeCategoryStats(filteredEvents);

  const handlePrintPdf = () => {
    document.body.classList.add('print-mode');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-mode');
    }, 100);
  };

  const handleExportInteractions = () => {
    const rows = [
      { metric: 'Views', value: kpis.pageViews.value },
      { metric: 'Gift idea saves', value: kpis.saves.value },
      { metric: 'Outbound clicks', value: kpis.clicks.value },
      { metric: 'Profiles created', value: kpis.profilesCreated.value },
      { metric: 'Reminders set', value: kpis.reminders.value }
    ];
    exportToCsv('interactions.csv', rows, ['metric', 'value']);
  };

  const handleExportCategories = () => {
    exportToCsv('top_categories.csv', categoryStats, ['category', 'clicks', 'saves', 'clickThroughRate']);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-200 shadow-sm p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, your MaisonMai dashboard is ready</h1>
            <p className="text-slate-600 mb-4 max-w-2xl">
              Track how users discover and engage with gift ideas through the complete gifting funnel. Monitor performance metrics, conversion rates, and user retention.
            </p>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => onViewChange('funnel')}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                View full funnel
              </button>
              <button
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            <div className="text-sm text-slate-600">
              <div>{currentRangeLabel}</div>
              <div className="text-xs text-slate-500 mt-1">Last updated: {new Date().toLocaleString()}</div>
            </div>
          </div>

          <div className="w-32 h-32 bg-primary-100 rounded-2xl flex items-center justify-center">
            <Gift className="w-16 h-16 text-primary-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Users"
          value={kpis.totalUsers.value}
          change={kpis.totalUsers.change}
          icon={<Users className="w-6 h-6" />}
          onClick={() => setActiveModal('users')}
        />
        <KpiCard
          title="Page Views"
          value={kpis.pageViews.value}
          change={kpis.pageViews.change}
          icon={<Eye className="w-6 h-6" />}
          onClick={() => setActiveModal('pageViews')}
        />
        <KpiCard
          title="Profiles Created"
          value={kpis.profilesCreated.value}
          change={kpis.profilesCreated.change}
          icon={<Users className="w-6 h-6" />}
        />
        <KpiCard
          title="Questionnaires Completed"
          value={kpis.questionnairesCompleted.value}
          change={kpis.questionnairesCompleted.change}
          icon={<FileText className="w-6 h-6" />}
          onClick={() => setActiveModal('questionnaires')}
        />
        <KpiCard
          title="Gift Ideas Generated"
          value={kpis.ideasGenerated.value}
          change={kpis.ideasGenerated.change}
          icon={<Gift className="w-6 h-6" />}
          onClick={() => setActiveModal('giftIdeas')}
        />
        <KpiCard
          title="Gift Idea Saves"
          value={kpis.saves.value}
          change={kpis.saves.change}
          icon={<Gift className="w-6 h-6" />}
          onClick={() => setActiveModal('giftSaves')}
        />
        <KpiCard
          title="Outbound Link Clicks"
          value={kpis.clicks.value}
          change={kpis.clicks.change}
          icon={<ExternalLink className="w-6 h-6" />}
          onClick={() => setActiveModal('outboundClicks')}
        />
        <KpiCard
          title="Reminders Created"
          value={kpis.reminders.value}
          change={kpis.reminders.change}
          icon={<Bell className="w-6 h-6" />}
          onClick={() => setActiveModal('reminders')}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">User engagement over time</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dailyMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="activeUsers" stroke="#4CAF50" name="Daily Active Users" strokeWidth={2} />
            <Line type="monotone" dataKey="pageViews" stroke="#2196F3" name="Page Views" strokeWidth={2} />
            <Line type="monotone" dataKey="ideasGenerated" stroke="#FF9800" name="Ideas Generated" strokeWidth={2} />
            <Line type="monotone" dataKey="outboundClicks" stroke="#9C27B0" name="Outbound Clicks" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Interactions</h2>
          <ExportButton onClick={handleExportInteractions} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Views</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpis.pageViews.value.toLocaleString()}</div>
            <div className={`text-xs font-medium mt-1 ${kpis.pageViews.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpis.pageViews.change >= 0 ? '+' : ''}{kpis.pageViews.change.toFixed(1)}% vs prev
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Saves</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpis.saves.value.toLocaleString()}</div>
            <div className={`text-xs font-medium mt-1 ${kpis.saves.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpis.saves.change >= 0 ? '+' : ''}{kpis.saves.change.toFixed(1)}% vs prev
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Clicks</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpis.clicks.value.toLocaleString()}</div>
            <div className={`text-xs font-medium mt-1 ${kpis.clicks.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpis.clicks.change >= 0 ? '+' : ''}{kpis.clicks.change.toFixed(1)}% vs prev
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Profiles</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpis.profilesCreated.value.toLocaleString()}</div>
            <div className={`text-xs font-medium mt-1 ${kpis.profilesCreated.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpis.profilesCreated.change >= 0 ? '+' : ''}{kpis.profilesCreated.change.toFixed(1)}% vs prev
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Reminders</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpis.reminders.value.toLocaleString()}</div>
            <div className={`text-xs font-medium mt-1 ${kpis.reminders.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpis.reminders.change >= 0 ? '+' : ''}{kpis.reminders.change.toFixed(1)}% vs prev
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Top gift idea categories by clicks</h2>
          <ExportButton onClick={handleExportCategories} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Outbound Clicks</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Saves</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Click Through Rate</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.slice(0, 10).map((cat, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-900 capitalize">{cat.category}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{cat.clicks}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{cat.saves}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{cat.clickThroughRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal === 'users' && <TotalUsersModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'pageViews' && <PageViewsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'questionnaires' && <QuestionnairesModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'giftIdeas' && <GiftIdeasModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'giftSaves' && <GiftSavesModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'outboundClicks' && <OutboundClicksModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'reminders' && <RemindersModal onClose={() => setActiveModal(null)} />}
    </div>
  );
}
