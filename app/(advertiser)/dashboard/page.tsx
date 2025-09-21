'use client';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">캠페인 대시보드</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-3xl mb-2">👁️</div>
            <div className="text-2xl font-bold">1.2M</div>
            <div className="text-sm text-gray-500">노출수</div>
            <div className="text-sm text-green-600 mt-2">+12.5%</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-3xl mb-2">💬</div>
            <div className="text-2xl font-bold">89.2K</div>
            <div className="text-sm text-gray-500">참여</div>
            <div className="text-sm text-green-600 mt-2">+8.2%</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold">3,421</div>
            <div className="text-sm text-gray-500">전환</div>
            <div className="text-sm text-green-600 mt-2">+23.1%</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold">342%</div>
            <div className="text-sm text-gray-500">ROI</div>
            <div className="text-sm text-green-600 mt-2">+45.2%</div>
          </div>
        </div>
        
        <div className="bg-black text-white rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">실시간 캠페인 현황</h2>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>3명의 인플루언서가 콘텐츠를 제작 중입니다</span>
          </div>
        </div>
      </div>
    </div>
  );
}
