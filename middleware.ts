// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';
import type { Database } from '@/types/database.types';

// 타입 정의
type UserType = 'influencer' | 'advertiser' | 'admin' | null;

interface UserData {
  user_type: UserType;
}

interface AdvertiserData {
  is_verified: boolean;
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient(request, res);
  
  const { pathname } = request.nextUrl;
  
  // 정적 파일 및 API 라우트 무시
  if (
    pathname.includes('_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return res;
  }

  // /signup을 /register로 리다이렉트
  if (pathname === '/signup') {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // 보호된 라우트 정의
    const protectedRoutes = ['/dashboard', '/campaigns', '/profile', '/create-campaign', '/applications'];
    const authRoutes = ['/login', '/register'];
    
    // 보호된 라우트 접근 시 로그인 체크
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      if (!session) {
        return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
      }
      
      // 사용자 타입 확인 - 타입 명시
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .single<UserData>();
      
      // 온보딩 미완료
      if (!userData?.user_type) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      
      // 광고주 전용 페이지 접근 제한
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/create-campaign')) {
        if (userData.user_type !== 'advertiser') {
          return NextResponse.redirect(new URL('/campaigns', request.url));
        }
        
        // 광고주 승인 확인 - 타입 명시
        const { data: advertiserData } = await supabase
          .from('advertisers')
          .select('is_verified')
          .eq('id', session.user.id)
          .single<AdvertiserData>();
        
        if (!advertiserData?.is_verified) {
          return NextResponse.redirect(new URL('/pending-approval', request.url));
        }
      }
      
      // 인플루언서 전용 페이지 접근 제한  
      if (pathname.startsWith('/campaigns') || pathname.startsWith('/applications')) {
        if (userData.user_type !== 'influencer') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
    
    // 이미 로그인한 사용자가 인증 페이지 접근 시
    if (authRoutes.some(route => pathname.startsWith(route)) && session) {
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .single<UserData>();
      
      if (userData?.user_type === 'advertiser') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (userData?.user_type === 'influencer') {
        return NextResponse.redirect(new URL('/campaigns', request.url));
      } else {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
    
  } catch (error) {
    console.error('Middleware error:', error);
  }
  
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};