import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, TrendingUp, Clock, DollarSign, Award, Bell, 
  CheckCircle, XCircle, Eye, MessageCircle, Zap, Brain,
  Filter, ChevronRight, Star, Activity, ArrowUp, ArrowDown,
  Sparkles, AlertCircle, BarChart3, Target, UserCheck
} from 'lucide-react';

const AdvertiserDashboard = () => {
  // 상태 관리
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [realtimeStats, setRealtimeStats] = useState({
    viewing: 0,
    applied: 0,
    conversion: 0,
    trending: false
  });
  const [filterMode, setFilterMode] = useState('ai'); // 'all', 'ai', 'new'
  const [notifications, setNotifications] = useState([]);

  // 실시간 데이터 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats(prev => ({
        viewing: Math.max(0, prev.viewing + Math.floor(Math.random() * 3) - 1),
        applied: prev.applied + (Math.random() > 0.7 ? 1 : 0),
        conversion: ((prev.applied + 1) / (prev.viewing + 10) * 100).toFixed(1),
        trending: Math.random() > 0.8
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 캠페인 데이터
  const campaigns = [
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

  // AI 추천 인플루언서
  const getAIRecommendations = (campaignId) => {
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
        aiInsight: '과거 유사 캠페인에서 평균 대비 2.5배 높은 성과 기록'
      },
      {
        id: 2,
        name: '이패션',
        avatar: '👗',
        followers: 87000,
        engagement: 6.2,
        matchScore: 88,
        estimatedPrice: 1000000,
        strongPoints: ['높은 충성도', '패션 카테고리 전문'],
        risk: 'low',
        roi: 2.8,
        aiInsight: '팔로워 성장률 월 12%, 떠오르는 인플루언서'
      },
      {
        id: 3,
        name: '박라이프',
        avatar: '🏡',
        followers: 203000,
        engagement: 3.9,
        matchScore: 82,
        estimatedPrice: 2000000,
        strongPoints: ['대규모 리치', '다양한 콘텐츠'],
        risk: 'medium',
        roi: 2.1,
        aiInsight: '광범위한 도달력, 브랜드 인지도 향상에 효과적'
      }
    ];
  };

  // 실시간 알림
  const recentNotifications = [
    { id: 1, type: 'application', message: 'VIP 인플루언서가 지원했습니다', time: '방금', priority: 'high' },
    { id: 2, type: 'milestone', message: '목표 지원자 수 50% 달성', time: '5분 전', priority: 'medium' },
    { id: 3, type: 'ai', message: 'AI가 3명의 최적 후보를 찾았습니다', time: '30분 전', priority: 'high' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ITDA Business
              </h1>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                실시간 모니터링 중
              </span>
            </div>
            
            {/* 실시간 지표 */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">{realtimeStats.viewing}명 보는중</span>
              </div>
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* 메인 대시보드 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 왼쪽: 캠페인 리스트 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                진행중인 캠페인
              </h2>
              
              {campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className={`p-4 rounded-lg mb-3 cursor-pointer transition-all ${
                    selectedCampaign?.id === campaign.id 
                      ? 'bg-purple-50 border-2 border-purple-500' 
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        마감: {campaign.endDate}
                      </p>
                    </div>
                    {campaign.aiScore > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                        <Brain className="w-3 h-3" />
                        <span className="text-xs font-bold">{campaign.aiScore}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 진행 상태 바 */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>예산 사용</span>
                      <span>{((campaign.spent / campaign.budget) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* 통계 */}
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span>{campaign.views}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <Users className="w-4 h-4" />
                      <span>{campaign.applicants}명 지원</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 중앙: AI 추천 & 지원자 목록 */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI 인사이트 카드 */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Brain className="w-6 h-6" />
                    AI 실시간 분석
                  </h3>
                  <p className="text-purple-100">
                    현재까지 {realtimeStats.applied}명 지원 • 전환율 {realtimeStats.conversion}%
                    {realtimeStats.trending && ' 🔥 급상승 중'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">3.2x</div>
                  <div className="text-sm text-purple-200">예상 ROI</div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">
                  AI 추천: "오후 2-4시 사이 지원자 품질이 가장 높습니다"
                </span>
              </div>
            </div>

            {/* 필터 탭 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {[
                    { id: 'ai', label: 'AI 추천', icon: Brain, count: 3 },
                    { id: 'new', label: '신규', icon: Zap, count: 5 },
                    { id: 'all', label: '전체', icon: Users, count: 24 }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterMode(filter.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                        filterMode === filter.id 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <filter.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{filter.label}</span>
                      <span className="text-xs bg-white px-1.5 py-0.5 rounded-full">
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
                
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  상세 필터 →
                </button>
              </div>

              {/* AI 추천 인플루언서 카드 */}
              <div className="space-y-3">
                {getAIRecommendations(selectedCampaign?.id || 1).map(influencer => (
                  <div key={influencer.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{influencer.avatar}</div>
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            {influencer.name}
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                              매칭 {influencer.matchScore}%
                            </span>
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <span>{influencer.followers.toLocaleString()} 팔로워</span>
                            <span>참여율 {influencer.engagement}%</span>
                            <span className="text-green-600 font-medium">
                              ROI {influencer.roi}x
                            </span>
                          </div>
                          
                          {/* AI 인사이트 */}
                          <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-700 flex items-start gap-1">
                              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {influencer.aiInsight}
                            </p>
                          </div>
                          
                          {/* 강점 태그 */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {influencer.strongPoints.map((point, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {point}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* 액션 버튼 */}
                      <div className="flex flex-col gap-2">
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                          즉시 승인
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm">
                          상세보기
                        </button>
                      </div>
                    </div>
                    
                    {/* 예상 비용 */}
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-sm text-gray-600">예상 비용</span>
                      <span className="font-bold text-lg text-gray-900">
                        ₩{influencer.estimatedPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 더보기 */}
              <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-all text-sm font-medium">
                더 많은 인플루언서 보기 →
              </button>
            </div>
          </div>
        </div>

        {/* 하단: 실시간 알림 바 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {recentNotifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    notif.priority === 'high' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{notif.message}</span>
                  <span className="text-xs opacity-60">{notif.time}</span>
                </div>
              ))}
            </div>
            
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              AI 어시스턴트와 상담
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserDashboard;