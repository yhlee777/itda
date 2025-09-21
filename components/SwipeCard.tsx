// components/SwipeCard.tsx
'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';

interface Campaign {
  id: string;
  brand: string;
  title: string;
  budget: string;
  category: string;
  image: string;
  requirements: string[];
  duration: string;
  engagement_rate?: string;
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
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      setExitX(300);
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      setExitX(-300);
      onSwipeLeft();
    } else {
      // 원위치로 되돌리기
      controls.start({ x: 0, rotate: 0 });
    }
  };

  // 스와이프 힌트 애니메이션
  const leftIndicatorOpacity = useTransform(x, [-100, 0, 100], [0, 0, 1]);
  const rightIndicatorOpacity = useTransform(x, [-100, 0, 100], [1, 0, 0]);

  return (
    <motion.div
      ref={cardRef}
      className={`absolute w-full h-full ${active ? 'z-10' : 'z-0'}`}
      style={{ x, rotate, opacity }}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.3 } }}
      whileTap={{ scale: active ? 1.02 : 1 }}
      onClick={onCardClick}
    >
      <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* 배경 이미지 */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"
          style={{
            backgroundImage: `url(${campaign.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* 스와이프 인디케이터 */}
        <motion.div 
          className="absolute top-10 right-10 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl rotate-12 shadow-lg"
          style={{ opacity: leftIndicatorOpacity }}
        >
          LIKE 💚
        </motion.div>
        
        <motion.div 
          className="absolute top-10 left-10 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl -rotate-12 shadow-lg"
          style={{ opacity: rightIndicatorOpacity }}
        >
          NOPE ❌
        </motion.div>

        {/* 콘텐츠 */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          {/* 브랜드 배지 */}
          <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium">{campaign.brand}</span>
            <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-1 rounded-full">
              {campaign.category}
            </span>
          </div>
          
          {/* 캠페인 정보 */}
          <h2 className="text-3xl font-bold mb-3">{campaign.title}</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-bold text-lg">{campaign.budget}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span className="text-sm">{campaign.duration}</span>
            </div>
            {campaign.engagement_rate && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span className="text-sm">{campaign.engagement_rate}% 참여율</span>
              </div>
            )}
          </div>

          {/* 요구사항 태그 */}
          <div className="flex flex-wrap gap-2">
            {campaign.requirements.map((req, index) => (
              <span 
                key={index}
                className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm"
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// components/SwipeContainer.tsx
export function SwipeContainer() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      brand: '나이키',
      title: '에어맥스 신제품 런칭',
      budget: '300-500만원',
      category: '패션',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      requirements: ['스포츠/피트니스', '20-30대', '10만+ 팔로워'],
      duration: '2주',
      engagement_rate: '4.5'
    },
    {
      id: '2',
      brand: '스타벅스',
      title: '여름 시즌 음료 프로모션',
      budget: '100-200만원',
      category: 'F&B',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
      requirements: ['카페/디저트', '릴스 제작', '서울 거주'],
      duration: '1주',
      engagement_rate: '3.8'
    },
    {
      id: '3',
      brand: '삼성전자',
      title: '갤럭시 Z플립5 체험단',
      budget: '500-800만원',
      category: '테크',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
      requirements: ['테크리뷰', '유튜브 채널', '상세리뷰'],
      duration: '1개월',
      engagement_rate: '5.2'
    }
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCampaigns, setLikedCampaigns] = useState<string[]>([]);

  const handleSwipeLeft = () => {
    // 관심없음 처리
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handleSwipeRight = () => {
    // 관심있음 처리
    setLikedCampaigns(prev => [...prev, campaigns[currentIndex].id]);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handleCardClick = () => {
    // 상세보기 모달 열기
    console.log('Campaign details:', campaigns[currentIndex]);
  };

  // 버튼으로 스와이프
  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handleSwipeLeft();
    } else {
      handleSwipeRight();
    }
  };

  return (
    <div className="relative h-[600px] w-full max-w-md mx-auto">
      {/* 카드 스택 */}
      <div className="relative h-full">
        {campaigns.map((campaign, index) => {
          if (index < currentIndex) return null; // 이미 스와이프된 카드
          
          return (
            <SwipeCard
              key={campaign.id}
              campaign={campaign}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onCardClick={handleCardClick}
              active={index === currentIndex}
            />
          );
        })}
        
        {/* 모든 카드를 스와이프했을 때 */}
        {currentIndex >= campaigns.length && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">모두 확인했어요!</h3>
            <p className="text-gray-600 mb-6">새로운 캠페인이 곧 추가됩니다</p>
            <button 
              onClick={() => setCurrentIndex(0)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold"
            >
              다시 보기
            </button>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      {currentIndex < campaigns.length && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 pb-8">
          <button
            onClick={() => handleButtonSwipe('left')}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <span className="text-3xl">❌</span>
          </button>
          
          <button
            onClick={() => handleButtonSwipe('right')}
            className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <span className="text-3xl">💚</span>
          </button>
          
          <button
            onClick={handleCardClick}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <span className="text-3xl">ℹ️</span>
          </button>
        </div>
      )}
    </div>
  );
}