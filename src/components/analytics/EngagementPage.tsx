import { KpiCard } from './KpiCard';
import { ExportButton } from './ExportButton';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsEvent, RealEngagementData } from '../../lib/analyticsHelpers';
import { exportToCsv } from '../../lib/analyticsHelpers';

type EngagementPageProps = {
  filteredEvents: AnalyticsEvent[];
  realEngagementData: RealEngagementData | null;
};

export function EngagementPage({ filteredEvents, realEngagementData }: EngagementPageProps) {
  if (!realEngagementData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">User Engagement</h1>
          <p className="text-slate-600">Track how users interact with gift ideas and content</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-slate-700 mb-2 font-medium">Loading engagement data...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#FFEB3B', '#795548'];

  const handleExportReminders = () => {
    exportToCsv('reminders_by_occasion.csv', realEngagementData.remindersByOccasion, ['occasion', 'count']);
  };

  const handleExportCategories = () => {
    exportToCsv('top_relationship_categories.csv', realEngagementData.topCategories, ['category', 'count']);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">User Engagement</h1>
        <p className="text-slate-600">Track how users interact with gift ideas and content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Total Gift Ideas Saved"
          value={realEngagementData.totalGiftIdeas}
        />
        <KpiCard
          title="Avg Gift Ideas per User"
          value={realEngagementData.avgGiftIdeasPerUser.toFixed(1)}
        />
        <KpiCard
          title="Total Reminders Created"
          value={realEngagementData.totalReminders}
        />
        <KpiCard
          title="Avg Reminders per User"
          value={realEngagementData.avgRemindersPerUser.toFixed(1)}
        />
        <KpiCard
          title="Questionnaires Completed"
          value={realEngagementData.totalQuestionnaires}
        />
        <KpiCard
          title="Engagement Rate"
          value={`${((realEngagementData.totalGiftIdeas / (realEngagementData.totalQuestionnaires || 1)) * 100).toFixed(1)}%`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Reminders by Occasion</h2>
            <ExportButton onClick={handleExportReminders} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={realEngagementData.remindersByOccasion}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ occasion, count }) => `${occasion}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {realEngagementData.remindersByOccasion.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Top Relationship Categories</h2>
            <ExportButton onClick={handleExportCategories} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={realEngagementData.topCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#4CAF50" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Occasion Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Occasion Type</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Number of Reminders</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {realEngagementData.remindersByOccasion.map((item, idx) => {
                const percentage = ((item.count / realEngagementData.totalReminders) * 100).toFixed(1);
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900 capitalize">{item.occasion}</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">{item.count}</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
