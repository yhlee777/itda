
// app/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Sparkles, Users, Shield, Zap,
  ArrowRight, CheckCircle, Menu, X
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Zap,
      title: '빠른 매칭',
      description: '스와이프로 즉시 연결'
    },
    {
      icon: Shield,
      title: '안전한 거래',
      description: '검증된 시스템으로 보호'
    },
    {
      icon: Users,
      title: 'AI 추천',
      description: '완벽한 파트너 매칭'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 심플 네비게이션 */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-purple-600" />
              <span className="text-xl font-bold">ITDA</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm">
                로그인
              </Link>
              <Link href="/register">
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all">
                  시작하기
                </button>
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link href="/register" className="block">
                <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium">
                  무료로 시작하기
                </button>
              </Link>
              <Link href="/login" className="block text-center py-2 text-gray-600 text-sm">
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 히어로 섹션 - 심플 */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* 메인 타이틀 */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              인플루언서 마케팅
              <span className="block text-purple-600">더 쉽게, 더 빠르게</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              복잡한 과정 없이 AI가 최적의 파트너를 매칭해드립니다.
              지금 시작하고 성과를 경험하세요.
            </p>
            
            {/* CTA 버튼 - 하나만 가운데 */}
            <div className="flex justify-center mb-12">
              <Link href="/register">
                <button className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2">
                  무료로 시작하기
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>

            {/* 간단한 통계 */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>50K+ 활성 사용자</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>98% 매칭 성공률</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>수수료 0%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 핵심 기능 - 컴팩트 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            왜 ITDA인가요?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 사용자 타입 선택 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            어떤 분이신가요?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 인플루언서 카드 */}
            <Link href="/register?type=influencer">
              <motion.div
                whileHover={{ y: -5 }}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-400 cursor-pointer transition-all h-full"
              >
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-xl font-bold mb-2">인플루언서</h3>
                <p className="text-gray-600 text-sm mb-4">
                  브랜드와 협업하고 수익을 창출하세요
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ 간편한 캠페인 지원</li>
                  <li>✓ 실시간 매칭</li>
                  <li>✓ 안전한 정산</li>
                </ul>
              </motion.div>
            </Link>

            {/* 광고주 카드 */}
            <Link href="/register?type=advertiser">
              <motion.div
                whileHover={{ y: -5 }}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-400 cursor-pointer transition-all h-full"
              >
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-bold mb-2">광고주</h3>
                <p className="text-gray-600 text-sm mb-4">
                  완벽한 인플루언서를 찾아보세요
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ AI 추천 시스템</li>
                  <li>✓ 실시간 성과 분석</li>
                  <li>✓ 간편한 계약</li>
                </ul>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* 심플 CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-gray-600 mb-8">
            복잡한 절차 없이 1분 만에 가입 완료
          </p>
          <Link href="/register">
            <button className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all inline-flex items-center gap-2">
              무료로 시작하기
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* 미니멀 푸터 */}
      <footer className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">ITDA</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white">이용약관</Link>
              <Link href="#" className="hover:text-white">개인정보처리방침</Link>
              <Link href="#" className="hover:text-white">문의</Link>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs mt-4">
            © 2024 ITDA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}