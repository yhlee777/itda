'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Heart, Clock, Sparkles, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { ImprovedSwipeQueueManager } from '@/lib/matching/swipe-queue-manager';
import type { Database } from '@/types/database.types';

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
  // 모든 State는 조건 없이 선언
  const [campaigns, setCampaigns] = useState<CampaignWithAdvertiser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [influencerId, setInfluencerId] = useState<string | null>(null);
  const [swipesLeft, setSwipesLeft] = useState(10);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null);
  
  // Supabase 클라이언트 - useMemo로 메모이제이션
  const supabase = useMemo(() => createClient(), []);

  // 함수들 정의
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

  useEffect(() => {
    if (!nextRefreshTime || !dailyLimitReached) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= nextRefreshTime) {
        setDailyLimitReached(false);
        loadCampaigns();
        clearInterval(timer);
      }
    }, 60000);
    
    return () => clearInterval(timer);
  }, [nextRefreshTime, dailyLimitReached]);

  // 카테고리 표시 헬퍼
  const getCategoryDisplay = (campaign: CampaignWithAdvertiser) => {
    if (campaign.categories && campaign.categories.length > 0) {
      return campaign.categories[0];
    }
    return 'general';
  };

  const currentCampaign = campaigns[currentIndex];

  // UI 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              ITDA
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                오늘 남은 스와이프
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">
                {swipesLeft}/10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {isLoading ? (
          <LoadingState />
        ) : dailyLimitReached ? (
          <DailyLimitState nextRefreshTime={nextRefreshTime} />
        ) : currentCampaign ? (
          <CampaignCard 
            campaign={currentCampaign}
            onAction={handleSwipeAction}
            isProcessing={isProcessing}
            category={getCategoryDisplay(currentCampaign)}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// 로딩 컴포넌트
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[500px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">캠페인을 불러오는 중...</p>
      </div>
    </div>
  );
}

// 일일 제한 컴포넌트
function DailyLimitState({ nextRefreshTime }: { nextRefreshTime: Date | null }) {
  return (
    <div className="text-center py-20">
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
  );
}

// 캠페인 카드 컴포넌트
function CampaignCard({ 
  campaign, 
  onAction, 
  isProcessing,
  category 
}: { 
  campaign: CampaignWithAdvertiser;
  onAction: (action: 'like' | 'pass' | 'super_like') => void;
  isProcessing: boolean;
  category: string;
}) {
  return (
    <div className="relative h-[600px]">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
        {/* 캠페인 이미지 */}
        <div className="h-2/3 bg-gradient-to-br from-purple-400 to-pink-400 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-6xl">
              {campaign.advertisers?.company_logo || '🎯'}
            </div>
          </div>
          {/* 카테고리 뱃지 */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 text-purple-600 rounded-full text-sm font-medium">
              {category}
            </span>
          </div>
        </div>
        
        {/* 캠페인 정보 */}
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {campaign.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {campaign.description?.slice(0, 100)}...
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-600 font-medium">
              💰 {(campaign.budget || 0).toLocaleString()}원
            </span>
            <span className="text-gray-500">
              📅 {new Date(campaign.deadline || '').toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
      </div>
      
      {/* 액션 버튼들 */}
      <div className="flex justify-center gap-6 mt-6">
        <button
          onClick={() => onAction('pass')}
          disabled={isProcessing}
          className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
        >
          <X className="w-6 h-6 text-red-500" />
        </button>
        <button
          onClick={() => onAction('super_like')}
          disabled={isProcessing}
          className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
        >
          <Sparkles className="w-6 h-6 text-blue-500" />
        </button>
        <button
          onClick={() => onAction('like')}
          disabled={isProcessing}
          className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
        >
          <Heart className="w-6 h-6 text-green-500" />
        </button>
      </div>
    </div>
  );
}

// 빈 상태 컴포넌트
function EmptyState() {
  return (
    <div className="text-center py-20">
      <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        캠페인이 없습니다
      </h2>
      <p className="text-gray-500">
        잠시 후 다시 시도해주세요
      </p>
    </div>
  );
}