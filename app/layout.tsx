import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

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
          `
        }} />
      </head>
      
      <body className={`${inter.className} antialiased`}>
        {/* 메인 콘텐츠 */}
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* React Hot Toast - 통일된 알림 시스템 */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={12}
          containerStyle={{
            top: 20,
            right: 20,
          }}
          toastOptions={{
            // 기본 옵션
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#363636',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              border: '1px solid #e5e7eb',
              maxWidth: '420px',
            },
            // 성공 스타일
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #86efac',
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
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fca5a5',
              },
            },
            // 로딩 스타일
            loading: {
              iconTheme: {
                primary: '#6366f1',
                secondary: '#fff',
              },
              style: {
                background: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #93c5fd',
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