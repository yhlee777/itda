// hooks/useRealtimeNotifications.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database.types';

// Supabase 테이블 타입
type NotificationRow = Database['public']['Tables']['notifications']['Row'];

// 확장된 알림 인터페이스 (is_read 등 누락된 필드 포함)
interface Notification extends Omit<NotificationRow, 'metadata'> {
  // is_read는 이미 NotificationRow에 boolean으로 정의되어 있으므로 제거
  priority?: 'high' | 'medium' | 'low';
  metadata?: {
    [key: string]: any;
  };
}

// 알림 타입별 설정
const NOTIFICATION_CONFIG = {
  campaign_match: { icon: '🎯', priority: 'high' as const },
  application_accepted: { icon: '✅', priority: 'high' as const },
  new_message: { icon: '💬', priority: 'medium' as const },
  payment_received: { icon: '💰', priority: 'high' as const },
  new_applicant: { icon: '🔔', priority: 'high' as const },
  ai_insight: { icon: '🤖', priority: 'medium' as const },
  super_like: { icon: '⭐', priority: 'high' as const },
  default: { icon: '📢', priority: 'low' as const }
};

export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    // 초기 알림 로드
    loadNotifications();

    // 실시간 구독
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as NotificationRow;
          handleNewNotification({
            ...newNotification,
            is_read: false,
            priority: getNotificationPriority(newNotification.type),
            metadata: parseMetadata(newNotification.metadata)
          });
        }
      )
      .subscribe();

    // 브라우저 알림 권한 요청
    requestNotificationPermission();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('알림 로드 실패:', error);
        toast.error('알림을 불러올 수 없습니다.');
        return;
      }

      if (data) {
        // 데이터를 Notification 타입으로 변환
        const transformedNotifications: Notification[] = data.map(item => ({
          ...item,
          is_read: item.is_read ?? false,
          priority: getNotificationPriority(item.type),
          metadata: parseMetadata(item.metadata)
        }));

        setNotifications(transformedNotifications);
        const unread = transformedNotifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('알림 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    // 상태 업데이트
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // 토스트 알림
    showToastNotification(notification);

    // 브라우저 푸시 알림 (권한 있는 경우)
    if ('Notification' in window && Notification.permission === 'granted') {
      showPushNotification(notification);
    }
  };

  const showToastNotification = (notification: Notification) => {
    const icon = getNotificationIcon(notification.type);
    
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-2xl">{icon}</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              닫기
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  };

  const showPushNotification = (notification: Notification) => {
    const priority = notification.priority || 'low';
    
    new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      tag: notification.id,
      requireInteraction: priority === 'high'
    });
  };

  const getNotificationIcon = (type: string): string => {
    return NOTIFICATION_CONFIG[type as keyof typeof NOTIFICATION_CONFIG]?.icon || NOTIFICATION_CONFIG.default.icon;
  };

  const getNotificationPriority = (type: string): 'high' | 'medium' | 'low' => {
    return NOTIFICATION_CONFIG[type as keyof typeof NOTIFICATION_CONFIG]?.priority || NOTIFICATION_CONFIG.default.priority;
  };

  const parseMetadata = (metadata: any): Record<string, any> => {
    if (!metadata) return {};
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch {
        return {};
      }
    }
    return metadata as Record<string, any>;
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast.success('알림이 활성화되었습니다!');
        }
      } catch (error) {
        console.error('알림 권한 요청 실패:', error);
      }
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) {
        console.error('알림 읽음 처리 실패:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 상태 업데이트 오류:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('모든 알림 읽음 처리 실패:', error);
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('모든 알림을 읽었습니다.');
    } catch (error) {
      console.error('알림 일괄 업데이트 오류:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('알림 삭제 실패:', error);
        return;
      }

      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        if (notification && !notification.is_read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
      
      toast.success('알림이 삭제되었습니다.');
    } catch (error) {
      console.error('알림 삭제 오류:', error);
    }
  };

  const clearAll = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('알림 전체 삭제 실패:', error);
        return;
      }

      setNotifications([]);
      setUnreadCount(0);
      toast.success('모든 알림이 삭제되었습니다.');
    } catch (error) {
      console.error('알림 일괄 삭제 오류:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: loadNotifications,
    hasUnread: unreadCount > 0,
    totalCount: notifications.length
  };
}

// ============================================
// 알림 테이블에 누락된 컬럼 추가 (SQL)
// ============================================
/*
-- Supabase SQL Editor에서 실행
-- is_read, priority, read_at 컬럼 추가

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' 
CHECK (priority IN ('high', 'medium', 'low'));

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_priority 
ON notifications(priority, created_at DESC);
*/