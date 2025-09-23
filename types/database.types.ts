// types/database.types.ts
// 자동 생성된 Supabase 타입

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

      advertisers: {
        Row: {
          id: string
          company_name: string
          company_logo: string | null
          business_registration: string | null
          contact_name: string | null
          contact_position: string | null
          contact_phone: string | null
          website: string | null
          industry: string | null
          marketing_budget: number | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name: string
          company_logo?: string | null
          business_registration?: string | null
          contact_name?: string | null
          contact_position?: string | null
          contact_phone?: string | null
          website?: string | null
          industry?: string | null
          marketing_budget?: number | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          company_logo?: string | null
          business_registration?: string | null
          contact_name?: string | null
          contact_position?: string | null
          contact_phone?: string | null
          website?: string | null
          industry?: string | null
          marketing_budget?: number | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      campaigns: {
        Row: {
          id: string
          advertiser_id: string | null
          name: string
          description: string | null
          categories: string[] | null
          budget: number
          start_date: string
          end_date: string
          requirements: string[] | null
          min_followers: number | null
          min_engagement_rate: number | null
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          urgency: 'low' | 'medium' | 'high'
          is_premium: boolean
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          advertiser_id?: string | null
          name: string
          description?: string | null
          categories?: string[] | null
          budget: number
          start_date: string
          end_date: string
          requirements?: string[] | null
          min_followers?: number | null
          min_engagement_rate?: number | null
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          urgency?: 'low' | 'medium' | 'high'
          is_premium?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          advertiser_id?: string | null
          name?: string
          description?: string | null
          categories?: string[] | null
          budget?: number
          start_date?: string
          end_date?: string
          requirements?: string[] | null
          min_followers?: number | null
          min_engagement_rate?: number | null
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          urgency?: 'low' | 'medium' | 'high'
          is_premium?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }

      campaign_influencers: {
        Row: {
          id: string
          campaign_id: string
          influencer_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price: number | null
          deliverables: Json | null
          match_score: number | null
          match_details: Json | null
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
          status?: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price?: number | null
          deliverables?: Json | null
          match_score?: number | null
          match_details?: Json | null
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
          status?: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price?: number | null
          deliverables?: Json | null
          match_score?: number | null
          match_details?: Json | null
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
          created_at?: string
        }
      }

      swipe_history: {
        Row: {
          id: string
          influencer_id: string | null
          campaign_id: string | null
          action: 'like' | 'pass' | 'super_like'
          match_score: number | null
          category_match: boolean | null
          swiped_at: string
        }
        Insert: {
          id?: string
          influencer_id?: string | null
          campaign_id?: string | null
          action: 'like' | 'pass' | 'super_like'
          match_score?: number | null
          category_match?: boolean | null
          swiped_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string | null
          campaign_id?: string | null
          action?: 'like' | 'pass' | 'super_like'
          match_score?: number | null
          category_match?: boolean | null
          swiped_at?: string
        }
      }

      chat_rooms: {
        Row: {
          id: string
          campaign_id: string | null
          advertiser_id: string | null
          influencer_id: string | null
          status: string | null
          last_message: string | null
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          advertiser_id?: string | null
          influencer_id?: string | null
          status?: string | null
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          advertiser_id?: string | null
          influencer_id?: string | null
          status?: string | null
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          message: string
          attachments: Json | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          message: string
          attachments?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          message?: string
          attachments?: Json | null
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