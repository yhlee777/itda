'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type');
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    userType: userType || 'influencer'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 로그인/회원가입 로직
    localStorage.setItem('userType', formData.userType);
    router.push('/onboarding');
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-8">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <Link href="/" className="block text-center mb-12">
          <h1 className="text-3xl font-light text-white">itda</h1>
        </Link>

        {/* 로그인/회원가입 토글 */}
        <div className="flex mb-8 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md transition ${
              isLogin ? 'bg-white text-black' : 'text-white/60'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md transition ${
              !isLogin ? 'bg-white text-black' : 'text-white/60'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 유저 타입 선택 (회원가입일 때만) */}
        {!isLogin && (
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({...formData, userType: 'influencer'})}
                className={`py-3 rounded-lg border transition ${
                  formData.userType === 'influencer' 
                    ? 'border-purple-500 bg-purple-500/20 text-white' 
                    : 'border-white/20 text-white/60'
                }`}
              >
                인플루언서
              </button>
              <button
                onClick={() => setFormData({...formData, userType: 'brand'})}
                className={`py-3 rounded-lg border transition ${
                  formData.userType === 'brand' 
                    ? 'border-purple-500 bg-purple-500/20 text-white' 
                    : 'border-white/20 text-white/60'
                }`}
              >
                광고주
              </button>
            </div>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="이름"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 outline-none focus:bg-white/20 transition"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="이메일"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 outline-none focus:bg-white/20 transition"
            required
          />
          
          <input
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 outline-none focus:bg-white/20 transition"
            required
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-600/25 transition-all"
          >
            {isLogin ? '로그인' : '시작하기'}
          </motion.button>
        </form>

        {/* 소셜 로그인 */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-white/40">또는</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="py-2 border border-white/20 rounded-lg text-white/60 hover:bg-white/5 transition">
              Google
            </button>
            <button className="py-2 border border-white/20 rounded-lg text-white/60 hover:bg-white/5 transition">
              Kakao
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}