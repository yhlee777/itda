// lib/matching/realtime-matching-algorithm.ts
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type Campaign = Tables['campaigns']['Row'];
type Influencer = Tables['influencers']['Row'];
type CampaignQueue = Tables['campaign_queue']['Row'];

// ============================================
// 1. 매칭 점수 계산 알고리즘
// ============================================
export class MatchingScoreCalculator {
  // 가중치 설정
  private static readonly WEIGHTS = {
    categoryMatch: 0.35,        // 35% - 카테고리 일치도
    engagementRate: 0.25,        // 25% - 참여율
    audienceFit: 0.20,           // 20% - 오디언스 적합도
    pastPerformance: 0.10,       // 10% - 과거 성과
    availability: 0.05,          // 5% - 가용성
    priceRange: 0.05            // 5% - 가격대 적합도
  };

  static async calculate(
    influencer: Influencer,
    campaign: Campaign
  ): Promise<{
    score: number;
    details: Record<string, number>;
    strengths: string[];
    risks: string[];
  }> {
    const details: Record<string, number> = {};
    const strengths: string[] = [];
    const risks: string[] = [];

    // 1. 카테고리 매칭 점수 (0-100)
    const categoryScore = this.calculateCategoryMatch(
      influencer.categories || [],
      campaign.categories || []
    );
    details.categoryMatch = categoryScore;
    if (categoryScore > 80) strengths.push('카테고리 전문성 높음');
    if (categoryScore < 30) risks.push('카테고리 불일치');

    // 2. 참여율 점수 (0-100)
    const engagementScore = this.calculateEngagementScore(
      influencer.engagement_rate || 0,
      campaign.min_engagement_rate || 0
    );
    details.engagementRate = engagementScore;
    if (engagementScore > 85) strengths.push('높은 참여율');
    if (engagementScore < 40) risks.push('낮은 참여율');

    // 3. 오디언스 적합도 (0-100)
    const audienceScore = await this.calculateAudienceFit(
      influencer,
      campaign.target_audience as any
    );
    details.audienceFit = audienceScore;
    if (audienceScore > 75) strengths.push('타겟 오디언스 일치');

    // 4. 과거 성과 점수 (0-100)
    const performanceScore = this.calculatePastPerformance(influencer);
    details.pastPerformance = performanceScore;
    if (performanceScore > 80) strengths.push('검증된 실적');
    if (performanceScore < 30) risks.push('경험 부족');

    // 5. 가용성 점수 (0-100)
    const availabilityScore = this.calculateAvailability(
      influencer,
      campaign.start_date,
      campaign.end_date
    );
    details.availability = availabilityScore;
    if (availabilityScore < 50) risks.push('일정 조율 필요');

    // 6. 가격대 적합도 (0-100)
    const priceScore = this.calculatePriceMatch(
      influencer,
      campaign.budget
    );
    details.priceRange = priceScore;
    if (priceScore < 40) risks.push('예산 초과 가능성');

    // 총점 계산 (가중 평균)
    const totalScore = Object.entries(this.WEIGHTS).reduce((sum, [key, weight]) => {
      return sum + (details[key] || 0) * weight;
    }, 0);

    return {
      score: Math.round(totalScore),
      details,
      strengths: strengths.slice(0, 3), // 상위 3개만
      risks: risks.slice(0, 2) // 상위 2개만
    };
  }

  private static calculateCategoryMatch(
    influencerCategories: string[],
    campaignCategories: string[]
  ): number {
    if (!influencerCategories.length || !campaignCategories.length) return 0;
    
    const intersection = influencerCategories.filter(cat =>
      campaignCategories.includes(cat)
    );
    
    // 완전 일치 시 100점
    if (intersection.length === campaignCategories.length) return 100;
    
    // 부분 일치 점수
    const matchRatio = intersection.length / campaignCategories.length;
    return Math.round(matchRatio * 100);
  }

