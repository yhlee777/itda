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
        Relationships: []
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
          }
        ]
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
          engagement_rate: number
          tier: 'standard' | 'gold' | 'premium'
          is_verified: boolean
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
          engagement_rate?: number
          tier?: 'standard' | 'gold' | 'premium'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          username?: string
          avatar?: string | null
          bio?: string | null
          categories?: string[]
          followers_count?: number
          engagement_rate?: number
          tier?: 'standard' | 'gold' | 'premium'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
          start_date: string
          end_date: string
          status: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
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
          start_date: string
          end_date: string
          status?: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          advertiser_id?: string
          name?: string
          description?: string | null
          objectives?: string[]
          categories?: string[]
          budget?: number
          start_date?: string
          end_date?: string
          status?: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_rooms: {
        Row: {
          id: string
          campaign_id: string | null
          advertiser_id: string | null
          influencer_id: string | null
          status: 'pending' | 'active' | 'archived' | 'blocked'
          match_score: number | null
          matched_at: string | null
          contract_status: 'negotiating' | 'agreed' | 'signed' | 'cancelled'
          agreed_price: number | null
          agreed_deliverables: Json | null
          last_message_at: string | null
          last_message_preview: string | null
          unread_count_advertiser: number
          unread_count_influencer: number
          ai_insights: Json
          suggested_price: number | null
          risk_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          advertiser_id?: string | null
          influencer_id?: string | null
          status?: 'pending' | 'active' | 'archived' | 'blocked'
          match_score?: number | null
          matched_at?: string | null
          contract_status?: 'negotiating' | 'agreed' | 'signed' | 'cancelled'
          agreed_price?: number | null
          agreed_deliverables?: Json | null
          last_message_at?: string | null
          last_message_preview?: string | null
          unread_count_advertiser?: number
          unread_count_influencer?: number
          ai_insights?: Json
          suggested_price?: number | null
          risk_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          advertiser_id?: string | null
          influencer_id?: string | null
          status?: 'pending' | 'active' | 'archived' | 'blocked'
          match_score?: number | null
          matched_at?: string | null
          contract_status?: 'negotiating' | 'agreed' | 'signed' | 'cancelled'
          agreed_price?: number | null
          agreed_deliverables?: Json | null
          last_message_at?: string | null
          last_message_preview?: string | null
          unread_count_advertiser?: number
          unread_count_influencer?: number
          ai_insights?: Json
          suggested_price?: number | null
          risk_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          chat_room_id: string
          sender_id: string
          sender_type: 'influencer' | 'advertiser' | 'system' | null
          message_type: string
          content: string
          attachments: Json
          contract_data: Json | null
          is_read: boolean
          is_edited: boolean
          is_deleted: boolean
          reactions: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_room_id: string
          sender_id: string
          sender_type?: 'influencer' | 'advertiser' | 'system' | null
          message_type?: string
          content: string
          attachments?: Json
          contract_data?: Json | null
          is_read?: boolean
          is_edited?: boolean
          is_deleted?: boolean
          reactions?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string
          sender_id?: string
          sender_type?: 'influencer' | 'advertiser' | 'system' | null
          message_type?: string
          content?: string
          attachments?: Json
          contract_data?: Json | null
          is_read?: boolean
          is_edited?: boolean
          is_deleted?: boolean
          reactions?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
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
          }
        ]
      }
      chat_templates: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string | null
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category?: string | null
          usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string | null
          usage_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contract_proposals: {
        Row: {
          id: string
          chat_room_id: string
          proposed_by: string | null
          price: number
          deliverables: Json
          deadline: string
          payment_terms: Json | null
          additional_terms: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'counter_offered' | 'expired'
          responded_at: string | null
          response_notes: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chat_room_id: string
          proposed_by?: string | null
          price: number
          deliverables: Json
          deadline: string
          payment_terms?: Json | null
          additional_terms?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'counter_offered' | 'expired'
          responded_at?: string | null
          response_notes?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string
          proposed_by?: string | null
          price?: number
          deliverables?: Json
          deadline?: string
          payment_terms?: Json | null
          additional_terms?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'counter_offered' | 'expired'
          responded_at?: string | null
          response_notes?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_proposals_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_proposals_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {
      create_chat_room_on_match: {
        Args: {
          p_campaign_id: string
          p_influencer_id: string
          p_match_score?: number
        }
        Returns: string
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

// 타입 단축키 (편의를 위해)
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// 자주 사용하는 타입들
export type User = Tables<'users'>
export type Advertiser = Tables<'advertisers'>
export type Influencer = Tables<'influencers'>
export type Campaign = Tables<'campaigns'>
export type ChatRoom = Tables<'chat_rooms'>
export type Message = Tables<'messages'>
export type Notification = Tables<'notifications'>
export type ContractProposal = Tables<'contract_proposals'>
export type ChatTemplate = Tables<'chat_templates'>