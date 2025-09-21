// middleware.ts 전체 수정
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 공개 경로 (인증 없이 접근 가능)
  const publicPaths = ['/login', '/register', '/signup', '/', '/api'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // 정적 파일과 Next.js 내부 경로는 무시
  if (
    pathname.includes('_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') // 파일 확장자가 있는 경우 (이미지, CSS 등)
  ) {
    return NextResponse.next();
  }
  
  // ✅ Supabase 세션 체크 (쿠키 기반)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('Supabase 환경변수 없음');
    return NextResponse.next();
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // 쿠키에서 세션 확인
  const token = request.cookies.get('sb-dqltbpynoihcyvucofpe-auth-token');
  
  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Token exists:', !!token);
  console.log('Middleware - Is public path:', isPublicPath);
  
  // 보호된 경로인데 토큰이 없으면 로그인으로
  if (!isPublicPath && !token) {
    console.log('Middleware - 로그인 필요, /login으로 리다이렉트');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 로그인 상태에서 로그인/회원가입 페이지 접근 시 메인으로
  if (token && (pathname === '/login' || pathname === '/register' || pathname === '/signup')) {
    console.log('Middleware - 이미 로그인됨, 메인으로 리다이렉트');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};