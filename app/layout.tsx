import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ITDA - 인플루언서 매칭 플랫폼',
  description: '틴더처럼 쉽게, 우버처럼 간편하게',
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