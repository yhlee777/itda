// hooks/useAIMatching.ts
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
// 인플루언서용 매칭 Hook - 수정된 버전
// ============================================
export function useInfluencerMatching(influencerId: string | null) {
  const [currentCampaign, setCurrentCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  // 초창기 모드: 스와이프 제한 대폭 증가 (100개)
  const [dailySwipes, setDailySwipes] = useState({ used: 0, total: 100 });
  const [matchScore, setMatchScore] = useState<number>(0);
  
  // 다음 캠페인 로드 - useCallback으로 메모이제이션
  const loadNextCampaign = useCallback(async () => {
    if (!influencerId) {
      setCurrentCampaign(null);
      setMatchScore(0);
      return;
    }
    
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
          if (newCampaign) {
            setCurrentCampaign(newCampaign);
            const newScore = await getAIMatchScore(influencerId, newCampaign.id);
            setMatchScore(newScore);
          }
        }
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('캠페인 로드 실패');
      setCurrentCampaign(null);
      setMatchScore(0);
    } finally {
      setIsLoading(false);
    }
  }, [influencerId]);
  
  // 일일 스와이프 카운트 로드 - useCallback으로 메모이제이션
  const loadSwipeCount = useCallback(async () => {
    if (!influencerId) {
      setDailySwipes({ used: 0, total: 100 }); // 초창기 모드
      return;
    }
    
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('influencers')
        .select('daily_swipes_count')
        .eq('id', influencerId)
        .single();
      
      if (data) {
        setDailySwipes({
          used: data.daily_swipes_count || 0,
          total: 100 // 초창기 모드: 100개
        });
      }
    } catch (error) {
      console.error('Error loading swipe count:', error);
      setDailySwipes({ used: 0, total: 100 }); // 초창기 모드
    }
  }, [influencerId]);
  
  // 초기화 및 큐 생성
  useEffect(() => {
    // influencerId가 없으면 초기화하지 않음
    if (!influencerId) {
      setCurrentCampaign(null);
      setMatchScore(0);
      setDailySwipes({ used: 0, total: 100 }); // 초창기 모드
      return;
    }
    
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
  }, [influencerId, loadNextCampaign, loadSwipeCount]);
  
  // 스와이프 액션 처리
  const handleSwipe = useCallback(async (
    action: 'like' | 'pass' | 'super_like'
  ) => {
    // influencerId가 없으면 처리하지 않음
    if (!influencerId) {
      toast.error('로그인이 필요합니다');
      return;
    }
    
    if (!currentCampaign) {
      toast.error('캠페인이 없습니다');
      return;
    }
    
    if (dailySwipes.used >= dailySwipes.total) {
      toast.error('일일 스와이프 한도에 도달했습니다');
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
  }, [currentCampaign, dailySwipes, influencerId, loadNextCampaign]);
  
  // 핸들러 메모이제이션
  const handleLike = useCallback(() => handleSwipe('like'), [handleSwipe]);
  const handlePass = useCallback(() => handleSwipe('pass'), [handleSwipe]);
  const handleSuperLike = useCallback(() => handleSwipe('super_like'), [handleSwipe]);
  
  return {
    currentCampaign,
    matchScore,
    dailySwipes,
    isLoading,
    handleLike,
    handlePass,
    handleSuperLike,
    refreshQueue: loadNextCampaign
  };
}

// ============================================
// 광고주용 실시간 알림 Hook
// ============================================
export function useAdvertiserNotifications(advertiserId: string | null) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [applicantBatches, setApplicantBatches] = useState<any[]>([]);
  
  // 알림 로드 함수
  const loadNotifications = useCallback(async () => {
    if (!advertiserId) {
      setNotifications([]);
      setUnreadCount(0);
      setApplicantBatches([]);
      return;
    }
    
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', advertiserId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
        
        // 시간별 지원자 배치 그룹화
        const batches = data
          .filter(n => n.type === 'new_applicant')
          .reduce((acc: any[], notification) => {
            const time = new Date(notification.created_at);
            const batchTime = new Date(time);
            batchTime.setMinutes(Math.floor(time.getMinutes() / 30) * 30);
            
            const existingBatch = acc.find(
              b => b.time.getTime() === batchTime.getTime()
            );
            
            if (existingBatch) {
              existingBatch.count++;
              existingBatch.notifications.push(notification);
            } else {
              acc.push({
                id: `batch-${batchTime.getTime()}`,
                time: batchTime,
                count: 1,
                notifications: [notification]
              });
            }
            
            return acc;
          }, []);
        
        setApplicantBatches(batches);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('알림 로드 실패');
    }
  }, [advertiserId]);
  
  // 새 알림 처리
  const handleNewNotification = useCallback((notification: any) => {
    setNotifications(prev => [notification, ...prev]);
    
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
      
      // 브라우저 알림
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title || '새 알림', {
          body: notification.message,
          icon: '/icon.png',
          badge: '/badge.png'
        });
      }
    }
  }, []);
  
  // 실시간 구독 설정
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
        filter: `campaign_id=in.(select id from campaigns where advertiser_id='${advertiserId}')`
      }, (payload) => {
        // 새 지원자 알림
        const notification = {
          id: `new-applicant-${payload.new.id}`,
          user_id: advertiserId,
          type: 'new_applicant',
          title: '새로운 지원자',
          message: '캠페인에 새로운 인플루언서가 지원했습니다',
          metadata: payload.new,
          created_at: new Date().toISOString(),
          is_read: false
        };
        handleNewNotification(notification);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [advertiserId, loadNotifications, handleNewNotification]);
  
  // 읽음 처리
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!advertiserId) return;
    
    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', advertiserId);
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [advertiserId]);
  
  const markAllAsRead = useCallback(async () => {
    if (!advertiserId) return;
    
    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', advertiserId)
        .eq('is_read', false);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [advertiserId]);
  
  // 브라우저 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);
  
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