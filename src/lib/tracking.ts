import { supabase } from './supabase';

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
