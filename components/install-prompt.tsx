'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Download, Share } from 'lucide-react'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showIOSInstall, setShowIOSInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  
  useEffect(() => {
    // PWA 설치 여부 체크
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }
    
    // iOS 감지
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      setShowIOSInstall(true)
    }
    
    // Android/Desktop 설치 프롬프트
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])
  
  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }
  }
  
  if (isInstalled) return null
  
  if (showIOSInstall) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 bg-white shadow-lg animate-slide-up">
        <CardContent className="p-4">
          <button
            onClick={() => setShowIOSInstall(false)}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <Share className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="font-semibold text-sm">앱으로 설치하기</p>
              <p className="text-xs text-gray-600 mt-1">
                Safari 메뉴에서 <strong>"홈 화면에 추가"</strong>를 탭하세요
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (deferredPrompt) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 bg-white shadow-lg animate-slide-up">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-sm">ITDA 앱 설치</p>
                <p className="text-xs text-gray-600">더 빠르고 편리하게 이용하세요</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeferredPrompt(null)}
              >
                나중에
              </Button>
              <Button
                size="sm"
                onClick={handleInstallClick}
              >
                설치
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return null
}