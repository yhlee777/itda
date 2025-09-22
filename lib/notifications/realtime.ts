// lib/notifications/realtime.ts
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner'; // sonner 라이브러리 사용 (react-hot-toast 대신)

export interface Notification {
  id: string;
  user_id: string;
  type: 'campaign_matched' | 'applicant_joined' | 'message' | 'payment' | 'ai_insight' | 'price_update';
  title: string;
  message: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

class NotificationManager {
  private static instance: NotificationManager;
  private supabase: ReturnType<typeof createClient>;
  private subscription: any = null;
  private handlers: Map<string, (notification: Notification) => void> = new Map();
  private notificationQueue: Notification[] = [];
  private isProcessing = false;
  private soundEnabled = true;

  private constructor() {
    this.supabase = createClient();
    this.initializeRealtimeSubscription();
    this.requestNotificationPermission();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // 브라우저 알림 권한 요청
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    }
  }

  // 실시간 구독 초기화
  private async initializeRealtimeSubscription(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        console.log('No user found for realtime subscription');
        return;
      }

      // 기존 구독 정리
      if (this.subscription) {
        await this.supabase.removeChannel(this.subscription);
      }

      // 새 구독 생성
      this.subscription = this.supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New notification received:', payload);
            this.handleNewNotification(payload.new as Notification);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Notification updated:', payload);
            // 알림 업데이트 처리
            this.handlers.forEach(handler => {
              try {
                handler(payload.new as Notification);
              } catch (error) {
                console.error('Handler error:', error);
              }
            });
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });
    } catch (error) {
      console.error('Realtime subscription error:', error);
    }
  }

  // 새 알림 처리
  private async handleNewNotification(notification: Notification): Promise<void> {
    // 큐에 추가
    this.notificationQueue.push(notification);
    
    // 처리 시작
    if (!this.isProcessing) {
      this.processNotificationQueue();
    }

    // 토스트 알림 표시
    this.displayToastNotification(notification);

    // 브라우저 알림 표시
    this.displayBrowserNotification(notification);

    // 등록된 핸들러 실행
    this.handlers.forEach(handler => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Notification handler error:', error);
      }
    });
  }

  // 알림 큐 처리
  private async processNotificationQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (notification) {
        await this.processNotification(notification);
      }
    }

    this.isProcessing = false;
  }

  // 개별 알림 처리
  private async processNotification(notification: Notification): Promise<void> {
    switch (notification.type) {
      case 'campaign_matched':
        await this.handleCampaignMatched(notification);
        break;
      case 'applicant_joined':
        await this.handleApplicantJoined(notification);
        break;
      case 'ai_insight':
        await this.handleAIInsight(notification);
        break;
      case 'message':
        await this.handleMessage(notification);
        break;
      case 'payment':
        await this.handlePayment(notification);
        break;
      case 'price_update':
        await this.handlePriceUpdate(notification);
        break;
      default:
        break;
    }
  }

  // 캠페인 매칭 알림 처리
  private async handleCampaignMatched(notification: Notification): Promise<void> {
    // 특별한 효과 추가 (진동)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // 사운드 재생
    if (this.soundEnabled) {
      this.playNotificationSound('match');
    }
  }

  // 지원자 참여 알림 처리
  private async handleApplicantJoined(notification: Notification): Promise<void> {
    const metadata = notification.metadata;
    
    // 마일스톤 알림
    if (metadata?.applicant_count) {
      if (metadata.applicant_count === 1) {
        toast.success('🎉 첫 번째 지원자가 나타났습니다!');
      } else if (metadata.applicant_count % 10 === 0) {
        toast.success(
          `🎉 축하합니다! ${metadata.applicant_count}명의 인플루언서가 캠페인에 지원했습니다!`,
          { duration: 5000 }
        );
      } else if (metadata.applicant_count % 5 === 0) {
        toast.info(
          `현재 ${metadata.applicant_count}명이 지원했습니다`,
          { duration: 3000 }
        );
      }
    }
    
    // 사운드 재생
    if (this.soundEnabled) {
      this.playNotificationSound('message');
    }
  }

  // AI 인사이트 알림 처리
  private async handleAIInsight(notification: Notification): Promise<void> {
    // AI 인사이트는 중요도가 높으므로 특별히 표시
    toast(notification.message, {
      duration: 6000,
      description: '🤖 AI 추천',
      icon: '🤖',
    });
    
    // 브라우저 알림도 표시
    this.displayBrowserNotification(notification);
  }

  // 메시지 알림 처리
  private async handleMessage(notification: Notification): Promise<void> {
    if (this.soundEnabled) {
      this.playNotificationSound('message');
    }
  }

  // 결제 알림 처리
  private async handlePayment(notification: Notification): Promise<void> {
    toast.success(
      notification.message,
      {
        duration: 5000,
      }
    );
    
    if (this.soundEnabled) {
      this.playNotificationSound('payment');
    }
  }

  // 가격 업데이트 알림 처리
  private async handlePriceUpdate(notification: Notification): Promise<void> {
    const metadata = notification.metadata;
    
    if (metadata?.predicted_price && metadata?.change_percentage) {
      const isIncrease = metadata.change_percentage > 0;
      const icon = isIncrease ? '📈' : '📉';
      const color = isIncrease ? 'success' : 'warning';
      
      toast[color as 'success' | 'warning'](
        `${icon} 예상 단가: ${metadata.predicted_price.toLocaleString()}원`,
        {
          description: `${Math.abs(metadata.change_percentage)}% ${isIncrease ? '상승' : '하락'}`,
          duration: 4000,
        }
      );
    }
  }

  // 토스트 알림 표시
  private displayToastNotification(notification: Notification): void {
    const icon = this.getNotificationIcon(notification.type);
    
    // 알림 타입별 토스트 스타일 결정
    let toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
    
    switch (notification.type) {
      case 'campaign_matched':
        toastType = 'success';
        break;
      case 'payment':
        toastType = 'success';
        break;
      case 'ai_insight':
        toastType = 'info';
        break;
      case 'price_update':
        toastType = 'warning';
        break;
      default:
        toastType = 'info';
    }
    
    // 토스트 표시
    toast[toastType](
      notification.title,
      {
        description: notification.message,
        duration: 4000,
        action: notification.action_url ? {
          label: '보기',
          onClick: () => {
            window.location.href = notification.action_url!;
          },
        } : undefined,
      }
    );
  }

  // 브라우저 알림 표시
  private displayBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: notification.id,
          requireInteraction: notification.type === 'ai_insight' || notification.type === 'price_update',
          silent: false,
        });

        browserNotification.onclick = () => {
          window.focus();
          if (notification.action_url) {
            window.location.href = notification.action_url;
          }
          browserNotification.close();
        };

        // 자동 닫기 (AI 인사이트는 제외)
        if (notification.type !== 'ai_insight' && notification.type !== 'price_update') {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }
      } catch (error) {
        console.error('Browser notification error:', error);
      }
    }
  }

  // 알림 아이콘 가져오기
  private getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      campaign_matched: '🎯',
      applicant_joined: '👤',
      message: '💬',
      payment: '💰',
      ai_insight: '🤖',
      price_update: '📊',
    };
    return icons[type] || '🔔';
  }

  // 알림 사운드 재생
  private playNotificationSound(type: 'match' | 'message' | 'payment' = 'message'): void {
    if (typeof window === 'undefined' || !this.soundEnabled) return;
    
    try {
      const audio = new Audio();
      const soundMap = {
        match: '/sounds/match.mp3',
        message: '/sounds/message.mp3',
        payment: '/sounds/payment.mp3',
      };
      
      audio.src = soundMap[type];
      audio.volume = 0.5;
      
      // 사운드 재생 (자동 재생 정책 고려)
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Sound played successfully');
          })
          .catch((error) => {
            console.log('Sound play failed (autoplay policy):', error.message);
          });
      }
    } catch (error) {
      console.log('Sound not supported:', error);
    }
  }

  // 사운드 설정 토글
  public toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('notificationSound', String(this.soundEnabled));
  }

  // 사운드 설정 로드
  private loadSoundSetting(): void {
    const saved = localStorage.getItem('notificationSound');
    if (saved !== null) {
      this.soundEnabled = saved === 'true';
    }
  }

  // 핸들러 등록
  public registerHandler(id: string, handler: (notification: Notification) => void): void {
    this.handlers.set(id, handler);
  }

  // 핸들러 제거
  public unregisterHandler(id: string): void {
    this.handlers.delete(id);
  }

  // 알림 읽음 처리
  public async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) {
        console.error('Mark as read error:', error);
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  }

  // 모든 알림 읽음 처리
  public async markAllAsRead(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return;

      const { error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) {
        console.error('Mark all as read error:', error);
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  }

  // 정리
  public async cleanup(): Promise<void> {
    if (this.subscription) {
      await this.supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
    this.handlers.clear();
    this.notificationQueue = [];
  }

  // 재연결
  public async reconnect(): Promise<void> {
    await this.cleanup();
    await this.initializeRealtimeSubscription();
  }
}

// React Hook for Notifications
import { useEffect, useState, useCallback } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const notificationManager = NotificationManager.getInstance();

  // 알림 로드
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
        setIsConnected(true);
      } else {
        console.error('Error loading notifications:', error);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 새 알림 핸들러
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // 최대 50개 유지
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // 알림 읽음 처리
  const markAsRead = useCallback(async (notificationId: string) => {
    await notificationManager.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [notificationManager]);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    await notificationManager.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [notificationManager]);

  // 사운드 토글
  const toggleSound = useCallback(() => {
    notificationManager.toggleSound();
  }, [notificationManager]);

  // 재연결
  const reconnect = useCallback(async () => {
    setIsConnected(false);
    await notificationManager.reconnect();
    await loadNotifications();
  }, [notificationManager, loadNotifications]);

  useEffect(() => {
    loadNotifications();
    
    // 실시간 알림 핸들러 등록
    const handlerId = `notifications-hook-${Date.now()}`;
    notificationManager.registerHandler(handlerId, handleNewNotification);

    return () => {
      notificationManager.unregisterHandler(handlerId);
    };
  }, [loadNotifications, handleNewNotification, notificationManager]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
    toggleSound,
    reconnect,
  };
}

