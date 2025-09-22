// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const { pathname } = request.nextUrl;
  
  // 정적 파일 무시
  if (
    pathname.includes('_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return res;
  }

  // 대시보드 접근 시 추가 체크
  if (pathname === '/dashboard') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // 로그인 페이지로 리다이렉트
        return NextResponse.redirect(new URL('/login?redirect=/dashboard', request.url));
      }

      // 광고주 권한 체크
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (userData?.user_type !== 'advertiser') {
        // 인플루언서는 campaigns로
        return NextResponse.redirect(new URL('/campaigns', request.url));
      }

      // 광고주 승인 체크
      const { data: advertiserData } = await supabase
        .from('advertisers')
        .select('is_verified')
        .eq('id', session.user.id)
        .single();

      if (!advertiserData?.is_verified) {
        // 미승인 광고주
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }

      // 모든 체크 통과 - 대시보드 표시
      return res;
      
    } catch (error) {
      console.error('Middleware error:', error);
      return res;
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};