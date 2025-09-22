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
  platform: string[];
}

export default function InfluencerCampaigns() {
  const router = useRouter();
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipesLeft, setSwipesLeft] = useState(10);
  const [nextResetTime, setNextResetTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      // 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // 인플루언서 정보 확인
      const { data: influencer } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (influencer) {
        // 스와이프 리셋 시간 체크
        const resetTime = new Date(influencer.daily_swipes_reset_at);
        const now = new Date();
        
        if (now > resetTime) {
          // 리셋 시간이 지났으면 초기화
          const newResetTime = new Date();
          newResetTime.setHours(newResetTime.getHours() + 24);
          
          await supabase
            .from('influencers')
            .update({
              daily_swipes_count: 0,
              daily_swipes_reset_at: newResetTime.toISOString()
            })
            .eq('id', user.id);
          
          setSwipesLeft(10);
          setNextResetTime(newResetTime);
        } else {
          // 남은 스와이프 계산
          setSwipesLeft(Math.max(0, 10 - (influencer.daily_swipes_count || 0)));
          setNextResetTime(resetTime);
        }
      }

      // 캠페인 로드
      loadCampaigns();
    } catch (error) {
      console.error('초기화 오류:', error);
      toast.error('페이지 로드 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCampaigns = () => {
    // Mock 캠페인 데이터 - 충분한 수량 제공
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        brandName: '나이키',
        brandLogo: '👟',
        title: '2024 Summer Collection',
        description: '여름 신제품 런칭 캠페인! 활동적이고 스포티한 콘텐츠 제작자를 찾습니다.',
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
      {
        id: '3',
        brandName: '스타벅스',
        brandLogo: '☕',
        title: '여름 시즌 신메뉴 프로모션',
        description: '새로운 여름 음료와 디저트를 소개해주실 카페 인플루언서를 모집합니다.',
        budget: 2000000,
        category: '푸드',
        requirements: ['메뉴 리뷰 포스팅 2개', '매장 분위기 릴스 1개'],
        deadline: '2024-08-01',
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735',
        tags: ['카페', '디저트', '음료'],
        matchScore: 78,
        estimatedReach: 25000,
        platform: ['instagram', 'youtube']
      },
      {
        id: '4',
        brandName: '애플',
        brandLogo: '🍎',
        title: 'iPhone 15 Pro 리뷰어 모집',
        description: '최신 아이폰의 카메라 성능을 보여줄 수 있는 포토그래퍼/비디오그래퍼를 찾습니다.',
        budget: 5000000,
        category: '테크',
        requirements: ['언박싱 영상 1개', '카메라 리뷰 포스팅 3개', '비교 콘텐츠 1개'],
        deadline: '2024-07-25',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab',
        tags: ['테크', '아이폰', '리뷰'],
        matchScore: 88,
        estimatedReach: 100000,
        isSuper: true,
        platform: ['youtube', 'instagram']
      },
      {
        id: '5',
        brandName: '올리브영',
        brandLogo: '💄',
        title: '2024 베스트 아이템 추천',
        description: '올리브영 인기 제품들을 소개해주실 뷰티 인플루언서를 모집합니다.',
        budget: 2500000,
        category: '뷰티',
        requirements: ['제품 리뷰 4개', 'GRWM 영상 1개'],
        deadline: '2024-08-10',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
        tags: ['뷰티', '메이크업', '스킨케어'],
        matchScore: 82,
        estimatedReach: 40000,
        platform: ['instagram']
      },
      {
        id: '6',
        brandName: '아디다스',
        brandLogo: '⚽',
        title: '러닝화 신제품 캠페인',
        description: '러닝 커뮤니티와 함께하는 신제품 체험단을 모집합니다.',
        budget: 3500000,
        category: '패션/스포츠',
        requirements: ['러닝 영상 2개', '제품 리뷰 2개', '러닝 팁 공유 1개'],
        deadline: '2024-08-05',
        image: 'https://images.unsplash.com/photo-1539185441755-769473a23570',
        tags: ['러닝', '운동', '스포츠'],
        matchScore: 79,
        estimatedReach: 60000,
        platform: ['instagram', 'youtube']
      },
      {
        id: '7',
        brandName: '넷플릭스',
        brandLogo: '🎬',
        title: '신작 드라마 홍보 캠페인',
        description: '새로운 K-드라마를 소개할 콘텐츠 크리에이터를 찾습니다.',
        budget: 4000000,
        category: '엔터테인먼트',
        requirements: ['리뷰 영상 1개', '명장면 소개 3개', '캐릭터 분석 1개'],
        deadline: '2024-07-20',
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85',
        tags: ['넷플릭스', '드라마', 'K콘텐츠'],
        matchScore: 90,
        estimatedReach: 80000,
        isSuper: true,
        platform: ['youtube', 'instagram']
      },
      {
        id: '8',
        brandName: '코카콜라',
        brandLogo: '🥤',
        title: '여름 한정판 프로모션',
        description: '시원한 여름 분위기를 전달할 수 있는 인플루언서를 모집합니다.',
        budget: 2800000,
        category: '푸드',
        requirements: ['여름 콘셉트 포스팅 3개', '릴스 챌린지 1개'],
        deadline: '2024-07-18',
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7',
        tags: ['음료', '여름', '챌린지'],
        matchScore: 75,
        estimatedReach: 35000,
        platform: ['instagram']
      },
      {
        id: '9',
        brandName: '샤넬',
        brandLogo: '👜',
        title: '2024 F/W 컬렉션',
        description: '샤넬의 새로운 컬렉션을 우아하게 소개할 패션 인플루언서를 찾습니다.',
        budget: 8000000,
        category: '럭셔리',
        requirements: ['룩북 촬영 5개', '스타일링 팁 3개', '매장 방문기 1개'],
        deadline: '2024-08-15',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
        tags: ['럭셔리', '패션', '샤넬'],
        matchScore: 94,
        estimatedReach: 150000,
        isSuper: true,
        platform: ['instagram']
      },
      {
        id: '10',
        brandName: '무인양품',
        brandLogo: '🏠',
        title: '미니멀 라이프 캠페인',
        description: '심플한 일상을 공유하는 라이프스타일 인플루언서를 모집합니다.',
        budget: 2200000,
        category: '라이프스타일',
        requirements: ['제품 활용법 3개', '공간 인테리어 1개'],
        deadline: '2024-08-08',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
        tags: ['미니멀', '인테리어', '라이프'],
        matchScore: 81,
        estimatedReach: 30000,
        platform: ['instagram']
      },
      {
        id: '11',
        brandName: '디즈니플러스',
        brandLogo: '🏰',
        title: '마블 신작 시리즈 홍보',
        description: '마블 팬들과 소통할 수 있는 콘텐츠 크리에이터를 찾습니다.',
        budget: 3800000,
        category: '엔터테인먼트',
        requirements: ['시리즈 리뷰 2개', '캐릭터 소개 3개', '예고편 리액션 1개'],
        deadline: '2024-07-28',
        image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820',
        tags: ['마블', 'OTT', '시리즈'],
        matchScore: 86,
        estimatedReach: 70000,
        platform: ['youtube']
      },
      {
        id: '12',
        brandName: '배달의민족',
        brandLogo: '🛵',
        title: '맛집 리뷰 캠페인',
        description: '배민 추천 맛집을 소개할 푸드 인플루언서를 모집합니다.',
        budget: 1800000,
        category: '푸드',
        requirements: ['맛집 리뷰 5개', '배달 음식 추천 2개'],
        deadline: '2024-08-03',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        tags: ['맛집', '배달', '음식'],
        matchScore: 77,
        estimatedReach: 45000,
        platform: ['instagram', 'youtube']
      }
    ];

    setCampaigns(mockCampaigns);
  };

  // 스와이프 핸들러
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
        
        // DB에 지원 기록
        try {
          await supabase.from('campaign_influencers').insert({
            campaign_id: campaigns[currentIndex].id,
            influencer_id: userId,
            status: 'pending',
            message: 'ITDA 앱을 통한 자동 지원',
            price: campaigns[currentIndex].budget
          });
        } catch (error) {
          console.error('지원 기록 실패:', error);
        }
      } else {
        // 패스
        toast('다음 기회에! 👋', { icon: '💨' });
      }

      // 스와이프 카운트 업데이트
      const newSwipesLeft = swipesLeft - 1;
      setSwipesLeft(newSwipesLeft);
      
      await supabase
        .from('influencers')
        .update({
          daily_swipes_count: 10 - newSwipesLeft,
          last_swipe_at: new Date().toISOString()
        })
        .eq('id', userId);

      // 다음 캠페인으로
      if (currentIndex < campaigns.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // 캠페인이 끝났을 때
        if (swipesLeft - 1 > 0) {
          // 스와이프가 남아있으면 추가 캠페인 로드 안내
          toast('추가 캠페인을 확인하려면 새로고침 버튼을 눌러주세요! 🔄');
        } else {
          // 스와이프를 모두 사용했으면
          toast('오늘의 스와이프를 모두 사용했습니다! 내일 다시 만나요 🌟');
        }
      }
      
      setDragDirection(null);
    }, 300);
  };

  // 추가 캠페인 로드
  const loadMoreCampaigns = () => {
    // 실제로는 API에서 추가 로드
    toast('새로운 캠페인을 불러오는 중...');
    setCurrentIndex(0);
  };

  // 남은 시간 계산
  const getTimeUntilReset = () => {
    if (!nextResetTime) return '계산 중...';
    
    const now = new Date();
    const diff = nextResetTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      // 리셋 시간 도래
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
              {/* 스와이프 카운터 */}
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                오늘 {swipesLeft}/10
              </div>
              {/* 캠페인 카운터 */}
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {currentIndex + 1}/{campaigns.length}
              </div>
              {/* 리셋 타이머 */}
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
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 추가 정보 */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Calendar className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">마감일</div>
                    <div className="text-sm font-semibold">{currentCampaign.deadline}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Users className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">예상 도달</div>
                    <div className="text-sm font-semibold">{currentCampaign.estimatedReach.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <TrendingUp className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">카테고리</div>
                    <div className="text-sm font-semibold">{currentCampaign.category}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 액션 버튼 */}
        <div className="flex justify-center gap-6 mt-8">
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