// 광고주용 스케줄 알림 헬퍼
export async function scheduleAdvertiserNotifications(
  campaignId: string,
  advertiserId: string,
  intervals: number[] = [30, 120, 360] // 30분, 2시간, 6시간
): Promise<void> {
  const supabase = createClient();
  
  for (const minutes of intervals) {
    setTimeout(async () => {
      try {
        // 현재 지원자 수 및 정보 수집
        const { data: applicants, error } = await supabase
          .from('campaign_influencers')
          .select(`
            *,
            influencer:influencers(*)
          `)
          .eq('campaign_id', campaignId)
          .eq('status', 'applied');

        if (!error && applicants && applicants.length > 0) {
          // AI 분석 수행
          const topApplicants = applicants
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, 3);

          // 알림 생성
          await supabase.from('notifications').insert({
            user_id: advertiserId,
            type: 'applicant_joined',
            title: `캠페인 업데이트 - ${minutes}분 경과`,
            message: `${applicants.length}명의 인플루언서가 지원했습니다. 상위 매칭률: ${topApplicants[0]?.match_score || 0}%`,
            metadata: {
              campaign_id: campaignId,
              applicant_count: applicants.length,
              interval_minutes: minutes,
              top_applicants: topApplicants.map(a => ({
                id: a.influencer_id,
                name: a.influencer.name,
                match_score: a.match_score,
              })),
            },
            action_url: `/dashboard/campaigns/${campaignId}/applicants`
          });
        }
      } catch (error) {
        console.error('Schedule notification error:', error);
      }
    }, minutes * 60 * 1000);
  }
}

// AI 가격 예측 알림
export async function notifyPricePrediction(
  userId: string,
  campaignId: string,
  predictedPrice: number,
  changePercentage: number
): Promise<void> {
  const supabase = createClient();
  
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'price_update',
    title: '💰 AI 단가 예측 업데이트',
    message: `예상 단가가 ${predictedPrice.toLocaleString()}원으로 ${Math.abs(changePercentage)}% ${changePercentage > 0 ? '상승' : '하락'}했습니다.`,
    metadata: {
      campaign_id: campaignId,
      predicted_price: predictedPrice,
      change_percentage: changePercentage,
    },
    action_url: `/dashboard/campaigns/${campaignId}/analytics`
  });
}

export default NotificationManager;