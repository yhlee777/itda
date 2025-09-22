import { createClient } from '@/lib/supabase/client';

export async function getChatRoute(roomId?: string): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return '/login';

  // 사용자 타입 확인
  const { data: userData } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', user.id)
    .single();

  if (!userData) return '/login';

  // 사용자 타입에 따른 라우팅
  if (userData.user_type === 'advertiser') {
    return roomId ? `/chat/${roomId}` : '/chat';
  } else if (userData.user_type === 'influencer') {
    return roomId ? `/chat/${roomId}` : '/chat';
  }

  return '/';
}