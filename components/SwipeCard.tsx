import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, DollarSign, Calendar, Users, TrendingUp, MapPin, Camera, Star, ChevronLeft, Info, Sparkles, Award, Clock, Target } from 'lucide-react';

// 캠페인 타입
interface Campaign {
  id: string;
  brand: string;
  brandLogo: string;
  title: string;
  budget: string;
  category: string;
  image: string;
  requirements: string[];
  duration: string;
  engagement_rate: string;
  description: string;
  deadline: string;
  location: string;
  deliverables: string[];
  matchScore: number;
  urgency: 'high' | 'medium' | 'low';
}

// 샘플 캠페인 데이터
const sampleCampaigns: Campaign[] = [
  {
    id: '1',
    brand: '나이키',
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    title: '에어맥스 2024 신제품 런칭',
    budget: '300-500만원',
    category: '패션',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    requirements: ['스포츠/피트니스', '20-30대', '10만+ 팔로워'],
    duration: '2주',
    engagement_rate: '4.5',
    description: '새로운 에어맥스 런칭을 위한 인플루언서를 찾습니다. 스포츠와 패션을 사랑하는 분들의 많은 지원 바랍니다.',
    deadline: '2024.02.15',
    location: '서울',
    deliverables: ['인스타 피드 3개', '릴스 2개', '스토리 5개'],
    matchScore: 92,
    urgency: 'high'
  },
  {
    id: '2',
    brand: '스타벅스',
    brandLogo: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg',
    title: '여름 시즌 신메뉴 프로모션',
    budget: '100-200만원',
    category: 'F&B',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    requirements: ['카페/디저트', '릴스 제작', '서울 거주'],
    duration: '1주',
    engagement_rate: '3.8',
    description: '새로운 여름 음료 라인업을 소개해주실 인플루언서를 모집합니다.',
    deadline: '2024.02.10',
    location: '전국',
    deliverables: ['릴스 1개', '스토리 3개'],
    matchScore: 85,
    urgency: 'medium'
  },
  {
    id: '3',
    brand: '삼성전자',
    brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    title: '갤럭시 Z플립5 체험단',
    budget: '500-800만원',
    category: '테크',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    requirements: ['테크리뷰', '유튜브 채널', '상세리뷰'],
    duration: '1개월',
    engagement_rate: '5.2',
    description: '갤럭시 Z플립5를 직접 체험하고 리뷰 콘텐츠를 제작해주실 인플루언서를 찾습니다.',
    deadline: '2024.02.20',
    location: '전국',
    deliverables: ['유튜브 영상 1개', '인스타 피드 2개', '블로그 포스팅 1개'],
    matchScore: 78,
    urgency: 'low'
  }
];

