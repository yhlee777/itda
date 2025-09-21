// app/api/notifications/preferences/route.ts
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

// GET: 알림 설정 조회
export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 설정 조회
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // 데이터가 없는 경우가 아닌 다른 오류
      console.error('Failed to fetch preferences:', error);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }
    
    // 기본 설정 반환
    if (!preferences) {
      return NextResponse.json({
        user_id: user.id,
        channels: {
          push: true,
          email: true,
          sms: false,
          inApp: true
        },
        types: {},
        quiet_hours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'Asia/Seoul'
        },
        grouping: {
          enabled: true,
          interval: 30
        }
      });
    }
    
    return NextResponse.json(preferences);
    
  } catch (error) {
    console.error('Preferences API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 알림 설정 저장
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // 설정 저장 (upsert)
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...body,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to save preferences:', error);
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }
    
    return NextResponse.json(preferences);
    
  } catch (error) {
    console.error('Save preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}