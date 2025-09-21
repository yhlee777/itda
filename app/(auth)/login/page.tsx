// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  Mail, Lock, ArrowRight, Sparkles, 
  Building2, Camera, Loader2, Eye, EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 이메일 로그인 (타입 캐스팅으로 해결)
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('로그인 실패');

      // 사용자 타입 확인 (타입 캐스팅 사용)
      const { data: userData } = await (supabase
        .from('users')
        .select('user_type')
        .eq('id', data.user.id)
        .single()) as any;

      // 광고주인 경우 승인 상태 확인 (타입 캐스팅 사용)
      if (userData?.user_type === 'advertiser') {
        const { data: advertiserData } = await (supabase
          .from('advertisers')
          .select('is_verified')
          .eq('id', data.user.id)
          .single()) as any;

        if (!advertiserData?.is_verified) {
          toast.error('관리자 승인 대기 중입니다.');
          await supabase.auth.signOut();
          return;
        }
        
        router.push('/dashboard');
        toast.success('광고주 대시보드로 이동합니다');
      } else if (userData?.user_type === 'influencer') {
        router.push('/campaigns');
        toast.success('환영합니다! 캠페인을 둘러보세요');
      } else {
        router.push('/onboarding');
      }
    } catch (error: any) {
      toast.error(error.message || '로그인 실패');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 로그인
  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    try {
      setIsLoading(true);
      // Google OAuth는 Supabase가 지원하지만, 카카오/네이버는 커스텀 구현 필요
      if (provider === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
      } else {
        toast.error(`${provider} 로그인은 준비 중입니다`);
      }
    } catch (error: any) {
      toast.error('소셜 로그인 실패');
      console.error('Social login error:', error);
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
          <p className="text-2xl mb-8">
            인플루언서와 브랜드를<br />잇는 가장 쉬운 방법
          </p>
          
          <div className="space-y-6">
            <motion.div 
              className="flex items-start gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/20 p-3 rounded-full backdrop-blur">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">52,000+ 인플루언서</h3>
                <p className="text-white/80">검증된 인플루언서들이 활동 중</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-start gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white/20 p-3 rounded-full backdrop-blur">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">1,200+ 브랜드</h3>
                <p className="text-white/80">다양한 브랜드와 협업 기회</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-start gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-white/20 p-3 rounded-full backdrop-blur">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI 매칭 시스템</h3>
                <p className="text-white/80">96% 매칭 성공률</p>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold">285%</div>
              <div className="text-sm text-white/70">평균 ROI</div>
            </div>
            <div>
              <div className="text-3xl font-bold">48시간</div>
              <div className="text-sm text-white/70">평균 매칭</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9/5</div>
              <div className="text-sm text-white/70">만족도</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              다시 만나서 반가워요!
            </h2>
            <p className="text-gray-600 mb-8">
              계정에 로그인하세요
            </p>

            {/* 소셜 로그인 버튼 */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </button>

              <button
                onClick={() => handleSocialLogin('kakao')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M12 3c-5.52 0-10 3.64-10 8.13 0 2.91 1.89 5.46 4.73 6.89l-.78 2.85a.5.5 0 0 0 .74.55l3.18-2.1c.36.03.73.05 1.13.05 5.52 0 10-3.64 10-8.12C22 6.64 17.52 3 12 3z"/>
                </svg>
                카카오로 계속하기
              </button>

              <button
                onClick={() => handleSocialLogin('naver')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span className="font-bold text-xl">N</span>
                네이버로 계속하기
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* 이메일 로그인 폼 */}
            <form onSubmit={handleEmailLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="비밀번호 입력"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">로그인 상태 유지</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                  비밀번호 찾기
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" />
                    로그인 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    로그인
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </span>
                )}
              </button>
            </form>

            <p className="text-center text-gray-600 mt-6">
              아직 계정이 없으신가요?{' '}
              <Link href="/register" className="text-purple-600 font-semibold hover:text-purple-700">
                회원가입
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}