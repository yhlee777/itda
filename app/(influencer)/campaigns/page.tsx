'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Heart, Clock, Sparkles, Users, Star, MapPin, DollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { ImprovedSwipeQueueManager } from '@/lib/matching/swipe-queue-manager';
import type { Database } from '@/types/database.types';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';

// 타입 정의
type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Advertiser = Database['public']['Tables']['advertisers']['Row'];

interface CampaignWithAdvertiser extends Campaign {
  advertisers?: Advertiser;
}

// Toast 헬퍼
const toastInfo = (message: string) => {
  toast(message, {
    icon: '💜',
    style: {
      background: '#f3f4f6',
      color: '#4b5563',
    },
  });
};

export default function CampaignsPage() {
  // State
  const [campaigns, setCampaigns] = useState<CampaignWithAdvertiser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [influencerId, setInfluencerId] = useState<string | null>(null);
  const [swipesLeft, setSwipesLeft] = useState(10);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  
  const supabase = useMemo(() => createClient(), []);

  // 로드 함수들
  const loadUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        window.location.href = '/login';
        return;
      }
      
      setUserId(user.id);
      
      const { data: influencer, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error || !influencer) {
        console.error('Influencer profile error:', error);
        toast.error('프로필을 완성해주세요');
        window.location.href = '/onboarding';
        return;
      }
      
      setInfluencerId(influencer.id);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const checkDailyLimit = async () => {
    if (!influencerId) return;
    
    try {
      const remaining = await ImprovedSwipeQueueManager.getRemainingSwipes(influencerId);
      console.log('Daily limit check:', remaining);
      
      setSwipesLeft(remaining.remaining);
      setNextRefreshTime(remaining.nextRefresh);
      
      if (remaining.remaining === 0) {
        setDailyLimitReached(true);
        toastInfo('오늘의 스와이프를 모두 사용했습니다! 내일 다시 만나요 💜');
      }
    } catch (error) {
      console.error('Error checking daily limit:', error);
    }
  };

  const loadCampaigns = async () => {
    if (!influencerId) return;
    
    setIsLoading(true);
    try {
      const { data: influencer } = await supabase
        .from('influencers')
        .select('categories')
        .eq('id', influencerId)
        .single();
      
      const { campaigns: queueCampaigns, remaining } = 
        await ImprovedSwipeQueueManager.generateQueue(
          influencerId,
          influencer?.categories || []
        );
      
      setSwipesLeft(remaining);
      
      if (remaining === 0) {
        setDailyLimitReached(true);
        setCampaigns([]);
        return;
      }
      
      if (queueCampaigns.length > 0) {
        const campaignIds = queueCampaigns.map(c => c.id);
        
        const { data: detailedCampaigns, error } = await supabase
          .from('campaigns')
          .select(`
            *,
            advertisers!inner(
              id,
              company_name,
              company_logo,
              is_verified
            )
          `)
          .in('id', campaignIds)
          .eq('status', 'active');
        
        if (error) {
          console.error('Error loading campaigns:', error);
          toast.error('캠페인 로드 실패');
          setCampaigns([]);
        } else {
          const typedCampaigns = (detailedCampaigns || []) as unknown as CampaignWithAdvertiser[];
          setCampaigns(typedCampaigns);
        }
      } else {
        setCampaigns([]);
        toastInfo('새로운 캠페인이 곧 업데이트됩니다!');
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('캠페인 로드에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipeAction = async (action: 'like' | 'pass' | 'super_like') => {
    if (!influencerId || !campaigns[currentIndex]) return;
    if (isProcessing) return;
    
    const campaign = campaigns[currentIndex];
    setIsProcessing(true);
    
    // 방향 설정
    setExitDirection(action === 'pass' ? 'left' : 'right');
    
    try {
      const success = await ImprovedSwipeQueueManager.recordSwipe(
        influencerId,
        campaign.id,
        action
      );
      
      if (success) {
        const newSwipesLeft = Math.max(0, swipesLeft - 1);
        setSwipesLeft(newSwipesLeft);
        
        if (action === 'super_like') {
          toast.success('슈퍼 라이크! ⭐');
        } else if (action === 'like') {
          toast.success('좋아요! 👍');
        } else {
          toast('패스!', { icon: '👋' });
        }
        
        if (newSwipesLeft === 0) {
          setDailyLimitReached(true);
          toastInfo('오늘의 스와이프 완료!');
        }
        
        // 다음 캠페인으로
        setTimeout(() => {
          if (currentIndex < campaigns.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setExitDirection(null);
          } else {
            setCampaigns([]);
            toastInfo('모든 캠페인을 확인했습니다!');
          }
          setIsProcessing(false);
        }, 300);
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error processing swipe:', error);
      toast.error('처리 중 오류가 발생했습니다');
      setIsProcessing(false);
    }
  };

  // Effects
  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (influencerId) {
      loadCampaigns();
      checkDailyLimit();
    }
  }, [influencerId]);

  // 카테고리 표시
  const getCategoryDisplay = (campaign: CampaignWithAdvertiser) => {
    if (campaign.categories && campaign.categories.length > 0) {
      return campaign.categories[0];
    }
    return 'general';
  };

  const currentCampaign = campaigns[currentIndex];

  // UI 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 lg:pb-20">
      {/* 헤더 - 모바일 최적화 */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 lg:relative">
        <div className="max-w-lg mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              ITDA
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs lg:text-sm font-medium text-gray-600 hidden sm:block">
                오늘 남은 스와이프
              </span>
              <span className="px-2 lg:px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold text-sm">
                {swipesLeft}/10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - 모바일에서 전체 화면 */}
      <div className="h-[calc(100vh-60px)] lg:h-auto lg:max-w-lg lg:mx-auto lg:px-4 lg:py-8">
        {isLoading ? (
          <LoadingState />
        ) : dailyLimitReached ? (
          <DailyLimitState nextRefreshTime={nextRefreshTime} />
        ) : currentCampaign ? (
          <SwipeableCard 
            campaign={currentCampaign}
            onSwipe={handleSwipeAction}
            isProcessing={isProcessing}
            category={getCategoryDisplay(currentCampaign)}
            exitDirection={exitDirection}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// 스와이프 가능한 카드 컴포넌트
function SwipeableCard({ 
  campaign, 
  onSwipe, 
  isProcessing,
  category,
  exitDirection
}: { 
  campaign: CampaignWithAdvertiser;
  onSwipe: (action: 'like' | 'pass' | 'super_like') => void;
  isProcessing: boolean;
  category: string;
  exitDirection: 'left' | 'right' | null;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  
  // 스와이프 인디케이터 투명도
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        onSwipe('like');
      } else {
        onSwipe('pass');
      }
    }
  };
  
  return (
    <div className="relative h-full lg:h-[600px] flex flex-col justify-center px-4 lg:px-0">
      <AnimatePresence mode="wait">
        {!exitDirection ? (
          <motion.div
            key={campaign.id}
            style={{ x, y, rotate }}
            drag={!isProcessing}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={exitDirection ? {
              x: exitDirection === 'right' ? 300 : -300,
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.2 }
            } : undefined}
            className="absolute inset-4 lg:relative lg:inset-auto"
          >
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden h-full cursor-grab active:cursor-grabbing">
              {/* 이미지 영역 - 모바일에서 더 크게 */}
              <div className="h-[55%] lg:h-2/3 bg-gradient-to-br from-purple-400 to-pink-400 relative">
                {/* 스와이프 인디케이터 */}
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-xl rotate-12 z-10"
                >
                  LIKE
                </motion.div>
                <motion.div
                  style={{ opacity: nopeOpacity }}
                  className="absolute top-8 left-8 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xl -rotate-12 z-10"
                >
                  NOPE
                </motion.div>
                
                {/* 회사 로고 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-7xl lg:text-8xl">
                    {campaign.advertisers?.company_logo || '🎯'}
                  </div>
                </div>
                
                {/* 카테고리 & 인증 뱃지 */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/90 text-purple-600 rounded-full text-sm font-medium">
                    {category}
                  </span>
                  {campaign.advertisers?.is_verified && (
                    <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      인증
                    </span>
                  )}
                </div>
              </div>
              
              {/* 정보 영역 - 모바일 최적화 */}
              <div className="p-4 lg:p-5">
                <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">
                  {campaign.name}
                </h3>
                <p className="text-gray-600 text-sm lg:text-base mb-3 line-clamp-2">
                  {campaign.description}
                </p>
                
                {/* 주요 정보 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">
                      {(campaign.budget || 0).toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">
                      {new Date(campaign.deadline || '').toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
                
                {/* 회사명 */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  by {campaign.advertisers?.company_name || 'Unknown'}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      {/* 액션 버튼들 - 모바일에서 하단 고정 */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 lg:gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('pass')}
          disabled={isProcessing}
          className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow disabled:opacity-50"
        >
          <X className="w-6 h-6 text-red-500" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('super_like')}
          disabled={isProcessing}
          className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow disabled:opacity-50"
        >
          <Sparkles className="w-6 h-6 text-blue-500" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('like')}
          disabled={isProcessing}
          className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow disabled:opacity-50"
        >
          <Heart className="w-6 h-6 text-green-500" />
        </motion.button>
      </div>
    </div>
  );
}

// 로딩 상태
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">캠페인을 불러오는 중...</p>
      </div>
    </div>
  );
}

// 일일 제한 상태
function DailyLimitState({ nextRefreshTime }: { nextRefreshTime: Date | null }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center px-4">
        <Clock className="w-20 h-20 text-purple-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          오늘의 스와이프 완료!
        </h2>
        <p className="text-gray-600 mb-4">
          내일 다시 새로운 캠페인을 만나보세요
        </p>
        {nextRefreshTime && (
          <p className="text-sm text-purple-600">
            리셋 시간: {nextRefreshTime.toLocaleString('ko-KR')}
          </p>
        )}
      </div>
    </div>
  );
}

// 빈 상태
function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center px-4">
        <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          캠페인이 없습니다
        </h2>
        <p className="text-gray-500">
          잠시 후 다시 시도해주세요
        </p>
      </div>
    </div>
  );
}