// lib/campaign/actions.ts
// 타입 import 수정 및 타입 안전성 개선

import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import type { Campaign, Influencer } from '@/types/helpers'; // ✅ 수정된 import

/**
 * 인플루언서 스와이프 액션 (타입 안전성 개선)
 */
export async function saveSwipeAction(
  campaignId: string,
  influencerId: string,
  action: 'like' | 'pass' | 'super_like',
  metadata?: {
    match_score?: number;
    predicted_price?: number | null;
  }
) {
  const supabase = createClient();

  try {
    // 1. 스와이프 히스토리 저장
    const { error: swipeError } = await supabase
      .from('swipe_history')
      .insert({
        campaign_id: campaignId,
        influencer_id: influencerId,
        action: action,
        match_score: metadata?.match_score || null,
        category_match: true
      });

    if (swipeError) {
      console.error('Swipe history error:', swipeError);
      throw swipeError;
    }

    // 2. 좋아요인 경우 지원 처리
    if (action === 'like' || action === 'super_like') {
      // 중복 지원 체크
      const { data: existing, error: checkError } = await supabase
        .from('campaign_influencers')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencerId)
        .single();

      // single()은 데이터가 없으면 에러를 반환하므로, 에러가 있고 코드가 PGRST116이면 데이터가 없는 것
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Duplicate check error:', checkError);
        throw checkError;
      }

      if (existing) {
        return { success: false, error: 'Already applied' };
      }

      // 새 지원 생성
      const { error: applicationError } = await supabase
        .from('campaign_influencers')
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          status: 'pending',
          match_score: metadata?.match_score || 75,
          agreed_price: metadata?.predicted_price
        });

      if (applicationError) {
        // PostgreSQL unique violation error code
        if (applicationError.code === '23505') {
          return { success: false, error: 'Already applied' };
        }
        console.error('Application error:', applicationError);
        throw applicationError;
      }

      // 3. 캠페인 정보 가져오기 (advertiser_id null 체크)
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('advertiser_id, name')
        .eq('id', campaignId)
        .single();

      if (campaignError) {
        console.error('Campaign fetch error:', campaignError);
        // 캠페인 조회 실패해도 지원은 완료되었으므로 success 반환
        return { success: true };
      }

      // advertiser_id가 null이 아닌 경우에만 알림 생성
      if (campaignData?.advertiser_id) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: campaignData.advertiser_id,
            type: 'new_applicant',
            title: action === 'super_like' ? '⭐ 슈퍼 지원자!' : '새 지원자',
            message: `${campaignData.name} 캠페인에 새 지원자가 있습니다`,
            metadata: { 
              campaign_id: campaignId,
              influencer_id: influencerId,
              is_super_like: action === 'super_like',
              match_score: metadata?.match_score
            }
          });

        if (notificationError) {
          console.error('Notification error:', notificationError);
          // 알림 생성 실패는 무시 (지원은 이미 완료)
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Save swipe error:', error);
    return { success: false, error: error.message || 'Unknown error' };
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
    const { data: existing, error: checkError } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('advertiser_id', advertiserId)
      .eq('influencer_id', influencerId)
      .single();

    // 데이터가 없는 경우의 에러는 무시
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Chat room check error:', checkError);
      throw checkError;
    }

    if (existing?.id) {
      return { chatRoomId: existing.id, success: true };
    }

    // 새 채팅방 생성
    const { data: newRoom, error: createError } = await supabase
      .from('chat_rooms')
      .insert({
        campaign_id: campaignId,
        advertiser_id: advertiserId,
        influencer_id: influencerId,
        status: 'active',
        unread_advertiser: 0,
        unread_influencer: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Chat room creation error:', createError);
      throw createError;
    }

    if (!newRoom) {
      throw new Error('Failed to create chat room');
    }

    // 웰컴 메시지
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_room_id: newRoom.id,
        sender_id: advertiserId,
        sender_type: 'advertiser',
        content: '안녕하세요! 캠페인 협업 논의를 시작하겠습니다.',
        is_read: false
      });

    if (messageError) {
      console.error('Welcome message error:', messageError);
      // 메시지 생성 실패는 무시 (채팅방은 이미 생성됨)
    }

    // 인플루언서에게 알림
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: influencerId,
        type: 'application_accepted',
        title: '🎉 지원 수락!',
        message: '캠페인 지원이 수락되었습니다',
        metadata: { 
          campaign_id: campaignId,
          chat_room_id: newRoom.id 
        }
      });

    if (notificationError) {
      console.error('Notification error:', notificationError);
      // 알림 생성 실패는 무시
    }

    return { chatRoomId: newRoom.id, success: true };

  } catch (error: any) {
    console.error('Create chat error:', error);
    return { chatRoomId: null, success: false, error: error.message };
  }
}

/**
 * 캠페인 지원 상태 확인
 */
export async function checkApplicationStatus(
  campaignId: string,
  influencerId: string
): Promise<{
  applied: boolean;
  status?: string;
  match_score?: number;
}> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('campaign_influencers')
      .select('status, match_score')
      .eq('campaign_id', campaignId)
      .eq('influencer_id', influencerId)
      .single();

    if (error && error.code === 'PGRST116') {
      // 데이터가 없음 = 지원하지 않음
      return { applied: false };
    }

    if (error) {
      console.error('Check application error:', error);
      return { applied: false };
    }

    return {
      applied: true,
      status: data?.status || 'pending',
      match_score: data?.match_score || 0
    };
  } catch (error) {
    console.error('Check application error:', error);
    return { applied: false };
  }
}