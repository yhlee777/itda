// app/(influencer)/portfolio/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Home, Bell, User, Trophy, Grid3X3, List, Filter, Search,
  Eye, Heart, MessageCircle, Share2, Lock, Globe, ChevronDown,
  Calendar, DollarSign, TrendingUp, Award, Settings, X, Check,
  Instagram, Youtube, Play, Image as ImageIcon, BarChart3, ArrowUpRight
} from 'lucide-react';

interface PortfolioItem {
  id: string;
  campaignName: string;
  brand: string;
  brandLogo?: string;
  completedDate: string;
  category: string;
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
  };
  earnings: number;
  deliverables: string[];
  platform: 'instagram' | 'youtube' | 'blog' | 'tiktok';
  isPublic: boolean;
  tags: string[];
}

export default function PortfolioPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [isPublicPortfolio, setIsPublicPortfolio] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // 포트폴리오 데이터
  const [portfolioItems] = useState<PortfolioItem[]>([
    {
      id: '1',
      campaignName: '에어맥스 2024 런칭',
      brand: '나이키',
      completedDate: '2024.01.15',
      category: '패션',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa' },
        { type: 'video', url: '#', thumbnail: 'https://images.unsplash.com/photo-1552346154-21d32810aba3' }
      ],
      stats: {
        views: 125000,
        likes: 8900,
        comments: 234,
        shares: 56,
        engagement: 7.2
      },
      earnings: 5000000,
      deliverables: ['인스타 피드 3개', '릴스 2개', '스토리 5개'],
      platform: 'instagram',
      isPublic: true,
      tags: ['스니커즈', '패션', '나이키']
    },
    {
      id: '2',
      campaignName: '여름 시즌 음료',
      brand: '스타벅스',
      completedDate: '2024.01.20',
      category: 'F&B',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1498709112229-9e0c2d5e3c84' }
      ],
      stats: {
        views: 89000,
        likes: 6200,
        comments: 189,
        shares: 34,
        engagement: 6.9
      },
      earnings: 2000000,
      deliverables: ['릴스 1개', '스토리 3개'],
      platform: 'instagram',
      isPublic: true,
      tags: ['카페', '음료', '스타벅스']
    },
    {
      id: '3',
      campaignName: 'Z플립5 리뷰',
      brand: '삼성전자',
      completedDate: '2024.01.10',
      category: '테크',
      media: [
        { type: 'video', url: '#', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0' }
      ],
      stats: {
        views: 210000,
        likes: 12300,
        comments: 567,
        shares: 123,
        engagement: 5.8
      },
      earnings: 8000000,
      deliverables: ['유튜브 영상 1개', '인스타 피드 2개'],
      platform: 'youtube',
      isPublic: false,
      tags: ['테크', '갤럭시', '리뷰']
    },
    {
      id: '4',
      campaignName: '설화수 체험',
      brand: '아모레퍼시픽',
      completedDate: '2024.01.05',
      category: '뷰티',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9' }
      ],
      stats: {
        views: 95000,
        likes: 7800,
        comments: 245,
        shares: 67,
        engagement: 8.2
      },
      earnings: 3000000,
      deliverables: ['인스타 피드 2개', '릴스 1개'],
      platform: 'instagram',
      isPublic: true,
      tags: ['뷰티', '스킨케어', 'K뷰티']
    },
    {
      id: '5',
      campaignName: '새벽배송 체험',
      brand: '배달의민족',
      completedDate: '2023.12.28',
      category: '라이프',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { type: 'video', url: '#', thumbnail: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828' }
      ],
      stats: {
        views: 76000,
        likes: 5400,
        comments: 198,
        shares: 45,
        engagement: 7.1
      },
      earnings: 2500000,
      deliverables: ['릴스 2개', '스토리 하이라이트'],
      platform: 'instagram',
      isPublic: true,
      tags: ['배달', '음식', '일상']
    },
    {
      id: '6',
      campaignName: '운동화 컬렉션',
      brand: '아디다스',
      completedDate: '2023.12.20',
      category: '스포츠',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f' }
      ],
      stats: {
        views: 102000,
        likes: 8100,
        comments: 312,
        shares: 78,
        engagement: 7.9
      },
      earnings: 4500000,
      deliverables: ['인스타 피드 4개', '릴스 2개'],
      platform: 'instagram',
      isPublic: true,
      tags: ['운동', '피트니스', '아디다스']
    }
  ]);

  const categories = ['all', '패션', '뷰티', 'F&B', '테크', '라이프', '스포츠'];
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num/1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num/1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `₩${(num/1000000).toFixed(1)}M`;
  };

  const filteredItems = portfolioItems.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
    if (sortBy === 'views') return b.stats.views - a.stats.views;
    if (sortBy === 'earnings') return b.earnings - a.earnings;
    if (sortBy === 'engagement') return b.stats.engagement - a.stats.engagement;
    return 0;
  });

  const totalStats = {
    campaigns: portfolioItems.length,
    totalViews: portfolioItems.reduce((sum, item) => sum + item.stats.views, 0),
    totalEarnings: portfolioItems.reduce((sum, item) => sum + item.earnings, 0),
    avgEngagement: portfolioItems.reduce((sum, item) => sum + item.stats.engagement, 0) / portfolioItems.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b">
        <div className="px-4 py-3.5">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">포트폴리오</h1>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 공개 설정 배너 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPublicPortfolio ? (
              <>
                <Globe className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">포트폴리오 공개 중</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">비공개 포트폴리오</span>
              </>
            )}
          </div>
          <button
            onClick={() => setIsPublicPortfolio(!isPublicPortfolio)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isPublicPortfolio ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              isPublicPortfolio ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{totalStats.campaigns}</div>
              <div className="text-xs text-gray-500">캠페인</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{formatNumber(totalStats.totalViews)}</div>
              <div className="text-xs text-gray-500">총 조회수</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{formatCurrency(totalStats.totalEarnings)}</div>
              <div className="text-xs text-gray-500">총 수익</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-pink-600">{totalStats.avgEngagement.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">평균 참여</div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 & 정렬 */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'}`}
            >
              <List className="w-5 h-5" />
            </button>
            
            <div className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm outline-none text-gray-700"
              >
                <option value="date">최신순</option>
                <option value="views">조회순</option>
                <option value="earnings">수익순</option>
                <option value="engagement">참여순</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {sortedItems.length}개
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedFilter === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {cat === 'all' ? '전체' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 포트폴리오 그리드/리스트 */}
      <div className="px-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-1">
            {sortedItems.map((item) => (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedItem(item)}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
              >
                <img 
                  src={item.media[0].type === 'video' ? item.media[0].thumbnail : item.media[0].url}
                  alt={item.campaignName}
                  className="w-full h-full object-cover"
                />
                
                {/* 멀티 미디어 표시 */}
                {item.media.length > 1 && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <ImageIcon className="w-3 h-3" />
                      <span className="text-xs font-bold">{item.media.length}</span>
                    </div>
                  </div>
                )}
                
                {/* 비디오 표시 */}
                {item.media[0].type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}
                
                {/* 조회수 */}
                <div className="absolute bottom-2 left-2">
                  <div className="bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-white text-xs font-medium flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatNumber(item.stats.views)}
                  </div>
                </div>

                {/* 비공개 표시 */}
                {!item.isPublic && (
                  <div className="absolute top-2 left-2">
                    <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-xl shadow-sm p-3 cursor-pointer"
              >
                <div className="flex gap-3">
                  <img 
                    src={item.media[0].type === 'video' ? item.media[0].thumbnail : item.media[0].url}
                    alt={item.campaignName}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">{item.brand}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{item.campaignName}</p>
                      </div>
                      {!item.isPublic && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        {formatNumber(item.stats.views)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-3 h-3" />
                        {formatNumber(item.stats.likes)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {item.stats.engagement}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{item.completedDate}</span>
                      <span className="text-xs font-semibold text-green-600">{formatCurrency(item.earnings)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-4 top-20 bg-white rounded-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{selectedItem.brand}</h3>
                <button onClick={() => setSelectedItem(null)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 미디어 슬라이더 */}
              <div className="relative aspect-square bg-gray-100">
                <img 
                  src={selectedItem.media[0].type === 'video' ? selectedItem.media[0].thumbnail : selectedItem.media[0].url}
                  alt={selectedItem.campaignName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 상세 정보 */}
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedItem.campaignName}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedItem.completedDate} 완료</p>
                </div>

                {/* 성과 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h5 className="text-xs text-gray-500 mb-2 font-medium">캠페인 성과</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold">{formatNumber(selectedItem.stats.views)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold">{formatNumber(selectedItem.stats.likes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold">{formatNumber(selectedItem.stats.comments)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold">{formatNumber(selectedItem.stats.shares)}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-sm text-gray-600">참여율</span>
                    <span className="text-lg font-bold text-purple-600">{selectedItem.stats.engagement}%</span>
                  </div>
                </div>

                {/* 수익 */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">수익</span>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(selectedItem.earnings)}</span>
                </div>

                {/* 제작 콘텐츠 */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-2">제작 콘텐츠</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.deliverables.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 태그 */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-2">태그</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs text-gray-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button className="py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    공유
                  </button>
                  <button className="py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4" />
                    원본 보기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 설정 모달 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-4">포트폴리오 설정</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">포트폴리오 공개</p>
                    <p className="text-xs text-gray-500 mt-0.5">다른 사용자가 볼 수 있습니다</p>
                  </div>
                  <button
                    onClick={() => setIsPublicPortfolio(!isPublicPortfolio)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      isPublicPortfolio ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isPublicPortfolio ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium text-gray-900 mb-3">개별 캠페인 공개 설정</p>
                  <p className="text-xs text-gray-500 mb-3">비공개로 설정한 캠페인은 본인만 볼 수 있습니다</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-700">{item.brand}</span>
                        {item.isPublic ? (
                          <Globe className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium"
                >
                  완료
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2.5">
          <button 
            onClick={() => router.push('/campaigns')}
            className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">홈</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-2 text-purple-600 relative">
            <Trophy className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-xs mt-1 font-semibold">포트폴리오</span>
            <div className="absolute -bottom-0.5 w-1 h-1 bg-purple-600 rounded-full"></div>
          </button>
          
          <button 
            onClick={() => router.push('/notifications')}
            className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
          >
            <Bell className="w-6 h-6" />
            <span className="text-xs mt-1">알림</span>
            <div className="absolute top-1.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </button>
          
          <button 
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">내 정보</span>
          </button>
        </div>
      </div>
    </div>
  );
}