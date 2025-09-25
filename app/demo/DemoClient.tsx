'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const demoCampaigns = [
  {
    id: 1,
    brand: '디얼달리아',
    brandDesc: '클린뷰티 화장품',
    title: '비건 선크림 리뷰',
    description: '민감성 피부를 위한 비건 선크림 사용 후기를 공유해주세요. 자연스러운 일상 속 사용 모습을 담아주시면 좋아요.',
    budget: '50-80만원',
    requirements: '피드 2개, 스토리 3개',
    category: '뷰티',
    deadline: '11월 25일',
    followers: '1만-5만',
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=500&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=60&h=60&fit=crop'
  },
  {
    id: 2,
    brand: '카페 온어스',
    brandDesc: '성수동 로스터리 카페',
    title: '브런치 메뉴 소개',
    description: '주말 브런치 메뉴와 시그니처 커피를 자연스럽게 소개해주세요. 성수동 분위기와 함께 담아주시면 좋아요.',
    budget: '30-50만원',
    requirements: '릴스 1개, 피드 1개',
    category: 'F&B',
    deadline: '11월 20일',
    followers: '5천-3만',
    imageUrl: 'https://images.unsplash.com/photo-1550426735-c33c7ce414ff?w=400&h=500&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=60&h=60&fit=crop'
  },
  {
    id: 3,
    brand: '슬로우모먼트',
    brandDesc: '미니멀 라이프스타일 브랜드',
    title: '홈웨어 착용샷',
    description: '편안한 집에서의 일상을 슬로우모먼트 홈웨어와 함께 보여주세요. 따뜻하고 포근한 무드로 촬영해주세요.',
    budget: '60-100만원',
    requirements: '피드 3개, 릴스 1개',
    category: '패션',
    deadline: '12월 1일',
    followers: '1만-10만',
    imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&h=500&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=60&h=60&fit=crop'
  },
  {
    id: 4,
    brand: '그린테이블',
    brandDesc: '비건 도시락 배송',
    title: '일주일 식단 리뷰',
    description: '건강한 비건 도시락으로 일주일 식단 관리하는 모습을 보여주세요. Before & After 느낌으로 구성하면 좋아요.',
    budget: '70-120만원',
    requirements: '릴스 2개, 피드 2개',
    category: '푸드',
    deadline: '11월 28일',
    followers: '2만-8만',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=500&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=60&h=60&fit=crop'
  }
];

