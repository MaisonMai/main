import { supabase } from './supabase';

export type AnalyticsEvent = {
  user_id: string | null;
  session_id: string;
  event_type: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

export type RealAnalyticsData = {
  totalUsers: number;
  totalProfiles: number;
  totalPeople: number;
  totalGiftIdeas: number;
  totalQuestionnaires: number;
  totalReminders: number;
  totalPartnerClicks: number;
};

export type RealFunnelData = {
  stage: string;
  users: number;
  percent: number;
};

export async function fetchRealAnalyticsData(
  fromDate: string | null,
  toDate: string | null
): Promise<RealAnalyticsData> {
  const fromISO = fromDate ? new Date(fromDate).toISOString() : null;
  const toISO = toDate ? (() => {
    const d = new Date(toDate);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  })() : null;

  const queries: any[] = [
    supabase.from('profiles').select('id, created_at', { count: 'exact', head: false }),
    supabase.from('people').select('id, created_at', { count: 'exact', head: false }),
    supabase.from('gift_ideas').select('id, created_at', { count: 'exact', head: false }),
    supabase.from('questionnaire_responses').select('id, created_at', { count: 'exact', head: false }),
    supabase.from('reminders').select('id, created_at', { count: 'exact', head: false }),
    supabase.from('gift_partner_clicks').select('id, created_at', { count: 'exact', head: false })
  ];

  if (fromISO) {
    queries[0] = queries[0].gte('created_at', fromISO);
    queries[1] = queries[1].gte('created_at', fromISO);
    queries[2] = queries[2].gte('created_at', fromISO);
    queries[3] = queries[3].gte('created_at', fromISO);
    queries[4] = queries[4].gte('created_at', fromISO);
    queries[5] = queries[5].gte('created_at', fromISO);
  }

  if (toISO) {
    queries[0] = queries[0].lte('created_at', toISO);
    queries[1] = queries[1].lte('created_at', toISO);
    queries[2] = queries[2].lte('created_at', toISO);
    queries[3] = queries[3].lte('created_at', toISO);
    queries[4] = queries[4].lte('created_at', toISO);
    queries[5] = queries[5].lte('created_at', toISO);
  }

  const [profiles, people, giftIdeas, questionnaires, reminders, partnerClicks] = await Promise.all(queries);

  return {
    totalUsers: profiles.data?.length || 0,
    totalProfiles: profiles.data?.length || 0,
    totalPeople: people.data?.length || 0,
    totalGiftIdeas: giftIdeas.data?.length || 0,
    totalQuestionnaires: questionnaires.data?.length || 0,
    totalReminders: reminders.data?.length || 0,
    totalPartnerClicks: partnerClicks.data?.length || 0
  };
}

export async function fetchAnalyticsEvents(
  fromDate: string | null,
  toDate: string | null
): Promise<AnalyticsEvent[]> {
  let query = supabase
    .from('analytics_events')
    .select('user_id, session_id, event_type, timestamp, metadata')
    .order('timestamp', { ascending: true });

  if (fromDate) {
    query = query.gte('timestamp', new Date(fromDate).toISOString());
  }

  if (toDate) {
    const endOfDay = new Date(toDate);
    endOfDay.setHours(23, 59, 59, 999);
    query = query.lte('timestamp', endOfDay.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching analytics events:', error);
    return [];
  }

  return (data || []) as AnalyticsEvent[];
}

export function filterEventsByDateRange(
  events: AnalyticsEvent[],
  from: string | null,
  to: string | null
): AnalyticsEvent[] {
  if (!from && !to) return events;

  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  if (toDate) {
    toDate.setHours(23, 59, 59, 999);
  }

  return events.filter((event) => {
    const eventDate = new Date(event.timestamp);
    if (fromDate && eventDate < fromDate) return false;
    if (toDate && eventDate > toDate) return false;
    return true;
  });
}

export function getDistinctUsers(events: AnalyticsEvent[]): string[] {
  return Array.from(new Set(events.map((e) => e.user_id).filter((id): id is string => id !== null)));
}

export function getEventsByType(events: AnalyticsEvent[], type: string): AnalyticsEvent[] {
  return events.filter((e) => e.event_type === type);
}

export async function computeRealFunnelStats(): Promise<RealFunnelData[]> {
  const { data: profiles } = await supabase.from('profiles').select('id, created_at');
  const { data: people } = await supabase.from('people').select('id, user_id, created_at');
  const { data: questionnaires } = await supabase.from('questionnaire_responses').select('id, person_id');
  const { data: giftIdeas } = await supabase.from('gift_ideas').select('id, user_id, created_at');
  const { data: reminders } = await supabase.from('reminders').select('id, user_id, created_at');
  const { data: clicks } = await supabase.from('gift_partner_clicks').select('id, user_id, created_at');

  const totalUsers = profiles?.length || 1;
  const usersWithPeople = new Set(people?.map(p => p.user_id)).size;
  const peopleWithQuestionnaires = new Set(questionnaires?.map(q => q.person_id)).size;
  const usersWithGiftIdeas = new Set(giftIdeas?.map(g => g.user_id)).size;
  const usersWithReminders = new Set(reminders?.map(r => r.user_id)).size;
  const usersWithClicks = new Set(clicks?.map(c => c.user_id)).size;

  return [
    { stage: 'Account created', users: totalUsers, percent: 100 },
    { stage: 'Recipient profile created', users: usersWithPeople, percent: (usersWithPeople / totalUsers) * 100 },
    { stage: 'Questionnaire completed', users: peopleWithQuestionnaires, percent: (peopleWithQuestionnaires / totalUsers) * 100 },
    { stage: 'Gift ideas generated', users: usersWithGiftIdeas, percent: (usersWithGiftIdeas / totalUsers) * 100 },
    { stage: 'Gift idea saved', users: usersWithGiftIdeas, percent: (usersWithGiftIdeas / totalUsers) * 100 },
    { stage: 'Outbound link clicked', users: usersWithClicks, percent: (usersWithClicks / totalUsers) * 100 },
    { stage: 'Reminder created', users: usersWithReminders, percent: (usersWithReminders / totalUsers) * 100 }
  ];
}

export function computeFunnelStats(events: AnalyticsEvent[], realData?: RealFunnelData[]) {
  if (events.length === 0 && realData) {
    return realData;
  }

  const accountCreated = new Set(getEventsByType(events, 'account_created').map((e) => e.user_id).filter(Boolean));
  const profileCreated = new Set(getEventsByType(events, 'recipient_profile_created').map((e) => e.user_id).filter(Boolean));
  const questionnaireCompleted = new Set(getEventsByType(events, 'questionnaire_completed').map((e) => e.user_id).filter(Boolean));
  const ideasGenerated = new Set(getEventsByType(events, 'gift_ideas_generated').map((e) => e.user_id).filter(Boolean));
  const ideaSaved = new Set(getEventsByType(events, 'gift_idea_saved').map((e) => e.user_id).filter(Boolean));
  const linkClicked = new Set(getEventsByType(events, 'outbound_link_clicked').map((e) => e.user_id).filter(Boolean));
  const reminderCreated = new Set(getEventsByType(events, 'reminder_created').map((e) => e.user_id).filter(Boolean));

  const total = accountCreated.size || 1;

  return [
    { stage: 'Account created', users: accountCreated.size, percent: 100 },
    { stage: 'Recipient profile created', users: profileCreated.size, percent: (profileCreated.size / total) * 100 },
    { stage: 'Questionnaire completed', users: questionnaireCompleted.size, percent: (questionnaireCompleted.size / total) * 100 },
    { stage: 'Gift ideas generated', users: ideasGenerated.size, percent: (ideasGenerated.size / total) * 100 },
    { stage: 'Gift idea saved', users: ideaSaved.size, percent: (ideaSaved.size / total) * 100 },
    { stage: 'Outbound link clicked', users: linkClicked.size, percent: (linkClicked.size / total) * 100 },
    { stage: 'Reminder created', users: reminderCreated.size, percent: (reminderCreated.size / total) * 100 }
  ];
}

export function computeDailyActiveUsers(events: AnalyticsEvent[]): Record<string, number> {
  const dailyUsers: Record<string, Set<string>> = {};

  events.forEach((event) => {
    if (!event.user_id) return;
    const date = event.timestamp.split('T')[0];
    if (!dailyUsers[date]) {
      dailyUsers[date] = new Set();
    }
    dailyUsers[date].add(event.user_id);
  });

  const result: Record<string, number> = {};
  Object.keys(dailyUsers).forEach((date) => {
    result[date] = dailyUsers[date].size;
  });

  return result;
}

export function computeCategoryStats(events: AnalyticsEvent[]) {
  const categoryClicks: Record<string, number> = {};
  const categorySaves: Record<string, number> = {};

  getEventsByType(events, 'outbound_link_clicked').forEach((event) => {
    const category = event.metadata?.category || 'unknown';
    categoryClicks[category] = (categoryClicks[category] || 0) + 1;
  });

  getEventsByType(events, 'gift_idea_saved').forEach((event) => {
    const category = event.metadata?.category || 'unknown';
    categorySaves[category] = (categorySaves[category] || 0) + 1;
  });

  const categories = Array.from(new Set([...Object.keys(categoryClicks), ...Object.keys(categorySaves)]));

  return categories.map((category) => {
    const clicks = categoryClicks[category] || 0;
    const saves = categorySaves[category] || 0;
    const ctr = saves > 0 ? ((clicks / saves) * 100).toFixed(1) : '0.0';

    return {
      category,
      clicks,
      saves,
      clickThroughRate: ctr
    };
  }).sort((a, b) => b.clicks - a.clicks);
}

export function computeReminderStats(events: AnalyticsEvent[]) {
  const reminders = getEventsByType(events, 'reminder_created');
  const total = reminders.length;
  const distinctUsers = new Set(reminders.map((e) => e.user_id).filter(Boolean)).size;
  const avgPerUser = distinctUsers > 0 ? (total / distinctUsers).toFixed(2) : '0';

  const byOccasion: Record<string, number> = {};
  const upcomingByDate: Record<string, { occasion: string; count: number }[]> = {};

  reminders.forEach((event) => {
    const occasion = event.metadata?.occasion || 'unknown';
    byOccasion[occasion] = (byOccasion[occasion] || 0) + 1;

    const date = event.metadata?.reminder_date;
    if (date) {
      if (!upcomingByDate[date]) {
        upcomingByDate[date] = [];
      }
      const existing = upcomingByDate[date].find((r) => r.occasion === occasion);
      if (existing) {
        existing.count++;
      } else {
        upcomingByDate[date].push({ occasion, count: 1 });
      }
    }
  });

  const upcomingList = Object.entries(upcomingByDate)
    .flatMap(([date, occasions]) => occasions.map((o) => ({ date, occasion: o.occasion, users: o.count })))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  return {
    total,
    avgPerUser,
    byOccasion,
    upcomingList
  };
}

export function computeProductStats(events: AnalyticsEvent[]) {
  const productMap: Record<string, {
    idea_id: string;
    product_name: string;
    category: string;
    shop_name: string;
    url: string;
    recommended_count: number;
    saves: number;
    clicks: number;
  }> = {};

  getEventsByType(events, 'gift_ideas_generated').forEach((event) => {
    const ideas = event.metadata?.ideas || [];
    ideas.forEach((idea: any) => {
      if (!productMap[idea.idea_id]) {
        productMap[idea.idea_id] = {
          idea_id: idea.idea_id,
          product_name: idea.product_name,
          category: idea.category,
          shop_name: idea.shop_name,
          url: idea.url,
          recommended_count: 0,
          saves: 0,
          clicks: 0
        };
      }
      productMap[idea.idea_id].recommended_count++;
    });
  });

  getEventsByType(events, 'gift_idea_saved').forEach((event) => {
    const ideaId = event.metadata?.idea_id;
    if (ideaId && productMap[ideaId]) {
      productMap[ideaId].saves++;
    }
  });

  getEventsByType(events, 'outbound_link_clicked').forEach((event) => {
    const ideaId = event.metadata?.idea_id;
    if (ideaId && productMap[ideaId]) {
      productMap[ideaId].clicks++;
    }
  });

  return Object.values(productMap).map((product) => ({
    ...product,
    saveRate: product.recommended_count > 0 ? ((product.saves / product.recommended_count) * 100).toFixed(1) : '0.0',
    clickThroughRate: product.saves > 0 ? ((product.clicks / product.saves) * 100).toFixed(1) : '0.0'
  }));
}

export function computePageViewStats(events: AnalyticsEvent[]) {
  const pageViews = getEventsByType(events, 'page_view');
  const total = pageViews.length;

  const byPage: Record<string, { path: string; name: string; views: number; uniqueUsers: Set<string> }> = {};

  pageViews.forEach((event) => {
    const path = event.metadata?.page || '/';
    const name = event.metadata?.page_name || 'Unknown';

    if (!byPage[path]) {
      byPage[path] = {
        path,
        name,
        views: 0,
        uniqueUsers: new Set()
      };
    }

    byPage[path].views++;
    if (event.user_id) {
      byPage[path].uniqueUsers.add(event.user_id);
    }
  });

  const pages = Object.values(byPage).map((p) => ({
    path: p.path,
    name: p.name,
    views: p.views,
    uniqueUsers: p.uniqueUsers.size
  })).sort((a, b) => b.views - a.views);

  const distinctUsers = new Set(pageViews.map((e) => e.user_id).filter(Boolean)).size;
  const avgPerUser = distinctUsers > 0 ? (total / distinctUsers).toFixed(2) : '0';

  return {
    total,
    avgPerUser,
    pages
  };
}

export function computeRetentionStats(events: AnalyticsEvent[]) {
  const userFirstDate: Record<string, string> = {};
  const userDates: Record<string, Set<string>> = {};
  const userProfiles: Record<string, number> = {};
  const userIdeaSessions: Record<string, Set<string>> = {};

  events.forEach((event) => {
    if (!event.user_id) return;

    const userId = event.user_id;
    const date = event.timestamp.split('T')[0];

    if (!userFirstDate[userId]) {
      userFirstDate[userId] = date;
    }

    if (!userDates[userId]) {
      userDates[userId] = new Set();
    }
    userDates[userId].add(date);

    if (event.event_type === 'recipient_profile_created') {
      userProfiles[userId] = (userProfiles[userId] || 0) + 1;
    }

    if (event.event_type === 'gift_ideas_generated') {
      if (!userIdeaSessions[userId]) {
        userIdeaSessions[userId] = new Set();
      }
      userIdeaSessions[userId].add(event.session_id);
    }
  });

  const totalUsers = Object.keys(userFirstDate).length;
  const returningUsers = Object.values(userDates).filter((dates) => dates.size > 1).length;
  const multiProfileUsers = Object.values(userProfiles).filter((count) => count > 1).length;
  const multiSessionIdeaUsers = Object.values(userIdeaSessions).filter((sessions) => sessions.size > 1).length;

  const returnRate = totalUsers > 0 ? ((returningUsers / totalUsers) * 100).toFixed(1) : '0.0';
  const multiProfileRate = totalUsers > 0 ? ((multiProfileUsers / totalUsers) * 100).toFixed(1) : '0.0';
  const multiSessionIdeaRate = totalUsers > 0 ? ((multiSessionIdeaUsers / totalUsers) * 100).toFixed(1) : '0.0';

  return {
    returnRate,
    multiProfileRate,
    multiSessionIdeaRate,
    returningUsers,
    multiProfileUsers,
    multiSessionIdeaUsers
  };
}

export function computeDailyMetrics(events: AnalyticsEvent[]) {
  const dailyData: Record<string, {
    activeUsers: Set<string>;
    pageViews: number;
    ideasGenerated: number;
    outboundClicks: number;
  }> = {};

  events.forEach((event) => {
    const date = event.timestamp.split('T')[0];

    if (!dailyData[date]) {
      dailyData[date] = {
        activeUsers: new Set(),
        pageViews: 0,
        ideasGenerated: 0,
        outboundClicks: 0
      };
    }

    if (event.user_id) {
      dailyData[date].activeUsers.add(event.user_id);
    }

    if (event.event_type === 'page_view') {
      dailyData[date].pageViews++;
    }

    if (event.event_type === 'gift_ideas_generated') {
      dailyData[date].ideasGenerated += event.metadata?.ideas?.length || 0;
    }

    if (event.event_type === 'outbound_link_clicked') {
      dailyData[date].outboundClicks++;
    }
  });

  return Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      activeUsers: data.activeUsers.size,
      pageViews: data.pageViews,
      ideasGenerated: data.ideasGenerated,
      outboundClicks: data.outboundClicks
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function computeKPIs(events: AnalyticsEvent[], previousEvents: AnalyticsEvent[], realData?: RealAnalyticsData, prevRealData?: RealAnalyticsData) {
  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (events.length === 0 && realData) {
    return {
      totalUsers: { value: realData.totalUsers, change: calcChange(realData.totalUsers, prevRealData?.totalUsers || 0) },
      pageViews: { value: 0, change: 0 },
      profilesCreated: { value: realData.totalPeople, change: calcChange(realData.totalPeople, prevRealData?.totalPeople || 0) },
      questionnairesCompleted: { value: realData.totalQuestionnaires, change: calcChange(realData.totalQuestionnaires, prevRealData?.totalQuestionnaires || 0) },
      ideasGenerated: { value: realData.totalGiftIdeas, change: calcChange(realData.totalGiftIdeas, prevRealData?.totalGiftIdeas || 0) },
      saves: { value: realData.totalGiftIdeas, change: calcChange(realData.totalGiftIdeas, prevRealData?.totalGiftIdeas || 0) },
      clicks: { value: realData.totalPartnerClicks, change: calcChange(realData.totalPartnerClicks, prevRealData?.totalPartnerClicks || 0) },
      reminders: { value: realData.totalReminders, change: calcChange(realData.totalReminders, prevRealData?.totalReminders || 0) }
    };
  }

  const distinctUsers = getDistinctUsers(events).length;
  const prevDistinctUsers = getDistinctUsers(previousEvents).length;

  const pageViews = getEventsByType(events, 'page_view').length;
  const prevPageViews = getEventsByType(previousEvents, 'page_view').length;

  const profilesCreated = getEventsByType(events, 'recipient_profile_created').length;
  const prevProfilesCreated = getEventsByType(previousEvents, 'recipient_profile_created').length;

  const questionnairesCompleted = getEventsByType(events, 'questionnaire_completed').length;
  const prevQuestionnairesCompleted = getEventsByType(previousEvents, 'questionnaire_completed').length;

  const ideasGeneratedEvents = getEventsByType(events, 'gift_ideas_generated');
  const ideasGenerated = ideasGeneratedEvents.reduce((sum, e) => sum + (e.metadata?.ideas?.length || 0), 0);
  const prevIdeasGeneratedEvents = getEventsByType(previousEvents, 'gift_ideas_generated');
  const prevIdeasGenerated = prevIdeasGeneratedEvents.reduce((sum, e) => sum + (e.metadata?.ideas?.length || 0), 0);

  const saves = getEventsByType(events, 'gift_idea_saved').length;
  const prevSaves = getEventsByType(previousEvents, 'gift_idea_saved').length;

  const clicks = getEventsByType(events, 'outbound_link_clicked').length;
  const prevClicks = getEventsByType(previousEvents, 'outbound_link_clicked').length;

  const reminders = getEventsByType(events, 'reminder_created').length;
  const prevReminders = getEventsByType(previousEvents, 'reminder_created').length;

  return {
    totalUsers: { value: distinctUsers, change: calcChange(distinctUsers, prevDistinctUsers) },
    pageViews: { value: pageViews, change: calcChange(pageViews, prevPageViews) },
    profilesCreated: { value: profilesCreated, change: calcChange(profilesCreated, prevProfilesCreated) },
    questionnairesCompleted: { value: questionnairesCompleted, change: calcChange(questionnairesCompleted, prevQuestionnairesCompleted) },
    ideasGenerated: { value: ideasGenerated, change: calcChange(ideasGenerated, prevIdeasGenerated) },
    saves: { value: saves, change: calcChange(saves, prevSaves) },
    clicks: { value: clicks, change: calcChange(clicks, prevClicks) },
    reminders: { value: reminders, change: calcChange(reminders, prevReminders) }
  };
}

export function exportToCsv(filename: string, rows: any[], headers: string[]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => {
      const value = row[h] !== undefined ? row[h] : '';
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
