// components/influencer/SwipeCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Calendar, TrendingUp, MapPin, Camera, 
  Clock, Users, Heart, X, Star, Award, CheckCircle,
  ChevronUp, Instagram, Youtube, FileText, Video,
  Image, Film, MessageCircle, Info
} from 'lucide-react';

interface Campaign {
  id: string;
  brand: string;
  brandLogo?: string;
  title: string;
  budget: string;
  category: string;
  image: string;
  requirements: string[];
  duration: string;
  engagement_rate?: string;
  description?: string;
  deadline?: string;
  location?: string;
  deliverables?: string[];
  matchScore?: number;
  brandVerified?: boolean;
  urgency?: 'high' | 'medium' | 'low';
  isPremium?: boolean;
  applicants?: number;
  viewingNow?: number;
  matchBonus?: number;
}

interface SwipeCardProps {
  campaign: Campaign;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onCardClick?: () => void;
  active: boolean;
}

export default function SwipeCard({ 
  campaign, 
  onSwipeLeft, 
  onSwipeRight,
  onCardClick,
  active 
}: SwipeCardProps) {
  const motionValue = useMotionValue(0);
  const yMotionValue = useMotionValue(0);
  const rotateValue = useTransform(motionValue, [-200, 200], [-15, 15]);
  const opacityValue = useTransform(
    motionValue,
    [-200, -150, 0, 150, 200],
    [0.5, 1, 1, 1, 0.5]
  );
  const scaleValue = useTransform(
    motionValue,
    [-200, 0, 200],
    [0.95, 1, 0.95]
  );

  const [isDragging, setIsDragging] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // motionValue 리셋
  useEffect(() => {
    motionValue.set(0);
    yMotionValue.set(0);
    setShowDetails(false);
  }, [campaign.id, motionValue, yMotionValue]);

  // 아이콘 매핑 함수
  const getDeliverableIcon = (deliverable: string) => {
    const lower = deliverable.toLowerCase();
    if (lower.includes('피드') || lower.includes('feed')) return { icon: Image, count: deliverable.match(/\d+/)?.[0] || '1', label: '피드' };
    if (lower.includes('릴스') || lower.includes('reel')) return { icon: Film, count: deliverable.match(/\d+/)?.[0] || '1', label: '릴스' };
    if (lower.includes('스토리') || lower.includes('story')) return { icon: MessageCircle, count: deliverable.match(/\d+/)?.[0] || '1', label: '스토리' };
    if (lower.includes('영상') || lower.includes('유튜브') || lower.includes('youtube')) return { icon: Youtube, count: deliverable.match(/\d+/)?.[0] || '1', label: '영상' };
    if (lower.includes('블로그') || lower.includes('포스팅')) return { icon: FileText, count: deliverable.match(/\d+/)?.[0] || '1', label: '포스팅' };
    if (lower.includes('쇼츠') || lower.includes('shorts')) return { icon: Video, count: deliverable.match(/\d+/)?.[0] || '1', label: '쇼츠' };
    return { icon: Camera, count: '1', label: '콘텐츠' };
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const swipeThreshold = 100;
    const swipeUpThreshold = -100;
    
    // 위로 스와이프 - 상세보기
    if (info.offset.y < swipeUpThreshold && Math.abs(info.offset.x) < 50) {
      setShowDetails(true);
      yMotionValue.set(0);
      return;
    }
    
    // 좌우 스와이프
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    } else {
      motionValue.set(0);
      yMotionValue.set(0);
    }
  };

  // 매칭 점수 색상
  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-200 text-gray-700';
    if (score >= 90) return 'bg-green-100 text-green-700';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  // 긴급도 색상
  const getUrgencyColor = (urgency?: string) => {
    switch(urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  if (!active) return null;

  // 아이콘화된 deliverables
  const iconifiedDeliverables = campaign.deliverables?.map(d => getDeliverableIcon(d)) || [];

  return (
    <>
      <motion.div
        className="absolute w-full cursor-grab active:cursor-grabbing"
        style={{
          x: motionValue,
          y: yMotionValue,
          rotate: rotateValue,
          opacity: opacityValue,
          scale: scaleValue
        }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        dragElastic={0.2}
        whileTap={{ cursor: 'grabbing' }}
      >
        <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden ${
          campaign.isPremium ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
        }`}>
          {/* 프리미엄 캠페인 헤더 */}
          {campaign.isPremium && (
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-1.5">
              <div className="flex items-center justify-center gap-1.5 text-white">
                <Star className="w-3 h-3 fill-white" />
                <span className="text-xs font-bold">PREMIUM</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
            </div>
          )}

          {/* 이미지 섹션 */}
          <div className="relative h-64">
            <img
              src={campaign.image}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* 스와이프 업 힌트 */}
            {!showDetails && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-3 left-1/2 transform -translate-x-1/2"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1"
                >
                  <ChevronUp className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-700 font-medium">자세히</span>
                </motion.div>
              </motion.div>
            )}

            {/* 상단 배지들 */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              {/* 프리미엄 보너스 */}
              {campaign.isPremium && campaign.matchBonus && (
                <div className="px-2.5 py-1 rounded-full backdrop-blur-sm bg-yellow-100 text-yellow-800 flex items-center gap-1 text-xs font-bold">
                  <DollarSign className="w-3 h-3" />
                  <span>+{campaign.matchBonus}</span>
                </div>
              )}
              
              {/* 긴급도 */}
              {campaign.urgency && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/90">
                  <div className={`w-1.5 h-1.5 rounded-full ${getUrgencyColor(campaign.urgency)} animate-pulse`} />
                  <span className="text-xs font-medium text-gray-700">
                    {campaign.urgency === 'high' ? '긴급' : campaign.urgency === 'medium' ? '보통' : '여유'}
                  </span>
                </div>
              )}
            </div>
            
            {/* 브랜드 정보 오버레이 */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30">
                  <span className="text-lg font-bold">{campaign.brand[0]}</span>
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-1.5">
                    {campaign.brand}
                    {campaign.brandVerified && <Award className="w-3 h-3 text-yellow-400" />}
                  </h3>
                  <p className="text-xs text-white/90">{campaign.category}</p>
                </div>
              </div>
              <h2 className="text-xl font-bold leading-tight">{campaign.title}</h2>
            </div>

            {/* 스와이프 인디케이터 */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 right-6"
              style={{
                opacity: useTransform(motionValue, [0, 100], [0, 1]),
                scale: useTransform(motionValue, [0, 100], [0.8, 1])
              }}
            >
              <div className="px-5 py-2.5 rounded-full bg-green-500 text-white font-bold text-base shadow-lg flex items-center gap-1.5">
                <Heart className="w-5 h-5 fill-white" />
                <span>LIKE</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 left-6"
              style={{
                opacity: useTransform(motionValue, [0, -100], [0, 1]),
                scale: useTransform(motionValue, [0, -100], [0.8, 1])
              }}
            >
              <div className="px-5 py-2.5 rounded-full bg-red-500 text-white font-bold text-base shadow-lg flex items-center gap-1.5">
                <X className="w-5 h-5" />
                <span>PASS</span>
              </div>
            </motion.div>
          </div>

          {/* 간소화된 콘텐츠 섹션 */}
          <div className="p-4 space-y-3">
            {/* 실시간 경쟁 정보 (프리미엄) */}
            {campaign.isPremium && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2.5 border border-purple-200">
                <div className="flex items-center justify-around text-xs">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-medium text-purple-900">{campaign.applicants}명 지원</span>
                  </div>
                  <div className="w-px h-3 bg-purple-300" />
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium text-gray-700">{campaign.viewingNow}명 보는중</span>
                  </div>
                </div>
              </div>
            )}

            {/* 핵심 정보 3개 - 한 줄로 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <DollarSign className="w-4 h-4 text-green-600 mx-auto mb-0.5" />
                <p className="text-xs font-bold text-gray-900">{campaign.budget.split('-')[0]}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <Calendar className="w-4 h-4 text-blue-600 mx-auto mb-0.5" />
                <p className="text-xs font-bold text-gray-900">{campaign.duration}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <MapPin className="w-4 h-4 text-purple-600 mx-auto mb-0.5" />
                <p className="text-xs font-bold text-gray-900">{campaign.location || '전국'}</p>
              </div>
            </div>

            {/* 콘텐츠 요구사항 - 아이콘으로 표시 */}
            {iconifiedDeliverables.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">콘텐츠</span>
                  <div className="flex items-center gap-2">
                    {iconifiedDeliverables.map((item, idx) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={idx} className="flex items-center gap-0.5 bg-purple-50 px-2 py-1 rounded-full">
                          <IconComponent className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-xs font-bold text-purple-700">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 마감일 강조 */}
            {campaign.deadline && (
              <div className={`text-center py-2 rounded-lg ${
                campaign.isPremium ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-center gap-1.5">
                  <Clock className={`w-3.5 h-3.5 ${campaign.isPremium ? 'text-red-500' : 'text-gray-500'}`} />
                  <span className={`text-xs font-bold ${campaign.isPremium ? 'text-red-600' : 'text-gray-700'}`}>
                    {campaign.deadline}
                  </span>
                </div>
              </div>
            )}

            {/* 프리미엄 CTA */}
            {campaign.isPremium && (
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg py-2 text-center"
              >
                <p className="text-xs font-bold">🔥 지금 지원하면 매칭률 2배!</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 상세 정보 바텀시트 */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 핸들 바 */}
              <div className="sticky top-0 bg-white z-10 px-4 py-3">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">상세 정보</h3>
                  <button onClick={() => setShowDetails(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-20 space-y-4">
                {/* 브랜드 정보 */}
                <div className="flex items-center gap-3 py-3 border-b">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-600">{campaign.brand[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      {campaign.brand}
                      {campaign.brandVerified && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">인증됨</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{campaign.title}</p>
                  </div>
                </div>

                {/* 캠페인 설명 */}
                {campaign.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">캠페인 소개</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>
                )}

                {/* 예산 및 기간 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">조건</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-gray-600">예산</span>
                      </div>
                      <p className="font-bold text-gray-900">{campaign.budget}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-600">기간</span>
                      </div>
                      <p className="font-bold text-gray-900">{campaign.duration}</p>
                    </div>
                  </div>
                </div>

                {/* 요구사항 */}
                {campaign.requirements && campaign.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">요구사항</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.requirements.map((req, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 콘텐츠 요구사항 상세 */}
                {campaign.deliverables && campaign.deliverables.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">콘텐츠 요구사항</h4>
                    <div className="space-y-2">
                      {campaign.deliverables.map((item, idx) => {
                        const iconData = getDeliverableIcon(item);
                        const IconComponent = iconData.icon;
                        return (
                          <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-700 flex-1">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 위치 & 마감일 */}
                <div className="grid grid-cols-2 gap-3">
                  {campaign.location && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">위치</p>
                        <p className="text-sm font-semibold text-gray-900">{campaign.location}</p>
                      </div>
                    </div>
                  )}
                  {campaign.deadline && (
                    <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500">마감</p>
                        <p className="text-sm font-semibold text-orange-600">{campaign.deadline}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      onSwipeLeft();
                    }}
                    className="py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    건너뛰기
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      onSwipeRight();
                    }}
                    className="py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    지원하기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}