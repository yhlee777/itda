'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Heart, X, Info, Clock, DollarSign, MapPin, 
  TrendingUp, Users, Calendar, Star, ChevronLeft, 
  Filter, Search, Sparkles, Shield, Zap, Crown,
  Eye, MessageCircle, CheckCircle, AlertCircle,
  ArrowRight, Award, Flame, Target, Gift,
  ChevronUp, ArrowUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [dailySwipesLeft, setDailySwipesLeft] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const y = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // 샘플 캠페인 데이터
  const sampleCampaigns: Campaign[] = [
    {
      id: '1',
      brand: '나이키',
      brandLogo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
      title: '2024 에어맥스 캠페인',
      budget: 5000000,
      deadline: '2024.02.15',
      location: '서울',
      category: '패션',
      requirements: [
        '팔로워 5만+',
        '패션 콘텐츠',
        '피드 3개 + 릴스 2개'
      ],
      matchScore: 95,
      applicants: 23,
      viewingNow: 5,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
      description: '나이키의 새로운 에어맥스 컬렉션을 소개하는 캠페인입니다.',
      deliverables: ['인스타그램 피드 3개', '릴스 2개', '스토리 5개'],
      isPremium: true,
      urgency: 'high',
      perks: ['제품 증정', '추가 협업 기회'],
      minFollowers: 50000,
      targetGender: '여성 70%',
      targetAge: '20-35세'
    },
    {
      id: '2',
      brand: '샤넬',
      brandLogo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop',
      title: '봄 뷰티 컬렉션',
      budget: 8000000,
      deadline: '2024.02.28',
      location: '서울/부산',
      category: '뷰티',
      requirements: [
        '팔로워 10만+',
        '뷰티 전문',
        '고품질 콘텐츠'
      ],
      matchScore: 88,
      applicants: 45,
      viewingNow: 12,
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop',
      description: '샤넬의 2024 봄 컬렉션을 알리는 럭셔리 뷰티 캠페인입니다.',
      deliverables: ['인스타그램 피드 5개', '릴스 3개', '유튜브 쇼츠 1개'],
      isVIP: true,
      urgency: 'medium',
      minFollowers: 100000,
      targetGender: '여성 90%',
      targetAge: '25-40세'
    },
    {
      id: '3',
      brand: '스타벅스',
      brandLogo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop',
      title: '체리블라썸 시즌',
      budget: 3000000,
      deadline: '2024.03.10',
      location: '전국',
      category: '푸드',
      requirements: [
        '팔로워 3만+',
        '카페 콘텐츠',
        '자연스러운 일상'
      ],
      matchScore: 92,
      applicants: 67,
      viewingNow: 8,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=800&fit=crop',
      description: '스타벅스 봄 시즌 한정 메뉴를 자연스럽게 소개해주세요.',
      deliverables: ['인스타그램 피드 2개', '스토리 5개'],
      urgency: 'low',
      minFollowers: 30000,
      targetGender: '여성 80%',
      targetAge: '20-30세'
    }
  ];

  useEffect(() => {
    setCampaigns(sampleCampaigns);
  }, []);

  const currentCampaign = campaigns[currentIndex];

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}천만원`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}백만원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    } else {
      return `${amount.toLocaleString()}원`;
    }
  };

  // 스와이프 처리
  const handleSwipe = (direction: 'left' | 'right' | 'super') => {
    if (dailySwipesLeft <= 0) {
      toast.error('오늘의 스와이프를 모두 사용했습니다!');
      return;
    }

    if (direction === 'right') {
      handleApply();
    } else if (direction === 'super') {
      toast.success('슈퍼라이크를 보냈습니다! ⭐');
    } else {
      toast('다음 캠페인으로 넘어갑니다');
    }

    setDailySwipesLeft(prev => prev - 1);

    // 다음 캠페인으로
    setTimeout(() => {
      if (currentIndex < campaigns.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast('더 이상 캠페인이 없습니다. 나중에 다시 확인해주세요!');
      }
    }, 300);
  };

  // 지원하기 처리
  const handleApply = () => {
    toast.success('캠페인에 지원했습니다! 곧 연락드릴게요.');
  };

  if (!currentCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">캠페인 준비중</h2>
          <p className="text-gray-600">곧 새로운 캠페인이 업데이트됩니다!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-4">
        <button onClick={() => router.back()} className="p-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-white rounded-full shadow-sm">
            <span className="text-sm font-medium">
              오늘 {dailySwipesLeft}/10
            </span>
          </div>
          <button className="p-2">
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 메인 카드 영역 - 화면 중앙에 더 크게 */}
      <div className="px-4 pb-32">
        <div className="max-w-md mx-auto">
          <AnimatePresence>
            <motion.div
              ref={cardRef}
              key={currentCampaign.id}
              style={{ y }}
              drag="y"
              dragConstraints={{ top: -100, bottom: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y < -50) {
                  setShowDetails(true);
                }
              }}
              className="relative bg-white rounded-3xl shadow-xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* 캠페인 이미지 - 더 크게 */}
              <div className="relative h-[400px]">
                <img
                  src={currentCampaign.image || 'https://via.placeholder.com/400'}
                  alt={currentCampaign.title}
                  className="w-full h-full object-cover"
                />
                
                {/* 상단 배지 */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="flex flex-wrap gap-2 max-w-[60%]">
                    {currentCampaign.isVIP && (
                      <span className="px-3 py-1.5 bg-black/70 text-yellow-400 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur">
                        <Crown className="w-3 h-3" />
                        VIP
                      </span>
                    )}
                    {currentCampaign.urgency === 'high' && (
                      <span className="px-3 py-1.5 bg-red-500/90 text-white rounded-full text-xs font-bold backdrop-blur animate-pulse">
                        긴급
                      </span>
                    )}
                    <span className="px-3 py-1.5 bg-purple-600/90 text-white rounded-full text-xs font-bold backdrop-blur">
                      {currentCampaign.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/95 rounded-full backdrop-blur shadow-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-black text-green-600">
                      {currentCampaign.matchScore}%
                    </span>
                  </div>
                </div>

                {/* 하단 그라데이션 - 더 진하게 */}
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* 브랜드 정보 - 이미지 하단에 */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={currentCampaign.brandLogo || 'https://via.placeholder.com/50'}
                      alt={currentCampaign.brand}
                      className="w-14 h-14 rounded-full object-cover border-3 border-white"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-black text-2xl">{currentCampaign.brand}</h3>
                      <p className="text-white/90 font-medium">{currentCampaign.title}</p>
                    </div>
                  </div>

                  {/* 실시간 정보 */}
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">{currentCampaign.viewingNow}명 보는중</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{currentCampaign.applicants}명 지원</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 캠페인 핵심 정보 - 더 명확하게 */}
              <div className="p-6">
                {/* 예산과 마감일 - 크고 명확하게 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">예산</span>
                    </div>
                    <p className="text-xl font-black text-gray-900">{formatCurrency(currentCampaign.budget)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">마감</span>
                    </div>
                    <p className="text-xl font-black text-gray-900">{currentCampaign.deadline}</p>
                  </div>
                </div>

                {/* 주요 요구사항 - 한눈에 보이게 */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">필수 요구사항</p>
                  <div className="space-y-1.5">
                    {currentCampaign.requirements.slice(0, 3).map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 추가 혜택 */}
                {currentCampaign.perks && currentCampaign.perks.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl">
                    <Gift className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">
                      {currentCampaign.perks.join(' • ')}
                    </span>
                  </div>
                )}

                {/* 위로 스와이프 안내 */}
                <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
                  <ChevronUp className="w-4 h-4 animate-bounce" />
                  <span className="text-xs">위로 스와이프하여 상세정보 보기</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 액션 버튼 - 3개로 줄이고 하단 고정, 엄지 손가락 영역 최적화 */}
      <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pb-6 pt-4">
        <div className="flex justify-center items-center gap-6 px-8">
          {/* 패스 버튼 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform border-2 border-gray-100"
          >
            <X className="w-7 h-7 text-gray-500" />
          </motion.button>
          
          {/* 슈퍼라이크 버튼 - 중앙 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('super')}
            className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Star className="w-9 h-9 text-white" fill="white" />
          </motion.button>
          
          {/* 지원하기 버튼 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Heart className="w-7 h-7 text-white" fill="white" />
          </motion.button>
        </div>

        {/* 버튼 레이블 */}
        <div className="flex justify-center items-center gap-6 px-8 mt-2">
          <span className="text-xs text-gray-500 w-16 text-center">패스</span>
          <span className="text-xs text-gray-500 w-20 text-center font-bold">슈퍼라이크</span>
          <span className="text-xs text-gray-500 w-16 text-center">지원</span>
        </div>
      </div>

      {/* 상세 모달 - 위로 스와이프 시 */}
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
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-h-[90vh] rounded-t-3xl overflow-hidden flex flex-col"
            >
              {/* 헤더 */}
              <div className="sticky top-0 bg-white border-b px-4 py-3 z-10">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">캠페인 상세정보</h3>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-6">
                  {/* 브랜드 정보 */}
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <img 
                      src={currentCampaign.brandLogo || 'https://via.placeholder.com/60'} 
                      alt={currentCampaign.brand}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-black text-xl">{currentCampaign.brand}</h4>
                      <p className="text-gray-600">{currentCampaign.title}</p>
                    </div>
                  </div>

                  {/* 캠페인 소개 */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      캠페인 소개
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {currentCampaign.description || '이 브랜드와 함께 특별한 콘텐츠를 만들어보세요.'}
                    </p>
                  </div>

                  {/* 상세 정보 그리드 */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">상세 정보</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">예산</p>
                        <p className="font-bold">{formatCurrency(currentCampaign.budget)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">마감일</p>
                        <p className="font-bold">{currentCampaign.deadline}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">지역</p>
                        <p className="font-bold">{currentCampaign.location}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">최소 팔로워</p>
                        <p className="font-bold">{currentCampaign.minFollowers?.toLocaleString()}명</p>
                      </div>
                    </div>
                  </div>

                  {/* 요구사항 */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      요구사항
                    </h4>
                    <div className="space-y-2">
                      {currentCampaign.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-gray-600">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 제작물 */}
                  {currentCampaign.deliverables && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">제작 콘텐츠</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentCampaign.deliverables.map((item, idx) => (
                          <span key={idx} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 타겟 오디언스 */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      타겟 오디언스
                    </h4>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-blue-600 mb-1">연령대</p>
                          <p className="font-bold">{currentCampaign.targetAge || '20-35세'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 mb-1">성별</p>
                          <p className="font-bold">{currentCampaign.targetGender || '여성 70%'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 mb-1">지역</p>
                          <p className="font-bold">{currentCampaign.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 mb-1">카테고리</p>
                          <p className="font-bold">{currentCampaign.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 추가 혜택 */}
                  {currentCampaign.perks && currentCampaign.perks.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        추가 혜택
                      </h4>
                      <div className="space-y-2">
                        {currentCampaign.perks.map((perk, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-700">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="sticky bottom-0 bg-white border-t p-4">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    닫기
                  </button>
                  <button 
                    onClick={() => {
                      handleApply();
                      setShowDetails(false);
                    }}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:opacity-90 transition-opacity"
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