  private static calculateEngagementScore(
    influencerRate: number,
    minRequired: number
  ): number {
    if (influencerRate <= 0) return 0;
    
    // 최소 요구사항 충족 여부
    if (influencerRate < minRequired) {
      return Math.round((influencerRate / minRequired) * 50);
    }
    
    // 업계 평균 대비 (업계 평균 3-5% 가정)
    const industryAvg = 4;
    const ratio = influencerRate / industryAvg;
    
    if (ratio >= 2) return 100; // 2배 이상이면 만점
    if (ratio >= 1.5) return 90;
    if (ratio >= 1) return 75;
    return Math.round(50 + (ratio * 25));
  }

  private static async calculateAudienceFit(
    influencer: Influencer,
    targetAudience: any
  ): Promise<number> {
    if (!targetAudience) return 70; // 기본값
    
    const demographics = influencer.audience_demographics as any;
    if (!demographics) return 60;
    
    let score = 70;
    
    // 연령대 매칭
    if (targetAudience.ageRange && demographics.ageRange) {
      const ageMatch = this.calculateRangeOverlap(
        targetAudience.ageRange,
        demographics.ageRange
      );
      score += ageMatch * 0.15;
    }
    
    // 성별 매칭
    if (targetAudience.gender && demographics.gender) {
      if (targetAudience.gender === demographics.gender) {
        score += 15;
      }
    }
    
    return Math.min(100, score);
  }

  private static calculatePastPerformance(influencer: Influencer): number {
    let score = 50; // 기본 점수
    
    // 캠페인 경험
    const campaigns = influencer.total_campaigns || 0;
    if (campaigns > 50) score += 20;
    else if (campaigns > 20) score += 15;
    else if (campaigns > 10) score += 10;
    else if (campaigns > 5) score += 5;
    
    // 평균 평점
    const rating = influencer.average_rating || 0;
    if (rating >= 4.8) score += 20;
    else if (rating >= 4.5) score += 15;
    else if (rating >= 4.0) score += 10;
    else if (rating >= 3.5) score += 5;
    
    // 검증 상태
    if (influencer.is_verified) score += 10;
    
    return Math.min(100, score);
  }

  private static calculateAvailability(
    influencer: Influencer,
    startDate: string,
    endDate: string
  ): number {
    const availability = influencer.availability as any;
    if (!availability) return 80; // 기본값
    
    if (availability.status === 'immediate') return 100;
    if (availability.status === 'busy') return 30;
    
    return 70;
  }

  private static calculatePriceMatch(
    influencer: Influencer,
    campaignBudget: number
  ): number {
    // 인플루언서 예상 단가 계산
    const followers = influencer.followers_count || 0;
    const engagementRate = influencer.engagement_rate || 0;
    const tier = influencer.tier || 'standard';
    
    // CPM 기반 가격 예측 (1000 노출당 비용)
    let baseCPM = 10000; // 기본 CPM 10,000원
    
    if (tier === 'premium') baseCPM *= 2;
    else if (tier === 'gold') baseCPM *= 1.5;
    
    if (engagementRate > 5) baseCPM *= 1.3;
    else if (engagementRate > 3) baseCPM *= 1.1;
    
    const estimatedPrice = (followers * engagementRate * baseCPM) / 100000;
    
    if (estimatedPrice > campaignBudget * 1.2) return 20; // 20% 초과
    if (estimatedPrice > campaignBudget) return 50;
    if (estimatedPrice > campaignBudget * 0.8) return 80;
    return 100;
  }

  private static calculateRangeOverlap(range1: any, range2: any): number {
    // 범위 중첩 계산 로직
    return 0.7; // 임시값
  }
}

// ============================================
// 2. 실시간 캠페인 큐 관리 시스템
// ============================================
export class CampaignQueueManager {
  private static readonly QUEUE_SIZE = 10; // 인플루언서당 큐 크기
  private static readonly REFRESH_INTERVAL = 3 * 60 * 60 * 1000; // 3시간
  
