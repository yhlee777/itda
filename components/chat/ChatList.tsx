'use client';

import { useUserType } from '@/lib/hooks/useUserType';
import { useRouter } from 'next/navigation';

export default function ChatList() {
  const { userType, loading } = useUserType();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  // 사용자 타입에 따라 다른 UI 렌더링
  if (userType === 'advertiser') {
    return <AdvertiserChatList />;
  } else if (userType === 'influencer') {
    return <InfluencerChatList />;
  }

  return null;
}

function AdvertiserChatList() {
  // 광고주용 채팅 목록 UI
  return (
    <div>
      <h1>광고주 채팅 목록</h1>
      {/* 광고주 전용 UI */}
    </div>
  );
}

function InfluencerChatList() {
  // 인플루언서용 채팅 목록 UI
  return (
    <div>
      <h1>인플루언서 채팅 목록</h1>
      {/* 인플루언서 전용 UI */}
    </div>
  );
}