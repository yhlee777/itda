// hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { AUTH_ROUTES, AUTH_FLOW, DEFAULT_ROUTES_BY_TYPE, UserType } from '@/lib/auth/config';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  userType: UserType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userType: UserType, additionalData?: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  redirectToHome: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const supabase = createClient();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userType: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // 초기 인증 체크
  useEffect(() => {
    checkAuth();
    
    // Auth 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          userType: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 인증 상태 확인
  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setAuthState({
          user: null,
          userType: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // 사용자 타입 확인
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      setAuthState({
        user: session.user,
        userType: userData?.user_type as UserType || null,
        isLoading: false,
        isAuthenticated: true,
      });
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
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('로그인에 실패했습니다');
      }

      // 사용자 정보 확인
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        // 프로필 미완성 - 온보딩으로
        toast('프로필을 완성해주세요', { icon: '📝' });
        router.push(AUTH_FLOW.AFTER_LOGIN.incomplete);
        return;
      }

      const userType = userData.user_type as UserType;

      // 광고주인 경우 승인 확인
      if (userType === 'advertiser') {
        const { data: advertiserData } = await supabase
          .from('advertisers')
          .select('is_verified')
          .eq('id', data.user.id)
          .single();

        if (!advertiserData?.is_verified) {
          toast('관리자 승인을 기다리고 있습니다', { icon: '⏳' });
          router.push(AUTH_FLOW.AFTER_LOGIN.pending);
          return;
        }
      }

      // 성공 - 홈으로 이동
      toast.success(`환영합니다! ${userType === 'advertiser' ? '대시보드' : '캠페인'}로 이동합니다`);
      router.push(DEFAULT_ROUTES_BY_TYPE[userType]);
      
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
    userType: UserType,
    additionalData?: any
  ) => {
    try {
      // Supabase Auth 회원가입
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            user_type: userType,
            ...additionalData,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('이미 가입된 이메일입니다');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('회원가입에 실패했습니다');
      }

      // users 테이블에 저장
      const { error: userError } = await supabase.from('users').insert({
        id: data.user.id,
        email: email.toLowerCase(),
        user_type: userType,
      });

      if (userError && !userError.message.includes('duplicate')) {
        console.error('User table error:', userError);
      }

      // 성공 - 온보딩으로 이동
      toast.success('회원가입이 완료되었습니다! 프로필을 완성해주세요');
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
      // 확인 다이얼로그
      if (!window.confirm('정말 로그아웃 하시겠습니까?')) {
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // 스토리지 정리
      localStorage.clear();
      sessionStorage.clear();

      // 상태 초기화
      setAuthState({
        user: null,
        userType: null,
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