  static async generateQueue(
    influencerId: string,
    categories: string[]
  ): Promise<void> {
    const supabase = createClient();
    
    try {
      // 1. 기존 큐 확인
      const { data: existingQueue } = await supabase
        .from('campaign_queue')
        .select('*')
        .eq('influencer_id', influencerId)
        .gte('expires_at', new Date().toISOString());
      
      if (existingQueue && existingQueue.length >= this.QUEUE_SIZE) {
        console.log('Queue is full and not expired');
        return;
      }
      
      // 2. 이미 본 캠페인 제외
      const { data: swipeHistory } = await supabase
        .from('swipe_history')
        .select('campaign_id')
        .eq('influencer_id', influencerId);
      
      const seenCampaignIds = swipeHistory?.map(h => h.campaign_id) || [];
      
      // 3. 활성 캠페인 조회
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .limit(50);
      
      if (!campaigns || campaigns.length === 0) {
        console.log('No available campaigns');
        return;
      }
      
      // 이미 본 캠페인 필터링
      const unseenCampaigns = campaigns.filter(c => !seenCampaignIds.includes(c.id));
      
      // 4. 매칭 점수 계산
      const { data: influencer } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', influencerId)
        .single();
      
      if (!influencer) return;
      
      const scoredCampaigns = await Promise.all(
        unseenCampaigns.map(async (campaign) => {
          const matchResult = await MatchingScoreCalculator.calculate(
            influencer,
            campaign
          );
          
          // 카테고리 우선순위 계산
          const categoryPriority = this.calculateCategoryPriority(
            influencer.categories || [],
            campaign.categories || []
          );
          
          return {
            campaign,
            score: matchResult.score,
            categoryPriority,
            isUrgent: campaign.urgency === 'high',
            isPremium: campaign.is_premium || false
          };
        })
      );
      
      // 5. 정렬 (프리미엄 > 긴급 > 카테고리 > 점수)
      scoredCampaigns.sort((a, b) => {
        if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
        if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
        if (a.categoryPriority !== b.categoryPriority) {
          return b.categoryPriority - a.categoryPriority;
        }
        return b.score - a.score;
      });
      
      // 6. 큐에 추가
      const queueItems = scoredCampaigns
        .slice(0, this.QUEUE_SIZE)
        .map((item, index) => ({
          influencer_id: influencerId,
          campaign_id: item.campaign.id,
          queue_order: index + 1,
          category_priority: item.categoryPriority,
          expires_at: new Date(Date.now() + this.REFRESH_INTERVAL).toISOString()
        }));
      
      // 7. 큐 업데이트
      await supabase
        .from('campaign_queue')
        .delete()
        .eq('influencer_id', influencerId);
      
      await supabase
        .from('campaign_queue')
        .insert(queueItems);
      
      console.log(`Queue generated for ${influencerId}: ${queueItems.length} campaigns`);
      
    } catch (error) {
      console.error('Queue generation error:', error);
      throw error;
    }
  }
  
  private static calculateCategoryPriority(
    influencerCategories: string[],
    campaignCategories: string[]
  ): number {
    const mainCategory = influencerCategories[0];
    if (!mainCategory) return 0;
    
    // 주 카테고리와 일치하면 높은 우선순위
    if (campaignCategories.includes(mainCategory)) return 3;
    
    // 서브 카테고리와 일치
    const hasMatch = influencerCategories.some(cat =>
      campaignCategories.includes(cat)
    );
    if (hasMatch) return 2;
    
    return 1;
  }
  
  static async getNextCampaign(influencerId: string): Promise<Campaign | null> {
    const supabase = createClient();
    
    const { data: queueItem } = await supabase
      .from('campaign_queue')
      .select(`
        *,
        campaigns (*)
      `)
      .eq('influencer_id', influencerId)
      .order('queue_order', { ascending: true })
      .limit(1)
      .single();
    
    if (!queueItem || !queueItem.campaigns) return null;
    
    return queueItem.campaigns as unknown as Campaign;
  }
}

// ============================================
// 3. 실시간 알림 스케줄러 (타입 수정)
// ============================================
export class NotificationScheduler {
  private static readonly INTERVALS = [30, 120, 360]; // 30분, 2시간, 6시간
  
  static async scheduleForAdvertiser(
    advertiserId: string,
    campaignId: string
  ): Promise<void> {
    const supabase = createClient();
    
    for (const minutes of this.INTERVALS) {
      const notifyAt = new Date(Date.now() + minutes * 60 * 1000);
      
      // Edge Function 호출로 스케줄링
      await this.scheduleNotification({
        user_id: advertiserId,
        campaign_id: campaignId,
        type: 'applicant_summary',
        notify_at: notifyAt.toISOString(),
        metadata: {
          interval: minutes,
          campaign_id: campaignId
        }
      });
    }
  }
  
