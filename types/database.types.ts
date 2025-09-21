// types/database.types.ts (기존 파일 대체)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          user_type: 'influencer' | 'advertiser' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          user_type: 'influencer' | 'advertiser' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          phone?: string | null
          user_type?: 'influencer' | 'advertiser' | 'admin'
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
          categories: string[]
          followers_count: number
          following_count: number
          posts_count: number
          engagement_rate: number
          audience_demographics: AudienceData
          average_likes: number
          average_comments: number
          average_reach: number
          availability: AvailabilityData
          tier: 'standard' | 'gold' | 'premium'
          is_verified: boolean
          verification_date: string | null
          growth_rate: number
          content_quality_score: number
          bank_account: any | null
          total_campaigns: number
          total_earnings: number
          average_rating: number
          status: string
          main_platform: string | null
          instagram_username: string | null
          youtube_channel: string | null
          tiktok_username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          username: string
          avatar?: string | null
          bio?: string | null
          categories?: string[]
          followers_count?: number
          following_count?: number
          posts_count?: number
          engagement_rate?: number
          audience_demographics?: AudienceData
          average_likes?: number
          average_comments?: number
          average_reach?: number
          availability?: AvailabilityData
          tier?: 'standard' | 'gold' | 'premium'
          is_verified?: boolean
          verification_date?: string | null
          growth_rate?: number
          content_quality_score?: number
          bank_account?: any | null
          total_campaigns?: number
          total_earnings?: number
          average_rating?: number
          status?: string
          main_platform?: string | null
          instagram_username?: string | null
          youtube_channel?: string | null
          tiktok_username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          username?: string
          avatar?: string | null
          bio?: string | null
          categories?: string[]
          followers_count?: number
          following_count?: number
          posts_count?: number
          engagement_rate?: number
          audience_demographics?: AudienceData
          average_likes?: number
          average_comments?: number
          average_reach?: number
          availability?: AvailabilityData
          tier?: 'standard' | 'gold' | 'premium'
          is_verified?: boolean
          verification_date?: string | null
          growth_rate?: number
          content_quality_score?: number
          bank_account?: any | null
          total_campaigns?: number
          total_earnings?: number
          average_rating?: number
          status?: string
          main_platform?: string | null
          instagram_username?: string | null
          youtube_channel?: string | null
          tiktok_username?: string | null
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          advertiser_id: string
          name: string
          description: string | null
          objectives: string[]
          categories: string[]
          budget: number
          spent: number
          start_date: string
          end_date: string
          target_audience: AudienceData
          min_followers: number
          min_engagement_rate: number
          deliverables: any
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
          advertiser_id: string
          name: string
          description?: string | null
          objectives?: string[]
          categories?: string[]
          budget: number
          spent?: number
          start_date: string
          end_date: string
          target_audience?: AudienceData
          min_followers?: number
          min_engagement_rate?: number
          deliverables?: any
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
          advertiser_id?: string
          name?: string
          description?: string | null
          objectives?: string[]
          categories?: string[]
          budget?: number
          spent?: number
          start_date?: string
          end_date?: string
          target_audience?: AudienceData
          min_followers?: number
          min_engagement_rate?: number
          deliverables?: any
          requirements?: string[]
          status?: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
          impressions?: number
          clicks?: number
          conversions?: number
          revenue?: number
          updated_at?: string
        }
      }
      campaign_influencers: {
        Row: {
          id: string
          campaign_id: string
          influencer_id: string
          match_score: number | null
          match_details: any | null
          status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price: number | null
          deliverables: any | null
          matched_at: string
          accepted_at: string | null
          started_at: string | null
          completed_at: string | null
          content_links: any
          performance_metrics: any
          rating: number | null
          review: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          influencer_id: string
          match_score?: number | null
          match_details?: any | null
          status?: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price?: number | null
          deliverables?: any | null
          matched_at?: string
          accepted_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          content_links?: any
          performance_metrics?: any
          rating?: number | null
          review?: string | null
        }
        Update: {
          match_score?: number | null
          match_details?: any | null
          status?: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'
          agreed_price?: number | null
          deliverables?: any | null
          accepted_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          content_links?: any
          performance_metrics?: any
          rating?: number | null
          review?: string | null
        }
      }
      matching_history: {
        Row: {
          id: string
          campaign_id: string
          matched_influencers: any
          filters_used: any | null
          total_analyzed: number | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          matched_influencers: any
          filters_used?: any | null
          total_analyzed?: number | null
          created_at?: string
        }
        Update: {
          matched_influencers?: any
          filters_used?: any | null
          total_analyzed?: number | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          metadata: any | null
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
          metadata?: any | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          type?: string
          title?: string
          message?: string
          metadata?: any | null
          is_read?: boolean
          read_at?: string | null
        }
      }
    }
  }
}

// ============================================
// 공통 타입 정의
// ============================================

export interface AudienceData {
  age_range?: string
  age_distribution?: Record<string, number>
  gender?: string
  gender_distribution?: {
    male: number
    female: number
    other?: number
  }
  location?: string[]
  location_distribution?: Record<string, number>
  interests?: string[]
}

export interface AvailabilityData {
  status: 'immediate' | 'scheduled' | 'busy'
  available_from?: string
  blackout_dates?: string[]
}

export interface MatchDetails {
  score: number
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  estimatedReach: number
  estimatedEngagement: number
  suggestedBudget: number
}

// ============================================
// 유틸리티 타입
// ============================================

export type UserType = Database['public']['Tables']['users']['Row']['user_type']
export type CampaignStatus = Database['public']['Tables']['campaigns']['Row']['status']
export type InfluencerTier = Database['public']['Tables']['influencers']['Row']['tier']
export type MatchStatus = Database['public']['Tables']['campaign_influencers']['Row']['status']

// Insert/Update 타입 단축키
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type AdvertiserInsert = Database['public']['Tables']['advertisers']['Insert']
export type AdvertiserUpdate = Database['public']['Tables']['advertisers']['Update']
export type InfluencerInsert = Database['public']['Tables']['influencers']['Insert']
export type InfluencerUpdate = Database['public']['Tables']['influencers']['Update']
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']

// Row 타입 단축키
export type User = Database['public']['Tables']['users']['Row']
export type Advertiser = Database['public']['Tables']['advertisers']['Row']
export type Influencer = Database['public']['Tables']['influencers']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type CampaignInfluencer = Database['public']['Tables']['campaign_influencers']['Row']
export type MatchingHistory = Database['public']['Tables']['matching_history']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']