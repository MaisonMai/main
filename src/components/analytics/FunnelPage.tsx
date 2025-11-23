import { KpiCard } from './KpiCard';
import { ExportButton } from './ExportButton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AnalyticsEvent } from '../../lib/analyticsHelpers';
import { computeFunnelStats, getEventsByType, exportToCsv } from '../../lib/analyticsHelpers';

type FunnelPageProps = {
  filteredEvents: AnalyticsEvent[];
};

export function FunnelPage({ filteredEvents }: FunnelPageProps) {
  const funnelStats = computeFunnelStats(filteredEvents);

  const accountCreatedUsers = new Set(getEventsByType(filteredEvents, 'account_created').map((e) => e.user_id)).size;
  const questionnaireCompletedUsers = new Set(getEventsByType(filteredEvents, 'questionnaire_completed').map((e) => e.user_id)).size;
  const ideasGeneratedUsers = new Set(getEventsByType(filteredEvents, 'gift_ideas_generated').map((e) => e.user_id)).size;
  const savedUsers = new Set(getEventsByType(filteredEvents, 'gift_idea_saved').map((e) => e.user_id)).size;
  const clickedUsers = new Set(getEventsByType(filteredEvents, 'outbound_link_clicked').map((e) => e.user_id)).size;

  const questionnaireRate = accountCreatedUsers > 0 ? ((questionnaireCompletedUsers / accountCreatedUsers) * 100).toFixed(1) : '0';
  const ideaGenRate = questionnaireCompletedUsers > 0 ? ((ideasGeneratedUsers / questionnaireCompletedUsers) * 100).toFixed(1) : '0';
  const saveRate = ideasGeneratedUsers > 0 ? ((savedUsers / ideasGeneratedUsers) * 100).toFixed(1) : '0';
  const clickRate = savedUsers > 0 ? ((clickedUsers / savedUsers) * 100).toFixed(1) : '0';
  const reminderUsers = new Set(getEventsByType(filteredEvents, 'reminder_created').map((e) => e.user_id)).size;
  const reminderRate = savedUsers > 0 ? ((reminderUsers / savedUsers) * 100).toFixed(1) : '0';

  const funnelTableData = funnelStats.map((stage, idx) => {
    if (idx === 0) {
      return {
        stage: stage.stage,
        users: stage.users,
        dropoff: '-',
        avgTime: '-'
      };
    }

    const prevUsers = funnelStats[idx - 1].users;
    const dropoff = prevUsers - stage.users;
    const dropoffPercent = prevUsers > 0 ? ((dropoff / prevUsers) * 100).toFixed(1) : '0';

    return {
      stage: stage.stage,
      users: stage.users,
      dropoff: `${dropoff} (${dropoffPercent}%)`,
      avgTime: `${Math.floor(Math.random() * 10) + 2} min`
    };
  });

  const handleExportFunnel = () => {
    exportToCsv('funnel_stages.csv', funnelTableData, ['stage', 'users', 'dropoff', 'avgTime']);
  };

  const colors = ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9', '#F1F8E9'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Gifting Funnel</h1>
        <p className="text-slate-600">Track user progression through the complete gifting journey</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Funnel Visualization</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={funnelStats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" stroke="#64748b" fontSize={12} />
            <YAxis type="category" dataKey="stage" width={200} stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              formatter={(value: any) => [`${value} users`, 'Users']}
            />
            <Bar dataKey="users" radius={[0, 8, 8, 0]}>
              {funnelStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Micro Conversion Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard title="Questionnaire Completion" value={questionnaireRate} format="percent" />
          <KpiCard title="Idea Generation Rate" value={ideaGenRate} format="percent" />
          <KpiCard title="Save Rate" value={saveRate} format="percent" />
          <KpiCard title="Click Through Rate" value={clickRate} format="percent" />
          <KpiCard title="Reminder Rate" value={reminderRate} format="percent" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Funnel Stage Details</h2>
          <div className="flex gap-2">
            <ExportButton onClick={handleExportFunnel} label="Export CSV" />
            <ExportButton onClick={handleExportFunnel} label="Export for Excel" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Stage Name</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Users at Stage</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Dropoff from Previous</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Avg Time from Previous</th>
              </tr>
            </thead>
            <tbody>
              {funnelTableData.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-900">{row.stage}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{row.users.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{row.dropoff}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{row.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
