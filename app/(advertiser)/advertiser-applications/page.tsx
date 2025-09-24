// app/(advertiser)/advertiser-applications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, CheckCircle, XCircle, MessageCircle,
  Star, TrendingUp, Shield, DollarSign,
  Brain, UserCheck, UserX, Timer,
  BarChart3, Search, Loader2, Info,
  Filter, ChevronDown, Calendar, Eye,
  AlertCircle, Sparkles, Target, Award
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import type { Database } from '@/types/database.types';

// DB 타입 가져오기
type Tables = Database['public']['Tables'];
type CampaignInfluencer = Tables['campaign_influencers']['Row'];
type Campaign = Tables['campaigns']['Row'];
type Influencer = Tables['influencers']['Row'];
type Advertiser = Tables['advertisers']['Row'];

// 지원자 뷰 모델
interface ApplicantViewModel {
  id: string;
  campaign_id: string;
  campaign_name: string;
  influencer_id: string;
  influencer_name: string;
  influencer_avatar: string | null;
  followers_count: number;
  engagement_rate: number;
  categories: string[];
  tier: string;
  verified: boolean;
  status: 'pending' | 'accepted' | 'rejected';
  agreed_price: number | null;
  match_score: number | null;
  applied_at: Date;
  hours_since_applied: number;
}

interface CampaignWithApplications {
  id: string;
  name: string;
  budget: number;
  end_date: string;
  application_count: number;
  pending_count: number;
  accepted_count: number;
}

