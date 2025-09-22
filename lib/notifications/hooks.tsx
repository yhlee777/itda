// lib/notifications/hooks.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/lib/utils/toast';
import { Toast } from 'react-hot-toast';
import NotificationManager, { type Notification } from './manager';

// React Hook for Notifications
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
      
      if (!user) {
        setIsLoading(false);
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
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 새 알림 핸들러 (Toast 표시 포함)
  const handleNewNotification = useCallback((notification: Notification) => {
    // 상태 업데이트
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }

    // Toast 알림 표시
    const icon = notificationManager.getNotificationIcon(notification.type);
    
    toast.custom((t: Toast) => (
      <div 
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto`}
      >
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
                    if (notification.action_url) {
                      window.location.href = notification.action_url;
                    }
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

    // 특별한 알림 처리
    switch (notification.type) {
      case 'applicant_joined': {
        const metadata = notification.metadata;
        if (metadata?.applicant_count && metadata.applicant_count % 10 === 0) {
          toast.notification({
            title: '🎉 축하합니다!',
            description: `${metadata.applicant_count}명의 인플루언서가 캠페인에 지원했습니다!`,
            type: 'success'
          });
        }
        break;
      }
      case 'ai_insight': {
        toast.notification({
          title: notification.title,
          description: notification.message,
          type: 'info'
        });
        break;
      }
      case 'payment': {
        toast.notification({
          title: notification.title,
          description: notification.message,
          type: 'success'
        });
        break;
      }
      default:
        break;
    }
  }, [notificationManager]);

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