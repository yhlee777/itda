"use client";
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Brain, TrendingUp, Users, DollarSign, Target, Award,
  BarChart, PieChart, Activity, Zap, Bot, Sparkles,
  ChevronRight, ChevronDown, Filter, Search, Download,
  CheckCircle, AlertCircle, Clock, Star, MessageCircle,
  Eye, Heart, Share2, BookOpen, Video, Camera,
  ArrowUp, ArrowDown, Minus, RefreshCw, Settings,
  Bell, Mail, Calendar, MapPin, Globe, Instagram,
  Youtube, Twitter, Linkedin, ChevronLeft
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AIPricePredictor } from '@/lib/ai/price-predictor';
import { AIAnalyzer } from '@/lib/ai/analyzer';
import { toast } from 'react-hot-toast';

interface Applicant {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  engagementRate: number;
  categories: string[];
  completedCampaigns: number;
  avgRating: number;
  appliedAt: Date;
  proposedPrice: number;
  aiScore: number;
  aiPredictedPrice: number;
  priceConfidence: number;
  platforms: {
    instagram?: { followers: number; posts: number };
    youtube?: { subscribers: number; videos: number };
    tiktok?: { followers: number; videos: number };
  };
  demographics: {
    gender: { male: number; female: number };
    age: { '18-24': number; '25-34': number; '35-44': number; '45+': number };
    location: { [key: string]: number };
  };
  performance: {
    avgReach: number;
    avgImpressions: number;
    avgClicks: number;
    avgConversions: number;
  };
}

interface Campaign {
  id: string;
  name: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  categories: string[];
  applicantCount: number;
  viewCount: number;
  status: 'active' | 'closed' | 'completed';
}

