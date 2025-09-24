// lib/matching/swipe-queue-manager.ts
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Campaign = Database['public']['Tables']['campaigns']['Row'];

export class ImprovedSwipeQueueManager {
  // 초기 단계: 10개 제한 (수정됨: 30 → 10)
  private static readonly QUEUE_SIZE = 10;
  private static readonly REFRESH_INTERVAL = 30 * 60 * 1000; // 30분
  
  /**
   * 인플루언서를 위한 캠페인 큐 생성
   * - 이미 지원한 캠페인 제외
   * - 이미 스와이프한 캠페인 제외
   * - 카테고리 매칭 우선순위
   */
  static async generateQueue(
    influencerId: string,
    influencerCategories: string[]
  ): Promise<{ campaigns: Campaign[], nextRefresh: Date }> {
    const supabase = createClient();
    
    try {
      // 1. 이미 지원한 캠페인 ID 목록 가져오기
      const { data: applications } = await supabase
        .from('campaign_influencers')
        .select('campaign_id')
        .eq('influencer_id', influencerId);
      
      const appliedCampaignIds = applications?.map(a => a.campaign_id) || [];
      
      // 2. 이미 스와이프한 캠페인 ID 목록 가져오기
      const { data: swipeHistory } = await supabase
        .from('swipe_history')
        .select('campaign_id')
        .eq('influencer_id', influencerId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // 7일 이내
      
      const swipedCampaignIds = swipeHistory?.map(s => s.campaign_id) || [];
      
      // 3. 제외할 캠페인 ID 통합 (Set 에러 해결)
      const excludedIds = Array.from(new Set([...appliedCampaignIds, ...swipedCampaignIds]));
      
      // 4. 활성 캠페인 가져오기 (카테고리 매칭 우선)
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          advertisers!inner(
            id,
            company_name,
            company_logo,
            is_verified
          )
        `)
        .eq('status', 'active')
        .gte('deadline', new Date().toISOString())
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false });
      
      // 제외할 캠페인이 있으면 필터링
      if (excludedIds.length > 0) {
        query = query.not('id', 'in', `(${excludedIds.join(',')})`);
      }
      
      const { data: allCampaigns, error } = await query.limit(100);
      
      if (error) throw error;
      
      // 5. 카테고리별로 정렬 및 점수 계산
      const scoredCampaigns = (allCampaigns || []).map(campaign => {
        let score = 0;
        
        // 프리미엄 캠페인 가산점
        if (campaign.is_premium) score += 50;
        
        // 카테고리 매칭 점수
        const campaignCategories = campaign.categories || [];
        const matchedCategories = campaignCategories.filter(cat => 
          influencerCategories.includes(cat)
        );
        score += matchedCategories.length * 30;
        
        // 예산 크기 점수
        if (campaign.budget > 5000000) score += 20;
        else if (campaign.budget > 2000000) score += 10;
        
        // 마감일 임박 가산점
        const daysUntilDeadline = Math.ceil(
          (new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDeadline <= 3) score += 25;
        else if (daysUntilDeadline <= 7) score += 15;
        
        return { ...campaign, matchScore: score };
      });
      
      // 6. 점수 기준 정렬 및 상위 10개 선택 (수정됨)
      const topCampaigns = scoredCampaigns
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, this.QUEUE_SIZE);
      
      // 7. 큐에 저장 (스키마 수정)
      const queueData = topCampaigns.map((campaign, index) => ({
        influencer_id: influencerId,
        campaign_id: campaign.id,
        queue_order: index + 1,  // position → queue_order로 변경
        category_priority: campaign.matchScore || 0,  // match_score → category_priority 사용
        added_at: new Date().toISOString(),  // created_at → added_at으로 변경
        expires_at: new Date(Date.now() + this.REFRESH_INTERVAL).toISOString()  // expires_at 추가
      }));
      
      // 기존 큐 삭제
      await supabase
        .from('campaign_queue')
        .delete()
        .eq('influencer_id', influencerId);
      
      // 새 큐 삽입
      if (queueData.length > 0) {
        await supabase
          .from('campaign_queue')
          .insert(queueData);
      }
      
      // 8. 다음 리프레시 시간 계산
      const nextRefresh = new Date(Date.now() + this.REFRESH_INTERVAL);
      
      return {
        campaigns: topCampaigns,
        nextRefresh
      };
      
    } catch (error) {
      console.error('Queue generation error:', error);
      return { campaigns: [], nextRefresh: new Date() };
    }
  }
  
  /**
   * 다음 캠페인 가져오기
   */
  static async getNextCampaign(influencerId: string): Promise<Campaign | null> {
    const supabase = createClient();
    
    try {
      // 큐에서 다음 캠페인 가져오기 (queue_order 수정)
      const { data: queueItem } = await supabase
        .from('campaign_queue')
        .select('campaign_id')
        .eq('influencer_id', influencerId)
        .order('queue_order', { ascending: true })  // position → queue_order로 변경
        .limit(1)
        .single();
      
      if (!queueItem) {
        // 큐가 비어있으면 재생성 시도
        const { data: influencer } = await supabase
          .from('influencers')
          .select('categories')
          .eq('id', influencerId)
          .single();
        
        if (influencer) {
          const { campaigns } = await this.generateQueue(
            influencerId,
            influencer.categories || []
          );
          return campaigns[0] || null;
        }
        return null;
      }
      
      // 캠페인 상세 정보 가져오기
      const { data: campaign } = await supabase
        .from('campaigns')
        .select(`
          *,
          advertisers!inner(
            id,
            company_name,
            company_logo,
            is_verified
          )
        `)
        .eq('id', queueItem.campaign_id)
        .single();
      
      return campaign;
      
    } catch (error) {
      console.error('Get next campaign error:', error);
      return null;
    }
  }
  
  /**
   * 남은 스와이프 수 확인
   */
  static async getRemainingSwipes(influencerId: string): Promise<{
    remaining: number;
    total: number;
    nextRefresh: Date;
  }> {
    const supabase = createClient();
    
    try {
      // 오늘 스와이프한 횟수 확인
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count } = await supabase
        .from('swipe_history')
        .select('*', { count: 'exact', head: true })
        .eq('influencer_id', influencerId)
        .gte('created_at', today.toISOString());
      
      // 큐에 남은 캠페인 수 확인
      const { count: queueCount } = await supabase
        .from('campaign_queue')
        .select('*', { count: 'exact', head: true })
        .eq('influencer_id', influencerId);
      
      const remaining = Math.min(queueCount || 0, this.QUEUE_SIZE - (count || 0));
      
      // 다음 리프레시 시간 (30분 후)
      const nextRefresh = new Date(Date.now() + this.REFRESH_INTERVAL);
      
      return {
        remaining,
        total: this.QUEUE_SIZE,
        nextRefresh
      };
      
    } catch (error) {
      console.error('Get remaining swipes error:', error);
      return {
        remaining: 0,
        total: this.QUEUE_SIZE,
        nextRefresh: new Date()
      };
    }
  }
}

/**
 * 지원 > 광고주 수락 > 채팅방 생성 플로우
 */
export class ApplicationFlowHandler {
  /**
   * 인플루언서가 캠페인에 지원
   */
  static async applyToCampaign(
    influencerId: string,
    campaignId: string,
    proposedPrice: number,
    coverLetter?: string
  ): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    
    try {
      // 1. 중복 지원 체크
      const { data: existing } = await supabase
        .from('campaign_influencers')
        .select('id')
        .eq('influencer_id', influencerId)
        .eq('campaign_id', campaignId)
        .single();
      
      if (existing) {
        return { success: false, message: '이미 지원한 캠페인입니다.' };
      }
      
      // 2. AI 매칭 점수 계산
      const matchScore = await this.calculateMatchScore(influencerId, campaignId);
      
      // 3. 지원 생성
      const { error } = await supabase
        .from('campaign_influencers')
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          status: 'pending',
          proposed_price: proposedPrice,
          match_score: matchScore,
          deliverables: coverLetter ? { coverLetter } : null,
          applied_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // 4. 광고주에게 알림 전송
      await this.notifyAdvertiser(campaignId, influencerId);
      
      // 5. 스와이프 히스토리에 기록
      await supabase
        .from('swipe_history')
        .insert({
          influencer_id: influencerId,
          campaign_id: campaignId,
          action: 'like',
          applied: true
        });
      
      return { success: true, message: '지원이 완료되었습니다!' };
      
    } catch (error) {
      console.error('Apply to campaign error:', error);
      return { success: false, message: '지원 중 오류가 발생했습니다.' };
    }
  }
  
  /**
   * 광고주가 지원자 수락
   */
  static async acceptApplication(
    applicationId: string,
    agreedPrice?: number
  ): Promise<{ success: boolean; chatRoomId?: string }> {
    const supabase = createClient();
    
    try {
      // 1. 지원 정보 가져오기
      const { data: application } = await supabase
        .from('campaign_influencers')
        .select(`
          *,
          campaigns!inner(
            id,
            name,
            advertiser_id
          )
        `)
        .eq('id', applicationId)
        .single();
      
      if (!application) {
        throw new Error('Application not found');
      }
      
      // 2. 지원 상태 업데이트
      await supabase
        .from('campaign_influencers')
        .update({
          status: 'accepted',
          agreed_price: agreedPrice || application.proposed_price,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      // 3. 채팅방 생성
      const { data: chatRoom } = await supabase
        .from('chat_rooms')
        .insert({
          campaign_id: application.campaign_id,
          advertiser_id: application.campaigns.advertiser_id,
          influencer_id: application.influencer_id,
          status: 'active',
          contract_status: 'negotiating'
        })
        .select()
        .single();
      
      // 4. 인플루언서에게 알림
      await supabase
        .from('notifications')
        .insert({
          user_id: application.influencer_id,
          type: 'application_accepted',
          title: '캠페인 참여 승인!',
          message: `${application.campaigns.name} 캠페인 참여가 승인되었습니다.`,
          metadata: {
            campaign_id: application.campaign_id,
            chat_room_id: chatRoom?.id
          }
        });
      
      // 5. 시스템 메시지 전송
      if (chatRoom) {
        await supabase
          .from('messages')
          .insert({
            chat_room_id: chatRoom.id,
            sender_id: application.campaigns.advertiser_id,
            content: `안녕하세요! ${application.campaigns.name} 캠페인에 참여해주셔서 감사합니다. 자세한 내용을 논의해보겠습니다.`,
            message_type: 'text'
          });
      }
      
      return { success: true, chatRoomId: chatRoom?.id };
      
    } catch (error) {
      console.error('Accept application error:', error);
      return { success: false };
    }
  }
  
  /**
   * AI 매칭 점수 계산
   */
  private static async calculateMatchScore(
    influencerId: string,
    campaignId: string
  ): Promise<number> {
    // 실제로는 복잡한 AI 알고리즘
    // 여기서는 간단한 예시
    return Math.floor(Math.random() * 30) + 70; // 70-100 점
  }
  
  /**
   * 광고주에게 알림
   */
  private static async notifyAdvertiser(
    campaignId: string,
    influencerId: string
  ): Promise<void> {
    const supabase = createClient();
    
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('advertiser_id, name')
      .eq('id', campaignId)
      .single();
    
    if (!campaign) return;
    
    const { data: influencer } = await supabase
      .from('influencers')
      .select('name')
      .eq('id', influencerId)
      .single();
    
    await supabase
      .from('notifications')
      .insert({
        user_id: campaign.advertiser_id,
        type: 'new_applicant',
        title: '새로운 지원자!',
        message: `${influencer?.name || '인플루언서'}님이 ${campaign.name} 캠페인에 지원했습니다.`,
        metadata: {
          campaign_id: campaignId,
          influencer_id: influencerId
        }
      });
  }
}