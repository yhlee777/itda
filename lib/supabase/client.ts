// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 타입 익스포트
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// 헬퍼 타입
export type CampaignApplication = Tables<'campaign_applications'>
export type Campaign = Tables<'campaigns'>
export type Influencer = Tables<'influencers'>
export type Advertiser = Tables<'advertisers'>
export type ChatRoom = Tables<'chat_rooms'>
export type Message = Tables<'messages'>