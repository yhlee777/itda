// lib/supabase/typed-client.ts
// 타입 안전한 Supabase 클라이언트와 헬퍼 함수들

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'
import type { 
  Campaign, 
  Influencer, 
  Advertiser, 
  User,
  InsertCampaignInfluencer,
  InsertSwipeHistory,
  InsertNotification,
  InsertChatRoom
} from '@/types/helpers'

// ========================================
// 타입 안전한 Supabase 클라이언트 생성
// ========================================
export function createTypedClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ========================================
// 타입 안전한 데이터베이스 클래스
// ========================================
export class TypedSupabase {
  private client = createTypedClient()

  // ----------------------------------------
  // 사용자 관련 메서드
  // ----------------------------------------
  
  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('User fetch error:', error)
      return null
    }
    
    return data
  }

  async getInfluencer(userId: string): Promise<Influencer | null> {
    const { data, error } = await this.client
      .from('influencers')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Influencer fetch error:', error)
      return null
    }
    
    return data
  }

  async getAdvertiser(userId: string): Promise<Advertiser | null> {
    const { data, error } = await this.client
      .from('advertisers')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Advertiser fetch error:', error)
      return null
    }
    
    return data
  }

  // ----------------------------------------
  // 캠페인 관련 메서드
  // ----------------------------------------
  
  async getCampaign(campaignId: string): Promise<Campaign | null> {
    const { data, error } = await this.client
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()
    
    if (error) {
      console.error('Campaign fetch error:', error)
      return null
    }
    
    return data
  }

  async getActiveCampaigns(limit: number = 10): Promise<Campaign[]> {
    const { data, error } = await this.client
      .from('campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Campaigns fetch error:', error)
      return []
    }
    
    return data || []
  }

  // ----------------------------------------
  // 스와이프 액션 (핵심 기능!)
  // ----------------------------------------
  
  async saveSwipeAction(
    campaignId: string,
    influencerId: string,
    action: 'like' | 'pass' | 'super_like',
    matchScore?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. 스와이프 히스토리 저장
      const swipeData: InsertSwipeHistory = {
        campaign_id: campaignId,
        influencer_id: influencerId,
        action: action,
        match_score: matchScore || null,
        category_match: true
      }

      const { error: swipeError } = await this.client
        .from('swipe_history')
        .insert(swipeData)

      if (swipeError) throw swipeError

      // 2. 좋아요/슈퍼라이크인 경우 지원 처리
      if (action === 'like' || action === 'super_like') {
        // 중복 체크
        const { data: existing } = await this.client
          .from('campaign_influencers')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('influencer_id', influencerId)
          .single()

        if (existing) {
          return { success: false, error: 'Already applied' }
        }

        // 지원 생성
        const applicationData: InsertCampaignInfluencer = {
          campaign_id: campaignId,
          influencer_id: influencerId,
          status: 'pending',
          match_score: matchScore || null
        }

        const { error: applyError } = await this.client
          .from('campaign_influencers')
          .insert(applicationData)

        if (applyError) throw applyError

        // 3. 캠페인 정보 가져오기 (advertiser_id null 체크!)
        const campaign = await this.getCampaign(campaignId)
        
        // ⚠️ 중요: advertiser_id null 체크
        if (campaign?.advertiser_id) {
          await this.createNotification(
            campaign.advertiser_id,
            'new_applicant',
            action === 'super_like' ? '⭐ 슈퍼 지원자!' : '새 지원자',
            `${campaign.name} 캠페인에 새 지원자가 있습니다`,
            {
              campaign_id: campaignId,
              influencer_id: influencerId,
              is_super_like: action === 'super_like'
            }
          )
        }
      }

      return { success: true }
      
    } catch (error: any) {
      console.error('Save swipe error:', error)
      return { success: false, error: error.message }
    }
  }

  // ----------------------------------------
  // 알림 생성
  // ----------------------------------------
  
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: any
  ): Promise<void> {
    try {
      const notificationData: InsertNotification = {
        user_id: userId,
        type,
        title,
        message,
        metadata: metadata || null,
        is_read: false
      }

      await this.client
        .from('notifications')
        .insert(notificationData)
        
    } catch (error) {
      console.error('Notification creation error:', error)
    }
  }

  // ----------------------------------------
  // 채팅방 생성
  // ----------------------------------------
  
  async createChatRoom(
    campaignId: string,
    advertiserId: string,
    influencerId: string
  ): Promise<string | null> {
    try {
      // 기존 채팅방 체크
      const { data: existing } = await this.client
        .from('chat_rooms')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('advertiser_id', advertiserId)
        .eq('influencer_id', influencerId)
        .single()

      if (existing) return existing.id

      // 새 채팅방 생성
      const chatRoomData: InsertChatRoom = {
        campaign_id: campaignId,
        advertiser_id: advertiserId,
        influencer_id: influencerId,
        status: 'active',
        unread_advertiser: 0,
        unread_influencer: 0
      }

      const { data, error } = await this.client
        .from('chat_rooms')
        .insert(chatRoomData)
        .select()
        .single()

      if (error) throw error

      return data?.id || null
      
    } catch (error) {
      console.error('Chat room creation error:', error)
      return null
    }
  }

  // ----------------------------------------
  // 통계 업데이트
  // ----------------------------------------
  
  async updateCampaignStats(
    campaignId: string,
    field: 'view_count' | 'like_count' | 'application_count'
  ): Promise<void> {
    try {
      const { data: campaign } = await this.client
        .from('campaigns')
        .select(field)
        .eq('id', campaignId)
        .single()

      if (campaign) {
        const currentValue = campaign[field] || 0
        await this.client
          .from('campaigns')
          .update({ [field]: currentValue + 1 })
          .eq('id', campaignId)
      }
    } catch (error) {
      console.error('Stats update error:', error)
    }
  }
}