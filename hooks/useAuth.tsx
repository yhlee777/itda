// hooks/useAuth.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Supabase 클라이언트 생성
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Auth Context 타입
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: 'influencer' | 'advertiser') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Auth Context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

// Auth Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 초기 세션 확인
  useEffect(() => {
    checkUser();

    // Auth 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 현재 사용자 확인
  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  // 로그인
  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      setUser(data.user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // 회원가입
  async function signUp(email: string, password: string, userType: 'influencer' | 'advertiser') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
          },
        },
      });

      if (error) throw error;

      // 사용자 타입별 프로필 생성
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            user_type: userType,
          });

        if (profileError) throw profileError;

        // 타입별 추가 테이블 생성
        if (userType === 'influencer') {
          await supabase.from('influencers').insert({
            user_id: data.user.id,
            name: '',
            username: email.split('@')[0],
            status: 'pending',
          });
        } else {
          await supabase.from('advertisers').insert({
            user_id: data.user.id,
            company_name: '',
            is_verified: false,
          });
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // 로그아웃
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // 비밀번호 재설정
  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 사용자 타입 확인 훅
export function useUserType() {
  const { user } = useAuth();
  const [userType, setUserType] = useState<'influencer' | 'advertiser' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserType() {
      if (!user) {
        setUserType(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setUserType(data.user_type as 'influencer' | 'advertiser');
      } catch (error) {
        console.error('Error fetching user type:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserType();
  }, [user]);

  return { userType, loading };
}

// 인플루언서 프로필 훅
export function useInfluencerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('influencers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching influencer profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  return { profile, loading };
}

// 광고주 프로필 훅
export function useAdvertiserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('advertisers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching advertiser profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  return { profile, loading };
}