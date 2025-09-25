import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ITDA - 스와이프로 끝내는 인플루언서 마케팅',
  description: '틴더처럼 쉬운 인플루언서 마케팅 플랫폼',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // 아이폰 노치 대응
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="overflow-x-hidden">{children}</body>
    </html>
  )
}