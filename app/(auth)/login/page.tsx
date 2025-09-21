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

    console.log('로그인 성공, User ID:', data.user.id);

    // 사용자 타입 확인 (타입 캐스팅 사용)
    const { data: userData } = await (supabase
      .from('users')
      .select('user_type')
      .eq('id', data.user.id)
      .single()) as any;

    console.log('User Type 조회:', userData);

    // 광고주인 경우 승인 상태 확인
    if (userData?.user_type === 'advertiser') {
      console.log('광고주로 확인됨');
      
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
      
      console.log('광고주 대시보드로 이동');
      toast.success('광고주 대시보드로 이동합니다');
      
      // ✅ 수정: setTimeout으로 라우팅 지연
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      
    } else if (userData?.user_type === 'influencer') {
      console.log('인플루언서로 확인됨');
      toast.success('환영합니다! 캠페인을 둘러보세요');
      
      console.log('캠페인 페이지로 이동 시도');
      
      // ✅ 수정 1: setTimeout으로 라우팅 지연
      setTimeout(() => {
        router.push('/campaigns');
      }, 100);
      
      // ✅ 대안 2: router.replace 사용
      // router.replace('/campaigns');
      
      // ✅ 대안 3: window.location 사용 (강제 리로드)
      // window.location.href = '/campaigns';
      
    } else {
      console.log('온보딩으로 이동');
      setTimeout(() => {
        router.push('/onboarding');
      }, 100);
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
          <p className="text-2xl mb-4">
            인플루언서와 브랜드를 잇다
          </p>
          <div className="space-y-4 text-lg opacity-90">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6" />
              <span>10만+ 인플루언서 네트워크</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              <span>500+ 브랜드 파트너</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <span>AI 기반 완벽한 매칭</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ITDA
            </h1>
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            다시 만나서 반가워요!
          </h2>
          <p className="text-gray-600 mb-8">
            계정에 로그인하여 계속하세요
          </p>

          {/* 로그인 폼 */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">로그인 유지</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-purple-600 hover:underline">
                비밀번호 찾기
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  로그인 중...
                </>
              ) : (
                <>
                  로그인
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Google로 계속하기
            </button>
          </div>

          {/* 회원가입 링크 */}
          <div className="mt-8 text-center">
            <span className="text-gray-600">아직 계정이 없으신가요?</span>{' '}
            <Link href="/signup" className="text-purple-600 font-semibold hover:underline">
              회원가입
            </Link>
          </div>

          {/* 테스트 계정 정보 (개발용) */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
            <div className="font-semibold mb-2">🧪 테스트 계정</div>
            <div>광고주: advertiser@test.com / test1234</div>
            <div>인플루언서: influencer@test.com / test1234</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}