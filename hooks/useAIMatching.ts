// hooks/useAIMatching.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================
// AI 매칭 커스텀 훅
// ============================================
export function useAIMatching() {
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<InfluencerMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  // AI 매칭 실행
  const runMatching = useCallback(async (campaignId: string, filters?: MatchingFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Supabase Edge Function 호출
      const { data, error } = await supabase.functions.invoke('ai-matching', {
        body: { campaignId, filters }
      });

      if (error) throw error;
      
      setMatches(data.matches);
      
      // 실시간 알림
      await notifyMatchingComplete(data.matches.length);
      
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Matching error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 매칭 수락
  const acceptMatch = useCallback(async (influencerId: string, campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_influencers')
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          status: 'accepted',
          accepted_at: new Date().toISOString()
        });

      if (error) throw error;

      // UI 업데이트
      setMatches(prev => 
        prev.map(m => 
          m.id === influencerId 
            ? { ...m, status: 'accepted' }
            : m
        )
      );

      // 인플루언서에게 알림 전송
      await sendNotificationToInfluencer(influencerId, campaignId);

      return true;
    } catch (err: any) {
      console.error('Accept match error:', err);
      return false;
    }
  }, []);

  // 매칭 거절
  const rejectMatch = useCallback(async (influencerId: string, campaignId: string) => {
    try {
      setMatches(prev => prev.filter(m => m.id !== influencerId));
      
      // 거절 기록 저장
      await supabase
        .from('rejected_matches')
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          rejected_at: new Date().toISOString()
        });

      return true;
    } catch (err: any) {
      console.error('Reject match error:', err);
      return false;
    }
  }, []);

  return {
    matches,
    isLoading,
    error,
    runMatching,
    acceptMatch,
    rejectMatch
  };
}

// ============================================
// 실시간 대시보드 훅
// ============================================
export function useRealtimeDashboard(campaignId?: string) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spend: 0,
    roi: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);

  // 실시간 구독 설정
  useEffect(() => {
    if (!campaignId) return;

    // 메트릭 실시간 구독
    const metricsSubscription = supabase
      .channel(`metrics:${campaignId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'campaign_metrics',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          handleMetricsUpdate(payload);
        }
      )
      .subscribe();

    // 활동 피드 실시간 구독
    const activitiesSubscription = supabase
      .channel(`activities:${campaignId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_activities',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          handleActivityUpdate(payload);
        }
      )
      .subscribe();

    // 초기 데이터 로드
    loadInitialData();

    return () => {
      supabase.removeChannel(metricsSubscription);
      supabase.removeChannel(activitiesSubscription);
    };
  }, [campaignId]);

  const handleMetricsUpdate = (payload: any) => {
    const newMetrics = payload.new;
    setMetrics(prev => ({
      impressions: newMetrics.impressions || prev.impressions,
      clicks: newMetrics.clicks || prev.clicks,
      conversions: newMetrics.conversions || prev.conversions,
      spend: newMetrics.spend || prev.spend,
      roi: calculateROI(newMetrics.revenue, newMetrics.spend)
    }));
  };

  const handleActivityUpdate = (payload: any) => {
    const newActivity: Activity = {
      id: payload.new.id,
      type: payload.new.type,
      message: payload.new.message,
      timestamp: payload.new.created_at,
      metadata: payload.new.metadata
    };
    
    setActivities(prev => [newActivity, ...prev].slice(0, 10)); // 최근 10개만
  };

  const loadInitialData = async () => {
    // 메트릭 로드
    const { data: metricsData } = await supabase
      .from('campaign_metrics')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (metricsData) {
      setMetrics({
        impressions: metricsData.impressions,
        clicks: metricsData.clicks,
        conversions: metricsData.conversions,
        spend: metricsData.spend,
        roi: calculateROI(metricsData.revenue, metricsData.spend)
      });
    }

    // 활동 로드
    const { data: activitiesData } = await supabase
      .from('campaign_activities')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesData) {
      setActivities(activitiesData);
    }
  };

  return { metrics, activities };
}