  private static async scheduleNotification(data: any): Promise<void> {
    // 실제로는 Edge Function이나 크론잡으로 구현
    console.log('Scheduled notification:', data);
  }
  
  static async sendApplicantSummary(
    advertiserId: string,
    campaignId: string
  ): Promise<void> {
    const supabase = createClient();
    
    // 지원자 수 조회
    const { data: applicants, count } = await supabase
      .from('campaign_influencers')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .eq('status', 'pending');
    
    if (!count || count === 0) return;
    
    // AI 추천 지원자 선정
    const topApplicants = applicants
      ?.sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      .slice(0, 3);
    
    // 알림 생성 (타입 수정)
    await supabase.from('notifications').insert({
      user_id: advertiserId,
      type: 'new_applicant' as const,
      title: `새로운 지원자 ${count}명`,
      message: `캠페인에 ${count}명의 인플루언서가 지원했습니다.`,
      metadata: {
        campaign_id: campaignId,
        applicant_count: count,
        top_applicants: topApplicants?.map(a => ({
          id: a.influencer_id,
          score: a.match_score
        }))
      }
    });
  }
}

// ============================================
// 4. 스와이프 액션 처리 (타입 수정)
// ============================================
export class SwipeActionHandler {
  static async handleSwipe(
    influencerId: string,
    campaignId: string,
    action: 'like' | 'pass' | 'super_like'
  ): Promise<{ matched: boolean; chatRoomId?: string }> {
    const supabase = createClient();
    
    try {
      // 1. 스와이프 기록 저장
      await supabase.from('swipe_history').insert({
        influencer_id: influencerId,
        campaign_id: campaignId,
        action: action,
        category_match: true // 실제로는 계산 필요
      });
      
      // 2. 큐에서 제거
      await supabase
        .from('campaign_queue')
        .delete()
        .eq('influencer_id', influencerId)
        .eq('campaign_id', campaignId);
      
      // 3. Like 또는 Super Like인 경우 매칭 처리
      if (action === 'like' || action === 'super_like') {
        // 캠페인 정보 조회
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .single();
        
        if (!campaign) {
          throw new Error('Campaign not found');
        }
        
        // 인플루언서 정보 조회
        const { data: influencer } = await supabase
          .from('influencers')
          .select('*')
          .eq('id', influencerId)
          .single();
        
        if (!influencer) {
          throw new Error('Influencer not found');
        }
        
        // 매칭 점수 계산
        const matchResult = await MatchingScoreCalculator.calculate(
          influencer,
          campaign
        );
        
        // campaign_influencers에 매칭 기록
        await supabase.from('campaign_influencers').insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          match_score: matchResult.score,
          match_details: matchResult.details,
          status: 'pending',
          agreed_price: this.estimatePrice(influencer, campaign)
        });
        
        // 채팅방 생성 (advertiser_id와 campaign_id가 nullable이므로 체크)
        if (campaign.advertiser_id) {
          const { data: chatRoom } = await supabase
            .from('chat_rooms')
            .insert({
              campaign_id: campaignId,
              advertiser_id: campaign.advertiser_id,
              influencer_id: influencerId,
              status: 'active'
            })
            .select()
            .single();
          
          // Super Like인 경우 광고주에게 즉시 알림
          if (action === 'super_like') {
            await supabase.from('notifications').insert({
              user_id: campaign.advertiser_id,
              type: 'super_like' as const,
              title: '⭐ 슈퍼 라이크!',
              message: `${influencer.name}님이 캠페인에 큰 관심을 보였습니다!`,
              metadata: {
                campaign_id: campaignId,
                influencer_id: influencerId,
                match_score: matchResult.score
              },
              priority: 'high'
            });
          }
          
          // 광고주에게 일반 알림
          await supabase.from('notifications').insert({
            user_id: campaign.advertiser_id,
            type: 'new_applicant' as const,
            title: '새로운 지원자',
            message: `${influencer.name}님이 캠페인에 지원했습니다.`,
            metadata: {
              campaign_id: campaignId,
              influencer_id: influencerId,
              match_score: matchResult.score
            }
          });
          
          return {
            matched: true,
            chatRoomId: chatRoom?.id
          };
        }
      }
      
