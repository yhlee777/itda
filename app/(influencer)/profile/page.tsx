// app/(influencer)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Home, Bell, User, Trophy, Settings, ChevronRight, Edit3,
  Instagram, Youtube, TrendingUp, DollarSign, Calendar, Award,
  Users, Heart, Eye, MessageCircle, Share2, BarChart3, Target,
  Wallet, CreditCard, LogOut, Camera, Check, X, Star, Zap,
  Shield, Crown, Flame, Gift, ArrowUp, ArrowDown, Plus
} from 'lucide-react';

interface Stats {
  totalEarnings: number;
  monthlyEarnings: number;
  completedCampaigns: number;
  activeCampaigns: number;
  followers: number;
  engagementRate: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  streak: number;
}

interface Campaign {
  id: string;
  brand: string;
  title: string;
  status: 'active' | 'pending' | 'completed';
  progress: number;
  earnings: string;
  deadline: string;
  image: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'settings'>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  
  // 프로필 데이터
  const [profileData, setProfileData] = useState({
    name: '김인플',
    username: '@kiminfluencer',
    bio: '패션, 뷰티, 라이프스타일 크리에이터 ✨\n일상을 특별하게 만드는 콘텐츠',
    avatar: 'https://i.pravatar.cc/150?img=47',
    email: 'kim@influencer.com',
    phone: '010-1234-5678',
    instagram: 'kiminfluencer',
    youtube: 'KimChannel',
    categories: ['패션', '뷰티', '라이프'],
    joinDate: '2024.01.15'
  });

  // 통계 데이터
  const [stats, setStats] = useState<Stats>({
    totalEarnings: 15420000,
    monthlyEarnings: 3200000,
    completedCampaigns: 23,
    activeCampaigns: 3,
    followers: 85000,
    engagementRate: 4.8,
    level: 'gold',
    streak: 7
  });

