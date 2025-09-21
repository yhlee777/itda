// components/influencer/SwipeCard.tsx
'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { DollarSign, Calendar, TrendingUp, MapPin, Camera } from 'lucide-react';

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
  const rotateValue = useTransform(motionValue, [-200, 200], [-25, 25]);
  const opacityValue = useTransform(
    motionValue,
    [-200, -150, 0, 150, 200],
    [0.5, 1, 1, 1, 0.5]
  );

  // motionValue 리셋 (카드가 바뀔 때)
  useEffect(() => {
    motionValue.set(0);
  }, [campaign.id, motionValue]);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100;
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    } else {
      // 원위치로
      motionValue.set(0);
    }
  };

  if (!active) return null;

  return (
    <motion.div
      className="absolute w-full max-w-md cursor-grab active:cursor-grabbing"
      style={{
        x: motionValue,
        rotate: rotateValue,
        opacity: opacityValue,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      dragElastic={0.2}
      whileTap={{ cursor: 'grabbing' }}
      onClick={(e) => {
        // 드래그 중이 아닐 때만 클릭 이벤트
        if (Math.abs(motionValue.get()) < 5) {
          onCardClick?.();
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* 이미지 섹션 */}
        <div className="relative h-80">
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* 브랜드 정보 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">{campaign.brand[0]}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">{campaign.brand}</h3>
                <p className="text-sm text-white/80">{campaign.category}</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold">{campaign.title}</h2>
          </div>

          {/* 스와이프 인디케이터 */}
          <motion.div
            className="absolute top-6 right-6"
            style={{
              opacity: useTransform(motionValue, [0, 100], [0, 1])
            }}
          >
            <div className="px-4 py-2 rounded-full bg-green-500 text-white font-bold text-lg">
              LIKE
            </div>
          </motion.div>

          <motion.div
            className="absolute top-6 left-6"
            style={{
              opacity: useTransform(motionValue, [0, -100], [0, 1])
            }}
          >
            <div className="px-4 py-2 rounded-full bg-red-500 text-white font-bold text-lg">
              PASS
            </div>
          </motion.div>
        </div>

        {/* 콘텐츠 섹션 - 여기가 중요! */}
        <div className="p-6 space-y-4">
          {/* 예산 및 기간 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="text-green-600" size={20} />
              <span className="font-bold text-lg text-gray-900">{campaign.budget}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={18} />
              <span className="text-sm">{campaign.duration}</span>
            </div>
          </div>

          {/* 설명 - NULL 체크 추가 */}
          {campaign.description && (
            <div>
              <p className="text-gray-700 leading-relaxed">
                {campaign.description}
              </p>
            </div>
          )}

          {/* 요구사항 */}
          {campaign.requirements && campaign.requirements.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">요구사항</h3>
              <div className="flex flex-wrap gap-2">
                {campaign.requirements.map((req, idx) => (
                  <span 
                    key={`${campaign.id}-req-${idx}`} 
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 콘텐츠 요구사항 */}
          {campaign.deliverables && campaign.deliverables.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Camera size={18} />
                콘텐츠 요구사항
              </h3>
              <ul className="space-y-1">
                {campaign.deliverables.map((item, idx) => (
                  <li key={`${campaign.id}-del-${idx}`} className="text-sm text-gray-600 flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 하단 정보 */}
          <div className="flex items-center justify-between pt-3 border-t">
            {campaign.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span className="text-sm">{campaign.location}</span>
              </div>
            )}
            {campaign.engagement_rate && (
              <div className="flex items-center gap-1 text-purple-600 font-semibold">
                <TrendingUp size={16} />
                <span className="text-sm">최소 {campaign.engagement_rate}%</span>
              </div>
            )}
          </div>

          {/* 마감일 */}
          {campaign.deadline && (
            <div className="text-center pt-2">
              <span className="text-xs text-gray-500">마감: {campaign.deadline}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}