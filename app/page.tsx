// app/page.tsx - 메인 랜딩 페이지
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Zap, ArrowRight, Star } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // 로그인 상태면 사용자 타입에 따라 리다이렉트
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', session.user.id)
        .single() as any;

      if (userData?.user_type === 'influencer') {
        router.push('/campaigns');
      } else if (userData?.user_type === 'advertiser') {
        router.push('/dashboard');
      }
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white"
        >
          <h1 className="text-6xl font-bold mb-6">ITDA</h1>
          <p className="text-2xl mb-8">인플루언서와 브랜드를 잇다</p>
          
          {/* 특징 */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <Sparkles className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">AI 매칭</h3>
              <p className="text-sm">스마트한 인플루언서 추천</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">실시간 분석</h3>
              <p className="text-sm">캠페인 성과 즉시 확인</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">10만+ 인플루언서</h3>
              <p className="text-sm">다양한 분야의 크리에이터</p>
            </div>
          </div>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transition-all"
            >
              로그인
            </Link>
          </div>

          {/* 신뢰 지표 */}
          <div className="mt-12 flex items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-current" />
              <span>4.8/5.0 평점</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>30초 가입</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>5,000+ 브랜드</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 사용자 타입 선택 섹션 */}
      <div className="container mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {/* 인플루언서 카드 */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🌟</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">인플루언서</h2>
              <p className="text-gray-600">
                틴더처럼 스와이프하며<br />
                마음에 드는 캠페인 선택
              </p>
            </div>
            <ul className="space-y-3 mb-6 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                AI가 추천하는 맞춤 캠페인
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                간편한 스와이프 지원
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                실시간 수익 정산
              </li>
            </ul>
            <Link
              href="/register?type=influencer"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-center hover:shadow-lg transition-all"
            >
              인플루언서로 시작
            </Link>
          </div>

          {/* 광고주 카드 */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">광고주/브랜드</h2>
              <p className="text-gray-600">
                우버처럼 실시간으로<br />
                인플루언서 매칭 받기
              </p>
            </div>
            <ul className="space-y-3 mb-6 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                AI 기반 인플루언서 추천
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                30분마다 실시간 알림
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                단가 예측 & ROI 분석
              </li>
            </ul>
            <Link
              href="/register?type=advertiser"
              className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-center hover:shadow-lg transition-all"
            >
              광고주로 시작
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}