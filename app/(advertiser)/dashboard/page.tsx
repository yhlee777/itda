'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, TrendingUp, Clock, DollarSign, Award, Bell, 
  CheckCircle, XCircle, Eye, MessageCircle, Zap, Brain,
  Filter, ChevronRight, Star, Activity, ArrowUp, ArrowDown,
  Sparkles, AlertCircle, BarChart3, Target, UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// 타입 정의
interface Campaign {
  id: number;
  name: string;
  status: string;
  budget: number;
  spent: number;
  applicants: number;
  views: number;
  endDate: string;
  performance: string;
  aiScore: number;
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
}

interface RealtimeStats {
  viewing: number;
  applied: number;
  conversion: number; // number로 유지
  trending: boolean;
}

interface Notification {
  id: number;
  type: 'application' | 'price' | 'match' | 'campaign';
  message: string;
  time: Date;
  isRead: boolean;
}

const AdvertiserDashboard = () => {
  // 상태 관리 - 타입 명시
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Applicant[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats>({
    viewing: 0,
    applied: 0,
    conversion: 0, // number로 초기화
    trending: false
  });
  const [filterMode, setFilterMode] = useState<'all' | 'ai' | 'new'>('ai');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 실시간 데이터 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats(prev => {
        const newViewing = Math.max(0, prev.viewing + Math.floor(Math.random() * 3) - 1);
        const newApplied = prev.applied + (Math.random() > 0.7 ? 1 : 0);
        const conversionRate = newViewing > 0 
          ? Number(((newApplied / newViewing) * 100).toFixed(1))
          : 0;
        
        return {
          viewing: newViewing,
          applied: newApplied,
          conversion: conversionRate, // number 타입 유지
          trending: Math.random() > 0.8
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
      aiScore: 92
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
      aiScore: 78
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
      aiScore: 0
    }
  ];

  // AI 추천 인플루언서 - 타입 명시된 함수
  const getAIRecommendations = (campaignId: number): Applicant[] => {
    return [
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
        previousWork: 28
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
        previousWork: 15
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
        previousWork: 42
      }
    ];
  };

  // 캠페인 선택 핸들러
  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    const recommendations = getAIRecommendations(campaign.id);
    setAiRecommendations(recommendations);
    
    // 지원자 목록 업데이트 시뮬레이션
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
        previousWork: 8
      }
    ];
    setApplicants(mockApplicants);
  };

  // 알림 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotification: Notification = {
        id: Date.now(),
        type: 'application',
        message: '새로운 지원자가 있습니다!',
        time: new Date(),
        isRead: false
      };
      setNotifications(prev => [newNotification, ...prev]);
      toast.success('새로운 지원자가 있습니다! 🎉');
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
              <p className="mt-1 text-sm text-gray-600">
                실시간으로 캠페인 성과를 확인하고 AI 추천을 받아보세요
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 실시간 지표 */}
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                <Eye className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  {realtimeStats.viewing}명 보는 중
                </span>
              </div>
              
              {/* 알림 */}
              <button className="relative p-2 bg-white border rounded-lg hover:bg-gray-50">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">진행중 캠페인</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 지원자</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {campaigns.reduce((sum, c) => sum + c.applicants, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 매칭률</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {realtimeStats.conversion}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI 추천 점수</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedCampaign ? selectedCampaign.aiScore : '-'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Brain className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 캠페인 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 캠페인 리스트 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">캠페인</h2>
              </div>
              <div className="divide-y">
                {campaigns.map(campaign => (
                  <button
                    key={campaign.id}
                    onClick={() => handleCampaignSelect(campaign)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedCampaign?.id === campaign.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {campaign.applicants}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {campaign.views}
                          </span>
                        </div>
                      </div>
                      {campaign.status === 'active' && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          진행중
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI 추천 & 지원자 */}
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
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      실시간 분석중
                    </span>
                  </div>
                  
                  <div className="grid gap-4">
                    {aiRecommendations.slice(0, 3).map(influencer => (
                      <div 
                        key={influencer.id}
                        className="bg-white/10 backdrop-blur rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{influencer.avatar}</div>
                            <div>
                              <h3 className="font-semibold">{influencer.name}</h3>
                              <p className="text-sm text-white/80">
                                {influencer.followers.toLocaleString()} 팔로워 • {influencer.engagement}% 참여율
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded">
                                  <Target className="w-3 h-3" />
                                  매칭률 {influencer.matchScore}%
                                </div>
                                <div className="flex items-center gap-1 text-xs bg-green-400/20 px-2 py-1 rounded">
                                  <TrendingUp className="w-3 h-3" />
                                  ROI {influencer.roi}x
                                </div>
                              </div>
                              <p className="text-xs text-white/70 mt-2">
                                💡 {influencer.aiInsight}
                              </p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
                            제안하기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 지원자 리스트 */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">지원자 목록</h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFilterMode('all')}
                          className={`px-3 py-1 text-sm rounded-full ${
                            filterMode === 'all' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'text-gray-600'
                          }`}
                        >
                          전체
                        </button>
                        <button
                          onClick={() => setFilterMode('ai')}
                          className={`px-3 py-1 text-sm rounded-full ${
                            filterMode === 'ai' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'text-gray-600'
                          }`}
                        >
                          AI 추천
                        </button>
                        <button
                          onClick={() => setFilterMode('new')}
                          className={`px-3 py-1 text-sm rounded-full ${
                            filterMode === 'new' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'text-gray-600'
                          }`}
                        >
                          신규
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    {applicants
                      .filter(a => {
                        if (filterMode === 'ai') return a.matchScore >= 80;
                        if (filterMode === 'new') return a.appliedTime;
                        return true;
                      })
                      .map(applicant => (
                        <div key={applicant.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{applicant.avatar}</div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{applicant.name}</h3>
                                  {applicant.matchScore >= 90 && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                      ⭐ 최적 매칭
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {applicant.followers.toLocaleString()} 팔로워 • {applicant.engagement}% 참여율
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>{applicant.category}</span>
                                  <span>경력 {applicant.previousWork}건</span>
                                  {applicant.appliedTime && (
                                    <span className="text-purple-600">{applicant.appliedTime}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                ₩{applicant.estimatedPrice.toLocaleString()}
                              </p>
                              <button className="mt-2 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                                상세보기
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">캠페인을 선택하면 AI 분석 결과를 확인할 수 있습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserDashboard;