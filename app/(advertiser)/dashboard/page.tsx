import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, TrendingUp, DollarSign, Activity, Eye, Heart, MessageCircle,
  Share2, MapPin, Clock, Award, Zap, Target, ArrowUp, ArrowDown,
  ChevronRight, Bell, Settings, Plus, Filter, Calendar, Download,
  BarChart3, PieChart, LineChart, Sparkles
} from 'lucide-react';

// 타입 정의
interface InfluencerMatch {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  engagement: number;
  matchScore: number;
  status: 'pending' | 'accepted' | 'active' | 'completed';
  location: string;
  categories: string[];
  currentActivity?: string;
  lastActive?: string;
}

interface CampaignMetrics {
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  roi: number;
  reach: number;
  trend: 'up' | 'down' | 'stable';
}

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'matching' | 'in_progress' | 'completed';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  influencers: InfluencerMatch[];
  metrics: CampaignMetrics;
}

// 샘플 데이터
const sampleCampaign: Campaign = {
  id: '1',
  name: '2024 나이키 에어맥스 신제품 런칭',
  status: 'in_progress',
  budget: 5000000,
  spent: 1850000,
  startDate: '2024-02-01',
  endDate: '2024-03-01',
  influencers: [
    {
      id: '1',
      name: '김패션',
      avatar: 'https://i.pravatar.cc/150?img=47',
      followers: 85000,
      engagement: 4.8,
      matchScore: 92,
      status: 'active',
      location: '서울',
      categories: ['패션', '라이프스타일'],
      currentActivity: '콘텐츠 제작 중',
      lastActive: '5분 전'
    },
    {
      id: '2',
      name: '이뷰티',
      avatar: 'https://i.pravatar.cc/150?img=25',
      followers: 120000,
      engagement: 5.2,
      matchScore: 85,
      status: 'active',
      location: '서울',
      categories: ['뷰티', '패션'],
      currentActivity: '스토리 업로드',
      lastActive: '방금'
    },
    {
      id: '3',
      name: '박스타일',
      avatar: 'https://i.pravatar.cc/150?img=13',
      followers: 65000,
      engagement: 6.2,
      matchScore: 78,
      status: 'pending',
      location: '부산',
      categories: ['패션', '스포츠'],
      lastActive: '1시간 전'
    }
  ],
  metrics: {
    impressions: 425000,
    engagement: 18500,
    clicks: 3200,
    conversions: 142,
    roi: 235,
    reach: 380000,
    trend: 'up'
  }
};

