// utils/navigation.ts
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES, DEFAULT_ROUTES_BY_TYPE, UserType } from '@/lib/auth/config';

export const useAppNavigation = () => {
  const router = useRouter();
  
  return {
    // 인증 관련
    goToLogin: () => router.push(AUTH_ROUTES.LOGIN),
    goToRegister: () => router.push(AUTH_ROUTES.REGISTER),  // signup 대신 register
    goToForgotPassword: () => router.push(AUTH_ROUTES.FORGOT_PASSWORD),
    goToOnboarding: () => router.push(AUTH_ROUTES.ONBOARDING),
    goToPendingApproval: () => router.push(AUTH_ROUTES.PENDING_APPROVAL),
    
    // 사용자 타입별 홈
    goToUserHome: (userType: UserType) => {
      router.push(DEFAULT_ROUTES_BY_TYPE[userType]);
    },
    
    // 인플루언서 페이지
    goToCampaigns: () => router.push('/campaigns'),
    goToApplications: () => router.push('/applications'),
    goToPortfolio: () => router.push('/portfolio'),
    goToInfluencerProfile: () => router.push('/profile'),
    
    // 광고주 페이지
    goToDashboard: () => router.push('/dashboard'),
    goToCreateCampaign: () => router.push('/create-campaign'),
    goToAnalytics: () => router.push('/analytics'),
    goToManageCampaigns: () => router.push('/manage-campaigns'),
    goToFindInfluencers: () => router.push('/find-influencers'),
    
    // 공통 페이지
    goToSettings: () => router.push('/settings'),
    goToNotifications: () => router.push('/notifications'),
    goToChat: () => router.push('/chat'),
    goHome: () => router.push(AUTH_ROUTES.HOME),
    
    // 뒤로가기
    goBack: () => router.back(),
  };
};

// 조건부 네비게이션 헬퍼
export const navigateByUserType = (
  router: ReturnType<typeof useRouter>,
  userType: UserType | null
) => {
  if (!userType) {
    router.push(AUTH_ROUTES.LOGIN);
    return;
  }
  
  router.push(DEFAULT_ROUTES_BY_TYPE[userType]);
};

// 로그인 후 리다이렉트 URL 생성
export const createLoginRedirectUrl = (targetPath: string): string => {
  const url = new URL(AUTH_ROUTES.LOGIN, window.location.origin);
  url.searchParams.set('redirect', targetPath);
  return url.toString();
};