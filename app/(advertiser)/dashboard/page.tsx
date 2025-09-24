"use client";
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, TrendingUp, Clock, DollarSign, Award, Bell, 
  CheckCircle, XCircle, Eye, MessageCircle, Zap, Brain,
  Filter, ChevronRight, Star, Activity, ArrowUp, ArrowDown,
  Sparkles, AlertCircle, BarChart3, Target, UserCheck,
  Timer, Send, ChevronDown, Shield, Percent, Calendar,
  Video, FileText, Download, Coffee, Rocket, TrendingDown,
  RefreshCw, Settings, Plus, X, Check, Hash, Image,
  CreditCard, Package, Briefcase, Trophy, Loader2,
  MessageSquare, UserPlus, AlertTriangle, ChevronLeft
} from 'lucide-react';

// 타입 정의
interface Campaign {
  id: number;
  name: string;
  status: 'active' | 'scheduled' | 'paused' | 'completed';
  budget: number;
  spent: number;
  applicants: number;
  views: number;
  endDate: string;
  performance: string;
  aiScore: number;
  category: string;
  requiredFollowers: number;
  targetAge: string;
  targetGender: string;
  deliverables: string[];
  estimatedROI: number;
  matchingInProgress: number;
}

interface Applicant {
  id: number;
  name: string;
  avatar: string;
  followers: number;
  engagement: number;
  matchScore: number;
  estimatedPrice: number;
  strongPoints: string[];
  risk: 'low' | 'medium' | 'high';
  roi: number;
  aiInsight: string;
  appliedTime?: string;
  category?: string;
  previousWork?: number;
  responseTime?: string;
  portfolio?: string[];
  verified?: boolean;
  chatStatus?: 'none' | 'pending' | 'active';
}

interface Notification {
  id: number;
  type: 'application' | 'price' | 'match' | 'campaign' | 'chat';
  message: string;
  time: Date;
  isRead: boolean;
  campaignId?: number;
  applicantId?: number;
}

interface TimeSlot {
  time: string;
  count: number;
  applicants: Applicant[];
}

interface RealtimeStats {
  viewing: number;
  applied: number;
  conversion: number;
  trending: boolean;
  avgResponseTime: string;
}

interface PredictedPrice {
  min: number;
  avg: number;
  max: number;
  confidence: number;
  factors: Array<{
    name: string;
    impact: number;
  }>;
}

