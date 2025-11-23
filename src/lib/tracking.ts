import { supabase } from './supabase';

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
  }
  return sessionId;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'account_created'
  | 'recipient_profile_created'
  | 'questionnaire_completed'
  | 'gift_ideas_generated'
  | 'gift_idea_saved'
  | 'outbound_link_clicked'
  | 'reminder_created';

export async function trackEvent(
  eventType: AnalyticsEventType,
  metadata?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      session_id: getSessionId(),
      event_type: eventType,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

export async function trackPageView(pageName: string, pagePath: string) {
  await trackEvent('page_view', {
    page_name: pageName,
    page: pagePath
  });
}

export async function trackPartnerClick(
  partnerId: string,
  clickType: 'partner_profile' | 'website_click'
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('gift_partner_clicks').insert({
      partner_id: partnerId,
      user_id: user?.id || null,
      click_type: clickType,
    });
  } catch (error) {
    console.error('Error tracking partner click:', error);
  }
}

export async function trackProductClick(
  productId: string,
  partnerId: string,
  clickType: 'product_view' | 'product_click'
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('gift_partner_clicks').insert({
      partner_id: partnerId,
      product_id: productId,
      user_id: user?.id || null,
      click_type: clickType,
    });
  } catch (error) {
    console.error('Error tracking product click:', error);
  }
}
