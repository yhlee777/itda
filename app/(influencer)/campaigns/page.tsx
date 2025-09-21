// app/(influencer)/campaigns/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Heart, X, Clock, Filter, Sparkles, RefreshCw, Home, Search, 
  PlusCircle, Bell, User, Zap, TrendingUp, Users, Crown, Flame,
  Star, Trophy, Gift, DollarSign
} from 'lucide-react';
import SwipeCard from '@/components/influencer/SwipeCard';
import confetti from 'canvas-confetti';

interface Campaign {
  id: string;
  brand: string;
  brandLogo?: string;
  title: string;
  budget: string;
  category: string;
  image: string;
  requirements: string[];
  duration: string;
  engagement_rate?: string;
  description?: string;
  deadline?: string;
  location?: string;
  deliverables?: string[];
  isPremium?: boolean;
  applicants?: number;
  viewingNow?: number;
  matchBonus?: number;
}

interface SocialProof {
  id: string;
  message: string;
  timestamp: Date;
  type: 'match' | 'apply' | 'bonus';
}

export default function CampaignsPage() {
  const router = useRouter();
  
  // 캠페인 데이터 - 프리미엄 캠페인 포함
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      brand: '나이키',
      title: '에어맥스 2024 신제품 런칭',
      budget: '300-500만원',
      category: '패션',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      requirements: ['스포츠/피트니스', '20-30대', '10만+ 팔로워'],
      duration: '2주',
      engagement_rate: '4.5',
      description: '새로운 에어맥스 런칭을 위한 인플루언서를 찾습니다.',
      deadline: '2024.02.15',
      location: '서울',
      deliverables: ['인스타 피드 3개', '릴스 2개', '스토리 5개'],
      applicants: 12,
      viewingNow: 5
    },
    {
      id: '2',
      brand: '스타벅스',
      title: '여름 시즌 신메뉴 프로모션',
      budget: '100-200만원',
      category: 'F&B',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
      requirements: ['카페/디저트', '릴스 제작', '서울 거주'],
      duration: '1주',
      engagement_rate: '3.8',
      description: '새로운 여름 음료 라인업을 소개해주실 인플루언서를 모집합니다.',
      deadline: '2024.02.10',
      location: '전국',
      deliverables: ['릴스 1개', '스토리 3개'],
      applicants: 8,
      viewingNow: 3
    },
    {
      id: '3',
      brand: '삼성전자',
      title: '갤럭시 Z플립5 체험단',
      budget: '500-800만원',
      category: '테크',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
      requirements: ['테크리뷰', '유튜브 채널', '상세리뷰'],
      duration: '1개월',
      engagement_rate: '5.2',
      description: '갤럭시 Z플립5의 혁신적인 기능을 체험하고 리뷰해주세요.',
      deadline: '2024.02.20',
      location: '전국',
      deliverables: ['유튜브 영상 1개', '인스타 피드 2개', '블로그 포스팅 1개'],
      applicants: 23,
      viewingNow: 8
    },
    // 프리미엄 캠페인 (5번째 카드)
    {
      id: '4',
      brand: '샤넬',
      title: '🔥 COCO CRUSH 컬렉션 앰배서더',
      budget: '1,000-1,500만원',
      category: '럭셔리',
      image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d',
      requirements: ['패션/뷰티', '프리미엄 이미지', '20만+ 팔로워'],
      duration: '3개월',
      engagement_rate: '6.0',
      description: '샤넬의 새로운 주얼리 라인 COCO CRUSH의 앰배서더를 모집합니다.',
      deadline: '48시간 후 마감',
      location: '서울',
      deliverables: ['전속 계약', '화보 촬영', '행사 참여'],
      isPremium: true,
      applicants: 156,
      viewingNow: 42,
      matchBonus: 200
    },
    {
      id: '5',
      brand: '아모레퍼시픽',
      title: '설화수 신제품 체험',
      budget: '200-300만원',
      category: '뷰티',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
      requirements: ['뷰티', '스킨케어', '30-40대'],
      duration: '3주',
      engagement_rate: '4.1',
      description: '프리미엄 한방 스킨케어 라인을 체험하고 리뷰해주세요.',
      deadline: '2024.02.25',
      location: '서울/경기',
      deliverables: ['인스타 피드 2개', '릴스 1개', '유튜브 쇼츠 1개'],
      applicants: 15,
      viewingNow: 6
    }
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCampaigns, setLikedCampaigns] = useState<string[]>([]);
  const [rejectedCampaigns, setRejectedCampaigns] = useState<string[]>([]);
  const [streak, setStreak] = useState(3); // 연속 접속일
  const [showStreak, setShowStreak] = useState(true);
  const [socialProofs, setSocialProofs] = useState<SocialProof[]>([]);
  const [matchAnimation, setMatchAnimation] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [lastActionTime, setLastActionTime] = useState<Date | null>(null);

  // 실시간 소셜 증거 생성 (빈도 줄이고 1개만 표시)
  useEffect(() => {
    const messages = [
      { name: '@뷰티퀸', brand: '아모레퍼시픽', action: '매칭 성공!' },
      { name: '@패션왕', brand: '나이키', action: '캠페인 지원!' },
      { name: '@먹방러', brand: '배민', action: '500만원 계약!' },
      { name: '@운동홀릭', brand: '애플워치', action: '매칭 성공!' },
      { name: '@일상브이로거', brand: '스타벅스', action: '캠페인 시작!' }
    ];

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const newProof: SocialProof = {
        id: Date.now().toString(),
        message: `${randomMsg.name}님이 ${randomMsg.brand} ${randomMsg.action}`,
        timestamp: new Date(),
        type: randomMsg.action.includes('매칭') ? 'match' : 'apply'
      };
      
      setSocialProofs([newProof]); // 1개만 표시
    }, 30000); // 30초마다로 줄임

    return () => clearInterval(interval);
  }, []);

  // 콤보 시스템 (빠른 연속 스와이프)
  const checkCombo = useCallback(() => {
    const now = new Date();
    if (lastActionTime && (now.getTime() - lastActionTime.getTime()) < 3000) {
      setComboCount(prev => prev + 1);
      if (comboCount === 2) {
        // 3콤보 보너스!
        triggerComboBonus();
      }
    } else {
      setComboCount(0);
    }
    setLastActionTime(now);
  }, [lastActionTime, comboCount]);

  const triggerComboBonus = () => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#9333ea', '#ec4899', '#10b981']
    });
    
    setSocialProofs([{
      id: 'combo-' + Date.now(),
      message: '🔥 3콤보! 매칭률 UP!',
      timestamp: new Date(),
      type: 'bonus'
    }]);
  };

  // 매칭 성공 애니메이션
  const triggerMatchSuccess = () => {
    setMatchAnimation(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setTimeout(() => setMatchAnimation(false), 2000);
  };

  const handleSwipeLeft = () => {
    const campaign = campaigns[currentIndex];
    setRejectedCampaigns(prev => [...prev, campaign.id]);
    setCurrentIndex(prev => prev + 1);
    checkCombo();
  };

  const handleSwipeRight = () => {
    const campaign = campaigns[currentIndex];
    setLikedCampaigns(prev => [...prev, campaign.id]);
    
    // 프리미엄 캠페인 매칭 시 특별 효과
    if (campaign.isPremium) {
      triggerMatchSuccess();
    }
    
    setCurrentIndex(prev => prev + 1);
    checkCombo();
  };

  const handleCardClick = () => {
    console.log('Campaign details:', campaigns[currentIndex]);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setLikedCampaigns([]);
    setRejectedCampaigns([]);
    setComboCount(0);
  };

  const currentCampaign = campaigns[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white relative">
      {/* 스트릭 알림 - 작고 깔끔하게 */}
      <AnimatePresence>
        {showStreak && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-16 right-4 z-50 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <Flame className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-bold">{streak}일째 🔥</span>
            <button onClick={() => setShowStreak(false)} className="ml-1 text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 실시간 소셜 증거 알림 - 깔끔하게 정리 */}
      <AnimatePresence>
        {socialProofs.map((proof) => (
          <motion.div
            key={proof.id}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-20 left-4 right-4 z-40"
          >
            <div className={`backdrop-blur-md ${
              proof.type === 'match' ? 'bg-green-500/90' :
              proof.type === 'bonus' ? 'bg-purple-500/90' :
              'bg-blue-500/90'
            } text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs`}>
              {proof.type === 'match' && <Trophy className="w-4 h-4" />}
              {proof.type === 'bonus' && <Gift className="w-4 h-4" />}
              <span className="font-medium">{proof.message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 헤더 - 깔끔하게 */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3.5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">캠페인</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                AI 추천 매칭
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 콤보 카운터 - 작게 */}
              {comboCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                >
                  <span className="text-xs font-bold text-white">
                    {comboCount}x
                  </span>
                </motion.div>
              )}
              
              {/* 스트릭 배지 - 작게 */}
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-bold text-orange-700">{streak}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 매칭 성공 애니메이션 - 간소화 */}
      <AnimatePresence>
        {matchAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-4 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold">🎉 프리미엄 매칭!</h2>
              <p className="text-sm mt-1">+200 보너스</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 화면 고정 액션 버튼 */}
      {currentIndex < campaigns.length && (
        <div className="fixed bottom-[76px] left-0 right-0 z-40">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          <div className="relative flex justify-center gap-6 pb-2 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSwipeLeft}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-red-500/20 rounded-full blur-lg group-hover:blur-xl transition-all" />
              <div className="relative p-3.5 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all border-2 border-red-100">
                <X className="w-7 h-7 text-red-500" strokeWidth={2.5} />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCardClick}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg group-hover:blur-xl transition-all" />
              <div className="relative p-2.5 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all border-2 border-purple-100">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSwipeRight}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-green-500/20 rounded-full blur-lg group-hover:blur-xl transition-all" />
              <div className="relative p-3.5 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all border-2 border-green-100">
                <Heart className="w-7 h-7 text-green-500 fill-green-500" strokeWidth={2.5} />
              </div>
            </motion.button>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="px-4 py-6">
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md">
            {/* 프리미엄 캠페인 인디케이터 - 간소화 */}
            {currentCampaign?.isPremium && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20"
              >
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  <span>프리미엄</span>
                  <Star className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            )}

            {/* 실시간 경쟁 표시 - 깔끔하게 */}
            {currentCampaign && (
              <div className="absolute top-12 left-0 right-0 z-20 flex justify-center px-4">
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium">{currentCampaign.applicants}명</span>
                  </div>
                  <div className="w-px h-3 bg-gray-300" />
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">{currentCampaign.viewingNow}명 보는중</span>
                  </div>
                </div>
              </div>
            )}

            <div className="relative h-[600px]">
              {currentIndex < campaigns.length ? (
                <>
                  {/* 다음 카드 미리보기 */}
                  {currentIndex + 2 < campaigns.length && (
                    <div className="absolute inset-x-4 top-4 scale-90 opacity-20">
                      <div className="bg-white rounded-3xl shadow-lg h-[550px]" />
                    </div>
                  )}
                  {currentIndex + 1 < campaigns.length && (
                    <div className="absolute inset-x-2 top-2 scale-95 opacity-40">
                      <div className={`bg-white rounded-3xl shadow-xl h-[570px] ${
                        campaigns[currentIndex + 1].isPremium ? 'ring-2 ring-yellow-400' : ''
                      }`}>
                        <img
                          src={campaigns[currentIndex + 1].image}
                          alt="Next"
                          className="w-full h-64 object-cover rounded-t-3xl opacity-50"
                        />
                        {campaigns[currentIndex + 1].isPremium && (
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                            <Crown className="w-6 h-6 text-yellow-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <SwipeCard
                    key={campaigns[currentIndex].id}
                    campaign={campaigns[currentIndex]}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onCardClick={handleCardClick}
                    active={true}
                  />
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full bg-white rounded-3xl shadow-xl p-6"
                >
                  <Trophy className="w-14 h-14 text-yellow-500 mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    오늘 완료! 🎉
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    <span className="text-green-600 font-bold">{likedCampaigns.length}개</span> 지원 완료
                  </p>
                  
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs font-bold text-purple-900">내일 10시</p>
                        <p className="text-xs text-purple-700">VIP 캠페인</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      다시
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold"
                    >
                      알림
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 진행 인디케이터 */}
            {currentIndex < campaigns.length && (
              <div className="flex justify-center gap-1.5 mt-6 mb-24">
                {campaigns.map((campaign, idx) => (
                  <motion.div
                    key={idx}
                    initial={false}
                    animate={{
                      width: idx === currentIndex ? 32 : 6,
                      opacity: idx < currentIndex ? 0.3 : 1
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      campaign.isPremium 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                        : idx === currentIndex
                        ? 'bg-purple-600'
                        : idx < currentIndex
                        ? 'bg-gray-400'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 바 - 4개로 개편 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2.5">
          <button className="flex flex-col items-center justify-center p-2 text-purple-600 relative">
            <Home className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-xs mt-1 font-semibold">홈</span>
            <div className="absolute -bottom-0.5 w-1 h-1 bg-purple-600 rounded-full"></div>
          </button>
          
          <button 
            onClick={() => router.push('/portfolio')}
            className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Trophy className="w-6 h-6" />
            <span className="text-xs mt-1">포트폴리오</span>
          </button>
          
          <button 
            onClick={() => router.push('/notifications')}
            className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
          >
            <Bell className="w-6 h-6" />
            <span className="text-xs mt-1">알림</span>
            {/* 알림 뱃지 */}
            <div className="absolute top-1.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </button>
          
          <button 
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">내 정보</span>
          </button>
        </div>
      </div>
    </div>
  );
}