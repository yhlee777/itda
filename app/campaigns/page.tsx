'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// 가짜 캠페인 데이터
const mockCampaigns = [
  {
    id: 1,
    brand: '나이키',
    title: '러닝화 신제품 홍보',
    budget: '300만원',
    category: '운동',
    description: '새로운 에어맥스 런칭 캠페인',
    image: '👟'
  },
  {
    id: 2,
    brand: '올리브영',
    title: '여름 선크림 리뷰',
    budget: '150만원',
    category: '뷰티',
    description: '신제품 선크림 체험 후기',
    image: '☀️'
  },
  {
    id: 3,
    brand: '스타벅스',
    title: '신메뉴 카페 브이로그',
    budget: '200만원',
    category: '음식',
    description: '여름 시즌 신메뉴 소개',
    image: '☕'
  }
];

export default function CampaignsPage() {
  const [userType, setUserType] = useState<'influencer' | 'brand'>('influencer');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCampaigns, setLikedCampaigns] = useState<number[]>([]);
  
  useEffect(() => {
    const type = localStorage.getItem('userType') as 'influencer' | 'brand';
    if (type) setUserType(type);
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setLikedCampaigns([...likedCampaigns, mockCampaigns[currentIndex].id]);
    }
    
    if (currentIndex < mockCampaigns.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentCampaign = mockCampaigns[currentIndex];

  return (
    <main className="min-h-screen bg-black">
      {/* 네비게이션 */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/50 border-b border-white/10">
        <div className="flex justify-between items-center px-8 py-6">
          <Link href="/">
            <h1 className="text-xl font-light text-white">itda</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm">
              매칭: {likedCampaigns.length}
            </span>
            <button className="text-white/60 hover:text-white transition">
              프로필
            </button>
          </div>
        </div>
      </nav>

      {/* 인플루언서 뷰 - 스와이프 */}
      {userType === 'influencer' && (
        <div className="h-screen flex items-center justify-center px-8 pt-20">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {currentIndex < mockCampaigns.length ? (
                <motion.div
                  key={currentCampaign.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  drag="x"
                  dragConstraints={{ left: -100, right: 100 }}
                  onDragEnd={(e, { offset }) => {
                    if (offset.x > 100) handleSwipe('right');
                    if (offset.x < -100) handleSwipe('left');
                  }}
                  className="bg-white rounded-2xl p-6 shadow-2xl cursor-grab active:cursor-grabbing"
                  style={{
                    height: '500px'
                  }}
                >
                  {/* 브랜드 정보 */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-medium">{currentCampaign.brand}</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                      {currentCampaign.category}
                    </span>
                  </div>
                  
                  {/* 이미지 영역 */}
                  <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-6xl">{currentCampaign.image}</span>
                  </div>
                  
                  {/* 캠페인 정보 */}
                  <h4 className="text-lg font-medium mb-2">{currentCampaign.title}</h4>
                  <p className="text-gray-600 mb-4">{currentCampaign.description}</p>
                  
                  {/* 예산 */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-gray-500">예산</span>
                    <span className="text-xl font-medium text-purple-600">
                      {currentCampaign.budget}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-white">
                  <p className="text-2xl mb-4">모든 캠페인을 확인했어요!</p>
                  <p className="text-white/60">새로운 캠페인이 올라오면 알려드릴게요</p>
                </div>
              )}
            </AnimatePresence>
            
            {/* 스와이프 버튼 */}
            {currentIndex < mockCampaigns.length && (
              <div className="flex justify-center gap-8 mt-8">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSwipe('left')}
                  className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl hover:bg-red-500/20 transition"
                >
                  ❌
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSwipe('right')}
                  className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl hover:bg-green-500/20 transition"
                >
                  ❤️
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 브랜드 뷰 - 캠페인 관리 */}
      {userType === 'brand' && (
        <div className="pt-32 px-8 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl text-white font-light">내 캠페인</h2>
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                + 새 캠페인
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {mockCampaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-5xl">{campaign.image}</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      진행중
                    </span>
                  </div>
                  <h3 className="text-white text-lg mb-2">{campaign.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{campaign.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">지원자</span>
                    <span className="text-white">23명</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}