export default function RealtimeAdvertiserDashboard() {
  const [campaign] = useState<Campaign>(sampleCampaign);
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerMatch | null>(null);
  const [liveMetrics, setLiveMetrics] = useState(campaign.metrics);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // 실시간 메트릭 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        ...prev,
        impressions: prev.impressions + Math.floor(Math.random() * 100),
        engagement: prev.engagement + Math.floor(Math.random() * 10),
        clicks: prev.clicks + Math.floor(Math.random() * 5),
        conversions: prev.conversions + (Math.random() > 0.8 ? 1 : 0),
        reach: prev.reach + Math.floor(Math.random() * 80)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 실시간 알림 시뮬레이션
  useEffect(() => {
    const notifications = [
      '@kimfashion님이 새 릴스를 업로드했습니다',
      '목표 도달률 85% 달성!',
      '@beautylee님의 콘텐츠가 트렌딩 중입니다',
      'ROI가 200%를 돌파했습니다!'
    ];

    const interval = setInterval(() => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      setNotifications(prev => [randomNotification, ...prev.slice(0, 2)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const spentPercentage = (campaign.spent / campaign.budget) * 100;
  const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ITDA Business
              </h1>
              <div className="hidden md:flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">실시간 모니터링 중</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 캠페인 오버뷰 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{campaign.name}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  진행 중
                </span>
                <span className="text-gray-600 flex items-center gap-1">
                  <Clock size={16} />
                  {daysLeft}일 남음
                </span>
                <span className="text-gray-600 flex items-center gap-1">
                  <MapPin size={16} />
                  전국
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button
                onClick={() => setShowAIInsights(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles size={18} />
                AI 인사이트
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center gap-2">
                <Download size={18} />
                리포트
              </button>
            </div>
          </div>

          {/* 예산 사용 현황 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">예산 사용률</span>
              <span className="text-sm font-bold text-gray-900">
                ₩{campaign.spent.toLocaleString()} / ₩{campaign.budget.toLocaleString()}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${spentPercentage}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {spentPercentage.toFixed(1)}% 사용 • 일일 평균 ₩{Math.floor(campaign.spent / 10).toLocaleString()}
            </div>
          </div>
        </div>

        {/* 실시간 메트릭 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={<Eye />}
            label="노출수"
            value={liveMetrics.impressions.toLocaleString()}
            change="+12.5%"
            trend="up"
            color="purple"
          />
          <MetricCard
            icon={<Heart />}
            label="참여"
            value={liveMetrics.engagement.toLocaleString()}
            change="+8.2%"
            trend="up"
            color="pink"
          />
          <MetricCard
            icon={<Target />}
            label="전환"
            value={liveMetrics.conversions.toLocaleString()}
            change="+15.3%"
            trend="up"
            color="green"
          />
          <MetricCard
            icon={<TrendingUp />}
            label="ROI"
            value={`${liveMetrics.roi}%`}
            change="+23.1%"
            trend="up"
            color="orange"
          />
        </div>

        {/* 인플루언서 실시간 현황 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">인플루언서 활동 현황</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">실시간 업데이트</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="space-y-4">
            {campaign.influencers.map((influencer) => (
              <motion.div
                key={influencer.id}
                className="border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedInfluencer(influencer)}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={influencer.avatar}
                        alt={influencer.name}
                        className="w-12 h-12 rounded-full"
                      />
                      {influencer.status === 'active' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{influencer.name}</div>
                      <div className="text-sm text-gray-600">
                        {influencer.followers.toLocaleString()} 팔로워 • {influencer.engagement}% 참여율
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {influencer.currentActivity && (
                      <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                        <Activity size={14} className="text-blue-600" />
                        <span className="text-sm text-blue-700">{influencer.currentActivity}</span>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        매치 {influencer.matchScore}%
                      </div>
                      <div className="text-xs text-gray-500">{influencer.lastActive}</div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>

                {/* 미니 활동 그래프 */}
                <div className="mt-4 flex items-center gap-1">
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gray-200 rounded-sm overflow-hidden"
                      style={{ height: Math.random() * 20 + 5 }}
                    >
                      <div
                        className="w-full bg-gradient-to-t from-purple-600 to-pink-600"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 실시간 알림 */}
        <AnimatePresence>
          {notifications.map((notification, idx) => (
            <motion.div
              key={`${notification}-${idx}`}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{notification}</div>
                  <div className="text-xs text-gray-500 mt-1">방금 전</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI 인사이트 모달 */}
        <AnimatePresence>
          {showAIInsights && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAIInsights(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-purple-600" />
                    AI 인사이트
                  </h3>
                  <button
                    onClick={() => setShowAIInsights(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <InsightCard
                    type="success"
                    title="최고 성과 인플루언서"
                    content="@beautylee님의 콘텐츠가 평균 대비 156% 높은 참여율을 기록하고 있습니다. 유사한 프로필의 인플루언서를 추가 모집하는 것을 추천합니다."
                  />
                  <InsightCard
                    type="warning"
                    title="예산 최적화 제안"
                    content="현재 속도로는 캠페인 종료 7일 전에 예산이 소진될 예정입니다. 일일 예산을 15% 줄이거나 기간을 5일 연장하는 것을 고려해보세요."
                  />
                  <InsightCard
                    type="info"
                    title="트렌드 분석"
                    content="오후 7-9시 사이에 업로드된 콘텐츠의 참여율이 43% 높습니다. 이 시간대에 콘텐츠 업로드를 집중하면 효과를 극대화할 수 있습니다."
                  />
                  <InsightCard
                    type="success"
                    title="ROI 예측"
                    content="현재 추세가 유지된다면 최종 ROI는 285%에 도달할 것으로 예상됩니다. 업계 평균 150%를 크게 상회하는 성과입니다."
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// 메트릭 카드 컴포넌트
interface MetricCardProps {
  icon: React.ReactElement;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  color: 'purple' | 'pink' | 'green' | 'orange';
}

function MetricCard({ icon, label, value, change, trend, color }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          {change}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </motion.div>
  );
}

// 인사이트 카드 컴포넌트
interface InsightCardProps {
  type: 'success' | 'warning' | 'info';
  title: string;
  content: string;
}

function InsightCard({ type, title, content }: InsightCardProps) {
  const typeClasses: Record<string, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconMap: Record<string, React.ReactElement> = {
    success: <Award className="text-green-600" size={20} />,
    warning: <Zap className="text-yellow-600" size={20} />,
    info: <Target className="text-blue-600" size={20} />
  };

  return (
    <div className={`border rounded-xl p-4 ${typeClasses[type]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{iconMap[type]}</div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm opacity-90">{content}</p>
        </div>
      </div>
    </div>
  );
}