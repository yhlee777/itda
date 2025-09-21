// app/api/notifications/route.ts
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

// GET: 알림 목록 조회
export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unread') === 'true';
    const type = searchParams.get('type');
    
    // 알림 쿼리 구성
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data: notifications, error } = await query;
    
    if (error) {
      console.error('Failed to fetch notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
    
    // 미읽음 카운트
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications?.length === limit
    });
    
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 새 알림 생성
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { type, title, message, metadata, targetUserId } = body;
    
    // 알림 생성
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId || user.id,
        type,
        title,
        message,
        metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create notification:', error);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
    
    // Push 알림 전송 (옵션)
    if (targetUserId) {
      await sendPushNotification(targetUserId, notification);
    }
    
    return NextResponse.json({ notification });
    
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Push 알림 전송 함수 (Service Role Key 사용)
async function sendPushNotification(userId: string, notification: any) {
  try {
    // Service Role Key를 사용한 Admin 클라이언트
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for user:', userId);
      return;
    }
    
    // Web Push 설정 및 전송
    try {
      const webpush = await import('web-push');
      
      // VAPID 키 설정
      webpush.default.setVapidDetails(
        process.env.NEXT_PUBLIC_VAPID_SUBJECT!,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
      );
      
      // 각 구독에 Push 전송
      const pushPromises = subscriptions.map(sub => {
        return webpush.default.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys
          },
          JSON.stringify({
            title: notification.title,
            body: notification.message,
            icon: notification.image_url || '/icon-192.png',
            badge: '/badge-72.png',
            data: {
              notificationId: notification.id,
              url: notification.action_url,
              type: notification.type
            }
          })
        ).catch((err: any) => {
          console.error('Push failed for subscription:', err);
          
          // 410 Gone - 구독 제거
          if (err.statusCode === 410) {
            return supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
        });
      });
      
      await Promise.all(pushPromises);
    } catch (error) {
      console.error('Web push import or send error:', error);
    }
    
  } catch (error) {
    console.error('Send push notification error:', error);
  }
}