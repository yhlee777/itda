// app/(influencer)/campaigns/page.tsx - 수정된 버전
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';  // ✅ 아이콘 import 추가
import SwipeCard from '@/components/influencer/SwipeCard';

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

export default function CampaignsPage() {
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      brand: '나이키',
      title: '에어맥스 2024 신제품 런칭',
      budget: '300-500만원',
      category: '패션',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      requirements: ['스포츠/피트니스', '20-30대', '10만+ 팔로워'],
      duration: '2주',
      engagement_rate: '4.5',
      description: '새로운 에어맥스 런칭을 위한 인플루언서를 찾습니다',
      deadline: '2024.02.15',
      location: '서울',
      deliverables: ['인스타 피드 3개', '릴스 2개', '스토리 5개']
    },
    {
      id: '2',
      brand: '스타벅스',
      title: '여름 시즌 신메뉴 프로모션',
      budget: '100-200만원',
      category: 'F&B',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
      requirements: ['카페/디저트', '릴스 제작', '서울 거주'],
      duration: '1주',
      engagement_rate: '3.8',
      description: '새로운 여름 음료 라인업을 소개해주실 인플루언서',
      deadline: '2024.02.10',
      location: '전국',
      deliverables: ['릴스 1개', '스토리 3개']
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
      engagement_rate: '5.2',
      description: '갤럭시 Z플립5 체험 및 리뷰 콘텐츠 제작',
      deadline: '2024.02.20',
      location: '전국',
      deliverables: ['유튜브 영상 1개', '인스타 피드 2개', '블로그 포스팅 1개']
    },
    {
      id: '4',
      brand: '아모레퍼시픽',
      title: '설화수 신제품 체험',
      budget: '200-300만원',
      category: '뷰티',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
      requirements: ['뷰티', '스킨케어', '30-40대'],
      duration: '3주',
      engagement_rate: '4.1',
      description: '프리미엄 한방 스킨케어 라인 체험 캠페인',
      deadline: '2024.02.25',
      location: '서울/경기',
      deliverables: ['인스타 피드 2개', '릴스 1개', '유튜브 쇼츠 1개']
    },
    {
      id: '5',
      brand: '배달의민족',
      title: '새벽배송 서비스 홍보',
      budget: '150-250만원',
      category: '라이프',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
      requirements: ['푸드', '일상', '2030세대'],
      duration: '2주',
      engagement_rate: '3.5',
      description: '배민 새벽배송 서비스 체험 및 리뷰',
      deadline: '2024.02.18',
      location: '서울',
      deliverables: ['릴스 2개', '스토리 하이라이트 1개']
    }
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCampaigns, setLikedCampaigns] = useState<string[]>([]);

  const handleSwipeLeft = () => {
    console.log('Passed:', campaigns[currentIndex]);
    console.log('Description:', campaigns[currentIndex].description);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeRight = () => {
    const campaign = campaigns[currentIndex];
    setLikedCampaigns(prev => [...prev, campaign.id]);
    console.log('Liked:', campaign);
    console.log('Description:', campaign.description);
    setCurrentIndex(prev => prev + 1);
  };

  const handleCardClick = () => {
    console.log('Campaign details:', campaigns[currentIndex]);
    // TODO: 상세 모달 열기
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">캠페인 탐색</h1>
              <p className="text-sm text-gray-600 mt-1">
                스와이프하여 캠페인을 탐색하세요
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {campaigns.length}
              </span>
              <span className="text-sm text-purple-600 font-medium">
                💚 {likedCampaigns.length}개 지원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center">
          {/* 카드 컨테이너 */}
          <div className="relative h-[700px] w-full max-w-md">
            {currentIndex < campaigns.length ? (
              <>
                {/* 다음 카드 미리보기 (배경) */}
                {currentIndex + 1 < campaigns.length && (
                  <div className="absolute inset-0 scale-95 opacity-30">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden h-full">
                      <img
                        src={campaigns[currentIndex + 1].image}
                        alt="Next"
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* 현재 카드 */}
                <SwipeCard
                  key={campaigns[currentIndex].id}
                  campaign={campaigns[currentIndex]}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onCardClick={handleCardClick}
                  active={true}
                />
              </>
            ) : (
              /* 모든 카드 완료 */
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  모두 확인했어요!
                </h3>
                <p className="text-gray-600 mb-6">
                  {likedCampaigns.length}개의 캠페인에 관심을 표시했습니다
                </p>
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setLikedCampaigns([]);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors"
                >
                  처음부터 다시 보기
                </button>
              </motion.div>
            )}
          </div>

          {/* 액션 버튼 - 카드 컨테이너 밖에 배치 */}
          {currentIndex < campaigns.length && (
            <div className="flex justify-center gap-8 mt-8">
              <button
                onClick={handleSwipeLeft}
                className="p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95 group"
              >
                <X className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
              </button>
              
              <button
                onClick={handleSwipeRight}
                className="p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95 group"
              >
                <Heart className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}

          {/* 진행 인디케이터 */}
          {currentIndex < campaigns.length && (
            <div className="flex justify-center gap-1 -mt-12">
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
          )}
        </div>
      </div>
    </div>
  );
}