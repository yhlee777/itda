'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { 
  Mail, Lock, User, Phone, Building2, Camera,
  Check, ArrowRight, Eye, EyeOff,
  Loader2, Instagram, Youtube, CheckCircle,
  AlertCircle, Sparkles
} from 'lucide-react';

// 카테고리 옵션
const CATEGORIES = [
  { id: 'fashion', label: '패션', icon: '👗' },
  { id: 'beauty', label: '뷰티', icon: '💄' },
  { id: 'food', label: '푸드', icon: '🍔' },
  { id: 'travel', label: '여행', icon: '✈️' },
  { id: 'lifestyle', label: '라이프스타일', icon: '🏠' },
  { id: 'fitness', label: '피트니스', icon: '💪' },
  { id: 'tech', label: '테크', icon: '💻' },
  { id: 'gaming', label: '게이밍', icon: '🎮' },
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // 상태 관리
  const [userType, setUserType] = useState<'influencer' | 'advertiser' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'influencer' || type === 'advertiser') {
      setUserType(type);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType
          }
        }
      });

      if (error) throw error;

      toast.success('회원가입 성공!');
      router.push(userType === 'influencer' ? '/campaigns' : '/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">ITDA 회원가입</h1>
          </div>

          {!userType ? (
            <div className="space-y-4">
              <button
                onClick={() => setUserType('influencer')}
                className="w-full p-4 border-2 rounded-xl hover:border-purple-500 transition"
              >
                <Camera className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="font-bold">인플루언서로 가입</p>
              </button>
              
              <button
                onClick={() => setUserType('advertiser')}
                className="w-full p-4 border-2 rounded-xl hover:border-purple-500 transition"
              >
                <Building2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="font-bold">광고주로 가입</p>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {isLoading ? '처리중...' : '가입하기'}
              </button>
            </form>
          )}

          <p className="text-center mt-6 text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-purple-600 font-semibold">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}