// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// 임시로 config를 여기에 정의 (실제로는 @/lib/auth/config에서 import)
const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  PENDING_APPROVAL: '/pending-approval',
};

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/signup', // /register로 리다이렉트
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms',
];

const PROTECTED_ROUTES = {
  influencer: [
    '/campaigns',
    '/applications',
    '/portfolio',
    '/profile',
  ],
  advertiser: [
    '/dashboard',
    '/create-campaign',
    '/analytics',
    '/manage-campaigns',
    '/find-influencers',
    '/campaigns-list',
    '/payments',
    '/billing',
  ],
  shared: [
    '/settings',
    '/notifications',
    '/chat',
  ],
};

export async function middleware(request: NextRequest) {
  // 응답 객체 생성
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
    return response;
  }

  // /signup → /register 리다이렉트
  if (pathname === '/signup') {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  // Supabase 클라이언트 생성
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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
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

  try {
    // 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error in middleware:', sessionError);
    }

    // 공개 경로 체크
    const isPublicPath = PUBLIC_ROUTES.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );

    // 로그인하지 않은 사용자
    if (!session) {
      // 보호된 경로 접근 시 로그인 페이지로
      if (!isPublicPath) {
        const redirectUrl = new URL(AUTH_ROUTES.LOGIN, request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        
        // 접근 시도한 경로 타입 표시
        if (PROTECTED_ROUTES.influencer.some(p => pathname.startsWith(p))) {
          redirectUrl.searchParams.set('type', 'influencer');
        } else if (PROTECTED_ROUTES.advertiser.some(p => pathname.startsWith(p))) {
          redirectUrl.searchParams.set('type', 'advertiser');
        }
        
        return NextResponse.redirect(redirectUrl);
      }
      return response;
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
      if (pathname !== AUTH_ROUTES.ONBOARDING && !isPublicPath) {
        return NextResponse.redirect(new URL(AUTH_ROUTES.ONBOARDING, request.url));
      }
      return response;
    }

    const userType = userData.user_type;

    // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시
    if (pathname === '/login' || pathname === '/register') {
      if (userType === 'advertiser') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (userType === 'influencer') {
        return NextResponse.redirect(new URL('/campaigns', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 온보딩 완료 확인
    if (pathname === AUTH_ROUTES.ONBOARDING) {
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
            return NextResponse.redirect(new URL(AUTH_ROUTES.PENDING_APPROVAL, request.url));
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
    const isInfluencerRoute = PROTECTED_ROUTES.influencer.some(path => 
      pathname.startsWith(path)
    );
    const isAdvertiserRoute = PROTECTED_ROUTES.advertiser.some(path => 
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
        if (pathname !== AUTH_ROUTES.PENDING_APPROVAL) {
          return NextResponse.redirect(new URL(AUTH_ROUTES.PENDING_APPROVAL, request.url));
        }
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // 헤더에 사용자 정보 추가
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);
    requestHeaders.set('x-user-type', userType || '');

    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};