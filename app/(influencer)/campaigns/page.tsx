'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Heart, X, Star, Share2, Clock, TrendingUp, Users, 
  DollarSign, Calendar, ChevronUp,
  Sparkles, Zap, AlertCircle, Info, Instagram, Youtube,
  Coffee, CheckCircle, XCircle, Shield, RefreshCw, MapPin, Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { saveSwipeAction } from '@/lib/campaign/actions';
import { createClient } from '@/lib/supabase/client';
import { TypedSupabase } from '@/lib/supabase/typed-client';
import { useInfluencerMatching } from '@/hooks/useAIMatching';
import type { Campaign as DBCampaign, Influencer, Advertiser } from '@/types/helpers';

// UI용 Campaign 인터페이스
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
  const [exitX, setExitX] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swipesLeft, setSwipesLeft] = useState(100);
  const [showDetails, setShowDetails] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Influencer | null>(null);
  const [nextResetTime, setNextResetTime] = useState<Date | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();
  const db = new TypedSupabase();
  const matchingSystem = useInfluencerMatching(userId || undefined);

  // 모션 값들
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // LIKE/NOPE 인디케이터 opacity
  const likeOpacity = useTransform(x, [-100, 0, 100], [0, 0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0, 100], [1, 0, 0]);

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    if (matchingSystem?.currentCampaign && userId) {
      updateCampaignWithMatchScore();
    }
  }, [matchingSystem?.currentCampaign, matchingSystem?.matchScore, userId]);

  const initializePage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);
      
      // 프로필 로드
      const profile = await db.getInfluencer(user.id);
      if (profile) {
        setUserProfile(profile);
      }
      
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      setNextResetTime(tomorrow);
      
      // 캠페인 로드
      await loadCampaigns(user.id);
    } catch (error) {
      console.error('Initialization error:', error);
      toast.error('초기화 중 문제가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampaignWithMatchScore = async () => {
    if (!matchingSystem?.currentCampaign || !userId) return;

    const dbCampaign = matchingSystem.currentCampaign;
    
    let brandName = '브랜드명 없음';
    let brandLogo = '🏢';
    
    if (dbCampaign.advertiser_id) {
      const advertiser = await db.getAdvertiser(dbCampaign.advertiser_id);
      if (advertiser) {
        brandName = advertiser.company_name || '브랜드명 없음';
        brandLogo = advertiser.company_logo || '🏢';
      }
    }
    
    const uiCampaign: Campaign = {
      id: dbCampaign.id,
      brandName,
      brandLogo,
      title: dbCampaign.name || '제목 없음',
      description: dbCampaign.description || '',
      budget: dbCampaign.budget || 0,
      category: dbCampaign.categories?.[0] || '기타',
      requirements: dbCampaign.requirements || [],
      deadline: dbCampaign.end_date || '',
      image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6',
      tags: dbCampaign.categories || [],
      matchScore: matchingSystem.matchScore || 75,
      estimatedReach: 50000,
      platform: ['instagram']
    };

    setCampaigns([uiCampaign]);
    setCurrentIndex(0);
  };

  const loadCampaigns = async (uid?: string) => {
    const currentUserId = uid || userId;
    if (!currentUserId) return;
    
    try {
      const dbCampaigns = await db.getActiveCampaigns(20);
      
      if (!dbCampaigns || dbCampaigns.length === 0) {
        loadDummyCampaigns();
        return;
      }

      const uiCampaigns = await Promise.all(
        dbCampaigns.map(async (campaign) => {
          let brandName = '브랜드명 없음';
          let brandLogo = '🏢';
          
          if (campaign.advertiser_id) {
            try {
              const advertiser = await db.getAdvertiser(campaign.advertiser_id);
              if (advertiser) {
                brandName = advertiser.company_name || '브랜드명 없음';
                brandLogo = advertiser.company_logo || '🏢';
              }
            } catch (error) {
              console.error('Error loading advertiser:', error);
            }
          }
          
          // 랜덤 이미지 선택
          const images = [
            'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6',
            'https://images.unsplash.com/photo-1556906781-9a412961c28c',
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
            'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908',
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93'
          ];
          
          return {
            id: campaign.id,
            brandName,
            brandLogo,
            title: campaign.name || '제목 없음',
            description: campaign.description || '',
            budget: campaign.budget || 0,
            category: campaign.categories?.[0] || '기타',
            requirements: campaign.requirements || [],
            deadline: campaign.end_date || '',
            image: images[Math.floor(Math.random() * images.length)],
            tags: campaign.categories || [],
            matchScore: Math.floor(Math.random() * 30) + 70,
            estimatedReach: Math.floor(Math.random() * 50000) + 10000,
            platform: ['instagram']
          };
        })
      );

      setCampaigns(uiCampaigns);
      setCurrentIndex(0);
    } catch (error) {
      console.error('캠페인 로드 실패:', error);
      loadDummyCampaigns();
    }
  };

  const loadDummyCampaigns = () => {
    const mockCampaigns: Campaign[] = [
      {
        id: `dummy-${Date.now()}-1`,
        brandName: '나이키',
        brandLogo: '✔',
        title: '2024 러닝 캠페인',
        description: '열정적인 러너를 찾습니다. 건강한 라이프스타일을 공유해주세요.',
        budget: 3000000,
        category: '스포츠/피트니스',
        requirements: ['러닝 영상 3개', '스토리 5개', '피드 포스트 2개'],
        deadline: '2024-08-01',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        tags: ['러닝', '피트니스', '나이키'],
        matchScore: 92,
        estimatedReach: 50000,
        platform: ['instagram', 'youtube']
      },
      {
        id: `dummy-${Date.now()}-2`,
        brandName: '이니스프리',
        brandLogo: '🌿',
        title: '그린티 씨드 세럼 리뷰',
        description: '피부 고민이 있는 분들의 솔직한 후기를 원합니다.',
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
        id: `dummy-${Date.now()}-3`,
        brandName: '스타벅스',
        brandLogo: '☕',
        title: '여름 신메뉴 프로모션',
        description: '새로운 여름 음료 라인을 소개할 카페 인플루언서를 찾습니다.',
        budget: 2000000,
        category: '푸드/음료',
        requirements: ['메뉴 리뷰 2개', '매장 방문 스토리 3개'],
        deadline: '2024-08-10',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
        tags: ['카페', '음료', '여름메뉴'],
        matchScore: 78,
        estimatedReach: 40000,
        platform: ['instagram']
      }
    ];

    setCampaigns(mockCampaigns);
  };

  // 스와이프 끝났을 때 처리
  const handleDragEnd = useCallback(async () => {
    if (isProcessing) return;
    
    const swipeThreshold = 100;
    const currentX = x.get();
    const currentY = y.get();
    
    // 위로 스와이프 - 상세보기
    if (currentY < -50) {
      setShowDetails(true);
      return;
    }
    
    // 좌우 스와이프 확인
    if (Math.abs(currentX) > swipeThreshold) {
      const direction = currentX > 0 ? 'right' : 'left';
      const campaign = campaigns[currentIndex];
      
      if (!campaign) return;
      
      // 즉시 UI 업데이트
      setIsProcessing(true);
      setExitX(currentX > 0 ? 1000 : -1000);
      setSwipesLeft(prev => Math.max(0, prev - 1));
      
      // API 호출은 백그라운드에서 (에러는 무시)
      if (userId && !campaign.id.startsWith('dummy-')) {
        const action = direction === 'right' ? 'like' : 'pass';
        
        // 비동기로 처리 (결과와 에러 모두 무시)
        saveSwipeAction(
          campaign.id,
          userId,
          action,
          {
            match_score: campaign.matchScore || 75,
            predicted_price: campaign.budget
          }
        ).catch(() => {
          // 에러 무시 - 콘솔에도 출력하지 않음
        });
      }
      
      // 즉시 다음 카드로
      setTimeout(() => {
        moveToNextCard();
        setIsProcessing(false);
      }, 150);
    }
  }, [currentIndex, campaigns, userId, isProcessing, x, y]);

  // 다음 카드로 이동
  const moveToNextCard = () => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      
      // 마지막 카드에 도달하면 새 캠페인 로드
      if (nextIndex >= campaigns.length - 2) {
        loadCampaigns();
      }
      
      // 마지막 카드면 처음으로
      if (nextIndex >= campaigns.length) {
        return 0;
      }
      
      return nextIndex;
    });
    setExitX(0);
  };

  // 버튼 클릭 스와이프
  const handleButtonSwipe = useCallback(async (direction: 'left' | 'right', isSuperLike?: boolean) => {
    if (isProcessing) return;
    
    if (swipesLeft <= 0) {
      toast.error('오늘의 스와이프를 모두 사용했습니다!');
      return;
    }

    if (!userId) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    const campaign = campaigns[currentIndex];
    if (!campaign) {
      await loadCampaigns();
      return;
    }
    
    // 즉시 UI 업데이트
    setIsProcessing(true);
    setExitX(direction === 'right' ? 1000 : -1000);
    setSwipesLeft(prev => Math.max(0, prev - 1));
    
    // API 호출은 백그라운드에서 (에러는 무시)
    if (!campaign.id.startsWith('dummy-')) {
      const action: 'pass' | 'like' | 'super_like' = direction === 'right' 
        ? (isSuperLike ? 'super_like' : 'like')
        : 'pass';
      
      // 비동기로 처리 (결과와 에러 모두 무시)
      saveSwipeAction(
        campaign.id,
        userId,
        action,
        {
          match_score: campaign.matchScore || 75,
          predicted_price: campaign.budget
        }
      ).catch(() => {
        // 에러 무시
      });
    }
    
    // 즉시 다음 카드로
    setTimeout(() => {
      moveToNextCard();
      setIsProcessing(false);
    }, 150);
  }, [currentIndex, campaigns, userId, swipesLeft, isProcessing]);

  const loadMoreCampaigns = async () => {
    toast('새로운 캠페인을 불러오는 중...');
    await loadCampaigns();
    setCurrentIndex(0);
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">캠페인을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const currentCampaign = campaigns[currentIndex];
  const nextCampaign = campaigns[currentIndex + 1];

  if (!currentCampaign && swipesLeft === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center max-w-md">
          <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">오늘은 여기까지!</h2>
          <p className="text-gray-600 mb-4">
            오늘의 스와이프를 모두 사용했습니다. 
            내일 다시 새로운 캠페인이 준비됩니다.
          </p>
          <p className="text-sm text-purple-600 font-medium">
            다음 리셋까지: {getTimeUntilReset()}
          </p>
        </div>
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">캠페인을 준비 중입니다</h2>
          <button
            onClick={() => loadCampaigns()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Itda
              </h1>
              <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 rounded-full">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                <span className="text-xs sm:text-sm font-medium text-purple-700">
                  {currentCampaign?.matchScore || 0}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={loadMoreCampaigns}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition"
                title="캠페인 새로고침"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs text-gray-500">스와이프</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-800">{swipesLeft}</p>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-t from-purple-500 to-pink-500 transition-all duration-300"
                      style={{ 
                        height: `${(swipesLeft / 100) * 100}%`,
                        marginTop: `${((100 - swipesLeft) / 100) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-2 pb-28 overflow-hidden">
        <div className="relative w-full max-w-md flex-1 flex flex-col">
          {/* 카드 영역 */}
          <div className="relative flex-1 mb-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            {/* 다음 카드 (뒤에 배치) */}
            {nextCampaign && (
              <div className="absolute inset-0">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full max-h-[580px] scale-95 opacity-60">
                  <div className="relative h-[45%]">
                    <img
                      src={nextCampaign.image}
                      alt={nextCampaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-5 h-[55%]">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {nextCampaign.title}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            {/* 현재 카드 */}
            <AnimatePresence mode="sync">
              {currentCampaign && (
                <motion.div
                  key={currentCampaign.id}
                  className="absolute inset-0"
                  style={{ 
                    x, 
                    y, 
                    rotate,
                    cursor: 'grab'
                  }}
                  drag={!isProcessing}
                  dragSnapToOrigin
                  dragConstraints={{ left: -200, right: 200, top: -100, bottom: 100 }}
                  dragElastic={1}
                  onDragEnd={handleDragEnd}
                  animate={{ 
                    x: exitX,
                    opacity: exitX ? 0 : 1,
                    scale: 1
                  }}
                  initial={{ 
                    scale: 1,
                    opacity: 1,
                    x: 0
                  }}
                  exit={{ 
                    x: exitX,
                    opacity: 0,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.15 },
                    scale: { duration: 0.15 }
                  }}
                  whileDrag={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full max-h-[580px] active:cursor-grabbing"
                    style={{ opacity }}
                  >
                    {/* 스와이프 인디케이터 */}
                    <motion.div 
                      className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
                      style={{
                        opacity: likeOpacity
                      }}
                    >
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold">
                        LIKE
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
                      style={{
                        opacity: nopeOpacity
                      }}
                    >
                      <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                        NOPE
                      </div>
                    </motion.div>

                    {/* 캠페인 이미지 */}
                    <div className="relative h-[45%]">
                      <img
                        src={currentCampaign.image}
                        alt={currentCampaign.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                      
                      {/* 브랜드 로고 */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{currentCampaign.brandLogo}</span>
                          <span className="font-semibold text-gray-800">{currentCampaign.brandName}</span>
                        </div>
                      </div>
                      
                      {/* 매치 스코어 */}
                      <div className="absolute top-4 right-4 bg-purple-600 text-white rounded-full px-3 py-1.5 flex items-center space-x-1 shadow-lg">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{currentCampaign.matchScore}%</span>
                      </div>
                    </div>
                    
                    {/* 캠페인 정보 */}
                    <div className="p-4 sm:p-5 h-[55%] flex flex-col">
                      <div className="mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                          {currentCampaign.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {currentCampaign.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-[10px] text-gray-500">예산</p>
                            <p className="text-sm font-semibold">{(currentCampaign.budget / 1000000).toFixed(1)}M</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-[10px] text-gray-500">마감</p>
                            <p className="text-sm font-semibold">
                              {new Date(currentCampaign.deadline).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-[10px] text-gray-500">예상 도달</p>
                            <p className="text-sm font-semibold">
                              {(currentCampaign.estimatedReach / 1000).toFixed(0)}K
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-orange-600" />
                          <div>
                            <p className="text-[10px] text-gray-500">카테고리</p>
                            <p className="text-sm font-semibold">{currentCampaign.category}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3 flex-1">
                        <p className="text-xs font-medium text-gray-700">필수 요구사항</p>
                        <div className="space-y-1">
                          {currentCampaign.requirements.slice(0, 2).map((req, idx) => (
                            <div key={idx} className="flex items-center space-x-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span className="text-xs text-gray-600 truncate">{req}</span>
                            </div>
                          ))}
                          {currentCampaign.requirements.length > 2 && (
                            <span className="text-xs text-purple-600 font-medium">
                              +{currentCampaign.requirements.length - 2}개 더보기
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex overflow-x-auto space-x-1.5 mb-12">
                        {currentCampaign.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full whitespace-nowrap"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* 버튼 영역 */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => handleButtonSwipe('left')}
            disabled={isProcessing}
            className="w-16 h-16 rounded-full bg-white shadow-xl border-2 border-gray-100 flex items-center justify-center hover:scale-110 hover:border-red-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            <X className="w-7 h-7 text-red-500" />
          </button>
          
          <button
            onClick={() => handleButtonSwipe('right', true)}
            disabled={isProcessing}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-200 active:scale-95 ring-4 ring-white disabled:opacity-50"
          >
            <Star className="w-9 h-9 text-white animate-pulse" />
          </button>
          
          <button
            onClick={() => handleButtonSwipe('right')}
            disabled={isProcessing}
            className="w-16 h-16 rounded-full bg-white shadow-xl border-2 border-gray-100 flex items-center justify-center hover:scale-110 hover:border-green-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            <Heart className="w-7 h-7 text-green-500" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && currentCampaign && (
          <div className="fixed inset-0 z-[60]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="absolute inset-0 bg-black/60"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                  setShowDetails(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden shadow-2xl"
              style={{ zIndex: 61 }}
            >
              <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>
              
              <div className="px-6 pb-8 overflow-y-auto max-h-[75vh]">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl">
                    {currentCampaign.brandLogo}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{currentCampaign.brandName}</h2>
                    <p className="text-gray-500">{currentCampaign.category}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{currentCampaign.matchScore}%</div>
                    <div className="text-xs text-gray-500">매치율</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3">{currentCampaign.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{currentCampaign.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-sm text-gray-600">예산</p>
                    <p className="text-xl font-bold">₩{currentCampaign.budget.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600">마감일</p>
                    <p className="text-xl font-bold">{new Date(currentCampaign.deadline).toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">요구사항</h4>
                  <div className="space-y-2">
                    {currentCampaign.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleButtonSwipe('left');
                      setShowDetails(false);
                    }}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    패스하기
                  </button>
                  <button
                    onClick={() => {
                      handleButtonSwipe('right');
                      setShowDetails(false);
                    }}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    지원하기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}