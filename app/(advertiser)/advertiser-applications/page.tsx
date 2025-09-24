'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, CheckCircle, XCircle, MessageCircle, 
  Star, TrendingUp, Instagram, Youtube, DollarSign,
  Filter, Search, Bell, ChevronRight, AlertCircle,
  UserCheck, UserX, Timer, Shield, Award, Heart,
  BarChart3, Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 타입 정의
interface Application {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed';
  agreed_price: number | null;
  match_score: number | null;
  match_details: any;
  matched_at: string;
  accepted_at: string | null;
  campaign?: {
    name: string;
    budget: number;
    categories: string[];
  };
  influencer?: {
    name: string;
    username?: string;
    avatar: string | null;
    followers_count: number;
    engagement_rate: number;
    categories: string[];
    tier: string | null;
    is_verified: boolean;
  };
}

export default function AdvertiserApplicationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNewApplications, setHasNewApplications] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchCampaigns();
    setupRealtimeSubscription();
  }, [selectedCampaign, selectedStatus]);

  const fetchCampaigns = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;

    const { data: advertiser } = await supabase
      .from('advertisers')
      .select('id')
      .eq('id', user.user.id)
      .single();

    if (!advertiser) return;

    const { data: campaignsData } = await supabase
      .from('campaigns')
      .select('*')
      .eq('advertiser_id', advertiser.id)
      .order('created_at', { ascending: false });

    if (campaignsData) {
      setCampaigns(campaignsData);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { data: advertiser } = await supabase
        .from('advertisers')
        .select('id')
        .eq('id', user.user.id)
        .single();

      if (!advertiser) return;

      // 캠페인 필터 쿼리 구성
      let query = supabase
        .from('campaign_influencers')
        .select(`
          *,
          campaign:campaigns!inner(
            name,
            budget,
            categories,
            advertiser_id
          ),
          influencer:influencers(
            name,
            username,
            avatar,
            followers_count,
            engagement_rate,
            categories,
            tier,
            is_verified
          )
        `)
        .eq('campaign.advertiser_id', advertiser.id)
        .order('matched_at', { ascending: false });

      if (selectedCampaign !== 'all') {
        query = query.eq('campaign_id', selectedCampaign);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('지원자 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('new-applications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'campaign_influencers'
      }, () => {
        setHasNewApplications(true);
        toast.success('새로운 지원자가 있습니다!');
        fetchApplications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleAccept = async (applicationId: string) => {
    try {
      // 지원 수락 - 타입을 명시적으로 지정
      const { error } = await supabase
        .from('campaign_influencers')
        .update({ 
          status: 'accepted' as const,
          accepted_at: new Date().toISOString()
        } as any) // 임시 타입 캐스팅
        .eq('id', applicationId);

      if (error) throw error;

      // 채팅방 생성
      const application = applications.find(a => a.id === applicationId);
      if (application) {
        // 먼저 광고주 ID 가져오기
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('advertiser_id')
          .eq('id', application.campaign_id)
          .single();

        if (campaign?.advertiser_id) {
          const { data: chatRoom, error: chatError } = await supabase
            .from('chat_rooms')
            .insert({
              advertiser_id: campaign.advertiser_id,
              influencer_id: application.influencer_id,
              campaign_id: application.campaign_id
            } as any) // 임시 타입 캐스팅
            .select()
            .single();

          if (!chatError && chatRoom) {
            toast.success('지원을 수락했습니다. 채팅방이 생성되었습니다.');
            router.push(`/chat/${chatRoom.id}`);
          }
        }
      }

      fetchApplications();
    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_influencers')
        .update({ 
          status: 'rejected' as const,
          accepted_at: new Date().toISOString()
        } as any) // 임시 타입 캐스팅
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('지원을 거절했습니다');
      fetchApplications();
    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '검토중';
      case 'accepted': return '수락됨';
      case 'rejected': return '거절됨';
      case 'in_progress': return '진행중';
      case 'completed': return '완료됨';
      default: return status;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true;
    return app.influencer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           app.influencer?.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">지원자 관리</h1>
            {hasNewApplications && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">새 지원자</span>
              </motion.div>
            )}
          </div>

          {/* 검색 바 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="인플루언서 검색..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 필터 */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {/* 캠페인 필터 */}
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">모든 캠페인</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>

            {/* 상태 필터 */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">모든 상태</option>
              <option value="pending">검토중</option>
              <option value="accepted">수락됨</option>
              <option value="rejected">거절됨</option>
              <option value="in_progress">진행중</option>
              <option value="completed">완료됨</option>
            </select>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {filteredApplications.length}
              </div>
              <div className="text-xs text-gray-500">전체</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">
                {filteredApplications.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-500">대기중</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {filteredApplications.filter(a => a.status === 'accepted').length}
              </div>
              <div className="text-xs text-gray-500">수락</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {filteredApplications.filter(a => a.status === 'in_progress').length}
              </div>
              <div className="text-xs text-gray-500">진행중</div>
            </div>
          </div>
        </div>
      </div>

      {/* 지원자 리스트 */}
      <div className="p-4">
        <AnimatePresence>
          {filteredApplications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden"
            >
              {/* 캠페인 정보 */}
              <div className="px-4 py-2 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {application.campaign?.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(application.matched_at), 'MM월 dd일', { locale: ko })}
                  </span>
                </div>
              </div>

              {/* 인플루언서 정보 */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={application.influencer?.avatar || '/default-avatar.png'}
                    alt={application.influencer?.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {application.influencer?.name}
                      </h3>
                      {application.influencer?.is_verified && (
                        <Shield className="w-4 h-4 text-blue-500" />
                      )}
                      {application.influencer?.tier && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full">
                          {application.influencer.tier}
                        </span>
                      )}
                    </div>

                    {/* 통계 */}
                    <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{(application.influencer?.followers_count || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{(application.influencer?.engagement_rate || 0).toFixed(1)}%</span>
                      </div>
                      {application.match_score && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{application.match_score.toFixed(1)}점</span>
                        </div>
                      )}
                    </div>

                    {/* 카테고리 */}
                    {application.influencer?.categories && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {application.influencer.categories.slice(0, 3).map((category, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    {application.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(application.id)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                          <CheckCircle className="w-4 h-4" />
                          수락
                        </button>
                        <button
                          onClick={() => handleReject(application.id)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          거절
                        </button>
                      </div>
                    )}

                    {application.status === 'accepted' && (
                      <button
                        onClick={() => router.push(`/chat/${application.id}`)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
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
        </AnimatePresence>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">아직 지원자가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}