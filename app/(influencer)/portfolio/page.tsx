// app/(influencer)/portfolio/page.tsx
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Home, Bell, User, Trophy, Grid3X3, List, Filter, Search,
  Eye, Heart, MessageCircle, Share2, Lock, Globe, ChevronDown,
  Calendar, DollarSign, TrendingUp, Award, Settings, X, Check,
  Instagram, Youtube, Play, Image as ImageIcon, BarChart3, ArrowUpRight,
  Star, Sparkles, ChevronLeft, MoreVertical, Bookmark, ExternalLink,
  Camera, Video, FileText, Users, Clock, MapPin, Verified
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
  isVerified?: boolean;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  
  // 포트폴리오 데이터 (기존 데이터 활용)
  const [portfolioItems] = useState<PortfolioItem[]>([
    {
      id: '1',
      campaignName: '에어맥스 2024',
      brand: '나이키',
      brandLogo: '👟',
      completedDate: '2024.01.15',
      category: '패션',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
        { type: 'video', url: '#', thumbnail: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa' }
      ],
      stats: {
        views: 125000,
        likes: 8900,
        comments: 234,
        shares: 56,
        engagement: 7.2
      },
      earnings: 5000000,
      deliverables: ['피드 3', '릴스 2', '스토리 5'],
      platform: 'instagram',
      isPublic: true,
      tags: ['스니커즈', '패션', '나이키'],
      isVerified: true
    },
    {
      id: '2',
      campaignName: '여름 시즌 음료',
      brand: '스타벅스',
      brandLogo: '☕',
      completedDate: '2024.01.20',
      category: 'F&B',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93' }
      ],
      stats: {
        views: 89000,
        likes: 6200,
        comments: 189,
        shares: 34,
        engagement: 6.9
      },
      earnings: 2000000,
      deliverables: ['릴스 1', '스토리 3'],
      platform: 'instagram',
      isPublic: true,
      tags: ['카페', '음료'],
      isVerified: false
    },
    {
      id: '3',
      campaignName: 'Z플립5 리뷰',
      brand: '삼성전자',
      brandLogo: '📱',
      completedDate: '2024.01.10',
      category: '테크',
      media: [
        { type: 'video', url: '#', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9' }
      ],
      stats: {
        views: 210000,
        likes: 12300,
        comments: 567,
        shares: 123,
        engagement: 5.8
      },
      earnings: 8000000,
      deliverables: ['유튜브 1', '피드 2'],
      platform: 'youtube',
      isPublic: false,
      tags: ['테크', '갤럭시']
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

  const filteredItems = portfolioItems.filter(item => 
    selectedFilter === 'all' || item.category === selectedFilter
  );

  // 총 통계 계산
  const totalStats = {
    campaigns: portfolioItems.length,
    totalEarnings: portfolioItems.reduce((sum, item) => sum + item.earnings, 0),
    avgEngagement: portfolioItems.reduce((sum, item) => sum + item.stats.engagement, 0) / portfolioItems.length,
    totalViews: portfolioItems.reduce((sum, item) => sum + item.stats.views, 0)
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'instagram': return <Instagram size={14} />;
      case 'youtube': return <Youtube size={14} />;
      case 'tiktok': return '🎵';
      default: return <Camera size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50 pb-20">
      {/* 모바일 헤더 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">내 포트폴리오</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative"
              >
                <Filter size={20} />
                {selectedFilter !== 'all' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></span>
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 필터 섹션 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t bg-white overflow-hidden"
            >
              <div className="px-4 py-3">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedFilter(category);
                        setShowFilters(false);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedFilter === category
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? '전체' : category}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 프로필 & 통계 카드 - 모바일 최적화 */}
      <div className="px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-5 mb-6"
        >
          {/* 프로필 섹션 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                J
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">@jiyeon_style</h2>
                <Verified className="w-4 h-4 text-blue-500 fill-blue-500" />
              </div>
              <p className="text-sm text-gray-600">패션 & 라이프스타일</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500">팔로워 42.3K</span>
                <span className="text-xs text-gray-500">참여율 7.2%</span>
              </div>
            </div>
          </div>

          {/* 통계 그리드 - 2x2 모바일 최적화 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600">완료 캠페인</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{totalStats.campaigns}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">총 수익</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalStats.totalEarnings)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600">총 조회수</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(totalStats.totalViews)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600">평균 참여율</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{totalStats.avgEngagement.toFixed(1)}%</p>
            </div>
          </div>

          {/* 공유 버튼 */}
          <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm">
            <Share2 size={16} />
            포트폴리오 공유하기
          </button>
        </motion.div>

        {/* 포트폴리오 아이템 - 카드 스타일 */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              {/* 미디어 섹션 */}
              <div className="relative aspect-[4/3] bg-gray-100">
                <img
                  src={item.media[0].type === 'video' ? item.media[0].thumbnail : item.media[0].url}
                  alt={item.campaignName}
                  className="w-full h-full object-cover"
                />
                {item.media[0].type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                )}
                {item.media.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                    <ImageIcon size={12} />
                    +{item.media.length - 1}
                  </div>
                )}
                {!item.isPublic && (
                  <div className="absolute top-3 left-3 bg-black/50 text-white p-1.5 rounded-lg">
                    <Lock size={14} />
                  </div>
                )}
              </div>

              {/* 콘텐츠 섹션 */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{item.brandLogo}</span>
                      <h3 className="font-bold text-gray-900">{item.brand}</h3>
                      {item.isVerified && <Verified className="w-4 h-4 text-blue-500 fill-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-600">{item.campaignName}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                    {getPlatformIcon(item.platform)}
                    <span className="text-xs text-gray-600">{item.platform}</span>
                  </div>
                </div>

                {/* 통계 - 가로 스크롤 */}
                <div className="flex gap-4 overflow-x-auto scrollbar-hide mb-3">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{formatNumber(item.stats.views)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium">{formatNumber(item.stats.likes)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{formatNumber(item.stats.comments)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-600">{item.stats.engagement}%</span>
                  </div>
                </div>

                {/* 하단 정보 */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    {item.completedDate}
                  </div>
                  <div className="font-bold text-purple-600">
                    {formatCurrency(item.earnings)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 상세 보기 바텀시트 */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              ref={bottomSheetRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 핸들 */}
              <div className="p-4">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{selectedItem.campaignName}</h2>
                  <button onClick={() => setSelectedItem(null)}>
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* 스크롤 가능한 콘텐츠 */}
              <div className="px-4 pb-8 overflow-y-auto max-h-[70vh]">
                {/* 미디어 갤러리 */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
                  {selectedItem.media.map((media, idx) => (
                    <div key={idx} className="relative w-48 h-48 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={media.type === 'video' ? media.thumbnail : media.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {media.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" fill="white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 상세 통계 */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">성과 분석</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">조회수</p>
                      <p className="text-lg font-bold">{formatNumber(selectedItem.stats.views)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">좋아요</p>
                      <p className="text-lg font-bold">{formatNumber(selectedItem.stats.likes)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">댓글</p>
                      <p className="text-lg font-bold">{formatNumber(selectedItem.stats.comments)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">참여율</p>
                      <p className="text-lg font-bold text-green-600">{selectedItem.stats.engagement}%</p>
                    </div>
                  </div>
                </div>

                {/* 제작 콘텐츠 */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">제작 콘텐츠</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.deliverables.map((item, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 태그 */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                    <ExternalLink size={18} />
                    콘텐츠 보기
                  </button>
                  <button className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl">
                    <Share2 size={18} />
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