  // 진행 중인 캠페인
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      brand: '나이키',
      title: '에어맥스 신제품',
      status: 'active',
      progress: 65,
      earnings: '500만원',
      deadline: '7일 남음',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
    },
    {
      id: '2',
      brand: '스타벅스',
      title: '여름 시즌 프로모션',
      status: 'active',
      progress: 30,
      earnings: '200만원',
      deadline: '14일 남음',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93'
    },
    {
      id: '3',
      brand: '샤넬',
      title: 'COCO CRUSH',
      status: 'pending',
      progress: 0,
      earnings: '1,500만원',
      deadline: '심사 중',
      image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d'
    }
  ]);

  // 주간 성과 데이터
  const weeklyPerformance = [
    { day: '월', views: 12500, likes: 890 },
    { day: '화', views: 15200, likes: 1020 },
    { day: '수', views: 13800, likes: 950 },
    { day: '목', views: 16500, likes: 1100 },
    { day: '금', views: 18200, likes: 1250 },
    { day: '토', views: 22000, likes: 1450 },
    { day: '일', views: 19500, likes: 1320 }
  ];

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'bronze': return 'from-orange-600 to-orange-400';
      case 'silver': return 'from-gray-500 to-gray-400';
      case 'gold': return 'from-yellow-500 to-yellow-400';
      case 'platinum': return 'from-purple-600 to-pink-600';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'bronze': return Shield;
      case 'silver': return Star;
      case 'gold': return Crown;
      case 'platinum': return Zap;
      default: return Shield;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num/1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num/1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(num);
  };

  const LevelIcon = getLevelIcon(stats.level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
      {/* 헤더 - 간소화 */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b">
        <div className="px-4 py-3.5 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">내 정보</h1>
          <button
            onClick={() => router.push('/settings')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 프로필 섹션 - 모바일 최적화 */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={profileData.avatar} 
                alt={profileData.name}
                className="w-16 h-16 rounded-full border-3 border-purple-100"
              />
              {/* 레벨 배지 */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${getLevelColor(stats.level)} rounded-full flex items-center justify-center`}>
                <LevelIcon className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{profileData.name}</h2>
                <span className="text-xs text-gray-500">{stats.level.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-0.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-semibold">{formatNumber(stats.followers)}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-semibold">{stats.engagementRate}%</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-semibold">{stats.streak}일</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-50"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>

          {/* 탭 네비게이션 - 간소화 */}
          <div className="flex gap-1 mt-4 bg-gray-50 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2 rounded-lg font-medium text-xs transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              대시보드
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 rounded-lg font-medium text-xs transition-all ${
                activeTab === 'profile' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              프로필
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 rounded-lg font-medium text-xs transition-all ${
                activeTab === 'settings' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              설정
            </button>
          </div>
        </div>
      </div>

      {/* 탭 콘텐츠 - 패딩 조정 */}
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* 수익 현황 - 간소화 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                  <Wallet className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-xs opacity-90">이번달</p>
                  <p className="text-lg font-bold">₩3.2M</p>
                  <p className="text-xs mt-1 opacity-90">↑ 23%</p>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                  <DollarSign className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-xs opacity-90">총 수익</p>
                  <p className="text-lg font-bold">₩15.4M</p>
                  <p className="text-xs mt-1 opacity-90">상위 5%</p>
                </div>
              </div>

              {/* 활동 요약 - 한 줄로 */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-xl font-bold">{stats.completedCampaigns}</div>
                    <div className="text-xs text-gray-500">완료</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{stats.activeCampaigns}</div>
                    <div className="text-xs text-gray-500">진행</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{(stats.followers/1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500">팔로워</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{stats.engagementRate}%</div>
                    <div className="text-xs text-gray-500">참여율</div>
                  </div>
                </div>
              </div>

              {/* 진행 중인 캠페인 - 간소화 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">진행 중</h3>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-2">
                  {activeCampaigns.slice(0, 2).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3"
                    >
                      <img 
                        src={campaign.image}
                        alt={campaign.brand}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{campaign.brand}</h4>
                          {campaign.status === 'active' && (
                            <span className="text-sm font-bold text-purple-600">
                              {campaign.progress}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{campaign.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{campaign.deadline}</span>
                          <span className="text-xs font-semibold text-green-600">{campaign.earnings}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 간단한 성과 표시 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">오늘 조회수</p>
                    <p className="text-xl font-bold text-gray-900">18.2K</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">참여</p>
                    <p className="text-xl font-bold text-purple-600">1,250</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">전환율</p>
                    <p className="text-xl font-bold text-green-600">6.8%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* 기본 정보 - 간소화 */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3">기본 정보</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">이름</label>
                    <p className="font-medium text-sm mt-0.5">{profileData.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">사용자명</label>
                    <p className="font-medium text-sm mt-0.5">{profileData.username}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">자기소개</label>
                    <p className="text-sm mt-0.5 text-gray-600">{profileData.bio}</p>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium">
                  프로필 편집
                </button>
              </div>

              {/* SNS 계정 - 간소화 */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3">연결된 계정</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span className="text-sm font-medium">@{profileData.instagram}</span>
                    </div>
                    <span className="text-xs text-gray-600">{(stats.followers/1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">{profileData.youtube}</span>
                    </div>
                    <span className="text-xs text-gray-600">32K</span>
                  </div>
                </div>
              </div>

              {/* 카테고리 - 간소화 */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3">활동 분야</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profileData.categories.map((cat) => (
                    <span 
                      key={cat}
                      className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {/* 설정 메뉴 - 간소화 */}
              <div className="bg-white rounded-xl shadow-sm divide-y">
                <button className="w-full px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">알림 설정</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">개인정보</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">결제</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">등급</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* 로그아웃 */}
              <button className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>

              {/* 버전 정보 */}
              <div className="text-center">
                <p className="text-xs text-gray-400">v1.0.0 · 가입: {profileData.joinDate}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2.5">
          <button 
            onClick={() => router.push('/campaigns')}
            className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">홈</span>
          </button>
          
          <button 
            onClick={() => router.push('/portfolio')}
            className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Trophy className="w-6 h-6" />
            <span className="text-xs mt-1">포트폴리오</span>
          </button>
          
          <button 
            onClick={() => router.push('/notifications')}
            className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
          >
            <Bell className="w-6 h-6" />
            <span className="text-xs mt-1">알림</span>
            <div className="absolute top-1.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </button>
          
          <button className="flex flex-col items-center justify-center p-2 text-purple-600 relative">
            <User className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-xs mt-1 font-semibold">내 정보</span>
            <div className="absolute -bottom-0.5 w-1 h-1 bg-purple-600 rounded-full"></div>
          </button>
        </div>
      </div>
    </div>
  );
}