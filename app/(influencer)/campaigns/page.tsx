// app/(influencer)/campaigns/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 상대 경로 또는 @ 별칭 사용
// import SwipeCard from '@/components/SwipeCard';  // @ 별칭 사용시
import SwipeCard from '../../../components/SwipeCard';  // 상대 경로 사용시

// 캠페인 타입 정의
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([
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
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('swipe');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [filter, setFilter] = useState('all');

  const handleSwipeLeft = () => {
    // 관심없음 처리
    console.log('Passed:', campaigns[currentIndex].title);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handleSwipeRight = () => {
    // 관심있음 처리 - 실시간 알림
    const campaign = campaigns[currentIndex];
    setLikedCampaigns(prev => [...prev, campaign.id]);
    
    // 실시간 알림 시뮬레이션
    showNotification(`${campaign.brand}에 지원이 완료되었습니다! 🎉`);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handleCardClick = () => {
    setSelectedCampaign(campaigns[currentIndex]);
    setShowDetail(true);
  };

  const showNotification = (message: string) => {
    // 실제로는 toast notification 라이브러리 사용
    console.log('Notification:', message);
  };

  // 필터링된 캠페인
  const filteredCampaigns = filter === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.category === filter);

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
            
            {/* 보기 모드 토글 */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode('swipe')}
                className={`px-4 py-2 rounded-full transition-all ${
                  viewMode === 'swipe' 
                    ? 'bg-white shadow-sm text-purple-600' 
                    : 'text-gray-600'
                }`}
              >
                스와이프
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-full transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-purple-600' 
                    : 'text-gray-600'
                }`}
              >
                리스트
              </button>
            </div>
          </div>

          {/* 필터 */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {['all', '패션', 'F&B', '테크', '뷰티', '라이프'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  filter === cat
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? '전체' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'swipe' ? (
          /* 스와이프 모드 */
          <div className="flex flex-col items-center">
            {/* 진행 상태 */}
            <div className="w-full max-w-md mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} / {filteredCampaigns.length}
                </span>
                <span className="text-sm text-purple-600 font-medium">
                  💚 {likedCampaigns.length}개 지원
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                  style={{ width: `${((currentIndex + 1) / filteredCampaigns.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 스와이프 카드 컨테이너 */}
            <div className="relative h-[600px] w-full max-w-md">
              <AnimatePresence>
                {filteredCampaigns.map((campaign, index) => {
                  if (index < currentIndex) return null;
                  
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
              </AnimatePresence>

              {/* 모든 카드 완료 */}
              {currentIndex >= filteredCampaigns.length && (
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
                    {likedCampaigns.length}개의 캠페인에 지원했습니다
                  </p>
                  <button 
                    onClick={() => {
                      setCurrentIndex(0);
                      setLikedCampaigns([]);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg transition-shadow"
                  >
                    다시 탐색하기
                  </button>
                </motion.div>
              )}
            </div>

            {/* 액션 버튼 */}
            {currentIndex < filteredCampaigns.length && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={handleSwipeLeft}
                  className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform group"
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">❌</span>
                </button>
                
                <button
                  onClick={handleCardClick}
                  className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform group"
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">ℹ️</span>
                </button>
                
                <button
                  onClick={handleSwipeRight}
                  className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform group"
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">💚</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 리스트 모드 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map(campaign => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedCampaign(campaign);
                  setShowDetail(true);
                }}
              >
                <div className="h-48 bg-gray-200" 
                  style={{
                    backgroundImage: `url(${campaign.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600">
                      {campaign.brand}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {campaign.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>💰 {campaign.budget}</span>
                    <span>📅 {campaign.duration}</span>
                  </div>
                  <button
                    className={`w-full py-2 rounded-xl font-medium transition-all ${
                      likedCampaigns.includes(campaign.id)
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-md'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!likedCampaigns.includes(campaign.id)) {
                        setLikedCampaigns([...likedCampaigns, campaign.id]);
                        showNotification(`${campaign.brand}에 지원이 완료되었습니다! 🎉`);
                      }
                    }}
                  >
                    {likedCampaigns.includes(campaign.id) ? '지원완료' : '지원하기'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      <AnimatePresence>
        {showDetail && selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* 모달 내용 */}
              <div className="relative">
                <div 
                  className="h-64 bg-gray-200"
                  style={{
                    backgroundImage: `url(${selectedCampaign.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <button
                    onClick={() => setShowDetail(false)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
                      {selectedCampaign.brand}
                    </span>
                    <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                      {selectedCampaign.category}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-4">{selectedCampaign.title}</h2>
                  
                  <p className="text-gray-600 mb-6">
                    {selectedCampaign.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">예산</div>
                      <div className="font-bold text-lg">{selectedCampaign.budget}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">기간</div>
                      <div className="font-bold text-lg">{selectedCampaign.duration}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">마감일</div>
                      <div className="font-bold text-lg">{selectedCampaign.deadline}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">지역</div>
                      <div className="font-bold text-lg">{selectedCampaign.location}</div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold mb-3">요구사항</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCampaign.requirements.map((req, i) => (
                        <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold mb-3">제작 콘텐츠</h3>
                    <ul className="space-y-2">
                      {selectedCampaign.deliverables?.map((del, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600">
                          <span className="text-purple-600">✓</span>
                          {del}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!likedCampaigns.includes(selectedCampaign.id)) {
                        setLikedCampaigns([...likedCampaigns, selectedCampaign.id]);
                        showNotification(`${selectedCampaign.brand}에 지원이 완료되었습니다! 🎉`);
                      }
                      setShowDetail(false);
                    }}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                      likedCampaigns.includes(selectedCampaign.id)
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {likedCampaigns.includes(selectedCampaign.id) ? '지원완료' : '이 캠페인 지원하기'}
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