// app/(auth)/login/page.tsx - 수정된 버전
'use client';

import { useState } from 'react';
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

      console.log('로그인 성공:', data.user.id);

      // 사용자 타입 확인
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('사용자 타입 조회 실패:', userError);
        // 사용자 정보가 없으면 온보딩으로
        router.replace('/onboarding');
        return;
      }

      // 광고주인 경우
      if (userData?.user_type === 'advertiser') {
        const { data: advertiserData } = await supabase
          .from('advertisers')
          .select('is_verified')
          .eq('id', data.user.id)
          .single();

        if (!advertiserData?.is_verified) {
          toast.error('관리자 승인 대기 중입니다.');
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }
        
        toast.success('광고주 대시보드로 이동합니다');
        router.replace('/dashboard');
        
      } else if (userData?.user_type === 'influencer') {
        toast.success('환영합니다! 캠페인을 둘러보세요');
        router.replace('/campaigns');
        
      } else {
        router.replace('/onboarding');
      }
    } catch (error: any) {
      toast.error(error.message || '로그인 실패');
      console.error('Login error:', error);
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
        }
      });
      if (error) throw error;
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="your@email.com"
                  required
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              className="mt-4 w-full py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Google로 계속하기
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            아직 계정이 없으신가요?{' '}
            <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-700">
              회원가입
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}