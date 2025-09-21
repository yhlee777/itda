// 1. utils/navigation.ts 수정
import { useRouter } from 'next/navigation';

export const useAppNavigation = () => {
  const router = useRouter();
  
  return {
    // 인증 관련 (signup → register로 변경!)
    goToLogin: () => router.push('/login'),
    goToSignup: () => router.push('/register'),  // ✅ /signup → /register
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