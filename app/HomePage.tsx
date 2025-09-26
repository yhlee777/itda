'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import OnboardingTutorial from '@/components/OnboardingTutorial';

// 카테고리별 캠페인 데이터
const campaignsByCategory: Record<string, any[]> = {
  beauty: [
    {
      id: 'b1',
      brand: '디얼달리아',
      brandDesc: '클린뷰티 스타트업',
      title: '비건 선크림 체험단',
      description: '신제품 워터풀 선크림 정품 제공. 2주 사용 후 솔직한 리뷰 부탁드려요.',
      budget: '80만원',
      requirements: '피드 2, 스토리 3',
      category: '뷰티',
      deadline: 'D-5',
      followers: '1만+',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=60&h=60&fit=crop'
    },
    {
      id: 'b2',
      brand: '힐링버드',
      brandDesc: '한방 코스메틱',
      title: '어성초 토너패드 리뷰',
      description: '트러블 진정 효과 집중 리뷰. 비포애프터 사진 필수.',
      budget: '60만원',
      requirements: '릴스 1, 피드 2',
      category: '뷰티',
      deadline: 'D-7',
      followers: '5천+',
      imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=60&h=60&fit=crop'
    },
    {
      id: 'b3',
      brand: '글로우랩',
      brandDesc: 'LED 마스크 브랜드',
      title: '홈케어 LED 마스크',
      description: '4주간 사용 후 피부 개선 효과 리뷰. 제품 대여 후 리뷰어 증정.',
      budget: '100만원',
      requirements: '피드 3, 릴스 1',
      category: '뷰티',
      deadline: 'D-10',
      followers: '2만+',
      imageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=60&h=60&fit=crop'
    }
  ],
  fashion: [
    {
      id: 'f1',
      brand: '무탠다드',
      brandDesc: '미니멀 의류',
      title: 'F/W 니트 컬렉션',
      description: '3가지 컬러 니트 제공. 데일리룩 스타일링 5가지.',
      budget: '100만원',
      requirements: '피드 3, 릴스 1',
      category: '패션',
      deadline: 'D-4',
      followers: '2만+',
      imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=60&h=60&fit=crop'
    },
    {
      id: 'f2',
      brand: '슬로우앤드',
      brandDesc: '실버 주얼리',
      title: '데일리 실버 컬렉션',
      description: '레이어링 목걸이 3종. 다양한 코디 매치.',
      budget: '70만원',
      requirements: '피드 2, 스토리 2',
      category: '패션',
      deadline: 'D-6',
      followers: '1만+',
      imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=60&h=60&fit=crop'
    },
    {
      id: 'f3',
      brand: '리본느',
      brandDesc: '프렌치 캐주얼',
      title: '블라우스 & 스커트',
      description: '오피스룩에서 데이트룩까지. 전환 스타일링 보여주기.',
      budget: '90만원',
      requirements: '릴스 2, 피드 2',
      category: '패션',
      deadline: 'D-8',
      followers: '1.5만+',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=60&h=60&fit=crop'
    }
  ],
  food: [
    {
      id: 'fd1',
      brand: '그릭데이',
      brandDesc: '그릭요거트',
      title: '아침대용 요거트볼',
      description: '단백질 30g 그릭요거트. 다이어트 식단 일주일 챌린지.',
      budget: '50만원',
      requirements: '릴스 1, 피드 1',
      category: '푸드',
      deadline: 'D-3',
      followers: '5천+',
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=60&h=60&fit=crop'
    },
    {
      id: 'fd2',
      brand: '미트리',
      brandDesc: '대체육 브랜드',
      title: '비건 불고기 체험',
      description: '100% 식물성 불고기. 일반 고기와 블라인드 테스트.',
      budget: '90만원',
      requirements: '릴스 2, 피드 2',
      category: '푸드',
      deadline: 'D-7',
      followers: '1만+',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1606923829321-0cb0e3377d73?w=60&h=60&fit=crop'
    },
    {
      id: 'fd3',
      brand: '델리밀',
      brandDesc: '밀프렙 도시락',
      title: '일주일 도시락 구독',
      description: '다이어트 도시락 7일 체험. 체중 변화 기록 필수.',
      budget: '70만원',
      requirements: '피드 2, 스토리 5',
      category: '푸드',
      deadline: 'D-5',
      followers: '8천+',
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=60&h=60&fit=crop'
    }
  ],
  lifestyle: [
    {
      id: 'l1',
      brand: '리빙포인트',
      brandDesc: '홈데코 브랜드',
      title: '홈카페 인테리어',
      description: '카페 소품 5종 세트. 홈카페 꾸미기 과정 공유.',
      budget: '70만원',
      requirements: '피드 2, 스토리 3',
      category: '라이프',
      deadline: 'D-5',
      followers: '1만+',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=60&h=60&fit=crop'
    },
    {
      id: 'l2',
      brand: '센티드',
      brandDesc: '룸스프레이',
      title: '시그니처 룸스프레이',
      description: '공간별 향 추천. 무드 있는 공간 연출 팁.',
      budget: '60만원',
      requirements: '릴스 1, 피드 2',
      category: '라이프',
      deadline: 'D-4',
      followers: '8천+',
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop'
    },
    {
      id: 'l3',
      brand: '플랜트리',
      brandDesc: '식물 큐레이션',
      title: '반려식물 스타터팩',
      description: '초보자용 식물 3종. 한 달간 성장 기록.',
      budget: '50만원',
      requirements: '피드 3, 스토리 2',
      category: '라이프',
      deadline: 'D-6',
      followers: '5천+',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=60&h=60&fit=crop'
    }
  ],
  fitness: [
    {
      id: 'ft1',
      brand: '바디업',
      brandDesc: '홈트 용품',
      title: '요가매트 & 폼롤러',
      description: '프리미엄 요가매트 세트. 홈트 루틴 공유.',
      budget: '60만원',
      requirements: '릴스 2, 피드 1',
      category: '운동',
      deadline: 'D-4',
      followers: '1만+',
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop'
    },
    {
      id: 'ft2',
      brand: '프로틴팩토리',
      brandDesc: '단백질 보충제',
      title: '비건 프로틴 30일',
      description: '식물성 프로틴 파우더. 운동 전후 섭취 루틴.',
      budget: '80만원',
      requirements: '피드 2, 릴스 1',
      category: '운동',
      deadline: 'D-6',
      followers: '1.5만+',
      imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=60&h=60&fit=crop'
    },
    {
      id: 'ft3',
      brand: '스마트핏',
      brandDesc: '운동 웨어',
      title: '요가복 3종 세트',
      description: '레깅스+브라탑+탑. 요가 동작별 착용감 리뷰.',
      budget: '100만원',
      requirements: '릴스 1, 피드 3',
      category: '운동',
      deadline: 'D-8',
      followers: '2만+',
      imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=60&h=60&fit=crop'
    }
  ]
};

