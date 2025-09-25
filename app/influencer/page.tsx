'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function InfluencerLanding() {
  // Fake 숫자들
  const [stats, setStats] = useState({
    influencers: 1834,
    campaigns: 87,
    avgMatch: 18,
    spotsLeft: 37
  });

  // 실시간 알림 (가짜)
  const [notification, setNotification] = useState('');
  const notifications = [
    '@fashion_seoul님이 방금 가입했습니다',
    '올리브영에서 새 캠페인을 등록했습니다',
    '@beauty_jane님이 캠페인 매칭되었습니다',
    '무신사 캠페인에 12명이 지원했습니다',
    '@daily_vlog님이 200만원 캠페인 수주했습니다'
  ];

  // 숫자 실시간처럼 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        influencers: prev.influencers + Math.floor(Math.random() * 3),
        spotsLeft: prev.spotsLeft > 10 ? prev.spotsLeft - 1 : prev.spotsLeft
      }));
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, []);

  // 가짜 알림 띄우기
  useEffect(() => {
    const showNotification = () => {
      const random = notifications[Math.floor(Math.random() * notifications.length)];
      setNotification(random);
      setTimeout(() => setNotification(''), 4000);
    };

    showNotification(); // 처음 한번
    const interval = setInterval(showNotification, 15000); // 15초마다

    return () => clearInterval(interval);
  }, []);

  // 카운트다운
  const [timeLeft, setTimeLeft] = useState({
    days: 6,
    hours: 13,
    minutes: 42
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
        }
        return prev;
      });
    }, 60000); // 1분마다

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-black">
      {/* 실시간 알림 */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-purple-600/90 backdrop-blur rounded-full"
          >
            <p className="text-white text-sm">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-8 relative">
        {/* 움직이는 배경 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="text-center z-10">
          {/* 긴급성 배너 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block px-6 py-2 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/50 rounded-full mb-8"
          >
            <p className="text-orange-400 text-sm font-medium">
              🔥 선착순 100명 평생 수수료 0% - {stats.spotsLeft}명 남음!
            </p>
          </motion.div>

          {/* 메인 카피 */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              DM은 그만
            </span>
          </h1>
          <h2 className="text-3xl md:text-5xl text-white font-light mb-8">
            스와이프로 광고 받으세요
          </h2>

          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            복잡한 협상 없이 스와이프 한 번으로<br/>
            원하는 브랜드 광고를 받아보세요
          </p>

          {/* 실시간 통계 (Fake) */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10"
            >
              <p className="text-4xl font-bold text-white mb-2">
                {stats.influencers.toLocaleString()}
              </p>
              <p className="text-white/60 text-sm">활성 인플루언서</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10"
            >
              <p className="text-4xl font-bold text-purple-400 mb-2">
                {stats.campaigns}
              </p>
              <p className="text-white/60 text-sm">대기중인 캠페인</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10"
            >
              <p className="text-4xl font-bold text-green-400 mb-2">
                {stats.avgMatch}시간
              </p>
              <p className="text-white/60 text-sm">평균 매칭</p>
            </motion.div>
          </div>

          {/* 카운트다운 */}
          <div className="mb-8">
            <p className="text-white/40 text-sm mb-2">선착순 혜택 종료까지</p>
            <div className="flex justify-center gap-4">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-white">{timeLeft.days}</p>
                <p className="text-xs text-white/60">일</p>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-white">{timeLeft.hours}</p>
                <p className="text-xs text-white/60">시간</p>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-white">{timeLeft.minutes}</p>
                <p className="text-xs text-white/60">분</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link href="/waitlist">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-lg font-medium shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30 transition-all"
            >
              지금 시작하기 →
            </motion.button>
          </Link>
        </div>
      </section>

      {/* 가짜 캠페인 리스트 */}
      <section className="px-8 py-20">
        <h2 className="text-3xl text-center text-white mb-4">
          지금 인플루언서를 기다리는 캠페인
        </h2>
        <p className="text-center text-white/40 mb-12">
          * 실시간 업데이트 중
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { brand: '올리브영', title: '겨울 스킨케어 루틴', budget: '100-300만원', category: '뷰티', hot: true },
            { brand: '무신사', title: '데일리룩 코디', budget: '50-150만원', category: '패션' },
            { brand: '스타벅스', title: '겨울 신메뉴 리뷰', budget: '200-400만원', category: 'F&B', hot: true },
            { brand: '나이키', title: '러닝화 착용 리뷰', budget: '300-500만원', category: '스포츠' },
            { brand: '쿠팡', title: '블랙프라이데이 홍보', budget: '150-250만원', category: '이커머스', hot: true },
            { brand: '배달의민족', title: '맛집 브이로그', budget: '80-120만원', category: 'F&B' }
          ].map((campaign, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all relative"
            >
              {campaign.hot && (
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-red-500 rounded-full">
                  <p className="text-xs text-white font-bold">HOT</p>
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl text-white font-medium">{campaign.brand}</h3>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  {campaign.category}
                </span>
              </div>
              <p className="text-white/80 mb-4">{campaign.title}</p>
              <p className="text-2xl text-white font-bold">{campaign.budget}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-white/40 text-sm">
            + 81개 캠페인 더보기
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-8 py-20 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl text-center text-white mb-12">
            이미 시작한 인플루언서들
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: '@fashion_seoul', followers: '3.2만', earned: '450만원', time: '2주' },
              { name: '@beauty_daily', followers: '5.8만', earned: '780만원', time: '1개월' },
              { name: '@food_lover', followers: '1.9만', earned: '320만원', time: '3주' },
              { name: '@workout_life', followers: '8.3만', earned: '920만원', time: '1개월' }
            ].map((influencer, i) => (
              <div key={i} className="bg-black/50 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-medium">{influencer.name}</h4>
                    <p className="text-white/60 text-sm">{influencer.followers} 팔로워</p>
                  </div>
                  <span className="text-green-400 font-bold">{influencer.earned}</span>
                </div>
                <p className="text-white/40 text-sm">
                  {influencer.time} 만에 달성
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}