// components/advertiser/RealtimeDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, TrendingUp, Clock, DollarSign, Activity, 
  MapPin, Star, ChevronRight, Zap, Target, Award,
  BarChart3, Eye, MessageSquare, Share2, Heart,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

interface MatchingStatus {
  status: 'idle' | 'searching' | 'matching' | 'completed';
  progress: number;
  message: string;
  foundCount: number;
  analyzedCount: number;
}

interface Influencer {
  id: string;
  name: string;
  avatar: string;
  username: string;
  followers: number;
  engagement: number;
  categories: string[];
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  location: string;
  tier: 'standard' | 'gold' | 'premium';
}

interface CampaignMetrics {
  impressions: number;
  clicks: number;
  engagement: number;
  conversions: number;
  spend: number;
  roi: number;
}

export default function RealtimeDashboard() {
  const [matchingStatus, setMatchingStatus] = useState<MatchingStatus>({
    status: 'idle',
    progress: 0,
    message: 'AI 매칭을 시작하세요',
    foundCount: 0,
    analyzedCount: 0
  });

  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [metrics, setMetrics] = useState<CampaignMetrics>({
    impressions: 125430,
    clicks: 8932,
    engagement: 15234,
    conversions: 342,
    spend: 3500000,
    roi: 285
  });

  // 실시간 매칭 시뮬레이션
  const startMatching = () => {
    setMatchingStatus({
      status: 'searching',
      progress: 0,
      message: '인플루언서 데이터베이스 검색 중...',
      foundCount: 0,
      analyzedCount: 0
    });

    // 진행 상태 업데이트
    const interval = setInterval(() => {
      setMatchingStatus(prev => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            status: 'completed',
            message: '매칭 완료!',
            progress: 100
          };
        }

        const newProgress = prev.progress + 5;
        const analyzed = Math.floor((newProgress / 100) * 1234);
        const found = Math.floor((newProgress / 100) * 23);

        // 매칭 중 인플루언서 추가
        if (newProgress % 20 === 0) {
          addNewInfluencer();
        }

        return {
          ...prev,
          progress: newProgress,
          analyzedCount: analyzed,
          foundCount: found,
          status: newProgress > 50 ? 'matching' : 'searching',
          message: newProgress > 50 
            ? `AI가 최적의 인플루언서를 매칭하고 있습니다...`
            : '인플루언서 데이터베이스 검색 중...'
        };
      });
    }, 200);
  };

  // 새 인플루언서 추가 (실시간 효과)
  const addNewInfluencer = () => {
    const newInfluencer: Influencer = {
      id: `inf_${Date.now()}`,
      name: ['김소영', '이준호', '박서연', '최민수'][Math.floor(Math.random() * 4)],
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      username: `@user${Math.floor(Math.random() * 9999)}`,
      followers: Math.floor(Math.random() * 500000) + 10000,
      engagement: Number((Math.random() * 8 + 2).toFixed(1)),
      categories: [
        ['패션', '뷰티'],
        ['푸드', '라이프'],
        ['테크', '게임'],
        ['여행', '일상']
      ][Math.floor(Math.random() * 4)],
      matchScore: Math.floor(Math.random() * 30) + 70,
      status: 'pending',
      location: ['서울', '부산', '대구', '인천'][Math.floor(Math.random() * 4)],
      tier: ['standard', 'gold', 'premium'][Math.floor(Math.random() * 3)] as any
    };

    setInfluencers(prev => [newInfluencer, ...prev].slice(0, 10));
  };

  // 실시간 메트릭 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        impressions: prev.impressions + Math.floor(Math.random() * 100),
        clicks: prev.clicks + Math.floor(Math.random() * 10),
        engagement: prev.engagement + Math.floor(Math.random() * 20),
        conversions: prev.conversions + (Math.random() > 0.8 ? 1 : 0),
        spend: prev.spend + Math.floor(Math.random() * 10000),
        roi: Number((prev.roi + (Math.random() - 0.5) * 2).toFixed(0))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleInfluencerAction = (id: string, action: 'accept' | 'reject') => {
    setInfluencers(prev =>
      prev.map(inf =>
        inf.id === id
          ? { ...inf, status: action === 'accept' ? 'accepted' : 'rejected' }
          : inf
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            실시간 AI 매칭 대시보드
          </h1>
          <p className="text-gray-600">우버처럼 실시간으로 인플루언서를 매칭합니다</p>
        </div>

        {/* 실시간 메트릭 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Eye className="text-blue-500" size={24} />
              <span className="text-xs text-green-500 font-semibold">+12.3%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.impressions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">노출수</div>
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Activity className="text-purple-500" size={24} />
              <span className="text-xs text-green-500 font-semibold">+8.7%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {((metrics.engagement / metrics.impressions) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">참여율</div>
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: '82%' }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-green-500" size={24} />
              <span className="text-xs text-green-500 font-semibold">+{metrics.roi}%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.roi}%
            </div>
            <div className="text-sm text-gray-600 mt-1">ROI</div>
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: '90%' }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-yellow-500" size={24} />
              <span className="text-xs text-gray-500">예산 70% 소진</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ₩{(metrics.spend / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600 mt-1">집행 금액</div>
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>
        </div>

        {/* AI 매칭 섹션 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 매칭 컨트롤 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="text-purple-600" />
                AI 매칭 엔진
              </h2>

              {/* 매칭 상태 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">진행 상태</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {matchingStatus.progress}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${matchingStatus.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{matchingStatus.message}</p>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {matchingStatus.analyzedCount}
                  </div>
                  <div className="text-xs text-gray-600">분석된 프로필</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {matchingStatus.foundCount}
                  </div>
                  <div className="text-xs text-gray-600">매칭된 인플루언서</div>
                </div>
              </div>

              {/* 매칭 시작 버튼 */}
              <button
                onClick={startMatching}
                disabled={matchingStatus.status !== 'idle' && matchingStatus.status !== 'completed'}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {matchingStatus.status === 'idle' || matchingStatus.status === 'completed' 
                  ? '🚀 AI 매칭 시작'
                  : '⚡ 매칭 진행 중...'}
              </button>

              {/* 매칭 옵션 */}
              <div className="mt-6 space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">최소 팔로워</span>
                  <select className="px-3 py-1 border rounded-lg text-sm">
                    <option>10K+</option>
                    <option>50K+</option>
                    <option>100K+</option>
                  </select>
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">최소 참여율</span>
                  <select className="px-3 py-1 border rounded-lg text-sm">
                    <option>3%+</option>
                    <option>5%+</option>
                    <option>7%+</option>
                  </select>
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">카테고리</span>
                  <select className="px-3 py-1 border rounded-lg text-sm">
                    <option>전체</option>
                    <option>패션/뷰티</option>
                    <option>푸드</option>
                    <option>라이프스타일</option>
                  </select>
                </label>
              </div>
            </div>

            {/* 매칭 팁 */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-4 mt-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Award className="text-purple-600" size={20} />
                Pro Tip
              </h3>
              <p className="text-sm text-gray-700">
                AI는 과거 캠페인 성과, 오디언스 매칭도, 
                콘텐츠 품질 등 15개 이상의 지표를 분석합니다.
              </p>
            </div>
          </div>

          {/* 인플루언서 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="text-purple-600" />
                  매칭된 인플루언서
                </span>
                <span className="text-sm text-gray-500">
                  실시간 업데이트
                </span>
              </h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {influencers.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Users size={48} className="mx-auto mb-3 opacity-50" />
                      <p>AI 매칭을 시작하면 여기에 인플루언서가 표시됩니다</p>
                    </div>
                  ) : (
                    influencers.map((influencer) => (
                      <motion.div
                        key={influencer.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        whileHover={{ scale: 1.01 }}
                        className="bg-gray-50 rounded-xl p-4 cursor-pointer"
                        onClick={() => setSelectedInfluencer(influencer)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={influencer.avatar}
                              alt={influencer.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">
                                  {influencer.name}
                                </h3>
                                {influencer.tier === 'premium' && (
                                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full">
                                    Premium
                                  </span>
                                )}
                                {influencer.tier === 'gold' && (
                                  <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                                    Gold
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>{influencer.username}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {influencer.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-xs text-gray-500">매칭 점수</div>
                                <div className="text-2xl font-bold text-purple-600">
                                  {influencer.matchScore}
                                </div>
                              </div>
                              <div className="flex gap-2 text-xs text-gray-600">
                                <span>{(influencer.followers / 1000).toFixed(0)}K 팔로워</span>
                                <span>•</span>
                                <span>{influencer.engagement}% 참여율</span>
                              </div>
                            </div>

                            {influencer.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInfluencerAction(influencer.id, 'reject');
                                  }}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                >
                                  <XCircle size={20} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInfluencerAction(influencer.id, 'accept');
                                  }}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                >
                                  <CheckCircle size={20} />
                                </button>
                              </div>
                            ) : (
                              <div className="px-3 py-1.5">
                                {influencer.status === 'accepted' ? (
                                  <span className="text-green-600 font-semibold">✓ 수락됨</span>
                                ) : (
                                  <span className="text-gray-400">거절됨</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 카테고리 태그 */}
                        <div className="flex gap-2 mt-3">
                          {influencer.categories.map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* 실시간 활동 피드 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-purple-600" />
            실시간 활동
          </h2>
          <div className="space-y-3">
            {[
              { time: '방금 전', action: '김소영님이 캠페인 참여를 수락했습니다', icon: CheckCircle, color: 'green' },
              { time: '2분 전', action: '새로운 인플루언서 15명을 발견했습니다', icon: Users, color: 'blue' },
              { time: '5분 전', action: 'AI 매칭 점수가 업데이트되었습니다', icon: Zap, color: 'purple' },
              { time: '10분 전', action: '캠페인 ROI가 250%를 돌파했습니다', icon: TrendingUp, color: 'green' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <item.icon className={`text-${item.color}-500`} size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 인플루언서 상세 모달 */}
      <AnimatePresence>
        {selectedInfluencer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInfluencer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">인플루언서 상세 정보</h2>
                  <button
                    onClick={() => setSelectedInfluencer(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={selectedInfluencer.avatar}
                    alt={selectedInfluencer.name}
                    className="w-20 h-20 rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{selectedInfluencer.name}</h3>
                    <p className="text-gray-600">{selectedInfluencer.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(selectedInfluencer.followers / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-600">팔로워</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedInfluencer.engagement}%
                    </div>
                    <div className="text-sm text-gray-600">참여율</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedInfluencer.matchScore}
                    </div>
                    <div className="text-sm text-gray-600">매칭 점수</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl">
                    협업 제안하기
                  </button>
                  <button className="flex-1 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl">
                    프로필 보기
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