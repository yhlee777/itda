'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  X, Heart, Star, Sparkles, Users, DollarSign, Calendar, 
  TrendingUp, ChevronUp, Building2, Zap, Target, Megaphone,
  Bell, Home, Search, MessageCircle, User, Clock, MapPin, Info
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import type { Database } from '@/types/database.types';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';

// 타입 정의
type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Advertiser = Database['public']['Tables']['advertisers']['Row'];

interface CampaignWithAdvertiser extends Campaign {
  advertisers?: Advertiser;
}

// 카테고리별 이미지
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

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithAdvertiser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [influencerId, setInfluencerId] = useState<string | null>(null);
  const [swipesLeft, setSwipesLeft] = useState(10);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null);
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  const supabase = useMemo(() => createClient(), []);

  const loadUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        window.location.href = '/login';
        return;
      }
      
      const { data: influencer } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!influencer) {
        toast.error('프로필을 완성해주세요');
        window.location.href = '/onboarding';
        return;
      }
      
      setInfluencerId(influencer.id);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadCampaigns = async () => {
    if (!influencerId) return;
    
    setIsLoading(true);
    try {
      const { data: swipedCampaigns } = await supabase
        .from('swipe_history')
        .select('campaign_id')
        .eq('influencer_id', influencerId);
      
      const swipedIds = swipedCampaigns?.map(s => s.campaign_id) || [];
      
      let query = supabase
        .from('campaigns')
        .select('*, advertisers!inner(*)')
        .eq('status', 'active');
      
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }
      
      const { data, error } = await query
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setCampaigns(data as CampaignWithAdvertiser[] || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDailyLimit = async () => {
    if (!influencerId) return;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data } = await supabase
        .from('swipe_history')
        .select('id', { count: 'exact' })
        .eq('influencer_id', influencerId)
        .gte('swiped_at', today.toISOString());
      
      const todaySwipes = data?.length || 0;
      const remaining = Math.max(0, 10 - todaySwipes);
      
      setSwipesLeft(remaining);
      
      if (remaining === 0) {
        setDailyLimitReached(true);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setNextRefreshTime(tomorrow);
      }
    } catch (error) {
      console.error('Error checking limit:', error);
    }
  };

  const handleSwipeAction = async (action: 'like' | 'pass' | 'super_like') => {
    if (!influencerId || !currentCampaign || isProcessing) return;
    
    setIsProcessing(true);
    setShowDetails(false);
    
    // 애니메이션 설정
    if (action === 'super_like') {
      setExitY(-1000);
    } else if (action === 'like') {
      setExitX(1000);
    } else {
      setExitX(-1000);
    }
    
    // 즉시 다음 카드로 이동
    setTimeout(() => {
      setExitX(0);
      setExitY(0);
      
      if (currentIndex < campaigns.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        loadCampaigns();
      }
      setIsProcessing(false);
    }, 150); // 300ms -> 150ms로 단축
    
    // 비동기로 DB 처리
    try {
      // 스와이프 기록
      await supabase
        .from('swipe_history')
        .insert({
          influencer_id: influencerId,
          campaign_id: currentCampaign.id,
          action: action,
          match_score: action === 'super_like' ? 95 : (action === 'like' ? 75 : 0),
          swiped_at: new Date().toISOString()
        });
      
      // 지원하기
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
        
        // 알림
        if (currentCampaign.advertisers?.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: currentCampaign.advertisers.id,
              type: action === 'super_like' ? 'super_like' : 'new_applicant',
              title: action === 'super_like' ? '⚡ 슈퍼 라이크!' : '새 지원자',
              message: `"${currentCampaign.name}"에 인플루언서가 지원했습니다!`,
              created_at: new Date().toISOString()
            });
        }
      }
      
      // 카운트 감소
      setSwipesLeft(prev => prev - 1);
      
      // 피드백
      if (action === 'super_like') {
        toast.success('⚡ 슈퍼 라이크!');
      } else if (action === 'like') {
        toast.success('❤️ 지원 완료!');
      } else {
        toast('👋 패스!');
      }
      
      // 다음 카드로 이동 완료 후 DB 처리
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
      {/* 상단 헤더 - 하나만! */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            ITDA
          </h1>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="bg-purple-100 px-3 py-1 rounded-full">
              <span className="text-sm font-bold text-purple-700">{swipesLeft}/10</span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="pt-14 pb-20 px-2 min-h-screen">
        <div className="max-w-lg mx-auto h-[calc(100vh-140px)] flex items-start justify-center -mt-14">
          {isLoading ? (
            <LoadingState />
          ) : dailyLimitReached ? (
            <DailyLimitState nextRefreshTime={nextRefreshTime} />
          ) : currentCampaign ? (
            <div className="relative w-full h-full flex items-center justify-center">
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
          <div className="flex justify-center gap-5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipeAction('pass')}
              disabled={isProcessing}
              className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center"
            >
              <X className="w-8 h-8 text-red-500" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipeAction('super_like')}
              disabled={isProcessing}
              className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center"
            >
              <Star className="w-10 h-10 text-white" fill="white" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipeAction('like')}
              disabled={isProcessing}
              className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center"
            >
              <Heart className="w-8 h-8 text-green-500" />
            </motion.button>
          </div>
        </div>
      )}

      {/* 하단 네비 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-30">
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex justify-around">
            <button className="p-3 text-purple-600">
              <Home className="w-6 h-6" />
            </button>
            <button className="p-3 text-gray-400">
              <Search className="w-6 h-6" />
            </button>
            <button className="p-3 text-gray-400">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="p-3 text-gray-400">
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

// 스와이프 카드
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    // 위로 스와이프만 감지 (상세보기) - 임계값 낮춤
    if (-info.offset.y > 50) {
      onShowDetails();
    }
    // 드래그 후 즉시 원위치로
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
  
  return (
    <motion.div
      style={{ x: 0, y }}
      drag="y"
      dragConstraints={{ top: -150, bottom: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 || exitY !== 0 ? { x: exitX, y: exitY, opacity: 0 } : { x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className="absolute w-full cursor-grab active:cursor-grabbing"
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl" style={{ height: '650px' }}>
        {/* 프리미엄 뱃지 */}
        {campaign.is_premium && (
          <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-yellow-500 rounded-full">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <Star className="w-3 h-3" fill="white" /> PREMIUM
            </span>
          </div>
        )}

        {/* 이미지 */}
        <div className="relative h-80 rounded-t-3xl overflow-hidden">
          <img 
            src={categoryImages[campaign.categories?.[0] || 'default']}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* 브랜드 정보 */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-white/80 text-sm">by</p>
                <p className="text-white font-bold text-lg">{campaign.advertisers?.company_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 위로 스와이프 힌트 - 사진 바로 아래 */}
        <motion.div 
          className="flex justify-center -mt-4 relative z-20 px-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-1 shadow-xl">
            <ChevronUp className="w-4 h-4" />
            위로 스와이프해서 상세보기
          </div>
        </motion.div>

        {/* 정보 */}
        <div className="p-6 pt-2">
          <h2 className="text-2xl font-bold mb-3">{campaign.name}</h2>
          <p className="text-gray-600 text-base mb-5 line-clamp-2">{campaign.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">예산</p>
              <p className="text-base font-bold text-gray-900">{formatBudget(campaign.budget)}</p>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-xl">
              <Calendar className="w-6 h-6 text-pink-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">마감</p>
              <p className="text-base font-bold text-gray-900">D-{getDaysLeft(campaign.deadline) || '?'}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">지원자</p>
              <p className="text-base font-bold text-gray-900">{campaign.application_count || 0}명</p>
            </div>
          </div>

          <div className="flex gap-2">
            {campaign.categories?.map((cat, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">
                #{cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
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
    if (budget >= 10000000) return `${(budget / 10000000).toFixed(0)}천만원`;
    if (budget >= 1000000) return `${(budget / 1000000).toFixed(0)}백만원`;
    return `${(budget / 10000).toFixed(0)}만원`;
  };

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const y = useMotionValue(0);
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    // 아래로 100px 이상 드래그하면 닫기
    if (info.offset.y > 100) {
      onClose();
    } else {
      // 그렇지 않으면 원위치
      y.set(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 500 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="bg-white w-full rounded-t-3xl h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pb-20">
          {/* 핸들 바 - 드래그 가능 */}
          <div className="sticky top-0 bg-white z-10 py-3 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
            <p className="text-xs text-gray-400 text-center mt-2">아래로 드래그하여 닫기</p>
          </div>
          
          {/* 메인 이미지 */}
          <div className="relative h-72">
            <img 
              src={categoryImages[campaign.categories?.[0] || 'default']}
              alt={campaign.name}
              className="w-full h-full object-cover"
            />
            {campaign.is_premium && (
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                <span className="text-sm font-bold text-white flex items-center gap-1">
                  <Star className="w-4 h-4" fill="white" /> PREMIUM
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <p className="text-white/90 text-sm mb-1">캠페인</p>
              <h2 className="text-3xl font-bold text-white">{campaign.name}</h2>
            </div>
          </div>

          <div className="px-6">
            {/* 브랜드 정보 */}
            <div className="py-4 border-b">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">광고주</p>
                  <p className="text-lg font-bold text-gray-900">{campaign.advertisers?.company_name}</p>
                  {campaign.advertisers?.industry && (
                    <p className="text-sm text-gray-600">{campaign.advertisers.industry}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 핵심 정보 */}
            <div className="grid grid-cols-3 gap-3 py-6">
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                <DollarSign className="w-7 h-7 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">예산</p>
                <p className="text-lg font-bold text-gray-900">{formatBudget(campaign.budget)}</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
                <Calendar className="w-7 h-7 text-pink-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">마감</p>
                <p className="text-lg font-bold text-gray-900">D-{getDaysLeft(campaign.deadline) || '?'}</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                <Users className="w-7 h-7 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">지원자</p>
                <p className="text-lg font-bold text-gray-900">{campaign.application_count || 0}명</p>
              </div>
            </div>

            {/* 상세 설명 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-600" />
                캠페인 소개
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {campaign.description || '상세 설명이 없습니다.'}
              </p>
            </div>

            {/* 요구사항 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                요구사항
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">최소 팔로워 1만명 이상</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">월 2회 이상 포스팅 가능</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">브랜드 가이드라인 준수</span>
                </li>
                {campaign.requirements?.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 캠페인 진행 방식 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                진행 프로세스
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">매칭 확정</p>
                    <p className="text-sm text-gray-600">광고주가 인플루언서 선정</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">콘텐츠 제작</p>
                    <p className="text-sm text-gray-600">가이드라인에 따라 콘텐츠 제작</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">검수 및 피드백</p>
                    <p className="text-sm text-gray-600">광고주 검토 및 수정 요청</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">업로드 및 정산</p>
                    <p className="text-sm text-gray-600">콘텐츠 업로드 후 정산 진행</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 활동 플랫폼 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">활동 플랫폼</h3>
              <div className="flex gap-2 flex-wrap">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium">
                  📷 Instagram
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium">
                  🎵 TikTok
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium">
                  📺 YouTube
                </span>
              </div>
            </div>

            {/* 카테고리 태그 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">카테고리</h3>
              <div className="flex flex-wrap gap-2">
                {campaign.categories?.map((cat, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full font-medium">
                    #{cat}
                  </span>
                ))}
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-2xl">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">알아두세요!</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 선정 후 24시간 내 응답 필수</li>
                    <li>• 초상권 및 저작권은 6개월간 광고주 소유</li>
                    <li>• 세금계산서 발행 가능 여부 확인 필요</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 고정 하단 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={onPass}
              className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              패스
            </button>
            <button
              onClick={onApply}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
            >
              지원하기
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 로딩
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="mt-4 text-gray-600">캠페인을 불러오는 중...</p>
    </div>
  );
}

// 일일 한도
function DailyLimitState({ nextRefreshTime }: { nextRefreshTime: Date | null }) {
  return (
    <div className="text-center">
      <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">오늘의 스와이프 완료!</h2>
      <p className="text-gray-600">내일 다시 만나요!</p>
    </div>
  );
}

// 빈 상태
function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="text-center">
      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">캠페인이 없습니다</h2>
      <button
        onClick={onRefresh}
        className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full"
      >
        새로고침
      </button>
    </div>
  );
}
