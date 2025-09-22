// app/(influencer)/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Search, PlusCircle, Bell, User, 
  MessageCircle, Trophy, Briefcase
} from 'lucide-react';

export default function InfluencerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  // 메인 네비게이션 아이템 (포트폴리오 제거)
  const navItems = [
    { 
      href: '/campaigns', 
      label: '홈', 
      icon: Home,
      iconActive: Home 
    },
    { 
      href: '/applications', 
      label: '지원현황', 
      icon: Briefcase,
      iconActive: Briefcase
    },
    { 
      href: '/messages', 
      label: '메시지', 
      icon: MessageCircle,
      iconActive: MessageCircle,
      badge: 3 // 읽지 않은 메시지 수
    },
    { 
      href: '/profile', 
      label: '프로필', 
      icon: User,
      iconActive: User
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/campaigns">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ITDA
              </h1>
            </Link>
            <div className="flex items-center gap-3">
              {/* 검색 버튼 */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* 알림 버튼 */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 - 하단 네비게이션 높이만큼 패딩 추가 */}
      <main className="pb-20">
        {children}
      </main>

      {/* 하단 네비게이션 - iOS 스타일 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="relative">
          {/* iOS 안전 영역 대응 */}
          <div className="absolute inset-0 bg-white" />
          
          <div className="relative flex justify-around items-center py-2 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = isActive ? item.iconActive : item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center gap-1 px-3 py-2 transition-all ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                >
                  {/* 아이콘 컨테이너 */}
                  <div className="relative">
                    <Icon 
                      className={`w-6 h-6 transition-colors ${
                        isActive 
                          ? 'text-purple-600' 
                          : 'text-gray-500'
                      }`}
                      fill={isActive ? 'currentColor' : 'none'}
                      strokeWidth={isActive ? 0 : 2}
                    />
                    
                    {/* 배지 (메시지 등) */}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  
                  {/* 라벨 */}
                  <span 
                    className={`text-[11px] font-medium transition-colors ${
                      isActive 
                        ? 'text-purple-600' 
                        : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                  
                  {/* Active 인디케이터 (점) */}
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-purple-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* iOS 하단 안전 영역 */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </nav>
    </div>
  );
}