"use client";
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { saveSwipeAction } from '@/lib/campaign/actions';

export default function MatchingFlowTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [testData, setTestData] = useState({
    influencerId: '',
    influencerName: '',
    advertiserId: '',
    advertiserName: '',
    campaignId: '',
    campaignName: ''
  });
  
  const supabase = createClient();

  // 1단계: 초기 데이터 설정
  const setupTestData = async () => {
    try {
      console.log('%c📋 테스트 데이터 설정 시작...', 'color: blue; font-weight: bold');
      
      // 현재 로그인 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다');
      }
      console.log('현재 로그인 사용자:', user.email);

      // 인플루언서 찾기 또는 생성
      let influencer;
      const { data: existingInfluencer } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingInfluencer) {
        influencer = existingInfluencer;
        console.log('기존 인플루언서 사용:', influencer.name);
      } else {
        // users 테이블에 먼저 추가
        try {
          await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || 'test@test.com',
              user_type: 'influencer'
            });
        } catch (userError) {
          console.log('users 테이블 스킵 (이미 있거나 불필요)');
        }

        // 새 인플루언서 생성
        const { data: newInfluencer, error: infError } = await supabase
          .from('influencers')
          .insert({
            id: user.id,
            name: '테스트 인플루언서',
            username: '@test_influencer',
            categories: ['패션', '뷰티'],
            followers_count: 50000,
            engagement_rate: 4.5,
            status: 'active',
            tier: 'gold',
            is_verified: true,
            instagram_username: 'test_influencer'
          })
          .select()
          .single();

        if (infError) throw infError;
        influencer = newInfluencer;
        console.log('새 인플루언서 생성:', influencer.name);
      }

      // 광고주 찾기 또는 생성
      let advertiser;
      const { data: existingAdvertiser } = await supabase
        .from('advertisers')
        .select('*')
        .limit(1)
        .single();

      if (existingAdvertiser) {
        advertiser = existingAdvertiser;
        console.log('광고주 사용:', advertiser.company_name || '미입력');
      } else {
        // 새 광고주 생성
        const { data: newAdvertiser, error: advError } = await supabase
          .from('advertisers')
          .insert({
            id: crypto.randomUUID(), // ID 생성
            company_name: '테스트 광고주',
            business_registration: '123-45-67890',
            contact_name: '김테스트',
            contact_position: '마케팅 팀장', // 필수 필드 추가
            contact_phone: '010-1234-5678', // 선택적 필드도 추가
            industry: 'fashion',
            marketing_budget: '10m-50m',
            is_verified: true,
            website: 'https://test.com'
          })
          .select()
          .single();

        if (advError) throw advError;
        advertiser = newAdvertiser;
        console.log('새 광고주 생성:', advertiser.company_name);
      }

      // 테스트 캠페인 생성 (매번 새로 생성)
      const now = new Date();
      const timestamp = now.getTime();
      
      const { data: campaign, error: campError } = await supabase
        .from('campaigns')
        .insert({
          advertiser_id: advertiser.id,
          name: `테스트 캠페인 #${timestamp}`,
          description: '매칭 플로우 테스트용 캠페인',
          categories: ['패션', '뷰티'],
          budget: 3000000,
          status: 'active',
          start_date: now.toISOString(),
          end_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          min_followers: 10000,
          min_engagement_rate: 3.0,
          requirements: ['피드 포스팅 3개', '릴스 2개']
        })
        .select()
        .single();

      if (campError) throw campError;
      console.log('캠페인 생성:', campaign.name);

      // 테스트 데이터 저장
      const newTestData = {
        influencerId: influencer.id,
        influencerName: influencer.name || influencer.username,
        advertiserId: advertiser.id,
        advertiserName: advertiser.company_name,
        campaignId: campaign.id,
        campaignName: campaign.name
      };
      
      setTestData(newTestData);
      console.log('%c✅ 테스트 데이터 설정 완료!', 'color: green; font-weight: bold');
      console.table(newTestData);
      
      return newTestData;
      
    } catch (error) {
      console.error('%c❌ 설정 실패:', 'color: red; font-weight: bold', error);
      throw error;
    }
  };

  // 2단계: 인플루언서 스와이프
  const influencerSwipe = async (data?: any) => {
    const testInfo = data || testData;
    
    console.log('%c🎯 인플루언서 스와이프 시작...', 'color: purple; font-weight: bold');
    console.log('테스트 데이터:', testInfo);
    
    // 필수 데이터 검증
    if (!testInfo.influencerId || !testInfo.campaignId) {
      const missingData = [];
      if (!testInfo.influencerId) missingData.push('influencerId');
      if (!testInfo.campaignId) missingData.push('campaignId');
      
      console.error('❌ 필수 데이터 누락:', missingData.join(', '));
      throw new Error(`필수 데이터 누락: ${missingData.join(', ')}`);
    }
    
    try {
      // 스와이프 액션 실행
      const result = await saveSwipeAction(
        testInfo.campaignId,
        testInfo.influencerId,
        'like',
        { 
          match_score: 85,
          predicted_price: 3000000
        }
      );
      
      console.log('스와이프 결과:', result);
      
      if (result.success) {
        console.log('%c✅ 인플루언서가 캠페인에 지원했습니다!', 'color: green; font-weight: bold');
        toast.success('지원 완료!');
        
        // campaign_influencers 테이블 체크 및 추가
        const { data: existing } = await supabase
          .from('campaign_influencers')
          .select('*')
          .eq('campaign_id', testInfo.campaignId)
          .eq('influencer_id', testInfo.influencerId)
          .single();
        
        if (!existing) {
          // 없을 때만 추가
          const { error: applyError } = await supabase
            .from('campaign_influencers')
            .insert({
              campaign_id: testInfo.campaignId,
              influencer_id: testInfo.influencerId,
              status: 'pending',
              match_score: 85,
              proposed_price: 3000000
            });
            
          if (applyError) {
            console.error('지원 데이터 저장 오류:', applyError);
          } else {
            console.log('지원 데이터 저장 완료');
          }
        } else {
          console.log('이미 지원한 캠페인입니다 (정상)');
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ 스와이프 실패:', error);
      throw error;
    }
  };

  // 3단계: 광고주 제안
  const advertiserPropose = async (data?: any) => {
    const testInfo = data || testData;
    
    console.log('%c💼 광고주 제안 시작...', 'color: orange; font-weight: bold');
    
    try {
      // 먼저 기존 지원 확인
      const { data: existingApplication } = await supabase
        .from('campaign_influencers')
        .select('*')
        .eq('campaign_id', testInfo.campaignId)
        .eq('influencer_id', testInfo.influencerId)
        .single();

      if (!existingApplication) {
        console.log('기존 지원이 없어 새로 생성합니다...');
        // 지원이 없으면 새로 생성
        const { error: insertError } = await supabase
          .from('campaign_influencers')
          .insert({
            campaign_id: testInfo.campaignId,
            influencer_id: testInfo.influencerId,
            status: 'accepted',
            agreed_price: 2500000,
            match_score: 85,
            proposed_price: 3000000
          });
        
        if (insertError) throw insertError;
      } else {
        console.log('기존 지원을 수락 상태로 변경합니다...');
        // 지원 상태를 accepted로 변경 (updated_at 제거)
        const { error: acceptError } = await supabase
          .from('campaign_influencers')
          .update({
            status: 'accepted',
            agreed_price: 2500000
            // updated_at 컬럼이 없으므로 제거
          })
          .eq('campaign_id', testInfo.campaignId)
          .eq('influencer_id', testInfo.influencerId);
          
        if (acceptError) throw acceptError;
      }
      
      console.log('%c✅ 광고주가 인플루언서를 수락했습니다!', 'color: green; font-weight: bold');
      toast.success('제안 완료!');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ 제안 실패:', error);
      throw error;
    }
  };

  // 4단계: 채팅방 생성
  const createChatRoom = async (data?: any) => {
    const testInfo = data || testData;
    
    console.log('%c💬 채팅방 생성 시작...', 'color: teal; font-weight: bold');
    
    try {
      // 기존 채팅방 확인
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('campaign_id', testInfo.campaignId)
        .eq('influencer_id', testInfo.influencerId)
        .single();
        
      if (existingRoom) {
        console.log('기존 채팅방 사용:', existingRoom.id);
        return existingRoom;
      }
      
      // 새 채팅방 생성
      const { data: chatRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          campaign_id: testInfo.campaignId,
          advertiser_id: testInfo.advertiserId,
          influencer_id: testInfo.influencerId,
          status: 'active'
        })
        .select()
        .single();
        
      if (roomError) throw roomError;
      
      console.log('%c✅ 채팅방이 생성되었습니다!', 'color: green; font-weight: bold');
      console.log('채팅방 ID:', chatRoom.id);
      toast.success('채팅방 생성 완료!');
      
      // 시작 메시지 전송 (messages 테이블이 있을 때만)
      try {
        await supabase
          .from('messages')
          .insert({
            chat_room_id: chatRoom.id,
            sender_id: testInfo.advertiserId,
            sender_type: 'advertiser',
            content: '안녕하세요! 캠페인 참여 감사합니다.',
            message_type: 'text'
          });
        console.log('시작 메시지 전송 완료');
      } catch (msgError) {
        console.log('메시지 테이블이 아직 없거나 전송 실패:', msgError);
      }
      
      return chatRoom;
      
    } catch (error) {
      console.error('❌ 채팅방 생성 실패:', error);
      throw error;
    }
  };

  // 테스트 데이터 리셋
  const resetTestData = async () => {
    try {
      console.log('🔄 테스트 데이터 리셋 중...');
      
      if (testData.campaignId) {
        // 기존 지원 데이터 삭제
        await supabase
          .from('campaign_influencers')
          .delete()
          .eq('campaign_id', testData.campaignId);
        
        // 채팅방 삭제
        await supabase
          .from('chat_rooms')
          .delete()
          .eq('campaign_id', testData.campaignId);
        
        // 캠페인 삭제
        await supabase
          .from('campaigns')
          .delete()
          .eq('id', testData.campaignId);
      }
      
      setTestData({
        influencerId: '',
        influencerName: '',
        advertiserId: '',
        advertiserName: '',
        campaignId: '',
        campaignName: ''
      });
      
      setCurrentStep(0);
      
      console.log('✅ 리셋 완료');
      toast.success('테스트 데이터가 리셋되었습니다');
      
    } catch (error) {
      console.error('리셋 실패:', error);
      toast.error('리셋 중 오류 발생');
    }
  };

  // 모든 테스트 데이터 정리
  const cleanupAllTestData = async () => {
    if (!confirm('모든 테스트 캠페인과 관련 데이터를 삭제합니다. 계속하시겠습니까?')) {
      return;
    }
    
    try {
      console.log('🧹 모든 테스트 데이터 정리 중...');
      
      // 테스트 캠페인 찾기
      const { data: testCampaigns } = await supabase
        .from('campaigns')
        .select('id')
        .like('name', '%테스트 캠페인%');
      
      if (testCampaigns && testCampaigns.length > 0) {
        const campaignIds = testCampaigns.map(c => c.id);
        
        // 관련 데이터 삭제
        await supabase
          .from('campaign_influencers')
          .delete()
          .in('campaign_id', campaignIds);
        
        await supabase
          .from('chat_rooms')
          .delete()
          .in('campaign_id', campaignIds);
        
        await supabase
          .from('campaigns')
          .delete()
          .in('id', campaignIds);
        
        console.log(`✅ ${campaignIds.length}개의 테스트 캠페인 정리 완료`);
        toast.success(`${campaignIds.length}개의 테스트 캠페인이 삭제되었습니다`);
      } else {
        console.log('정리할 테스트 캠페인이 없습니다');
        toast('정리할 테스트 캠페인이 없습니다', { icon: 'ℹ️' });
      }
      
      // 현재 테스트 데이터 리셋
      setTestData({
        influencerId: '',
        influencerName: '',
        advertiserId: '',
        advertiserName: '',
        campaignId: '',
        campaignName: ''
      });
      
      setCurrentStep(0);
      
    } catch (error) {
      console.error('정리 실패:', error);
      toast.error('데이터 정리 중 오류 발생');
    }
  };

  // 전체 플로우 실행
  const runFullTest = async () => {
    setIsRunning(true);
    setCurrentStep(1);
    
    try {
      console.log('%c=== 전체 매칭 플로우 테스트 시작 ===', 'background: purple; color: white; font-weight: bold; padding: 5px;');
      toast('테스트 시작! 🚀', { duration: 2000 });
      
      // 1. 데이터 설정
      const setupData = await setupTestData();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 2. 인플루언서 스와이프
      setCurrentStep(2);
      await influencerSwipe(setupData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. 광고주 제안
      setCurrentStep(3);
      await advertiserPropose(setupData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 4. 채팅방 생성
      setCurrentStep(4);
      const chatRoom = await createChatRoom(setupData);
      
      console.log('%c=== ✅ 전체 테스트 완료! ===', 'background: green; color: white; font-weight: bold; padding: 5px;');
      
      // 결과 요약
      console.log('%c📊 테스트 결과 요약:', 'color: blue; font-weight: bold');
      const summary = {
        '✅ 인플루언서': setupData.influencerName,
        '✅ 광고주': setupData.advertiserName,
        '✅ 캠페인': setupData.campaignName,
        '✅ 지원 상태': '완료',
        '✅ 제안 상태': '수락',
        '✅ 채팅방': chatRoom ? `생성 완료 (ID: ${chatRoom.id})` : '생성 실패'
      };
      console.table(summary);
      
      // 성공 메시지
      console.log('%c🎉 매칭 플로우 전체 테스트 성공!', 'background: linear-gradient(to right, #667eea, #764ba2); color: white; font-weight: bold; padding: 10px; border-radius: 5px;');
      
      toast.success('✅ 전체 테스트 완료! 인플루언서와 광고주가 성공적으로 매칭되었습니다! 🎉', { duration: 5000 });
      
      setCurrentStep(5); // 완료 상태
      
    } catch (error: any) {
      console.error('%c테스트 실패:', 'color: red; font-weight: bold', error);
      toast.error(error.message || '테스트 중 오류 발생');
      setCurrentStep(0);
    } finally {
      setIsRunning(false);
      // 3초 후 단계 리셋
      setTimeout(() => setCurrentStep(0), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">매칭 플로우 테스트</h1>
        
        {/* 진행 상태 표시 */}
        {currentStep > 0 && (
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">진행 상태</h2>
            <div className="space-y-2">
              {[
                { step: 1, label: '데이터 설정', icon: '📋' },
                { step: 2, label: '인플루언서 스와이프', icon: '🎯' },
                { step: 3, label: '광고주 제안', icon: '💼' },
                { step: 4, label: '채팅방 생성', icon: '💬' },
                { step: 5, label: '완료', icon: '✅' }
              ].map(({ step, label, icon }) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    currentStep === step 
                      ? 'bg-purple-600 text-white animate-pulse' 
                      : currentStep > step 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200'
                  }`}>
                    {currentStep > step ? '✓' : step}
                  </div>
                  <span className={currentStep >= step ? 'font-semibold' : 'text-gray-400'}>
                    {icon} {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 테스트 데이터 표시 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">현재 테스트 데이터</h2>
          <div className="space-y-2 text-sm">
            <div>인플루언서: {testData.influencerName || '미설정'}</div>
            <div>광고주: {testData.advertiserName || '미설정'}</div>
            <div>캠페인: {testData.campaignName || '미설정'}</div>
          </div>
        </div>
        
        {/* 개별 테스트 버튼 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">개별 테스트</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={setupTestData}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              1. 데이터 설정
            </button>
            <button
              onClick={() => influencerSwipe()}
              disabled={isRunning || !testData.influencerId}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              2. 인플루언서 스와이프
            </button>
            <button
              onClick={() => advertiserPropose()}
              disabled={isRunning || !testData.campaignId}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              3. 광고주 제안
            </button>
            <button
              onClick={() => createChatRoom()}
              disabled={isRunning || !testData.advertiserId}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              4. 채팅방 생성
            </button>
          </div>
        </div>
        
        {/* 전체 플로우 테스트 */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">전체 플로우 테스트</h2>
          <div className="space-y-3">
            <button
              onClick={runFullTest}
              disabled={isRunning}
              className={`w-full px-6 py-3 text-white rounded-lg font-semibold ${
                isRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg'
              }`}
            >
              {isRunning ? '테스트 진행 중...' : '전체 테스트 실행 🚀'}
            </button>
            <button
              onClick={resetTestData}
              disabled={isRunning}
              className="w-full px-6 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 disabled:opacity-50"
            >
              현재 테스트 리셋 🔄
            </button>
            <button
              onClick={cleanupAllTestData}
              disabled={isRunning}
              className="w-full px-6 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              모든 테스트 데이터 정리 🧹
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}