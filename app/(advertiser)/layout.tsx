'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdvertiserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  const sidebarItems = [
    { href: '/dashboard', label: '대시보드', icon: '📊' },
    { href: '/create-campaign', label: '캠페인 생성', icon: '➕' },
    { href: '/campaigns-list', label: '캠페인 관리', icon: '📋' },
    { href: '/analytics', label: '분석', icon: '📈' },
    { href: '/payments', label: '정산', icon: '💳' },
    { href: '/settings', label: '설정', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 - 모바일에서는 하단 탭으로 변경 */}
      <aside className="hidden md:block w-64 bg-white border-r">
        <div className="h-full flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-purple-600 mb-8">ITDA Business</h1>
            <nav className="space-y-1">
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
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* 프로필 영역 */}
          <div className="mt-auto p-6 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                B
              </div>
              <div>
                <div className="font-medium">브랜드 매니저</div>
                <div className="text-sm text-gray-500">brand@company.com</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 모바일 헤더 */}
      <div className="flex-1">
        <header className="md:hidden bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold text-purple-600">ITDA Business</h1>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="pb-20 md:pb-0">
          {children}
        </main>

        {/* 모바일 하단 네비게이션 */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
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
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}