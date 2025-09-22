'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, Bell, Shield, CreditCard, Award,
  ChevronRight, Edit3, Instagram, Youtube, Twitter,
  Users, TrendingUp, Flame, Star, Trophy, 
  BarChart2, Calendar, DollarSign, Camera,
  LogOut, HelpCircle, FileText, Moon,
  Grid3X3, Play, Heart, MessageCircle, Eye,
  Lock, Unlock, MoreVertical, ArrowLeft
} from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'settings'>('dashboard');
  const [portfolioItems, setPortfolioItems] = useState([
    {
      id: '1',
      campaign: '나이키 에어맥스',
      brand: '나이키',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      likes: 8900,
      views: 125000,
      date: '2024.01.15',
      isPublic: true,
      hasVideo: false
    },
    {
      id: '2', 
      campaign: '샤넬 뷰티',
      brand: '샤넬',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
      likes: 12300,
      views: 189000,
      date: '2024.01.20',
      isPublic: true,
      hasVideo: true
    },
    {
      id: '3',
      campaign: '스타벅스 여름',
      brand: '스타벅스',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
      likes: 6200,
      views: 89000,
      date: '2024.01.25',
      isPublic: false,
      hasVideo: false
    }
  ]);

  const profileData = {
    name: '김인플',
    username: '@kim_style',
    bio: '패션과 라이프스타일을 사랑하는 크리에이터 ✨',
    profileImage: 'https://via.placeholder.com/150',
    tier: 'gold',
    isVerified: true,
    followers: 125000,
    following: 892,
    posts: 1283
  };

  const stats = {
    totalCampaigns: 42,
    totalEarnings: 15420000,
    avgEngagement: 4.8,
    avgRating: 4.9,
    completedThisMonth: 5,
    pendingPayments: 3200000
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const togglePortfolioPrivacy = (itemId: string) => {
    setPortfolioItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, isPublic: !item.isPublic } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 프로필 헤더 */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 pt-8 pb-4">
        <div className="px-4">
          {/* 상단 액션 버튼 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-bold">프로필</h2>
            <button className="p-2 bg-white/20 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* 프로필 정보 */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-4">
              <img 
                src={profileData.profileImage} 
                alt="프로필"
                className="w-24 h-24 rounded-full border-4 border-white"
              />
              {profileData.tier === 'gold' && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            
            <h3 className="text-white text-xl font-bold flex items-center justify-center gap-2">
              {profileData.name}
              {profileData.isVerified && (
                <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white fill-white" />
                </span>
              )}
            </h3>
            <p className="text-white/80 text-sm mb-2">{profileData.username}</p>
            <p className="text-white/90 text-sm mb-4">{profileData.bio}</p>

            {/* 팔로워 통계 */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-white font-bold text-lg">{formatNumber(profileData.posts)}</p>
                <p className="text-white/70 text-xs">게시물</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">{formatNumber(profileData.followers)}</p>
                <p className="text-white/70 text-xs">팔로워</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">{formatNumber(profileData.following)}</p>
                <p className="text-white/70 text-xs">팔로잉</p>
              </div>
            </div>

            {/* 프로필 편집 버튼 */}
            <button className="px-6 py-2 bg-white text-purple-600 rounded-full font-medium text-sm">
              프로필 편집
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="flex">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 text-center font-medium transition-all ${
              activeTab === 'dashboard' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500'
            }`}
          >
            <BarChart2 className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">대시보드</span>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-3 text-center font-medium transition-all ${
              activeTab === 'portfolio' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500'
            }`}
          >
            <Grid3X3 className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">포트폴리오</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-center font-medium transition-all ${
              activeTab === 'settings' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500'
            }`}
          >
            <Settings className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">설정</span>
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* 대시보드 탭 */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* 이번 달 실적 */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">이번 달 실적</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600">완료 캠페인</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stats.completedThisMonth}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600">이번 달 수익</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {(stats.pendingPayments / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>

              {/* 전체 통계 */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">전체 통계</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">총 캠페인</span>
                    <span className="font-bold">{stats.totalCampaigns}개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">총 수익</span>
                    <span className="font-bold">₩{stats.totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">평균 참여율</span>
                    <span className="font-bold">{stats.avgEngagement}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">평균 평점</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold">{stats.avgRating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 퀵 액션 */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">빠른 메뉴</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-gray-50 rounded-lg text-left">
                    <CreditCard className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-sm font-medium">정산 내역</p>
                  </button>
                  <button className="p-3 bg-gray-50 rounded-lg text-left">
                    <Award className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-sm font-medium">리뷰 관리</p>
                  </button>
                  <button className="p-3 bg-gray-50 rounded-lg text-left">
                    <Calendar className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-sm font-medium">일정 관리</p>
                  </button>
                  <button className="p-3 bg-gray-50 rounded-lg text-left">
                    <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-sm font-medium">성과 분석</p>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 포트폴리오 탭 */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 포트폴리오 설정 */}
              <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">포트폴리오</h3>
                  <button className="text-purple-600 text-sm font-medium">
                    편집
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  완료한 캠페인 작업물을 관리하세요
                </p>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">
                    공개 포트폴리오: {portfolioItems.filter(item => item.isPublic).length}개
                  </span>
                  <span className="text-sm text-purple-600">
                    비공개: {portfolioItems.filter(item => !item.isPublic).length}개
                  </span>
                </div>
              </div>

              {/* 포트폴리오 그리드 */}
              <div className="grid grid-cols-3 gap-1">
                {portfolioItems.map(item => (
                  <div key={item.id} className="relative aspect-square">
                    {/* 이미지 */}
                    <img 
                      src={item.image} 
                      alt={item.campaign}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 오버레이 정보 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-medium truncate">
                          {item.campaign}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-white" />
                            <span className="text-white text-xs">{formatNumber(item.views)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-white" />
                            <span className="text-white text-xs">{formatNumber(item.likes)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 비디오 인디케이터 */}
                    {item.hasVideo && (
                      <div className="absolute top-2 right-2">
                        <Play className="w-5 h-5 text-white drop-shadow-lg" fill="white" />
                      </div>
                    )}

                    {/* 공개/비공개 토글 */}
                    <button
                      onClick={() => togglePortfolioPrivacy(item.id)}
                      className="absolute top-2 left-2 p-1.5 bg-black/50 rounded-lg backdrop-blur-sm"
                    >
                      {item.isPublic ? (
                        <Unlock className="w-4 h-4 text-white" />
                      ) : (
                        <Lock className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 설정 탭 */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* 계정 설정 */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-gray-900">계정 설정</h3>
                </div>
                <div className="divide-y">
                  <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">Instagram 연동</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600">연결됨</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Youtube className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">YouTube 연동</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">정산 계좌</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* 알림 설정 */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-gray-900">알림 설정</h3>
                </div>
                <div className="divide-y">
                  <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">푸시 알림</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">개인정보 설정</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* 기타 */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="divide-y">
                  <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">도움말</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">이용약관</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-600">로그아웃</span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}