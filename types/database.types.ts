// types/database.types.ts
// Supabase 데이터베이스 타입 정의 (완전한 버전)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // users 테이블
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          user_type: 'influencer' | 'advertiser' | 'admin' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          user_type?: 'influencer' | 'advertiser' | 'admin' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          user_type?: 'influencer' | 'advertiser' | 'admin' | null
          created_at?: string
          updated_at?: string
        }
      }

      // influencers 테이블
      influencers: {
        Row: {
          id: string
          name: string
          username: string
          avatar: string | null
          bio: string | null
          categories: string[] | null
          followers_count: number
          following_count: number
          posts_count: number
          engagement_rate: number
          audience_demographics: Json | null
          average_likes: number
          average_comments: number
          tier: 'bronze' | 'silver' | 'gold' | 'platinum' | null
          is_verified: boolean
          instagram_handle: string | null
          youtube_handle: string | null
          tiktok_handle: string | null
          preferred_categories: string[] | null
          daily_swipes_count: number
          daily_swipes_limit: number
          last_swipe_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          username: string
          avatar?: string | null
          bio?: string | null
          categories?: string[] | null
          followers_count?: number
          following_count?: number
          posts_count?: number
          engagement_rate?: number
          audience_demographics?: Json | null
          average_likes?: number
          average_comments?: number
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null
          is_verified?: boolean
          instagram_handle?: string | null
          youtube_handle?: string | null
          tiktok_handle?: string | null
          preferred_categories?: string[] | null
          daily_swipes_count?: number
          daily_swipes_limit?: number
          last_swipe_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          username?: string
          avatar?: string | null
          bio?: string | null
          categories?: string[] | null
          followers_count?: number
          following_count?: number
          posts_count?: number
          engagement_rate?: number
          audience_demographics?: Json | null
          average_likes?: number
          average_comments?: number
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null
          is_verified?: boolean
          instagram_handle?: string | null
          youtube_handle?: string | null
          tiktok_handle?: string | null
          preferred_categories?: string[] | null
          daily_swipes_count?: number
          daily_swipes_limit?: number
          last_swipe_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // advertisers 테이블
      advertisers: {
        Row: {
          id: string
          company_name: string
          business_registration: string
          contact_name: string
          contact_position: string
          contact_phone: string | null
          website: string | null
          industry: string | null
          marketing_budget: string | null
          company_logo: string | null
          description: string | null
          is_verified: boolean
          verified_at: string | null
          verified_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name: string
          business_registration: string
          contact_name: string
          contact_position: string
          contact_phone?: string | null
          website?: string | null
          industry?: string | null
          marketing_budget?: string | null
          company_logo?: string | null
          description?: string | null
          is_verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          business_registration?: string
          contact_name?: string
          contact_position?: string
          contact_phone?: string | null
          website?: string | null
          industry?: string | null
          marketing_budget?: string | null
          company_logo?: string | null
          description?: string | null
          is_verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // campaigns 테이블 (⚠️ advertiser_id가 null 가능!)
      campaigns: {
        Row: {
          id: string
          advertiser_id: string | null  // ⚠️ null 가능!
          name: string
          description: string | null
          objectives: string[] | null
          categories: string[] | null
          budget: number
          spent: number
          start_date: string
          end_date: string
          target_audience: Json | null
          min_followers: number
          min_engagement_rate: number
          deliverables: Json | null
          requirements: string[] | null
          status: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
          view_count: number
          like_count: number
          application_count: number
          is_premium: boolean
          urgency: 'high' | 'medium' | 'low' | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          advertiser_id?: string | null
          name: string
          description?: string | null
          objectives?: string[] | null
          categories?: string[] | null
          budget: number
          spent?: number
          start_date: string
          end_date: string
          target_audience?: Json | null
          min_followers?: number
          min_engagement_rate?: number
          deliverables?: Json | null
          requirements?: string[] | null
          status?: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
          view_count?: number
          like_count?: number
          application_count?: number
          is_premium?: boolean
          urgency?: 'high' | 'medium' | 'low' | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          advertiser_id?: string | null
          name?: string
          description?: string | null
          objectives?: string[] | null
          categories?: string[] | null
          budget?: number
          spent?: number
          start_date?: string
          end_date?: string
          target_audience?: Json | null
          min_followers?: number
          min_engagement_rate?: number
          deliverables?: Json | null
          requirements?: string[] | null
          status?: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
          view_count?: number
          like_count?: number
          application_count?: number
          is_premium?: boolean
          urgency?: 'high' | 'medium' | 'low' | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }

      // campaign_influencers 테이블
      campaign_influencers: {
        Row: {
          id: string
          campaign_id: string
          influencer_id: string
          match_score: number | null
          match_details: Json | null
          status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price: number | null
          deliverables: Json | null
          matched_at: string
          accepted_at: string | null
          started_at: string | null
          completed_at: string | null
          content_links: Json | null
          performance_metrics: Json | null
          rating: number | null
          review: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          influencer_id: string
          match_score?: number | null
          match_details?: Json | null
          status?: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price?: number | null
          deliverables?: Json | null
          matched_at?: string
          accepted_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          content_links?: Json | null
          performance_metrics?: Json | null
          rating?: number | null
          review?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          influencer_id?: string
          match_score?: number | null
          match_details?: Json | null
          status?: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price?: number | null
          deliverables?: Json | null
          matched_at?: string
          accepted_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          content_links?: Json | null
          performance_metrics?: Json | null
          rating?: number | null
          review?: string | null
        }
      }

      // swipe_history 테이블
      swipe_history: {
        Row: {
          id: string
          influencer_id: string
          campaign_id: string
          action: 'like' | 'pass' | 'super_like'
          match_score: number | null
          category_match: boolean
          swiped_at: string
        }
        Insert: {
          id?: string
          influencer_id: string
          campaign_id: string
          action: 'like' | 'pass' | 'super_like'
          match_score?: number | null
          category_match?: boolean
          swiped_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string
          campaign_id?: string
          action?: 'like' | 'pass' | 'super_like'
          match_score?: number | null
          category_match?: boolean
          swiped_at?: string
        }
      }

      // campaign_queue 테이블
      campaign_queue: {
        Row: {
          id: string
          influencer_id: string
          campaign_id: string
          queue_order: number
          category_priority: number
          added_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          influencer_id: string
          campaign_id: string
          queue_order: number
          category_priority?: number
          added_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string
          campaign_id?: string
          queue_order?: number
          category_priority?: number
          added_at?: string
          expires_at?: string
        }
      }

      // notifications 테이블
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          metadata: Json | null
          is_read: boolean
          read_at: string | null
          priority: string | null
          action_url: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          metadata?: Json | null
          is_read?: boolean
          read_at?: string | null
          priority?: string | null
          action_url?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          metadata?: Json | null
          is_read?: boolean
          read_at?: string | null
          priority?: string | null
          action_url?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }

      // chat_rooms 테이블
      chat_rooms: {
        Row: {
          id: string
          campaign_id: string
          advertiser_id: string
          influencer_id: string
          status: 'active' | 'archived' | 'blocked'
          contract_status: string | null
          last_message: string | null
          last_message_at: string | null
          unread_advertiser: number
          unread_influencer: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          advertiser_id: string
          influencer_id: string
          status?: 'active' | 'archived' | 'blocked'
          contract_status?: string | null
          last_message?: string | null
          last_message_at?: string | null
          unread_advertiser?: number
          unread_influencer?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          advertiser_id?: string
          influencer_id?: string
          status?: 'active' | 'archived' | 'blocked'
          contract_status?: string | null
          last_message?: string | null
          last_message_at?: string | null
          unread_advertiser?: number
          unread_influencer?: number
          created_at?: string
          updated_at?: string
        }
      }

      // messages 테이블
      messages: {
        Row: {
          id: string
          chat_room_id: string
          sender_id: string
          sender_type: 'influencer' | 'advertiser' | 'system' | null
          content: string
          message_type: string | null
          attachments: Json | null
          is_edited: boolean
          is_deleted: boolean
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chat_room_id: string
          sender_id: string
          sender_type?: 'influencer' | 'advertiser' | 'system' | null
          content: string
          message_type?: string | null
          attachments?: Json | null
          is_edited?: boolean
          is_deleted?: boolean
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string
          sender_id?: string
          sender_type?: 'influencer' | 'advertiser' | 'system' | null
          content?: string
          message_type?: string | null
          attachments?: Json | null
          is_edited?: boolean
          is_deleted?: boolean
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}