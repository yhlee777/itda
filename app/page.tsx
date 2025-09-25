'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // 클라이언트 마운트 체크
  useEffect(() => {
    setMounted(true);
  }, []);

  // 서버 렌더링 중엔 로딩 표시
  if (!mounted) {
    return (
      <main className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </main>
    );
  }

  return (
    <main className="bg-black min-h-screen">
      {/* 네비게이션 */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/50 border-b border-white/10">
        <div className="flex justify-between items-center px-8 py-6">
          <h1 className="text-xl font-light tracking-wide text-white">itda</h1>
          <div className="flex gap-6">
            <Link href="/demo">
              <button className="px-6 py-2 text-sm text-purple-400 hover:text-purple-300 transition-all">
                인플루언서
              </button>
            </Link>
            <button 
              onClick={() => alert('광고주 서비스는 준비중입니다')}
              className="px-6 py-2 text-sm text-white/50 cursor-not-allowed"
            >
              광고주
            </button>
          </div>
        </div>
      </nav>

      {/* Hero 섹션 */}
      <section className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        
        <div className="text-center z-10 px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-light text-white mb-6">
              인플루언서 마케팅
            </h1>
            <p className="text-2xl md:text-3xl text-purple-400 font-light mb-8">
              틴더처럼 쉽게
            </p>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-12">
              복잡한 DM과 협상은 그만. <br/>
              스와이프 한 번으로 인플루언서와 브랜드를 연결합니다.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 justify-center"
          >
            <Link href="/demo">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-600/25 transition-all"
              >
                인플루언서로 시작
              </motion.button>
            </Link>
            
            <button 
              onClick={() => alert('광고주 서비스는 11월 30일 오픈 예정입니다')}
              className="px-8 py-4 bg-white/10 text-white/50 rounded-lg cursor-not-allowed"
            >
              광고주로 시작
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <p className="text-orange-400 text-sm">
              🔥 선착순 100명 평생 수수료 0%
            </p>
          </motion.div>
        </div>
      </section>

      {/* 작동 방식 */}
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-6xl w-full">
          <h2 className="text-3xl md:text-4xl text-center text-white mb-16 font-light">
            어떻게 작동하나요?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "👆",
                title: "스와이프",
                desc: "마음에 드는 캠페인을 오른쪽으로",
                detail: "틴더처럼 직관적인 UI"
              },
              {
                icon: "⚡",
                title: "즉시 매칭",
                desc: "AI가 최적의 매칭을 찾아드려요",
                detail: "평균 18시간 내 응답"
              },
              {
                icon: "💰",
                title: "바로 시작",
                desc: "복잡한 계약 없이 바로 진행",
                detail: "직거래, 수수료 0%"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10, scale: 1.02 }}
                onHoverStart={() => setHoveredCard(i)}
                onHoverEnd={() => setHoveredCard(null)}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm mb-2">{item.desc}</p>
                <motion.p
                  animate={{ opacity: hoveredCard === i ? 1 : 0 }}
                  className="text-purple-400 text-xs"
                >
                  {item.detail}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 숫자로 보는 성과 */}
      <section className="min-h-screen flex items-center justify-center px-8 bg-white text-black">
        <div className="max-w-6xl w-full">
          <h2 className="text-3xl md:text-4xl text-center mb-16 font-light">
            빠르게 성장 중
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { num: "1,847", label: "인플루언서" },
              { num: "83", label: "대기중인 캠페인" },
              { num: "294", label: "성사된 매칭" },
              { num: "18시간", label: "평균 매칭시간" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-light text-purple-600 mb-2">
                  {stat.num}
                </div>
                <div className="text-sm text-black/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 최종 CTA */}
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl text-white mb-8 font-light">
            지금 시작하세요
          </h2>
          <p className="text-white/60 text-lg mb-12">
            3분만에 시작할 수 있어요
          </p>
          
          <Link href="/demo">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-lg hover:shadow-lg hover:shadow-purple-600/25 transition-all"
            >
              체험해보기
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-white/40 text-sm">
            © 2024 itda. All rights reserved.
          </div>
          <div className="flex gap-6 text-white/40 text-sm">
            <Link href="/terms" className="hover:text-white transition">이용약관</Link>
            <Link href="/privacy" className="hover:text-white transition">개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}