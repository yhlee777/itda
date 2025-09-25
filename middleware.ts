// middleware.ts - Edge Runtime 호환 버전
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supabase 제거하고 간단한 로직만
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 정적 파일 무시
  if (pathname.includes('_next') || pathname.includes('/api/')) {
    return NextResponse.next();
  }

  // 공개 페이지 목록
  const publicPaths = ['/', '/login', '/register', '/onboarding'];
  
  // 공개 페이지는 통과
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // 쿠키에서 간단히 로그인 체크만
  const token = request.cookies.get('sb-access-token');
  
  if (!token) {
    // 로그인 안 했으면 로그인 페이지로
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};