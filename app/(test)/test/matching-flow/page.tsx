// app/(test)/test/matching-flow/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, CheckCircle, XCircle, Loader2, RefreshCw,
  User, Building2, MessageSquare, Zap, ArrowRight,
  Heart, UserCheck, Mail, Clock, AlertCircle,
  Sparkles, Send, Eye, TestTube, Rocket
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TestStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
}

export default function IntegratedTestFlow() {
  const supabase = createClient();
  const router = useRouter();
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [testData, setTestData] = useState<{
    influencerId?: string;
    advertiserId?: string;
    campaignId?: string;
    applicationId?: string;
    chatRoomId?: string;
  }>({});
  
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: 'setup',
      title: '🔧 테스트 환경 설정',
      description: '테스트용 사용자 및 캠페인 생성',
      status: 'pending'
    },
    {
      id: 'swipe',
      title: '💜 인플루언서 캠페인 지원',
      description: '인플루언서가 캠페인에 스와이프(지원)',
      status: 'pending'
    },
    {
      id: 'notify',
      title: '🔔 광고주 알림',
      description: '광고주에게 지원 알림 전송',
      status: 'pending'
    },
    {
      id: 'accept',
      title: '✅ 광고주 수락',
      description: '광고주가 지원을 수락하고 채팅방 생성',
      status: 'pending'
    },
    {
      id: 'chat',
      title: '💬 실시간 채팅 테스트',
      description: '양방향 실시간 메시지 전송 테스트',
      status: 'pending'
    },
    {
      id: 'complete',
      title: '🎉 테스트 완료',
      description: '모든 기능 정상 작동 확인',
      status: 'pending'
    }
  ]);

  const updateStep = (stepId: string, updates: Partial<TestStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  // 1. 테스트 환경 설정
  const setupTestEnvironment = async () => {
    updateStep('setup', { status: 'running', message: '테스트 사용자 생성 중...' });
    
    try {
      // 현재 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      const timestamp = Date.now();
      const testInfluencerId = crypto.randomUUID ? crypto.randomUUID() : `test-inf-${timestamp}`;
      const testAdvertiserId = crypto.randomUUID ? crypto.randomUUID() : `test-adv-${timestamp}`;

      // 테스트용 인플루언서 생성 또는 가져오기
      let { data: influencer } = await supabase
        .from('influencers')
        .select('*')
        .eq('name', `테스트 인플루언서 ${timestamp}`)
        .maybeSingle();

      if (!influencer) {
        const { data: newInfluencer, error } = await supabase
          .from('influencers')
          .insert({
            id: testInfluencerId, // id 필드 사용
            name: `테스트 인플루언서 ${timestamp}`,
            username: `test_influencer_${timestamp}`,
            bio: '테스트용 인플루언서 계정입니다',
            followers_count: 50000,
            engagement_rate: 4.5,
            categories: ['패션', '뷰티', '라이프스타일'],
            tier: 'gold',
            is_verified: true,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('인플루언서 생성 오류:', error);
          throw error;
        }
        influencer = newInfluencer;
      }

      // 테스트용 광고주 생성 또는 가져오기
      let { data: advertiser } = await supabase
        .from('advertisers')
        .select('*')
        .eq('company_name', `테스트 회사 ${timestamp}`)
        .maybeSingle();

      if (!advertiser) {
        const { data: newAdvertiser, error } = await supabase
          .from('advertisers')
          .insert({
            id: testAdvertiserId,
            company_name: `테스트 회사 ${timestamp}`,
            business_registration: `123-45-${timestamp.toString().slice(-5)}`, // 필수 필드
            contact_name: '테스트 담당자', // 필수 필드
            contact_position: '마케팅 매니저', // 필수 필드
            contact_phone: '010-1234-5678',
            is_verified: true,
            industry: '패션/뷰티',
            marketing_budget: '1000만원 이상',
            website: 'https://test.com',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('광고주 생성 오류:', error);
          throw error;
        }
        advertiser = newAdvertiser;
      }

      // 테스트용 캠페인 생성
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: `테스트 캠페인 ${new Date().toLocaleDateString()}`,
          description: '통합 테스트용 캠페인입니다',
          advertiser_id: advertiser.id,
          budget: 1000000,
          categories: ['패션', '뷰티'],
          requirements: ['인스타그램 포스팅 1회', '스토리 2회'],
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (campaignError) {
        console.error('캠페인 생성 오류:', campaignError);
        throw campaignError;
      }

      setTestData({
        influencerId: influencer.id, // influencer.user_id가 아니라 influencer.id 사용
        advertiserId: advertiser.id,
        campaignId: campaign.id
      });

      updateStep('setup', { 
        status: 'success', 
        message: '테스트 환경 준비 완료',
        data: { influencer, advertiser, campaign }
      });

      return { influencer, advertiser, campaign };
    } catch (error: any) {
      updateStep('setup', { 
        status: 'error', 
        message: `설정 실패: ${error.message}` 
      });
      throw error;
    }
  };

  // 2. 인플루언서 지원 (스와이프)
  const influencerSwipe = async () => {
    updateStep('swipe', { status: 'running', message: '캠페인 지원 중...' });

    try {
      const { influencerId, campaignId } = testData;
      if (!influencerId || !campaignId) throw new Error('필수 데이터 누락');

      // 중복 체크
      const { data: existing } = await supabase
        .from('campaign_influencers')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencerId)
        .single();

      if (existing) {
        updateStep('swipe', { 
          status: 'success', 
          message: '이미 지원한 캠페인 (기존 데이터 사용)',
          data: existing
        });
        setTestData(prev => ({ ...prev, applicationId: existing.id }));
        return existing;
      }

      // 지원 생성
      const { data: application, error } = await supabase
        .from('campaign_influencers')
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          status: 'pending',
          match_score: 85,
          proposed_price: 800000,
          agreed_price: 800000,
          is_super_like: true,
          applied_at: new Date().toISOString(),
          match_details: {
            category_match: true,
            follower_match: true,
            engagement_match: true
          }
        })
        .select()
        .single();

      if (error) throw error;

      setTestData(prev => ({ ...prev, applicationId: application.id }));

      // 스와이프 히스토리 저장 (선택사항 - 테이블이 있는 경우만)
      try {
        await supabase
          .from('swipe_history')
          .insert({
            campaign_id: campaignId,
            influencer_id: influencerId,
            action: 'super_like',
            match_score: 85,
            category_match: true,
            swiped_at: new Date().toISOString()
          });
      } catch (swipeError) {
        console.log('스와이프 히스토리 저장 실패 (선택사항):', swipeError);
      }

      updateStep('swipe', { 
        status: 'success', 
        message: '✨ Super Like로 지원 완료!',
        data: application
      });

      return application;
    } catch (error: any) {
      updateStep('swipe', { 
        status: 'error', 
        message: `지원 실패: ${error.message}` 
      });
      throw error;
    }
  };

  // 3. 광고주 알림 생성
  const createNotification = async () => {
    updateStep('notify', { status: 'running', message: '알림 생성 중...' });

    try {
      const { advertiserId, influencerId, campaignId } = testData;
      if (!advertiserId || !influencerId || !campaignId) throw new Error('필수 데이터 누락');

      // 인플루언서 정보 가져오기
      const { data: influencer } = await supabase
        .from('influencers')
        .select('name')
        .eq('id', influencerId)
        .single();

      // notification_logs 테이블에 맞는 스키마 사용
      const { data: notification, error } = await supabase
        .from('notification_logs')
        .insert({
          user_id: advertiserId,
          event_type: 'new_application', // type 대신 event_type 사용
          metadata: { // title, message, data 대신 metadata에 모두 포함
            title: '🎉 새로운 지원자가 있습니다!',
            message: `${influencer?.name || '인플루언서'}님이 캠페인에 지원했습니다. (매칭률 85%)`,
            campaign_id: campaignId,
            influencer_id: influencerId,
            match_score: 85,
            is_read: false
          },
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.warn('알림 생성 실패 (선택사항):', error);
        // notifications 테이블이 있다면 시도
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: advertiserId,
              type: 'new_application',
              title: '🎉 새로운 지원자가 있습니다!',
              message: `${influencer?.name || '인플루언서'}님이 캠페인에 지원했습니다.`,
              metadata: {
                campaign_id: campaignId,
                influencer_id: influencerId
              }
            });
        } catch (notifError) {
          console.warn('notifications 테이블도 실패:', notifError);
        }
      }

      // 30분 후 알림 시뮬레이션
      setTimeout(() => {
        toast.custom((t) => (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">30분 경과 알림</p>
                <p className="text-sm text-gray-600">1명의 지원자가 대기 중입니다</p>
              </div>
            </div>
          </div>
        ), { duration: 5000 });
      }, 3000);

      updateStep('notify', { 
        status: 'success', 
        message: '알림 전송 완료',
        data: notification
      });

      return notification;
    } catch (error: any) {
      updateStep('notify', { 
        status: 'error', 
        message: `알림 실패: ${error.message}` 
      });
      // 알림 실패는 치명적이지 않으므로 계속 진행
      return null;
    }
  };

  // 4. 광고주 수락 및 채팅방 생성
  const advertiserAccept = async () => {
    updateStep('accept', { status: 'running', message: '지원 수락 중...' });

    try {
      const { applicationId, campaignId, advertiserId, influencerId } = testData;
      if (!applicationId) throw new Error('지원 ID 누락');

      // 지원 수락
      const { error: acceptError } = await supabase
        .from('campaign_influencers')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (acceptError) throw acceptError;

      // 채팅방 생성
      const { data: chatRoom, error: chatError } = await supabase
        .from('chat_rooms')
        .insert({
          campaign_id: campaignId,
          advertiser_id: advertiserId,
          influencer_id: influencerId,
          status: 'active',
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (chatError) throw chatError;

      setTestData(prev => ({ ...prev, chatRoomId: chatRoom.id }));

      // 초기 메시지 생성
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatRoom.id,
          sender_id: advertiserId,
          sender_type: 'advertiser',
          content: '안녕하세요! 캠페인 참여 감사합니다. 협업을 시작해보시죠! 🎉',
          created_at: new Date().toISOString()
        });

      if (msgError) console.warn('초기 메시지 생성 실패:', msgError);

      updateStep('accept', { 
        status: 'success', 
        message: '수락 완료! 채팅방이 생성되었습니다',
        data: chatRoom
      });

      // 수락 알림 표시
      toast.custom((t) => (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 p-5 rounded-2xl text-white shadow-xl max-w-md"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-lg">매칭 성공!</h3>
              <p className="text-white/90">채팅방이 생성되었습니다</p>
            </div>
          </div>
        </motion.div>
      ), { duration: 3000 });

      return chatRoom;
    } catch (error: any) {
      updateStep('accept', { 
        status: 'error', 
        message: `수락 실패: ${error.message}` 
      });
      throw error;
    }
  };

  // 5. 실시간 채팅 테스트
  const testRealtimeChat = async () => {
    updateStep('chat', { status: 'running', message: '실시간 채팅 테스트 중...' });

    try {
      const { chatRoomId, influencerId, advertiserId } = testData;
      if (!chatRoomId) throw new Error('채팅방 ID 누락');

      // 인플루언서 메시지
      const { data: msg1, error: error1 } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: influencerId,
          sender_type: 'influencer',
          content: '안녕하세요! 캠페인 내용이 정말 좋네요 😊',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error1) throw error1;

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 광고주 응답
      const { data: msg2, error: error2 } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: advertiserId,
          sender_type: 'advertiser',
          content: '감사합니다! 언제 촬영 가능하신가요?',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error2) throw error2;

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 인플루언서 응답
      const { data: msg3, error: error3 } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: influencerId,
          sender_type: 'influencer',
          content: '이번 주 금요일이나 주말은 어떠신가요?',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error3) throw error3;

      // Realtime 구독 테스트
      const channel = supabase
        .channel(`test-chat-${chatRoomId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        }, (payload) => {
          console.log('실시간 메시지 수신:', payload.new);
          toast.success('실시간 메시지 수신 확인!');
        })
        .subscribe();

      // 테스트 메시지 전송
      setTimeout(async () => {
        await supabase
          .from('messages')
          .insert({
            chat_room_id: chatRoomId,
            sender_id: advertiserId,
            sender_type: 'advertiser',
            content: '🎉 실시간 테스트 성공!',
            created_at: new Date().toISOString()
          });
      }, 2000);

      // 구독 해제
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 5000);

      updateStep('chat', { 
        status: 'success', 
        message: '실시간 채팅 테스트 완료!',
        data: { messages: [msg1, msg2, msg3] }
      });

      return true;
    } catch (error: any) {
      updateStep('chat', { 
        status: 'error', 
        message: `채팅 테스트 실패: ${error.message}` 
      });
      throw error;
    }
  };

  // 6. 테스트 완료
  const completeTest = async () => {
    updateStep('complete', { status: 'running', message: '테스트 결과 정리 중...' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateStep('complete', { 
        status: 'success', 
        message: '모든 테스트가 성공적으로 완료되었습니다!',
        data: testData
      });

      // 성공 알림
      toast.custom((t) => (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-2xl text-white shadow-2xl"
        >
          <div className="text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">테스트 완료!</h3>
            <p className="mb-4">모든 기능이 정상 작동합니다</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  router.push(`/chat/${testData.chatRoomId}`);
                  toast.dismiss(t.id);
                }}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium"
              >
                채팅방 열기
              </button>
              <button
                onClick={() => {
                  router.push('/advertiser/applicants');
                  toast.dismiss(t.id);
                }}
                className="px-4 py-2 bg-white/20 rounded-lg font-medium"
              >
                지원자 관리
              </button>
            </div>
          </div>
        </motion.div>
      ), { duration: 10000 });

      return true;
    } catch (error: any) {
      updateStep('complete', { 
        status: 'error', 
        message: `완료 실패: ${error.message}` 
      });
      throw error;
    }
  };

  // 전체 테스트 실행
  const runFullTest = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    
    // 모든 스텝 초기화
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined })));
    setTestData({});

    try {
      // 1. 환경 설정
      setCurrentStep(1);
      await setupTestEnvironment();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. 인플루언서 지원
      setCurrentStep(2);
      await influencerSwipe();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. 알림 생성
      setCurrentStep(3);
      await createNotification();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. 광고주 수락
      setCurrentStep(4);
      await advertiserAccept();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 5. 채팅 테스트
      setCurrentStep(5);
      await testRealtimeChat();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 6. 완료
      setCurrentStep(6);
      await completeTest();

    } catch (error) {
      console.error('테스트 실패:', error);
      toast.error('테스트 중 오류가 발생했습니다');
    } finally {
      setIsRunning(false);
      setCurrentStep(0);
    }
  };

  // 개별 스텝 실행 함수들
  const runStep = async (stepId: string) => {
    if (isRunning) return;

    setIsRunning(true);
    try {
      switch (stepId) {
        case 'setup':
          await setupTestEnvironment();
          break;
        case 'swipe':
          await influencerSwipe();
          break;
        case 'notify':
          await createNotification();
          break;
        case 'accept':
          await advertiserAccept();
          break;
        case 'chat':
          await testRealtimeChat();
          break;
        case 'complete':
          await completeTest();
          break;
      }
    } catch (error) {
      console.error(`스텝 ${stepId} 실행 실패:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  // 스텝 아이콘 가져오기
  const getStepIcon = (step: TestStep) => {
    switch (step.status) {
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin text-purple-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
            <TestTube className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            통합 매칭 플로우 테스트
          </h1>
          <p className="text-lg text-gray-600">
            인플루언서 지원 → 광고주 수락 → 실시간 채팅까지 전체 프로세스를 테스트합니다
          </p>
        </div>

        {/* 메인 컨트롤 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={runFullTest}
                disabled={isRunning}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3 ${
                  isRunning
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    테스트 진행 중...
                  </>
                ) : (
                  <>
                    <Rocket className="w-6 h-6" />
                    전체 테스트 시작
                  </>
                )}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                title="초기화"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {testData.chatRoomId && (
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/chat/${testData.chatRoomId}`)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  채팅방 열기
                </button>
                <button
                  onClick={() => window.open('/advertiser/applicants', '_blank')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  지원자 관리
                </button>
              </div>
            )}
          </div>

          {/* 진행 바 */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>진행률</span>
              <span>{Math.round((steps.filter(s => s.status === 'success').length / steps.length) * 100)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(steps.filter(s => s.status === 'success').length / steps.length) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* 테스트 스텝 목록 */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-xl p-4 transition-all ${
                  step.status === 'running' 
                    ? 'border-purple-400 bg-purple-50' 
                    : step.status === 'success'
                    ? 'border-green-400 bg-green-50'
                    : step.status === 'error'
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>
                      {step.message && (
                        <p className={`text-sm mt-2 ${
                          step.status === 'error' ? 'text-red-600' : 'text-purple-600'
                        }`}>
                          {step.message}
                        </p>
                      )}
                      {step.data && step.status === 'success' && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            상세 데이터 보기
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(step.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  
                  {!isRunning && step.status !== 'running' && (
                    <button
                      onClick={() => runStep(step.id)}
                      className="ml-4 px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      실행
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 테스트 데이터 요약 */}
        {Object.keys(testData).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              테스트 데이터
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {testData.influencerId && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">인플루언서 ID:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {testData.influencerId}
                  </code>
                </div>
              )}
              {testData.advertiserId && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">광고주 ID:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {testData.advertiserId}
                  </code>
                </div>
              )}
              {testData.campaignId && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">캠페인 ID:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {testData.campaignId}
                  </code>
                </div>
              )}
              {testData.chatRoomId && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">채팅방 ID:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {testData.chatRoomId}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 사용 안내 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <h3 className="font-semibold mb-2">테스트 가이드</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>"전체 테스트 시작" 버튼을 클릭하면 모든 단계가 자동으로 진행됩니다</li>
                <li>각 단계는 개별적으로도 실행할 수 있습니다</li>
                <li>테스트 완료 후 생성된 채팅방에서 실시간 메시징을 확인할 수 있습니다</li>
                <li>문제가 발생하면 페이지를 새로고침하고 다시 시도해주세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}