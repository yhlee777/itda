// types/chat.types.ts

// 기본 데이터베이스 타입
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  image?: string;
  budget: number;
  start_date: string;
  end_date: string;
  category: string;
  advertiser_id: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at?: string;
}

export interface Advertiser {
  id: string;
  company_name: string;
  company_logo?: string;
  business_registration: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  industry?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Influencer {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  followers_count: number;
  engagement_rate: number;
  categories: string[];
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'active' | 'inactive' | 'suspended';
  verified: boolean;
  instagram_handle?: string;
  youtube_channel?: string;
  tiktok_handle?: string;
  created_at: string;
}

export interface CampaignApplication {
  id: string;
  campaign_id: string;
  influencer_id: string;
  advertiser_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposed_price?: number;
  cover_letter?: string;
  portfolio_links?: string[];
  available_dates?: any;
  match_score?: number;
  ai_recommendation?: string;
  risk_level?: 'low' | 'medium' | 'high';
  estimated_roi?: number;
  applied_at: string;
  reviewed_at?: string;
  decided_at?: string;
  reviewer_notes?: string;
  rejection_reason?: string;
}

export interface ChatRoom {
  id: string;
  campaign_id: string;
  advertiser_id: string;
  influencer_id: string;
  application_id?: string;
  status: 'active' | 'archived' | 'blocked';
  initiated_by?: 'advertiser' | 'influencer' | 'system';
  last_message?: string;
  last_message_at?: string;
  unread_advertiser: number;
  unread_influencer: number;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_type: 'advertiser' | 'influencer' | 'system';
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'contract';
  attachments?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// JOIN된 데이터 타입들
export interface ApplicationWithDetails extends CampaignApplication {
  campaign?: Campaign;
  influencer?: Influencer;
  advertiser?: Advertiser;
}

export interface ChatRoomWithDetails extends ChatRoom {
  campaign?: Campaign;
  advertiser?: Advertiser;
  influencer?: Influencer;
  messages?: Message[];
}

// 뷰 모델 타입
export interface ApplicantViewModel {
  id: string;
  campaign_id: string;
  campaign_name: string;
  influencer_id: string;
  influencer_name: string;
  influencer_avatar?: string;
  followers_count: number;
  engagement_rate: number;
  categories: string[];
  tier: string;
  verified: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposed_price: number;
  cover_letter?: string;
  portfolio_links?: string[];
  match_score: number;
  ai_recommendation?: string;
  risk_level: 'low' | 'medium' | 'high';
  estimated_roi: number;
  applied_at: Date;
  hours_since_applied: number;
}

export interface ApplicationViewModel {
  id: string;
  campaign_id: string;
  campaign_name: string;
  campaign_image?: string;
  brand_name: string;
  brand_logo?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposed_price: number;
  cover_letter?: string;
  applied_at: Date;
  reviewed_at?: Date;
  decided_at?: Date;
  rejection_reason?: string;
  campaign_end_date: Date;
  campaign_budget: number;
  campaign_category: string;
}

// 통계 타입
export interface ApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  avgResponseTime: number;
  acceptanceRate: number;
}

// Supabase 응답 타입
export interface SupabaseResponse<T> {
  data: T[] | null;
  error: any | null;
  count?: number | null;
}

// 타입 가드 함수들
export function isValidApplication(app: any): app is CampaignApplication {
  return app && 
    typeof app.id === 'string' &&
    typeof app.campaign_id === 'string' &&
    typeof app.influencer_id === 'string' &&
    typeof app.status === 'string';
}

export function isValidInfluencer(inf: any): inf is Influencer {
  return inf &&
    typeof inf.id === 'string' &&
    typeof inf.name === 'string' &&
    typeof inf.followers_count === 'number';
}

export function isValidCampaign(camp: any): camp is Campaign {
  return camp &&
    typeof camp.id === 'string' &&
    typeof camp.name === 'string' &&
    typeof camp.advertiser_id === 'string';
}