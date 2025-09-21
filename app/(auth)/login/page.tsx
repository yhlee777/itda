'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 임시 로그인 처리
    setTimeout(() => {
      // 사용자 타입에 따라 다른 페이지로 이동
      const userType = 'influencer'; // 임시값
      if (userType === 'influencer') {
        router.push('/campaigns');
      } else {
        router.push('/dashboard');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">ITDA</h1>
          <p className="text-gray-600">인플루언서와 브랜드를 잇다</p>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="tel"
              placeholder="전화번호 (010-0000-0000)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? '로그인 중...' : 'OTP 전송'}
          </button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <button className="w-full py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <span className="text-xl">📷</span>
            인스타그램으로 로그인
          </button>
          
          <button className="w-full py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <span className="text-xl">🔵</span>
            카카오로 로그인
          </button>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-purple-600 hover:underline font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
