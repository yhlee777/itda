'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  X, Heart, Star, Sparkles, Users, DollarSign, Calendar, 
  TrendingUp, ChevronUp, Building2, Zap, Target, Megaphone,
  Bell, Home, Search, MessageCircle, User, Clock, Info, MapPin
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import type { Database } from '@/types/database.types';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Advertiser = Database['public']['Tables']['advertisers']['Row'];

// 타입 수정: advertisers는 단수가 아니라 advertiser여야 함
interface CampaignWithAdvertiser extends Campaign {
  advertiser?: Advertiser | null;
}

const categoryImages: Record<string, string> = {
  tech: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop',
  fashion: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=400&fit=crop',
  food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop',
  sports: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=400&fit=crop',
  lifestyle: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
  gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop',
  music: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
  travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
  automotive: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b">
        <div className="w-full px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
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

      {/* 메인 */}
      <main className="pt-16 px-2 pb-20">
        <div className="w-full max-w-sm mx-auto min-h-[calc(100vh-136px)] flex items-center justify-center">
          {isLoading ? (
            <LoadingState />
          ) : dailyLimitReached ? (
            <DailyLimitState />
          ) : currentCampaign ? (
            <div className="relative w-full">
              <SwipeableCard 
                campaign={currentCampaign}
                onSwipe={handleSwipeAction}
                isProcessing={isProcessing}
                exitX={exitX}
                exitY={exitY}
                onShowDetails={() => setShowDetails(true)}
              />
            </div>
          ) : (
            <EmptyState onRefresh={loadCampaigns} />
          )}
        </div>
      </main>

      {/* 액션 버튼 */}
      {currentCampaign && !dailyLimitReached && !showDetails && (
        <div className="fixed bottom-20 left-0 right-0 z-40">
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipeAction('pass')}
              disabled={isProcessing}
              className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center"
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
              className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
              <Heart className="w-7 h-7 text-green-500" />
            </motion.button>
          </div>
        </div>
      )}

      {/* 하단 네비 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-30">
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

// 개선된 스와이프 카드
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
    if (budget >= 10000000) return `${(budget / 10000000).toFixed(0)}천만원`;
    if (budget >= 1000000) return `${(budget / 1000000).toFixed(0)}백만원`;
    return `${(budget / 10000).toFixed(0)}만원`;
  };

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getLocation = () => {
    // metadata에서 location 가져오기 시도
    if (campaign.metadata && typeof campaign.metadata === 'object' && 'location' in campaign.metadata) {
      return (campaign.metadata as any).location;
    }
    // target_audience에서 가져오기 시도
    if (campaign.target_audience && typeof campaign.target_audience === 'object' && 'location' in campaign.target_audience) {
      return (campaign.target_audience as any).location;
    }
    return '서울/수도권';
  };

  const getDuration = () => {
    // campaign.duration이 없으면 날짜 계산
    if (campaign.start_date && campaign.end_date) {
      const start = new Date(campaign.start_date);
      const end = new Date(campaign.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 7) return '1주';
      if (days <= 14) return '2주';
      if (days <= 30) return '1개월';
      return `${Math.ceil(days / 30)}개월`;
    }
    return '2주';
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
      className="w-full cursor-grab active:cursor-grabbing"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
        {/* 프리미엄 뱃지 */}
        {campaign.is_premium && (
          <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
            <span className="text-xs font-bold text-white flex items-center gap-0.5">
              <Star className="w-3 h-3" fill="white" /> 프리미엄
            </span>
          </div>
        )}

        {/* 이미지 - 높이 축소 */}
        <div className="relative h-40 overflow-hidden">
          <img 
            src={categoryImages[campaign.categories?.[0] || 'default']}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* 스와이프 힌트 - 작은 아이콘 */}
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
            <ChevronUp className="w-4 h-4 text-purple-600" />
          </div>
        </div>

        {/* 브랜드 정보 - 상단 강조 */}
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-base flex items-center gap-1">
                  {campaign.advertiser?.company_name || '브랜드명'}
                  {campaign.advertiser?.is_verified && (
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                    </svg>
                  )}
                </p>
                <div className="flex gap-2">
                  {campaign.categories?.map((cat, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
                      {categoryLabels[cat] || cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">조회 {campaign.view_count || 0}</p>
              <p className="text-xs text-gray-500">지원 {campaign.application_count || 0}</p>
            </div>
          </div>
        </div>

        {/* 캠페인 제목 */}
        <div className="px-4 pt-3">
          <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
            {campaign.name}
          </h2>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {campaign.description}
          </p>
        </div>

        {/* 핵심 정보 - 2열 그리드 */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            {/* 예산 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600">예산</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatBudget(campaign.budget)}
              </p>
            </div>

            {/* 마감일 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600">마감</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                D-{getDaysLeft(campaign.deadline)}
              </p>
            </div>
          </div>

          {/* 추가 정보 - 간단히 */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {getLocation()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getDuration()}
              </span>
            </div>
            {/* 터치 영역 확대를 위한 padding 추가 */}
            <button
              onClick={onShowDetails}
              className="text-xs text-purple-600 font-medium px-2 py-1 -mr-2"
            >
              상세보기
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 로딩 상태
function LoadingState() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-gray-600">캠페인 로딩중...</p>
    </div>
  );
}

// 일일 제한 상태
function DailyLimitState() {
  return (
    <div className="text-center p-6">
      <Clock className="w-16 h-16 mx-auto mb-4 text-purple-300" />
      <h3 className="text-xl font-bold mb-2">오늘의 스와이프를 모두 사용했어요!</h3>
      <p className="text-gray-600">내일 다시 만나요 💜</p>
    </div>
  );
}

// 빈 상태
function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="text-center p-6">
      <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-300" />
      <h3 className="text-xl font-bold mb-2">모든 캠페인을 확인했어요!</h3>
      <button
        onClick={onRefresh}
        className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
      >
        새로고침
      </button>
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
        className="w-full max-h-[85vh] bg-white rounded-t-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 - 고정 */}
        <div className="p-4 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>
        
        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
          {/* 브랜드 정보 */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b sticky top-0 bg-white z-10">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-lg flex items-center gap-1">
                {campaign.advertiser?.company_name || '브랜드명'}
                {campaign.advertiser?.is_verified && (
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                  </svg>
                )}
              </p>
              <div className="flex gap-2 mt-1">
                {campaign.categories?.map((cat, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
                    {categoryLabels[cat] || cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* 캠페인 제목 */}
          <h2 className="text-2xl font-bold mb-4">{campaign.name}</h2>
          
          {/* 캠페인 이미지 */}
          <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
            <img 
              src={categoryImages[campaign.categories?.[0] || 'default']}
              alt={campaign.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 핵심 정보 카드 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600">예산</span>
              </div>
              <p className="font-bold text-lg">
                {campaign.budget ? 
                  `${(campaign.budget / 10000).toFixed(0)}만원` : 
                  '협의'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600">캠페인 기간</span>
              </div>
              <p className="font-bold">
                {campaign.start_date && campaign.end_date ? 
                  `${Math.ceil((new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / (1000 * 60 * 60 * 24))}일` :
                  '14일'}
              </p>
            </div>
          </div>
          
          {/* 상세 설명 섹션들 */}
          <div className="space-y-6">
            {/* 캠페인 설명 */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-600" />
                캠페인 소개
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {campaign.description || '브랜드와 함께 멋진 콘텐츠를 만들어보세요!'}
              </p>
            </div>
            
            {/* 요청사항 */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                요청 사항
              </h3>
              <ul className="text-gray-600 space-y-2">
                {campaign.requirements?.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{req}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>자연스러운 일상 속 착용 컷</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>제품의 주요 기능 3가지 이상 소개</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>15-30초 릴스 영상 제작</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>브랜드 공식 해시태그 필수 포함</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            {/* 제공 사항 */}
            {campaign.deliverables && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  제공 사항
                </h3>
                <p className="text-gray-600">
                  제품 무료 제공 + 촬영 비용 별도 지급
                </p>
              </div>
            )}
            
            {/* 추가 정보 */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-600" />
                추가 정보
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">마감일</span>
                  <span className="font-medium">
                    {campaign.deadline ? 
                      new Date(campaign.deadline).toLocaleDateString('ko-KR') : 
                      '추후 협의'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">희망 팔로워</span>
                  <span className="font-medium">
                    {campaign.min_followers ? 
                      `${(campaign.min_followers / 10000).toFixed(0)}만 이상` : 
                      '제한 없음'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">참여율</span>
                  <span className="font-medium">
                    {campaign.min_engagement_rate ? 
                      `${campaign.min_engagement_rate}% 이상` : 
                      '제한 없음'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">현재 지원자</span>
                  <span className="font-medium text-purple-600">
                    {campaign.application_count || 0}명
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
              className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              패스
            </button>
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition"
            >
              지원하기
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}