// middleware.ts - 완전히 수정된 버전
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const { pathname } = request.nextUrl;
  
  // 정적 파일 및 API 경로 무시
  if (
    pathname.includes('_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return res;
  }
  
  // 공개 경로 정의
  const publicPaths = ['/', '/login', '/register', '/signup'];
  const isPublicPath = publicPaths.includes(pathname);
  
  // 세션 확인
  const { data: { session } } = await supabase.auth.getSession();
  
  console.log('Middleware Check:', {
    path: pathname,
    hasSession: !!session,
    isPublicPath
  });
  
  // 보호된 경로 접근 시 로그인 필요
  if (!session && !isPublicPath) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // 로그인 상태에서 인증 페이지 접근 시
  if (session && (pathname === '/login' || pathname === '/register')) {
    // 사용자 타입 확인
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
    
    if (userData?.user_type === 'advertiser') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (userData?.user_type === 'influencer') {
      return NextResponse.redirect(new URL('/campaigns', request.url));
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};