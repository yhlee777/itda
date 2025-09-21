// app/api/notifications/mark-read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Worker용 API - Service Role Key 사용
export async function POST(req: NextRequest) {
  try {
    const { notificationId } = await req.json();
    
    // Service Role Key를 사용한 Admin 클라이언트
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
    
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Failed to mark as read:', error);
      return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}