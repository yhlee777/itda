// app/(influencer)/applications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Clock, CheckCircle, XCircle, MessageCircle,
  Calendar, DollarSign, TrendingUp, ChevronRight,
  ArrowLeft, Filter, Search, AlertCircle, Star,
  Eye, Heart, Users, Timer, Hash, FileText,
  Loader2, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import type { Database } from '@/types/supabase';

// Supabase 타입
type Tables = Database['public']['Tables'];
type CampaignInfluencer = Tables['campaign_influencers']['Row'];
type Campaign = Tables['campaigns']['Row'];
type Json = Database['public']['Tables']['campaign_influencers']['Row']['deliverables'];

// 애플리케이션 뷰 모델 타입
interface ApplicationViewModel {
  id: string;
  campaign_id: string;
  campaign_name: string;
  campaign_image?: string;
  brand_name: string;
  brand_logo: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed';
  proposed_price: number;
  cover_letter?: string;
  applied_at: Date;
  reviewed_at?: Date;
  decided_at?: Date;
  rejection_reason?: string;
  campaign_end_date: Date;
  campaign_budget: number;
  campaign_category: string;
  match_score?: number;
}

interface ApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  avgResponseTime: number;
  acceptanceRate: number;
}

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed';

// 안전한 JSON 파싱 헬퍼 함수
function parseDeliverables(deliverables: Json): { coverLetter?: string } {
  if (!deliverables) return {};
  
  if (typeof deliverables === 'object' && !Array.isArray(deliverables)) {
    return deliverables as { coverLetter?: string };
  }
  
  return {};
}

