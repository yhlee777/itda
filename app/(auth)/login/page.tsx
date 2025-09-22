// app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { 
  Mail, Lock, ArrowRight, Sparkles, 
  Building2, Camera, Loader2, Eye, EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // 이미 로그인되어 있는지 확인
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // 이미 로그인된 경우 리다이렉트
        const { data: userData } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', session.user.id)
          .single();

        if (userData?.user_type === 'advertiser') {
          router.push('/dashboard');
        } else if (userData?.user_type === 'influencer') {
          router.push('/campaigns');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      // 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || '로그인에 실패했습니다');
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        toast.error('로그인에 실패했습니다');
        setIsLoading(false);
        return;
      }

      console.log('로그인 성공:', data.user.id);

      // 사용자 타입 확인
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        console.log('사용자 정보가 없습니다. 온보딩으로 이동합니다.');
        toast('프로필을 완성해주세요', {
          icon: '📝',
          duration: 3000,
        });
        await router.push('/onboarding');
        return;
      }

      // 광고주인 경우
      if (userData.user_type === 'advertiser') {
        const { data: advertiserData } = await supabase
          .from('advertisers')
          .select('is_verified')
          .eq('id', data.user.id)
          .single();

        if (!advertiserData?.is_verified) {
          toast.error('관리자 승인을 기다리고 있습니다.\n승인 완료 시 이메일로 안내드립니다.');
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }
        
        toast.success('광고주 대시보드로 이동합니다');
        await router.push('/dashboard');
        
      } else if (userData.user_type === 'influencer') {
        toast.success('환영합니다! 캠페인을 둘러보세요');
        await router.push('/campaigns');
        
      } else {
        // user_type이 없는 경우
        toast('프로필을 완성해주세요', {
          icon: '📝',
          duration: 3000,
        });
        await router.push('/onboarding');
      }

    } catch (error: any) {
      console.error('Login process error:', error);
      toast.error('로그인 처리 중 오류가 발생했습니다');
    } finally {
      // 항상 로딩 상태 해제
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Social login error:', error);
        toast.error('소셜 로그인에 실패했습니다');
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      toast.error('소셜 로그인 처리 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽: 브랜딩 영역 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-12 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-white max-w-md"
        >
          <h1 className="text-6xl font-bold mb-6">ITDA</h1>
          <p className="text-2xl mb-4">인플루언서와 브랜드를 잇다</p>
          <div className="space-y-4 text-lg opacity-90">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6" />
              <span>10만+ 인플루언서 네트워크</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              <span>5천+ 검증된 브랜드</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <span>AI 기반 매칭 시스템</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            다시 만나서 반가워요!
          </h2>
          <p className="text-gray-600 mb-8">
            계정에 로그인하고 캠페인을 시작하세요
          </p>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                비밀번호 찾기
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  로그인
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="mt-4 w-full py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Google로 계속하기
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            아직 계정이 없으신가요?{' '}
            <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-700">
              회원가입
            </Link>
          </p>

          {/* 테스트 계정 정보 (개발용) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">테스트 계정:</p>
              <div className="space-y-1 text-xs text-gray-700">
                <div>광고주: advertiser@test.com / test1234</div>
                <div>인플루언서: influencer@test.com / test1234</div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}