import { KpiCard } from './KpiCard';
import { ExportButton } from './ExportButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsEvent } from '../../lib/analyticsHelpers';
import { computeRetentionStats, computeDailyActiveUsers, exportToCsv } from '../../lib/analyticsHelpers';

type RetentionPageProps = {
  filteredEvents: AnalyticsEvent[];
};

export function RetentionPage({ filteredEvents }: RetentionPageProps) {
  const retentionStats = computeRetentionStats(filteredEvents);
  const dailyActiveUsers = computeDailyActiveUsers(filteredEvents);

  const dailyData = Object.entries(dailyActiveUsers)
    .map(([date, count]) => ({ date, users: count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const handleExportRetention = () => {
    const rows = [
      { metric: 'Return Rate', value: retentionStats.returnRate },
      { metric: 'Multi Profile Rate', value: retentionStats.multiProfileRate },
      { metric: 'Multi Session Idea Generation Rate', value: retentionStats.multiSessionIdeaRate },
      { metric: 'Returning Users', value: retentionStats.returningUsers },
      { metric: 'Multi Profile Users', value: retentionStats.multiProfileUsers },
      { metric: 'Multi Session Idea Users', value: retentionStats.multiSessionIdeaUsers }
    ];
    exportToCsv('retention_metrics.csv', rows, ['metric', 'value']);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Retention</h1>
        <p className="text-slate-600">Track how often users return and engage with MaisonMai</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Retention Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            title="Return Rate"
            value={retentionStats.returnRate}
            format="percent"
          />
          <KpiCard
            title="Multi Profile Rate"
            value={retentionStats.multiProfileRate}
            format="percent"
          />
          <KpiCard
            title="Multi Session Idea Generation"
            value={retentionStats.multiSessionIdeaRate}
            format="percent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Daily Active Users Over Time</h2>
          <ExportButton onClick={handleExportRetention} />
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#4CAF50" name="Daily Active Users" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Retention Metrics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Returning Users</h3>
            <p className="text-3xl font-bold text-slate-900 mb-1">{retentionStats.returningUsers.toLocaleString()}</p>
            <p className="text-sm text-slate-600">
              Users who returned on a different day from their first event
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Multi Profile Users</h3>
            <p className="text-3xl font-bold text-slate-900 mb-1">{retentionStats.multiProfileUsers.toLocaleString()}</p>
            <p className="text-sm text-slate-600">
              Users who created more than one recipient profile
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Multi Session Idea Users</h3>
            <p className="text-3xl font-bold text-slate-900 mb-1">{retentionStats.multiSessionIdeaUsers.toLocaleString()}</p>
            <p className="text-sm text-slate-600">
              Users who generated gift ideas in more than one session
            </p>
          </div>

          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h3 className="text-sm font-semibold text-primary-900 mb-2">Engagement Insight</h3>
            <p className="text-sm text-primary-800">
              {parseFloat(retentionStats.returnRate) > 50
                ? 'Excellent retention! Over half of users are returning.'
                : 'Focus on improving retention through better onboarding and engagement features.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
