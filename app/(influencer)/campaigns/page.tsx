'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Heart, X, Info, Clock, DollarSign, MapPin, 
  TrendingUp, Users, Calendar, Star, ChevronLeft, 
  Filter, Search, Sparkles, Shield, Zap, Crown,
  Eye, MessageCircle, CheckCircle, AlertCircle,
  ArrowRight, Award, Flame, Target, Gift,
  ChevronUp, ArrowUp, Lock, Timer, RefreshCw,
  Bot, Brain, BarChart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

// AI 분석 임포트
import { AIPricePredictor } from '@/lib/ai/price-predictor';
import { AIAnalyzer } from '@/lib/ai/analyzer';

interface Campaign {
  id: string;
  brand: string;
  brandLogo?: string;
  title: string;
  budget: number;
  deadline: string;
  location: string;
  category: string;
  requirements: string[];
  matchScore: number;
  applicants: number;
  viewingNow: number;
  image?: string;
  description?: string;
  deliverables?: string[];
  isVIP?: boolean;
  isPremium?: boolean;
  urgency?: 'low' | 'medium' | 'high';
  perks?: string[];
  minFollowers?: number;
  targetGender?: string;
  targetAge?: string;
  aiPredictedPrice?: number;
  priceConfidence?: number;
}

// DB 캠페인을 UI 캠페인으로 변환하는 안전한 함수
const transformDBCampaign = (dbCampaign: any): Campaign => {
  try {
    // 안전한 변환을 위한 기본값 설정
    return {
      id: String(dbCampaign?.id || Math.random()),
      brand: dbCampaign?.metadata?.brand_name || dbCampaign?.name || 'Unknown Brand',
      brandLogo: dbCampaign?.metadata?.brand_logo || 'https://via.placeholder.com/50',
      title: dbCampaign?.name || 'Untitled Campaign',
      budget: Number(dbCampaign?.budget) || 1000000,
      deadline: dbCampaign?.end_date 
        ? new Date(dbCampaign.end_date).toLocaleDateString('ko-KR') 
        : '미정',
      location: dbCampaign?.metadata?.location || 
                dbCampaign?.target_audience?.location || 
                '서울',
      category: Array.isArray(dbCampaign?.categories) && dbCampaign.categories.length > 0 
        ? dbCampaign.categories[0] 
        : '기타',
      requirements: Array.isArray(dbCampaign?.requirements) 
        ? dbCampaign.requirements 
        : [],
      matchScore: Math.floor(Math.random() * 30) + 70, // 70-100 사이의 임시 점수
      applicants: Number(dbCampaign?.application_count) || 0,
      viewingNow: Math.floor((Number(dbCampaign?.view_count) || 0) / 10),
      image: dbCampaign?.metadata?.image || 
             `https://picsum.photos/seed/${dbCampaign?.id || Math.random()}/800/800`,
      description: dbCampaign?.description || '',
      deliverables: Array.isArray(dbCampaign?.deliverables?.items) 
        ? dbCampaign.deliverables.items 
        : Array.isArray(dbCampaign?.deliverables) 
          ? dbCampaign.deliverables 
          : [],
      isVIP: dbCampaign?.metadata?.is_vip === true,
      isPremium: dbCampaign?.is_premium === true,
      urgency: dbCampaign?.urgency || 'medium',
      perks: Array.isArray(dbCampaign?.metadata?.perks) 
        ? dbCampaign.metadata.perks 
        : [],
      minFollowers: Number(dbCampaign?.min_followers) || 0,
      targetGender: dbCampaign?.target_audience?.gender || '전체',
      targetAge: dbCampaign?.target_audience?.age_range || '전연령',
    };
  } catch (error) {
    console.error('캠페인 변환 에러:', error, dbCampaign);
    // 에러 시 기본 캠페인 반환
    return {
      id: String(Math.random()),
      brand: 'Unknown Brand',
      brandLogo: 'https://via.placeholder.com/50',
      title: 'Campaign',
      budget: 1000000,
      deadline: '미정',
      location: '서울',
      category: '기타',
      requirements: [],
      matchScore: 70,
      applicants: 0,
      viewingNow: 0,
      image: 'https://picsum.photos/800/800',
      description: '',
      deliverables: [],
      isVIP: false,
      isPremium: false,
      urgency: 'medium',
      perks: [],
      minFollowers: 0,
      targetGender: '전체',
      targetAge: '전연령',
    };
  }
};

