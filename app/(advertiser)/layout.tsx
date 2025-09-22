// app/(advertiser)/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  BarChart2, Plus, List, TrendingUp, CreditCard, 
  Settings, Menu, X, Bell, User,
  MessageCircle, Search, Users  // 새로 추가된 아이콘
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
    { href: '/find-influencers', label: '인플루언서 찾기', icon: Search },  // 새로 추가
    { href: '/create-campaign', label: '캠페인 생성', icon: Plus },
    { href: '/campaigns-list', label: '캠페인 관리', icon: List },
    { href: '/chat', label: '메시지', icon: MessageCircle, badge: 5 },  // 새로 추가
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                    pathname === item.href
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="absolute right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
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

      {/* 나머지 레이아웃 코드는 동일... */}
    </div>
  );
}