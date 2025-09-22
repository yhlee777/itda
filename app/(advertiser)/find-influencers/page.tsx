'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Users, TrendingUp, Heart, MessageCircle, ChevronDown, X, Check, Sparkles, Instagram, Youtube, Award, DollarSign, Target, MapPin, Calendar, BarChart, Zap, Shield, Eye } from 'lucide-react';

interface Platform {
  instagram?: number;
  youtube?: number;
  tiktok?: number;
  twitch?: number;
}

interface RecentPost {
  likes: number;
  comments: number;
  shares: number;
}

interface Influencer {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  engagement: number;
  categories: string[];
  platforms: Platform;
  avgPrice: number;
  completedCampaigns: number;
  rating: number;
  verified: boolean;
  aiScore: number;
  location: string;
  recentPosts: RecentPost[];
}

interface Category {
  value: string;
  label: string;
  icon: string;
}

interface Filters {
  minFollowers: number;
  maxFollowers: number;
  minEngagement: number;
  categories: string[];
  platforms: string[];
  priceRange: [number, number];
  location: string;
}

export default function FindInfluencersPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [aiRecommended, setAiRecommended] = useState<boolean>(false);
  
  // 필터 상태
  const [filters, setFilters] = useState<Filters>({
    minFollowers: 10000,
    maxFollowers: 1000000,
    minEngagement: 2,
    categories: [],
    platforms: [],
    priceRange: [50000, 5000000],
    location: 'all'
  });

  // 테스트 인플루언서 데이터
  const [influencers] = useState<Influencer[]>([
    {
      id: 1,
      name: '김민지',
      handle: '@minji_style',
      avatar: '👩‍🎨',
      followers: 125000,
      engagement: 4.8,
      categories: ['패션', '라이프스타일'],
      platforms: { instagram: 125000, youtube: 45000 },
      avgPrice: 2500000,
      completedCampaigns: 32,
      rating: 4.9,
      verified: true,
      aiScore: 95,
      location: '서울',
      recentPosts: [
        { likes: 12500, comments: 342, shares: 89 },
        { likes: 15200, comments: 456, shares: 123 }
      ]
    },
    {
      id: 2,
      name: '이준호',
      handle: '@junho_food',
      avatar: '👨‍🍳',
      followers: 89000,
      engagement: 5.2,
      categories: ['푸드', '여행'],
      platforms: { instagram: 89000, youtube: 23000 },
      avgPrice: 1800000,
      completedCampaigns: 28,
      rating: 4.8,
      verified: true,
      aiScore: 88,
      location: '부산',
      recentPosts: [
        { likes: 8900, comments: 234, shares: 67 },
        { likes: 9200, comments: 312, shares: 89 }
      ]
    },
    {
      id: 3,
      name: '박서연',
      handle: '@seoyeon_beauty',
      avatar: '💄',
      followers: 234000,
      engagement: 3.9,
      categories: ['뷰티', '패션'],
      platforms: { instagram: 234000, youtube: 156000, tiktok: 89000 },
      avgPrice: 3500000,
      completedCampaigns: 45,
      rating: 4.7,
      verified: true,
      aiScore: 92,
      location: '서울',
      recentPosts: [
        { likes: 23400, comments: 567, shares: 234 },
        { likes: 25600, comments: 678, shares: 345 }
      ]
    },
    {
      id: 4,
      name: '최현우',
      handle: '@hyunwoo_tech',
      avatar: '💻',
      followers: 67000,
      engagement: 6.1,
      categories: ['테크', '게임'],
      platforms: { youtube: 67000, twitch: 34000 },
      avgPrice: 1500000,
      completedCampaigns: 19,
      rating: 4.9,
      verified: false,
      aiScore: 79,
      location: '판교',
      recentPosts: [
        { likes: 6700, comments: 189, shares: 45 },
        { likes: 7100, comments: 223, shares: 67 }
      ]
    },
    {
      id: 5,
      name: '정예은',
      handle: '@yeeun_fitness',
      avatar: '🏋️‍♀️',
      followers: 156000,
      engagement: 4.5,
      categories: ['피트니스', '건강'],
      platforms: { instagram: 156000, youtube: 78000 },
      avgPrice: 2800000,
      completedCampaigns: 36,
      rating: 4.8,
      verified: true,
      aiScore: 87,
      location: '서울',
      recentPosts: [
        { likes: 15600, comments: 423, shares: 156 },
        { likes: 17800, comments: 534, shares: 189 }
      ]
    }
  ]);

  const categories: Category[] = [
    { value: 'all', label: '전체', icon: '🌟' },
    { value: 'fashion', label: '패션', icon: '👗' },
    { value: 'beauty', label: '뷰티', icon: '💄' },
    { value: 'food', label: '푸드', icon: '🍳' },
    { value: 'travel', label: '여행', icon: '✈️' },
    { value: 'tech', label: '테크', icon: '💻' },
    { value: 'fitness', label: '피트니스', icon: '🏋️' },
    { value: 'lifestyle', label: '라이프', icon: '🏠' }
  ];

  // 필터링된 인플루언서 목록
  const filteredInfluencers = influencers.filter(influencer => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!influencer.name.toLowerCase().includes(query) && 
          !influencer.handle.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">인플루언서 찾기</h1>
              <p className="text-sm text-gray-600 mt-1">
                브랜드에 완벽한 인플루언서를 AI가 추천해드립니다
              </p>
            </div>
            <button
              onClick={() => setAiRecommended(!aiRecommended)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                aiRecommended 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI 추천 {aiRecommended ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* 검색 바 */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="이름, 카테고리, 키워드로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              필터
              {showFilters && <X className="w-4 h-4" />}
            </button>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 필터 패널 */}
        {showFilters && (
          <div className="border-t bg-white px-4 py-4">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">팔로워 수</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>1만 - 5만</option>
                  <option>5만 - 10만</option>
                  <option>10만 - 50만</option>
                  <option>50만 이상</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">참여율</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>2% 이상</option>
                  <option>3% 이상</option>
                  <option>5% 이상</option>
                  <option>7% 이상</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">평균 단가</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>50만원 이하</option>
                  <option>50-100만원</option>
                  <option>100-300만원</option>
                  <option>300만원 이상</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">지역</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>전국</option>
                  <option>서울</option>
                  <option>경기</option>
                  <option>부산</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 인플루언서 목록 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 결과 정보 */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            총 {filteredInfluencers.length}명의 인플루언서를 찾았습니다
          </p>
          <select className="px-3 py-1.5 border rounded-lg text-sm">
            <option>AI 추천순</option>
            <option>팔로워 많은순</option>
            <option>참여율 높은순</option>
            <option>평점 높은순</option>
          </select>
        </div>

        {/* 인플루언서 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInfluencers.map((influencer) => (
            <div
              key={influencer.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              onClick={() => setSelectedInfluencer(influencer)}
            >
              {/* AI 점수 배지 */}
              {influencer.aiScore >= 90 && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI 추천 {influencer.aiScore}점
                </div>
              )}

              <div className="p-6">
                {/* 프로필 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{influencer.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{influencer.name}</h3>
                        {influencer.verified && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{influencer.handle}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 즐겨찾기 로직
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Heart className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">팔로워</p>
                    <p className="font-bold">
                      {influencer.followers >= 10000 
                        ? `${(influencer.followers/10000).toFixed(1)}만`
                        : influencer.followers.toLocaleString()
                      }
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">참여율</p>
                    <p className="font-bold text-green-600">{influencer.engagement}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">평점</p>
                    <div className="flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="font-bold">{influencer.rating}</span>
                    </div>
                  </div>
                </div>

                {/* 카테고리 태그 */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {influencer.categories.map((cat, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* 플랫폼 정보 */}
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                  {influencer.platforms.instagram && (
                    <div className="flex items-center gap-1">
                      <Instagram className="w-4 h-4" />
                      {(influencer.platforms.instagram/1000).toFixed(0)}K
                    </div>
                  )}
                  {influencer.platforms.youtube && (
                    <div className="flex items-center gap-1">
                      <Youtube className="w-4 h-4" />
                      {(influencer.platforms.youtube/1000).toFixed(0)}K
                    </div>
                  )}
                </div>

                {/* 하단 정보 */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">평균 단가</p>
                    <p className="font-bold text-lg">
                      ₩{(influencer.avgPrice/10000).toFixed(0)}만원
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                    프로필 보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인플루언서 상세 모달 */}
      {selectedInfluencer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">인플루언서 상세 정보</h2>
              <button
                onClick={() => setSelectedInfluencer(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* 프로필 섹션 */}
              <div className="flex items-start gap-6 mb-6">
                <div className="text-6xl">{selectedInfluencer.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{selectedInfluencer.name}</h3>
                    {selectedInfluencer.verified && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        인증됨
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{selectedInfluencer.handle}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {selectedInfluencer.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">
                      {selectedInfluencer.aiScore}점
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">AI 매칭 점수</p>
                </div>
              </div>

              {/* 상세 통계 */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {(selectedInfluencer.followers/1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-gray-600">총 팔로워</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {selectedInfluencer.engagement}%
                  </p>
                  <p className="text-sm text-gray-600">참여율</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {selectedInfluencer.completedCampaigns}
                  </p>
                  <p className="text-sm text-gray-600">완료 캠페인</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Star className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {selectedInfluencer.rating}
                  </p>
                  <p className="text-sm text-gray-600">평균 평점</p>
                </div>
              </div>

              {/* 최근 성과 */}
              <div className="mb-6">
                <h4 className="font-bold mb-3">최근 콘텐츠 성과</h4>
                <div className="space-y-2">
                  {selectedInfluencer.recentPosts.map((post, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                      <span className="text-sm text-gray-600">포스트 #{idx + 1}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{post.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{post.comments}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  메시지 보내기
                </button>
                <button className="flex-1 px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                  캠페인 초대하기
                </button>
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  즐겨찾기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}