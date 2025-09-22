'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Heart, X, Clock, Filter, Sparkles, RefreshCw, 
  Star, Trophy, Gift, DollarSign, MapPin, Eye, Info, ChevronUp,
  Instagram, Youtube, MessageCircle, Camera, Video, FileText,
  Timer, AlertCircle, CheckCircle, Loader, Crown, Flame,
  TrendingUp, Users, Zap, Brain, Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CountdownTimer from '@/components/ui/CountdownTimer';

// 캠페인 타입 정의
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
  isVIP?: boolean;
  applicants?: number;
  viewingNow?: number;
  matchScore?: number;
  tags?: string[];
  urgency?: 'high' | 'medium' | 'low';
  perks?: string[];
  aiTip?: string;
  isLocked?: boolean;
  unlockTime?: string;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCampaigns, setLikedCampaigns] = useState<string[]>([]);
  const [rejectedCampaigns, setRejectedCampaigns] = useState<string[]>([]);
  const [userCategories] = useState(['패션', '뷰티', '라이프']); // 사용자 선호 카테고리
  const [remainingSwipes, setRemainingSwipes] = useState(10);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date>(new Date(Date.now() + 3600000)); // 1시간 후
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // 카테고리 진행도 타입 정의
  type CategoryProgress = {
    [key: string]: {
      viewed: number;
      total: number;
    };
  };

  // 카테고리별 진행도
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress>({
    '패션': { viewed: 3, total: 5 },
    '뷰티': { viewed: 2, total: 3 },
    '라이프': { viewed: 1, total: 2 }
  });

  // 캠페인 데이터
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    // 캠페인 데이터 생성
    const campaignData: Campaign[] = [
      // VIP 캠페인
      {
        id: 'vip-1',
        isVIP: true,
        brand: '루이비통',
        brandLogo: '👜',
        title: '2024 F/W 컬렉션 앰버서더',
        category: '패션',
        budget: '1000만원+',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
        matchScore: 98,
        requirements: ['10만+ 팔로워', '패션 전문', 'MZ세대'],
        perks: ['제품 증정', 'VIP 이벤트 초청', '장기 계약 가능'],
        urgency: 'high',
        applicants: 5,
        viewingNow: 12,
        aiTip: '당신의 프로필과 98% 매칭! 놓치지 마세요.',
        duration: '3개월',
        deliverables: ['피드 10', '릴스 5', '스토리 20'],
        deadline: '24시간 후'
      },
      // 프리미엄 캠페인
      {
        id: 'premium-1',
        isPremium: true,
        brand: '샤넬 뷰티',
        brandLogo: '💄',
        title: '신제품 론칭 체험단',
        category: '뷰티',
        budget: '500-700만원',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
        matchScore: 92,
        requirements: ['뷰티 인플루언서', '5% 이상 참여율'],
        perks: ['풀 제품 라인 증정', '뷰티 클래스'],
        urgency: 'medium',
        applicants: 23,
        deadline: '48시간 후',
        duration: '4주',
        deliverables: ['피드 5', '릴스 3', '스토리 10']
      },
      // 일반 캠페인
      {
        id: '1',
        brand: '나이키',
        brandLogo: '👟',
        title: '에어맥스 2024 런칭',
        budget: '300-500만원',
        category: '패션',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        requirements: ['스포츠/피트니스', '20-30대', '10만+ 팔로워'],
        duration: '2주',
        engagement_rate: '4.5',
        description: '새로운 에어맥스를 함께 알릴 인플루언서를 찾습니다.',
        deadline: '3일 후',
        location: '서울',
        deliverables: ['피드 3', '릴스 2', '스토리 5'],
        applicants: 12,
        viewingNow: 5,
        matchScore: 85,
        tags: ['스니커즈', '런닝', '스포츠웨어'],
        urgency: 'medium'
      },
      {
        id: '2',
        brand: '설화수',
        brandLogo: '🌸',
        title: '윤조에센스 체험단',
        budget: '200-300만원',
        category: '뷰티',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
        requirements: ['뷰티', '스킨케어', '30-40대'],
        duration: '3주',
        engagement_rate: '4.1',
        description: '프리미엄 한방 스킨케어를 체험하고 리뷰해주세요.',
        deadline: '5일 후',
        deliverables: ['피드 2', '릴스 1', '스토리 3'],
        matchScore: 78,
        tags: ['스킨케어', 'K뷰티', '안티에이징']
      },
      {
        id: '3',
        brand: '무인양품',
        brandLogo: '🏠',
        title: '라이프스타일 콘텐츠',
        budget: '150-200만원',
        category: '라이프',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
        requirements: ['미니멀라이프', '인테리어', '일상'],
        duration: '2주',
        deliverables: ['피드 2', '스토리 5'],
        matchScore: 72,
        tags: ['라이프스타일', '미니멀', '인테리어']
      },
      // 잠긴 캠페인
      {
        id: 'locked-1',
        brand: '스타벅스',
        brandLogo: '☕',
        title: '여름 시즌 메뉴 프로모션',
        category: '음식',
        budget: '150-200만원',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
        requirements: ['카페 콘텐츠', '일상 브이로그'],
        duration: '1주',
        isLocked: true,
        unlockTime: '2시간 후',
        matchScore: 65
      }
    ];

    setCampaigns(campaignData);
    
    // 첫 방문 시 튜토리얼 표시
    const isFirstVisit = localStorage.getItem('swipeTutorialShown') !== 'true';
    if (isFirstVisit) {
      setShowTutorial(true);
      localStorage.setItem('swipeTutorialShown', 'true');
    }
  }, []);

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeStartRef.current || !isDragging) return;
    
    const deltaX = e.touches[0].clientX - swipeStartRef.current.x;
    const deltaY = e.touches[0].clientY - swipeStartRef.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    
    // 스와이프 방향 표시
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else if (deltaY < -50) {
      setSwipeDirection('up');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeStartRef.current || !isDragging) return;
    
    const threshold = 100;
    const { x, y } = dragOffset;
    
    if (Math.abs(x) > threshold) {
      // 좌우 스와이프
      if (x > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    } else if (y < -threshold) {
      // 위로 스와이프 (상세보기)
      setShowDetails(true);
    }
    
    // 리셋
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
    swipeStartRef.current = null;
  };

  // 스와이프 액션
  const handleSwipeLeft = () => {
    if (remainingSwipes === 0) return;
    
    const campaign = campaigns[currentIndex];
    setRejectedCampaigns([...rejectedCampaigns, campaign.id]);
    moveToNext();
  };

  const handleSwipeRight = () => {
    if (remainingSwipes === 0) return;
    
    const campaign = campaigns[currentIndex];
    if (campaign.isLocked) {
      alert('이 캠페인은 아직 잠겨있습니다. 다른 카테고리를 먼저 확인해주세요!');
      return;
    }
    
    setLikedCampaigns([...likedCampaigns, campaign.id]);
    
    // VIP 캠페인 지원 시 특별 효과
    if (campaign.isVIP) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9333EA', '#EC4899', '#F59E0B']
      });
    }
    
    // 카테고리 진행도 업데이트
    updateCategoryProgress(campaign.category);
    
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < campaigns.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRemainingSwipes(remainingSwipes - 1);
    } else {
      // 캠페인 끝
      setIsLoading(true);
      setTimeout(() => {
        alert('오늘의 캠페인을 모두 확인했습니다! 1시간 후에 새로운 캠페인이 추가됩니다.');
        setIsLoading(false);
      }, 1000);
    }
  };

  const updateCategoryProgress = (category: string) => {
    setCategoryProgress(prev => ({
      ...prev,
      [category]: {
        viewed: (prev[category]?.viewed || 0) + 1,
        total: prev[category]?.total || 0
      }
    }));
  };

  if (campaigns.length === 0 || currentIndex >= campaigns.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const currentCampaign = campaigns[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* 상단 정보 바 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-30 shadow-sm">
        <div className="px-4 py-3">
          {/* 카테고리 진행도 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {Object.entries(categoryProgress).slice(0, 3).map(([cat, progress]) => (
                <div key={cat} className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">{cat}</span>
                  <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 transition-all"
                      style={{ width: `${progress.total > 0 ? (progress.viewed / progress.total) * 100 : 0}%` }}
                    />
                  </div>
                  {progress.total > 0 && progress.viewed >= progress.total && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 스와이프 카운터 & 타이머 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-gray-900">{remainingSwipes} 스와이프 남음</span>
            </div>
            <CountdownTimer 
              targetTime={nextRefreshTime} 
              className="text-sm text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* 메인 스와이프 영역 - 모바일 중앙 정렬 강화 */}
      <div className="fixed inset-0 flex items-center justify-center" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <div className="relative w-full max-w-md mx-2 sm:mx-4" style={{ height: 'calc(100vh - 140px)', maxHeight: '600px' }}>
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-3xl z-50">
              <div className="text-center">
                <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">새로운 캠페인을 불러오는 중...</p>
              </div>
            </div>
          )}

          {/* 배경 카드들 (스택 효과) - 크기 조정 */}
          {campaigns.slice(currentIndex + 1, currentIndex + 3).map((_, idx) => (
            <div
              key={idx}
              className="absolute inset-0 bg-white rounded-3xl shadow-lg"
              style={{
                transform: `scale(${0.95 - idx * 0.05}) translateY(${idx * 10}px)`,
                opacity: 1 - idx * 0.3,
                zIndex: -idx - 1,
                height: '100%'
              }}
            />
          ))}

          {/* 현재 카드 - 모바일 최적화 크기 & 높이 100% */}
          <motion.div
            key={currentCampaign.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: dragOffset.x,
              y: dragOffset.y,
              rotate: dragOffset.x * 0.1
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-white rounded-3xl shadow-2xl overflow-hidden h-full ${
              currentCampaign.isVIP ? 'ring-4 ring-yellow-400 ring-opacity-50' : 
              currentCampaign.isPremium ? 'ring-2 ring-purple-400' : ''
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {/* VIP/프리미엄 배지 */}
            {currentCampaign.isVIP && (
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg animate-pulse">
                  <Crown className="w-5 h-5" />
                  <span className="font-bold text-sm">VIP 캠페인</span>
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
            )}

            {/* 매칭 점수 */}
            {currentCampaign.matchScore && (
              <div className="absolute top-4 right-4 z-10">
                <div className={`px-3 py-2 rounded-xl flex items-center gap-1 shadow-lg ${
                  currentCampaign.matchScore >= 90 ? 'bg-green-500' :
                  currentCampaign.matchScore >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
                } text-white`}>
                  <Brain className="w-4 h-4" />
                  <span className="font-bold text-sm">{currentCampaign.matchScore}%</span>
                </div>
              </div>
            )}

            {/* 이미지 섹션 - 비율 조정 */}
            <div className="relative h-[45%]">
              <img 
                src={currentCampaign.image} 
                alt={currentCampaign.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              {/* 실시간 정보 */}
              {currentCampaign.viewingNow && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="px-3 py-1 bg-black/50 backdrop-blur text-white rounded-full text-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>{currentCampaign.viewingNow}명 보는중</span>
                  </div>
                  {currentCampaign.applicants && (
                    <div className="px-3 py-1 bg-black/50 backdrop-blur text-white rounded-full text-sm">
                      {currentCampaign.applicants}명 지원
                    </div>
                  )}
                </div>
              )}

              {/* 잠긴 상태 */}
              {currentCampaign.isLocked && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Lock className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-bold">{currentCampaign.unlockTime} 해제</p>
                    <p className="text-sm opacity-80">다른 카테고리를 먼저 확인하세요</p>
                  </div>
                </div>
              )}

              {/* 스와이프 인디케이터 */}
              {swipeDirection && (
                <div className={`absolute inset-0 flex items-center justify-center ${
                  swipeDirection === 'right' ? 'bg-green-500/30' :
                  swipeDirection === 'left' ? 'bg-red-500/30' :
                  'bg-purple-500/30'
                }`}>
                  <div className={`px-6 py-3 rounded-full ${
                    swipeDirection === 'right' ? 'bg-green-500' :
                    swipeDirection === 'left' ? 'bg-red-500' :
                    'bg-purple-500'
                  } text-white font-bold text-xl shadow-2xl`}>
                    {swipeDirection === 'right' ? '관심 있어요!' :
                     swipeDirection === 'left' ? '패스' :
                     '자세히 보기'}
                  </div>
                </div>
              )}
            </div>

            {/* 콘텐츠 섹션 */}
            <div className="p-5">
              {/* 브랜드 정보 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentCampaign.brandLogo}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{currentCampaign.brand}</h3>
                    <p className="text-sm text-gray-600">{currentCampaign.category}</p>
                  </div>
                </div>
                {currentCampaign.urgency === 'high' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold animate-pulse">
                    긴급
                  </span>
                )}
              </div>
              
              <p className="text-gray-900 font-medium mb-3">{currentCampaign.title}</p>

              {/* AI 팁 */}
              {currentCampaign.aiTip && (
                <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {currentCampaign.aiTip}
                  </p>
                </div>
              )}

              {/* 예산 & 기간 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">{currentCampaign.budget}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{currentCampaign.duration}</span>
                </div>
              </div>

              {/* 태그 */}
              {currentCampaign.tags && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentCampaign.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 특전 */}
              {currentCampaign.perks && (
                <div className="flex items-center gap-2 text-xs text-purple-600">
                  <Gift className="w-4 h-4" />
                  <span>{currentCampaign.perks[0]}</span>
                  {currentCampaign.perks.length > 1 && (
                    <span>+{currentCampaign.perks.length - 1}</span>
                  )}
                </div>
              )}

              {/* 상세 정보 버튼 */}
              <button
                onClick={() => setShowDetails(true)}
                className="w-full mt-3 py-2 flex items-center justify-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm">위로 스와이프해서 자세히 보기</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 액션 버튼들 - 모바일 위치 조정 */}
      <div className="fixed bottom-20 left-0 right-0 z-30">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleSwipeLeft}
            disabled={remainingSwipes === 0}
            className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100 active:scale-95"
          >
            <X className="w-6 h-6 text-red-500" />
          </button>
          
          <button
            onClick={() => setShowDetails(true)}
            className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
          >
            <Info className="w-7 h-7 text-white" />
          </button>
          
          <button
            onClick={handleSwipeRight}
            disabled={remainingSwipes === 0}
            className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100 active:scale-95"
          >
            <Heart className="w-6 h-6 text-green-500" />
          </button>
        </div>
      </div>

      {/* 상세 모달 */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-h-[80vh] rounded-t-3xl overflow-hidden"
            >
              {/* 헤더 */}
              <div className="sticky top-0 bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">캠페인 상세정보</h3>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-8 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {/* 설명 */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">캠페인 소개</h4>
                    <p className="text-gray-600">{currentCampaign.description || '멋진 캠페인입니다!'}</p>
                  </div>

                  {/* 요구사항 */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">요구사항</h4>
                    <div className="space-y-2">
                      {currentCampaign.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 제작물 */}
                  {currentCampaign.deliverables && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">제작 콘텐츠</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentCampaign.deliverables.map((item, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 특전 */}
                  {currentCampaign.perks && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">특전</h4>
                      <div className="space-y-2">
                        {currentCampaign.perks.map((perk, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-gray-600">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 위치 & 마감일 */}
                  <div className="grid grid-cols-2 gap-4">
                    {currentCampaign.location && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">위치</h4>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{currentCampaign.location}</span>
                        </div>
                      </div>
                    )}
                    {currentCampaign.deadline && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">마감일</h4>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Timer className="w-4 h-4" />
                          <span className="text-sm">{currentCampaign.deadline}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 지원 버튼 */}
                <button
                  onClick={() => {
                    handleSwipeRight();
                    setShowDetails(false);
                  }}
                  disabled={currentCampaign.isLocked}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {currentCampaign.isLocked ? '잠긴 캠페인' : '이 캠페인 지원하기'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}