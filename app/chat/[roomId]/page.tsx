// app/chat/[roomId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import ChatRoom from '@/components/chat/ChatRoom';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [userType, setUserType] = useState<'influencer' | 'advertiser' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserId(user.id);
      
      // 사용자 타입 확인
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();
        
      if (userData) {
        setUserType(userData.user_type as 'influencer' | 'advertiser');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">채팅방을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!userId || !userType) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">사용자 정보를 확인할 수 없습니다.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatRoom
      roomId={params.roomId as string}
      currentUserId={userId}
      userType={userType}
      onBack={() => router.push('/chat')}
    />
  );
}