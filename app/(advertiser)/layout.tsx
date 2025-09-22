// app/(advertiser)/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  BarChart2, Plus, List, TrendingUp, CreditCard, 
  Settings, Menu, X, Bell, User 
} from 'lucide-react';

export default function AdvertiserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { href: '/dashboard', label: '대시보드', icon: BarChart2 },
    { href: '/create-campaign', label: '캠페인 생성', icon: Plus },
    { href: '/campaigns-list', label: '캠페인 관리', icon: List },
    { href: '/analytics', label: '분석', icon: TrendingUp },
    { href: '/payments', label: '정산', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 데스크톱 사이드바 */}
      <aside className="hidden md:block w-64 bg-white border-r">
        <div className="h-full flex flex-col">
          {/* 로고 */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-purple-600">ITDA Business</h1>
          </div>

          {/* 메인 네비게이션 */}
          <nav className="flex-1 p-6">
            <div className="space-y-1">
              {sidebarItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* 설정 메뉴 - 하단 분리 */}
            <div className="mt-8 pt-8 border-t">
              <Link
                href="/settings"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === '/settings'
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">설정</span>
              </Link>
            </div>
          </nav>
          
          {/* 프로필 영역 */}
          <div className="p-6 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                B
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">브랜드 매니저</div>
                <div className="text-xs text-gray-500">advertiser@test.com</div>
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 모바일 레이아웃 */}
      <div className="flex-1 flex flex-col">
        {/* 모바일 헤더 */}
        <header className="md:hidden bg-white border-b sticky top-0 z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-purple-600">ITDA Business</h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* 모바일 메뉴 오버레이 */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-purple-600">ITDA Business</h1>
              </div>
              <nav className="p-6">
                <div className="space-y-1">
                  {sidebarItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        pathname === item.href
                          ? 'bg-purple-100 text-purple-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                  
                  {/* 모바일 설정 메뉴 */}
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        pathname === '/settings'
                          ? 'bg-purple-100 text-purple-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">설정</span>
                    </Link>
                  </div>
                </div>
              </nav>

              {/* 모바일 프로필 */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    B
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">브랜드 매니저</div>
                    <div className="text-xs text-gray-500">advertiser@test.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* 모바일 하단 네비게이션 */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30">
          <div className="flex justify-around py-2">
            {sidebarItems.slice(0, 4).map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  pathname === item.href
                    ? 'text-purple-600'
                    : 'text-gray-500'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
            {/* 모바일 하단에 설정 추가 */}
            <Link
              href="/settings"
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                pathname === '/settings'
                  ? 'text-purple-600'
                  : 'text-gray-500'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">설정</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}