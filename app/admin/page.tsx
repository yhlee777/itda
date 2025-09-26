'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [waitlistData, setWaitlistData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/waitlist');
        const data = await response.json();
        console.log('Admin - 받은 데이터:', data);
        setWaitlistData(data || []);
      } catch (error) {
        console.error('Error:', error);
        setWaitlistData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl text-white mb-8 font-bold">
          대기자 리스트 ({waitlistData.length}명)
        </h1>
        
        {/* 데이터 있는지 확인 */}
        {waitlistData.length > 0 ? (
          <div className="space-y-4">
            {waitlistData.map((item, index) => (
              <div key={item.id || index} className="bg-white/10 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                  <div>
                    <span className="text-purple-400 block text-sm">대기번호</span>
                    <span className="text-xl font-bold">#{item.waitingNumber || (index + 300)}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 block text-sm">인스타그램</span>
                    <span>@{item.instagram}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 block text-sm">팔로워</span>
                    <span>{item.followers}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 block text-sm">카테고리</span>
                    <span>{item.category}</span>
                  </div>
                </div>
                <div className="mt-4 text-white/60 text-sm">
                  <span>📧 {item.email}</span>
                  <span className="ml-4">📅 {new Date(item.createdAt).toLocaleString('ko-KR')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg p-12 text-center">
            <p className="text-white/60 text-lg">아직 대기자가 없습니다</p>
          </div>
        )}
        
        {/* 새로고침 버튼 */}
        <button
          onClick={() => window.location.reload()}
          className="fixed bottom-8 right-8 bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-purple-700"
        >
          새로고침
        </button>
      </div>
    </main>
  );
}