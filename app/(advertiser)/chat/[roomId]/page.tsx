// app/(advertiser)/chat/[roomId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ChatRoom from '@/components/chat/ChatRoom';

export default function AdvertiserChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserId(user.id);
  };

  if (!userId) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>;
  }

  return (
    <ChatRoom
      roomId={params.roomId as string}
      currentUserId={userId}
      userType="advertiser"
      onBack={() => router.push('/chat')}
    />
  );
}