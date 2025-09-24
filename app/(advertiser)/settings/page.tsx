"use client";
// app/(advertiser)/settings/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, User, Bell, Shield, CreditCard, 
  FileText, HelpCircle, Globe, Users, Key,
  ChevronRight, Check, X, Info, Mail,
  Phone, MapPin, Calendar, DollarSign,
  BarChart2, Zap, Moon, Sun
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'account' | 'company' | 'notifications' | 'billing'>('account');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    applicantAlerts: true,
    priceAlerts: true,
    campaignEnding: true,
  });

  // 회사 정보 (실제로는 Supabase에서 가져옴)
  const companyData = {
    name: '테스트 컴퍼니',
    email: 'advertiser@test.com',
    phone: '02-1234-5678',
    address: '서울시 강남구',
    businessNumber: '123-45-67890',
    representative: '홍길동',
    joinDate: '2024-01-15',
    tier: 'premium',
    totalSpent: 45000000,
    activeCampaigns: 3,
    totalCampaigns: 28,
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('알림 설정이 변경되었습니다');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">설정</h1>
        <p className="text-gray-600">계정 및 회사 정보를 관리합니다</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveSection('account')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeSection === 'account'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            계정 설정
          </button>
          <button
            onClick={() => setActiveSection('company')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeSection === 'company'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            회사 정보
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeSection === 'notifications'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            알림 설정
          </button>
          <button
            onClick={() => setActiveSection('billing')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeSection === 'billing'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            결제 정보
          </button>
        </div>
      </div>

      {/* 섹션 컨텐츠 */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeSection === 'account' && (
          <div className="space-y-6">
            {/* 계정 정보 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">이메일</p>
                      <p className="text-sm text-gray-500">{companyData.email}</p>
                    </div>
                  </div>
                  <button className="text-sm text-purple-600 hover:text-purple-700">변경</button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">비밀번호</p>
                      <p className="text-sm text-gray-500">마지막 변경: 30일 전</p>
                    </div>
                  </div>
                  <button className="text-sm text-purple-600 hover:text-purple-700">변경</button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">2단계 인증</p>
                      <p className="text-sm text-gray-500">보안 강화를 위한 추가 인증</p>
                    </div>
                  </div>
                  <button className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    활성화됨
                  </button>
                </div>
              </div>
            </div>

            {/* 환경 설정 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">환경 설정</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
                    <div>
                      <p className="text-sm font-medium">다크 모드</p>
                      <p className="text-sm text-gray-500">화면 테마를 변경합니다</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      darkMode ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                      darkMode ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">언어</p>
                      <p className="text-sm text-gray-500">한국어</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* 위험 지역 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-red-600 mb-4">계정 관리</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between group">
                  <span className="text-sm font-medium">계정 일시 정지</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>
                
                <button className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between group">
                  <span className="text-sm font-medium">데이터 내보내기</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>

                <div className="pt-3 border-t">
                  <LogoutButton variant="danger" showIcon={true} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'company' && (
          <div className="space-y-6">
            {/* 회사 정보 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">회사 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">회사명</label>
                  <p className="text-base font-medium mt-1">{companyData.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">사업자등록번호</label>
                  <p className="text-base font-medium mt-1">{companyData.businessNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">대표자명</label>
                  <p className="text-base font-medium mt-1">{companyData.representative}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">연락처</label>
                  <p className="text-base font-medium mt-1">{companyData.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500">주소</label>
                  <p className="text-base font-medium mt-1">{companyData.address}</p>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                정보 수정 요청
              </button>
            </div>

            {/* 이용 현황 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">이용 현황</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-600">총 캠페인</span>
                  </div>
                  <p className="text-2xl font-bold">{companyData.totalCampaigns}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">진행중</span>
                  </div>
                  <p className="text-2xl font-bold">{companyData.activeCampaigns}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">총 지출</span>
                  </div>
                  <p className="text-2xl font-bold">₩{(companyData.totalSpent / 1000000).toFixed(1)}M</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-xs text-gray-600">가입일</span>
                  </div>
                  <p className="text-lg font-bold">{new Date(companyData.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-6">
            {/* 알림 채널 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">알림 채널</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">이메일 알림</p>
                      <p className="text-sm text-gray-500">중요한 업데이트를 이메일로 받습니다</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('email')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      notifications.email ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                      notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">푸시 알림</p>
                      <p className="text-sm text-gray-500">브라우저 푸시 알림을 받습니다</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('push')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      notifications.push ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                      notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">SMS 알림</p>
                      <p className="text-sm text-gray-500">긴급한 알림을 SMS로 받습니다</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('sms')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      notifications.sms ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                      notifications.sms ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* 알림 유형 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">알림 유형</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">지원자 알림</p>
                      <p className="text-sm text-gray-500">새로운 지원자가 있을 때</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('applicantAlerts')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      notifications.applicantAlerts ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                      notifications.applicantAlerts ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">가격 알림</p>
                      <p className="text-sm text-gray-500">AI 가격 예측 업데이트</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('priceAlerts')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      notifications.priceAlerts ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                      notifications.priceAlerts ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">캠페인 종료 알림</p>
                      <p className="text-sm text-gray-500">캠페인 종료 임박 시</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('campaignEnding')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      notifications.campaignEnding ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                      notifications.campaignEnding ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'billing' && (
          <div className="space-y-6">
            {/* 결제 수단 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 수단</h2>
              <div className="space-y-3">
                <div className="border rounded-lg p-4 flex items-center justify-between bg-purple-50 border-purple-300">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">신한카드 **** 1234</p>
                      <p className="text-xs text-gray-500">기본 결제 수단</p>
                    </div>
                  </div>
                  <button className="text-sm text-purple-600 hover:text-purple-700">변경</button>
                </div>

                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                  + 새 결제 수단 추가
                </button>
              </div>
            </div>

            {/* 결제 내역 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">최근 결제 내역</h2>
                <button className="text-sm text-purple-600 hover:text-purple-700">전체 보기</button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="text-sm font-medium">나이키 캠페인 정산</p>
                    <p className="text-xs text-gray-500">2024.12.15</p>
                  </div>
                  <p className="text-sm font-bold">₩3,500,000</p>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="text-sm font-medium">설화수 캠페인 정산</p>
                    <p className="text-xs text-gray-500">2024.12.01</p>
                  </div>
                  <p className="text-sm font-bold">₩2,800,000</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* 도움말 섹션 */}
      <div className="mt-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg">
            <HelpCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">도움이 필요하신가요?</h3>
            <p className="text-sm text-gray-600 mb-3">
              설정에 대한 질문이나 문제가 있으시면 언제든지 문의해주세요.
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
                고객센터
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                1:1 문의하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}