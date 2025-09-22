// app/(influencer)/campaigns/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, X, Star, Share2, Clock, TrendingUp, Users, 
  DollarSign, Calendar, ChevronLeft, ChevronRight,
  Sparkles, Zap, AlertCircle, Info, Instagram, Youtube,
  Coffee, CheckCircle, XCircle, Shield, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { saveSwipeAction } from '@/lib/campaign/actions'; // 추가된 import

interface Campaign {
  id: string;
  brandName: string;
  brandLogo: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  requirements: string[];
  deadline: string;
  image: string;
  tags: string[];
  matchScore: number;
  estimatedReach: number;
  isSuper?: boolean;
  platform?: string[];
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [swipesLeft, setSwipesLeft] = useState(10);
  const [showDetails, setShowDetails] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [nextResetTime, setNextResetTime] = useState<Date | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserId(user.id);

      // 스와이프 카운트 확인
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todaySwipes } = await supabase
        .from('swipe_history')
        .select('id')
        .eq('influencer_id', user.id)
        .gte('swiped_at', today.toISOString());

      const swipesUsed = todaySwipes?.length || 0;
      setSwipesLeft(10 - swipesUsed);

      // 다음 리셋 시간 계산 (3시간마다)
      const nextReset = new Date();
      const hours = nextReset.getHours();
      const nextResetHour = Math.ceil(hours / 3) * 3;
      nextReset.setHours(nextResetHour, 0, 0, 0);
      setNextResetTime(nextReset);

      // 캠페인 로드
      loadCampaigns();
    } catch (error) {
      console.error('초기화 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCampaigns = async () => {
    // 더미 데이터 (실제로는 Supabase에서 가져와야 함)
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        brandName: '나이키',
        brandLogo: '👟',
        title: '여름 운동화 캠페인',
        description: '활동적이고 스포티한 콘텐츠 제작자를 찾습니다.',
        budget: 3000000,
        category: '패션/스포츠',
        requirements: ['피드 포스팅 3개', '릴스 2개', '스토리 5개'],
        deadline: '2024-07-30',
        image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c',
        tags: ['스포츠', '피트니스', '여름'],
        matchScore: 92,
        estimatedReach: 50000,
        isSuper: true,
        platform: ['instagram', 'youtube']
      },
      {
        id: '2',
        brandName: '이니스프리',
        brandLogo: '🌿',
        title: '그린티 씨드 세럼 체험단',
        description: '자연주의 스킨케어 제품 리뷰! 피부 고민이 있는 분들의 솔직한 후기를 원합니다.',
        budget: 1500000,
        category: '뷰티',
        requirements: ['사용 후기 포스팅 2개', '비포애프터 릴스 1개'],
        deadline: '2024-07-15',
        image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908',
        tags: ['스킨케어', '뷰티', 'K뷰티'],
        matchScore: 85,
        estimatedReach: 30000,
        platform: ['instagram']
      },
      // ... 더 많은 캠페인
    ];

    setCampaigns(mockCampaigns);
  };

  // 스와이프 핸들러 - 수정된 부분
  const handleSwipe = async (direction: 'left' | 'right') => {
    if (swipesLeft <= 0) {
      toast.error('오늘의 스와이프를 모두 사용했습니다!');
      return;
    }

    if (!userId) return;

    setDragDirection(direction);
    
    // 애니메이션 후 처리
    setTimeout(async () => {
      if (direction === 'right') {
        // 지원하기
        toast.success('캠페인에 지원했습니다! 🎉');
        
        // DB에 저장 - 새로 추가된 부분
        await saveSwipeAction(
          campaigns[currentIndex].id,
          userId,
          'like'
        );
        
      } else {
        // 패스
        toast('다음 기회에! 👋', { icon: '💨' });
        
        // DB에 저장 - 새로 추가된 부분
        await saveSwipeAction(
          campaigns[currentIndex].id,
          userId,
          'pass'
        );
      }

      // 스와이프 카운트 업데이트
      const newSwipesLeft = swipesLeft - 1;
      setSwipesLeft(newSwipesLeft);

      // 다음 캠페인으로
      if (currentIndex < campaigns.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // 캠페인이 끝났을 때
        if (swipesLeft - 1 > 0) {
          toast('추가 캠페인을 확인하려면 새로고침 버튼을 눌러주세요! 🔄');
        } else {
          toast('오늘의 스와이프를 모두 사용했습니다! 내일 다시 만나요 🌟');
        }
      }
      
      setDragDirection(null);
    }, 300);
  };

  // 추가 캠페인 로드
  const loadMoreCampaigns = () => {
    toast('새로운 캠페인을 불러오는 중...');
    setCurrentIndex(0);
  };

  // 남은 시간 계산
  const getTimeUntilReset = () => {
    if (!nextResetTime) return '계산 중...';
    
    const now = new Date();
    const diff = nextResetTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      initializePage();
      return '리셋 중...';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}시간 ${minutes}분`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">캠페인을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0 || currentIndex >= campaigns.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">오늘은 여기까지!</h2>
          <p className="text-gray-600 mb-4">
            모든 캠페인을 확인했습니다. 
            내일 다시 새로운 캠페인이 준비됩니다.
          </p>
          <p className="text-sm text-purple-600 font-semibold">
            다음 업데이트: {getTimeUntilReset()}
          </p>
          <button
            onClick={() => router.push('/applications')}
            className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg"
          >
            지원 현황 보기
          </button>
        </div>
      </div>
    );
  }

  const currentCampaign = campaigns[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">캠페인 탐색</h1>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                오늘 {swipesLeft}/10
              </div>
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {currentIndex + 1}/{campaigns.length}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {getTimeUntilReset()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 카드 영역 */}
      <div className="max-w-lg mx-auto px-4 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCampaign.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: dragDirection === 'left' ? -500 : dragDirection === 'right' ? 500 : 0,
              rotate: dragDirection === 'left' ? -30 : dragDirection === 'right' ? 30 : 0
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative"
          >
            {/* 슈퍼 캠페인 표시 */}
            {currentCampaign.isSuper && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI 추천
                </div>
              </div>
            )}

            {/* 캠페인 카드 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* 이미지 영역 */}
              <div className="relative h-64 bg-gray-200">
                <img 
                  src={currentCampaign.image}
                  alt={currentCampaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* 브랜드 정보 */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="text-2xl">{currentCampaign.brandLogo}</span>
                  <span className="font-semibold text-sm">{currentCampaign.brandName}</span>
                  {currentCampaign.matchScore >= 90 && (
                    <Shield className="w-4 h-4 text-blue-500" />
                  )}
                </div>

                {/* 매칭 점수 */}
                <div className="absolute top-4 right-4 bg-purple-600 text-white rounded-lg px-3 py-2">
                  <div className="text-xs">매칭률</div>
                  <div className="text-lg font-bold">{currentCampaign.matchScore}%</div>
                </div>

                {/* 예산 */}
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-sm opacity-90">예산</div>
                  <div className="text-2xl font-bold">₩{currentCampaign.budget.toLocaleString()}</div>
                </div>
              </div>

              {/* 콘텐츠 영역 */}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{currentCampaign.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{currentCampaign.description}</p>

                {/* 태그 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentCampaign.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 요구사항 */}
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-sm mb-2">요구사항</h3>
                  <ul className="space-y-1">
                    {currentCampaign.requirements.map((req, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-purple-600 mt-0.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 추가 정보 */}
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>마감 {currentCampaign.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>예상 도달 {currentCampaign.estimatedReach.toLocaleString()}명</span>
                  </div>
                </div>
              </div>

              {/* 상세보기 버튼 */}
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full py-3 bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Info className="w-4 h-4" />
                {showDetails ? '간단히 보기' : '자세히 보기'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 액션 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <div className="max-w-lg mx-auto flex justify-center gap-6 mt-8">
          <button
            onClick={() => handleSwipe('left')}
            disabled={swipesLeft === 0}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
          >
            <X className="w-8 h-8 text-red-500" />
          </button>

          <button
            onClick={() => setShowDetails(true)}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Info className="w-8 h-8 text-blue-500" />
          </button>

          <button
            onClick={() => handleSwipe('right')}
            disabled={swipesLeft === 0}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
          >
            <Heart className="w-8 h-8 text-green-500" />
          </button>
        </div>

        {/* 스와이프 제한 안내 */}
        {swipesLeft === 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  오늘의 스와이프를 모두 사용했습니다
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {getTimeUntilReset()} 후에 다시 10개의 캠페인을 확인할 수 있습니다.
                  프리미엄 구독으로 무제한 스와이프를 즐기세요!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 팁 */}
        <div className="mt-6 text-center text-xs text-gray-500">
          💡 왼쪽: 패스 | 오른쪽: 지원하기
        </div>
      </div>
    </div>
  );
}