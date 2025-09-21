// app/(advertiser)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Users, TrendingUp, Clock, DollarSign, Activity, 
  MapPin, Star, ChevronRight, Zap, Target, Award,
  BarChart3, Eye, MessageSquare, Share2, Heart,
  CheckCircle, XCircle, AlertCircle, Bell, Brain,
  Sparkles, Timer, ArrowUp, ArrowDown, Filter,
  Calendar, Settings, Plus, Send, Loader, Info,
  PieChart, CreditCard, FileText, Download, ChevronDown
} from 'lucide-react';

interface Applicant {
  id: string;
  name: string;
  avatar: string;
  username: string;
  followers: number;
  engagement: number;
  categories: string[];
  matchScore: number;
  aiScore: number;
  predictedROI: number;
  suggestedPrice: number;
  status: 'new' | 'reviewing' | 'accepted' | 'rejected';
  appliedAt: Date;
  portfolio: {
    avgViews: number;
    avgEngagement: number;
    completedCampaigns: number;
  };
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  applicants: Applicant[];
  budget: number;
  spent: number;
  startDate: Date;
  endDate: Date;
  category: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
  };
}

interface Notification {
  id: string;
  type: 'applicant' | 'milestone' | 'ai_insight' | 'payment';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

export default function AdvertiserDashboard() {
  const router = useRouter();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewing'>('new');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [aiInsights, setAIInsights] = useState<any>(null);
  
  // 실시간 데이터 시뮬레이션
  const [realtimeStats, setRealtimeStats] = useState({
    activeViewers: 127,
    todayApplicants: 23,
    avgResponseTime: '2시간 15분',
    conversionRate: 3.8
  });

  // 캠페인 데이터
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: '여름 시즌 프로모션',
      status: 'active',
      budget: 10000000,
      spent: 3500000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      category: '패션',
      metrics: {
        impressions: 450000,
        clicks: 12300,
        conversions: 234,
        roi: 285
      },
      applicants: [
        {
          id: '1',
          name: '김지연',
          avatar: '👩',
          username: '@jiyeon_style',
          followers: 42300,
          engagement: 7.2,
          categories: ['패션', '뷰티'],
          matchScore: 92,
          aiScore: 88,
          predictedROI: 320,
          suggestedPrice: 1500000,
          status: 'new',
          appliedAt: new Date(Date.now() - 1800000), // 30분 전
          portfolio: {
            avgViews: 85000,
            avgEngagement: 6.8,
            completedCampaigns: 12
          }
        },
        {
          id: '2',
          name: '이민호',
          avatar: '👨',
          username: '@minho_life',
          followers: 58900,
          engagement: 5.4,
          categories: ['라이프', '패션'],
          matchScore: 85,
          aiScore: 82,
          predictedROI: 280,
          suggestedPrice: 2000000,
          status: 'new',
          appliedAt: new Date(Date.now() - 3600000), // 1시간 전
          portfolio: {
            avgViews: 92000,
            avgEngagement: 5.2,
            completedCampaigns: 8
          }
        },
        {
          id: '3',
          name: '박서준',
          avatar: '🧑',
          username: '@seojun_daily',
          followers: 31200,
          engagement: 8.1,
          categories: ['일상', '패션'],
          matchScore: 78,
          aiScore: 75,
          predictedROI: 240,
          suggestedPrice: 1000000,
          status: 'reviewing',
          appliedAt: new Date(Date.now() - 7200000), // 2시간 전
          portfolio: {
            avgViews: 62000,
            avgEngagement: 7.9,
            completedCampaigns: 15
          }
        }
      ]
    }
  ]);

  // 실시간 알림 시뮬레이션 (30분, 2시간, n시간)
  useEffect(() => {
    // 30분 알림
    const timer30min = setTimeout(() => {
      addNotification({
        type: 'applicant',
        title: '🔥 새로운 지원자 3명',
        message: '여름 시즌 프로모션에 새로운 인플루언서가 지원했습니다',
        actionUrl: '/applicants'
      });
    }, 1800000); // 30분

    // 2시간 알림
    const timer2hour = setTimeout(() => {
      addNotification({
        type: 'ai_insight',
        title: '🤖 AI 분석 완료',
        message: 'AI가 추천하는 최적 인플루언서 조합을 확인하세요',
        actionUrl: '/ai-recommendations'
      });
    }, 7200000); // 2시간

    return () => {
      clearTimeout(timer30min);
      clearTimeout(timer2hour);
    };
  }, []);

  // 실시간 통계 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats(prev => ({
        activeViewers: prev.activeViewers + Math.floor(Math.random() * 10 - 5),
        todayApplicants: prev.todayApplicants + (Math.random() > 0.7 ? 1 : 0),
        avgResponseTime: prev.avgResponseTime,
        conversionRate: Number((prev.conversionRate + (Math.random() - 0.5) * 0.1).toFixed(1))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // 브라우저 알림 (권한 필요)
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      });
    }
  };

  const runAIAnalysis = async () => {
    setIsAIAnalyzing(true);
    
    // AI 분석 시뮬레이션
    setTimeout(() => {
      setAIInsights({
        optimalCombination: ['1', '3'], // 최적 조합
        predictedReach: 385000,
        predictedEngagement: 28500,
        predictedROI: 340,
        priceOptimization: {
          total: 2500000,
          breakdown: [
            { applicantId: '1', suggestedPrice: 1500000, reasoning: '높은 참여율' },
            { applicantId: '3', suggestedPrice: 1000000, reasoning: '비용 효율적' }
          ]
        },
        risks: [
          '타겟 연령층 불일치 가능성 15%',
          '예산 초과 리스크 낮음'
        ],
        recommendations: [
          '김지연님과 박서준님 조합 추천',
          '2주 캠페인 기간 최적',
          '릴스 중심 콘텐츠 제작 권장'
        ]
      });
      setIsAIAnalyzing(false);
    }, 3000);
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

  const campaign = campaigns[0]; // 현재 활성 캠페인

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 - 우버 스타일 */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">캠페인 대시보드</h1>
              <p className="text-sm text-gray-600">실시간 모니터링</p>
            </div>
            <div className="flex items-center gap-2">
              {/* 알림 버튼 */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Bell size={20} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 알림 패널 */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-4 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-900">알림</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-gray-500">새로운 알림이 없습니다</p>
              ) : (
                <div className="divide-y">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !notif.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setNotifications(prev =>
                          prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
                        );
                        if (notif.actionUrl) router.push(notif.actionUrl);
                      }}
                    >
                      <p className="font-medium text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 실시간 통계 카드 - 우버 스타일 */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <ArrowUp size={12} />
                실시간
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{realtimeStats.activeViewers}</p>
            <p className="text-xs text-gray-600">지금 보는 중</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-xs text-orange-600 font-medium">오늘</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{realtimeStats.todayApplicants}</p>
            <p className="text-xs text-gray-600">신규 지원자</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <Timer size={16} className="text-gray-400" />
            </div>
            <p className="text-lg font-bold text-gray-900">{realtimeStats.avgResponseTime}</p>
            <p className="text-xs text-gray-600">평균 응답</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <span className={`text-xs font-medium flex items-center gap-1 ${
                realtimeStats.conversionRate > 3.5 ? 'text-green-600' : 'text-red-600'
              }`}>
                {realtimeStats.conversionRate > 3.5 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {realtimeStats.conversionRate}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">전환율</p>
            <p className="text-xs text-gray-600">목표 대비</p>
          </motion.div>
        </div>
      </div>

      {/* 메인 캠페인 카드 */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">{campaign.name}</h2>
              <p className="text-purple-200">캠페인 진행 중</p>
            </div>
            <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              <span className="text-sm font-medium">D-{Math.ceil((campaign.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}</span>
            </div>
          </div>

          {/* 예산 진행률 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>예산 사용</span>
              <span>{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
              />
            </div>
          </div>

          {/* 주요 지표 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <p className="text-xs text-purple-200 mb-1">노출</p>
              <p className="text-lg font-bold">{formatNumber(campaign.metrics.impressions)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <p className="text-xs text-purple-200 mb-1">클릭</p>
              <p className="text-lg font-bold">{formatNumber(campaign.metrics.clicks)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <p className="text-xs text-purple-200 mb-1">ROI</p>
              <p className="text-lg font-bold">{campaign.metrics.roi}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI 분석 섹션 */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">AI 매칭 분석</h3>
            </div>
            <button
              onClick={runAIAnalysis}
              disabled={isAIAnalyzing}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isAIAnalyzing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI 분석 시작
                </>
              )}
            </button>
          </div>

          {aiInsights ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* AI 추천 조합 */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  최적 인플루언서 조합
                </h4>
                <div className="space-y-2">
                  {aiInsights.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 예상 성과 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-1">예상 도달</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(aiInsights.predictedReach)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-1">예상 ROI</p>
                  <p className="text-xl font-bold text-green-600">
                    {aiInsights.predictedROI}%
                  </p>
                </div>
              </div>

              {/* 단가 예측 */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">단가 최적화</h4>
                <div className="space-y-2">
                  {aiInsights.priceOptimization.breakdown.map((item: any, idx: number) => {
                    const applicant = campaign.applicants.find(a => a.id === item.applicantId);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{applicant?.avatar}</span>
                          <div>
                            <p className="font-medium text-gray-900">{applicant?.name}</p>
                            <p className="text-xs text-gray-600">{item.reasoning}</p>
                          </div>
                        </div>
                        <span className="font-bold text-purple-600">
                          {formatCurrency(item.suggestedPrice)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">AI 분석을 시작하여 최적의 인플루언서를 찾아보세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 지원자 리스트 */}
      <div className="px-4 pb-20">
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">실시간 지원자</h3>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                <option value="all">전체</option>
                <option value="new">신규</option>
                <option value="reviewing">검토중</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {campaign.applicants
              .filter(a => filterStatus === 'all' || a.status === filterStatus)
              .map((applicant) => (
              <motion.div
                key={applicant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedApplicant(applicant)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="text-3xl">{applicant.avatar}</span>
                      {applicant.status === 'new' && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{applicant.name}</p>
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                          매칭 {applicant.matchScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span>{formatNumber(applicant.followers)} 팔로워</span>
                        <span>{applicant.engagement}% 참여율</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-purple-600">
                      {formatCurrency(applicant.suggestedPrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.floor((Date.now() - applicant.appliedAt.getTime()) / 60000)}분 전
                    </p>
                  </div>
                </div>

                {/* AI 점수 바 */}
                <div className="mt-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-2"
                      style={{ width: `${applicant.aiScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    AI {applicant.aiScore}점
                  </span>
                </div>

                {/* 빠른 액션 */}
                <div className="mt-3 flex items-center gap-2">
                  <button className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                    수락
                  </button>
                  <button className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                    보류
                  </button>
                  <button className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                    <MessageSquare size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 지원자 상세 모달 */}
      <AnimatePresence>
        {selectedApplicant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setSelectedApplicant(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">지원자 상세 정보</h2>
                  <button onClick={() => setSelectedApplicant(null)}>
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-8 overflow-y-auto max-h-[70vh]">
                {/* 프로필 헤더 */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl">{selectedApplicant.avatar}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedApplicant.name}</h3>
                    <p className="text-gray-600">{selectedApplicant.username}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedApplicant.categories.map((cat, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI 분석 결과 */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI 분석 결과
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">AI 매칭 점수</p>
                      <p className="text-2xl font-bold text-purple-600">{selectedApplicant.aiScore}점</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">예상 ROI</p>
                      <p className="text-2xl font-bold text-green-600">{selectedApplicant.predictedROI}%</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">추천 단가:</span> {formatCurrency(selectedApplicant.suggestedPrice)}
                    </p>
                  </div>
                </div>

                {/* 포트폴리오 통계 */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">포트폴리오 성과</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">평균 조회수</p>
                      <p className="text-lg font-bold">{formatNumber(selectedApplicant.portfolio.avgViews)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">평균 참여율</p>
                      <p className="text-lg font-bold">{selectedApplicant.portfolio.avgEngagement}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">완료 캠페인</p>
                      <p className="text-lg font-bold">{selectedApplicant.portfolio.completedCampaigns}</p>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    승인하기
                  </button>
                  <button className="py-3 px-4 bg-purple-100 text-purple-700 rounded-xl font-medium">
                    <MessageSquare size={20} />
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