export default function ApplicationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [applications, setApplications] = useState<ApplicationViewModel[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationViewModel | null>(null);
  const [userId, setUserId] = useState<string>('');

  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    avgResponseTime: 0,
    acceptanceRate: 0
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, filterStatus, searchQuery]);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserId(user.id);
    await loadApplications(user.id);
    const cleanup = setupRealtimeUpdates(user.id);
    return cleanup;
  };

  const loadApplications = async (influencerId: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('campaign_influencers')
        .select(`
          id,
          status,
          agreed_price,
          deliverables,
          matched_at,
          accepted_at,
          completed_at,
          match_score,
          campaign:campaigns (
            id,
            name,
            budget,
            end_date,
            categories,
            metadata,
            advertisers (
              id,
              company_name,
              company_logo
            )
          )
        `)
        .eq('influencer_id', influencerId)
        .order('matched_at', { ascending: false });

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      if (!data) {
        setApplications([]);
        return;
      }

      // 안전한 데이터 매핑
      const formattedData: ApplicationViewModel[] = [];
      
      for (const app of data) {
        // null 체크
        if (!app.campaign) continue;
        
        // 타입 캐스팅
        const campaign = app.campaign as unknown as Campaign & {
          advertisers?: Array<{
            id: string;
            company_name: string;
            company_logo?: string;
          }>;
          metadata?: any;
        };
        
        const advertiser = campaign.advertisers?.[0];
        if (!advertiser) continue;

        // deliverables 파싱
        const parsedDeliverables = parseDeliverables(app.deliverables);
        
        // 캠페인 이미지 추출 (metadata에서)
        const campaignImage = campaign.metadata?.image || undefined;

        formattedData.push({
          id: app.id,
          campaign_id: campaign.id,
          campaign_name: campaign.name || 'Unknown Campaign',
          campaign_image: campaignImage,
          brand_name: advertiser.company_name || 'Unknown Brand',
          brand_logo: advertiser.company_logo || '🏢',
          status: (app.status || 'pending') as ApplicationViewModel['status'],
          proposed_price: app.agreed_price || 0,
          cover_letter: parsedDeliverables.coverLetter,
          applied_at: app.matched_at ? new Date(app.matched_at) : new Date(),
          reviewed_at: app.accepted_at ? new Date(app.accepted_at) : undefined,
          decided_at: app.completed_at ? new Date(app.completed_at) : undefined,
          rejection_reason: undefined,
          campaign_end_date: new Date(campaign.end_date),
          campaign_budget: campaign.budget || 0,
          campaign_category: Array.isArray(campaign.categories) && campaign.categories.length > 0 
            ? campaign.categories[0] 
            : 'General',
          match_score: app.match_score !== null ? Number(app.match_score) : undefined
        });
      }

      setApplications(formattedData);
      calculateStats(formattedData);
    } catch (error) {
      console.error('지원 현황 로드 오류:', error);
      toast.error('지원 현황을 불러오는데 실패했습니다');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeUpdates = (influencerId: string) => {
    const channel = supabase
      .channel('my_applications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'campaign_influencers',
        filter: `influencer_id=eq.${influencerId}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
          const newStatus = payload.new.status;
          if (newStatus === 'accepted') {
            toast.success('🎉 축하합니다! 캠페인 지원이 승인되었습니다!');
          } else if (newStatus === 'rejected') {
            toast.error('아쉽게도 이번 캠페인에는 선정되지 않으셨습니다');
          }
        }
        loadApplications(influencerId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.campaign_name.toLowerCase().includes(query) ||
        app.brand_name.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const calculateStats = (apps: ApplicationViewModel[]) => {
    const total = apps.length;
    const pending = apps.filter(a => a.status === 'pending').length;
    const accepted = apps.filter(a => a.status === 'accepted').length;
    const rejected = apps.filter(a => a.status === 'rejected').length;
    
    const acceptanceRate = (accepted + rejected) > 0 
      ? (accepted / (accepted + rejected)) * 100 
      : 0;

    setStats({
      total,
      pending,
      accepted,
      rejected,
      avgResponseTime: 0,
      acceptanceRate
    });
  };

  const withdrawApplication = async (applicationId: string) => {
    if (!confirm('정말 지원을 취소하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('campaign_influencers')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('지원이 취소되었습니다');
      await loadApplications(userId);
    } catch (error) {
      console.error('지원 취소 오류:', error);
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            검토중
          </span>
        );
      case 'accepted':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            승인됨
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            거절됨
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
            <Timer className="w-4 h-4" />
            진행중
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            완료
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const handleRefresh = () => {
    if (userId) {
      loadApplications(userId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">지원 현황</h1>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">전체 지원</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">검토중</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">승인</p>
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">거절</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">승인율</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.acceptanceRate.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'pending', 'accepted', 'rejected', 'in_progress'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {status === 'all' && '전체'}
              {status === 'pending' && '검토중'}
              {status === 'accepted' && '승인됨'}
              {status === 'rejected' && '거절됨'}
              {status === 'in_progress' && '진행중'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-20">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">불러오는 중...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">지원한 캠페인이 없습니다</p>
            <button
              onClick={() => router.push('/campaigns')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              캠페인 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-3">
                      <div className="text-3xl">{application.brand_logo}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {application.campaign_name}
                        </h3>
                        <p className="text-sm text-gray-600">{application.brand_name}</p>
                      </div>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {(application.proposed_price / 10000).toFixed(0)}만원
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(application.applied_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      {application.campaign_category}
                    </span>
                    {application.match_score !== undefined && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        매칭 {application.match_score}%
                      </span>
                    )}
                  </div>

                  {application.cover_letter && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {application.cover_letter}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {application.status === 'pending' && (
                      <button
                        onClick={() => withdrawApplication(application.id)}
                        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        지원 취소
                      </button>
                    )}
                    {(application.status === 'accepted' || application.status === 'in_progress') && (
                      <button
                        onClick={() => router.push('/chat')}
                        className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        채팅하기
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                    >
                      상세보기
                      <ChevronRight className="w-4 h-4 inline ml-1" />
                    </button>
                  </div>

                  {application.status === 'rejected' && application.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">거절 사유:</span> {application.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}