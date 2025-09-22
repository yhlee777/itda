export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      advertisers: {
        Row: {
          business_registration: string
          company_logo: string | null
          company_name: string
          contact_name: string
          contact_phone: string | null
          contact_position: string
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          is_verified: boolean | null
          marketing_budget: string | null
          rejection_reason: string | null
          updated_at: string | null
          verification_date: string | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          business_registration: string
          company_logo?: string | null
          company_name: string
          contact_name: string
          contact_phone?: string | null
          contact_position: string
          created_at?: string | null
          description?: string | null
          id: string
          industry?: string | null
          is_verified?: boolean | null
          marketing_budget?: string | null
          rejection_reason?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          business_registration?: string
          company_logo?: string | null
          company_name?: string
          contact_name?: string
          contact_phone?: string | null
          contact_position?: string
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          marketing_budget?: string | null
          rejection_reason?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advertisers_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_influencers: {
        Row: {
          accepted_at: string | null
          agreed_price: number | null
          campaign_id: string | null
          completed_at: string | null
          content_links: Json | null
          deliverables: Json | null
          id: string
          influencer_id: string | null
          match_details: Json | null
          match_score: number | null
          matched_at: string | null
          performance_metrics: Json | null
          rating: number | null
          review: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          agreed_price?: number | null
          campaign_id?: string | null
          completed_at?: string | null
          content_links?: Json | null
          deliverables?: Json | null
          id?: string
          influencer_id?: string | null
          match_details?: Json | null
          match_score?: number | null
          matched_at?: string | null
          performance_metrics?: Json | null
          rating?: number | null
          review?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          agreed_price?: number | null
          campaign_id?: string | null
          completed_at?: string | null
          content_links?: Json | null
          deliverables?: Json | null
          id?: string
          influencer_id?: string | null
          match_details?: Json | null
          match_score?: number | null
          matched_at?: string | null
          performance_metrics?: Json | null
          rating?: number | null
          review?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_influencers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_influencers_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_queue: {
        Row: {
          added_at: string | null
          campaign_id: string
          category_priority: number | null
          expires_at: string | null
          id: string
          influencer_id: string
          queue_order: number
        }
        Insert: {
          added_at?: string | null
          campaign_id: string
          category_priority?: number | null
          expires_at?: string | null
          id?: string
          influencer_id: string
          queue_order: number
        }
        Update: {
          added_at?: string | null
          campaign_id?: string
          category_priority?: number | null
          expires_at?: string | null
          id?: string
          influencer_id?: string
          queue_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_queue_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          advertiser_id: string | null
          application_count: number | null
          budget: number
          categories: string[] | null
          clicks: number | null
          conversions: number | null
          created_at: string | null
          deliverables: Json | null
          description: string | null
          end_date: string
          id: string
          impressions: number | null
          is_premium: boolean | null
          like_count: number | null
          metadata: Json | null
          min_engagement_rate: number | null
          min_followers: number | null
          name: string
          objectives: string[] | null
          requirements: string[] | null
          revenue: number | null
          spent: number | null
          start_date: string
          status: string | null
          target_audience: Json | null
          updated_at: string | null
          urgency: string | null
          view_count: number | null
        }
        Insert: {
          advertiser_id?: string | null
          application_count?: number | null
          budget: number
          categories?: string[] | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          deliverables?: Json | null
          description?: string | null
          end_date: string
          id?: string
          impressions?: number | null
          is_premium?: boolean | null
          like_count?: number | null
          metadata?: Json | null
          min_engagement_rate?: number | null
          min_followers?: number | null
          name: string
          objectives?: string[] | null
          requirements?: string[] | null
          revenue?: number | null
          spent?: number | null
          start_date: string
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
          urgency?: string | null
          view_count?: number | null
        }
        Update: {
          advertiser_id?: string | null
          application_count?: number | null
          budget?: number
          categories?: string[] | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          deliverables?: Json | null
          description?: string | null
          end_date?: string
          id?: string
          impressions?: number | null
          is_premium?: boolean | null
          like_count?: number | null
          metadata?: Json | null
          min_engagement_rate?: number | null
          min_followers?: number | null
          name?: string
          objectives?: string[] | null
          requirements?: string[] | null
          revenue?: number | null
          spent?: number | null
          start_date?: string
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
          urgency?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_notifications: {
        Row: {
          chat_room_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message_id: string | null
          notification_type: string | null
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_room_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          notification_type?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_room_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          notification_type?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_notifications_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_notifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          advertiser_id: string | null
          agreed_deliverables: Json | null
          agreed_price: number | null
          ai_insights: Json | null
          campaign_id: string | null
          contract_status: string | null
          created_at: string | null
          id: string
          influencer_id: string | null
          last_message_at: string | null
          last_message_preview: string | null
          match_score: number | null
          matched_at: string | null
          risk_score: number | null
          status: string | null
          suggested_price: number | null
          unread_count_advertiser: number | null
          unread_count_influencer: number | null
          updated_at: string | null
        }
        Insert: {
          advertiser_id?: string | null
          agreed_deliverables?: Json | null
          agreed_price?: number | null
          ai_insights?: Json | null
          campaign_id?: string | null
          contract_status?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          match_score?: number | null
          matched_at?: string | null
          risk_score?: number | null
          status?: string | null
          suggested_price?: number | null
          unread_count_advertiser?: number | null
          unread_count_influencer?: number | null
          updated_at?: string | null
        }
        Update: {
          advertiser_id?: string | null
          agreed_deliverables?: Json | null
          agreed_price?: number | null
          ai_insights?: Json | null
          campaign_id?: string | null
          contract_status?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          match_score?: number | null
          matched_at?: string | null
          risk_score?: number | null
          status?: string | null
          suggested_price?: number | null
          unread_count_advertiser?: number | null
          unread_count_influencer?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          title: string
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          title: string
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_proposals: {
        Row: {
          additional_terms: string | null
          chat_room_id: string | null
          created_at: string | null
          deadline: string
          deliverables: Json
          expires_at: string | null
          id: string
          payment_terms: Json | null
          price: number
          proposed_by: string | null
          responded_at: string | null
          response_notes: string | null
          status: string | null
        }
        Insert: {
          additional_terms?: string | null
          chat_room_id?: string | null
          created_at?: string | null
          deadline: string
          deliverables: Json
          expires_at?: string | null
          id?: string
          payment_terms?: Json | null
          price: number
          proposed_by?: string | null
          responded_at?: string | null
          response_notes?: string | null
          status?: string | null
        }
        Update: {
          additional_terms?: string | null
          chat_room_id?: string | null
          created_at?: string | null
          deadline?: string
          deliverables?: Json
          expires_at?: string | null
          id?: string
          payment_terms?: Json | null
          price?: number
          proposed_by?: string | null
          responded_at?: string | null
          response_notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_proposals_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          audience_demographics: Json | null
          availability: Json | null
          avatar: string | null
          average_comments: number | null
          average_likes: number | null
          average_rating: number | null
          average_reach: number | null
          bank_account: Json | null
          bio: string | null
          categories: string[] | null
          content_quality_score: number | null
          created_at: string | null
          daily_swipes_count: number | null
          daily_swipes_reset_at: string | null
          engagement_rate: number | null
          followers_count: number | null
          following_count: number | null
          growth_rate: number | null
          id: string
          instagram_username: string | null
          is_verified: boolean | null
          last_swipe_at: string | null
          main_platform: string | null
          name: string
          posts_count: number | null
          preferred_categories: string[] | null
          status: string | null
          tier: string | null
          tiktok_username: string | null
          total_campaigns: number | null
          total_earnings: number | null
          updated_at: string | null
          username: string
          verification_date: string | null
          youtube_channel: string | null
        }
        Insert: {
          audience_demographics?: Json | null
          availability?: Json | null
          avatar?: string | null
          average_comments?: number | null
          average_likes?: number | null
          average_rating?: number | null
          average_reach?: number | null
          bank_account?: Json | null
          bio?: string | null
          categories?: string[] | null
          content_quality_score?: number | null
          created_at?: string | null
          daily_swipes_count?: number | null
          daily_swipes_reset_at?: string | null
          engagement_rate?: number | null
          followers_count?: number | null
          following_count?: number | null
          growth_rate?: number | null
          id: string
          instagram_username?: string | null
          is_verified?: boolean | null
          last_swipe_at?: string | null
          main_platform?: string | null
          name: string
          posts_count?: number | null
          preferred_categories?: string[] | null
          status?: string | null
          tier?: string | null
          tiktok_username?: string | null
          total_campaigns?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          username: string
          verification_date?: string | null
          youtube_channel?: string | null
        }
        Update: {
          audience_demographics?: Json | null
          availability?: Json | null
          avatar?: string | null
          average_comments?: number | null
          average_likes?: number | null
          average_rating?: number | null
          average_reach?: number | null
          bank_account?: Json | null
          bio?: string | null
          categories?: string[] | null
          content_quality_score?: number | null
          created_at?: string | null
          daily_swipes_count?: number | null
          daily_swipes_reset_at?: string | null
          engagement_rate?: number | null
          followers_count?: number | null
          following_count?: number | null
          growth_rate?: number | null
          id?: string
          instagram_username?: string | null
          is_verified?: boolean | null
          last_swipe_at?: string | null
          main_platform?: string | null
          name?: string
          posts_count?: number | null
          preferred_categories?: string[] | null
          status?: string | null
          tier?: string | null
          tiktok_username?: string | null
          total_campaigns?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          username?: string
          verification_date?: string | null
          youtube_channel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_history: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          filters_used: Json | null
          id: string
          matched_influencers: Json
          total_analyzed: number | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          filters_used?: Json | null
          id?: string
          matched_influencers: Json
          total_analyzed?: number | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          filters_used?: Json | null
          id?: string
          matched_influencers?: Json
          total_analyzed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matching_history_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          chat_room_id: string | null
          content: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          is_offer: boolean | null
          is_read: boolean | null
          message_type: string | null
          metadata: Json | null
          offer_details: Json | null
          offer_status: string | null
          read_at: string | null
          sender_id: string | null
          sender_type: string | null
        }
        Insert: {
          attachments?: Json | null
          chat_room_id?: string | null
          content: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_offer?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          offer_details?: Json | null
          offer_status?: string | null
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string | null
        }
        Update: {
          attachments?: Json | null
          chat_room_id?: string | null
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_offer?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          offer_details?: Json | null
          offer_status?: string | null
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          channel: string | null
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          metadata: Json | null
          notification_id: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channels: Json | null
          created_at: string | null
          grouping: Json | null
          id: string
          quiet_hours: Json | null
          types: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channels?: Json | null
          created_at?: string | null
          grouping?: Json | null
          id?: string
          quiet_hours?: Json | null
          types?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channels?: Json | null
          created_at?: string | null
          grouping?: Json | null
          id?: string
          quiet_hours?: Json | null
          types?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          created_at: string | null
          default_actions: Json | null
          default_channels: Json | null
          default_color: string | null
          default_icon: string | null
          default_priority: string | null
          id: string
          is_active: boolean | null
          message_template: string
          title_template: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_actions?: Json | null
          default_channels?: Json | null
          default_color?: string | null
          default_icon?: string | null
          default_priority?: string | null
          id?: string
          is_active?: boolean | null
          message_template: string
          title_template: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_actions?: Json | null
          default_channels?: Json | null
          default_color?: string | null
          default_icon?: string | null
          default_priority?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: string
          title_template?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_type: string | null
          action_url: string | null
          color: string | null
          created_at: string | null
          expires_at: string | null
          group_count: number | null
          group_id: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_type?: string | null
          action_url?: string | null
          color?: string | null
          created_at?: string | null
          expires_at?: string | null
          group_count?: number | null
          group_id?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_type?: string | null
          action_url?: string | null
          color?: string | null
          created_at?: string | null
          expires_at?: string | null
          group_count?: number | null
          group_id?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          endpoint: string
          id: string
          keys: Json
          last_used_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          endpoint: string
          id?: string
          keys: Json
          last_used_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          endpoint?: string
          id?: string
          keys?: Json
          last_used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swipe_history: {
        Row: {
          action: string
          campaign_id: string
          category_match: boolean | null
          id: string
          influencer_id: string
          match_score: number | null
          swiped_at: string | null
        }
        Insert: {
          action: string
          campaign_id: string
          category_match?: boolean | null
          id?: string
          influencer_id: string
          match_score?: number | null
          swiped_at?: string | null
        }
        Update: {
          action?: string
          campaign_id?: string
          category_match?: boolean | null
          id?: string
          influencer_id?: string
          match_score?: number | null
          swiped_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swipe_history_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipe_history_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          phone: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_chat_room_on_match: {
        Args: {
          p_campaign_id: string
          p_influencer_id: string
          p_match_score?: number
        }
        Returns: string
      }
      create_notification: {
        Args: { p_metadata?: Json; p_type: string; p_user_id: string }
        Returns: string
      }
      create_notification_simple: {
        Args: {
          p_action_url?: string
          p_message: string
          p_metadata?: Json
          p_priority?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      generate_campaign_queue: {
        Args: { influencer_id: string; limit_count?: number }
        Returns: undefined
      }
      get_advertisers_with_email: {
        Args: Record<PropertyKey, never>
        Returns: {
          business_registration: string
          company_name: string
          company_size: string
          contact_name: string
          contact_phone: string
          contact_position: string
          created_at: string
          email: string
          id: string
          industry: string
          is_verified: boolean
          marketing_budget: string
          updated_at: string
          verification_date: string
          website: string
        }[]
      }
      get_advertisers_with_email_filtered: {
        Args: { filter_status?: string }
        Returns: {
          business_registration: string
          company_name: string
          company_size: string
          contact_name: string
          contact_phone: string
          contact_position: string
          created_at: string
          email: string
          id: string
          industry: string
          is_verified: boolean
          marketing_budget: string
          updated_at: string
          verification_date: string
          website: string
        }[]
      }
      reset_daily_swipes: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
