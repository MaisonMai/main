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
import { AdminStats } from './AdminStats';
import { BlogManagement } from './BlogManagement';
import { ProductReview } from './ProductReview';
import { ContactSubmissions } from './ContactSubmissions';
import { PartnershipEnquiries } from './PartnershipEnquiries';
import { UserToPartnerConverter } from './UserToPartnerConverter';
import { fetchAnalyticsEvents, fetchRealAnalyticsData, computeRealFunnelStats, computeRealEngagementStats, filterEventsByDateRange, AnalyticsEvent, RealAnalyticsData, RealFunnelData, RealEngagementData } from '../lib/analyticsHelpers';

export function AnalyticsDashboard() {
  const [currentView, setCurrentView] = useState('platform');
  const [tempFromDate, setTempFromDate] = useState('');
  const [tempToDate, setTempToDate] = useState('');
  const [appliedFromDate, setAppliedFromDate] = useState<string | null>(null);
  const [appliedToDate, setAppliedToDate] = useState<string | null>(null);
  const [allEvents, setAllEvents] = useState<AnalyticsEvent[]>([]);
  const [realData, setRealData] = useState<RealAnalyticsData | null>(null);
  const [prevRealData, setPrevRealData] = useState<RealAnalyticsData | null>(null);
  const [realFunnelData, setRealFunnelData] = useState<RealFunnelData[]>([]);
  const [realEngagementData, setRealEngagementData] = useState<RealEngagementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const latestStr = now.toISOString().split('T')[0];
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      setTempFromDate(thirtyDaysAgoStr);
      setTempToDate(latestStr);
      setAppliedFromDate(thirtyDaysAgoStr);
      setAppliedToDate(latestStr);

      const events = await fetchAnalyticsEvents(null, null);
      setAllEvents(events);

      const currentRealData = await fetchRealAnalyticsData(thirtyDaysAgoStr, latestStr);
      setRealData(currentRealData);

      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split('T')[0];
      const prevPeriodRealData = await fetchRealAnalyticsData(sixtyDaysAgoStr, thirtyDaysAgoStr);
      setPrevRealData(prevPeriodRealData);

      const funnelData = await computeRealFunnelStats();
      setRealFunnelData(funnelData);

      const engagementData = await computeRealEngagementStats();
      setRealEngagementData(engagementData);

      setLoading(false);
    };

    initializeDashboard();
  }, []);

  const handleApplyFilter = () => {
    setAppliedFromDate(tempFromDate);
    setAppliedToDate(tempToDate);
  };

  const handleClearFilter = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const latestStr = now.toISOString().split('T')[0];
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    setTempFromDate(thirtyDaysAgoStr);
    setTempToDate(latestStr);
    setAppliedFromDate(thirtyDaysAgoStr);
    setAppliedToDate(latestStr);
  };

  const filteredEvents = filterEventsByDateRange(allEvents, appliedFromDate, appliedToDate);

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
      allEvents,
      prevFromDate.toISOString().split('T')[0],
      prevToDate.toISOString().split('T')[0]
    );
  };

  const previousPeriodEvents = getPreviousPeriodEvents();

  const currentRangeLabel = appliedFromDate && appliedToDate
    ? `Showing data from ${new Date(appliedFromDate).toLocaleDateString()} to ${new Date(appliedToDate).toLocaleDateString()}`
    : 'Loading...';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <AnalyticsTopNav />

      <div className="flex flex-1 overflow-hidden">
        <AnalyticsSidebar currentView={currentView} onViewChange={setCurrentView} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-12">
        {currentView === 'platform' && <AdminStats />}

        {currentView === 'blog' && <BlogManagement />}

        {currentView === 'product-review' && <ProductReview onClose={() => setCurrentView('platform')} />}

        {currentView === 'contact' && <ContactSubmissions onClose={() => setCurrentView('platform')} />}

        {currentView === 'partnerships' && <PartnershipEnquiries />}

        {currentView === 'convert' && <UserToPartnerConverter onClose={() => setCurrentView('platform')} />}

        {['overview', 'funnel', 'engagement', 'products', 'retention', 'events'].includes(currentView) && (
          <>
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
                realData={realData}
                prevRealData={prevRealData}
              />
            )}

            {currentView === 'funnel' && <FunnelPage filteredEvents={filteredEvents} realFunnelData={realFunnelData} />}

            {currentView === 'engagement' && <EngagementPage filteredEvents={filteredEvents} realEngagementData={realEngagementData} />}

            {currentView === 'products' && <ProductsPage filteredEvents={filteredEvents} />}

            {currentView === 'retention' && <RetentionPage filteredEvents={filteredEvents} />}

            {currentView === 'events' && (
              <EventsPage filteredEvents={filteredEvents} currentRangeLabel={currentRangeLabel} />
            )}
          </>
        )}
      </main>
      </div>
    </div>
  );
}