export default function EnhancedSwipeUI() {
  const [campaigns] = useState<Campaign[]>(sampleCampaigns);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCampaigns, setLikedCampaigns] = useState<string[]>([]);
  const [rejectedCampaigns, setRejectedCampaigns] = useState<string[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const currentCampaign = campaigns[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentCampaign) return;

    if (direction === 'right') {
      setLikedCampaigns([...likedCampaigns, currentCampaign.id]);
      addNotification(`${currentCampaign.brand}에 지원 완료! 🎉`);
    } else {
      setRejectedCampaigns([...rejectedCampaigns, currentCampaign.id]);
    }

    if (currentIndex < campaigns.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    x.set(0);
  };

  const addNotification = (message: string) => {
    setNotifications([...notifications, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      handleSwipe(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  // 진행 상황
  const progress = ((currentIndex + 1) / campaigns.length) * 100;

  if (!currentCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-6">🎊</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">모든 캠페인 확인 완료!</h2>
          <p className="text-gray-600 mb-8">총 {likedCampaigns.length}개의 캠페인에 지원했어요</p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setLikedCampaigns([]);
              setRejectedCampaigns([]);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            처음부터 다시 보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ITDA
            </h1>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-purple-700">
                  💜 {likedCampaigns.length}
                </span>
              </div>
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {currentIndex + 1}
                </div>
              </div>
            </div>
          </div>
          {/* 진행 바 */}
          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* 메인 카드 영역 */}
      <div className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCampaign.id}
            className="relative"
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* 스와이프 인디케이터 */}
            <motion.div
              className="absolute -top-10 left-1/2 -translate-x-1/2"
              style={{
                opacity: useTransform(x, [-100, 0, 100], [0, 0, 1])
              }}
            >
              <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Heart size={20} fill="white" />
                <span className="font-semibold">지원하기</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -top-10 left-1/2 -translate-x-1/2"
              style={{
                opacity: useTransform(x, [-100, 0, 100], [1, 0, 0])
              }}
            >
              <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <X size={20} />
                <span className="font-semibold">건너뛰기</span>
              </div>
            </motion.div>

            {/* 카드 */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* 이미지 영역 */}
              <div className="relative h-96">
                <img
                  src={currentCampaign.image}
                  alt={currentCampaign.title}
                  className="w-full h-full object-cover"
                />
                
                {/* 오버레이 정보 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* 매치 스코어 */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-full px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500" size={18} fill="currentColor" />
                    <span className="font-bold text-gray-900">{currentCampaign.matchScore}% 매치</span>
                  </div>
                </div>

                {/* 긴급도 표시 */}
                {currentCampaign.urgency === 'high' && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold shadow-lg animate-pulse">
                    🔥 긴급모집
                  </div>
                )}

                {/* 하단 정보 */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white rounded-full p-2 shadow-lg">
                      <img src={currentCampaign.brandLogo} alt={currentCampaign.brand} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-white/90 text-sm font-medium">{currentCampaign.brand}</div>
                      <h2 className="text-white text-xl font-bold">{currentCampaign.title}</h2>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {currentCampaign.requirements.slice(0, 3).map((req, idx) => (
                      <span
                        key={idx}
                        className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="p-6 space-y-4">
                {/* 주요 정보 그리드 */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <DollarSign className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                    <div className="text-xs text-gray-600">예산</div>
                    <div className="font-bold text-sm">{currentCampaign.budget}</div>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-xl">
                    <Calendar className="w-5 h-5 mx-auto text-pink-600 mb-1" />
                    <div className="text-xs text-gray-600">기간</div>
                    <div className="font-bold text-sm">{currentCampaign.duration}</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <Clock className="w-5 h-5 mx-auto text-orange-600 mb-1" />
                    <div className="text-xs text-gray-600">마감</div>
                    <div className="font-bold text-sm">{currentCampaign.deadline}</div>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-gray-700 text-sm leading-relaxed">
                  {currentCampaign.description}
                </p>

                {/* 상세보기 버튼 */}
                <button
                  onClick={() => setShowDetail(true)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <Info size={18} />
                  상세 정보 보기
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 액션 버튼 */}
        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform group"
          >
            <X className="text-red-500 group-hover:scale-110 transition-transform" size={28} />
          </button>
          <button
            onClick={() => setShowDetail(true)}
            className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform group"
          >
            <Info className="text-blue-500 group-hover:scale-110 transition-transform" size={28} />
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform group"
          >
            <Heart className="text-white group-hover:scale-110 transition-transform" size={28} fill="white" />
          </button>
        </div>
      </div>

      {/* 상세 모달 */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">캠페인 상세 정보</h3>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* 브랜드 정보 */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full p-3">
                    <img src={currentCampaign.brandLogo} alt={currentCampaign.brand} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{currentCampaign.brand}</h4>
                    <p className="text-gray-600">{currentCampaign.category}</p>
                  </div>
                </div>

                {/* 캠페인 제목 */}
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2">캠페인</h5>
                  <p className="font-bold text-xl">{currentCampaign.title}</p>
                </div>

                {/* 상세 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <DollarSign size={18} />
                      <span className="text-sm">예산</span>
                    </div>
                    <p className="font-bold">{currentCampaign.budget}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar size={18} />
                      <span className="text-sm">캠페인 기간</span>
                    </div>
                    <p className="font-bold">{currentCampaign.duration}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin size={18} />
                      <span className="text-sm">활동 지역</span>
                    </div>
                    <p className="font-bold">{currentCampaign.location}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <TrendingUp size={18} />
                      <span className="text-sm">요구 참여율</span>
                    </div>
                    <p className="font-bold">{currentCampaign.engagement_rate}% 이상</p>
                  </div>
                </div>

                {/* 요구사항 */}
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-3">요구사항</h5>
                  <div className="space-y-2">
                    {currentCampaign.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                        <span className="text-gray-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 제작물 */}
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-3">제작 콘텐츠</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {currentCampaign.deliverables.map((item, idx) => (
                      <div key={idx} className="bg-purple-50 px-3 py-2 rounded-lg text-sm text-purple-700 font-medium">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleSwipe('left');
                      setShowDetail(false);
                    }}
                    className="py-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-all"
                  >
                    건너뛰기
                  </button>
                  <button
                    onClick={() => {
                      handleSwipe('right');
                      setShowDetail(false);
                    }}
                    className="py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    지원하기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 알림 */}
      <AnimatePresence>
        {notifications.map((notification, idx) => (
          <motion.div
            key={`${notification}-${idx}`}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2"
          >
            <Sparkles size={20} />
            <span className="font-semibold">{notification}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}