export default function DemoClient() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedCards, setSwipedCards] = useState<any[]>([]);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [showLockCard, setShowLockCard] = useState(false);
  
  const currentCampaign = showLockCard ? null : demoCampaigns[currentIndex];

  const handleSwipe = (swipeDirection: 'left' | 'right') => {
    if (showLockCard) return;
    
    setDirection(swipeDirection);
    
    if (swipeDirection === 'right' && currentCampaign) {
      setSwipedCards([...swipedCards, currentCampaign]);
    }

    setTimeout(() => {
      if (currentIndex === demoCampaigns.length - 1) {
        setShowLockCard(true);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      setDirection(null);
      setDragOffset(0);
    }, 300);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showLockCard) return;
      if (e.key === 'ArrowLeft') handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, showLockCard]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="fixed top-0 w-full z-50 p-6 bg-black/20 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className="text-white cursor-pointer">
              <p className="text-xs opacity-60 tracking-wider">DEMO MODE</p>
              <p className="text-xl font-light">itda</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-white/60">관심 캠페인</p>
              <p className="text-2xl text-purple-400 font-bold">{swipedCards.length}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/waitlist')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-medium shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              시작하기
            </motion.button>
          </div>
        </div>
      </div>

      <div className="h-screen flex items-center justify-center px-8 pt-20">
        <div className="w-full max-w-sm relative">
          {!showLockCard && currentIndex < demoCampaigns.length - 1 && (
            <div className="absolute inset-0 translate-y-4 scale-95 opacity-40">
              <div className="bg-white rounded-3xl h-full shadow-2xl" />
            </div>
          )}
          {!showLockCard && currentIndex < demoCampaigns.length - 2 && (
            <div className="absolute inset-0 translate-y-8 scale-90 opacity-20">
              <div className="bg-white rounded-3xl h-full shadow-2xl" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {!showLockCard && currentCampaign ? (
              <motion.div
                key={currentCampaign.id}
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  rotate: dragOffset * 0.1 
                }}
                exit={{
                  x: direction === 'left' ? -400 : direction === 'right' ? 400 : 0,
                  opacity: 0,
                  scale: 0.8,
                  rotate: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
                  transition: { duration: 0.3 }
                }}
                drag="x"
                dragConstraints={{ left: -150, right: 150 }}
                dragElastic={0.8}
                onDrag={(e, info) => setDragOffset(info.offset.x)}
                onDragEnd={(e, { offset, velocity }) => {
                  setDragOffset(0);
                  if (Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500) {
                    handleSwipe(offset.x > 0 ? 'right' : 'left');
                  }
                }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden relative cursor-grab active:cursor-grabbing"
                style={{ height: '650px' }}
              >
                <div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100">
                  <Image
                    src={currentCampaign.imageUrl}
                    alt={currentCampaign.brand}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex items-center gap-3 bg-white/90 backdrop-blur rounded-full pr-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                      <Image
                        src={currentCampaign.logoUrl}
                        alt="logo"
                        width={48}
                        height={48}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{currentCampaign.brand}</p>
                      <p className="text-xs text-gray-500">{currentCampaign.brandDesc}</p>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                      {currentCampaign.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col h-[386px]">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {currentCampaign.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 flex-1">
                    {currentCampaign.description}
                  </p>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">💰 예산</span>
                      <span className="font-bold text-purple-600 text-lg">
                        {currentCampaign.budget}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">📝 요구사항</span>
                      <span className="text-gray-700 text-sm">
                        {currentCampaign.requirements}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">👥 팔로워</span>
                      <span className="text-gray-700 text-sm">
                        {currentCampaign.followers}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">📅 마감</span>
                      <span className="text-gray-700 text-sm font-medium">
                        {currentCampaign.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                {dragOffset !== 0 && (
                  <div className={`absolute top-1/2 -translate-y-1/2 ${
                    dragOffset > 0 ? 'right-8' : 'left-8'
                  }`}>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        dragOffset > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      <span className="text-2xl text-white">
                        {dragOffset > 0 ? '❤️' : '✕'}
                      </span>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ) : showLockCard ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden relative"
                style={{ minHeight: '650px' }}
              >
                <div className="p-8 h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="text-7xl mb-6"
                    >
                      🔒
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                      더 많은 브랜드가<br/>기다리고 있어요!
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-6 text-center">
                      현재 <span className="text-purple-600 font-bold text-xl">83개</span>의 캠페인이<br/>
                      인플루언서를 찾고 있습니다
                    </p>
                    
                    {swipedCards.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-white rounded-xl p-4 mb-4 shadow-lg"
                      >
                        <p className="text-sm text-gray-600 mb-3 font-medium">
                          방금 관심 표시한 캠페인 ({swipedCards.length}개)
                        </p>
                        <div className="space-y-2 max-h-28 overflow-y-auto">
                          {swipedCards.map((card, i) => (
                            <div key={i} className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded">
                                  {card.category}
                                </span>
                                <span className="font-medium text-sm">{card.brand}</span>
                              </div>
                              <span className="text-purple-600 font-bold text-sm">{card.budget}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/waitlist')}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
                    >
                      무료로 시작하기
                    </motion.button>
                  </div>
                  
                  <div className="pt-4 text-center">
                    <p className="text-xs text-red-500 font-medium mb-1">
                      🔥 선착순 37명 남음
                    </p>
                    <p className="text-xs text-gray-400">
                      평생 수수료 0% · 가입비 없음
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!showLockCard && currentCampaign && (
            <div className="flex justify-center gap-16 mt-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('left')}
                className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-500/20 transition-all shadow-lg"
              >
                <span className="text-2xl">✕</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('right')}
                className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-green-500/20 transition-all shadow-lg"
              >
                <span className="text-2xl">❤️</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex gap-2">
          {demoCampaigns.map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`h-1 rounded-full transition-all ${
                i === currentIndex && !showLockCard
                  ? 'w-8 bg-white'
                  : i < currentIndex || showLockCard
                  ? 'w-1 bg-white/60'
                  : 'w-1 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {currentIndex === 0 && !showLockCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-white/60 text-sm animate-pulse">
            ← 관심 없어요　　　　관심 있어요 →
          </p>
        </motion.div>
      )}
    </main>
  );
}