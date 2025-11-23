import { useState, useEffect } from 'react';
import { AnalyticsSidebar } from './analytics/AnalyticsSidebar';
import { AnalyticsTopNav } from './analytics/AnalyticsTopNav';
import { DateRangeFilter } from './analytics/DateRangeFilter';
import { OverviewPage } from './analytics/OverviewPage';
import { FunnelPage } from './analytics/FunnelPage';
import { EngagementPage } from './analytics/EngagementPage';
import { ProductsPage } from './analytics/ProductsPage';
import { RetentionPage } from './analytics/RetentionPage';
import { EventsPage } from './analytics/EventsPage';
import { mockEvents } from '../lib/analyticsData';
import { filterEventsByDateRange } from '../lib/analyticsHelpers';

export function AnalyticsDashboard() {
  const [currentView, setCurrentView] = useState('overview');
  const [tempFromDate, setTempFromDate] = useState('');
  const [tempToDate, setTempToDate] = useState('');
  const [appliedFromDate, setAppliedFromDate] = useState<string | null>(null);
  const [appliedToDate, setAppliedToDate] = useState<string | null>(null);

  useEffect(() => {
    const latestDate = new Date(Math.max(...mockEvents.map((e) => new Date(e.timestamp).getTime())));
    const thirtyDaysAgo = new Date(latestDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const latestStr = latestDate.toISOString().split('T')[0];
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    setTempFromDate(thirtyDaysAgoStr);
    setTempToDate(latestStr);
    setAppliedFromDate(thirtyDaysAgoStr);
    setAppliedToDate(latestStr);
  }, []);

  const handleApplyFilter = () => {
    setAppliedFromDate(tempFromDate);
    setAppliedToDate(tempToDate);
  };

  const handleClearFilter = () => {
    const latestDate = new Date(Math.max(...mockEvents.map((e) => new Date(e.timestamp).getTime())));
    const thirtyDaysAgo = new Date(latestDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const latestStr = latestDate.toISOString().split('T')[0];
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    setTempFromDate(thirtyDaysAgoStr);
    setTempToDate(latestStr);
    setAppliedFromDate(thirtyDaysAgoStr);
    setAppliedToDate(latestStr);
  };

  const filteredEvents = filterEventsByDateRange(mockEvents, appliedFromDate, appliedToDate);

  const getPreviousPeriodEvents = () => {
    if (!appliedFromDate || !appliedToDate) return [];

    const fromDate = new Date(appliedFromDate);
    const toDate = new Date(appliedToDate);
    const rangeDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

    const prevToDate = new Date(fromDate);
    prevToDate.setDate(prevToDate.getDate() - 1);
    const prevFromDate = new Date(prevToDate);
    prevFromDate.setDate(prevFromDate.getDate() - rangeDays);

    return filterEventsByDateRange(
      mockEvents,
      prevFromDate.toISOString().split('T')[0],
      prevToDate.toISOString().split('T')[0]
    );
  };

  const previousPeriodEvents = getPreviousPeriodEvents();

  const currentRangeLabel = appliedFromDate && appliedToDate
    ? `Showing data from ${new Date(appliedFromDate).toLocaleDateString()} to ${new Date(appliedToDate).toLocaleDateString()}`
    : 'Loading...';

  return (
    <div className="min-h-screen bg-slate-50">
      <AnalyticsTopNav />

      <AnalyticsSidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="ml-64 mt-16 p-6">
        <DateRangeFilter
          fromDate={tempFromDate}
          toDate={tempToDate}
          onFromChange={setTempFromDate}
          onToChange={setTempToDate}
          onApply={handleApplyFilter}
          onClear={handleClearFilter}
          currentRangeLabel={currentRangeLabel}
        />

        {currentView === 'overview' && (
          <OverviewPage
            filteredEvents={filteredEvents}
            previousPeriodEvents={previousPeriodEvents}
            currentRangeLabel={currentRangeLabel}
            onViewChange={setCurrentView}
          />
        )}

        {currentView === 'funnel' && <FunnelPage filteredEvents={filteredEvents} />}

        {currentView === 'engagement' && <EngagementPage filteredEvents={filteredEvents} />}

        {currentView === 'products' && <ProductsPage filteredEvents={filteredEvents} />}

        {currentView === 'retention' && <RetentionPage filteredEvents={filteredEvents} />}

        {currentView === 'events' && (
          <EventsPage filteredEvents={filteredEvents} currentRangeLabel={currentRangeLabel} />
        )}
      </main>
    </div>
  );
}