// ============================================
// 원클릭 정산 훅
// ============================================
export function useSettlement() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processSettlement = useCallback(async (settlementId: string) => {
    setIsProcessing(true);

    try {
      // 1. 정산 정보 가져오기
      const { data: settlement, error: fetchError } = await supabase
        .from('settlements')
        .select(`
          *,
          influencer:influencers(
            id,
            name,
            bank_account
          ),
          campaign:campaigns(
            id,
            name
          )
        `)
        .eq('id', settlementId)
        .single();

      if (fetchError) throw fetchError;

      // 2. 정산 검증
      const validation = await validateSettlement(settlement);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // 3. 결제 처리 (실제로는 PG사 API 호출)
      const paymentResult = await processPayment({
        amount: settlement.amount,
        recipient: settlement.influencer.bank_account,
        reference: `ITDA-${settlement.id}`
      });

      if (!paymentResult.success) {
        throw new Error('결제 처리 실패');
      }

      // 4. 정산 상태 업데이트
      const { error: updateError } = await supabase
        .from('settlements')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          transaction_id: paymentResult.transactionId
        })
        .eq('id', settlementId);

      if (updateError) throw updateError;

      // 5. 알림 전송
      await sendSettlementNotification(settlement);

      return {
        success: true,
        transactionId: paymentResult.transactionId
      };
    } catch (error: any) {
      console.error('Settlement error:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processSettlement, isProcessing };
}

// ============================================
// 헬퍼 함수들
// ============================================

// ROI 계산
function calculateROI(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return ((revenue - spend) / spend) * 100;
}

// 매칭 완료 알림
async function notifyMatchingComplete(matchCount: number) {
  // 브라우저 알림
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('AI 매칭 완료! 🎯', {
      body: `${matchCount}명의 인플루언서를 찾았습니다.`,
      icon: '/logo.png'
    });
  }

  // 인앱 알림
  await supabase.from('notifications').insert({
    type: 'matching_complete',
    title: 'AI 매칭 완료',
    message: `${matchCount}명의 인플루언서를 찾았습니다.`,
    created_at: new Date().toISOString()
  });
}

// 인플루언서에게 알림 전송
async function sendNotificationToInfluencer(influencerId: string, campaignId: string) {
  await supabase.from('notifications').insert({
    user_id: influencerId,
    type: 'campaign_invitation',
    title: '새로운 캠페인 초대',
    message: '브랜드에서 캠페인 참여를 요청했습니다.',
    metadata: { campaignId },
    created_at: new Date().toISOString()
  });
}

// 정산 검증
async function validateSettlement(settlement: any): Promise<ValidationResult> {
  // 1. 캠페인 완료 여부 확인
  if (settlement.campaign.status !== 'completed') {
    return {
      isValid: false,
      error: '캠페인이 아직 완료되지 않았습니다.'
    };
  }

  // 2. 중복 정산 확인
  const { data: existing } = await supabase
    .from('settlements')
    .select('id')
    .eq('campaign_id', settlement.campaign_id)
    .eq('influencer_id', settlement.influencer_id)
    .eq('status', 'completed');

  if (existing && existing.length > 0) {
    return {
      isValid: false,
      error: '이미 정산이 완료되었습니다.'
    };
  }

  // 3. 금액 검증
  if (settlement.amount <= 0) {
    return {
      isValid: false,
      error: '정산 금액이 올바르지 않습니다.'
    };
  }

  return { isValid: true };
}

// 결제 처리 (실제 PG사 연동 시뮬레이션)
async function processPayment(params: PaymentParams): Promise<PaymentResult> {
  // 실제로는 PG사 API 호출
  // 여기서는 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    transactionId: `TXN-${Date.now()}`
  };
}

// 정산 알림 전송
async function sendSettlementNotification(settlement: any) {
  await supabase.from('notifications').insert({
    user_id: settlement.influencer_id,
    type: 'settlement_complete',
    title: '정산 완료',
    message: `${settlement.amount.toLocaleString()}원이 입금되었습니다.`,
    metadata: { settlementId: settlement.id },
    created_at: new Date().toISOString()
  });
}

// ============================================
// 타입 정의
// ============================================

interface InfluencerMatch {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  engagement: number;
  matchScore: number;
  categories: string[];
  price: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

interface MatchingFilters {
  categories?: string[];
  minFollowers?: number;
  minEngagement?: number;
  maxPrice?: number;
  location?: string[];
}

interface DashboardMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  roi: number;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  metadata?: any;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface PaymentParams {
  amount: number;
  recipient: string;
  reference: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}