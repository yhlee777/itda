// app/api/notifications/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Supabase 서버 클라이언트 생성
function createSupabaseServerClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        }
      }
    }
  );
}

// POST: 알림 동기화
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 최근 알림 가져오기
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Failed to sync notifications:', error);
      return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
    }
    
    // 미읽음 카운트
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    return NextResponse.json({ 
      success: true,
      notifications,
      unreadCount: unreadCount || 0,
      syncedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Sync notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}