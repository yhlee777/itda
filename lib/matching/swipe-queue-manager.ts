// lib/matching/swipe-queue-manager.ts
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Tables = Database['public']['Tables'];
type Campaign = Tables['campaigns']['Row'] & {
  category?: string;  // 타입 확장 (임시)
};
type SwipeHistory = Tables['swipe_history']['Row'];

export class ImprovedSwipeQueueManager {
  private static supabase = createClient();
  
  // 일일 제한 10개
  private static DAILY_LIMIT = 10;
  
  // 큐 리프레시 시간 (3시간)
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
      // 1. 오늘 스와이프한 횟수 확인
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todaySwipeCount, error } = await this.supabase
        .from('swipe_history')
        .select('*', { count: 'exact', head: true })
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
      
      const used = todaySwipeCount || 0;
      const remaining = Math.max(0, this.DAILY_LIMIT - used);
      
      // 다음 리프레시 시간 계산 (자정)
      const nextRefresh = new Date();
      nextRefresh.setDate(nextRefresh.getDate() + 1);
      nextRefresh.setHours(0, 0, 0, 0);
      
      console.log('✅ Swipe count check:', {
        influencerId,
        todaySwipeCount: used,
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
   * 캠페인 큐 생성 및 가져오기
   */
  static async generateQueue(
    influencerId: string, 
    preferredCategories: string[] = []
  ): Promise<{ campaigns: any[], remaining: number }> {
    try {
      // 1. 먼저 남은 스와이프 수 확인
      const swipeInfo = await this.getRemainingSwipes(influencerId);
      
      if (swipeInfo.remaining === 0) {
        console.log('⏰ Daily limit reached');
        return { campaigns: [], remaining: 0 };
      }
      
      // 2. 이미 스와이프한 캠페인 ID 가져오기
      const { data: swipedCampaigns, error: swipedError } = await this.supabase
        .from('swipe_history')
        .select('campaign_id')
        .eq('influencer_id', influencerId);
      
      if (swipedError) {
        console.error('Error fetching swiped campaigns:', swipedError);
      }
      
      const swipedIds = swipedCampaigns?.map(s => s.campaign_id).filter(Boolean) as string[] || [];
      
      // 3. 새로운 캠페인 가져오기 (category 포함)
      let query = this.supabase
        .from('campaigns')
        .select('*, category')  // category 명시적 선택
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(Math.min(swipeInfo.remaining, 20));
      
      // 이미 본 캠페인 제외
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }
      
      const { data: campaigns, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching campaigns:', error);
        return { campaigns: [], remaining: swipeInfo.remaining };
      }
      
      // 4. 카테고리별 정렬 (category 단수형 사용)
      const sortedCampaigns = this.sortCampaignsByCategory(
        campaigns || [], 
        preferredCategories
      );
      
      console.log(`✅ Queue generated: ${sortedCampaigns.length} campaigns, ${swipeInfo.remaining} swipes remaining`);
      
      return {
        campaigns: sortedCampaigns,
        remaining: swipeInfo.remaining
      };
    } catch (error) {
      console.error('❌ Error generating queue:', error);
      return { campaigns: [], remaining: 0 };
    }
  }
  
  /**
   * 카테고리별 캠페인 정렬 (category 단수형 사용)
   */
  private static sortCampaignsByCategory(
    campaigns: any[], 
    preferredCategories: string[]
  ): any[] {
    if (!preferredCategories || preferredCategories.length === 0) {
      return campaigns;
    }
    
    return campaigns.sort((a, b) => {
      // category 단수형 사용
      const aCategory = a.category || 'general';
      const bCategory = b.category || 'general';
      
      const aIndex = preferredCategories.indexOf(aCategory);
      const bIndex = preferredCategories.indexOf(bCategory);
      
      // 선호 카테고리에 있는 것 우선
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // 둘 다 선호 카테고리에 없으면 원래 순서 유지
      return 0;
    });
  }

  /**
   * 스와이프 액션 저장
   */
  static async recordSwipe(
    influencerId: string,
    campaignId: string,
    action: 'like' | 'pass' | 'super_like'
  ): Promise<boolean> {
    try {
      // 1. 스와이프 히스토리 저장
      const { error } = await this.supabase
        .from('swipe_history')
        .insert({
          influencer_id: influencerId,
          campaign_id: campaignId,
          action: action,
          swiped_at: new Date().toISOString(),
          match_score: action === 'super_like' ? 100 : (action === 'like' ? 80 : 0),
          category_match: true
        });
      
      if (error) {
        if (error.code === '23505') {
          console.log('⚠️ Already swiped this campaign');
          return true; // 이미 스와이프한 경우도 성공으로 처리
        } else {
          console.error('❌ Error recording swipe:', error);
          return false;
        }
      }
      
      // 2. like나 super_like인 경우 campaign_influencers에 추가
      if (action === 'like' || action === 'super_like') {
        const { error: matchError } = await this.supabase
          .from('campaign_influencers')
          .insert({
            campaign_id: campaignId,
            influencer_id: influencerId,
            status: 'pending',
            matched_at: new Date().toISOString(),
            match_score: action === 'super_like' ? 100 : 80,
            match_details: {
              action: action,
              timestamp: new Date().toISOString()
            }
          });
        
        if (matchError && matchError.code !== '23505') {
          console.error('⚠️ Match creation warning:', matchError);
        }
        
        // 3. 알림 생성 (광고주에게)
        const { data: campaign } = await this.supabase
          .from('campaigns')
          .select('advertiser_id, name')
          .eq('id', campaignId)
          .single();
        
        if (campaign?.advertiser_id) {
          await this.supabase
            .from('notifications')
            .insert({
              user_id: campaign.advertiser_id,
              type: action === 'super_like' ? 'super_like' : 'new_applicant',
              title: action === 'super_like' ? '⭐ 슈퍼 라이크!' : '새로운 지원자',
              message: `캠페인 "${campaign.name}"에 새로운 ${action === 'super_like' ? '슈퍼 라이크' : '지원'}이 있습니다!`,
              metadata: {
                campaign_id: campaignId,
                influencer_id: influencerId,
                action: action
              }
            });
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
   * 오늘의 스와이프 히스토리 가져오기
   */
  static async getTodaySwipes(influencerId: string): Promise<SwipeHistory[]> {
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
  
  /**
   * 큐 리셋 (테스트/디버깅용)
   */
  static async resetQueue(influencerId: string): Promise<void> {
    try {
      // 오늘의 스와이프 히스토리 삭제
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await this.supabase
        .from('swipe_history')
        .delete()
        .eq('influencer_id', influencerId)
        .gte('swiped_at', today.toISOString());
      
      console.log('✅ Today\'s swipes reset for influencer:', influencerId);
    } catch (error) {
      console.error('Error resetting queue:', error);
    }
  }
}