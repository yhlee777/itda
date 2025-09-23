import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Toaster as HotToaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ITDA - 인플루언서와 브랜드를 잇다',
  description: '인플루언서와 브랜드를 연결하는 AI 기반 매칭 플랫폼',
  keywords: ['인플루언서', '마케팅', '브랜드', '협업', 'SNS', 'AI매칭', '인플루언서마케팅'],
  authors: [{ name: 'ITDA Team' }],
  generator: 'Next.js',
  applicationName: 'ITDA',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://itda.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ITDA - 인플루언서와 브랜드를 잇다',
    description: '인플루언서와 브랜드를 연결하는 AI 기반 매칭 플랫폼',
    url: 'https://itda.app',
    siteName: 'ITDA',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ITDA - 인플루언서 마케팅 플랫폼',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ITDA - 인플루언서와 브랜드를 잇다',
    description: '인플루언서와 브랜드를 연결하는 AI 기반 매칭 플랫폼',
    creator: '@itda_app',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#9333ea',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'ITDA',
    statusBarStyle: 'default',
    startupImage: [
      '/apple-splash-2048-2732.png',
      {
        url: '/apple-splash-1668-2224.png',
        media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/apple-splash-1536-2048.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-verification-code',
    yandex: 'yandex-verification-code',
    other: {
      'naver-site-verification': 'naver-verification-code',
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* iOS 상태바 설정 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Android 크롬 설정 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#9333ea" />
        
        {/* PWA 스플래시 스크린 */}
        <link rel="apple-touch-startup-image" href="/splash-screen.png" />
        
        {/* Critical CSS (선택사항) */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* 초기 로딩 시 레이아웃 시프트 방지 */
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
            .loading-spinner {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              z-index: 9999;
            }
            /* Sonner 타입별 스타일 */
            [data-sonner-toast][data-type="success"] {
              background-color: #f0fdf4 !important;
              border-color: #86efac !important;
              color: #166534 !important;
            }
            [data-sonner-toast][data-type="error"] {
              background-color: #fef2f2 !important;
              border-color: #fca5a5 !important;
              color: #991b1b !important;
            }
            [data-sonner-toast][data-type="info"] {
              background-color: #eff6ff !important;
              border-color: #93c5fd !important;
              color: #1e40af !important;
            }
            [data-sonner-toast][data-type="warning"] {
              background-color: #fefce8 !important;
              border-color: #fde047 !important;
              color: #854d0e !important;
            }
          `
        }} />
      </head>
      
      <body className={`${inter.className} antialiased`}>
        {/* 메인 콘텐츠 */}
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Sonner Toaster - 메인 알림 시스템 */}
        <Toaster 
          position="top-right"
          toastOptions={{
            // 공통 스타일
            style: {
              background: 'white',
              color: '#363636',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1rem',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              maxWidth: '420px',
            },
            className: 'sonner-toast',
            duration: 4000,
          }}
          // 추가 옵션
          richColors // 타입별 색상 자동 적용
          expand={false} // 자동 확장 비활성화
          visibleToasts={5} // 최대 5개 토스트 표시
          closeButton // 닫기 버튼 표시
          gap={12} // 토스트 간격
          theme="light" // 테마 설정
        />
        
        {/* React Hot Toast - 보조 알림 (필요시) */}
        <HotToaster
          position="bottom-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{
            bottom: 100,
          }}
          toastOptions={{
            // 기본 옵션
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            // 성공 스타일
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                background: '#10b981',
              },
            },
            // 에러 스타일
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: '#ef4444',
              },
            },
            // 로딩 스타일
            loading: {
              iconTheme: {
                primary: '#6366f1',
                secondary: '#fff',
              },
              style: {
                background: '#6366f1',
              },
            },
          }}
        />
        
        {/* 개발 환경 디버그 패널 (선택사항) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 z-50">
            <details className="bg-gray-900 text-white p-2 rounded-lg text-xs">
              <summary className="cursor-pointer">Debug</summary>
              <div className="mt-2 space-y-1">
                <div>Build: {process.env.NEXT_PUBLIC_BUILD_ID || 'dev'}</div>
                <div>Env: {process.env.NODE_ENV}</div>
                <div>API: {process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20)}...</div>
              </div>
            </details>
          </div>
        )}
      </body>
    </html>
  );
}
