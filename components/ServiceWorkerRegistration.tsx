// components/ServiceWorkerRegistration.tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Bell, BellOff, Download, RefreshCw } from 'lucide-react';

export function ServiceWorkerRegistration() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 브라우저 지원 체크
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    // Service Worker 등록
    registerServiceWorker();
    
    // 알림 권한 상태 확인
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // 온/오프라인 상태 감지
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('온라인 상태로 전환되었습니다', {
        icon: '🌐',
        duration: 2000,
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error('오프라인 상태입니다', {
        icon: '📵',
        duration: 3000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 초기 상태 설정
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Service Worker 등록
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      setRegistration(reg);
      console.log('Service Worker registered:', reg);

      // 업데이트 체크
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 새 버전 사용 가능
              setIsUpdateAvailable(true);
              
              toast.custom((t) => (
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">업데이트 가능</p>
                      <p className="text-sm text-gray-600">새로운 버전이 있습니다</p>
                    </div>
                    <button
                      onClick={() => {
                        window.location.reload();
                        toast.dismiss(t.id);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                    >
                      새로고침
                    </button>
                  </div>
                </div>
              ), {
                duration: Infinity,
                position: 'bottom-center',
              });
            }
          });
        }
      });

      // 주기적 업데이트 체크 (1시간마다)
      setInterval(() => {
        reg.update();
      }, 60 * 60 * 1000);

      // 즉시 업데이트 체크
      reg.update();

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      toast.error('오프라인 기능 활성화 실패', {
        duration: 3000,
      });
    }
  };

  // Push 알림 구독
  const subscribeToPushNotifications = async () => {
    if (!registration) {
      toast.error('Service Worker가 아직 등록되지 않았습니다');
      return;
    }

    try {
      // 알림 권한 요청
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== 'granted') {
        toast.error('알림 권한이 거부되었습니다');
        return;
      }

      // Push 구독
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // 서버에 구독 정보 전송
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (response.ok) {
        toast.success('Push 알림이 활성화되었습니다!', {
          icon: '🔔',
          duration: 3000,
        });
      } else {
        throw new Error('구독 등록 실패');
      }

    } catch (error) {
      console.error('Push subscription failed:', error);
      toast.error('Push 알림 구독 실패');
    }
  };

  // Push 구독 취소
  const unsubscribeFromPushNotifications = async () => {
    if (!registration) return;

    try {
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // 서버에서도 구독 제거
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        toast.success('Push 알림이 비활성화되었습니다', {
          icon: '🔕',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      toast.error('구독 취소 실패');
    }
  };

  // 테스트 알림 발송
  const sendTestNotification = async () => {
    if (!registration) return;

    try {
      // Service Worker에 메시지 전송
      if (registration.active) {
        registration.active.postMessage({
          type: 'TEST_NOTIFICATION',
        });
      }

      // 로컬 알림 표시
      if (Notification.permission === 'granted') {
        new Notification('ITDA 테스트 알림', {
          body: '알림이 정상적으로 작동합니다!',
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          vibrate: [200, 100, 200],
        });
      }
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  };

  // 오프라인 상태 표시
  if (isOffline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50">
        <p className="text-sm">
          📵 오프라인 모드 - 일부 기능이 제한될 수 있습니다
        </p>
      </div>
    );
  }

  // 알림 권한 요청 배너
  if (notificationPermission === 'default') {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg border p-4 z-40">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bell className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              실시간 알림 받기
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              새로운 지원자, 메시지, AI 분석 결과를 실시간으로 받아보세요
            </p>
            <div className="flex gap-2">
              <button
                onClick={subscribeToPushNotifications}
                className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                알림 켜기
              </button>
              <button
                onClick={() => setNotificationPermission('denied')}
                className="px-3 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// app/layout.tsx에 추가 필요:
// import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
// <ServiceWorkerRegistration />