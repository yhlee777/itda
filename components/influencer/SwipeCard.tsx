// components/influencer/SwipeCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X, DollarSign, Calendar, Users, TrendingUp, MapPin, Camera } from 'lucide-react';

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
}

interface SwipeCardProps {
  campaigns: Campaign[];
  onSwipe: (campaignId: string, direction: 'left' | 'right') => void;
}

export default function SwipeCard({ campaigns, onSwipe }: SwipeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const motionValue = useMotionValue(0);
  const rotateValue = useTransform(motionValue, [-200, 200], [-50, 50]);
  const opacityValue = useTransform(
    motionValue,
    [-200, -150, 0, 150, 200],
    [0.5, 1, 1, 1, 0.5]
  );

  const currentCampaign = campaigns[currentIndex];

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100;
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      setExitDirection(direction);
      
      setTimeout(() => {
        onSwipe(currentCampaign.id, direction);
        setCurrentIndex((prev) => prev + 1);
        setExitDirection(null);
        motionValue.set(0);
      }, 200);
    } else {
      motionValue.set(0);
    }
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    setExitDirection(direction);
    
    setTimeout(() => {
      onSwipe(currentCampaign.id, direction);
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(null);
      motionValue.set(0);
    }, 200);
  };

  if (currentIndex >= campaigns.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          모든 캠페인을 확인했어요!
        </h2>
        <p className="text-gray-600">
          새로운 캠페인이 등록되면 알려드릴게요
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative h-[700px]">
        <AnimatePresence mode="wait">
          {currentCampaign && !exitDirection && (
            <motion.div
              key={currentCampaign.id}
              className="absolute w-full"
              drag="x"
              dragConstraints={{ left: -300, right: 300 }}
              onDragEnd={handleDragEnd}
              style={{
                x: motionValue,
                rotate: rotateValue,
                opacity: opacityValue,
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: exitDirection === 'right' ? 300 : -300,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.2 }
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              whileDrag={{ scale: 1.05 }}
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* 캠페인 이미지 */}
                <div className="relative h-80">
                  <img
                    src={currentCampaign.image}
                    alt={currentCampaign.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* 카테고리 태그 */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium">
                      {currentCampaign.category}
                    </span>
                  </div>

                  {/* 브랜드 정보 */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-sm font-medium opacity-90">{currentCampaign.brand}</p>
                    <h2 className="text-2xl font-bold mt-1">{currentCampaign.title}</h2>
                  </div>

                  {/* 스와이프 인디케이터 */}
                  <motion.div
                    className="absolute top-1/2 left-4 -translate-y-1/2"
                    style={{
                      opacity: useTransform(motionValue, [-200, -50], [1, 0])
                    }}
                  >
                    <div className="bg-red-500 text-white p-3 rounded-full shadow-lg">
                      <X size={32} />
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute top-1/2 right-4 -translate-y-1/2"
                    style={{
                      opacity: useTransform(motionValue, [50, 200], [0, 1])
                    }}
                  >
                    <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
                      <Heart size={32} />
                    </div>
                  </motion.div>
                </div>

                {/* 캠페인 상세 정보 */}
                <div className="p-6 space-y-4">
                  {/* 예산 및 기간 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-green-600" size={20} />
                      <span className="font-semibold text-lg">{currentCampaign.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={18} />
                      <span>{currentCampaign.duration}</span>
                    </div>
                  </div>

                  {/* 요구사항 */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">요구사항</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentCampaign.requirements.map((req, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 추가 정보 */}
                  {currentCampaign.deliverables && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Camera size={18} />
                        콘텐츠 요구사항
                      </h3>
                      <ul className="space-y-1">
                        {currentCampaign.deliverables.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 위치 정보 */}
                  {currentCampaign.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={18} />
                      <span className="text-sm">{currentCampaign.location}</span>
                    </div>
                  )}

                  {/* 참여율 */}
                  {currentCampaign.engagement_rate && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-gray-500">최소 참여율</span>
                      <div className="flex items-center gap-1 text-purple-600 font-semibold">
                        <TrendingUp size={18} />
                        {currentCampaign.engagement_rate}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 다음 카드 미리보기 (배경) */}
        {campaigns[currentIndex + 1] && (
          <div className="absolute w-full scale-95 opacity-50">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <img
                src={campaigns[currentIndex + 1].image}
                alt="Next"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-center gap-6 mt-8">
        <button
          onClick={() => handleButtonSwipe('left')}
          className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow group"
        >
          <X className="text-red-500 group-hover:scale-110 transition-transform" size={28} />
        </button>
        
        <button
          onClick={() => handleButtonSwipe('right')}
          className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow group"
        >
          <Heart className="text-green-500 group-hover:scale-110 transition-transform" size={28} />
        </button>
      </div>

      {/* 진행 상태 */}
      <div className="flex justify-center gap-1 mt-6">
        {campaigns.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-8 bg-purple-600'
                : idx < currentIndex
                ? 'w-1.5 bg-gray-400'
                : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}