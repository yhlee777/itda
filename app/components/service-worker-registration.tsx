'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered:', registration)
            
            // 업데이트 체크
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // 새 버전 알림
                    if (confirm('새로운 버전이 있습니다. 업데이트하시겠습니까?')) {
                      window.location.reload()
                    }
                  }
                })
              }
            })
          },
          (err) => console.log('SW registration failed:', err)
        )
      })
    }
  }, [])
  
  return null
}