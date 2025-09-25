"use client";
// app/(influencer)/campaigns/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Camera, X, Heart, MapPin, Calendar, DollarSign, Users, Target, CheckCircle, Clock, RefreshCw, Gift, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { ImprovedSwipeQueueManager } from '@/lib/matching/swipe-queue-manager';
import { saveSwipeAction, checkDailySwipeLimit } from '@/lib/actions/swipe-actions';

// 타입 정의
import type { Database } from '@/types/database.types';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Advertiser = Database['public']['Tables']['advertisers']['Row'];

interface CampaignWithAdvertiser extends Campaign {
  advertisers?: Advertiser;
}

// 메타데이터 헬퍼 함수
const getMetadataField = <T = any>(
  metadata: any, 
  field: string, 
  defaultValue: T
): T => {
  if (!metadata || typeof metadata !== 'object') return defaultValue;
  return (metadata[field] as T) || defaultValue;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithAdvertiser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exitX, setExitX] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [influencerId, setInfluencerId] = useState<string | null>(null);
  const [swipesLeft, setSwipesLeft] = useState(10);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const supabase = createClient();

  // 유저 정보 로드
  useEffect(() => {
    loadUserInfo();
  }, []);

  // 캠페인 로드
  useEffect(() => {
    if (influencerId) {
      loadCampaigns();
      checkDailyLimit();
    }
  }, [influencerId]);

  // 남은 시간 카운트다운
  useEffect(() => {
    if (!nextRefreshTime || !dailyLimitReached) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= nextRefreshTime) {
        setDailyLimitReached(false);
        loadCampaigns();
        clearInterval(timer);
      }
    }, 60000); // 1분마다 체크
    
    return () => clearInterval(timer);
  }, [nextRefreshTime, dailyLimitReached]);

  const loadUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);
      
      const { data: influencer } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (influencer) {
        setInfluencerId(influencer.id);
      }
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
    
    // 남은 스와이프가 0이면 제한 도달
    if (remaining.remaining === 0) {
      setDailyLimitReached(true);
      setCampaigns([]); // 캠페인 리스트 비우기
      toast.error('오늘의 스와이프를 모두 사용했습니다! 내일 다시 만나요 💜');
    } else {
      setDailyLimitReached(false);
    }
  } catch (error) {
    console.error('Error checking daily limit:', error);
    // 에러 발생시 기본값 설정
    setSwipesLeft(10);
    setDailyLimitReached(false);
  }
};
  const loadCampaigns = async () => {
    if (!influencerId) return;
    
    setIsLoading(true);
    try {
      // 인플루언서 카테고리 가져오기
      const { data: influencer } = await supabase
        .from('influencers')
        .select('categories')
        .eq('id', influencerId)
        .single();
      
      // 큐 생성 및 캠페인 로드
      const { campaigns: queueCampaigns } = await ImprovedSwipeQueueManager.generateQueue(
        influencerId,
        influencer?.categories || []
      );
      
      // 광고주 정보 포함하여 캠페인 상세 정보 로드
      const campaignIds = queueCampaigns.map(c => c.id);
      
      if (campaignIds.length > 0) {
        const { data: detailedCampaigns } = await supabase
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
        
        setCampaigns((detailedCampaigns || []) as CampaignWithAdvertiser[]);
      } else {
        // 캠페인이 없을 경우
        setCampaigns([]);
        setDailyLimitReached(true);
      }
      
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('캠페인 로드에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 스와이프 처리
  const handleSwipeAction = async (action: 'like' | 'pass' | 'super_like') => {
    if (!influencerId || !campaigns[currentIndex]) return;
    
    const campaign = campaigns[currentIndex];
    
    try {
      // DB에 스와이프 액션 저장
      const result = await saveSwipeAction(
        campaign.id,
        influencerId,
        action,
        {
          match_score: 85,
          predicted_price: campaign.budget || 1000000,
          category_match: true
        }
      );
      
      // 남은 스와이프 수 감소
      setSwipesLeft(prev => Math.max(0, prev - 1));
      
      if (result.matched) {
        toast.success(
          action === 'super_like' 
            ? '슈퍼 라이크! 광고주에게 즉시 알림이 전송됩니다 ⭐' 
            : '매칭 성공! 광고주의 승인을 기다려주세요 👍'
        );
      }
      
      // 일일 제한 체크
      if (swipesLeft <= 1) {
        setDailyLimitReached(true);
        const remaining = await ImprovedSwipeQueueManager.getRemainingSwipes(influencerId);
        setNextRefreshTime(remaining.nextRefresh);
      }
      
    } catch (error) {
      console.error('Error processing swipe:', error);
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  // 스와이프 끝났을 때 처리
  const handleDragEnd = useCallback(async () => {
    if (isProcessing || dailyLimitReached) return;
    
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
      
      setIsProcessing(true);
      setExitX(currentX > 0 ? 1000 : -1000);
      
      // 액션 결정 및 처리
      const action = direction === 'right' ? 'like' : 'pass';
      await handleSwipeAction(action);
      
      // 다음 캠페인으로 이동
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setExitX(0);
        setIsProcessing(false);
        
        // 모든 캠페인을 봤으면 새로 로드
        if (currentIndex >= campaigns.length - 1) {
          loadCampaigns();
        }
      }, 300);
    } else {
      // 원위치로 복귀
      x.set(0);
      y.set(0);
    }
  }, [currentIndex, campaigns, isProcessing, dailyLimitReached, x, y, influencerId]);

  // 일일 제한 도달 화면
  const DailyLimitScreen = () => {
    const getTimeRemaining = () => {
      if (!nextRefreshTime) return '곧';
      
      const now = new Date();
      const diff = nextRefreshTime.getTime() - now.getTime();
      
      if (diff <= 0) return '곧';
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}시간 ${minutes % 60}분`;
      }
      return `${minutes}분`;
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* 헤더 일러스트 */}
            <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-white/20"
                >
                  <Clock className="w-32 h-32" />
                </motion.div>
                <div className="absolute">
                  <Sparkles className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>
            
            {/* 컨텐츠 */}
            <div className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-2">
                오늘의 스와이프 완료! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                오늘 10개의 캠페인을 모두 확인하셨어요
              </p>
              
              {/* 타이머 */}
              <div className="bg-purple-50 rounded-2xl p-6 mb-6">
                <div className="text-sm text-purple-600 mb-2">다음 캠페인까지</div>
                <div className="text-4xl font-bold text-purple-800">
                  {getTimeRemaining()}
                </div>
              </div>
              
              {/* 통계 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xs text-gray-500">연속</div>
                  <div className="font-bold">3일</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-2xl mb-1">💝</div>
                  <div className="text-xs text-gray-500">오늘 매칭</div>
                  <div className="font-bold">4개</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs text-gray-500">총 매칭</div>
                  <div className="font-bold">28개</div>
                </div>
              </div>
              
              {/* 팁 */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="text-left">
                    <div className="font-semibold text-sm mb-1">프로 팁!</div>
                    <div className="text-xs text-gray-600">
                      프로필을 완성하면 더 정확한 매칭을 받을 수 있어요
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA 버튼 */}
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  프로필 완성하기
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  대시보드로 이동
                </button>
              </div>
              
              {/* 프리미엄 유도 */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Gift className="w-4 h-4" />
                  <span>프리미엄으로 무제한 스와이프!</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4 mx-auto"></div>
          <p className="text-gray-600">캠페인 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 일일 제한 도달 시
  if (dailyLimitReached) {
    return <DailyLimitScreen />;
  }

  // 캠페인이 없을 때
  if (campaigns.length === 0 || currentIndex >= campaigns.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-2">캠페인이 없습니다</h2>
          <p className="text-gray-600 mb-4">곧 새로운 캠페인이 추가될 예정입니다</p>
          <button
            onClick={loadCampaigns}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  const currentCampaign = campaigns[currentIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* 헤더 */}
      <div className="relative z-10 p-4">
        <div className="max-w-md mx-auto flex justify-between items-center mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 bg-white/80 backdrop-blur rounded-xl shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow-lg">
            <span className="text-sm font-medium">남은 스와이프</span>
            <span className="text-xl font-bold text-purple-600">{swipesLeft}</span>
          </div>
        </div>

        {/* 카드 스택 */}
        <div className="max-w-md mx-auto h-[600px] relative">
          <AnimatePresence>
            {currentCampaign && (
              <motion.div
                key={currentCampaign.id}
                className="absolute w-full h-full"
                style={{
                  x,
                  y,
                  rotate,
                  opacity
                }}
                drag={!isProcessing}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                animate={{ x: exitX }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-full relative">
                  {/* 캠페인 이미지 */}
                  <div className="h-2/3 relative">
                    <img
                      src={getMetadataField(currentCampaign.metadata, 'image', 'https://via.placeholder.com/400x600')}
                      alt={currentCampaign.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 그라데이션 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* 캠페인 정보 */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={currentCampaign.advertisers?.company_logo || ''}
                          alt={currentCampaign.advertisers?.company_name}
                          className="w-12 h-12 rounded-xl bg-white p-1"
                        />
                        <div>
                          <div className="font-bold text-lg">{currentCampaign.advertisers?.company_name}</div>
                          {currentCampaign.advertisers?.is_verified && (
                            <div className="flex items-center gap-1 text-xs">
                              <CheckCircle className="w-3 h-3" />
                              <span>인증됨</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <h2 className="text-2xl font-bold mb-2">{currentCampaign.name}</h2>
                      <p className="text-sm opacity-90 line-clamp-2">{currentCampaign.description}</p>
                    </div>
                    
                    {/* 액션 인디케이터 */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        opacity: useTransform(x, [-100, 0, 100], [0, 0, 1])
                      }}
                    >
                      <div className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl shadow-lg rotate-12">
                        LIKE
                      </div>
                    </motion.div>
                    
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        opacity: useTransform(x, [-100, 0, 100], [1, 0, 0])
                      }}
                    >
                      <div className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl shadow-lg -rotate-12">
                        PASS
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* 하단 정보 */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-around text-center">
                      <div>
                        <DollarSign className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                        <div className="text-sm font-semibold">
                          {currentCampaign.budget ? `${(currentCampaign.budget / 10000).toFixed(0)}만원` : '협의'}
                        </div>
                      </div>
                      <div>
                        <Calendar className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                        <div className="text-sm font-semibold">
                          {currentCampaign.deadline ? new Date(currentCampaign.deadline).toLocaleDateString() : 'D-30'}
                        </div>
                      </div>
                      <div>
                        <Users className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                        <div className="text-sm font-semibold">
                          {currentCampaign.min_followers ? `${(currentCampaign.min_followers / 1000).toFixed(0)}K+` : '제한없음'}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowDetails(true)}
                      className="w-full py-2 text-purple-600 font-medium text-sm"
                    >
                      자세히 보기 ↑
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 액션 버튼 */}
        <div className="max-w-md mx-auto flex justify-center gap-6 mt-6">
          <button
            onClick={() => {
              setExitX(-1000);
              handleSwipeAction('pass');
              setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setExitX(0);
              }, 300);
            }}
            disabled={isProcessing}
            className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
          >
            <X className="w-6 h-6 text-red-500" />
          </button>
          
          <button
            onClick={() => handleSwipeAction('super_like')}
            disabled={isProcessing}
            className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={() => {
              setExitX(1000);
              handleSwipeAction('like');
              setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setExitX(0);
              }, 300);
            }}
            disabled={isProcessing}
            className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
          >
            <Heart className="w-6 h-6 text-green-500" />
          </button>
        </div>
      </div>

      {/* 상세 정보 모달 */}
      <AnimatePresence>
        {showDetails && currentCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white p-4 border-b">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-bold text-center">캠페인 상세정보</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">요구사항</h4>
                  <ul className="space-y-2">
                    {(currentCampaign.requirements as string[])?.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm text-gray-600">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">카테고리</h4>
                  <div className="flex flex-wrap gap-2">
                    {(currentCampaign.categories as string[])?.map((cat, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      handleSwipeAction('pass');
                    }}
                    className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold"
                  >
                    건너뛰기
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      handleSwipeAction('like');
                    }}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold"
                  >
                    지원하기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}