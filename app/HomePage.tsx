'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slides = [
    // 슬라이드 1: 메인
    {
      id: 'main',
      content: (
        <div className="min-h-screen flex items-center justify-center relative px-4">
          <div className="text-center z-10 w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <span className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                🔥 선착순 37명 남음
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6">
                <span className="text-purple-400">1,847명</span>의
                <br />
                인플루언서가 선택
              </h1>
              
              <p className="text-xl sm:text-2xl md:text-3xl text-white/80 mb-4">
                평생 수수료 <span className="text-purple-400 font-bold">0%</span>
              </p>
              
              <p className="text-white/60 text-lg">
                83개 브랜드 캠페인 대기 중
              </p>
            </motion.div>
          </div>
        </div>
      )
    },
    // 슬라이드 2: 실적
    {
      id: 'stats',
      content: (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-6xl w-full">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl text-white font-bold mb-4">
                매칭 성공률 <span className="text-purple-400">87%</span>
              </h2>
              <p className="text-white/60 text-lg">
                평균 18시간 내 브랜드 매칭
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { num: "294", label: "오늘 성사된 매칭", icon: "💜" },
                { num: "₩2.4억", label: "11월 캠페인 예산", icon: "💰" },
                { num: "18시간", label: "평균 매칭 시간", icon: "⚡" },
                { num: "0%", label: "수수료", icon: "🎯", highlight: true }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10"
                >
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                    stat.highlight ? 'text-purple-400' : 'text-white'
                  }`}>
                    {stat.num}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    // 슬라이드 3: 후기
    {
      id: 'reviews',
      content: (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-5xl w-full">
            <h2 className="text-3xl md:text-4xl text-white font-bold mb-12 text-center">
              실제 인플루언서 후기
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "@beauty.yeon",
                  followers: "3.2만",
                  review: "에이전시 수수료 없어서 진짜 좋아요. 첫 달에 5개 캠페인 진행했어요!",
                  earnings: "+450만원"
                },
                {
                  name: "@daily_ootd",
                  followers: "1.8만",
                  review: "틴더처럼 스와이프하니까 재밌고 편해요ㅋㅋ 매칭도 빨라요",
                  earnings: "+320만원"
                },
                {
                  name: "@cafe.lover",
                  followers: "5.5천",
                  review: "나노 인플루언서도 대우받는 느낌! 보장금 캠페인 많아요",
                  earnings: "+180만원"
                }
              ].map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur rounded-xl p-6 border border-purple-500/20"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-medium">{review.name}</p>
                      <p className="text-white/40 text-sm">{review.followers} 팔로워</p>
                    </div>
                    <span className="text-green-400 font-bold">{review.earnings}</span>
                  </div>
                  <p className="text-white/70 text-sm italic">"{review.review}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    // 슬라이드 4: 작동 방식
    {
      id: 'how',
      content: (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl w-full">
            <h2 className="text-3xl md:text-4xl text-center text-white font-bold mb-16">
              3초면 충분해요
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { icon: "👆", step: "1", title: "스와이프", desc: "맘에 드는 캠페인 선택" },
                { icon: "💜", step: "2", title: "매칭", desc: "브랜드가 수락하면 성공" },
                { icon: "💰", step: "3", title: "수익", desc: "수수료 0원으로 진행" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="text-6xl mb-4">{item.icon}</div>
                  <div className="text-purple-400 text-5xl font-bold opacity-20 absolute top-0 left-1/2 -translate-x-1/2">
                    {item.step}
                  </div>
                  <h3 className="text-xl text-white font-medium mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    // 슬라이드 5: CTA
    {
      id: 'cta',
      content: (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-3xl">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-8"
            >
              <div className="inline-block px-6 py-3 bg-red-500/20 rounded-full">
                <p className="text-red-400 font-bold text-lg">
                  ⏰ 선착순 마감 임박
                </p>
                <p className="text-white text-2xl font-bold mt-1">
                  37명만 남았습니다
                </p>
              </div>
            </motion.div>

            <h2 className="text-4xl md:text-6xl text-white font-bold mb-6">
              지금 시작하면
              <br />
              <span className="text-purple-400">평생 0%</span>
            </h2>
            
            <p className="text-white/60 text-lg mb-12">
              30초 가입, 바로 캠페인 확인
            </p>
            
            <button
          onClick={() => {
            console.log('클릭!');
            window.location.href = '/demo';  // 직접 이동
          }}
          className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-xl font-bold shadow-2xl hover:shadow-purple-600/50 transition-all cursor-pointer relative z-[100]"
        >
          인플루언서로 시작하기 →
        </button>
            
            <p className="text-white/40 text-sm mt-6">
              가입비 없음 · 해지 수수료 없음 · 숨겨진 비용 없음
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // 터치 이벤트
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <main 
      className="bg-black overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 네비게이션 */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/50 border-b border-white/10">
        <div className="flex justify-between items-center px-8 py-6">
          <h1 className="text-xl font-light tracking-wide text-white">itda</h1>
          <div className="flex gap-6">
            <button
              onClick={() => router.push('/demo')}
              className="px-6 py-2 text-sm text-purple-400 hover:text-purple-300 transition-all cursor-pointer"
            >
              체험하기
            </button>
          </div>
        </div>
      </nav>

      {/* 배경 애니메이션 */}
      <div className="fixed inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600 rounded-full blur-3xl"
        />
      </div>

      {/* 슬라이드 콘텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          {slides[currentSlide].content}
        </motion.div>
      </AnimatePresence>

      {/* 좌우 버튼 */}
      {currentSlide > 0 && (
        <button
          onClick={prevSlide}
          className="fixed left-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {currentSlide < slides.length - 1 && (
        <motion.button
          onClick={nextSlide}
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      )}

      {/* 진행 인디케이터 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              index === currentSlide
                ? 'w-8 bg-purple-500'
                : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* 모바일 스와이프 힌트 */}
      {currentSlide === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-sm md:hidden"
        >
          ← 스와이프하여 넘기기 →
        </motion.div>
      )}
    </main>
  );
}