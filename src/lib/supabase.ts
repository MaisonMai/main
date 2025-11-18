import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  country: string;
  city: string | null;
  currency: string;
  locale: string;
  created_at: string;
  updated_at: string;
};

export type Person = {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  birthday: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type GiftIdea = {
  id: string;
  person_id: string;
  user_id: string;
  title: string;
  description: string;
  url: string;
  price: number | null;
  priority: 'low' | 'medium' | 'high';
  is_purchased: boolean;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  person_id: string;
  user_id: string;
  title: string;
  date: string;
  is_recurring: boolean;
  days_before_notification: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PersonPreferences = {
  id: string;
  person_id: string;
  user_id: string;
  interests: any[];
  style_preferences: Record<string, any>;
  price_range_preferences: Record<string, any>;
  categories: string[];
  brands: string[];
  last_analyzed_at: string;
  confidence_score: number;
  created_at: string;
  updated_at: string;
};

export type GiftAnalysis = {
  id: string;
  gift_idea_id: string;
  user_id: string;
  extracted_info: Record<string, any>;
  category: string;
  price_point: string;
  analyzed_at: string;
  created_at: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  user_id: string | null;
  status: 'new' | 'read' | 'resolved';
  created_at: string;
  updated_at: string;
};

export type GiftPartner = {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  website_url: string | null;
  discount_code: string | null;
  discount_description: string | null;
  categories: string[];
  is_active: boolean;
  display_order: number;
  user_id: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  profile_completed: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
};

export type GiftPartnerProduct = {
  id: string;
  partner_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string | null;
  product_url: string;
  categories: string[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type GiftPartnerClick = {
  id: string;
  partner_id: string | null;
  product_id: string | null;
  user_id: string | null;
  click_type: 'partner_profile' | 'product_view' | 'product_click' | 'website_click';
  clicked_at: string;
};

export type AdminUser = {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PartnerConversation = {
  id: string;
  partner_id: string;
  user_id: string;
  last_message_at: string;
  unread_partner_count: number;
  unread_user_count: number;
  created_at: string;
  updated_at: string;
};

export type PartnerMessage = {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'partner';
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
};

export type PartnershipEnquiry = {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone_number: string;
  status: 'new' | 'contacted' | 'in_progress' | 'closed';
  admin_notes: string;
  created_at: string;
};
