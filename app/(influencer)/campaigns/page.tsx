// app/(influencer)/campaigns/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Heart, X, Clock, Filter, Sparkles, RefreshCw, Home, Search, 
  PlusCircle, Bell, User, Zap, TrendingUp, Users, Crown, Flame,
  Star, Trophy, Gift, DollarSign, MapPin, Eye, Info, ChevronUp,
  Instagram, Youtube, MessageCircle, Camera, Video, FileText,
  Timer, AlertCircle, CheckCircle, Loader, ArrowLeft, Settings
} from 'lucide-react';
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
  matchScore?: number;
  tags?: string[];
  urgency?: 'high' | 'medium' | 'low';
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
  const [showTutorial, setShowTutorial] = useState(true);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // 캠페인 데이터 - 카테고리별로 정렬된 상태
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    // 사용자 선호 카테고리 우선
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
      deadline: '48시간 후',
      location: '서울',
      deliverables: ['피드 3', '릴스 2', '스토리 5'],
      applicants: 12,
      viewingNow: 5,
      matchScore: 92,
      tags: ['스니커즈', '런닝', '스포츠웨어'],
      urgency: 'high'
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
      deadline: '3일 후',
      location: '서울/경기',
      deliverables: ['피드 2', '릴스 1', '쇼츠 1'],
      applicants: 23,
      viewingNow: 8,
      matchScore: 88,
      tags: ['K뷰티', '스킨케어', '안티에이징'],
      urgency: 'medium'
    },
    {
      id: '3',
      brand: '무인양품',
      brandLogo: '🏡',
      title: '미니멀 라이프 캠페인',
      budget: '150-250만원',
      category: '라이프',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
      requirements: ['라이프스타일', '인테리어', '미니멀리즘'],
      duration: '2주',
      engagement_rate: '3.8',
      description: '심플하고 실용적인 일상을 공유해주세요.',
      deadline: '5일 후',
      location: '전국',
      deliverables: ['피드 3', '스토리 하이라이트'],
      applicants: 18,
      viewingNow: 4,
      matchScore: 85,
      tags: ['미니멀리즘', '정리정돈', '인테리어'],
      urgency: 'low'
    },
    // 프리미엄 캠페인
    {
      id: '4',
      brand: '샤넬',
      brandLogo: '💎',
      title: '🔥 COCO CRUSH 앰배서더',
      budget: '1,000-1,500만원',
      category: '럭셔리',
      image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d',
      requirements: ['럭셔리', '20만+ 팔로워', 'VIP 등급'],
      duration: '3개월',
      engagement_rate: '6.0',
      description: '샤넬의 새로운 주얼리 라인 앰배서더를 모집합니다.',
      deadline: '24시간 후',
      location: '서울',
      deliverables: ['전속 계약', '화보', '행사'],
      isPremium: true,
      applicants: 156,
      viewingNow: 42,
      matchScore: 95,
      tags: ['럭셔리', '주얼리', 'VIP'],
      urgency: 'high'
    },
    // 다른 카테고리들
    {
      id: '5',
      brand: '스타벅스',
      brandLogo: '☕',
      title: '여름 시즌 신메뉴',
      budget: '100-200만원',
      category: 'F&B',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
      requirements: ['카페', '음료', '서울'],
      duration: '1주',
      engagement_rate: '3.8',
      description: '새로운 여름 음료를 소개해주세요.',
      deadline: '7일 후',
      location: '전국',
      deliverables: ['릴스 1', '스토리 3'],
      applicants: 34,
      viewingNow: 12,
      matchScore: 75,
      tags: ['카페', '음료', '여름'],
      urgency: 'low'
    }
  ]);

  // 타이머 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= nextRefreshTime) {
        setRemainingSwipes(10);
        setNextRefreshTime(new Date(now.getTime() + 3600000));
        // 새로운 캠페인 로드 애니메이션
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          // 새 캠페인 추가 로직
        }, 1500);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextRefreshTime]);

  // 첫 방문 튜토리얼
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('swipeTutorial');
    if (hasSeenTutorial) {
      setShowTutorial(false);
    }
  }, []);

  const handleSwipeRight = () => {
    if (remainingSwipes <= 0) {
      alert('오늘의 스와이프를 모두 사용했습니다! 1시간 후 새로운 캠페인이 추가됩니다.');
      return;
    }

    const currentCampaign = campaigns[currentIndex];
    setLikedCampaigns([...likedCampaigns, currentCampaign.id]);
    setRemainingSwipes(prev => prev - 1);
    
    // 매칭 성공 애니메이션
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // 매칭 알림
    showMatchNotification(currentCampaign);
    
    moveToNext();
  };

  const handleSwipeLeft = () => {
    if (remainingSwipes <= 0) return;
    
    const currentCampaign = campaigns[currentIndex];
    setRejectedCampaigns([...rejectedCampaigns, currentCampaign.id]);
    setRemainingSwipes(prev => prev - 1);
    moveToNext();
  };

  const handleSuperLike = () => {
    if (remainingSwipes <= 0) return;
    
    const currentCampaign = campaigns[currentIndex];
    
    // 슈퍼 라이크 애니메이션
    confetti({
      particleCount: 200,
      spread: 100,
      colors: ['#FFD700', '#FFA500', '#FF69B4'],
      origin: { y: 0.5 }
    });
    
    setLikedCampaigns([...likedCampaigns, currentCampaign.id]);
    setRemainingSwipes(prev => prev - 1);
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < campaigns.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 모든 캠페인을 확인함
      setCurrentIndex(0);
      loadMoreCampaigns();
    }
  };

  const loadMoreCampaigns = () => {
    setIsLoading(true);
    // API 호출 시뮬레이션
    setTimeout(() => {
      // 새 캠페인 추가 로직
      setIsLoading(false);
    }, 1500);
  };

  const showMatchNotification = (campaign: Campaign) => {
    // 매칭 알림 표시 (실제로는 Push 알림)
    console.log(`매칭 성공! ${campaign.brand} 캠페인에 지원되었습니다.`);
  };

  const formatTimeRemaining = () => {
    const now = new Date();
    const diff = nextRefreshTime.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}분 ${seconds}초`;
  };

  // 제스처 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeStartRef.current) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - swipeStartRef.current.x;
    const diffY = endY - swipeStartRef.current.y;
    
    // 위로 스와이프 - 상세 정보
    if (Math.abs(diffY) > Math.abs(diffX) && diffY < -50) {
      setShowDetails(true);
    }
    
    swipeStartRef.current = null;
  };

  const currentCampaign = campaigns[currentIndex];

  return (
    <div className="h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white overflow-hidden">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md">
        <div className="px-4 py-3 safe-area-top">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/profile')} className="p-2">
              <User size={24} className="text-gray-700" />
            </button>
            
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-900">ITDA</span>
            </div>
            
            <button onClick={() => router.push('/applications')} className="p-2 relative">
              <Heart size={24} className="text-gray-700" />
              {likedCampaigns.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {likedCampaigns.length}
                </span>
              )}
            </button>
          </div>

          {/* 스와이프 카운터 & 타이머 */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 rounded-full">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-700">{remainingSwipes}/10</span>
              </div>
              {remainingSwipes <= 3 && (
                <span className="text-xs text-orange-600 font-medium">곧 소진!</span>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Timer className="w-4 h-4" />
              <span>{formatTimeRemaining()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 스와이프 영역 */}
      <div className="flex items-center justify-center h-full pt-32 pb-28">
        <div className="relative w-full max-w-sm mx-4">
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-3xl z-50">
              <div className="text-center">
                <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">새로운 캠페인을 불러오는 중...</p>
              </div>
            </div>
          )}

          {/* 배경 카드들 (스택 효과) */}
          {campaigns.slice(currentIndex + 1, currentIndex + 3).map((_, idx) => (
            <div
              key={idx}
              className="absolute inset-0 bg-white rounded-3xl shadow-lg"
              style={{
                transform: `scale(${0.95 - idx * 0.05}) translateY(${idx * 8}px)`,
                opacity: 1 - idx * 0.3,
                zIndex: -idx - 1
              }}
            />
          ))}

          {/* 현재 카드 */}
          <motion.div
            key={currentCampaign.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`bg-white rounded-3xl shadow-2xl overflow-hidden ${
              currentCampaign.isPremium ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
            }`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* 프리미엄 배지 */}
            {currentCampaign.isPremium && (
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                  <Crown className="w-5 h-5" />
                  <span className="font-bold text-sm">프리미엄 캠페인</span>
                </div>
              </div>
            )}

            {/* 매칭 점수 */}
            {currentCampaign.matchScore && (
              <div className="absolute top-4 right-4 z-10">
                <div className={`px-3 py-2 rounded-xl flex items-center gap-1 ${
                  currentCampaign.matchScore >= 90 ? 'bg-green-500' :
                  currentCampaign.matchScore >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
                } text-white shadow-lg`}>
                  <Star className="w-4 h-4" fill="white" />
                  <span className="font-bold text-sm">{currentCampaign.matchScore}%</span>
                </div>
              </div>
            )}

            {/* 이미지 */}
            <div className="relative h-[400px] bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={currentCampaign.image}
                alt={currentCampaign.title}
                className="w-full h-full object-cover"
              />
              
              {/* 그라디언트 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* 긴급도 표시 */}
              {currentCampaign.urgency === 'high' && (
                <div className="absolute bottom-4 left-4">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
                    <Flame className="w-4 h-4" />
                    긴급
                  </div>
                </div>
              )}

              {/* 실시간 정보 */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {currentCampaign.viewingNow && (
                  <div className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs">{currentCampaign.viewingNow}명 보는중</span>
                  </div>
                )}
              </div>
            </div>

            {/* 콘텐츠 */}
            <div className="p-5">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{currentCampaign.brandLogo}</span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{currentCampaign.brand}</h3>
                    <p className="text-sm text-gray-600">{currentCampaign.category}</p>
                  </div>
                </div>
                <p className="text-gray-900 font-medium">{currentCampaign.title}</p>
              </div>

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
              <div className="flex flex-wrap gap-2 mb-3">
                {currentCampaign.tags?.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 상세 정보 버튼 */}
              <button
                onClick={() => setShowDetails(true)}
                className="w-full py-2 flex items-center justify-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm">위로 스와이프해서 자세히 보기</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="absolute bottom-0 left-0 right-0 pb-24">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleSwipeLeft}
            disabled={remainingSwipes === 0}
            className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100"
          >
            <X className="w-7 h-7 text-red-500" />
          </button>
          
          <button
            onClick={handleSuperLike}
            disabled={remainingSwipes === 0}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100"
          >
            <Star className="w-8 h-8 text-white" fill="white" />
          </button>
          
          <button
            onClick={handleSwipeRight}
            disabled={remainingSwipes === 0}
            className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100"
          >
            <Heart className="w-7 h-7 text-green-500" fill="rgb(34 197 94)" />
          </button>
        </div>
      </div>

      {/* 상세 정보 바텀시트 */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">캠페인 상세</h3>
                  <button onClick={() => setShowDetails(false)}>
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-8 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {/* 설명 */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">캠페인 소개</h4>
                    <p className="text-gray-600">{currentCampaign.description}</p>
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
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">제작 콘텐츠</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentCampaign.deliverables?.map((item, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 위치 & 마감일 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">위치</h4>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{currentCampaign.location}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">마감일</h4>
                      <div className="flex items-center gap-2 text-red-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{currentCampaign.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* 지원자 현황 */}
                  {currentCampaign.applicants && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">현재 지원자</p>
                          <p className="text-2xl font-bold text-gray-900">{currentCampaign.applicants}명</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">예상 경쟁률</p>
                          <p className="text-xl font-bold text-purple-600">1:{Math.round(currentCampaign.applicants / 3)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => {
                        handleSwipeLeft();
                        setShowDetails(false);
                      }}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                    >
                      건너뛰기
                    </button>
                    <button 
                      onClick={() => {
                        handleSwipeRight();
                        setShowDetails(false);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium"
                    >
                      지원하기
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 튜토리얼 오버레이 */}
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => {
            setShowTutorial(false);
            localStorage.setItem('swipeTutorial', 'true');
          }}
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-center mb-4">스와이프 가이드</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">오른쪽: 캠페인 지원</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm text-gray-700">왼쪽: 건너뛰기</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ChevronUp className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-700">위로: 상세 정보</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowTutorial(false);
                localStorage.setItem('swipeTutorial', 'true');
              }}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium"
            >
              시작하기
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}