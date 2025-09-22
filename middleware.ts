// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // 정적 파일, API 경로는 무시
  if (
    pathname.includes('_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/sounds') ||
    pathname.startsWith('/images')
  ) {
    return response;
  }

  // 세션 체크 (새로고침 방지)
  const { data: { session } } = await supabase.auth.getSession();

  // 보호된 경로 정의
  const protectedPaths = ['/dashboard', '/campaigns', '/create-campaign', '/profile'];
  const authPaths = ['/login', '/signup', '/onboarding'];
  
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // 로그인하지 않은 상태에서 보호된 경로 접근 시
  if (isProtectedPath && !session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 로그인한 상태에서 로그인/회원가입 페이지 접근 시
  if (isAuthPath && session) {
    // 사용자 타입 확인
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', session.user.id)
      .single();

    if (userData) {
      const redirectUrl = request.nextUrl.clone();
      
      if (userData.user_type === 'advertiser') {
        // 광고주 승인 상태 확인
        const { data: advertiserData } = await supabase
          .from('advertisers')
          .select('is_verified')
          .eq('id', session.user.id)
          .single();

        if (!advertiserData?.is_verified) {
          redirectUrl.pathname = '/pending-approval';
        } else {
          redirectUrl.pathname = '/dashboard';
        }
      } else if (userData.user_type === 'influencer') {
        redirectUrl.pathname = '/campaigns';
      } else {
        redirectUrl.pathname = '/onboarding';
      }
      
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 특정 경로별 권한 체크
  if (pathname === '/dashboard' && session) {
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', session.user.id)
      .single();

    // 인플루언서가 대시보드 접근 시 campaigns로 리다이렉트
    if (userData?.user_type === 'influencer') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/campaigns';
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (pathname === '/campaigns' && session) {
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', session.user.id)
      .single();

    // 광고주가 campaigns 접근 시 dashboard로 리다이렉트
    if (userData?.user_type === 'advertiser') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};