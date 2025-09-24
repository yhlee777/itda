"use client";
// app/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowLeft, Home, MessageCircle } from 'lucide-react';
import InfluencerChatView from '@/components/chat/InfluencerChatView';
import AdvertiserChatView from '@/components/chat/AdvertiserChatView';

export default function UnifiedChatPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userType, setUserType] = useState<'influencer' | 'advertiser' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserType();
  }, []);

  const checkUserType = async () => {
    try {
      // 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);

      // 사용자 타입 확인
      const { data: userData, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        console.error('사용자 정보 조회 실패:', error);
        router.push('/onboarding');
        return;
      }

      setUserType(userData.user_type as 'influencer' | 'advertiser');
    } catch (error) {
      console.error('인증 확인 오류:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (userType === 'influencer') {
      router.push('/campaigns'); // 인플루언서는 캠페인 페이지로
    } else if (userType === 'advertiser') {
      router.push('/dashboard'); // 광고주는 대시보드로
    } else {
      router.push('/'); // 기본 홈으로
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">메시지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 사용자 타입이 없는 경우
  if (!userType || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">사용자 정보를 확인할 수 없습니다.</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            프로필 완성하기
          </button>
        </div>
      </div>
    );
  }

  // 사용자 타입에 따라 다른 뷰 렌더링 (헤더 포함)
  return (
    <div className="h-screen flex flex-col">
      {/* 상단 네비게이션 바 */}
      <header className="bg-white border-b z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* 뒤로가기 버튼 */}
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            {/* 페이지 제목 */}
            <h1 className="text-lg font-semibold text-gray-900">
              메시지
            </h1>
          </div>

          {/* 홈 버튼 */}
          <button
            onClick={() => router.push(userType === 'advertiser' ? '/dashboard' : '/campaigns')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="홈으로"
          >
            <Home className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* 채팅 뷰 (헤더 높이만큼 조정) */}
      <div className="flex-1 overflow-hidden">
        {userType === 'influencer' ? (
          <InfluencerChatView userId={userId} />
        ) : (
          <AdvertiserChatView userId={userId} />
        )}
      </div>
    </div>
  );
}