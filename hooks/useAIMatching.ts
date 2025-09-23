// hooks/useMatchingSystem.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  CampaignQueueManager, 
  SwipeActionHandler,
  RealtimeMatchingCoordinator,
  getAIMatchScore 
} from '@/lib/matching/realtime-matching-algorithm';
import { toast } from 'react-hot-toast';

// ============================================
// 인플루언서용 매칭 Hook
// ============================================
export function useInfluencerMatching(influencerId: string) {
  const [currentCampaign, setCurrentCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dailySwipes, setDailySwipes] = useState({ used: 0, total: 10 });
  const [matchScore, setMatchScore] = useState<number>(0);
  
  // 초기화 및 큐 생성
  useEffect(() => {
    if (!influencerId) return;
    
    const initialize = async () => {
      try {
        // 매칭 시스템 초기화
        await RealtimeMatchingCoordinator.initializeForInfluencer(influencerId);
        
        // 다음 캠페인 로드
        await loadNextCampaign();
        
        // 일일 스와이프 카운트 로드
        await loadSwipeCount();
      } catch (error) {
        console.error('Matching system initialization error:', error);
      }
    };
    
    initialize();
  }, [influencerId]);
  
  // 다음 캠페인 로드
  const loadNextCampaign = async () => {
    setIsLoading(true);
    try {
      const campaign = await CampaignQueueManager.getNextCampaign(influencerId);
      
      if (campaign) {
        setCurrentCampaign(campaign);
        // AI 매칭 점수 계산
        const score = await getAIMatchScore(influencerId, campaign.id);
        setMatchScore(score);
      } else {
        // 큐가 비었으면 재생성
        const supabase = createClient();
        const { data: influencer } = await supabase
          .from('influencers')
          .select('categories')
          .eq('id', influencerId)
          .single();
        
        if (influencer) {
          await CampaignQueueManager.generateQueue(
            influencerId, 
            influencer.categories || []
          );
          // 재시도
          const newCampaign = await CampaignQueueManager.getNextCampaign(influencerId);
          setCurrentCampaign(newCampaign);
        }
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('캠페인 로드 실패');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 일일 스와이프 카운트 로드
  const loadSwipeCount = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('influencers')
      .select('daily_swipes_count')
      .eq('id', influencerId)
      .single();
    
    if (data) {
      setDailySwipes({
        used: data.daily_swipes_count || 0,
        total: 10
      });
    }
  };
  
  // 스와이프 액션 처리
  const handleSwipe = useCallback(async (
    action: 'like' | 'pass' | 'super_like'
  ) => {
    if (!currentCampaign || dailySwipes.used >= dailySwipes.total) {
      if (dailySwipes.used >= dailySwipes.total) {
        toast.error('일일 스와이프 한도에 도달했습니다');
      }
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await SwipeActionHandler.handleSwipe(
        influencerId,
        currentCampaign.id,
        action
      );
      
      // 매칭 성공 알림
      if (result.matched) {
        if (action === 'super_like') {
          toast.success('⭐ 슈퍼 매치! 채팅이 열렸습니다');
        } else {
          toast.success('❤️ 매치되었습니다!');
        }
      }
      
      // 스와이프 카운트 업데이트
      setDailySwipes(prev => ({
        ...prev,
        used: prev.used + 1
      }));
      
      // 다음 캠페인 로드
      await loadNextCampaign();
      
    } catch (error) {
      console.error('Swipe error:', error);
      toast.error('스와이프 처리 실패');
    } finally {
      setIsLoading(false);
    }
  }, [currentCampaign, dailySwipes, influencerId]);
  
  return {
    currentCampaign,
    matchScore,
    dailySwipes,
    isLoading,
    handleLike: () => handleSwipe('like'),
    handlePass: () => handleSwipe('pass'),
    handleSuperLike: () => handleSwipe('super_like'),
    refreshQueue: loadNextCampaign
  };
}

// ============================================
// 광고주용 실시간 알림 Hook
// ============================================
export function useAdvertiserNotifications(advertiserId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [applicantBatches, setApplicantBatches] = useState<any[]>([]);
  
  useEffect(() => {
    if (!advertiserId) return;
    
    const supabase = createClient();
    
    // 초기 알림 로드
    loadNotifications();
    
    // 실시간 구독
    const channel = supabase
      .channel(`advertiser-${advertiserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${advertiserId}`
      }, (payload) => {
        handleNewNotification(payload.new);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'campaign_influencers',
        filter: `campaign_id=in.(SELECT id FROM campaigns WHERE advertiser_id='${advertiserId}')`
      }, (payload) => {
        handleNewApplicant(payload.new);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [advertiserId]);
  
  const loadNotifications = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', advertiserId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.length);
      
      // 지원자 배치 그룹화
      groupApplicantBatches(data);
    }
  };
  
  const handleNewNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // 브라우저 알림
    if (notification.type === 'super_like') {
      showBrowserNotification(
        '⭐ 슈퍼 라이크!',
        notification.message
      );
    } else {
      showBrowserNotification(
        notification.title,
        notification.message
      );
    }
  };
  
  const handleNewApplicant = async (applicant: any) => {
    // 30분/2시간 배치에 추가
    const now = new Date();
    const appliedAt = new Date(applicant.matched_at);
    const minutesSince = (now.getTime() - appliedAt.getTime()) / 60000;
    
    if (minutesSince <= 30) {
      updateBatch('30min', applicant);
    } else if (minutesSince <= 120) {
      updateBatch('2hr', applicant);
    }
  };
  
  const groupApplicantBatches = (notifications: any[]) => {
    const batches: any[] = [];
    const now = new Date();
    
    // 30분, 2시간 배치 생성
    const intervals = [
      { name: '30분', minutes: 30 },
      { name: '2시간', minutes: 120 },
      { name: '6시간', minutes: 360 }
    ];
    
    intervals.forEach(interval => {
      const applicants = notifications.filter(n => {
        if (n.type !== 'new_applicant') return false;
        const time = new Date(n.created_at);
        const minutesSince = (now.getTime() - time.getTime()) / 60000;
        return minutesSince <= interval.minutes;
      });
      
      if (applicants.length > 0) {
        batches.push({
          id: `batch-${interval.minutes}`,
          time: interval.name,
          count: applicants.length,
          applicants: applicants,
          sentAt: new Date()
        });
      }
    });
    
    setApplicantBatches(batches);
  };
  
  const updateBatch = (batchType: string, applicant: any) => {
    setApplicantBatches(prev => {
      const updated = [...prev];
      const batch = updated.find(b => b.time === batchType);
      if (batch) {
        batch.count++;
        batch.applicants.push(applicant);
      }
      return updated;
    });
  };
  
  const showBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' });
    }
  };
  
  const markAsRead = async (notificationId: string) => {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const markAllAsRead = async () => {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', advertiserId)
      .eq('is_read', false);
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };
  
  // 브라우저 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };
  
  return {
    notifications,
    unreadCount,
    applicantBatches,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
    refreshNotifications: loadNotifications
  };
}

