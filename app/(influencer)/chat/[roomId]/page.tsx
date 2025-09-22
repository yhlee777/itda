// app/(influencer)/chat/[roomId]/page.tsx
'use client';

import RealtimeChatRoom from '@/components/chat/RealtimeChatRoom';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserId(user.id);
  };

  if (!userId) return <div>Loading...</div>;

  return (
    <RealtimeChatRoom
      roomId={params.roomId as string}
      currentUserId={userId}
      userType="influencer"
      onBack={() => router.back()}
    />
  );
}