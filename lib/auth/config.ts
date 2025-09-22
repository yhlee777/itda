// lib/auth/config.ts
// 인증 관련 라우팅 및 플로우 통합 설정

export const AUTH_ROUTES = {
  // 인증 페이지
  LOGIN: '/login',
  REGISTER: '/register',  // /signup 대신 /register로 통일
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // 온보딩
  ONBOARDING: '/onboarding',
  PENDING_APPROVAL: '/pending-approval',
  
  // 메인 페이지 (사용자 타입별)
  INFLUENCER_HOME: '/campaigns',
  ADVERTISER_HOME: '/dashboard',
  
  // 공개 페이지
  HOME: '/',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

// 사용자 타입별 기본 경로
export const DEFAULT_ROUTES_BY_TYPE = {
  influencer: AUTH_ROUTES.INFLUENCER_HOME,
  advertiser: AUTH_ROUTES.ADVERTISER_HOME,
  admin: '/admin/dashboard',
} as const;

// 보호된 경로 (로그인 필요)
export const PROTECTED_ROUTES = {
  influencer: [
    '/campaigns',
    '/applications',
    '/portfolio',
    '/profile',
    '/chat',
  ],
  advertiser: [
    '/dashboard',
    '/create-campaign',
    '/analytics',
    '/manage-campaigns',
    '/billing',
    '/find-influencers',
    '/campaigns-list',
    '/payments',
    '/settings',
  ],
  admin: [
    '/admin/dashboard',
    '/admin/users',
    '/admin/campaigns',
  ],
  shared: [
    '/settings',
    '/notifications',
  ],
} as const;

// 공개 경로 (로그인 불필요)
export const PUBLIC_ROUTES = [
  AUTH_ROUTES.HOME,
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
  AUTH_ROUTES.PRIVACY,
  AUTH_ROUTES.TERMS,
] as const;

// 인증 플로우 설정
export const AUTH_FLOW = {
  // 회원가입 후 플로우
  AFTER_SIGNUP: {
    influencer: AUTH_ROUTES.ONBOARDING,  // 온보딩으로
    advertiser: AUTH_ROUTES.ONBOARDING,  // 온보딩으로
  },
  
  // 로그인 후 플로우
  AFTER_LOGIN: {
    influencer: AUTH_ROUTES.INFLUENCER_HOME,
    advertiser: AUTH_ROUTES.ADVERTISER_HOME,
    incomplete: AUTH_ROUTES.ONBOARDING,  // 프로필 미완성 시
    pending: AUTH_ROUTES.PENDING_APPROVAL,  // 승인 대기 중
  },
  
  // 로그아웃 후
  AFTER_LOGOUT: AUTH_ROUTES.LOGIN,
} as const;

// 타입 정의
export type UserType = 'influencer' | 'advertiser' | 'admin';
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
export type ProtectedRoute = typeof PROTECTED_ROUTES[keyof typeof PROTECTED_ROUTES][number];