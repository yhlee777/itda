// app/(influencer)/profile/page.tsx
// 이 파일을 완전히 교체해주세요!

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, Bell, Shield, CreditCard, Award,
  ChevronRight, Edit3, Instagram, Youtube, Twitter,
  Users, TrendingUp, Flame, Star, Trophy, 
  BarChart2, Calendar, DollarSign, Camera,
  LogOut, HelpCircle, FileText, Moon,
  Grid3X3, Play, Heart, Eye, Lock, Unlock,
  MoreVertical, Plus, Trash2, Upload, TikTokIcon
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'settings'>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [portfolioPublicSetting, setPortfolioPublicSetting] = useState(true);
  
  // 포트폴리오 데이터 상태 관리
  const [portfolioItems, setPortfolioItems] = useState([
    {
      id: '1',
      campaign: '나이키 에어맥스',
      brand: '나이키',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      likes: 8900,
      views: 125000,
      date: '2024.01.15',
      isPublic: true,
      hasVideo: false,
      category: '패션'
    },
    {
      id: '2', 
      campaign: '샤넬 뷰티',
      brand: '샤넬',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
      likes: 12300,
      views: 189000,
      date: '2024.01.20',
      isPublic: true,
      hasVideo: true,
      category: '뷰티'
    },
    {
      id: '3',
      campaign: '스타벅스 여름',
      brand: '스타벅스',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
      likes: 6200,
      views: 89000,
      date: '2024.01.25',
      isPublic: false,
      hasVideo: false,
      category: '푸드'
    },
    {
      id: '4',
      campaign: '아디다스 런닝',
      brand: '아디다스',
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop',
      likes: 15400,
      views: 234000,
      date: '2024.01.10',
      isPublic: true,
      hasVideo: true,
      category: '스포츠'
    },
    {
      id: '5',
      campaign: 'MAC 립스틱',
      brand: 'MAC',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
      likes: 9800,
      views: 156000,
      date: '2024.01.05',
      isPublic: true,
      hasVideo: false,
      category: '뷰티'
    },
    {
      id: '6',
      campaign: '무인양품 라이프',
      brand: '무인양품',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
      likes: 7600,
      views: 98000,
      date: '2023.12.28',
      isPublic: true,
      hasVideo: false,
      category: '라이프스타일'
    }
  ]);

  const profileData = {
    name: '김인플',
    email: 'influencer@test.com',
    bio: '패션과 라이프스타일을 사랑하는 인플루언서입니다 ✨',
    instagram: 'fashion_kim',
    youtube: 'KimStyle',
    tiktok: 'kim_style',
    categories: ['패션', '뷰티', '라이프'],
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&facepad=3',
    tier: 'gold',
    portfolioVisibility: true
  };

  const stats = {
    followers: 125000,
    engagementRate: 4.8,
    totalCampaigns: 42,
    earnings: 15420000,
    rating: 4.8,
    level: 'gold',
    streak: 15,
    completedThisMonth: 8,
    avgViews: 145000
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}천만원`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}백만원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    } else {
      return `${amount.toLocaleString()}원`;
    }
  };

  // 포트폴리오 공개/비공개 토글
  const togglePortfolioPrivacy = (itemId: string) => {
    setPortfolioItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, isPublic: !item.isPublic } : item
      )
    );
    toast.success('공개 설정이 변경되었습니다');
  };

  // 전체 포트폴리오 공개/비공개 토글
  const toggleAllPortfolioPrivacy = (makePublic: boolean) => {
    setPortfolioItems(prev => 
      prev.map(item => ({ ...item, isPublic: makePublic }))
    );
    toast.success(makePublic ? '모든 포트폴리오를 공개했습니다' : '모든 포트폴리오를 비공개했습니다');
  };

  // 포트폴리오 아이템 삭제
  const deletePortfolioItem = (itemId: string) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('포트폴리오가 삭제되었습니다');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* 프로필 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img 
              src={profileData.profileImage} 
              alt="프로필"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center ${
              profileData.tier === 'gold' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gray-400'
            }`}>
              <Trophy className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{profileData.name}</h2>
              <Shield className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 mb-2">{profileData.bio}</p>
            <div className="flex gap-3">
              <div className="text-center">
                <p className="font-bold text-lg">{formatNumber(stats.followers)}</p>
                <p className="text-xs text-gray-600">팔로워</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{stats.engagementRate}%</p>
                <p className="text-xs text-gray-600">참여율</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{stats.totalCampaigns}</p>
                <p className="text-xs text-gray-600">캠페인</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Edit3 className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-1 mt-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 rounded-md font-medium transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            대시보드
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-2 rounded-md font-medium transition-all ${
              activeTab === 'portfolio' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            포트폴리오
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 rounded-md font-medium transition-all ${
              activeTab === 'settings' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            설정
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <AnimatePresence mode="wait">
        {/* 대시보드 탭 */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* 수익 현황 */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold mb-3">이번 달 수익</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold">{formatCurrency(stats.earnings)}</span>
                <span className="text-sm text-green-600">+23%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
              </div>
            </div>

            {/* 활동 통계 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-600">연속 활동</span>
                </div>
                <p className="text-2xl font-bold">{stats.streak}일</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">평균 평점</span>
                </div>
                <p className="text-2xl font-bold">{stats.rating}</p>
              </div>
            </div>

            {/* 최근 활동 - 미니 포트폴리오 프리뷰 */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">최근 완료 캠페인</h3>
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className="text-sm text-purple-600"
                >
                  모두 보기 →
                </button>
              </div>
              <div className="flex -space-x-2">
                {portfolioItems.slice(0, 5).map((item, idx) => (
                  <img
                    key={idx}
                    src={item.image}
                    alt={item.brand}
                    className="w-12 h-12 rounded-full border-2 border-white object-cover"
                  />
                ))}
                <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{portfolioItems.length - 5}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 포트폴리오 탭 - 새로운 기능! */}
        {activeTab === 'portfolio' && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* 포트폴리오 설정 헤더 */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">포트폴리오 관리</h3>
                <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* 전체 공개 설정 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Grid3X3 className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">전체 포트폴리오 공개</p>
                    <p className="text-xs text-gray-500">광고주가 포트폴리오를 볼 수 있습니다</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={portfolioPublicSetting}
                    onChange={(e) => setPortfolioPublicSetting(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* 일괄 설정 버튼 */}
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => toggleAllPortfolioPrivacy(true)}
                  className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  모두 공개
                </button>
                <button 
                  onClick={() => toggleAllPortfolioPrivacy(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  모두 비공개
                </button>
              </div>
            </div>

            {/* 포트폴리오 그리드 */}
            <div className="grid grid-cols-3 gap-2">
              {portfolioItems.map(item => (
                <div key={item.id} className="relative aspect-square group">
                  {/* 이미지 */}
                  <img 
                    src={item.image} 
                    alt={item.campaign}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  
                  {/* 오버레이 정보 - 호버 시 표시 (모바일에서는 탭) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity rounded-lg">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-bold truncate">
                        {item.campaign}
                      </p>
                      <p className="text-white/80 text-xs truncate">
                        {item.brand}
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

                    {/* 삭제 버튼 - 호버 시 표시 */}
                    <button
                      onClick={() => deletePortfolioItem(item.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* 비디오 인디케이터 */}
                  {item.hasVideo && (
                    <div className="absolute top-2 right-2 pointer-events-none">
                      <Play className="w-5 h-5 text-white drop-shadow-lg" fill="white" />
                    </div>
                  )}

                  {/* 공개/비공개 토글 - 항상 표시 */}
                  <button
                    onClick={() => togglePortfolioPrivacy(item.id)}
                    className="absolute top-2 left-2 p-1.5 bg-black/50 rounded-lg backdrop-blur-sm hover:bg-black/70 transition-colors"
                  >
                    {item.isPublic ? (
                      <Unlock className="w-4 h-4 text-white" />
                    ) : (
                      <Lock className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* 날짜 표시 */}
                  <div className="absolute bottom-2 right-2">
                    <span className="text-white text-[10px] bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}

              {/* 포트폴리오 추가 버튼 */}
              <button className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-all">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">추가</span>
              </button>
            </div>

            {/* 포트폴리오 통계 */}
            <div className="bg-white rounded-xl p-4">
              <h4 className="font-bold mb-3">포트폴리오 성과</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {portfolioItems.filter(item => item.isPublic).length}
                  </p>
                  <p className="text-xs text-gray-600">공개</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {portfolioItems.filter(item => !item.isPublic).length}
                  </p>
                  <p className="text-xs text-gray-600">비공개</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(portfolioItems.reduce((sum, item) => sum + item.views, 0))}
                  </p>
                  <p className="text-xs text-gray-600">총 조회수</p>
                </div>
              </div>

              {/* 카테고리별 분포 */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">카테고리별 분포</p>
                <div className="flex flex-wrap gap-2">
                  {['패션', '뷰티', '푸드', '라이프스타일', '스포츠'].map(category => {
                    const count = portfolioItems.filter(item => item.category === category).length;
                    return count > 0 ? (
                      <span key={category} className="px-2 py-1 bg-gray-100 rounded-lg text-xs">
                        {category} ({count})
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
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
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* 계정 설정 */}
            <div className="bg-white rounded-xl">
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">알림 설정</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-t">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">개인정보 보호</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-t">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">결제 정보</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* SNS 연결 */}
            <div className="bg-white rounded-xl">
              <h3 className="font-bold p-4 border-b">SNS 계정 연결</h3>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="font-medium text-sm">Instagram</p>
                      <p className="text-xs text-gray-500">@{profileData.instagram}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">연결됨</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Youtube className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">YouTube</p>
                      <p className="text-xs text-gray-500">{profileData.youtube}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">연결됨</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-black" />
                    <div>
                      <p className="font-medium text-sm">TikTok</p>
                      <p className="text-xs text-gray-500">@{profileData.tiktok}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">연결됨</span>
                </div>
              </div>
            </div>

            {/* 도움말 */}
            <div className="bg-white rounded-xl">
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">도움말</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-t">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">약관 및 정책</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 로그아웃 */}
            <div className="bg-white rounded-xl">
              <LogoutButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}