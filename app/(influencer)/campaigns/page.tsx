'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, X, Star, Share2, Clock, TrendingUp, Users, 
  DollarSign, Calendar, ChevronUp,
  Sparkles, Zap, AlertCircle, Info, Instagram, Youtube,
  Coffee, CheckCircle, XCircle, Shield, RefreshCw, MapPin, Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { saveSwipeAction } from '@/lib/campaign/actions';
import { useInfluencerMatching } from '@/hooks/useAIMatching';
import { CampaignQueueManager, SwipeActionHandler } from '@/lib/matching/realtime-matching-algorithm';

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
  const [swipesLeft, setSwipesLeft] = useState(100);
  const [showDetails, setShowDetails] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [nextResetTime, setNextResetTime] = useState<Date | null>(null);
  const [dragY, setDragY] = useState(0);

  const router = useRouter();
  const supabase = createClient();
  const matchingSystem = useInfluencerMatching(userId);

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    if (matchingSystem?.currentCampaign && userId) {
      updateCampaignWithMatchScore();
    }
  }, [matchingSystem?.currentCampaign, matchingSystem?.matchScore, userId]);

  useEffect(() => {
    if (campaigns.length === 0 && !isLoading && userId && swipesLeft > 0) {
      const loadNewCampaigns = async () => {
        await loadCampaigns();
        if (campaigns.length === 0) {
          loadDummyCampaigns();
        }
      };
      loadNewCampaigns();
    }
  }, [currentIndex]);

  const initializePage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserId(user.id);

      if (matchingSystem) {
        setSwipesLeft(matchingSystem.dailySwipes.total - matchingSystem.dailySwipes.used);
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: todaySwipes } = await supabase
          .from('swipe_history')
          .select('id')
          .eq('influencer_id', user.id)
          .gte('swiped_at', today.toISOString());

        const swipesUsed = todaySwipes?.length || 0;
        setSwipesLeft(100 - swipesUsed);
      }

      const nextReset = new Date();
      const hours = nextReset.getHours();
      const nextResetHour = Math.ceil(hours / 3) * 3;
      nextReset.setHours(nextResetHour, 0, 0, 0);
      setNextResetTime(nextReset);

      await loadCampaigns();
    } catch (error) {
      console.error('초기화 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampaignWithMatchScore = async () => {
    if (!matchingSystem?.currentCampaign || !userId) return;

    const supabaseCampaign = matchingSystem.currentCampaign;
    
    const { data: advertiser } = await supabase
      .from('advertisers')
      .select('company_name, company_logo')
      .eq('id', supabaseCampaign.advertiser_id)
      .single();

    const updatedCampaign: Campaign = {
      id: supabaseCampaign.id,
      brandName: advertiser?.company_name || '브랜드',
      brandLogo: advertiser?.company_logo || '🏢',
      title: supabaseCampaign.name,
      description: supabaseCampaign.description || '',
      budget: supabaseCampaign.budget,
      category: supabaseCampaign.categories?.[0] || '기타',
      requirements: supabaseCampaign.requirements || [],
      deadline: supabaseCampaign.end_date,
      image: (supabaseCampaign.metadata as any)?.image || 'https://images.unsplash.com/photo-1556906781-9a412961c28c',
      tags: supabaseCampaign.categories || [],
      matchScore: matchingSystem.matchScore || 0,
      estimatedReach: 50000,
      isSuper: matchingSystem.matchScore >= 90,
      platform: ['instagram']
    };

    setCampaigns(prev => {
      const existing = prev.find(c => c.id === updatedCampaign.id);
      if (existing) {
        return prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c);
      } else {
        return [...prev, updatedCampaign];
      }
    });
  };

  const loadCampaigns = async () => {
    if (!userId) return;

    try {
      const { data: influencer } = await supabase
        .from('influencers')
        .select('categories')
        .eq('id', userId)
        .single();

      if (influencer) {
        await CampaignQueueManager.generateQueue(userId, influencer.categories || []);
      }

      const { data: queueItems } = await supabase
        .from('campaign_queue')
        .select(`
          *,
          campaigns (
            *,
            advertisers (
              company_name,
              company_logo
            )
          )
        `)
        .eq('influencer_id', userId)
        .order('queue_order', { ascending: true })
        .limit(20);

      if (queueItems && queueItems.length > 0) {
        const mappedCampaigns = await Promise.all(
          queueItems.map(async (item) => {
            const campaign = item.campaigns;
            if (!campaign) return null;

            const matchScore = item.category_priority ? item.category_priority * 30 : 75;

            const formattedCampaign: Campaign = {
              id: campaign.id,
              brandName: campaign.advertisers?.company_name || '브랜드',
              brandLogo: campaign.advertisers?.company_logo || '🏢',
              title: campaign.name,
              description: campaign.description || '',
              budget: campaign.budget,
              category: campaign.categories?.[0] || '기타',
              requirements: campaign.requirements || [],
              deadline: campaign.end_date,
              image: (campaign.metadata as any)?.image || 'https://images.unsplash.com/photo-1556906781-9a412961c28c',
              tags: campaign.categories || [],
              matchScore: matchScore,
              estimatedReach: 50000,
              isSuper: matchScore >= 90 || campaign.is_premium,
              platform: ['instagram']
            };
            
            return formattedCampaign;
          })
        );

        const validCampaigns: Campaign[] = mappedCampaigns.filter(
          (campaign): campaign is Campaign => campaign !== null
        );
        
        if (validCampaigns.length > 0) {
          setCampaigns(validCampaigns);
        } else {
          loadDummyCampaigns();
        }
      } else {
        loadDummyCampaigns();
      }
    } catch (error) {
      console.error('캠페인 로드 오류:', error);
      loadDummyCampaigns();
    }
  };

  const loadDummyCampaigns = () => {
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
      {
        id: '3',
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
      },
      {
        id: '4',
        brandName: '삼성전자',
        brandLogo: '📱',
        title: '갤럭시 Z플립6 체험단',
        description: '최신 폴더블폰의 혁신적인 기능을 소개해주실 테크 인플루언서 모집!',
        budget: 5000000,
        category: '테크/가전',
        requirements: ['언박싱 영상 1개', '상세 리뷰 포스팅 2개', '일주일 사용 후기'],
        deadline: '2024-08-20',
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd',
        tags: ['테크', '스마트폰', '갤럭시'],
        matchScore: 95,
        estimatedReach: 100000,
        isSuper: true,
        platform: ['youtube', 'instagram']
      },
      {
        id: '5',
        brandName: '올리브영',
        brandLogo: '🛍️',
        title: '하반기 세일 프로모션',
        description: '올리브영 추천템을 소개해주실 뷰티 크리에이터를 찾습니다.',
        budget: 1800000,
        category: '뷰티/쇼핑',
        requirements: ['제품 추천 포스팅 3개', '할인 정보 공유'],
        deadline: '2024-07-25',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
        tags: ['뷰티', '쇼핑', '할인'],
        matchScore: 82,
        estimatedReach: 35000,
        platform: ['instagram']
      }
    ];

    setCampaigns(mockCampaigns);
  };

  const handleSwipe = async (direction: 'left' | 'right', isSuperLike?: boolean) => {
    if (swipesLeft <= 0) {
      toast.error('오늘의 스와이프를 모두 사용했습니다!');
      return;
    }

    if (!userId) {
      toast.error('로그인이 필요합니다');
      return;
    }

    const campaign = campaigns[currentIndex];
    if (!campaign) return;

    setDragDirection(direction === 'left' ? 'left' : 'right');
    
    setTimeout(async () => {
      try {
        if (direction === 'right') {
          if (isSuperLike && matchingSystem) {
            await matchingSystem.handleSuperLike();
            toast.success('⭐ 슈퍼 라이크! 캠페인에 우선 지원했습니다!');
          } else if (matchingSystem) {
            await matchingSystem.handleLike();
            toast.success('캠페인에 지원했습니다! 🎉');
          } else {
            await saveSwipeAction(campaign.id, userId, 'like');
            toast.success('캠페인에 지원했습니다! 🎉');
          }
        } else {
          if (matchingSystem) {
            await matchingSystem.handlePass();
            toast('다음 기회에! 👋', { icon: '💨' });
          } else {
            await saveSwipeAction(campaign.id, userId, 'pass');
            toast('다음 기회에! 👋', { icon: '💨' });
          }
        }

        if (matchingSystem?.dailySwipes) {
          setSwipesLeft(matchingSystem.dailySwipes.total - matchingSystem.dailySwipes.used - 1);
        } else {
          setSwipesLeft(prev => prev - 1);
        }

        if (currentIndex < campaigns.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          toast('새로운 캠페인을 불러오는 중... 🔄');
          
          if (matchingSystem?.refreshQueue) {
            await matchingSystem.refreshQueue();
          }
          
          await loadCampaigns();
          
          if (campaigns.length > 0) {
            setCurrentIndex(0);
            toast.success('새로운 캠페인이 준비되었습니다! ✨');
          } else {
            loadDummyCampaigns();
            setCurrentIndex(0);
          }
        }
        
        setDragDirection(null);
      } catch (error) {
        console.error('스와이프 오류:', error);
        toast.error('처리 중 오류가 발생했습니다.');
      }
    }, 300);
  };

  const loadMoreCampaigns = async () => {
    toast('새로운 캠페인을 불러오는 중...');
    if (matchingSystem?.refreshQueue) {
      await matchingSystem.refreshQueue();
    }
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
          <p className="text-sm text-gray-500 mb-4">
            다음 리셋까지: {getTimeUntilReset()}
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            프로필 관리하기
          </button>
        </div>
      </div>
    );
  }

  if (!currentCampaign && swipesLeft > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center max-w-md">
          <RefreshCw className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin-slow" />
          <h2 className="text-2xl font-bold mb-2">잠시만 기다려주세요!</h2>
          <p className="text-gray-600 mb-6">
            새로운 캠페인을 불러오는 중입니다...
          </p>
          <button
            onClick={async () => {
              await loadMoreCampaigns();
              if (campaigns.length === 0) {
                loadDummyCampaigns();
              }
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            <span>캠페인 새로고침</span>
          </button>
          <p className="text-sm text-gray-500 mt-4">
            남은 스와이프: {swipesLeft}/100
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="w-full px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Itda
              </h1>
              <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 rounded-full">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                <span className="text-xs sm:text-sm font-medium text-purple-700">
                  {currentCampaign.matchScore}%
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
                      className="h-full bg-gradient-to-t from-purple-500 to-pink-500 transition-all"
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

      <main className="flex-1 flex items-center justify-center px-4 pt-4 pb-36 sm:pb-32 overflow-hidden">
        <div className="relative w-full max-w-md h-full" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <AnimatePresence>
            {currentCampaign && (
              <motion.div
                key={currentCampaign.id}
                className="absolute inset-0"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: dragDirection === 'left' ? -300 : dragDirection === 'right' ? 300 : 0,
                  rotate: dragDirection === 'left' ? -20 : dragDirection === 'right' ? 20 : 0
                }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag
                dragConstraints={{ left: -100, right: 100, top: -50, bottom: 0 }}
                onDrag={(_, info) => {
                  setDragY(info.offset.y);
                }}
                onDragEnd={(_, info) => {
                  setDragY(0);
                  if (info.offset.y < -50 && Math.abs(info.offset.x) < 50) {
                    setShowDetails(true);
                  } else if (Math.abs(info.offset.x) > 100) {
                    handleSwipe(info.offset.x > 0 ? 'right' : 'left');
                  }
                }}
              >
                <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden h-full cursor-grab active:cursor-grabbing transition-transform ${dragY < -20 ? 'scale-[0.98]' : ''}`}>
                  <div className="relative h-[40%] sm:h-[45%]">
                    <img 
                      src={currentCampaign.image} 
                      alt={currentCampaign.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {currentCampaign.isSuper && (
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center space-x-1 animate-pulse">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>SUPER</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-md">
                          {currentCampaign.brandLogo}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm sm:text-lg">{currentCampaign.brandName}</h3>
                          <p className="text-white/80 text-xs sm:text-sm">{currentCampaign.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative p-4 sm:p-5 h-[60%] sm:h-[55%] overflow-y-auto">
                    <h2 className="text-lg sm:text-xl font-bold mb-2">{currentCampaign.title}</h2>
                    
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                      {currentCampaign.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <DollarSign className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                        <p className="text-[10px] text-gray-500">예산</p>
                        <p className="text-xs font-bold">₩{(currentCampaign.budget/1000000).toFixed(1)}M</p>
                      </div>
                      <div className="text-center">
                        <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <p className="text-[10px] text-gray-500">도달</p>
                        <p className="text-xs font-bold">{(currentCampaign.estimatedReach/1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-center">
                        <Calendar className="w-4 h-4 text-green-500 mx-auto mb-1" />
                        <p className="text-[10px] text-gray-500">마감</p>
                        <p className="text-xs font-bold">{new Date(currentCampaign.deadline).getMonth()+1}/{new Date(currentCampaign.deadline).getDate()}</p>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">요구사항</p>
                      <div className="flex flex-wrap gap-1">
                        {currentCampaign.requirements.slice(0, 3).map((req, idx) => (
                          <span key={idx} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex overflow-x-auto space-x-1.5 scrollbar-hide">
                      {currentCampaign.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full whitespace-nowrap"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex flex-col items-center bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full"
                      >
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                        <span className="text-[10px] text-gray-600 font-medium">상세정보</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="fixed bottom-[15%] sm:bottom-[20%] left-0 right-0 z-40">
        <div className="flex items-center justify-center space-x-5 sm:space-x-6 px-4">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/95 backdrop-blur-sm shadow-2xl border border-gray-100 flex items-center justify-center hover:scale-110 transition-all duration-200 active:scale-95"
          >
            <X className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
          </button>
          
          <button
            onClick={() => handleSwipe('right', true)}
            className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-200 active:scale-95 ring-4 ring-white/50"
          >
            <Star className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
          </button>
          
          <button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/95 backdrop-blur-sm shadow-2xl border border-gray-100 flex items-center justify-center hover:scale-110 transition-all duration-200 active:scale-95"
          >
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
          </button>
        </div>
        
        <div className="text-center mt-3">
          <div className="flex justify-center space-x-8 text-[11px] sm:text-xs text-gray-500">
            <span>패스</span>
            <span className="font-semibold text-orange-500">슈퍼</span>
            <span>좋아요</span>
          </div>
        </div>
      </div>

      <div className="h-4 sm:h-6 bg-gradient-to-t from-white/50 to-transparent"></div>

      <AnimatePresence>
        {showDetails && currentCampaign && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="absolute inset-0 bg-black/50"
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
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
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
                  <div className="bg-purple-50 rounded-xl p-4">
                    <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-xs text-gray-600 mb-1">캠페인 예산</p>
                    <p className="text-lg font-bold">₩{currentCampaign.budget.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <Users className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-xs text-gray-600 mb-1">예상 도달</p>
                    <p className="text-lg font-bold">{currentCampaign.estimatedReach.toLocaleString()}명</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <Calendar className="w-5 h-5 text-green-600 mb-2" />
                    <p className="text-xs text-gray-600 mb-1">캠페인 마감</p>
                    <p className="text-lg font-bold">{new Date(currentCampaign.deadline).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <TrendingUp className="w-5 h-5 text-orange-600 mb-2" />
                    <p className="text-xs text-gray-600 mb-1">예상 수익</p>
                    <p className="text-lg font-bold">협의 가능</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    캠페인 요구사항
                  </h4>
                  <div className="space-y-2">
                    {currentCampaign.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">진행 플랫폼</h4>
                  <div className="flex space-x-3">
                    {currentCampaign.platform?.includes('instagram') && (
                      <div className="flex items-center space-x-2 bg-pink-50 px-4 py-2 rounded-lg">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span className="text-sm">Instagram</span>
                      </div>
                    )}
                    {currentCampaign.platform?.includes('youtube') && (
                      <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg">
                        <Youtube className="w-4 h-4 text-red-600" />
                        <span className="text-sm">YouTube</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">관련 태그</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentCampaign.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      handleSwipe('left');
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                  >
                    다음에 하기
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      handleSwipe('right');
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium"
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