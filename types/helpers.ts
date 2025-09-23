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
// 유용한 유니온 타입들
// ========================================
export type UserType = 'influencer' | 'advertiser' | 'admin'
export type CampaignStatus = 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
export type SwipeAction = 'like' | 'pass' | 'super_like'
export type ChatStatus = 'active' | 'archived' | 'blocked'
export type SenderType = 'influencer' | 'advertiser' | 'system'
export type InfluencerTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type CampaignUrgency = 'high' | 'medium' | 'low'

// ========================================
// 커스텀 인터페이스 (자주 사용하는 조합)
// ========================================

// 캠페인 with 광고주 정보
export interface CampaignWithAdvertiser extends Campaign {
  advertiser?: Advertiser
}

// 인플루언서 with 사용자 정보
export interface InfluencerWithUser extends Influencer {
  user?: User
}

// 지원 with 인플루언서 정보
export interface ApplicationWithInfluencer extends CampaignInfluencer {
  influencer?: Influencer
}

// 채팅방 with 관계 정보
export interface ChatRoomWithRelations extends ChatRoom {
  campaign?: Campaign
  advertiser?: Advertiser
  influencer?: Influencer
  last_message_content?: string
  last_message_time?: string
}

// 메시지 with 발신자 정보
export interface MessageWithSender extends Message {
  sender?: {
    id: string
    name: string
    avatar: string | null
    type: SenderType
  }
}

// ========================================
// API 응답 타입들
// ========================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ========================================
// 폼 데이터 타입들
// ========================================

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  userType: UserType
}

export interface CampaignFormData {
  name: string
  description: string
  budget: number
  categories: string[]
  start_date: string
  end_date: string
  min_followers: number
  min_engagement_rate: number
}