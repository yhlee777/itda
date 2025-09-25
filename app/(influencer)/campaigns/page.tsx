'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  X, Heart, Star, Sparkles, Users, DollarSign, Calendar, 
  TrendingUp, ChevronUp, Building2, Zap, Target, Megaphone,
  Bell, Home, Search, MessageCircle, User, Clock, Info, MapPin,
  Award, Flame
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import type { Database } from '@/types/database.types';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Advertiser = Database['public']['Tables']['advertisers']['Row'];

interface CampaignWithAdvertiser extends Campaign {
  advertiser?: Advertiser | null;
}

const categoryImages: Record<string, string> = {
  tech: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
  fashion: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop',
  food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  sports: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=600&fit=crop',
  lifestyle: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
  music: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
  travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
  automotive: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
  default: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'
};

const categoryLabels: Record<string, string> = {
  tech: '테크',
  beauty: '뷰티',
  fashion: '패션',
  food: '푸드',
  sports: '스포츠',
  lifestyle: '라이프',
  gaming: '게이밍',
  music: '음악',
  travel: '여행',
  automotive: '자동차'
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithAdvertiser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [influencerId, setInfluencerId] = useState<string | null>(null);
  const [swipesLeft, setSwipesLeft] = useState(10);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);
  
  const supabase = createClient();

  const loadUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: influencer } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (influencer) {
        setInfluencerId(influencer.id);
      }
    }
  };

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          advertiser:advertisers (
            id,
            company_name,
            is_verified
          )
        `)
        .eq('status', 'active')
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // 타입 캐스팅
      setCampaigns((data as CampaignWithAdvertiser[]) || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('캠페인 로딩 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const checkDailyLimit = async () => {
    if (!influencerId) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count } = await supabase
      .from('swipe_history')
      .select('*', { count: 'exact', head: true })
      .eq('influencer_id', influencerId)
      .gte('swiped_at', today.toISOString());
    
    const remaining = 10 - (count || 0);
    setSwipesLeft(remaining);
    setDailyLimitReached(remaining <= 0);
  };

  const handleSwipeAction = async (action: 'like' | 'pass' | 'super_like') => {
    if (!influencerId || !currentCampaign || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // 애니메이션 설정
      if (action === 'like') {
        setExitX(300);
      } else if (action === 'pass') {
        setExitX(-300);
      } else if (action === 'super_like') {
        setExitY(-500);
      }
      
      // 다음 카드로 이동
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setExitX(0);
        setExitY(0);
        setIsProcessing(false);
      }, 300);
      
      // 스와이프 기록
      await supabase
        .from('swipe_history')
        .insert({
          influencer_id: influencerId,
          campaign_id: currentCampaign.id,
          action: action,
          match_score: Math.random() * 30 + 70
        });
      
      // 좋아요/슈퍼라이크 시 지원
      if (action === 'like' || action === 'super_like') {
        await supabase
          .from('campaign_influencers')
          .insert({
            campaign_id: currentCampaign.id,
            influencer_id: influencerId,
            status: 'pending',
            match_score: action === 'super_like' ? 95 : 75,
            agreed_price: currentCampaign.budget || 0,
            applied_at: new Date().toISOString()
          });
      }
      
      setSwipesLeft(prev => prev - 1);
      
      if (action === 'super_like') {
        toast.success('⚡ 슈퍼 라이크!');
      } else if (action === 'like') {
        toast.success('❤️ 지원 완료!');
      } else {
        toast('👋 패스!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (influencerId) {
      loadCampaigns();
      checkDailyLimit();
    }
  }, [influencerId]);

  const currentCampaign = campaigns[currentIndex];

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden flex flex-col">
      {/* 헤더 - 더 슬림하게 */}
      <header className="bg-white/90 backdrop-blur-md border-b">
        <div className="px-4 py-2 flex justify-between items-center">
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            ITDA
          </h1>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded-full transition">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="bg-purple-100 px-2.5 py-1 rounded-full">
              <span className="text-xs font-bold text-purple-700">{swipesLeft}/10</span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 - 액션 버튼 포함 */}
      <main className="flex-1 relative overflow-hidden pb-4">
        {isLoading ? (
          <LoadingState />
        ) : dailyLimitReached ? (
          <DailyLimitState />
        ) : currentCampaign ? (
          <div className="h-full w-full flex flex-col">
            {/* 카드 영역 */}
            <div className="flex-1">
              <SwipeableCard 
                campaign={currentCampaign}
                onSwipe={handleSwipeAction}
                isProcessing={isProcessing}
                exitX={exitX}
                exitY={exitY}
                onShowDetails={() => setShowDetails(true)}
              />
            </div>
            
            {/* 액션 버튼 - 카드 바로 아래 */}
            <div className="flex justify-center gap-4 px-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipeAction('pass')}
                disabled={isProcessing}
                className="w-14 h-14 bg-white rounded-full shadow-lg border flex items-center justify-center"
              >
                <X className="w-7 h-7 text-red-500" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipeAction('super_like')}
                disabled={isProcessing}
                className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-xl flex items-center justify-center"
              >
                <Star className="w-8 h-8 text-white" fill="white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipeAction('like')}
                disabled={isProcessing}
                className="w-14 h-14 bg-white rounded-full shadow-lg border flex items-center justify-center"
              >
                <Heart className="w-7 h-7 text-green-500" />
              </motion.button>
            </div>
          </div>
        ) : (
          <EmptyState onRefresh={loadCampaigns} />
        )}
      </main>

      {/* 하단 네비게이션 바 - 하나만! */}
      <nav className="bg-white border-t">
        <div className="px-4 py-2">
          <div className="flex justify-around">
            <button className="p-2 text-purple-600">
              <Home className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-400">
              <Search className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-400">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-400">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* 상세 모달 */}
      <AnimatePresence>
        {showDetails && currentCampaign && (
          <CampaignDetailModal
            campaign={currentCampaign}
            onClose={() => setShowDetails(false)}
            onApply={() => handleSwipeAction('like')}
            onPass={() => handleSwipeAction('pass')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// 매력적인 스와이프 카드
function SwipeableCard({ 
  campaign, 
  onSwipe, 
  isProcessing,
  exitX,
  exitY,
  onShowDetails
}: { 
  campaign: CampaignWithAdvertiser;
  onSwipe: (action: 'like' | 'pass' | 'super_like') => void;
  isProcessing: boolean;
  exitX: number;
  exitY: number;
  onShowDetails: () => void;
}) {
  const y = useMotionValue(0);
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (-info.offset.y > 50) {
      onShowDetails();
    }
    y.set(0);
  };

  const formatBudget = (budget: number | null) => {
    if (!budget) return '협의';
    if (budget >= 100000000) return `${(budget / 100000000).toFixed(1)}억`;
    if (budget >= 10000000) return `${(budget / 10000000).toFixed(0)}천만`;
    if (budget >= 1000000) return `${(budget / 1000000).toFixed(0)}백만`;
    return `${(budget / 10000).toFixed(0)}만원`;
  };

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getUrgencyColor = (days: number | null) => {
    if (!days) return 'text-gray-600';
    if (days <= 3) return 'text-red-500';
    if (days <= 7) return 'text-orange-500';
    return 'text-gray-600';
  };
  
  return (
    <motion.div
      style={{ x: 0, y }}
      drag="y"
      dragConstraints={{ top: -150, bottom: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 || exitY !== 0 ? { x: exitX, y: exitY, opacity: 0 } : { x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className="h-full w-full px-3 pt-3 cursor-grab active:cursor-grabbing"
    >
      <div className="h-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* 이미지 영역 - 화면의 45% */}
        <div className="relative flex-[0.45] overflow-hidden">
          <img 
            src={categoryImages[campaign.categories?.[0] || 'default']}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
          
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* 프리미엄 뱃지 */}
          {campaign.is_premium && (
            <div className="absolute top-3 left-3 z-20">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Flame className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-bold text-white">HOT</span>
              </div>
            </div>
          )}
          
          {/* 긴급도 표시 */}
          {getDaysLeft(campaign.deadline) && getDaysLeft(campaign.deadline)! <= 3 && (
            <div className="absolute top-3 right-3 z-20">
              <div className="bg-red-500 px-2.5 py-1 rounded-full animate-pulse">
                <span className="text-xs font-bold text-white">긴급!</span>
              </div>
            </div>
          )}
          
          {/* 브랜드 정보 - 이미지 하단 */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-white/20 backdrop-blur-md rounded-full px-2.5 py-0.5">
                    <span className="text-white text-xs font-medium">
                      {categoryLabels[campaign.categories?.[0] || 'default'] || '기타'}
                    </span>
                  </div>
                  {campaign.advertiser?.is_verified && (
                    <div className="bg-blue-500 rounded-full p-1">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                      </svg>
                    </div>
                  )}
                </div>
                <h2 className="text-white text-lg font-bold">
                  {campaign.advertiser?.company_name || '브랜드명'}
                </h2>
                <p className="text-white/90 text-sm line-clamp-1">
                  {campaign.name}
                </p>
              </div>
              
              {/* 예산 강조 */}
              <div className="text-right">
                <p className="text-white/70 text-xs mb-0.5">예산</p>
                <p className="text-white text-xl font-black">
                  {formatBudget(campaign.budget)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 정보 영역 - 화면의 55% */}
        <div className="flex-[0.55] p-4 flex flex-col">
          {/* 캠페인 설명 */}
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
            {campaign.description || '브랜드와 함께 특별한 콘텐츠를 만들어보세요!'}
          </p>
          
          {/* 핵심 정보 그리드 */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="bg-purple-100 rounded-xl p-2.5">
                <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">마감</p>
                <p className={`text-sm font-bold ${getUrgencyColor(getDaysLeft(campaign.deadline))}`}>
                  D-{getDaysLeft(campaign.deadline) || '?'}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-xl p-2.5">
                <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">지원자</p>
                <p className="text-sm font-bold text-gray-900">
                  {campaign.application_count || 0}명
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-xl p-2.5">
                <TrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">조회수</p>
                <p className="text-sm font-bold text-gray-900">
                  {campaign.view_count || 0}
                </p>
              </div>
            </div>
          </div>
          
          {/* 상세보기 영역 - 버튼에 가려지지 않도록 */}
          <div className="mt-auto">
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">
                  지금 {Math.floor(Math.random() * 10) + 5}명이 보는 중
                </span>
              </div>
              <button
                onClick={onShowDetails}
                className="text-sm text-purple-600 font-bold px-3 py-1.5 hover:bg-purple-50 rounded-lg transition"
              >
                상세보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 로딩 상태
function LoadingState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        <p className="text-gray-600">캠페인 로딩중...</p>
      </div>
    </div>
  );
}

// 일일 제한 상태
function DailyLimitState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center p-6">
        <Clock className="w-20 h-20 mx-auto mb-4 text-purple-300" />
        <h3 className="text-2xl font-bold mb-2">오늘의 스와이프 완료!</h3>
        <p className="text-gray-600 mb-4">내일 다시 만나요 💜</p>
        <p className="text-sm text-gray-500">매일 10개의 캠페인을 만날 수 있어요</p>
      </div>
    </div>
  );
}

// 빈 상태
function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center p-6">
        <Sparkles className="w-20 h-20 mx-auto mb-4 text-purple-300" />
        <h3 className="text-2xl font-bold mb-2">모든 캠페인 확인 완료!</h3>
        <p className="text-gray-600 mb-4">새로운 캠페인을 기다려주세요</p>
        <button
          onClick={onRefresh}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg transition"
        >
          새로고침
        </button>
      </div>
    </div>
  );
}

// 상세 모달
function CampaignDetailModal({
  campaign,
  onClose,
  onApply,
  onPass
}: {
  campaign: CampaignWithAdvertiser;
  onClose: () => void;
  onApply: () => void;
  onPass: () => void;
}) {
  const formatBudget = (budget: number | null) => {
    if (!budget) return '협의';
    if (budget >= 100000000) return `${(budget / 100000000).toFixed(1)}억`;
    if (budget >= 10000000) return `${(budget / 10000000).toFixed(0)}천만원`;
    if (budget >= 1000000) return `${(budget / 1000000).toFixed(0)}백만원`;
    return `${(budget / 10000).toFixed(0)}만원`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-h-[90vh] bg-white rounded-t-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div className="p-4 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>
        
        {/* 스크롤 가능한 컨텐츠 */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
          {/* 헤더 이미지 */}
          <div className="relative h-48 -mx-6 mb-6 overflow-hidden">
            <img 
              src={categoryImages[campaign.categories?.[0] || 'default']}
              alt={campaign.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* 브랜드 오버레이 */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-7 h-7 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-lg flex items-center gap-1">
                    {campaign.advertiser?.company_name || '브랜드명'}
                    {campaign.advertiser?.is_verified && (
                      <svg className="w-4 h-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                      </svg>
                    )}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {campaign.categories?.map((cat, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-white/20 backdrop-blur text-white rounded-full">
                        {categoryLabels[cat] || cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 캠페인 제목 */}
          <h2 className="text-2xl font-bold mb-3">{campaign.name}</h2>
          
          {/* 핵심 정보 카드 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">예산</span>
              </div>
              <p className="font-bold text-xl text-gray-900">
                {formatBudget(campaign.budget)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">캠페인 기간</span>
              </div>
              <p className="font-bold text-gray-900">
                {campaign.start_date && campaign.end_date ? 
                  `${Math.ceil((new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / (1000 * 60 * 60 * 24))}일` :
                  '14일'}
              </p>
            </div>
          </div>
          
          {/* 상세 설명 섹션 */}
          <div className="space-y-6">
            {/* 캠페인 소개 */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                이런 분을 찾아요
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {campaign.description || '브랜드의 가치를 함께 전달할 수 있는 인플루언서를 찾고 있어요. 진정성 있는 콘텐츠로 팔로워들과 소통하시는 분이면 좋겠습니다.'}
              </p>
            </div>
            
            {/* 요청사항 */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                진행 방식
              </h3>
              <div className="space-y-3">
                {campaign.requirements?.map((req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">{i + 1}</span>
                    </div>
                    <span className="text-gray-600">{req}</span>
                  </div>
                )) || (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">1</span>
                      </div>
                      <span className="text-gray-600">제품 사용 후 솔직한 리뷰 작성</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">2</span>
                      </div>
                      <span className="text-gray-600">일상 속 자연스러운 착용 컷 3장</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">3</span>
                      </div>
                      <span className="text-gray-600">15-30초 릴스 또는 숏폼 영상 1개</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* 혜택 */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                제공 혜택
              </h3>
              <div className="bg-purple-50 p-4 rounded-xl">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    제품 무료 제공
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    콘텐츠 제작 비용 별도 지급
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    우수 콘텐츠 추가 인센티브
                  </li>
                </ul>
              </div>
            </div>
            
            {/* 추가 정보 */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-semibold mb-3 text-gray-900">캠페인 정보</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">마감일</span>
                  <span className="font-medium text-gray-900">
                    {campaign.deadline ? 
                      new Date(campaign.deadline).toLocaleDateString('ko-KR') : 
                      '추후 협의'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">희망 팔로워</span>
                  <span className="font-medium text-gray-900">
                    {campaign.min_followers ? 
                      `${(campaign.min_followers / 10000).toFixed(0)}만 이상` : 
                      '제한 없음'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">현재 지원자</span>
                  <span className="font-medium text-purple-600">
                    {campaign.application_count || 0}명
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">캠페인 조회</span>
                  <span className="font-medium text-gray-900">
                    {campaign.view_count || 0}회
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 하단 버튼 - 고정 */}
        <div className="p-6 pt-4 border-t bg-white">
          <div className="flex gap-3">
            <button
              onClick={() => {
                onPass();
                onClose();
              }}
              className="flex-1 py-4 border border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              다음에 할게요
            </button>
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-xl transition transform hover:scale-[1.02]"
            >
              지원하기
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}