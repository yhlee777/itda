// public/sw.js

// Service Worker 버전
const SW_VERSION = '1.0.0';
const CACHE_NAME = `itda-cache-v${SW_VERSION}`;

// 캐시할 리소스들
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/sounds/notification.mp3'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log(`[SW v${SW_VERSION}] Installing...`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log(`[SW v${SW_VERSION}] Activating...`);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Push 이벤트 처리
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  if (!event.data) {
    console.log('[SW] Push event but no data');
    return;
  }
  
  try {
    const data = event.data.json();
    
    // 알림 옵션 설정
    const options = {
      title: data.title || '새 알림',
      body: data.body || data.message || '새로운 알림이 도착했습니다.',
      icon: data.icon || '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'default',
      renotify: true,
      requireInteraction: data.priority === 'high',
      silent: false,
      data: {
        url: data.url || data.action_url || '/',
        notificationId: data.notificationId,
        type: data.type,
        timestamp: new Date().toISOString()
      },
      actions: []
    };
    
    // 알림 타입별 액션 추가
    switch(data.type) {
      case 'new_applicant':
        options.actions = [
          {
            action: 'view',
            title: '확인',
            icon: '/icons/check.png'
          },
          {
            action: 'dismiss',
            title: '나중에',
            icon: '/icons/close.png'
          }
        ];
        break;
        
      case 'campaign_match':
        options.actions = [
          {
            action: 'apply',
            title: '지원하기',
            icon: '/icons/apply.png'
          },
          {
            action: 'view',
            title: '자세히',
            icon: '/icons/view.png'
          }
        ];
        break;
        
      case 'payment_received':
        options.actions = [
          {
            action: 'view',
            title: '확인',
            icon: '/icons/money.png'
          }
        ];
        break;
        
      case 'new_message':
        options.actions = [
          {
            action: 'reply',
            title: '답장',
            icon: '/icons/reply.png'
          },
          {
            action: 'view',
            title: '보기',
            icon: '/icons/view.png'
          }
        ];
        break;
    }
    
    // 이미지 추가 (있는 경우)
    if (data.image) {
      options.image = data.image;
    }
    
    // 알림 표시
    event.waitUntil(
      self.registration.showNotification(data.title || '새 알림', options)
    );
    
    // 배지 업데이트
    if ('setAppBadge' in navigator) {
      navigator.setAppBadge(data.unreadCount || 1).catch(err => {
        console.log('[SW] Badge API not supported:', err);
      });
    }
    
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
    
    // 폴백 알림
    const title = '새 알림';
    const options = {
      body: event.data.text(),
      icon: '/icon-192.png',
      badge: '/badge-72.png'
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  notification.close();
  
  // 액션별 처리
  let targetUrl = data.url || '/';
  
  switch(action) {
    case 'apply':
      targetUrl = `/campaigns/${data.campaignId}/apply`;
      break;
    case 'view':
      targetUrl = data.url;
      break;
    case 'reply':
      targetUrl = `/messages/${data.conversationId}?reply=true`;
      break;
    case 'dismiss':
      // 아무것도 하지 않음
      return;
  }
  
  // 클라이언트 창 열기/포커스
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // 이미 열린 창이 있는지 확인
        for (let client of windowClients) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .then(() => {
        // 알림 읽음 처리 API 호출
        if (data.notificationId) {
          return fetch('/api/notifications/mark-read', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              notificationId: data.notificationId
            })
          });
        }
      })
  );
});

// 알림 닫기 처리
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
  
  // 분석 이벤트 전송 (선택사항)
  if (event.notification.data && event.notification.data.notificationId) {
    fetch('/api/analytics/notification-closed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notificationId: event.notification.data.notificationId,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.log('[SW] Analytics error:', err));
  }
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// 주기적 백그라운드 동기화 (선택사항)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkNewNotifications());
  }
});

// 동기화 함수들
async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications/sync', {
      method: 'POST'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('[SW] Notifications synced:', data);
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

async function checkNewNotifications() {
  try {
    const response = await fetch('/api/notifications/check');
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.hasNew) {
        // 새 알림이 있으면 표시
        self.registration.showNotification('새 알림', {
          body: `${data.count}개의 새로운 알림이 있습니다.`,
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          tag: 'new-notifications',
          data: {
            url: '/notifications'
          }
        });
      }
    }
  } catch (error) {
    console.error('[SW] Check failed:', error);
  }
}

// 메시지 이벤트 처리 (클라이언트와 통신)
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  switch(event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_BADGE':
      if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge();
      }
      break;
      
    case 'SET_BADGE':
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(event.data.count || 0);
      }
      break;
      
    case 'SHOW_NOTIFICATION':
      self.registration.showNotification(event.data.title, event.data.options);
      break;
  }
});

// 페치 이벤트 처리 (오프라인 지원)
self.addEventListener('fetch', (event) => {
  // API 요청은 캐시하지 않음
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // 네트워크 우선, 실패시 캐시
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 유효한 응답이면 캐시 업데이트
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(() => {
        // 네트워크 실패시 캐시에서 가져오기
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // 오프라인 페이지 표시
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});