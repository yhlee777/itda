// hooks/useAuth.ts
// 타입 import 수정 및 전체 코드

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import type { User, Influencer, Advertiser } from '@/types/helpers'; // ✅ 수정된 import

// 인증 라우트 설정
const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  PENDING_APPROVAL: '/pending-approval',
  INFLUENCER_HOME: '/campaigns',
  ADVERTISER_HOME: '/dashboard',
  HOME: '/',
};

const AUTH_FLOW = {
  AFTER_SIGNUP: {
    influencer: '/onboarding',
    advertiser: '/onboarding',
  },
  AFTER_LOGIN: {
    influencer: '/campaigns',
    advertiser: '/dashboard',
    incomplete: '/onboarding',
    pending: '/pending-approval',
  },
  AFTER_LOGOUT: '/login',
};

const DEFAULT_ROUTES_BY_TYPE = {
  influencer: '/campaigns',
  advertiser: '/dashboard',
  admin: '/admin/dashboard',
} as const;

// 인증 상태 타입
interface AuthState {
  user: User | null;
  userType: 'influencer' | 'advertiser' | 'admin' | null;
  influencerProfile?: Influencer | null;
  advertiserProfile?: Advertiser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userType: null,
    influencerProfile: null,
    advertiserProfile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          userType: null,
          influencerProfile: null,
          advertiserProfile: null,
          isLoading: false,
          isAuthenticated: false,
        });
        router.push(AUTH_FLOW.AFTER_LOGOUT);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 인증 확인
  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setAuthState({
          user: null,
          userType: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // 사용자 정보 조회
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError || !userData) {
        console.error('User data error:', userError);
        setAuthState({
          user: null,
          userType: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // 사용자 타입별 프로필 조회
      let influencerProfile = null;
      let advertiserProfile = null;

      if (userData.user_type === 'influencer') {
        const { data: profile } = await supabase
          .from('influencers')
          .select('*')
          .eq('id', authUser.id)
          .single();
        influencerProfile = profile;
      } else if (userData.user_type === 'advertiser') {
        const { data: profile } = await supabase
          .from('advertisers')
          .select('*')
          .eq('id', authUser.id)
          .single();
        advertiserProfile = profile;
      }

      setAuthState({
        user: userData as User,
        userType: userData.user_type as 'influencer' | 'advertiser' | 'admin' | null,
        influencerProfile,
        advertiserProfile,
        isLoading: false,
        isAuthenticated: true,
      });

      // 프로필 미완성시 온보딩으로
      if (userData.user_type && !influencerProfile && !advertiserProfile) {
        if (window.location.pathname !== AUTH_ROUTES.ONBOARDING) {
          router.push(AUTH_ROUTES.ONBOARDING);
        }
      }

    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        user: null,
        userType: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  // 로그인
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      if (!userData?.user_type) {
        toast.error('사용자 정보를 찾을 수 없습니다');
        return;
      }

      const userType = userData.user_type as 'influencer' | 'advertiser';

      // 사용자 타입별 프로필 확인
      if (userType === 'influencer') {
        const { data: profile } = await supabase
          .from('influencers')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          toast.success('프로필을 완성해주세요');
          router.push(AUTH_FLOW.AFTER_LOGIN.incomplete);
        } else {
          toast.success('로그인 성공!');
          router.push(AUTH_FLOW.AFTER_LOGIN.influencer);
        }
      } else if (userType === 'advertiser') {
        const { data: profile } = await supabase
          .from('advertisers')
          .select('id, is_verified')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          toast.success('프로필을 완성해주세요');
          router.push(AUTH_FLOW.AFTER_LOGIN.incomplete);
        } else if (!profile.is_verified) {
          toast('승인 대기 중입니다');
          router.push(AUTH_FLOW.AFTER_LOGIN.pending);
        } else {
          toast.success('로그인 성공!');
          router.push(AUTH_FLOW.AFTER_LOGIN.advertiser);
        }
      }

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || '로그인에 실패했습니다');
      throw error;
    }
  };

  // 회원가입
  const register = async (
    email: string, 
    password: string, 
    userType: 'influencer' | 'advertiser'
  ) => {
    try {
      // 1. Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('회원가입 실패');

      // 2. Users 테이블에 추가
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          user_type: userType,
        });

      if (userError) throw userError;

      toast.success('회원가입 성공! 프로필을 완성해주세요');
      router.push(AUTH_FLOW.AFTER_SIGNUP[userType]);
      
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error.message || '회원가입에 실패했습니다');
      throw error;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      if (!window.confirm('정말 로그아웃 하시겠습니까?')) {
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.clear();
      sessionStorage.clear();

      setAuthState({
        user: null,
        userType: null,
        influencerProfile: null,
        advertiserProfile: null,
        isLoading: false,
        isAuthenticated: false,
      });

      toast.success('로그아웃되었습니다');
      router.push(AUTH_FLOW.AFTER_LOGOUT);
      
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('로그아웃 중 오류가 발생했습니다');
      throw error;
    }
  };

  // 홈으로 리다이렉트
  const redirectToHome = () => {
    if (!authState.userType) {
      router.push(AUTH_ROUTES.HOME);
      return;
    }
    router.push(DEFAULT_ROUTES_BY_TYPE[authState.userType]);
  };

  return {
    ...authState,
    login,
    register,
    logout,
    checkAuth,
    redirectToHome,
  };
}