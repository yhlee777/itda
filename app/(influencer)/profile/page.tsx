// app/(influencer)/profile/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, Bell, Shield, CreditCard, Award,
  ChevronRight, Edit3, Instagram, Youtube, Twitter,
  Users, TrendingUp, Flame, Star, Trophy, 
  BarChart2, Calendar, DollarSign, Camera,
  LogOut, HelpCircle, FileText, Moon
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'settings'>('dashboard');
  const [isEditing, setIsEditing] = useState(false);

  // 프로필 데이터 (실제로는 Supabase에서 가져옴)
  const profileData = {
    name: '김인플',
    email: 'influencer@test.com',
    bio: '패션과 라이프스타일을 사랑하는 인플루언서입니다 ✨',
    instagram: 'fashion_kim',
    youtube: 'KimStyle',
    categories: ['패션', '뷰티', '라이프'],
    profileImage: 'https://via.placeholder.com/150',
    tier: 'gold'
  };

  const stats = {
    followers: 125000,
    engagementRate: 4.8,
    totalCampaigns: 42,
    earnings: 15420000,
    rating: 4.8,
    level: 'gold',
    streak: 15
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
              profileData.tier === 'gold' ? 'bg-yellow-500' : 'bg-purple-500'
            }`}>
              <Trophy className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{profileData.name}</h2>
              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                {stats.level.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{profileData.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold">{formatNumber(stats.followers)}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold">{stats.engagementRate}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
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

        {/* 탭 네비게이션 */}
        <div className="flex gap-1 mt-5 bg-gray-50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            대시보드
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'profile' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            프로필
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
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
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* 통계 카드들 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-xs text-gray-500">이번 달</span>
                </div>
                <p className="text-2xl font-bold mt-2">42</p>
                <p className="text-xs text-gray-600">완료 캠페인</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-xs text-gray-500">총 수익</span>
                </div>
                <p className="text-2xl font-bold mt-2">₩15.4M</p>
                <p className="text-xs text-gray-600">+12% 상승</p>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3">최근 캠페인</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">나이키 에어맥스</p>
                    <p className="text-xs text-gray-500">2일 전 완료</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₩3.5M</p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
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
            {/* 프로필 정보 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3">기본 정보</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">이름</label>
                  <p className="text-sm font-medium mt-0.5">{profileData.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">소개</label>
                  <p className="text-sm mt-0.5 text-gray-600">{profileData.bio}</p>
                </div>
              </div>
            </div>

            {/* SNS 계정 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3">연결된 계정</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-medium">@{profileData.instagram}</span>
                  </div>
                  <span className="text-sm text-gray-600">{formatNumber(stats.followers)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Youtube className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium">{profileData.youtube}</span>
                  </div>
                  <span className="text-sm text-gray-600">32K</span>
                </div>
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
            className="space-y-4"
          >
            {/* 설정 메뉴 */}
            <div className="bg-white rounded-xl shadow-sm divide-y">
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">알림 설정</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">개인정보 보호</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">결제 정보</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">등급 및 혜택</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">다크 모드</span>
                </div>
                <div className="w-11 h-6 bg-gray-200 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
                </div>
              </button>
            </div>

            {/* 기타 설정 */}
            <div className="bg-white rounded-xl shadow-sm divide-y">
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">도움말</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">이용약관</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* 로그아웃 버튼 - 하단에 배치 */}
            <div className="pt-4">
              <LogoutButton variant="danger" showIcon={true} />
            </div>

            {/* 버전 정보 */}
            <div className="text-center py-4">
              <p className="text-xs text-gray-400">버전 1.0.0</p>
              <p className="text-xs text-gray-400">© 2025 ITDA</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}