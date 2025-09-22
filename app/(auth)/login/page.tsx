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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // 보안을 위해 구체적인 에러 메시지를 노출하지 않음
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('User not found')) {
          toast.error('이메일 또는 비밀번호가 올바르지 않습니다');
        } else if (error.message.includes('Email link is invalid')) {
          toast.error('이메일 인증이 필요합니다. 이메일을 확인해주세요');
        } else if (error.message.includes('Too many requests')) {
          toast.error('너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요');
        } else {
          toast.error('로그인에 실패했습니다. 다시 시도해주세요');
        }
        
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
          toast('관리자 승인을 기다리고 있습니다.\n승인 완료 시 이메일로 안내드립니다.', {
            icon: '⏳',
            duration: 5000
          });
          await router.push('/pending-approval');
          return;
        }

        toast.success('광고주 대시보드로 이동합니다');
        await router.push('/dashboard');
      }
      // 인플루언서인 경우
      else if (userData.user_type === 'influencer') {
        toast.success('캠페인 탐색으로 이동합니다');
        await router.push('/campaigns');
      }
      // 타입이 설정되지 않은 경우
      else {
        toast('프로필을 완성해주세요', {
          icon: '📝',
        });
        await router.push('/onboarding');
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('로그인 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* 로고 */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900">ITDA</h1>
          <p className="text-gray-600 mt-2">인플루언서와 브랜드를 잇다</p>
        </div>

        {/* 로그인 폼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6">로그인</h2>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* 이메일 입력 */}
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

            {/* 비밀번호 입력 */}
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

            {/* 비밀번호 찾기 */}
            <div className="flex justify-end">
              <Link 
                href="/forgot-password" 
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  로그인 중...
                </>
              ) : (
                <>
                  로그인
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* 회원가입 섹션 */}
          <div className="text-center space-y-4">
            <p className="text-gray-600">아직 계정이 없으신가요?</p>
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/register?type=influencer"
                className="p-3 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <Camera className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <span className="text-sm font-medium">인플루언서로 시작</span>
              </Link>
              
              <Link
                href="/register?type=advertiser"
                className="p-3 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <Building2 className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <span className="text-sm font-medium">광고주로 시작</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 푸터 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>계속 진행하면 <Link href="/terms" className="text-purple-600 hover:underline">이용약관</Link> 및 <Link href="/privacy" className="text-purple-600 hover:underline">개인정보처리방침</Link>에 동의하는 것으로 간주됩니다.</p>
        </div>
      </motion.div>
    </div>
  );
}