// ============================================
// AI 매칭 점수 계산 Hook (공통)
// ============================================
export function useAIMatchScore() {
  const [isCalculating, setIsCalculating] = useState(false);
  
  const calculateScore = useCallback(async (
    influencerId: string,
    campaignId: string
  ): Promise<number> => {
    setIsCalculating(true);
    try {
      const score = await getAIMatchScore(influencerId, campaignId);
      return score;
    } catch (error) {
      console.error('Score calculation error:', error);
      return 0;
    } finally {
      setIsCalculating(false);
    }
  }, []);
  
  const calculateBulkScores = useCallback(async (
    pairs: Array<{ influencerId: string; campaignId: string }>
  ): Promise<Array<{ influencerId: string; campaignId: string; score: number }>> => {
    setIsCalculating(true);
    try {
      const results = await Promise.all(
        pairs.map(async ({ influencerId, campaignId }) => ({
          influencerId,
          campaignId,
          score: await getAIMatchScore(influencerId, campaignId)
        }))
      );
      return results;
    } catch (error) {
      console.error('Bulk score calculation error:', error);
      return [];
    } finally {
      setIsCalculating(false);
    }
  }, []);
  
  return {
    calculateScore,
    calculateBulkScores,
    isCalculating
  };
}

// ============================================
// 사용 예제
// ============================================
/*
// 인플루언서 페이지에서 사용
import { useInfluencerMatching } from '@/hooks/useMatchingSystem';

function InfluencerCampaignPage() {
  const { 
    currentCampaign,
    matchScore,
    dailySwipes,
    handleLike,
    handlePass,
    handleSuperLike 
  } = useInfluencerMatching(userId);
  
  // 기존 UI에 버튼 연결
  return (
    <div>
      {currentCampaign && (
        <>
          <div>매칭 점수: {matchScore}%</div>
          <div>남은 스와이프: {dailySwipes.total - dailySwipes.used}</div>
          <button onClick={handlePass}>Pass</button>
          <button onClick={handleLike}>Like</button>
          <button onClick={handleSuperLike}>Super Like</button>
        </>
      )}
    </div>
  );
}

// 광고주 페이지에서 사용
import { useAdvertiserNotifications } from '@/hooks/useMatchingSystem';

function AdvertiserDashboard() {
  const { 
    notifications, 
    unreadCount,
    applicantBatches,
    markAsRead 
  } = useAdvertiserNotifications(userId);
  
  // 기존 UI에 알림 표시
  return (
    <div>
      <div>새 알림: {unreadCount}개</div>
      {applicantBatches.map(batch => (
        <div key={batch.id}>
          {batch.time} - {batch.count}명 지원
        </div>
      ))}
    </div>
  );
}
*/