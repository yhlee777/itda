// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// 경로별 접근 권한 정의
const routePermissions = {
  // 인플루언서 전용 경로
  influencer: [
    '/campaigns',
    '/applications', 
    '/portfolio',
    '/chat',
    '/profile'
  ],
  // 광고주 전용 경로
  advertiser: [
    '/dashboard',
    '/create-campaign',
    '/analytics',
    '/manage-campaigns',
    '/billing'
  ],
  // 공개 경로
  public: [
    '/',
    '/login',
    '/register',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/privacy',
    '/terms'
  ],
  // 인증 필요 경로 (타입 무관)
  authenticated: [
    '/settings',
    '/notifications',
    '/onboarding'
  ]
};

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const { pathname } = request.nextUrl;
  
  // 정적 파일 및 API 경로는 무시
  if (
    pathname.includes('_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/')
  ) {
    return res;
  }

  try {
    // 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error in middleware:', sessionError);
    }

    // 공개 경로 체크
    const isPublicPath = routePermissions.public.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );

    // 로그인하지 않은 사용자
    if (!session) {
      // 보호된 경로 접근 시 로그인 페이지로
      if (!isPublicPath) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        
        // 접근 시도한 경로 타입 표시
        if (routePermissions.influencer.some(p => pathname.startsWith(p))) {
          redirectUrl.searchParams.set('type', 'influencer');
        } else if (routePermissions.advertiser.some(p => pathname.startsWith(p))) {
          redirectUrl.searchParams.set('type', 'advertiser');
        }
        
        return NextResponse.redirect(redirectUrl);
      }
      return res;
    }

    // 로그인한 사용자 처리
    const userId = session.user.id;
    
    // 사용자 타입 확인
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('User data error:', userError);
      
      // 온보딩이 필요한 경우
      if (pathname !== '/onboarding' && !isPublicPath) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      return res;
    }

    const userType = userData.user_type;

    // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시
    if (pathname === '/login' || pathname === '/register' || pathname === '/signup') {
      if (userType === 'advertiser') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (userType === 'influencer') {
        return NextResponse.redirect(new URL('/campaigns', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 온보딩 완료 확인
    if (pathname === '/onboarding') {
      // 이미 프로필이 있는지 확인
      if (userType === 'advertiser') {
        const { data: advertiserData } = await supabase
          .from('advertisers')
          .select('id, is_verified')
          .eq('id', userId)
          .single();

        if (advertiserData) {
          if (advertiserData.is_verified) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          } else {
            // 승인 대기 페이지로
            return NextResponse.redirect(new URL('/pending-approval', request.url));
          }
        }
      } else if (userType === 'influencer') {
        const { data: influencerData } = await supabase
          .from('influencers')
          .select('id')
          .eq('id', userId)
          .single();

        if (influencerData) {
          return NextResponse.redirect(new URL('/campaigns', request.url));
        }
      }
    }

    // 권한 체크
    const isInfluencerRoute = routePermissions.influencer.some(path => 
      pathname.startsWith(path)
    );
    const isAdvertiserRoute = routePermissions.advertiser.some(path => 
      pathname.startsWith(path)
    );

    // 인플루언서가 광고주 경로 접근 시
    if (userType === 'influencer' && isAdvertiserRoute) {
      return NextResponse.redirect(new URL('/campaigns', request.url));
    }

    // 광고주가 인플루언서 경로 접근 시
    if (userType === 'advertiser' && isInfluencerRoute) {
      // 광고주 승인 확인
      const { data: advertiserData } = await supabase
        .from('advertisers')
        .select('is_verified')
        .eq('id', userId)
        .single();

      if (!advertiserData?.is_verified) {
        // 미승인 광고주는 대기 페이지로
        if (pathname !== '/pending-approval') {
          return NextResponse.redirect(new URL('/pending-approval', request.url));
        }
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // 헤더에 사용자 정보 추가 (서버 컴포넌트에서 사용 가능)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);
    requestHeaders.set('x-user-type', userType || '');

    // 수정된 헤더로 응답 생성
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
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