import { useRouter } from 'next/navigation';

export const useAppNavigation = () => {
  const router = useRouter();
  
  return {
    // 인증 관련
    goToLogin: () => router.push('/login'),
    goToSignup: () => router.push('/signup'),
    goToOnboarding: () => router.push('/onboarding'),
    
    // 인플루언서
    goToCampaigns: () => router.push('/campaigns'),
    goToApplications: () => router.push('/applications'),
    goToProfile: () => router.push('/profile'),
    
    // 광고주
    goToDashboard: () => router.push('/dashboard'),
    goToCreateCampaign: () => router.push('/create-campaign'),
    goToAnalytics: () => router.push('/analytics'),
  };
};

// ============================================
// middleware.ts - 인증 체크 미들웨어
// ============================================
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 공개 경로
  const publicPaths = ['/login', '/signup', '/'];
  const isPublicPath = publicPaths.includes(pathname);
  
  // 토큰 체크 (실제로는 쿠키나 헤더에서)
  const token = request.cookies.get('session')?.value;
  
  // 미인증 상태에서 보호된 경로 접근시
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 인증 상태에서 로그인 페이지 접근시
  if (isPublicPath && token && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};