export default function AIAnalyticsDashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  // 상태 관리
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applicants' | 'ai-insights'>('overview');
  
  // 필터 상태
  const [filters, setFilters] = useState({
    minFollowers: 0,
    minEngagement: 0,
    category: 'all',
    sortBy: 'aiScore' as 'aiScore' | 'followers' | 'engagementRate' | 'proposedPrice'
  });
  
  // AI 분석 결과
  const [aiInsights, setAIInsights] = useState({
    recommendedApplicants: [] as Applicant[],
    optimalPrice: 0,
    estimatedROI: 0,
    successProbability: 0,
    marketTrends: [] as { date: string; avgPrice: number }[],
    competitorAnalysis: [] as { brand: string; avgPrice: number; campaigns: number }[]
  });

  // 알림 스케줄
  const [notificationSchedule] = useState([
    { time: '30분 후', sent: true, count: 15 },
    { time: '2시간 후', sent: true, count: 32 },
    { time: '6시간 후', sent: false, count: 0 },
    { time: '24시간 후', sent: false, count: 0 }
  ]);

  useEffect(() => {
    loadCampaignData();
    loadApplicants();
    performAIAnalysis();
  }, []);

  // 캠페인 데이터 로드
  const loadCampaignData = async () => {
    // 실제로는 URL 파라미터나 props로 받음
    setCampaign({
      id: '1',
      name: '2024 여름 컬렉션 프로모션',
      budget: 50000000,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-28'),
      categories: ['패션', '라이프스타일'],
      applicantCount: 47,
      viewCount: 328,
      status: 'active'
    });
  };

  // 지원자 로드
  const loadApplicants = async () => {
    setIsLoading(true);
    
    // 샘플 데이터 (실제로는 API에서)
    const sampleApplicants: Applicant[] = [
      {
        id: '1',
        name: '김패션',
        avatar: 'https://i.pravatar.cc/150?img=1',
        followers: 125000,
        engagementRate: 4.8,
        categories: ['패션', '뷰티'],
        completedCampaigns: 23,
        avgRating: 4.7,
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        proposedPrice: 3500000,
        aiScore: 92,
        aiPredictedPrice: 3800000,
        priceConfidence: 85,
        platforms: {
          instagram: { followers: 125000, posts: 450 },
          youtube: { subscribers: 45000, videos: 120 }
        },
        demographics: {
          gender: { male: 25, female: 75 },
          age: { '18-24': 35, '25-34': 45, '35-44': 15, '45+': 5 },
          location: { '서울': 60, '경기': 20, '부산': 10, '기타': 10 }
        },
        performance: {
          avgReach: 45000,
          avgImpressions: 180000,
          avgClicks: 5400,
          avgConversions: 162
        }
      },
      {
        id: '2',
        name: '이뷰티',
        avatar: 'https://i.pravatar.cc/150?img=2',
        followers: 87000,
        engagementRate: 6.2,
        categories: ['뷰티', '라이프스타일'],
        completedCampaigns: 15,
        avgRating: 4.9,
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        proposedPrice: 2800000,
        aiScore: 88,
        aiPredictedPrice: 2900000,
        priceConfidence: 78,
        platforms: {
          instagram: { followers: 87000, posts: 680 },
          tiktok: { followers: 120000, videos: 240 }
        },
        demographics: {
          gender: { male: 15, female: 85 },
          age: { '18-24': 55, '25-34': 30, '35-44': 10, '45+': 5 },
          location: { '서울': 50, '경기': 25, '인천': 10, '기타': 15 }
        },
        performance: {
          avgReach: 35000,
          avgImpressions: 140000,
          avgClicks: 4200,
          avgConversions: 126
        }
      },
      {
        id: '3',
        name: '박라이프',
        avatar: 'https://i.pravatar.cc/150?img=3',
        followers: 234000,
        engagementRate: 3.5,
        categories: ['라이프스타일', '여행'],
        completedCampaigns: 45,
        avgRating: 4.5,
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
        proposedPrice: 4500000,
        aiScore: 85,
        aiPredictedPrice: 4200000,
        priceConfidence: 72,
        platforms: {
          instagram: { followers: 234000, posts: 890 },
          youtube: { subscribers: 89000, videos: 200 }
        },
        demographics: {
          gender: { male: 40, female: 60 },
          age: { '18-24': 25, '25-34': 40, '35-44': 25, '45+': 10 },
          location: { '서울': 45, '경기': 30, '제주': 10, '기타': 15 }
        },
        performance: {
          avgReach: 78000,
          avgImpressions: 312000,
          avgClicks: 9360,
          avgConversions: 281
        }
      }
    ];
    
    setApplicants(sampleApplicants);
    setFilteredApplicants(sampleApplicants);
    setIsLoading(false);
  };

  // AI 분석 수행
  const performAIAnalysis = async () => {
    // AI 분석 시뮬레이션
    setTimeout(() => {
      setAIInsights({
        recommendedApplicants: applicants.slice(0, 3),
        optimalPrice: 3500000,
        estimatedROI: 285,
        successProbability: 87,
        marketTrends: [
          { date: '2024-01', avgPrice: 3200000 },
          { date: '2024-02', avgPrice: 3500000 },
          { date: '2024-03', avgPrice: 3800000 }
        ],
        competitorAnalysis: [
          { brand: '아디다스', avgPrice: 4200000, campaigns: 12 },
          { brand: '유니클로', avgPrice: 2800000, campaigns: 8 },
          { brand: 'ZARA', avgPrice: 3600000, campaigns: 15 }
        ]
      });
      
      toast.success('AI 분석이 완료되었습니다!', { icon: '🤖' });
    }, 2000);
  };

  // 필터 적용
  const applyFilters = () => {
    let filtered = [...applicants];
    
    if (filters.minFollowers > 0) {
      filtered = filtered.filter(a => a.followers >= filters.minFollowers);
    }
    
    if (filters.minEngagement > 0) {
      filtered = filtered.filter(a => a.engagementRate >= filters.minEngagement);
    }
    
    if (filters.category !== 'all') {
      filtered = filtered.filter(a => a.categories.includes(filters.category));
    }
    
    // 정렬
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'aiScore':
          return b.aiScore - a.aiScore;
        case 'followers':
          return b.followers - a.followers;
        case 'engagementRate':
          return b.engagementRate - a.engagementRate;
        case 'proposedPrice':
          return a.proposedPrice - b.proposedPrice;
        default:
          return 0;
      }
    });
    
    setFilteredApplicants(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, applicants]);

  // 지원자 선택
  const selectApplicant = async (applicantId: string) => {
    // AI 협상 시뮬레이션
    toast.loading('AI가 최적 조건을 분석중...', { duration: 2000 });
    
    setTimeout(() => {
      toast.success('협상 전략이 준비되었습니다!', { icon: '💡' });
      router.push(`/chat?applicant=${applicantId}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">AI 캠페인 분석</h1>
                {campaign && (
                  <p className="text-sm text-gray-600">{campaign.name}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={performAIAnalysis}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
              >
                <RefreshCw className="w-4 h-4" />
                재분석
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
          
          {/* 탭 */}
          <div className="flex gap-6 mt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                개요
              </div>
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'applicants'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                지원자 ({applicants.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('ai-insights')}
              className={`pb-3 px-1 border-b-2 transition-colors relative ${
                activeTab === 'ai-insights'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI 인사이트
                <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 알림 타임라인 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-sm font-semibold text-purple-700 whitespace-nowrap">
              알림 일정
            </span>
            {notificationSchedule.map((schedule, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  schedule.sent
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {schedule.sent ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                <span>{schedule.time}</span>
                {schedule.sent && (
                  <span className="font-bold">{schedule.count}명</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 통계 카드들 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold">{applicants.length}</span>
              </div>
              <p className="text-sm text-gray-600">총 지원자</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">32% vs 평균</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold">
                  {(aiInsights.optimalPrice / 1000000).toFixed(1)}M
                </span>
              </div>
              <p className="text-sm text-gray-600">AI 추천 단가</p>
              <div className="flex items-center gap-1 mt-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-purple-600">예산 대비 70%</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold">{aiInsights.estimatedROI}%</span>
              </div>
              <p className="text-sm text-gray-600">예상 ROI</p>
              <div className="flex items-center gap-1 mt-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-blue-600">업계 평균 180%</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold">{aiInsights.successProbability}%</span>
              </div>
              <p className="text-sm text-gray-600">성공 확률</p>
              <div className="flex items-center gap-1 mt-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-orange-600">매우 높음</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* 지원자 탭 */}
        {activeTab === 'applicants' && (
          <div>
            {/* 필터 섹션 */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="이름으로 검색..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
                
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600"
                >
                  <option value="all">모든 카테고리</option>
                  <option value="패션">패션</option>
                  <option value="뷰티">뷰티</option>
                  <option value="라이프스타일">라이프스타일</option>
                </select>
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600"
                >
                  <option value="aiScore">AI 점수순</option>
                  <option value="followers">팔로워순</option>
                  <option value="engagementRate">참여율순</option>
                  <option value="proposedPrice">제안가순</option>
                </select>
                
                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  고급 필터
                </button>
              </div>
            </div>

            {/* 지원자 리스트 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplicants.map((applicant) => (
                <motion.div
                  key={applicant.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedApplicant(applicant)}
                >
                  {/* AI 점수 배지 */}
                  <div className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Bot className="w-4 h-4" />
                        {applicant.aiScore}점
                      </div>
                    </div>
                    
                    {/* 프로필 헤더 */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={applicant.avatar}
                          alt={applicant.name}
                          className="w-16 h-16 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{applicant.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Users className="w-4 h-4" />
                            <span>{(applicant.followers / 1000).toFixed(0)}K</span>
                            <span className="text-gray-400">•</span>
                            <Activity className="w-4 h-4" />
                            <span>{applicant.engagementRate}%</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {applicant.categories.map((cat, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 가격 정보 */}
                    <div className="px-6 py-3 bg-gray-50 border-y">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">제안가</p>
                          <p className="font-bold">₩{applicant.proposedPrice.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">AI 예측가</p>
                          <p className="font-bold text-purple-600">
                            ₩{applicant.aiPredictedPrice.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600">
                            신뢰도 {applicant.priceConfidence}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* 플랫폼 정보 */}
                    <div className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        {applicant.platforms.instagram && (
                          <div className="flex items-center gap-1">
                            <Instagram className="w-4 h-4 text-pink-600" />
                            <span className="text-sm">
                              {(applicant.platforms.instagram.followers / 1000).toFixed(0)}K
                            </span>
                          </div>
                        )}
                        {applicant.platforms.youtube && (
                          <div className="flex items-center gap-1">
                            <Youtube className="w-4 h-4 text-red-600" />
                            <span className="text-sm">
                              {(applicant.platforms.youtube.subscribers / 1000).toFixed(0)}K
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{applicant.avgRating}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="px-6 py-4 bg-gray-50 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectApplicant(applicant.id);
                        }}
                        className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                      >
                        협상 시작
                      </button>
                      <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* AI 인사이트 탭 */}
        {activeTab === 'ai-insights' && (
          <div className="space-y-6">
            {/* AI 추천 섹션 */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-8 h-8" />
                <h2 className="text-2xl font-bold">AI 추천 결과</h2>
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiInsights.recommendedApplicants.slice(0, 3).map((applicant, idx) => (
                  <div key={applicant.id} className="bg-white/20 backdrop-blur rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl font-bold">#{idx + 1}</span>
                      <img
                        src={applicant.avatar}
                        alt={applicant.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-bold">{applicant.name}</p>
                        <p className="text-sm opacity-90">매치율 {applicant.aiScore}%</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-75">예상 도달</span>
                        <span className="font-medium">
                          {(applicant.performance.avgReach / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="opacity-75">예상 전환</span>
                        <span className="font-medium">
                          {applicant.performance.avgConversions}건
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 시장 트렌드 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                시장 가격 트렌드
              </h3>
              
              <div className="h-64 flex items-end justify-between gap-2">
                {aiInsights.marketTrends.map((trend, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-purple-200 rounded-t"
                      style={{ 
                        height: `${(trend.avgPrice / 5000000) * 100}%`,
                        background: `linear-gradient(to top, #8b5cf6, #ec4899)`
                      }}
                    />
                    <p className="text-xs mt-2">{trend.date}</p>
                    <p className="text-xs font-bold">
                      {(trend.avgPrice / 1000000).toFixed(1)}M
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 경쟁사 분석 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-purple-600" />
                경쟁사 캠페인 분석
              </h3>
              
              <div className="space-y-3">
                {aiInsights.competitorAnalysis.map((competitor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
                        {competitor.brand.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{competitor.brand}</p>
                        <p className="text-sm text-gray-600">{competitor.campaigns}개 캠페인</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₩{competitor.avgPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">평균 단가</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 선택된 지원자 상세 모달 */}
      <AnimatePresence>
        {selectedApplicant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedApplicant(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 내용 */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">인플루언서 상세 분석</h2>
                  <button
                    onClick={() => setSelectedApplicant(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* 프로필 섹션 */}
                <div className="flex items-start gap-6 mb-6">
                  <img
                    src={selectedApplicant.avatar}
                    alt={selectedApplicant.name}
                    className="w-24 h-24 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{selectedApplicant.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">팔로워</span>
                        <p className="font-bold">{selectedApplicant.followers.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">참여율</span>
                        <p className="font-bold">{selectedApplicant.engagementRate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">완료 캠페인</span>
                        <p className="font-bold">{selectedApplicant.completedCampaigns}개</p>
                      </div>
                      <div>
                        <span className="text-gray-500">평균 평점</span>
                        <p className="font-bold">⭐ {selectedApplicant.avgRating}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {selectedApplicant.aiScore}점
                    </div>
                    <p className="text-sm text-gray-500">AI 매칭 점수</p>
                  </div>
                </div>
                
                {/* 상세 분석 탭 */}
                <div className="space-y-6">
                  {/* 오디언스 분석 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-bold mb-3">오디언스 분석</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">성별 분포</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>여성</span>
                            <span className="font-medium">{selectedApplicant.demographics.gender.female}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>남성</span>
                            <span className="font-medium">{selectedApplicant.demographics.gender.male}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-2">연령대</p>
                        <div className="space-y-1">
                          {Object.entries(selectedApplicant.demographics.age).map(([age, percent]) => (
                            <div key={age} className="flex items-center justify-between text-sm">
                              <span>{age}</span>
                              <span className="font-medium">{percent}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-2">지역</p>
                        <div className="space-y-1">
                          {Object.entries(selectedApplicant.demographics.location)
                            .slice(0, 3)
                            .map(([location, percent]) => (
                              <div key={location} className="flex items-center justify-between text-sm">
                                <span>{location}</span>
                                <span className="font-medium">{percent}%</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 성과 예측 */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold mb-3">AI 성과 예측</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">예상 도달</p>
                        <p className="text-xl font-bold">{selectedApplicant.performance.avgReach.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">예상 노출</p>
                        <p className="text-xl font-bold">{selectedApplicant.performance.avgImpressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">예상 클릭</p>
                        <p className="text-xl font-bold">{selectedApplicant.performance.avgClicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">예상 전환</p>
                        <p className="text-xl font-bold text-green-600">{selectedApplicant.performance.avgConversions}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => selectApplicant(selectedApplicant.id)}
                      className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                    >
                      협상 시작하기
                    </button>
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
                      보류
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}