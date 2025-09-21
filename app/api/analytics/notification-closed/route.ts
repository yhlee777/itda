// app/api/analytics/notification-closed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST: 알림 닫기 이벤트 분석
export async function POST(req: NextRequest) {
  try {
    const { notificationId, timestamp } = await req.json();
    
    // Service Role Key를 사용한 Admin 클라이언트 (분석용)
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
    
    // 알림 로그 기록
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        notification_id: notificationId,
        event_type: 'dismissed',
        metadata: { timestamp },
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Failed to log analytics:', error);
      // 분석 실패는 조용히 처리 (사용자 경험에 영향 없음)
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Analytics error:', error);
    // 분석 오류는 200 OK 반환 (사용자에게 영향 없음)
    return NextResponse.json({ success: true });
  }
}