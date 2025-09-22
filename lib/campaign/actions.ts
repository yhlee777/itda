// lib/campaign/actions.ts
// 타입 에러 완전 해결 버전

import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

/**
 * 인플루언서 스와이프 액션
 */
export async function saveSwipeAction(
  campaignId: string,
  influencerId: string,
  action: 'like' | 'pass' | 'super_like'
) {
  const supabase = createClient();

  try {
    // 1. 스와이프 히스토리 저장
    await supabase
      .from('swipe_history')
      .insert({
        campaign_id: campaignId,
        influencer_id: influencerId,
        action: action,
        category_match: true
      });

    // 2. 좋아요인 경우 지원 처리
    if (action === 'like' || action === 'super_like') {
      await supabase
        .from('campaign_influencers')
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          status: 'pending',
          match_score: 75
        });

      // 3. 광고주 알림 (null 체크 추가)
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('advertiser_id')
        .eq('id', campaignId)
        .single();

      // advertiser_id가 null이 아닌 경우에만 알림 생성
      if (campaignData?.advertiser_id) {
        await supabase.from('notifications').insert({
          user_id: campaignData.advertiser_id,
          type: 'new_applicant' as const,
          title: '새 지원자',
          message: '캠페인에 새 지원자가 있습니다',
          metadata: { campaign_id: campaignId }
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Save swipe error:', error);
    return { success: false };
  }
}

/**
 * 지원 수락 시 채팅방 자동 생성
 */
export async function createChatOnAccept(
  campaignId: string,
  advertiserId: string,
  influencerId: string
) {
  const supabase = createClient();

  try {
    // 기존 채팅방 체크
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('advertiser_id', advertiserId)
      .eq('influencer_id', influencerId)
      .single();

    if (existing?.id) {
      return { chatRoomId: existing.id };
    }

    // 새 채팅방 생성
    const { data: newRoom } = await supabase
      .from('chat_rooms')
      .insert({
        campaign_id: campaignId,
        advertiser_id: advertiserId,
        influencer_id: influencerId,
        status: 'active'
      })
      .select()
      .single();

    if (newRoom?.id) {
      // 웰컴 메시지
      await supabase.from('messages').insert({
        chat_room_id: newRoom.id,
        sender_id: advertiserId,
        content: '안녕하세요! 캠페인 협업 논의를 시작하겠습니다.',
        is_read: false
      });

      // 인플루언서에게 알림
      await supabase.from('notifications').insert({
        user_id: influencerId,
        type: 'application_accepted' as const,
        title: '🎉 지원 수락!',
        message: '캠페인 지원이 수락되었습니다',
        metadata: { 
          campaign_id: campaignId,
          chat_room_id: newRoom.id 
        }
      });

      return { chatRoomId: newRoom.id };
    }

    return { chatRoomId: null };
  } catch (error) {
    console.error('Create chat error:', error);
    return { chatRoomId: null };
  }
}