interface SwipeSession {
  remainingSwipes: number;
  nextRefreshTime: Date;
  categoriesViewed: string[];
  sessionStartTime: Date;
}

export default function ImprovedCampaignsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // 상태 관리
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // 스와이프 세션 관리
  const [session, setSession] = useState<SwipeSession>({
    remainingSwipes: 10,
    nextRefreshTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3시간 후
    categoriesViewed: [],
    sessionStartTime: new Date()
  });
  
  // 카테고리 우선순위
  const [userPreferredCategories, setUserPreferredCategories] = useState<string[]>([
    '패션', '뷰티', '라이프스타일' // 사용자 프로필에서 가져옴
  ]);
  
  // AI 가격 예측 결과
  const [pricePrediction, setPricePrediction] = useState<{
    estimatedPrice: number;
    minPrice: number;
    maxPrice: number;
    confidence: number;
    recommendation: string;
  } | null>(null);
  
  // 모션 값
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const cardRef = useRef<HTMLDivElement>(null);

  // 캠페인 로드 (카테고리 우선순위 적용)
  useEffect(() => {
    loadCampaigns();
    loadSession();
    startRefreshTimer();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    
    try {
      // 1. 선호 카테고리 캠페인 먼저 로드
      const { data: preferredCampaigns, error: prefError } = await supabase
        .from('campaigns')
        .select('*')
        .contains('categories', userPreferredCategories)
        .eq('status', 'active')
        .order('urgency', { ascending: false })
        .limit(5);
      
      if (prefError) {
        console.error('선호 캠페인 로드 에러:', prefError);
      }
      
      // 2. 그 외 카테고리 캠페인 로드
      const { data: otherCampaigns, error: otherError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('view_count', { ascending: false })
        .limit(5);
      
      if (otherError) {
        console.error('기타 캠페인 로드 에러:', otherError);
      }
      
      // 3. 캠페인 병합 및 변환
      const allDBCampaigns = [...(preferredCampaigns || []), ...(otherCampaigns || [])];
      const transformedCampaigns: Campaign[] = allDBCampaigns
        .filter(Boolean) // null/undefined 제거
        .map((dbCampaign) => transformDBCampaign(dbCampaign));
      
      // 4. 각 캠페인에 대한 AI 가격 예측
      const campaignsWithAI = await Promise.all(
        transformedCampaigns.map(async (campaign) => {
          const prediction = await predictCampaignPrice(campaign);
          return {
            ...campaign,
            aiPredictedPrice: prediction?.estimatedPrice,
            priceConfidence: prediction?.confidence
          };
        })
      );
      
      setCampaigns(campaignsWithAI);
    } catch (error) {
      console.error('캠페인 로드 실패:', error);
      toast.error('캠페인을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // AI 가격 예측
  const predictCampaignPrice = async (campaign: Campaign) => {
    try {
      // 사용자 정보 가져오기 (실제로는 세션에서)
      const userProfile = {
        followers: 50000,
        engagementRate: 3.5,
        category: '패션',
        previousCampaigns: 10,
        averageRating: 4.5
      };
      
      const prediction = await AIPricePredictor.predictPrice({
        influencerId: 'current-user-id',
        campaignId: campaign.id,
        category: campaign.category || '기타',
        followers: userProfile.followers,
        engagementRate: userProfile.engagementRate,
        deliverables: campaign.deliverables || [],
        duration: 14,
        previousCampaigns: userProfile.previousCampaigns,
        averageRating: userProfile.averageRating,
        region: campaign.location || '서울'
      });
      
      return prediction;
    } catch (error) {
      console.error('가격 예측 실패:', error);
      return null;
    }
  };

  // 세션 로드
  const loadSession = () => {
    const savedSession = localStorage.getItem('swipeSession');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      const nextRefresh = new Date(parsed.nextRefreshTime);
      
      // 리프레시 시간이 지났으면 초기화
      if (nextRefresh < new Date()) {
        resetSession();
      } else {
        setSession({
          ...parsed,
          nextRefreshTime: nextRefresh,
          sessionStartTime: new Date(parsed.sessionStartTime)
        });
      }
    }
  };

  // 세션 리셋
  const resetSession = () => {
    const newSession: SwipeSession = {
      remainingSwipes: 10,
      nextRefreshTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      categoriesViewed: [],
      sessionStartTime: new Date()
    };
    setSession(newSession);
    localStorage.setItem('swipeSession', JSON.stringify(newSession));
    toast.success('스와이프가 초기화되었습니다! 10개의 새로운 캠페인을 확인하세요 🎉');
  };

  // 리프레시 타이머
  const startRefreshTimer = () => {
    const interval = setInterval(() => {
      const now = new Date();
      if (session.nextRefreshTime <= now) {
        resetSession();
        loadCampaigns();
      }
    }, 60000); // 1분마다 체크
    
    return () => clearInterval(interval);
  };

  // 스와이프 처리
  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (session.remainingSwipes <= 0) {
      toast.error(
        `오늘의 스와이프를 모두 사용했습니다. ${formatTimeRemaining(session.nextRefreshTime)}후에 다시 시도해주세요.`,
        { icon: '⏰' }
      );
      return;
    }

    const currentCampaign = campaigns[currentIndex];
    
    // 스와이프 기록 저장
    await saveSwipeHistory(currentCampaign.id, direction);
    
    // 카테고리 기록
    if (!session.categoriesViewed.includes(currentCampaign.category)) {
      session.categoriesViewed.push(currentCampaign.category);
    }
    
    // 남은 스와이프 감소
    const newSession = {
      ...session,
      remainingSwipes: session.remainingSwipes - 1,
      categoriesViewed: session.categoriesViewed
    };
    setSession(newSession);
    localStorage.setItem('swipeSession', JSON.stringify(newSession));

    // 액션별 처리
    if (direction === 'right') {
      await applyCampaign(currentCampaign);
      toast.success('지원 완료! AI가 최적 단가를 분석중입니다 🤖');
    } else if (direction === 'super') {
      await superLikeCampaign(currentCampaign);
      toast.success('슈퍼라이크! 우선 매칭 대상이 되었습니다 ⭐');
    } else {
      toast('다음 기회에 만나요 👋');
    }

    // 다음 캠페인으로
    if (currentIndex < campaigns.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // 캠페인 끝
      if (session.remainingSwipes > 0) {
        toast('더 많은 캠페인을 불러오는 중...', { icon: '⏳' });
        await loadMoreCampaigns();
      }
    }
  };

  // 스와이프 기록 저장
  const saveSwipeHistory = async (campaignId: string, action: string) => {
    try {
      await supabase.from('swipe_history').insert({
        influencer_id: 'current-user-id', // 실제로는 세션에서
        campaign_id: campaignId,
        action: action === 'right' ? 'like' : action === 'super' ? 'super_like' : 'pass',
        category_match: userPreferredCategories.includes(campaigns[currentIndex].category),
        match_score: campaigns[currentIndex].matchScore
      });
    } catch (error) {
      console.error('스와이프 기록 실패:', error);
    }
  };

  // 캠페인 지원
  const applyCampaign = async (campaign: Campaign) => {
    try {
      await supabase.from('campaign_influencers').insert({
        campaign_id: campaign.id,
        influencer_id: 'current-user-id',
        price: pricePrediction?.estimatedPrice || campaign.budget,
        message: 'AI 추천 단가로 지원합니다',
        status: 'pending',
        match_score: campaign.matchScore
      });
    } catch (error) {
      console.error('지원 실패:', error);
    }
  };

  // 슈퍼라이크 (메타데이터로 저장)
  const superLikeCampaign = async (campaign: Campaign) => {
    try {
      // 스와이프 히스토리에 super_like로 저장
      await supabase.from('swipe_history').insert({
        campaign_id: campaign.id,
        influencer_id: 'current-user-id',
        action: 'super_like',
        category_match: userPreferredCategories.includes(campaign.category),
        match_score: campaign.matchScore
      });
    } catch (error) {
      console.error('슈퍼라이크 실패:', error);
    }
  };

  // 추가 캠페인 로드
  const loadMoreCampaigns = async () => {
    const excludeIds = campaigns.map(c => c.id);
    
    const { data: moreCampaigns } = await supabase
      .from('campaigns')
      .select('*')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .eq('status', 'active')
      .limit(5);
    
    if (moreCampaigns && moreCampaigns.length > 0) {
      setCampaigns([...campaigns, ...moreCampaigns] as any);
    } else {
      toast('새로운 캠페인이 곧 업데이트됩니다!', { icon: '📢' });
    }
  };

  // 드래그 핸들러
  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      handleSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      handleSwipe('left');
    } else if (info.offset.y < -swipeThreshold) {
      setShowDetails(true);
    }
  };

  // 시간 포맷
  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const currentCampaign = campaigns[currentIndex];

  if (!currentCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">캠페인 준비중</h2>
          <p className="text-gray-600">
            다음 업데이트: {formatTimeRemaining(session.nextRefreshTime)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-sm border-b">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3">
          {/* 남은 스와이프 표시 */}
          <div className="relative">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">
                  {session.remainingSwipes}/10
                </span>
              </div>
            </div>
            {session.remainingSwipes <= 3 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          
          {/* 리프레시 타이머 */}
          <div className="px-3 py-2 bg-white rounded-full shadow-sm border">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">
                {formatTimeRemaining(session.nextRefreshTime)}
              </span>
            </div>
          </div>
          
          {/* AI 분석 버튼 */}
          <button
            onClick={() => setShowAIAnalysis(!showAIAnalysis)}
            className="p-2 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <Brain className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      </div>

      {/* AI 분석 패널 */}
      {showAIAnalysis && (
        <div className="absolute top-16 right-4 z-50 w-80 bg-white rounded-2xl shadow-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold">AI 단가 분석</h3>
            </div>
            <button
              onClick={() => setShowAIAnalysis(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {pricePrediction && (
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">AI 추천 단가</span>
                  <span className="text-xl font-bold text-purple-600">
                    ₩{pricePrediction.estimatedPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>최소: ₩{pricePrediction.minPrice.toLocaleString()}</span>
                  <span>최대: ₩{pricePrediction.maxPrice.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${pricePrediction.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{pricePrediction.confidence}%</span>
              </div>
              
              <p className="text-xs text-gray-600">{pricePrediction.recommendation}</p>
            </div>
          )}
        </div>
      )}

      {/* 메인 카드 영역 */}
      <div className="px-4 pb-32 pt-8">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              ref={cardRef}
              key={currentCampaign.id}
              style={{ x, y, rotate, opacity }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
              className="relative"
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* 카테고리 매치 인디케이터 */}
                {userPreferredCategories.includes(currentCampaign.category) && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    선호 카테고리
                  </div>
                )}
                
                {/* VIP/프리미엄 뱃지 */}
                {currentCampaign.isPremium && (
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    PREMIUM
                  </div>
                )}
                
                {/* 긴급도 표시 */}
                {currentCampaign.urgency === 'high' && (
                  <div className="absolute top-14 right-4 z-10 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    긴급
                  </div>
                )}
                
                {/* 캠페인 이미지 */}
                <div className="relative h-96">
                  <img
                    src={currentCampaign.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop'}
                    alt={currentCampaign.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* 그라디언트 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* 캠페인 정보 오버레이 */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={currentCampaign.brandLogo || 'https://via.placeholder.com/50'}
                        alt={currentCampaign.brand}
                        className="w-12 h-12 rounded-full bg-white p-1"
                      />
                      <div>
                        <h3 className="text-2xl font-bold">{currentCampaign.brand}</h3>
                        <p className="text-sm opacity-90">{currentCampaign.category}</p>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">{currentCampaign.title}</h4>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {currentCampaign.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {currentCampaign.deadline}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 캠페인 상세 정보 */}
                <div className="p-6">
                  {/* AI 매치 스코어 & 예상 단가 */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <svg className="w-12 h-12">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="#e5e5e5"
                            strokeWidth="4"
                            fill="none"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${currentCampaign.matchScore * 1.25} 125`}
                            strokeLinecap="round"
                            transform="rotate(-90 24 24)"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">{currentCampaign.matchScore}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">AI 매치율</p>
                        <p className="font-bold text-purple-600">
                          {currentCampaign.matchScore >= 90 ? '완벽한 매치!' : 
                           currentCampaign.matchScore >= 70 ? '좋은 매치' : '확인 필요'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">AI 예상 단가</p>
                      <p className="font-bold text-lg">
                        ₩{(currentCampaign.aiPredictedPrice || currentCampaign.budget).toLocaleString()}
                      </p>
                      {currentCampaign.priceConfidence && (
                        <p className="text-xs text-green-600">
                          신뢰도 {currentCampaign.priceConfidence}%
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* 요구사항 */}
                  <div className="space-y-2 mb-4">
                    <h5 className="font-semibold text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      요구사항
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {currentCampaign.requirements.map((req, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-xs rounded-full">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* 실시간 지원 현황 */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(3, currentCampaign.applicants))].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                        ))}
                        {currentCampaign.applicants > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-bold">+{currentCampaign.applicants - 3}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{currentCampaign.applicants}명 지원</p>
                        <p className="text-xs text-gray-500">
                          <span className="text-green-600">●</span> {currentCampaign.viewingNow}명 보는 중
                        </p>
                      </div>
                    </div>
                    
                    {/* 경쟁률 표시 */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500">경쟁률</p>
                      <p className="text-lg font-bold text-orange-600">
                        {(currentCampaign.applicants / 10).toFixed(1)}:1
                      </p>
                    </div>
                  </div>
                  
                  {/* 스와이프 힌트 */}
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <X className="w-4 h-4" />
                      패스
                    </div>
                    <div className="flex items-center gap-1">
                      <ChevronUp className="w-4 h-4" />
                      상세보기
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      지원
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 스와이프 인디케이터 */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: useTransform(x, [-100, 0, 100], [0, 0, 1]) }}
              >
                <div className="absolute inset-0 bg-green-500/20 rounded-3xl flex items-center justify-center">
                  <Heart className="w-32 h-32 text-green-500" fill="currentColor" />
                </div>
              </motion.div>
              
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: useTransform(x, [-100, 0, 100], [1, 0, 0]) }}
              >
                <div className="absolute inset-0 bg-red-500/20 rounded-3xl flex items-center justify-center">
                  <X className="w-32 h-32 text-red-500" />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="fixed bottom-8 left-0 right-0">
        <div className="flex justify-center items-center gap-6 px-8">
          {/* 패스 버튼 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform border-2 border-gray-100"
            disabled={session.remainingSwipes <= 0}
          >
            <X className="w-7 h-7 text-gray-500" />
          </motion.button>
          
          {/* 슈퍼라이크 버튼 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('super')}
            className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform relative"
            disabled={session.remainingSwipes <= 0}
          >
            <Star className="w-9 h-9 text-white" fill="white" />
            {session.remainingSwipes <= 0 && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
            )}
          </motion.button>
          
          {/* 지원하기 버튼 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
            disabled={session.remainingSwipes <= 0}
          >
            <Heart className="w-7 h-7 text-white" fill="white" />
          </motion.button>
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
              className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              
              <h3 className="text-xl font-bold mb-4">{currentCampaign.title}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">📝 상세 설명</h4>
                  <p className="text-gray-600">{currentCampaign.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">📊 AI 분석 결과</h4>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">예상 도달</p>
                        <p className="font-bold">150K+</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">예상 참여</p>
                        <p className="font-bold">5.2K+</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ROI 예측</p>
                        <p className="font-bold text-green-600">+240%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">성공 확률</p>
                        <p className="font-bold">{currentCampaign.matchScore}%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {currentCampaign.deliverables && (
                  <div>
                    <h4 className="font-semibold mb-2">📦 제작물</h4>
                    <div className="space-y-2">
                      {currentCampaign.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleSwipe('right');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold"
                >
                  지원하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 스와이프 제한 모달 */}
      {session.remainingSwipes === 0 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"
          >
            <Timer className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">오늘의 스와이프 완료!</h3>
            <p className="text-gray-600 mb-4">
              10개의 캠페인을 모두 확인했습니다.
              <br />
              <span className="font-bold text-purple-600">
                {formatTimeRemaining(session.nextRefreshTime)}
              </span> 후에 새로운 캠페인을 확인하세요!
            </p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/profile')}
                className="w-full py-2 bg-purple-600 text-white rounded-lg"
              >
                프로필 개선하기
              </button>
              <button
                onClick={() => router.push('/applications')}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                지원 현황 보기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}