      // 4. 일일 스와이프 카운트 업데이트
      const { data: currentInfluencer } = await supabase
        .from('influencers')
        .select('daily_swipes_count')
        .eq('id', influencerId)
        .single();
      
      await supabase
        .from('influencers')
        .update({
          daily_swipes_count: (currentInfluencer?.daily_swipes_count || 0) + 1,
          last_swipe_at: new Date().toISOString()
        })
        .eq('id', influencerId);
      
      return { matched: false };
      
    } catch (error) {
      console.error('Swipe action error:', error);
      throw error;
    }
  }
  
  private static estimatePrice(influencer: Influencer, campaign: Campaign): number {
    const followers = influencer.followers_count || 0;
    const engagement = influencer.engagement_rate || 0;
    const tier = influencer.tier || 'standard';
    
    let basePrice = followers * 0.01; // 팔로워당 10원 기준
    
    // 참여율 보정
    if (engagement > 5) basePrice *= 1.5;
    else if (engagement > 3) basePrice *= 1.2;
    
    // 티어 보정
    if (tier === 'premium') basePrice *= 2;
    else if (tier === 'gold') basePrice *= 1.5;
    
    // 캠페인 긴급도 보정
    if (campaign.urgency === 'high') basePrice *= 1.3;
    
    return Math.round(basePrice / 10000) * 10000; // 만원 단위로 반올림
  }
}

// ============================================
// 5. 실시간 매칭 코디네이터 (메인 클래스)
// ============================================
export class RealtimeMatchingCoordinator {
  static async initializeForInfluencer(influencerId: string): Promise<void> {
    const supabase = createClient();
    
    // 인플루언서 정보 조회
    const { data: influencer } = await supabase
      .from('influencers')
      .select('*')
      .eq('id', influencerId)
      .single();
    
    if (!influencer) return;
    
    // 일일 스와이프 리셋 체크
    await this.checkDailyReset(influencer);
    
    // 캠페인 큐 생성
    await CampaignQueueManager.generateQueue(
      influencerId,
      influencer.categories || []
    );
  }
  
  private static async checkDailyReset(influencer: Influencer): Promise<void> {
    const supabase = createClient();
    
    const lastReset = influencer.daily_swipes_reset_at
      ? new Date(influencer.daily_swipes_reset_at)
      : new Date(0);
    
    const now = new Date();
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
    
    // 24시간 경과 시 리셋
    if (hoursSinceReset >= 24) {
      await supabase
        .from('influencers')
        .update({
          daily_swipes_count: 0,
          daily_swipes_reset_at: now.toISOString()
        })
        .eq('id', influencer.id);
    }
  }
  
  static async processAdvertiserCampaign(
    advertiserId: string,
    campaignId: string
  ): Promise<void> {
    // 알림 스케줄링
    await NotificationScheduler.scheduleForAdvertiser(advertiserId, campaignId);
    
    // 초기 AI 매칭 실행 (matching_history 테이블이 없으므로 주석 처리)
    // await this.runInitialMatching(campaignId);
  }
}

// ============================================
// 6. 간소화된 AI 매칭 함수 (기존 페이지에 통합용)
// ============================================
export async function getAIMatchScore(
  influencerId: string, 
  campaignId: string
): Promise<number> {
  const supabase = createClient();
  
  try {
    const [{ data: influencer }, { data: campaign }] = await Promise.all([
      supabase.from('influencers').select('*').eq('id', influencerId).single(),
      supabase.from('campaigns').select('*').eq('id', campaignId).single()
    ]);
    
    if (!influencer || !campaign) return 0;
    
    const result = await MatchingScoreCalculator.calculate(influencer, campaign);
    return result.score;
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0;
  }
}

// Export 모든 주요 클래스와 함수
export default {
  MatchingScoreCalculator,
  CampaignQueueManager,
  NotificationScheduler,
  SwipeActionHandler,
  RealtimeMatchingCoordinator,
  getAIMatchScore
};