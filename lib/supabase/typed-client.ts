// lib/supabase/typed-client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']
type User = Tables['users']['Row']
type Influencer = Tables['influencers']['Row']
type Advertiser = Tables['advertisers']['Row']
type Campaign = Tables['campaigns']['Row']

export function createTypedClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export class TypedSupabase {
  private client = createTypedClient()

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

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: any
  ): Promise<boolean> {
    const { error } = await this.client
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        metadata,
        is_read: false
      })
    
    if (error) {
      console.error('Notification creation error:', error)
      return false
    }

    return true
  }

  async checkDailySwipeLimit(userId: string): Promise<{
    remaining: number;
    resetAt: Date;
  }> {
    const influencer = await this.getInfluencer(userId)
    
    if (!influencer) {
      return { remaining: 0, resetAt: new Date() }
    }

    const lastSwipe = influencer.last_swipe_at 
      ? new Date(influencer.last_swipe_at) 
      : null

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    if (!lastSwipe || lastSwipe < today) {
      await this.client
        .from('influencers')
        .update({ 
          daily_swipes_count: 0,
          last_swipe_at: now.toISOString()
        })
        .eq('id', userId)
      
      return {
        remaining: influencer.daily_swipes_limit || 100,
        resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }

    const remaining = (influencer.daily_swipes_limit || 100) - (influencer.daily_swipes_count || 0)
    const resetAt = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    return { remaining: Math.max(0, remaining), resetAt }
  }

  calculateMatchScore(
    campaign: Campaign,
    influencer: Influencer
  ): number {
    let score = 50

    const campaignCategories = campaign.categories || []
    const influencerCategories = influencer.categories || []
    
    const matchingCategories = campaignCategories.filter(cat =>
      influencerCategories.includes(cat)
    )
    
    if (matchingCategories.length > 0) {
      score += matchingCategories.length * 10
    }

    if (campaign.min_followers && influencer.followers_count >= campaign.min_followers) {
      score += 10
    }

    if (campaign.min_engagement_rate && influencer.engagement_rate >= campaign.min_engagement_rate) {
      score += 15
    }

    if (influencer.is_verified) {
      score += 5
    }

    const tierBonus: Record<string, number> = {
      'bronze': 0,
      'silver': 5,
      'gold': 10,
      'platinum': 15
    }
    score += tierBonus[influencer.tier || 'bronze'] || 0

    return Math.min(100, score)
  }
}