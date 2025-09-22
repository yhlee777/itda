// lib/notifications/manager.ts
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

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

type NotificationHandler = (notification: Notification) => void;

// Supabase Realtime Payload 타입 (간단한 버전)
interface RealtimePayload {
  eventType: string;
  new: any;
  old: any;
  errors: any;
  schema: string;
  table: string;
  commit_timestamp?: string;
}

class NotificationManager {
  private static instance: NotificationManager;
  private supabase: ReturnType<typeof createClient>;
  private subscription: RealtimeChannel | null = null;
  private handlers: Map<string, NotificationHandler> = new Map();
  private notificationQueue: Notification[] = [];
  private isProcessing = false;

  private constructor() {
    this.supabase = createClient();
    if (typeof window !== 'undefined') {
      this.initializeRealtimeSubscription();
      this.requestNotificationPermission();
    }
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

      // 새 구독 생성 - 간단한 payload 타입 사용
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
          (payload: RealtimePayload) => {
            if (payload.new && payload.eventType === 'INSERT') {
              this.handleNewNotification(payload.new as Notification);
            }
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
      // 10명마다 특별 알림
      console.log(`Milestone: ${metadata.applicant_count} applicants!`);
    }
  }

  // AI 인사이트 알림 처리
  private async handleAIInsight(notification: Notification): Promise<void> {
    console.log('AI Insight:', notification);
  }

  // 메시지 알림 처리
  private async handleMessage(notification: Notification): Promise<void> {
    this.playNotificationSound('message');
  }

  // 결제 알림 처리
  private async handlePayment(notification: Notification): Promise<void> {
    this.playNotificationSound('payment');
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

  // 알림 아이콘 가져오기
  public getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      campaign_matched: '🎯',
      applicant_joined: '👤',
      message: '💬',
      payment: '💰',
      ai_insight: '🤖',
    };
    return icons[type] || '🔔';
  }

  // 핸들러 등록
  public registerHandler(id: string, handler: NotificationHandler): void {
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
  public cleanup(): void {
    if (this.subscription) {
      this.supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
    this.handlers.clear();
    this.notificationQueue = [];
  }
}

export default NotificationManager;

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
          const { error: insertError } = await supabase
            .from('notifications')
            .insert({
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
          
          if (insertError) {
            console.error('Insert notification error:', insertError);
          }
        }
      } catch (error) {
        console.error('Schedule notification error:', error);
      }
    }, minutes * 60 * 1000);
  }
}