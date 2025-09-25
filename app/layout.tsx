// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'  // ← 이거 있어야 함!!

export const metadata: Metadata = {
  title: 'ITDA - 스와이프로 끝내는 인플루언서 마케팅',
  description: '틴더처럼 쉬운 인플루언서 마케팅 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}