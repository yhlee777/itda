// types/database.types.ts
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
          audience_demographics: Json
          average_likes: number
          average_comments: number
          average_reach: number
          availability: Json
          tier: 'standard' | 'gold' | 'premium'
          is_verified: boolean
          verification_date: string | null
          growth_rate: number
          content_quality_score: number
          total_campaigns: number
          total_earnings: number
          average_rating: number
          status: string | null
          main_platform: string | null
          instagram_username: string | null
          youtube_channel: string | null
          tiktok_username: string | null
          bank_account: Json | null
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
          audience_demographics?: Json
          average_likes?: number
          average_comments?: number
          average_reach?: number
          availability?: Json
          tier?: 'standard' | 'gold' | 'premium'
          is_verified?: boolean
          verification_date?: string | null
          growth_rate?: number
          content_quality_score?: number
          total_campaigns?: number
          total_earnings?: number
          average_rating?: number
          status?: string | null
          main_platform?: string | null
          instagram_username?: string | null
          youtube_channel?: string | null
          tiktok_username?: string | null
          bank_account?: Json | null
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
          audience_demographics?: Json
          average_likes?: number
          average_comments?: number
          average_reach?: number
          availability?: Json
          tier?: 'standard' | 'gold' | 'premium'
          is_verified?: boolean
          verification_date?: string | null
          growth_rate?: number
          content_quality_score?: number
          total_campaigns?: number
          total_earnings?: number
          average_rating?: number
          status?: string | null
          main_platform?: string | null
          instagram_username?: string | null
          youtube_channel?: string | null
          tiktok_username?: string | null
          bank_account?: Json | null
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
          objectives: string[]
          categories: string[]
          budget: number
          spent: number
          start_date: string
          end_date: string
          target_audience: Json
          min_followers: number
          min_engagement_rate: number
          deliverables: Json
          requirements: string[]
          status: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
          impressions: number
          clicks: number
          conversions: number
          revenue: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          advertiser_id?: string | null
          name: string
          description?: string | null
          objectives?: string[]
          categories?: string[]
          budget: number
          spent?: number
          start_date: string
          end_date: string
          target_audience?: Json
          min_followers?: number
          min_engagement_rate?: number
          deliverables?: Json
          requirements?: string[]
          status?: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
          impressions?: number
          clicks?: number
          conversions?: number
          revenue?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          advertiser_id?: string | null
          name?: string
          description?: string | null
          objectives?: string[]
          categories?: string[]
          budget?: number
          spent?: number
          start_date?: string
          end_date?: string
          target_audience?: Json
          min_followers?: number
          min_engagement_rate?: number
          deliverables?: Json
          requirements?: string[]
          status?: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
          impressions?: number
          clicks?: number
          conversions?: number
          revenue?: number
          created_at?: string
          updated_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          campaign_id: string | null
          advertiser_id: string | null
          influencer_id: string | null
          status: 'active' | 'archived' | 'blocked'
          last_message: string | null
          last_message_at: string | null
          unread_count_advertiser: number
          unread_count_influencer: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          advertiser_id?: string | null
          influencer_id?: string | null
          status?: 'active' | 'archived' | 'blocked'
          last_message?: string | null
          last_message_at?: string | null
          unread_count_advertiser?: number
          unread_count_influencer?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          advertiser_id?: string | null
          influencer_id?: string | null
          status?: 'active' | 'archived' | 'blocked'
          last_message?: string | null
          last_message_at?: string | null
          unread_count_advertiser?: number
          unread_count_influencer?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_room_id: string
          sender_id: string
          sender_type: 'influencer' | 'advertiser' | 'system' | null
          content: string
          message_type: 'text' | 'image' | 'file' | 'contract' | 'system'
          attachments: string[] | null
          contract_id: string | null
          is_edited: boolean
          is_deleted: boolean
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_room_id: string
          sender_id: string
          sender_type?: 'influencer' | 'advertiser' | 'system' | null
          content: string
          message_type?: 'text' | 'image' | 'file' | 'contract' | 'system'
          attachments?: string[] | null
          contract_id?: string | null
          is_edited?: boolean
          is_deleted?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string
          sender_id?: string
          sender_type?: 'influencer' | 'advertiser' | 'system' | null
          content?: string
          message_type?: 'text' | 'image' | 'file' | 'contract' | 'system'
          attachments?: string[] | null
          contract_id?: string | null
          is_edited?: boolean
          is_deleted?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contract_proposals: {
        Row: {
          id: string
          chat_room_id: string | null
          campaign_id: string | null
          proposed_by: string | null
          proposed_to: string | null
          proposed_price: number
          deliverables: Json
          deadline: string
          payment_terms: string | null
          requirements: string[]
          notes: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'counter' | 'expired'
          counter_proposal_id: string | null
          proposed_at: string
          responded_at: string | null
          expires_at: string | null
          advertiser_signature: string | null
          influencer_signature: string | null
          signed_at: string | null
        }
        Insert: {
          id?: string
          chat_room_id?: string | null
          campaign_id?: string | null
          proposed_by?: string | null
          proposed_to?: string | null
          proposed_price: number
          deliverables: Json
          deadline: string
          payment_terms?: string | null
          requirements?: string[]
          notes?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'counter' | 'expired'
          counter_proposal_id?: string | null
          proposed_at?: string
          responded_at?: string | null
          expires_at?: string | null
          advertiser_signature?: string | null
          influencer_signature?: string | null
          signed_at?: string | null
        }
        Update: {
          id?: string
          chat_room_id?: string | null
          campaign_id?: string | null
          proposed_by?: string | null
          proposed_to?: string | null
          proposed_price?: number
          deliverables?: Json
          deadline?: string
          payment_terms?: string | null
          requirements?: string[]
          notes?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'counter' | 'expired'
          counter_proposal_id?: string | null
          proposed_at?: string
          responded_at?: string | null
          expires_at?: string | null
          advertiser_signature?: string | null
          influencer_signature?: string | null
          signed_at?: string | null
        }
      }
      campaign_influencers: {
        Row: {
          id: string
          campaign_id: string | null
          influencer_id: string | null
          match_score: number | null
          match_details: Json | null
          status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price: number | null
          deliverables: Json | null
          matched_at: string
          accepted_at: string | null
          started_at: string | null
          completed_at: string | null
          content_links: Json
          performance_metrics: Json
          rating: number | null
          review: string | null
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          influencer_id?: string | null
          match_score?: number | null
          match_details?: Json | null
          status?: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price?: number | null
          deliverables?: Json | null
          matched_at?: string
          accepted_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          content_links?: Json
          performance_metrics?: Json
          rating?: number | null
          review?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string | null
          influencer_id?: string | null
          match_score?: number | null
          match_details?: Json | null
          status?: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price?: number | null
          deliverables?: Json | null
          matched_at?: string
          accepted_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          content_links?: Json
          performance_metrics?: Json
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
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}