// components/advertiser/ApplicantManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, CheckCircle, XCircle, MessageCircle,
  Star, TrendingUp, Shield, DollarSign,
  Brain, UserCheck, UserX, Timer,
  BarChart3, Search, Loader2, Info
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import type { Database } from '@/types/supabase';

// Supabase 타입
type Tables = Database['public']['Tables'];
type CampaignInfluencer = Tables['campaign_influencers']['Row'];
type Campaign = Tables['campaigns']['Row'];
type Influencer = Tables['influencers']['Row'];

// 뷰 모델 타입 (null을 허용하지 않음)
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
  status: string;
  agreed_price: number;
  match_score: number;
  match_details: any;
  applied_at: Date;
  hours_since_applied: number;
}

interface ApplicantManagementProps {
  campaignId?: string;
  advertiserId: string;
}

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';
type SortBy = 'recent' | 'match_score' | 'followers' | 'price';

export default function ApplicantManagement({ campaignId, advertiserId }: ApplicantManagementProps) {
  const supabase = createClient();
  const [applicants, setApplicants] = useState<ApplicantViewModel[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<ApplicantViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    avgResponseTime: 2.5,
    acceptanceRate: 0
  });

  useEffect(() => {
    loadApplicants();
  }, [campaignId, advertiserId]);

  useEffect(() => {
    filterAndSortApplicants();
  }, [applicants, filterStatus, sortBy, searchQuery]);

  const loadApplicants = async () => {
    try {
      setIsLoading(true);
      
      // Supabase 쿼리
      let query = supabase
        .from('campaign_influencers')
        .select(`
          *,
          campaigns!inner (
            id, 
            name, 
            budget, 
            end_date, 
            categories,
            advertiser_id,
            advertisers (
              id,
              company_name
            )
          ),
          influencers (
            id, 
            name, 
            avatar, 
            followers_count, 
            engagement_rate, 
            categories, 
            tier, 
            is_verified
          )
        `);

      // advertiser_id로 필터링
      query = query.eq('campaigns.advertiser_id', advertiserId);

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Query error:', error);
        toast.error('데이터 로드 실패');
        return;
      }

      if (!data) {
        setApplicants([]);
        return;
      }

      // 타입 캐스팅 및 안전한 데이터 변환
      const formattedData: ApplicantViewModel[] = [];
      
      for (const app of data) {
        // null 체크
        if (!app.campaign_id || !app.influencer_id) continue;
        if (!app.campaigns || !app.influencers) continue;

        const campaigns = app.campaigns as unknown as Campaign & { 
          advertisers?: { id: string; company_name: string } 
        };
        const influencers = app.influencers as unknown as Influencer;

        formattedData.push({
          id: app.id,
          campaign_id: app.campaign_id,
          campaign_name: campaigns.name || 'Unknown Campaign',
          influencer_id: app.influencer_id,
          influencer_name: influencers.name || 'Unknown',
          influencer_avatar: influencers.avatar || null,
          followers_count: influencers.followers_count || 0,
          engagement_rate: Number(influencers.engagement_rate) || 0,
          categories: influencers.categories || [],
          tier: influencers.tier || 'standard',
          verified: influencers.is_verified || false,
          status: app.status || 'pending',
          agreed_price: app.agreed_price || 0,
          match_score: Number(app.match_score) || 50,
          match_details: app.match_details || {},
          applied_at: app.matched_at ? new Date(app.matched_at) : new Date(),
          hours_since_applied: app.matched_at 
            ? Math.floor((Date.now() - new Date(app.matched_at).getTime()) / (1000 * 60 * 60))
            : 0
        });
      }

      setApplicants(formattedData);
      calculateStats(formattedData);
    } catch (error) {
      console.error('지원자 로드 오류:', error);
      toast.error('지원자 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortApplicants = () => {
    let filtered = [...applicants];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.influencer_name.toLowerCase().includes(query) ||
        app.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'match_score':
          return b.match_score - a.match_score;
        case 'followers':
          return b.followers_count - a.followers_count;
        case 'price':
          return a.agreed_price - b.agreed_price;
        case 'recent':
        default:
          return b.applied_at.getTime() - a.applied_at.getTime();
      }
    });

    setFilteredApplicants(filtered);
  };

  const calculateStats = (apps: ApplicantViewModel[]) => {
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
      avgResponseTime: 2.5,
      acceptanceRate
    });
  };

  const acceptApplication = async (applicantId: string) => {
    try {
      setProcessingId(applicantId);

      const { error } = await supabase
        .from('campaign_influencers')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', applicantId);

      if (error) throw error;

      // 채팅방 생성
      const applicant = applicants.find(a => a.id === applicantId);
      if (applicant) {
        const { data: chatRoom, error: chatError } = await supabase
          .from('chat_rooms')
          .insert({
            campaign_id: applicant.campaign_id,
            advertiser_id: advertiserId,
            influencer_id: applicant.influencer_id,
            status: 'active'
          })
          .select()
          .single();

        if (chatError) {
          console.error('채팅방 생성 실패:', chatError);
        } else {
          toast.success('지원을 수락했습니다! 채팅방이 생성되었습니다 💬');
        }
      }
      
      setApplicants(prev => prev.map(app => 
        app.id === applicantId 
          ? { ...app, status: 'accepted' }
          : app
      ));
    } catch (error) {
      console.error('수락 오류:', error);
      toast.error('처리 중 오류가 발생했습니다');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectApplication = async (applicantId: string) => {
    try {
      setProcessingId(applicantId);

      const { error } = await supabase
        .from('campaign_influencers')
        .update({ 
          status: 'rejected'
        })
        .eq('id', applicantId);

      if (error) throw error;

      toast.success('지원을 거절했습니다');
      
      setApplicants(prev => prev.map(app => 
        app.id === applicantId 
          ? { ...app, status: 'rejected' }
          : app
      ));
    } catch (error) {
      console.error('거절 오류:', error);
      toast.error('처리 중 오류가 발생했습니다');
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimeAgo = (hours: number): string => {
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${Math.floor(hours)}시간 전`;
    if (hours < 168) return `${Math.floor(hours / 24)}일 전`;
    return `${Math.floor(hours / 168)}주 전`;
  };

  const getTierBadge = (tier: string, verified: boolean) => {
    // Record<string, string>으로 명시적 타입 지정
    const tierColors: Record<string, string> = {
      'standard': 'bg-gray-100 text-gray-700',
      'gold': 'bg-yellow-100 text-yellow-700',
      'premium': 'bg-purple-100 text-purple-700'
    };

    // 안전한 인덱싱
    const colorClass = tierColors[tier] || tierColors['standard'];

    return (
      <div className="flex items-center gap-1">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
          {tier.toUpperCase()}
        </span>
        {verified && (
          <Shield className="w-4 h-4 text-blue-500" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">전체</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">대기중</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">수락</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">거절</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">평균 응답</p>
          <p className="text-2xl font-bold">{stats.avgResponseTime}시간</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">수락률</p>
          <p className="text-2xl font-bold text-purple-600">{stats.acceptanceRate.toFixed(0)}%</p>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="이름, 카테고리로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {status === 'all' && '전체'}
                {status === 'pending' && '대기중'}
                {status === 'accepted' && '수락'}
                {status === 'rejected' && '거절'}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="recent">최신순</option>
            <option value="match_score">매칭점수순</option>
            <option value="followers">팔로워순</option>
            <option value="price">가격순</option>
          </select>
        </div>
      </div>

      {/* 지원자 목록 */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">지원자를 불러오는 중...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">아직 지원자가 없습니다</p>
          </div>
        ) : (
          filteredApplicants.map((applicant) => (
            <div key={applicant.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                    {applicant.influencer_avatar || applicant.influencer_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{applicant.influencer_name}</h3>
                      {getTierBadge(applicant.tier, applicant.verified)}
                      {applicant.match_score >= 80 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          매칭 {applicant.match_score}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>팔로워 {(applicant.followers_count / 1000).toFixed(1)}K</span>
                      <span>참여율 {applicant.engagement_rate}%</span>
                      <span>제안가 {(applicant.agreed_price / 10000).toFixed(0)}만원</span>
                      <span className="text-gray-400">{formatTimeAgo(applicant.hours_since_applied)}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {applicant.categories.slice(0, 3).map((cat, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {cat}
                        </span>
                      ))}
                      {applicant.categories.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500">
                          +{applicant.categories.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {applicant.status === 'pending' && (
                    <>
                      <button
                        onClick={() => rejectApplication(applicant.id)}
                        disabled={processingId === applicant.id}
                        className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {processingId === applicant.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserX className="w-4 h-4" />
                        )}
                        거절
                      </button>
                      <button
                        onClick={() => acceptApplication(applicant.id)}
                        disabled={processingId === applicant.id}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50"
                      >
                        {processingId === applicant.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                        수락
                      </button>
                    </>
                  )}
                  {applicant.status === 'accepted' && (
                    <button
                      onClick={() => window.location.href = '/chat'}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4" />
                      채팅하기
                    </button>
                  )}
                  {applicant.status === 'rejected' && (
                    <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                      거절됨
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}