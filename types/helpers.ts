// types/helpers.ts
// 자주 사용하는 타입 헬퍼와 별칭들

import type { Database } from './database.types'

// ========================================
// 테이블 타입 추출 헬퍼
// ========================================
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// ========================================
// 자주 쓰는 타입 별칭 (Row 타입)
// ========================================
export type User = Tables<'users'>
export type Influencer = Tables<'influencers'>
export type Advertiser = Tables<'advertisers'>
export type Campaign = Tables<'campaigns'>
export type CampaignInfluencer = Tables<'campaign_influencers'>
export type SwipeHistory = Tables<'swipe_history'>
export type Notification = Tables<'notifications'>
export type ChatRoom = Tables<'chat_rooms'>
export type Message = Tables<'messages'>

// ========================================
// Insert 타입 별칭
// ========================================
export type InsertUser = Inserts<'users'>
export type InsertInfluencer = Inserts<'influencers'>
export type InsertAdvertiser = Inserts<'advertisers'>
export type InsertCampaign = Inserts<'campaigns'>
export type InsertCampaignInfluencer = Inserts<'campaign_influencers'>
export type InsertSwipeHistory = Inserts<'swipe_history'>
export type InsertNotification = Inserts<'notifications'>
export type InsertChatRoom = Inserts<'chat_rooms'>
export type InsertMessage = Inserts<'messages'>

// ========================================
// Update 타입 별칭
// ========================================
export type UpdateUser = Updates<'users'>
export type UpdateInfluencer = Updates<'influencers'>
export type UpdateAdvertiser = Updates<'advertisers'>
export type UpdateCampaign = Updates<'campaigns'>
export type UpdateCampaignInfluencer = Updates<'campaign_influencers'>
export type UpdateSwipeHistory = Updates<'swipe_history'>
export type UpdateNotification = Updates<'notifications'>
export type UpdateChatRoom = Updates<'chat_rooms'>
export type UpdateMessage = Updates<'messages'>

// ========================================
// 복합 타입 (Join된 데이터)
// ========================================
export interface CampaignWithAdvertiser extends Campaign {
  advertiser?: Advertiser
}

export interface CampaignInfluencerWithDetails extends CampaignInfluencer {
  campaign?: Campaign
  influencer?: Influencer
}

export interface ChatRoomWithParticipants extends ChatRoom {
  advertiser?: Advertiser
  influencer?: Influencer
  campaign?: Campaign
}

export interface MessageWithSender extends Message {
  sender?: User
}

// ========================================
// 뷰 모델 타입
// ========================================
export interface ApplicationViewModel {
  id: string
  campaign_id: string
  campaign_name: string
  campaign_image?: string
  brand_name: string
  brand_logo?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  proposed_price: number
  cover_letter?: string
  applied_at: Date
  reviewed_at?: Date
  decided_at?: Date
  rejection_reason?: string
  campaign_end_date: Date
  campaign_budget: number
  campaign_category: string
  match_score?: number
}

export interface ApplicantViewModel {
  id: string
  campaign_id: string
  campaign_name: string
  influencer_id: string
  influencer_name: string
  influencer_avatar?: string
  followers_count: number
  engagement_rate: number
  categories: string[]
  tier: string
  verified: boolean
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  proposed_price: number
  cover_letter?: string
  portfolio_links?: string[]
  match_score: number
  ai_recommendation?: string
  risk_level: 'low' | 'medium' | 'high'
  estimated_roi: number
  applied_at: Date
  hours_since_applied: number
}

// ========================================
// API 응답 타입
// ========================================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ========================================
// 필터 및 쿼리 타입
// ========================================
export interface CampaignFilters {
  category?: string
  minBudget?: number
  maxBudget?: number
  platform?: string[]
  urgency?: 'low' | 'medium' | 'high'
  status?: 'draft' | 'active' | 'paused' | 'completed'
}

export interface InfluencerFilters {
  categories?: string[]
  minFollowers?: number
  maxFollowers?: number
  minEngagement?: number
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  verified?: boolean
}

// ========================================
// 통계 타입
// ========================================
export interface CampaignStats {
  total_applicants: number
  pending_applicants: number
  accepted_applicants: number
  rejected_applicants: number
  avg_response_time: number
  avg_match_score: number
  estimated_reach: number
  estimated_engagement: number
}

export interface InfluencerStats {
  total_campaigns: number
  completed_campaigns: number
  avg_rating: number
  total_earnings: number
  success_rate: number
}

// ========================================
// 실시간 업데이트 타입
// ========================================
export interface RealtimePayload<T = any> {
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  type: 'broadcast' | 'presence' | 'postgres_changes'
  new?: T
  old?: T
}

// ========================================
// 에러 타입
// ========================================
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, details)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: any) {
    super('AUTH_ERROR', message, details)
    this.name = 'AuthError'
  }
}