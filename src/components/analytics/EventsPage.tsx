import { useState } from 'react';
import { ExportButton } from './ExportButton';
import { Search } from 'lucide-react';
import { AnalyticsEvent } from '../../lib/analyticsData';
import { exportToCsv } from '../../lib/analyticsHelpers';

type EventsPageProps = {
  filteredEvents: AnalyticsEvent[];
  currentRangeLabel: string;
};

export function EventsPage({ filteredEvents, currentRangeLabel }: EventsPageProps) {
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [userIdSearch, setUserIdSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const eventTypes = [
    'all',
    'page_view',
    'account_created',
    'recipient_profile_created',
    'questionnaire_completed',
    'gift_ideas_generated',
    'gift_idea_saved',
    'outbound_link_clicked',
    'reminder_created'
  ];

  const filteredByType =
    eventTypeFilter === 'all'
      ? filteredEvents
      : filteredEvents.filter((e) => e.event_type === eventTypeFilter);

  const filteredByUser = userIdSearch
    ? filteredByType.filter((e) => e.user_id.toLowerCase().includes(userIdSearch.toLowerCase()))
    : filteredByType;

  const totalPages = Math.ceil(filteredByUser.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredByUser.slice(startIndex, startIndex + itemsPerPage);

  const formatMetadata = (metadata: any) => {
    if (!metadata) return '-';

    const entries = Object.entries(metadata)
      .slice(0, 3)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}: [${Array.isArray(value) ? value.length + ' items' : 'object'}]`;
        }
        return `${key}: ${value}`;
      });

    return entries.join(', ');
  };

  const handleExport = () => {
    const rows = filteredByUser.map((e) => ({
      timestamp: e.timestamp,
      user_id: e.user_id,
      event_type: e.event_type,
      session_id: e.session_id,
      metadata: JSON.stringify(e.metadata || {})
    }));
    exportToCsv('events.csv', rows, ['timestamp', 'user_id', 'event_type', 'session_id', 'metadata']);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Events (Raw logs)</h1>
        <p className="text-slate-600">Debug view of all tracked events</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-sm text-slate-600 mb-4">{currentRangeLabel}</div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Event Types' : type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by User ID..."
              value={userIdSearch}
              onChange={(e) => {
                setUserIdSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <ExportButton onClick={handleExport} />
        </div>

        <div className="text-sm text-slate-600 mb-4">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredByUser.length)} of{' '}
          {filteredByUser.length} events
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">User ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Event Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Session ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map((event, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-xs text-slate-900 font-mono">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 font-mono">{event.user_id}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">
                    <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                      {event.event_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 font-mono">{event.session_id}</td>
                  <td className="py-3 px-4 text-xs text-slate-600 max-w-md truncate">
                    {formatMetadata(event.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
