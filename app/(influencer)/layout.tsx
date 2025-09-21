'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function InfluencerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/campaigns', label: '캠페인', icon: '🎯' },
    { href: '/applications', label: '지원현황', icon: '📋' },
    { href: '/messages', label: '메시지', icon: '💬' },
    { href: '/profile', label: '프로필', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-purple-600">ITDA</h1>
            <div className="flex items-center gap-4">
              <button className="relative">
                <span className="text-2xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 컨텐츠 */}
      <main className="pb-20">
        {children}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around py-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                pathname === item.href
                  ? 'text-purple-600'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}