export default function DemoClient() {
  const router = useRouter();
  
  // State 관리
  const [showCategorySelect, setShowCategorySelect] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  
  // 스와이프 관련
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedCards, setSwipedCards] = useState<any[]>([]);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [showLockCard, setShowLockCard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 체크
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCampaigns(campaignsByCategory[category] || []);
    setShowCategorySelect(false);
    
    // 온보딩을 본 적이 없으면 보여주기
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    
    setCurrentIndex(0);
    setSwipedCards([]);
    setShowLockCard(false);
  };

  // 온보딩 완료 핸들러
  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleSwipe = (swipeDirection: 'left' | 'right') => {
    if (showLockCard) return;
    
    const currentCampaign = campaigns[currentIndex];
    setDirection(swipeDirection);
    
    if (swipeDirection === 'right' && currentCampaign) {
      setSwipedCards([...swipedCards, currentCampaign]);
    }

    setTimeout(() => {
      if (currentIndex === campaigns.length - 1) {
        setShowLockCard(true);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      setDirection(null);
      setDragOffset(0);
    }, 300);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showLockCard || showCategorySelect || showOnboarding) return;
      if (e.key === 'ArrowLeft') handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, showLockCard, showCategorySelect, showOnboarding]);

  const currentCampaign = showLockCard ? null : campaigns[currentIndex];

  // 1. 카테고리 선택 화면
  if (showCategorySelect) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black relative overflow-hidden">
        {/* 배경 애니메이션 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
          <div className="max-w-3xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
                어떤 분야의 인플루언서신가요?
              </h1>
              <p className="text-white/60 text-lg">
                관심 카테고리를 선택하면 맞춤 캠페인을 보여드려요
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {[
                { id: 'beauty', label: '뷰티', icon: '💄', count: 3 },
                { id: 'fashion', label: '패션', icon: '👗', count: 3 },
                { id: 'food', label: '푸드', icon: '🍽️', count: 3 },
                { id: 'lifestyle', label: '라이프', icon: '🏠', count: 3 },
                { id: 'fitness', label: '운동', icon: '💪', count: 3 },
              ].map((cat, i) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="p-8 rounded-2xl bg-white/5 backdrop-blur border-2 border-white/20 hover:border-purple-500 hover:bg-purple-500/10 transition-all cursor-pointer"
                >
                  <div className="text-5xl mb-4">{cat.icon}</div>
                  <div className="text-white text-xl font-medium">{cat.label}</div>
                  <div className="text-white/40 text-sm mt-2">
                    {cat.count}개 캠페인
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <p className="text-white/40 text-sm">
                카테고리를 선택하면 사용법을 알려드려요
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. 온보딩 표시 (카테고리 선택 후)
  if (showOnboarding) {
    return <OnboardingTutorial onComplete={handleOnboardingComplete} />;
  }

  // 3. 스와이프 화면
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black relative overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* 헤더 */}
      <div className="fixed top-0 w-full z-50 p-4 sm:p-6 bg-black/20 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowCategorySelect(true);
                setCurrentIndex(0);
                setSwipedCards([]);
              }}
              className="text-white/60 hover:text-white transition-colors"
            >
              ← 카테고리 변경
            </button>
            <div className="text-white">
              <p className="text-[10px] sm:text-xs opacity-60">
                {selectedCategory === 'beauty' && '뷰티'}
                {selectedCategory === 'fashion' && '패션'}
                {selectedCategory === 'food' && '푸드'}
                {selectedCategory === 'lifestyle' && '라이프'}
                {selectedCategory === 'fitness' && '운동'}
              </p>
              <p className="text-lg sm:text-xl font-light">itda</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-white/60">관심 캠페인</p>
              <p className="text-xl sm:text-2xl text-purple-400 font-bold">{swipedCards.length}</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/waitlist')}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-xs sm:text-sm font-medium shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              시작하기
            </motion.button>
          </div>
        </div>
      </div>

      {/* 메인 스와이프 영역 */}
      <div className="h-screen flex items-center justify-center px-4 sm:px-8 pt-16 sm:pt-20">
        <div className="w-full max-w-[340px] sm:max-w-sm relative">
          {/* 카드 스택 효과 */}
          {!showLockCard && currentIndex < campaigns.length - 1 && (
            <div className="absolute inset-0 translate-y-3 sm:translate-y-4 scale-95 opacity-40">
              <div className="bg-white rounded-2xl sm:rounded-3xl h-full shadow-2xl" />
            </div>
          )}
          {!showLockCard && currentIndex < campaigns.length - 2 && (
            <div className="absolute inset-0 translate-y-6 sm:translate-y-8 scale-90 opacity-20">
              <div className="bg-white rounded-2xl sm:rounded-3xl h-full shadow-2xl" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {!showLockCard && currentCampaign ? (
              <motion.div
                key={currentCampaign.id}
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  rotate: dragOffset * 0.05
                }}
                exit={{
                  x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
                  opacity: 0,
                  scale: 0.8,
                  rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
                  transition: { duration: 0.25 }
                }}
                drag="x"
                dragConstraints={{ left: -200, right: 200 }}
                dragElastic={1}
                dragMomentum={false}
                onDrag={(e, info) => setDragOffset(info.offset.x)}
                onDragEnd={(e, { offset, velocity }) => {
                  setDragOffset(0);
                  if (Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 200) {
                    handleSwipe(offset.x > 0 ? 'right' : 'left');
                  }
                }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative cursor-grab active:cursor-grabbing"
                style={{ 
                  height: isMobile ? 'calc(100vh - 200px)' : '650px',
                  maxHeight: '650px',
                  minHeight: '500px',
                  touchAction: 'pan-y'
                }}
              >
                {/* 카드 상단 이미지 영역 */}
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-purple-100 to-pink-100">
                  <Image
                    src={currentCampaign.imageUrl}
                    alt={currentCampaign.brand}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* 브랜드 정보 */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur rounded-full pr-3 sm:pr-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full overflow-hidden">
                      <Image
                        src={currentCampaign.logoUrl}
                        alt="logo"
                        width={48}
                        height={48}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{currentCampaign.brand}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{currentCampaign.brandDesc}</p>
                    </div>
                  </div>

                  {/* 카테고리 태그 */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <span className="px-2 sm:px-3 py-1 bg-purple-600 text-white rounded-full text-xs sm:text-sm font-medium">
                      {currentCampaign.category}
                    </span>
                  </div>

                  {/* 마감일 표시 */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                      {currentCampaign.deadline}
                    </span>
                  </div>
                </div>

                {/* 카드 하단 정보 영역 */}
                <div className="p-4 sm:p-5 flex flex-col h-[calc(100%-12rem)] sm:h-[calc(100%-14rem)]">
                  {/* 제목과 설명 */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {currentCampaign.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {currentCampaign.description}
                  </p>

                  {/* 핵심 정보 */}
                  <div className="flex-1 space-y-3">
                    {/* 예산 - 크게 표시 */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">💰 캠페인 예산</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {currentCampaign.budget}
                        </span>
                      </div>
                    </div>

                    {/* 나머지 정보 그리드 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-500 text-xs mb-1">📝 콘텐츠</div>
                        <div className="text-gray-900 font-semibold text-xs">
                          {currentCampaign.requirements}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-500 text-xs mb-1">👥 팔로워</div>
                        <div className="text-gray-900 font-semibold text-xs">
                          {currentCampaign.followers}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 하단 정보 */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">실시간 지원자</span>
                      <span className="text-xs font-semibold text-purple-600">
                        {Math.floor(Math.random() * 50 + 10)}명 지원 중
                      </span>
                    </div>
                  </div>
                </div>

                {/* 드래그 시 인디케이터 */}
                {dragOffset !== 0 && (
                  <div className={`absolute top-1/2 -translate-y-1/2 ${
                    dragOffset > 0 ? 'right-4 sm:right-8' : 'left-4 sm:left-8'
                  }`}>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                        dragOffset > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl text-white">
                        {dragOffset > 0 ? '❤️' : '✕'}
                      </span>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ) : showLockCard ? (
              // 잠금 카드
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative"
                style={{ 
                  height: isMobile ? 'calc(100vh - 200px)' : '650px',
                  maxHeight: '650px',
                  minHeight: '500px'
                }}
              >
                <div className="p-6 sm:p-8 h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="text-5xl sm:text-7xl mb-4 sm:mb-6"
                    >
                      🎉
                    </motion.div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
                      모든 캠페인을<br/>확인하셨어요!
                    </h3>
                    
                    <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 text-center">
                      관심 있는 <span className="text-purple-600 font-bold">{swipedCards.length}개</span> 캠페인이<br/>
                      매칭 대기 중입니다
                    </p>
                    
                    {swipedCards.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-lg max-h-40 overflow-y-auto"
                      >
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 font-medium">
                          선택한 캠페인
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          {swipedCards.map((card, i) => (
                            <div key={i} className="flex items-center justify-between bg-purple-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="font-medium text-xs sm:text-sm">
                                  {card.brand}
                                </span>
                              </div>
                              <span className="text-purple-600 font-bold text-xs sm:text-sm">
                                {card.budget}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    
                    <div className="space-y-3 w-full">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowCategorySelect(true);
                          setCurrentIndex(0);
                          setSwipedCards([]);
                          setShowLockCard(false);
                        }}
                        className="w-full px-4 sm:px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold"
                      >
                        다른 카테고리 보기
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/waitlist')}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
                      >
                        무료로 시작하기
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="pt-3 sm:pt-4 text-center">
                    <p className="text-[10px] sm:text-xs text-red-500 font-medium mb-1">
                      🔥 선착순 37명 남음
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      평생 수수료 0% · 가입비 없음
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* 버튼들 */}
          {!showLockCard && currentCampaign && (
            <div className="flex justify-center gap-12 sm:gap-16 mt-6 sm:mt-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-500/20 transition-all shadow-lg active:bg-red-500/30"
              >
                <span className="text-2xl">✕</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-green-500/20 transition-all shadow-lg active:bg-green-500/30"
              >
                <span className="text-2xl">❤️</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* 진행 인디케이터 */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex gap-1.5 sm:gap-2">
          {campaigns.map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`h-1 rounded-full transition-all ${
                i === currentIndex && !showLockCard
                  ? 'w-6 sm:w-8 bg-white'
                  : i < currentIndex || showLockCard
                  ? 'w-1 bg-white/60'
                  : 'w-1 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 첫 카드일 때 안내 메시지 */}
      {currentIndex === 0 && !showLockCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-white/60 text-xs sm:text-sm animate-pulse whitespace-nowrap">
            ← 관심 없어요　　관심 있어요 →
          </p>
        </motion.div>
      )}
    </main>
  );
}