export default function AdvertiserApplicationsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [applications, setApplications] = useState<ApplicantViewModel[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignWithApplications[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'match_score' | 'followers'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCampaigns();
      fetchApplications();
    }
  }, [currentUser, selectedCampaign, selectedStatus, sortBy]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
    } else {
      router.push('/login');
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, budget, end_date')
        .eq('advertiser_id', currentUser.id)
        .eq('status', 'active');

      if (error) throw error;

      // 각 캠페인의 지원자 수 계산
      const campaignsWithCounts = await Promise.all(
        (data || []).map(async (campaign) => {
          const { count: totalCount } = await supabase
            .from('campaign_influencers')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id);

          const { count: pendingCount } = await supabase
            .from('campaign_influencers')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id)
            .eq('status', 'pending');

          const { count: acceptedCount } = await supabase
            .from('campaign_influencers')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id)
            .eq('status', 'accepted');

          return {
            ...campaign,
            application_count: totalCount || 0,
            pending_count: pendingCount || 0,
            accepted_count: acceptedCount || 0
          };
        })
      );

      setCampaigns(campaignsWithCounts);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('캠페인을 불러올 수 없습니다');
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // 캠페인 조건 설정
      let campaignIds: string[] = [];
      if (selectedCampaign === 'all') {
        const { data: userCampaigns } = await supabase
          .from('campaigns')
          .select('id')
          .eq('advertiser_id', currentUser.id);
        
        campaignIds = userCampaigns?.map(c => c.id) || [];
      } else {
        campaignIds = [selectedCampaign];
      }

      if (campaignIds.length === 0) {
        setApplications([]);
        setIsLoading(false);
        return;
      }

      // 지원자 정보 가져오기
      let query = supabase
        .from('campaign_influencers')
        .select(`
          *,
          campaigns!inner (
            id,
            name,
            budget
          ),
          influencers!inner (
            id,
            name,
            avatar,
            followers_count,
            engagement_rate,
            categories,
            tier,
            is_verified
          )
        `)
        .in('campaign_id', campaignIds);

      // 상태 필터
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // 데이터 포맷팅
      const formattedApplications: ApplicantViewModel[] = (data || []).map(app => {
        const campaign = Array.isArray(app.campaigns) ? app.campaigns[0] : app.campaigns;
        const influencer = Array.isArray(app.influencers) ? app.influencers[0] : app.influencers;
        
        const appliedAt = new Date(app.applied_at || app.matched_at || new Date().toISOString());
        const hoursAgo = Math.floor((Date.now() - appliedAt.getTime()) / (1000 * 60 * 60));

        return {
          id: app.id,
          campaign_id: campaign?.id || '',
          campaign_name: campaign?.name || 'Unknown Campaign',
          influencer_id: influencer?.id || '',
          influencer_name: influencer?.name || 'Unknown',
          influencer_avatar: influencer?.avatar,
          followers_count: influencer?.followers_count || 0,
          engagement_rate: influencer?.engagement_rate || 0,
          categories: influencer?.categories || [],
          tier: influencer?.tier || 'bronze',
          verified: influencer?.is_verified || false,
          status: (app.status as 'pending' | 'accepted' | 'rejected') || 'pending',
          agreed_price: app.agreed_price,
          match_score: app.match_score,
          applied_at: appliedAt,
          hours_since_applied: hoursAgo
        };
      });

      // 정렬
      let sortedApplications = [...formattedApplications];
      switch (sortBy) {
        case 'match_score':
          sortedApplications.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
          break;
        case 'followers':
          sortedApplications.sort((a, b) => b.followers_count - a.followers_count);
          break;
        case 'recent':
        default:
          sortedApplications.sort((a, b) => b.applied_at.getTime() - a.applied_at.getTime());
      }

      // 검색 필터
      if (searchQuery) {
        sortedApplications = sortedApplications.filter(app => 
          app.influencer_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setApplications(sortedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('지원자를 불러올 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string, influencerId: string, campaignId: string) => {
    try {
      // 1. 지원 상태 업데이트
      const { error: updateError } = await supabase
        .from('campaign_influencers')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // 2. 채팅방 생성
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencerId)
        .eq('advertiser_id', currentUser.id)
        .single();

      if (!existingRoom) {
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            campaign_id: campaignId,
            advertiser_id: currentUser.id,
            influencer_id: influencerId,
            status: 'active',
            contract_status: 'negotiating'
          })
          .select()
          .single();

        if (roomError) throw roomError;

        // 3. 시스템 메시지 전송
        if (newRoom) {
          await supabase
            .from('messages')
            .insert({
              chat_room_id: newRoom.id,
              sender_id: currentUser.id,
              sender_type: 'advertiser',
              content: '안녕하세요! 캠페인 참여가 승인되었습니다. 자세한 내용을 논의해보겠습니다.',
              message_type: 'text'
            });
        }
      }

      // 4. 알림 생성
      await supabase
        .from('notifications')
        .insert({
          user_id: influencerId,
          type: 'application_accepted',
          title: '캠페인 참여 승인!',
          message: '축하합니다! 캠페인 참여가 승인되었습니다.',
          metadata: { 
            campaign_id: campaignId,
            application_id: applicationId
          }
        });

      toast.success('지원을 승인했습니다');
      fetchApplications(); // 목록 새로고침
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('승인 처리 중 오류가 발생했습니다');
    }
  };

  const handleRejectApplication = async (applicationId: string, influencerId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_influencers')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // 알림 생성
      await supabase
        .from('notifications')
        .insert({
          user_id: influencerId,
          type: 'application_rejected',
          title: '캠페인 지원 결과',
          message: '아쉽게도 이번 캠페인에는 선정되지 않았습니다.',
          metadata: { application_id: applicationId }
        });

      toast.success('지원을 거절했습니다');
      fetchApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('거절 처리 중 오류가 발생했습니다');
    }
  };

  const getTimeAgo = (hours: number): string => {
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    return `${Math.floor(days / 30)}개월 전`;
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'premium': return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const pendingApplications = applications.filter(a => a.status === 'pending');
  const aiRecommended = applications
    .filter(a => a.status === 'pending' && (a.match_score || 0) >= 80)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">지원자 관리</h1>
            <p className="text-sm text-gray-600 mt-1">
              총 {applications.length}명의 지원자 • 대기 중 {pendingApplications.length}명
            </p>
          </div>
        </div>
      </div>

      {/* AI 추천 섹션 */}
      {showAIRecommendations && aiRecommended.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-gray-900">AI 추천 인플루언서</h2>
            </div>
            <button
              onClick={() => setShowAIRecommendations(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              숨기기
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiRecommended.map((applicant) => (
              <div
                key={applicant.id}
                className="bg-white rounded-lg p-4 border border-purple-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={applicant.influencer_avatar || '/default-avatar.png'}
                      alt={applicant.influencer_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-medium text-gray-900">
                          {applicant.influencer_name}
                        </h3>
                        {applicant.verified && (
                          <Shield className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {applicant.followers_count.toLocaleString()} 팔로워
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-purple-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {applicant.match_score}점
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptApplication(
                      applicant.id,
                      applicant.influencer_id,
                      applicant.campaign_id
                    )}
                    className="flex-1 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                  >
                    수락
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 필터 바 */}
      <div className="bg-white px-6 py-3 border-b">
        <div className="flex flex-wrap items-center gap-4">
          {/* 캠페인 필터 */}
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border rounded-lg text-sm"
          >
            <option value="all">모든 캠페인</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name} ({campaign.pending_count})
              </option>
            ))}
          </select>

          {/* 상태 필터 */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-50 border rounded-lg text-sm"
          >
            <option value="all">모든 상태</option>
            <option value="pending">대기중</option>
            <option value="accepted">승인됨</option>
            <option value="rejected">거절됨</option>
          </select>

          {/* 정렬 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-50 border rounded-lg text-sm"
          >
            <option value="recent">최신순</option>
            <option value="match_score">매칭점수순</option>
            <option value="followers">팔로워순</option>
          </select>

          {/* 검색 */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름으로 검색..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 지원자 목록 */}
      <div className="px-6 py-4">
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">아직 지원자가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((applicant) => (
              <motion.div
                key={applicant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 상태 뱃지 */}
                <div className="px-4 pt-4 pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      applicant.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : applicant.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {applicant.status === 'pending' ? '대기중' 
                       : applicant.status === 'accepted' ? '승인됨' 
                       : '거절됨'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(applicant.hours_since_applied)}
                    </span>
                  </div>
                </div>

                {/* 인플루언서 정보 */}
                <div className="p-4 pt-0">
                  <div className="flex items-start gap-3">
                    <img
                      src={applicant.influencer_avatar || '/default-avatar.png'}
                      alt={applicant.influencer_name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {applicant.influencer_name}
                        </h3>
                        {applicant.verified && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getTierColor(applicant.tier)}`}>
                          {applicant.tier}
                        </span>
                      </div>

                      {/* 통계 */}
                      <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{applicant.followers_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{applicant.engagement_rate.toFixed(1)}%</span>
                        </div>
                      </div>

                      {/* 매칭 점수 */}
                      {applicant.match_score && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                              style={{ width: `${applicant.match_score}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-purple-600">
                            {applicant.match_score}%
                          </span>
                        </div>
                      )}

                      {/* 카테고리 */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {applicant.categories.slice(0, 3).map((category, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                          >
                            {category}
                          </span>
                        ))}
                        {applicant.categories.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                            +{applicant.categories.length - 3}
                          </span>
                        )}
                      </div>

                      {/* 희망 단가 */}
                      {applicant.agreed_price && (
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900 mb-3">
                          <DollarSign className="w-4 h-4" />
                          <span>₩{applicant.agreed_price.toLocaleString()}</span>
                        </div>
                      )}

                      {/* 액션 버튼 */}
                      {applicant.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptApplication(
                              applicant.id,
                              applicant.influencer_id,
                              applicant.campaign_id
                            )}
                            className="flex-1 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            수락
                          </button>
                          <button
                            onClick={() => handleRejectApplication(
                              applicant.id,
                              applicant.influencer_id
                            )}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            거절
                          </button>
                        </div>
                      )}

                      {applicant.status === 'accepted' && (
                        <button
                          onClick={() => router.push(`/chat/${applicant.id}`)}
                          className="w-full py-2 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          채팅하기
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}