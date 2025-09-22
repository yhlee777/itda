// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ITDA - 인플루언서와 브랜드를 잇다',
  description: '인플루언서와 브랜드를 연결하는 AI 기반 매칭 플랫폼',
  keywords: ['인플루언서', '마케팅', '브랜드', '협업', 'SNS'],
  authors: [{ name: 'ITDA Team' }],
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
    ],
  },
  manifest: '/manifest.json',
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
    <html lang="ko">
      <body className={inter.className}>
        {children}
        
        {/* Sonner Toaster - 알림 시스템 */}
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
            },
            className: 'sonner-toast',
            duration: 4000,
          }}
          // 추가 옵션
          richColors // 타입별 색상 자동 적용
          expand={false} // 자동 확장 비활성화
          visibleToasts={5} // 최대 5개 토스트 표시
          closeButton // 닫기 버튼 표시
          pauseWhenPageIsHidden // 페이지가 숨겨지면 일시 정지
          gap={12} // 토스트 간격
          theme="light" // 테마 설정
        />
      </body>
    </html>
  );
}