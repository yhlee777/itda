// hooks/useNotifications.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from './useAuth'; // 가정: 인증 훅이 있다고 가정
import type { 
  Notification, 
  NotificationType, 
  NotificationPreferences,
  NotificationStats 
} from '@/types/notifications';

// Supabase 브라우저 클라이언트
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 알림 훅
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);

  // 알림 소리 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
    }
  }, []);

  // 알림 가져오기
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      updateStats(data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 통계 업데이트
  const updateStats = (notifs: Notification[]) => {
    const unread = notifs.filter(n => !n.is_read).length;
    setUnreadCount(unread);

    const stats: NotificationStats = {
      total: notifs.length,
      unread,
      by_type: {} as any,
      by_priority: {
        high: notifs.filter(n => n.priority === 'high').length,
        medium: notifs.filter(n => n.priority === 'medium').length,
        low: notifs.filter(n => n.priority === 'low').length,
      }
    };

    // 타입별 집계
    notifs.forEach(n => {
      stats.by_type[n.type] = (stats.by_type[n.type] || 0) + 1;
    });

    setStats(stats);
  };

  // 실시간 구독
  useEffect(() => {
    if (!user?.id) return;

    // 초기 데이터 로드
    fetchNotifications();

    // Realtime 채널 구독
    channelRef.current = supabase
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
          const newNotification = payload.new as Notification;
          
          // 새 알림 추가
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // 알림음 재생
          playNotificationSound();
          
          // 브라우저 알림 표시
          showBrowserNotification(newNotification);
          
          // 알림 콜백 실행
          onNewNotification?.(newNotification);
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
          const updatedNotification = payload.new as Notification;
          const oldNotification = payload.old as Notification;
          
          // 알림 업데이트
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
          
          // 읽음 처리된 경우 카운트 감소
          if (updatedNotification.is_read && !oldNotification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    // 클린업
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id, fetchNotifications]);

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setNotifications(prev =>
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // 로컬 상태 업데이트
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 알림 삭제
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // 로컬 상태에서 제거
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // 삭제된 알림이 미읽음이었다면 카운트 감소
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // 알림음 재생
  const playNotificationSound = () => {
    if (audioRef.current && !document.hidden) {
      audioRef.current.play().catch(e => {
        console.log('Could not play notification sound:', e);
      });
    }
  };

  // 브라우저 알림 표시
  const showBrowserNotification = async (notification: Notification) => {
    // 권한 확인
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    if (Notification.permission !== 'granted') return;
    
    // 알림 표시 (타입 안전한 방식)
    const notificationOptions: NotificationOptions = {
      body: notification.message,
      icon: notification.image_url || '/icon-192.png',
      badge: '/badge-72.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'high',
      data: {
        url: notification.action_url,
        notificationId: notification.id
      }
    };

    // renotify는 별도로 설정 (브라우저 지원 여부 확인)
    if ('renotify' in Notification.prototype) {
      (notificationOptions as any).renotify = true;
    }
    
    const browserNotif = new Notification(notification.title, notificationOptions);
    
    // 클릭 이벤트
    browserNotif.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      if (notification.action_url) {
        window.location.href = notification.action_url;
      }
      
      markAsRead(notification.id);
      browserNotif.close();
    };
  };

  // 새로운 알림 생성
  const createNotification = async (
    type: NotificationType,
    data?: any,
    targetUserId?: string
  ) => {
    try {
      const { NotificationTemplates } = await import('@/types/notifications');
      const template = NotificationTemplates[type];
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId || user?.id,
          type,
          title: template.title(data),
          message: template.message(data),
          metadata: data,
          priority: template.priority,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    stats,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch: fetchNotifications
  };
}

// Push 알림 훅
export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Push API 지원 확인
    setIsSupported(
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
    
    // 현재 권한 상태
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Service Worker 등록
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return null;
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  };

  // Push 구독
  const subscribeToPush = async () => {
    if (!isSupported || !user?.id) return;
    
    try {
      // 권한 요청
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission !== 'granted') {
        console.log('Push permission denied');
        return;
      }
      
      // Service Worker 등록
      const registration = await registerServiceWorker();
      if (!registration) return;
      
      // VAPID 키 (서버에서 생성)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      
      // Push 구독
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      
      // 서버에 구독 정보 저장
      await saveSubscription(subscription);
      
      setSubscription(subscription.toJSON());
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
    }
  };

  // 구독 취소
  const unsubscribeFromPush = async () => {
    if (!isSupported) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscription();
        setSubscription(null);
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push:', error);
    }
  };

  // 서버에 구독 정보 저장
  const saveSubscription = async (subscription: PushSubscription) => {
    if (!user?.id) return;
    
    const subscriptionData = subscription.toJSON();
    
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          keys: subscriptionData.keys,
          device_info: {
            browser: navigator.userAgent,
            platform: navigator.platform
          },
          created_at: new Date().toISOString(),
          last_used_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
  };

  // 서버에서 구독 정보 제거
  const removeSubscription = async () => {
    if (!user?.id || !subscription?.endpoint) return;
    
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to remove subscription:', error);
    }
  };

  // 현재 구독 상태 확인
  const checkSubscription = async () => {
    if (!isSupported) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        setSubscription(subscription.toJSON());
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  useEffect(() => {
    if (isSupported) {
      checkSubscription();
    }
  }, [isSupported]);

  return {
    isSupported,
    subscription,
    permission,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush,
    checkSubscription
  };
}

// 유틸리티 함수
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// 알림 콜백
let onNewNotification: ((notification: Notification) => void) | undefined;

export function setOnNewNotificationCallback(callback: (notification: Notification) => void) {
  onNewNotification = callback;
}