const AdvertiserDashboard: React.FC = () => {
  // 상태 관리 - 명시적 타입 지정
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Applicant[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats>({
    viewing: 0,
    applied: 0,
    conversion: 0,
    trending: false,
    avgResponseTime: '1시간 23분'
  });
  const [filterMode, setFilterMode] = useState<string>('ai');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showCampaignWizard, setShowCampaignWizard] = useState<boolean>(false);
  const [selectedApplicants, setSelectedApplicants] = useState<number[]>([]);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [currentChat, setCurrentChat] = useState<Applicant | null>(null);
  const [predictedPrice, setPredictedPrice] = useState<PredictedPrice | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // 알림 시간대별 그룹화
  const notificationSlots: TimeSlot[] = [
    { time: '30분 후', count: 5, applicants: [] },
    { time: '2시간 후', count: 12, applicants: [] },
    { time: '6시간 후', count: 8, applicants: [] },
    { time: '내일', count: 3, applicants: [] }
  ];

  // 캠페인 데이터
  const campaigns: Campaign[] = [
    {
      id: 1,
      name: '2024 여름 컬렉션 런칭',
      status: 'active',
      budget: 5000000,
      spent: 1500000,
      applicants: 24,
      views: 342,
      endDate: '2024-06-30',
      performance: 'excellent',
      aiScore: 92,
      category: '패션/뷰티',
      requiredFollowers: 10000,
      targetAge: '20-35',
      targetGender: '여성',
      deliverables: ['피드 3개', '릴스 2개', '스토리 5개'],
      estimatedROI: 3.2,
      matchingInProgress: 7
    },
    {
      id: 2,
      name: '프리미엄 스킨케어 체험단',
      status: 'active',
      budget: 3000000,
      spent: 800000,
      applicants: 18,
      views: 156,
      endDate: '2024-07-15',
      performance: 'good',
      aiScore: 78,
      category: '뷰티',
      requiredFollowers: 5000,
      targetAge: '25-40',
      targetGender: '전체',
      deliverables: ['리뷰 포스팅 2개', '사용 후기 영상 1개'],
      estimatedROI: 2.5,
      matchingInProgress: 3
    },
    {
      id: 3,
      name: '신제품 런칭 이벤트',
      status: 'scheduled',
      budget: 8000000,
      spent: 0,
      applicants: 0,
      views: 45,
      endDate: '2024-08-01',
      performance: 'pending',
      aiScore: 0,
      category: '라이프스타일',
      requiredFollowers: 20000,
      targetAge: '전체',
      targetGender: '전체',
      deliverables: ['리뷰 1개'],
      estimatedROI: 0,
      matchingInProgress: 0
    }
  ];

  // AI 단가 예측
  const predictPrice = (applicant: Applicant): void => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const basePrice = applicant.followers * 10;
      const engagementMultiplier = applicant.engagement / 3;
      const predicted = Math.round(basePrice * engagementMultiplier);
      setPredictedPrice({
        min: predicted * 0.8,
        avg: predicted,
        max: predicted * 1.3,
        confidence: 87,
        factors: [
          { name: '팔로워 수', impact: 45 },
          { name: '참여율', impact: 30 },
          { name: '카테고리 전문성', impact: 15 },
          { name: '과거 성과', impact: 10 }
        ]
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  // 실시간 데이터 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats(prev => ({
        ...prev,
        viewing: Math.max(0, prev.viewing + Math.floor(Math.random() * 3) - 1),
        applied: prev.applied + (Math.random() > 0.7 ? 1 : 0),
        conversion: Number(((prev.applied / (prev.viewing || 1)) * 100).toFixed(1)),
        trending: Math.random() > 0.8
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 정기 알림 시뮬레이션
  useEffect(() => {
    const schedules = [
      { delay: 30 * 60 * 1000, message: '30분 알림: 새로운 지원자 5명' },
      { delay: 2 * 60 * 60 * 1000, message: '2시간 알림: 새로운 지원자 12명' },
      { delay: 6 * 60 * 60 * 1000, message: '6시간 알림: 새로운 지원자 8명' }
    ];

    const timers = schedules.map(schedule => 
      setTimeout(() => {
        const newNotification: Notification = {
          id: Date.now(),
          type: 'application',
          message: schedule.message,
          time: new Date(),
          isRead: false
        };
        setNotifications(prev => [newNotification, ...prev]);
        
        // 브라우저 알림
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('ITDA 알림', {
            body: schedule.message,
            icon: '/icon.png'
          });
        }
      }, schedule.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [selectedCampaign]);

  // AI 추천 인플루언서
  const getAIRecommendations = (campaignId: number): Applicant[] => {
    const recommendations: Applicant[] = [
      {
        id: 1,
        name: '김뷰티',
        avatar: '👩',
        followers: 125000,
        engagement: 4.8,
        matchScore: 95,
        estimatedPrice: 1500000,
        strongPoints: ['타겟 연령층 일치', '높은 참여율', '뷰티 전문'],
        risk: 'low',
        roi: 3.2,
        aiInsight: '과거 유사 캠페인에서 평균 대비 2.5배 높은 성과 기록',
        category: '뷰티',
        previousWork: 28,
        responseTime: '평균 30분',
        portfolio: ['이미지1', '이미지2', '이미지3'],
        verified: true,
        chatStatus: 'none'
      },
      {
        id: 2,
        name: '이패션',
        avatar: '👗',
        followers: 87000,
        engagement: 6.2,
        matchScore: 88,
        estimatedPrice: 1200000,
        strongPoints: ['우수한 콘텐츠 품질', '충성도 높은 팔로워'],
        risk: 'low',
        roi: 2.8,
        aiInsight: 'Z세대 타겟 도달률 상위 5% 인플루언서',
        category: '패션',
        previousWork: 15,
        responseTime: '평균 1시간',
        verified: true,
        chatStatus: 'none'
      },
      {
        id: 3,
        name: '박라이프',
        avatar: '🌿',
        followers: 234000,
        engagement: 3.1,
        matchScore: 82,
        estimatedPrice: 2000000,
        strongPoints: ['대규모 팔로워', '다양한 콘텐츠'],
        risk: 'medium',
        roi: 2.1,
        aiInsight: '라이프스타일 분야 영향력 지수 상위 10%',
        category: '라이프스타일',
        previousWork: 42,
        responseTime: '평균 2시간',
        verified: false,
        chatStatus: 'none'
      }
    ];
    return recommendations;
  };

  // 캠페인 선택 핸들러
  const handleCampaignSelect = (campaign: Campaign): void => {
    setSelectedCampaign(campaign);
    const recommendations = getAIRecommendations(campaign.id);
    setAiRecommendations(recommendations);
    
    // 지원자 목록 업데이트
    const mockApplicants: Applicant[] = [
      ...recommendations,
      {
        id: 4,
        name: '최트렌드',
        avatar: '✨',
        followers: 56000,
        engagement: 5.5,
        matchScore: 75,
        estimatedPrice: 900000,
        strongPoints: ['트렌드 선도', '젊은 타겟'],
        risk: 'medium',
        roi: 2.3,
        aiInsight: '최근 급성장 중인 인플루언서',
        appliedTime: '2시간 전',
        category: '트렌드',
        previousWork: 8,
        chatStatus: 'none'
      }
    ];
    setApplicants(mockApplicants);
  };

  // 일괄 처리 핸들러
  const handleBatchAction = (action: 'accept' | 'reject' | 'message'): void => {
    if (selectedApplicants.length === 0) {
      alert('선택된 지원자가 없습니다.');
      return;
    }
    
    if (action === 'accept') {
      alert(`${selectedApplicants.length}명의 지원자를 승인했습니다.`);
    } else if (action === 'reject') {
      alert(`${selectedApplicants.length}명의 지원자를 거절했습니다.`);
    } else if (action === 'message') {
      setShowChat(true);
    }
    
    setSelectedApplicants([]);
  };

  // 채팅 시작
  const startChat = (applicant: Applicant): void => {
    setCurrentChat(applicant);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 향상된 헤더 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                ITDA 광고주 센터
              </h1>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Premium
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 실시간 지표 */}
              <div className="flex items-center gap-4 px-4 py-2 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600 animate-pulse" />
                  <span className="text-sm font-medium text-purple-900">
                    {realtimeStats.viewing}명 보는 중
                  </span>
                </div>
                {realtimeStats.trending && (
                  <span className="flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    핫트렌드
                  </span>
                )}
              </div>
              
              {/* 새 캠페인 버튼 */}
              <button 
                onClick={() => setShowCampaignWizard(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                새 캠페인
              </button>
              
              {/* 알림 */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="relative p-2 bg-white border rounded-lg hover:bg-gray-50"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
                
                {/* 알림 패널 */}
                {showNotificationPanel && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">알림 센터</h3>
                      <p className="text-xs text-gray-500 mt-1">시간대별 지원자 알림</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationSlots.map((slot, idx) => (
                        <div 
                          key={idx}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{slot.time}</p>
                              <p className="text-xs text-gray-500">
                                {slot.count}명의 새로운 지원자
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 text-center">
                      <button className="text-sm text-purple-600 font-medium">
                        알림 설정 변경
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 향상된 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">진행중 캠페인</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
                <p className="text-xs text-green-600 mt-1">+2 이번주</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">총 지원자</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {campaigns.reduce((sum, c) => sum + c.applicants, 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">+18% 증가</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">평균 매칭률</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {realtimeStats.conversion}%
                </p>
                <p className="text-xs text-purple-600 mt-1">우수</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">AI 매칭 점수</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedCampaign ? selectedCampaign.aiScore : '-'}
                </p>
                <p className="text-xs text-yellow-600 mt-1">최적화중</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Brain className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">예상 ROI</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedCampaign ? `${selectedCampaign.estimatedROI}x` : '-'}
                </p>
                <p className="text-xs text-green-600 mt-1">+15% 예상</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 메인 대시보드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 캠페인 리스트 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">캠페인</h2>
                <RefreshCw className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {campaigns.map(campaign => (
                  <button
                    key={campaign.id}
                    onClick={() => handleCampaignSelect(campaign)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedCampaign?.id === campaign.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{campaign.category}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-gray-600">
                            <Users className="w-3 h-3" />
                            {campaign.applicants}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-600">
                            <Eye className="w-3 h-3" />
                            {campaign.views}
                          </span>
                          {campaign.matchingInProgress > 0 && (
                            <span className="flex items-center gap-1 text-xs text-purple-600">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {campaign.matchingInProgress} 매칭중
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {campaign.status === 'active' && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                            진행중
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {campaign.endDate}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 bg-gray-100 rounded-full overflow-hidden h-1.5">
                      <div 
                        className="h-full bg-purple-600 transition-all"
                        style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI 인사이트 패널 */}
            {selectedCampaign && (
              <div className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-semibold">AI 인사이트</h3>
                </div>
                <p className="text-sm text-white/90">
                  현재 캠페인의 매칭률이 업계 평균보다 23% 높습니다.
                </p>
                <p className="text-xs text-white/70 mt-2">
                  💡 팁: 오후 2-4시에 지원자가 가장 활발합니다
                </p>
              </div>
            )}
          </div>

          {/* 오른쪽: AI 추천 & 지원자 */}
          <div className="lg:col-span-2">
            {selectedCampaign ? (
              <div className="space-y-6">
                {/* AI 추천 섹션 */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Brain className="w-6 h-6" />
                      AI 추천 인플루언서
                    </h2>
                    <span className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      실시간 분석중
                    </span>
                  </div>
                  
                  <div className="grid gap-4">
                    {aiRecommendations.slice(0, 3).map(influencer => (
                      <div 
                        key={influencer.id}
                        className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className="text-2xl">{influencer.avatar}</div>
                              {influencer.verified && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                                  <Check className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold flex items-center gap-2">
                                {influencer.name}
                                {influencer.verified && (
                                  <Shield className="w-3 h-3 text-blue-400" />
                                )}
                              </h3>
                              <p className="text-sm text-white/80">
                                {influencer.followers.toLocaleString()} 팔로워 • {influencer.engagement}% 참여율
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded">
                                  <Target className="w-3 h-3" />
                                  매칭률 {influencer.matchScore}%
                                </div>
                                <div className="flex items-center gap-1 text-xs bg-green-400/20 px-2 py-1 rounded">
                                  <TrendingUp className="w-3 h-3" />
                                  ROI {influencer.roi}x
                                </div>
                                <div className="flex items-center gap-1 text-xs bg-yellow-400/20 px-2 py-1 rounded">
                                  <Clock className="w-3 h-3" />
                                  {influencer.responseTime}
                                </div>
                              </div>
                              <p className="text-xs text-white/70 mt-2">
                                💡 {influencer.aiInsight}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => predictPrice(influencer)}
                              className="px-3 py-1.5 bg-white/20 text-white rounded text-xs font-medium hover:bg-white/30 transition-colors"
                            >
                              단가 예측
                            </button>
                            <button 
                              onClick={() => startChat(influencer)}
                              className="px-3 py-1.5 bg-white text-purple-600 rounded text-xs font-medium hover:bg-white/90 transition-colors"
                            >
                              제안하기
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* AI 단가 예측 결과 */}
                  {predictedPrice && (
                    <div className="mt-4 p-4 bg-white/10 backdrop-blur rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        AI 단가 예측
                      </h4>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-white/70">최소</p>
                          <p className="text-lg font-bold">₩{predictedPrice.min.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/70">평균</p>
                          <p className="text-lg font-bold">₩{predictedPrice.avg.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/70">최대</p>
                          <p className="text-lg font-bold">₩{predictedPrice.max.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-white/20 px-2 py-1 rounded">
                          신뢰도 {predictedPrice.confidence}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 일괄 처리 도구 */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded text-purple-600"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.checked) {
                            setSelectedApplicants(applicants.map(a => a.id));
                          } else {
                            setSelectedApplicants([]);
                          }
                        }}
                      />
                      <span className="text-sm text-gray-600">
                        {selectedApplicants.length > 0 
                          ? `${selectedApplicants.length}명 선택됨` 
                          : '전체 선택'}
                      </span>
                    </div>
                    
                    {selectedApplicants.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleBatchAction('accept')}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200"
                        >
                          일괄 승인
                        </button>
                        <button 
                          onClick={() => handleBatchAction('reject')}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
                        >
                          일괄 거절
                        </button>
                        <button 
                          onClick={() => handleBatchAction('message')}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200"
                        >
                          메시지 보내기
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 지원자 리스트 */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold">지원자 목록</h2>
                      <div className="flex items-center gap-2">
                        <select 
                          className="text-sm border rounded-lg px-3 py-1"
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterMode(e.target.value)}
                          value={filterMode}
                        >
                          <option value="all">전체</option>
                          <option value="ai">AI 추천</option>
                          <option value="new">신규</option>
                          <option value="high-match">높은 매칭률</option>
                          <option value="verified">인증됨</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* 필터 태그 */}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        ⚡ 빠른 응답
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        ✅ 검증됨
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        🎯 매칭률 80%+
                      </span>
                    </div>
                  </div>
                  
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {applicants
                      .filter(a => {
                        if (filterMode === 'ai') return a.matchScore >= 80;
                        if (filterMode === 'new') return a.appliedTime;
                        if (filterMode === 'high-match') return a.matchScore >= 85;
                        if (filterMode === 'verified') return a.verified;
                        return true;
                      })
                      .map(applicant => (
                        <div key={applicant.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-1 mr-3">
                              <input 
                                type="checkbox"
                                className="rounded text-purple-600"
                                checked={selectedApplicants.includes(applicant.id)}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  if (e.target.checked) {
                                    setSelectedApplicants([...selectedApplicants, applicant.id]);
                                  } else {
                                    setSelectedApplicants(selectedApplicants.filter(id => id !== applicant.id));
                                  }
                                }}
                              />
                            </div>
                            <div className="flex items-start gap-3 flex-1">
                              <div className="relative">
                                <div className="text-2xl">{applicant.avatar}</div>
                                {applicant.verified && (
                                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                                    <Check className="w-2 h-2 text-white" />
                                  </div>
                                )}
                                {applicant.chatStatus === 'active' && (
                                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 animate-pulse">
                                    <MessageSquare className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{applicant.name}</h3>
                                  {applicant.matchScore >= 90 && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                      ⭐ 최적 매칭
                                    </span>
                                  )}
                                  {applicant.verified && (
                                    <Shield className="w-3 h-3 text-blue-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {applicant.followers.toLocaleString()} 팔로워 • {applicant.engagement}% 참여율
                                </p>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span>{applicant.category}</span>
                                  <span>경력 {applicant.previousWork}건</span>
                                  {applicant.responseTime && (
                                    <span className="text-purple-600">{applicant.responseTime}</span>
                                  )}
                                  {applicant.appliedTime && (
                                    <span className="text-blue-600">{applicant.appliedTime}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  {applicant.strongPoints.map((point, idx) => (
                                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                      {point}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                ₩{applicant.estimatedPrice.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => startChat(applicant)}
                                  className="p-1.5 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                                  title="채팅하기"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                                <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                                  상세보기
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 실시간 활동 피드 */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    실시간 활동
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-gray-600">김뷰티님이 방금 지원했습니다</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-gray-600">박라이프님이 프로필을 조회중입니다</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      <span className="text-gray-600">이패션님이 메시지를 보냈습니다</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">캠페인을 선택하면 AI 분석 결과를 확인할 수 있습니다</p>
                <button 
                  onClick={() => setShowCampaignWizard(true)}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  새 캠페인 만들기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 채팅 모달 */}
        {showChat && currentChat && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{currentChat.avatar}</div>
                  <div>
                    <h3 className="font-semibold">{currentChat.name}</h3>
                    <p className="text-sm text-gray-500">
                      {currentChat.followers.toLocaleString()} 팔로워
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-center text-sm text-gray-500 mb-4">
                  대화가 시작되었습니다
                </div>
                
                {/* 자동 메시지 템플릿 */}
                <div className="bg-purple-50 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium mb-2">💡 추천 메시지</p>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm p-2 bg-white rounded hover:bg-gray-50">
                      안녕하세요! 캠페인에 지원해주셔서 감사합니다.
                    </button>
                    <button className="w-full text-left text-sm p-2 bg-white rounded hover:bg-gray-50">
                      포트폴리오를 확인해보니 정말 인상적이네요!
                    </button>
                    <button className="w-full text-left text-sm p-2 bg-white rounded hover:bg-gray-50">
                      협업 조건에 대해 논의하고 싶습니다.
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 캠페인 생성 위자드 */}
        {showCampaignWizard && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">새 캠페인 만들기</h2>
                <p className="text-sm text-gray-600 mt-1">
                  AI가 최적의 인플루언서를 찾아드립니다
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* 캠페인 기본 정보 */}
                <div>
                  <label className="block text-sm font-medium mb-2">캠페인 이름</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="예: 2024 여름 신제품 런칭"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">카테고리</label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>패션/뷰티</option>
                      <option>푸드</option>
                      <option>여행</option>
                      <option>테크</option>
                      <option>라이프스타일</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">예산</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="예: 5,000,000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">타겟 설정</label>
                  <div className="grid grid-cols-3 gap-3">
                    <input 
                      type="text"
                      className="px-3 py-2 border rounded-lg"
                      placeholder="연령대 (예: 20-35)"
                    />
                    <select className="px-3 py-2 border rounded-lg">
                      <option>성별 무관</option>
                      <option>여성</option>
                      <option>남성</option>
                    </select>
                    <input 
                      type="text"
                      className="px-3 py-2 border rounded-lg"
                      placeholder="최소 팔로워 수"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">요구사항</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm">피드 포스팅</label>
                      <input type="number" className="w-20 px-2 py-1 border rounded" placeholder="3" />
                      <span className="text-sm text-gray-500">개</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm">릴스/쇼츠</label>
                      <input type="number" className="w-20 px-2 py-1 border rounded" placeholder="2" />
                      <span className="text-sm text-gray-500">개</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm">스토리</label>
                      <input type="number" className="w-20 px-2 py-1 border rounded" placeholder="5" />
                      <span className="text-sm text-gray-500">개</span>
                    </div>
                  </div>
                </div>
                
                {/* AI 매칭 설정 */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI 매칭 설정
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">자동 매칭 활성화</label>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">AI 단가 추천</label>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">성과 예측 리포트</label>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t flex items-center justify-between">
                <button 
                  onClick={() => setShowCampaignWizard(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    임시 저장
                  </button>
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    캠페인 생성
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertiserDashboard;