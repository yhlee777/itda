'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Building2, MessageSquare, CheckCircle, 
  XCircle, Clock, Eye, Mail, Phone, AlertCircle,
  TrendingUp, DollarSign, UserCheck, BarChart3,
  Search, Filter, RefreshCw, Settings, LogOut,
  ChevronRight, Calendar, Hash, Sparkles, Send
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Advertiser {
  id: string;
  company_name: string;
  business_registration: string;
  contact_name: string;
  contact_position: string;
  contact_phone: string | null;
  website?: string | null;
  industry?: string | null;
  marketing_budget?: string | null;
  company_size?: string | null;
  is_verified: boolean;
  verification_date?: string | null;
  created_at: string;
  updated_at?: string;
  email?: string;
  users?: {
    email: string;
  };
}

interface Stats {
  totalAdvertisers: number;
  pendingApprovals: number;
  activeInfluencers: number;
  totalCampaigns: number;
  totalRevenue: number;
  todaySignups: number;
}

export default function AdminDashboard() {
  const supabase = createClient();
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalAdvertisers: 0,
    pendingApprovals: 0,
    activeInfluencers: 0,
    totalCampaigns: 0,
    totalRevenue: 0,
    todaySignups: 0
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatTest, setShowChatTest] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 광고주 목록 조회 - 일반 쿼리로 변경 (RPC 타입 문제 회피)
      const { data: advertisersData, error: advertisersError } = await supabase
        .from('advertisers')
        .select('*')
        .order('created_at', { ascending: false });

      if (advertisersError) {
        console.error('광고주 조회 오류:', advertisersError);
        toast.error('광고주 목록 로드 실패');
      } else {
        // 각 광고주의 이메일을 별도로 조회 (필요시)
        const advertisersWithEmail = await Promise.all(
          (advertisersData || []).map(async (adv) => {
            // auth.users 테이블에서 이메일 조회
            const { data: userData } = await supabase
              .from('users')
              .select('email')
              .eq('id', adv.id)
              .single();
            
            return {
              ...adv,
              users: userData ? { email: userData.email } : undefined
            };
          })
        );

        // 필터링 적용
        let filteredData = advertisersWithEmail;
        if (filterStatus === 'pending') {
          filteredData = advertisersWithEmail.filter(adv => !adv.is_verified);
        } else if (filterStatus === 'verified') {
          filteredData = advertisersWithEmail.filter(adv => adv.is_verified);
        }

        setAdvertisers(filteredData as Advertiser[]);
      }

      // 통계 데이터 조회
      const { count: totalAds } = await supabase
        .from('advertisers')
        .select('*', { count: 'exact' });
        
      const { count: pendingAds } = await supabase
        .from('advertisers')
        .select('*', { count: 'exact' })
        .eq('is_verified', false);
        
      const { count: activeInfs } = await supabase
        .from('influencers')
        .select('*', { count: 'exact' })
        .eq('status', 'active');
        
      const { count: totalCamps } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact' });

      // 오늘 가입자 수
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todaySignups } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .gte('created_at', today.toISOString());

      setStats({
        totalAdvertisers: totalAds || 0,
        pendingApprovals: pendingAds || 0,
        activeInfluencers: activeInfs || 0,
        totalCampaigns: totalCamps || 0,
        totalRevenue: 12500000, // Mock 데이터
        todaySignups: todaySignups || 0
      });

    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast.error('데이터 로드 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 광고주 승인
  const approveAdvertiser = async (advertiserId: string) => {
    try {
      // 먼저 광고주가 존재하는지 확인
      const { data: existingAdvertiser, error: checkError } = await supabase
        .from('advertisers')
        .select('*')
        .eq('id', advertiserId)
        .single();

      if (checkError || !existingAdvertiser) {
        console.error('광고주를 찾을 수 없습니다:', checkError);
        toast.error('광고주를 찾을 수 없습니다');
        return;
      }

      // 승인 처리
      const { data, error } = await supabase
        .from('advertisers')
        .update({ 
          is_verified: true,
          verification_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', advertiserId)
        .select()
        .single();

      if (error) {
        console.error('승인 업데이트 오류:', error);
        throw error;
      }

      toast.success('광고주가 승인되었습니다! ✅');
      
      // 목록 업데이트
      setAdvertisers(prev => 
        prev.map(adv => 
          adv.id === advertiserId 
            ? { ...adv, is_verified: true, verification_date: new Date().toISOString() } 
            : adv
        )
      );

      // 목록 새로고침
      setTimeout(() => {
        loadData();
      }, 1000);
      
    } catch (error: any) {
      console.error('승인 오류:', error);
      toast.error(error.message || '승인 처리 중 오류 발생');
    }
  };

  // 광고주 거절
  const rejectAdvertiser = async (advertiserId: string) => {
    if (!confirm('정말 거절하시겠습니까?')) return;

    try {
      // 광고주 삭제 또는 상태 업데이트
      const { error } = await supabase
        .from('advertisers')
        .delete()
        .eq('id', advertiserId);

      if (error) throw error;

      toast.success('광고주가 거절되었습니다.');
      
      // 목록에서 제거
      setAdvertisers(prev => prev.filter(adv => adv.id !== advertiserId));
      
    } catch (error) {
      console.error('거절 오류:', error);
      toast.error('거절 처리 중 오류 발생');
    }
  };

  // 1:1 채팅 테스트 시작
  const startChatTest = async (advertiser: Advertiser) => {
    setSelectedAdvertiser(advertiser);
    setShowChatTest(true);
    
    // 채팅방 생성 (Mock)
    try {
      const { data: chatRoom, error } = await supabase
        .from('chat_rooms')
        .insert({
          advertiser_id: advertiser.id,
          influencer_id: 'test-influencer-id', // 테스트용 인플루언서
          campaign_id: 'test-campaign-id', // 테스트용 캠페인
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.log('채팅방 생성 오류 (정상적일 수 있음):', error);
      } else {
        console.log('채팅방 생성 성공:', chatRoom);
        toast.success('테스트 채팅방이 생성되었습니다!');
      }
    } catch (error) {
      console.error('채팅 테스트 오류:', error);
    }
  };

  // 테스트 메시지 전송
  const sendTestMessage = async () => {
    if (!testMessage.trim() || !selectedAdvertiser) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_room_id: 'test-room-id',
          sender_id: selectedAdvertiser.id,
          sender_type: 'advertiser',
          content: testMessage,
          message_type: 'text'
        });

      if (error) {
        console.log('메시지 전송 오류 (테이블이 없을 수 있음):', error);
        toast.error('메시지 테이블이 아직 생성되지 않았습니다. DB 마이그레이션을 실행하세요.');
      } else {
        toast.success('테스트 메시지 전송 성공! 💬');
        setTestMessage('');
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error);
    }
  };

  // 필터링된 광고주 목록
  const filteredAdvertisers = advertisers.filter(adv => {
    if (searchTerm) {
      return adv.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             adv.contact_name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
                <p className="text-sm text-gray-500">ITDA Admin Panel</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">총 광고주</p>
                <p className="text-2xl font-bold">{stats.totalAdvertisers}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">승인 대기</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">활성 인플루언서</p>
                <p className="text-2xl font-bold">{stats.activeInfluencers}</p>
              </div>
              <Users className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">진행중 캠페인</p>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">월 수익</p>
                <p className="text-xl font-bold">₩{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">오늘 가입</p>
                <p className="text-2xl font-bold">{stats.todaySignups}</p>
              </div>
              <UserCheck className="w-8 h-8 text-pink-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* 광고주 관리 섹션 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold">광고주 관리</h2>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* 검색 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="회사명 또는 담당자 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64"
                  />
                </div>
                
                {/* 필터 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      filterStatus === 'all' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      filterStatus === 'pending' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    승인 대기
                  </button>
                  <button
                    onClick={() => setFilterStatus('verified')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      filterStatus === 'verified' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    승인됨
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 광고주 목록 */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
              </div>
            ) : filteredAdvertisers.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다.' : '광고주가 없습니다.'}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      회사 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      담당자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdvertisers.map((advertiser) => (
                    <motion.tr
                      key={advertiser.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {advertiser.company_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            사업자: {advertiser.business_registration}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {advertiser.contact_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {advertiser.contact_position}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {advertiser.users?.email || advertiser.contact_name + '@미확인'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {advertiser.contact_phone || '연락처 없음'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(advertiser.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {advertiser.is_verified ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            승인됨
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            대기중
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {!advertiser.is_verified && (
                            <>
                              <button
                                onClick={() => approveAdvertiser(advertiser.id)}
                                className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                title="승인"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => rejectAdvertiser(advertiser.id)}
                                className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                title="거절"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => startChatTest(advertiser)}
                            className="p-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                            title="채팅 테스트"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            title="상세보기"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 채팅 테스트 모달 */}
      <AnimatePresence>
        {showChatTest && selectedAdvertiser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">1:1 채팅 테스트</h3>
                  <p className="text-sm text-gray-500">
                    {selectedAdvertiser.company_name} - {selectedAdvertiser.contact_name}
                  </p>
                </div>
                <button 
                  onClick={() => setShowChatTest(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="text-center text-sm text-gray-500 mb-4">
                  채팅 테스트를 시작합니다
                </div>
                
                {/* 테스트 메시지 */}
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-3 max-w-xs">
                      <p className="text-sm font-semibold text-purple-600">인플루언서</p>
                      <p className="text-sm">안녕하세요! 캠페인에 관심이 있어서 지원했습니다.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-purple-600 text-white rounded-lg p-3 max-w-xs">
                      <p className="text-sm font-semibold">광고주</p>
                      <p className="text-sm">안녕하세요! 프로필 확인했습니다. 협업 진행하고 싶습니다.</p>
                    </div>
                  </div>
                </div>

                {/* 시스템 메시지 */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-800 mb-1">테스트 모드</p>
                      <p className="text-yellow-700">
                        실제 채팅 기능을 테스트하려면 DB에 messages 테이블이 필요합니다.
                        아래 메시지 전송을 통해 연동을 테스트할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                    placeholder="테스트 메시지를 입력하세요..."
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button 
                    onClick={sendTestMessage}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  메시지 전송 시 DB 연동을 테스트합니다
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}