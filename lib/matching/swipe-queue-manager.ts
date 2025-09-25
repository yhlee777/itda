// lib/matching/swipe-queue-manager.ts
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Tables = Database['public']['Tables'];
type Campaign = Tables['campaigns']['Row'];
type SwipeHistory = Tables['swipe_history']['Row'];

export class ImprovedSwipeQueueManager {
  private static supabase = createClient();
  
  private static DAILY_LIMIT = 10;
  private static QUEUE_REFRESH_HOURS = 3;

  /**
   * 남은 스와이프 수 확인
   */
  static async getRemainingSwipes(influencerId: string): Promise<{
    remaining: number;
    total: number;
    nextRefresh: Date | null;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 단순한 쿼리로 변경
      const { data: swipes, error } = await this.supabase
        .from('swipe_history')
        .select('id')
        .eq('influencer_id', influencerId)
        .gte('swiped_at', today.toISOString());
      
      if (error) {
        console.error('Error counting swipes:', error);
        return {
          remaining: this.DAILY_LIMIT,
          total: this.DAILY_LIMIT,
          nextRefresh: null
        };
      }
      
      const todaySwipeCount = swipes?.length || 0;
      const remaining = Math.max(0, this.DAILY_LIMIT - todaySwipeCount);
      
      const nextRefresh = new Date();
      nextRefresh.setDate(nextRefresh.getDate() + 1);
      nextRefresh.setHours(0, 0, 0, 0);
      
      console.log('✅ Swipe count check:', {
        influencerId,
        todaySwipeCount,
        remaining,
        nextRefresh
      });
      
      return {
        remaining,
        total: this.DAILY_LIMIT,
        nextRefresh
      };
    } catch (error) {
      console.error('❌ Error checking remaining swipes:', error);
      return {
        remaining: this.DAILY_LIMIT,
        total: this.DAILY_LIMIT,
        nextRefresh: null
      };
    }
  }

  /**
   * 캠페인 큐 생성
   */
  static async generateQueue(
    influencerId: string, 
    preferredCategories: string[] = []
  ): Promise<{ campaigns: any[], remaining: number }> {
    try {
      const swipeInfo = await this.getRemainingSwipes(influencerId);
      
      if (swipeInfo.remaining === 0) {
        console.log('⏰ Daily limit reached');
        return { campaigns: [], remaining: 0 };
      }
      
      // 이미 본 캠페인 제외
      const { data: swipedHistory } = await this.supabase
        .from('swipe_history')
        .select('campaign_id')
        .eq('influencer_id', influencerId);
      
      const swipedIds = swipedHistory?.map(s => s.campaign_id).filter(Boolean) || [];
      
      // 새로운 캠페인 가져오기
      let query = this.supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .limit(Math.min(swipeInfo.remaining, 20));
      
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }
      
      // ORDER BY 추가 (중요!)
      query = query.order('created_at', { ascending: false });
      
      const { data: campaigns, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching campaigns:', error);
        return { campaigns: [], remaining: swipeInfo.remaining };
      }
      
      console.log(`✅ Queue generated: ${campaigns?.length || 0} campaigns, ${swipeInfo.remaining} swipes remaining`);
      
      return {
        campaigns: campaigns || [],
        remaining: swipeInfo.remaining
      };
    } catch (error) {
      console.error('❌ Error generating queue:', error);
      return { campaigns: [], remaining: 0 };
    }
  }

  /**
   * 스와이프 액션 저장 - 단순화된 버전
   */
  static async recordSwipe(
    influencerId: string,
    campaignId: string,
    action: 'like' | 'pass' | 'super_like'
  ): Promise<boolean> {
    try {
      // 1. 스와이프 히스토리 저장 - 단순한 insert
      const { error: swipeError } = await this.supabase
        .from('swipe_history')
        .insert({
          influencer_id: influencerId,
          campaign_id: campaignId,
          action: action,
          swiped_at: new Date().toISOString(),
          match_score: action === 'super_like' ? 100 : (action === 'like' ? 80 : 0),
          category_match: true
        })
        .select()
        .single();
      
      if (swipeError) {
        if (swipeError.code === '23505') {
          console.log('⚠️ Already swiped this campaign');
          return true; // 이미 스와이프한 경우도 성공으로 처리
        }
        console.error('❌ Error recording swipe:', swipeError);
        return false;
      }
      
      // 2. like/super_like인 경우 campaign_influencers에 추가
      if (action === 'like' || action === 'super_like') {
        try {
          await this.supabase
            .from('campaign_influencers')
            .insert({
              campaign_id: campaignId,
              influencer_id: influencerId,
              status: 'pending',
              matched_at: new Date().toISOString(),
              match_score: action === 'super_like' ? 100 : 80
            });
          
          console.log(`✅ Match created for ${action}`);
        } catch (matchError) {
          console.log('Match creation error (ignored):', matchError);
        }
      }
      
      console.log(`✅ Swipe recorded: ${action} on campaign ${campaignId}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error in recordSwipe:', error);
      return false;
    }
  }
  
  /**
   * 오늘의 스와이프 히스토리
   */
  static async getTodaySwipes(influencerId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await this.supabase
      .from('swipe_history')
      .select('*')
      .eq('influencer_id', influencerId)
      .gte('swiped_at', today.toISOString())
      .order('swiped_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching today swipes:', error);
      return [];
    }
    
    return data || [];
  }
}