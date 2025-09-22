// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/components/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ITDA - 인플루언서와 브랜드를 잇다',
  description: '인플루언서와 광고주를 연결하는 스마트 매칭 플랫폼',
  keywords: '인플루언서, 마케팅, 광고, 브랜드, 협업, 캠페인',
  authors: [{ name: 'ITDA Team' }],
  creator: 'ITDA',
  publisher: 'ITDA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'ITDA - 인플루언서와 브랜드를 잇다',
    description: '인플루언서와 광고주를 연결하는 스마트 매칭 플랫폼',
    url: '/',
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
    description: '인플루언서와 광고주를 연결하는 스마트 매칭 플랫폼',
    images: ['/og-image.png'],
    creator: '@itda_official',
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* PWA 메타 태그 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="ITDA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ITDA" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* 스플래시 스크린 이미지 (iOS) */}
        <link
          rel="apple-touch-startup-image"
          href="/splash-640x1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash-1242x2208.png"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
        />
        
        {/* 추가 SEO */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* 메인 컨텐츠 */}
        {children}
        
        {/* Toast 프로바이더 */}
        <ToastProvider />
        
        {/* 개발 환경 인디케이터 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 z-50">
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full opacity-50 hover:opacity-100 transition-opacity">
              DEV MODE
            </div>
          </div>
        )}
      </body>
    </html>
  );
}