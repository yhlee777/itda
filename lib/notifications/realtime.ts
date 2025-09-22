// lib/notifications/realtime.ts
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/lib/utils/toast';

export interface Notification {
  id: string;
  user_id: string;
  type: 'campaign_matched' | 'applicant_joined' | 'message' | 'payment' | 'ai_insight';
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
        await Notification.requestPermission();
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    }
  }

  // 실시간 구독 초기화
  private async initializeRealtimeSubscription(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return;

      // 기존 구독 정리
      if (this.subscription) {
        this.supabase.removeChannel(this.subscription);
      }

      // 새 구독 생성
      this.subscription = this.supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            this.handleNewNotification(payload.new as Notification);
          }
        )
        .subscribe();
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
      default:
        break;
    }
  }

  // 캠페인 매칭 알림 처리
  private async handleCampaignMatched(notification: Notification): Promise<void> {
    // 특별한 효과 추가 (예: 사운드, 진동)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // 사운드 재생 (옵션)
    this.playNotificationSound('match');
  }

  // 지원자 참여 알림 처리
  private async handleApplicantJoined(notification: Notification): Promise<void> {
    // 광고주를 위한 특별한 처리
    const metadata = notification.metadata;
    if (metadata?.applicant_count && metadata.applicant_count % 10 === 0) {
      // 10명마다 요약 알림
      toast.notification({
        title: '🎉 축하합니다!',
        description: `${metadata.applicant_count}명의 인플루언서가 캠페인에 지원했습니다!`,
        type: 'success'
      });
    }
  }

  // AI 인사이트 알림 처리
  private async handleAIInsight(notification: Notification): Promise<void> {
    // AI 인사이트는 중요도가 높으므로 특별히 표시
    toast.notification({
      title: notification.title,
      description: notification.message,
      type: 'info'
    });
  }

  // 메시지 알림 처리
  private async handleMessage(notification: Notification): Promise<void> {
    // 메시지 알림 처리
    this.playNotificationSound('message');
  }

  // 결제 알림 처리
  private async handlePayment(notification: Notification): Promise<void> {
    // 결제 관련 알림 처리
    toast.notification({
      title: notification.title,
      description: notification.message,
      type: 'success'
    });
  }

  // 토스트 알림 표시
  private displayToastNotification(notification: Notification): void {
    const icon = this.getNotificationIcon(notification.type);
    
    toast.custom((t) => (
      <div className={`${
        t.visible ? 'animate-slide-in' : 'animate-slide-out'
      } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">{icon}</span>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {notification.message}
              </p>
            </div>
            {notification.action_url && (
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    window.location.href = notification.action_url!;
                  }}
                  className="inline-flex text-purple-600 hover:text-purple-500 focus:outline-none"
                >
                  <span className="text-sm">보기</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    ), {
      duration: 4000,
      position: 'top-right',
    });
  }

  // 브라우저 알림 표시
  private displayBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.id,
        requireInteraction: notification.type === 'ai_insight',
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.action_url) {
          window.location.href = notification.action_url;
        }
        browserNotification.close();
      };
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
    };
    return icons[type] || '🔔';
  }

  // 알림 사운드 재생
  private playNotificationSound(type: 'match' | 'message' | 'payment' = 'message'): void {
    if (typeof window === 'undefined') return;
    
    try {
      const audio = new Audio();
      switch (type) {
        case 'match':
          audio.src = '/sounds/match.mp3';
          break;
        case 'message':
          audio.src = '/sounds/message.mp3';
          break;
        case 'payment':
          audio.src = '/sounds/payment.mp3';
          break;
      }
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Sound play failed:', e));
    } catch (error) {
      console.log('Sound not supported');
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
      await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  }

  // 모든 알림 읽음 처리
  public async markAllAsRead(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return;

      await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  }

  // 정리
  public cleanup(): void {
    if (this.subscription) {
      this.supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
    this.handlers.clear();
    this.notificationQueue = [];
  }
}

// React Hook for Notifications
import { useEffect, useState, useCallback } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const notificationManager = NotificationManager.getInstance();

  // 알림 로드
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 새 알림 핸들러
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
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

  useEffect(() => {
    loadNotifications();
    
    // 실시간 알림 핸들러 등록
    const handlerId = 'notifications-hook';
    notificationManager.registerHandler(handlerId, handleNewNotification);

    return () => {
      notificationManager.unregisterHandler(handlerId);
    };
  }, [loadNotifications, handleNewNotification, notificationManager]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
}

// 광고주용 스케줄 알림
export async function scheduleAdvertiserNotifications(
  campaignId: string,
  advertiserId: string,
  intervals: number[] = [30, 120] // 30분, 2시간
): Promise<void> {
  const supabase = createClient();
  
  for (const minutes of intervals) {
    setTimeout(async () => {
      try {
        // 현재 지원자 수 확인
        const { data: applicants, error } = await supabase
          .from('campaign_influencers')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('status', 'applied');

        if (!error && applicants) {
          // 알림 생성
          await supabase.from('notifications').insert({
            user_id: advertiserId,
            type: 'applicant_joined',
            title: '캠페인 업데이트',
            message: `${applicants.length}명의 인플루언서가 캠페인에 지원했습니다. AI 추천을 확인해보세요!`,
            metadata: {
              campaign_id: campaignId,
              applicant_count: applicants.length,
              interval_minutes: minutes
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

export default NotificationManager;