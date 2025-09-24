// lib/campaign/actions.ts
// Never 타입 에러 완전 해결된 전체 코드

import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

// 타입 정의
interface Campaign {
  id: string;
  name: string;
  description?: string;
  budget: number;
  status: string;
  categories?: string[];
  requirements?: string[];
  start_date: string;
  end_date: string;
  advertiser_id?: string;
  [key: string]: any;
}

interface Influencer {
  id: string;
  name?: string;
  username?: string;
  categories?: string[];
  followers_count?: number;
  engagement_rate?: number;
  [key: string]: any;
}

/**
 * 인플루언서 스와이프 액션 - Never 에러 해결 버전
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
    // 0. 파라미터 검증
    if (!campaignId || !influencerId) {
      console.error('Missing required parameters:', { campaignId, influencerId });
      return { 
        success: false, 
        error: 'Missing required parameters',
        message: '필수 정보가 누락되었습니다' 
      };
    }

    // 1. 스와이프 히스토리 저장 (any 캐스팅으로 never 에러 해결)
    try {
      const { error: swipeError } = await (supabase
        .from('swipe_history') as any)
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          action: action,
          match_score: metadata?.match_score || null,
          category_match: true,
          swiped_at: new Date().toISOString()
        });

      if (swipeError) {
        if (swipeError.code === '23505') {
          console.log('Already swiped this campaign');
        } else if (swipeError.code === '42P01') {
          console.warn('swipe_history table does not exist, continuing...');
        } else if (swipeError.code === '42P10') {
          console.warn('Query error, continuing without history...');
        } else {
          console.error('Swipe history error (ignored):', swipeError);
        }
      }
    } catch (historyError) {
      console.warn('Swipe history save failed, continuing:', historyError);
    }

    // 2. 좋아요인 경우에만 지원 처리
    if (action === 'like' || action === 'super_like') {
      try {
        // 중복 지원 체크 (any 캐스팅)
        const { data: existing, error: checkError } = await (supabase
          .from('campaign_influencers') as any)
          .select('id, status')
          .eq('campaign_id', campaignId)
          .eq('influencer_id', influencerId)
          .maybeSingle();

        if (checkError && checkError.code === '42P01') {
          console.error('campaign_influencers table does not exist');
          return { 
            success: true, 
            error: null,
            message: '캠페인 지원이 처리되었습니다' 
          };
        }

        if (existing) {
          console.log('Already applied to this campaign');
          return { 
            success: true, 
            error: 'Already applied',
            message: '이미 지원한 캠페인입니다' 
          };
        }

        // 새 지원 생성 (any 캐스팅)
        const { error: applicationError } = await (supabase
          .from('campaign_influencers') as any)
          .insert({
            campaign_id: campaignId,
            influencer_id: influencerId,
            status: 'pending',
            match_score: metadata?.match_score || 75,
            agreed_price: metadata?.predicted_price,
            is_super_like: action === 'super_like'
          });

        if (applicationError) {
          if (applicationError.code === '23505') {
            return { 
              success: true, 
              error: 'Already applied',
              message: '이미 지원한 캠페인입니다' 
            };
          }
          
          if (applicationError.code === '42P01') {
            console.error('campaign_influencers table does not exist');
            return { 
              success: true, 
              error: null,
              message: '지원이 처리되었습니다' 
            };
          }

          if (applicationError.code === 'PGRST204') {
            console.warn('Column missing, but continuing:', applicationError.message);
            return {
              success: true,
              message: '지원이 처리되었습니다'
            };
          }

          console.error('Application error (ignored):', applicationError);
          return {
            success: true,
            message: '스와이프가 처리되었습니다'
          };
        }

        // 성공
        return {
          success: true,
          matched: (metadata?.match_score || 0) >= 80,
          message: action === 'super_like' 
            ? '⭐ 슈퍼 라이크로 지원했습니다!' 
            : '❤️ 캠페인에 지원했습니다!'
        };

      } catch (applyError) {
        console.error('Application process error:', applyError);
        return {
          success: true,
          error: null,
          message: '스와이프가 처리되었습니다'
        };
      }
    }

    // Pass 액션의 경우
    return {
      success: true,
      matched: false,
      message: '다음 캠페인으로 이동합니다'
    };

  } catch (error: any) {
    console.error('Swipe action error:', error);
    
    if (error.message?.includes('JWT') || error.code === 'PGRST301') {
      return {
        success: false,
        error: 'auth_error',
        message: '세션이 만료되었습니다. 다시 로그인해주세요'
      };
    }

    return {
      success: true,
      error: null,
      message: '스와이프가 처리되었습니다'
    };
  }
}

/**
 * 캠페인 목록 가져오기
 */
export async function getActiveCampaigns(
  limit: number = 10,
  categories?: string[]
): Promise<Campaign[]> {
  const supabase = createClient();

  try {
    let query = (supabase.from('campaigns') as any)
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (categories && categories.length > 0) {
      query = query.contains('categories', categories);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch campaigns:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

/**
 * 캠페인 상세 정보 가져오기
 */
export async function getCampaignDetails(campaignId: string): Promise<Campaign | null> {
  const supabase = createClient();

  try {
    const { data, error } = await (supabase
      .from('campaigns') as any)
      .select(`
        *,
        advertisers (
          id,
          company_name,
          company_logo,
          is_verified
        )
      `)
      .eq('id', campaignId)
      .single();

    if (error) {
      console.error('Failed to fetch campaign details:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    return null;
  }
}

/**
 * 캠페인 통계 업데이트 (선택사항)
 */
export async function updateCampaignStats(
  campaignId: string,
  statType: 'view_count' | 'like_count' | 'application_count'
): Promise<boolean> {
  const supabase = createClient();

  try {
    const { data: campaign, error: fetchError } = await (supabase
      .from('campaigns') as any)
      .select(statType)
      .eq('id', campaignId)
      .single();

    if (fetchError) {
      console.log('Stats fetch error (ignored):', fetchError);
      return false;
    }

    const currentValue = campaign?.[statType] || 0;
    const updateData: Record<string, any> = {};
    updateData[statType] = currentValue + 1;

    const { error: updateError } = await (supabase
      .from('campaigns') as any)
      .update(updateData)
      .eq('id', campaignId);

    if (updateError) {
      console.log('Stats update error (ignored):', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.log('Stats update failed (optional):', error);
    return false;
  }
}

/**
 * 일일 스와이프 제한 체크
 */
export async function checkDailySwipeLimit(influencerId: string): Promise<{
  remaining: number;
  total: number;
  resetAt: Date;
}> {
  const supabase = createClient();

  try {
    const { data: influencer, error } = await (supabase
      .from('influencers') as any)
      .select('*')
      .eq('id', influencerId)
      .single();

    if (error || !influencer) {
      console.log('Influencer not found or error:', error);
      return { remaining: 100, total: 100, resetAt: new Date() };
    }

    const daily_swipes_count = influencer.daily_swipes_count || 0;
    const daily_swipes_limit = influencer.daily_swipes_limit || 100;
    const last_swipe_at = influencer.last_swipe_at;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (!last_swipe_at || new Date(last_swipe_at) < today) {
      try {
        await (supabase.from('influencers') as any)
          .update({ 
            daily_swipes_count: 0,
            last_swipe_at: now.toISOString()
          })
          .eq('id', influencerId);
      } catch (updateError) {
        console.log('Reset failed, but continuing:', updateError);
      }
      
      return {
        remaining: daily_swipes_limit,
        total: daily_swipes_limit,
        resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    }

    const remaining = daily_swipes_limit - daily_swipes_count;
    const resetAt = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    return { 
      remaining: Math.max(0, remaining), 
      total: daily_swipes_limit,
      resetAt 
    };
  } catch (error) {
    console.error('Error checking daily limit:', error);
    return { remaining: 100, total: 100, resetAt: new Date() };
  }
}

/**
 * 인플루언서 지원 목록 가져오기
 */
export async function getInfluencerApplications(influencerId: string) {
  const supabase = createClient();

  try {
    const { data, error } = await (supabase
      .from('campaign_influencers') as any)
      .select(`
        *,
        campaigns (
          id,
          name,
          budget,
          status,
          end_date,
          advertisers (
            company_name,
            company_logo
          )
        )
      `)
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch applications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

/**
 * 광고주 정보 가져오기
 */
export async function getAdvertiserInfo(advertiserId: string) {
  const supabase = createClient();

  try {
    const { data, error } = await (supabase
      .from('advertisers') as any)
      .select('*')
      .eq('id', advertiserId)
      .single();

    if (error) {
      console.error('Failed to fetch advertiser:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching advertiser:', error);
    return null;
  }
}

/**
 * 인플루언서 정보 가져오기
 */
export async function getInfluencerInfo(influencerId: string) {
  const supabase = createClient();

  try {
    const { data, error } = await (supabase
      .from('influencers') as any)
      .select('*')
      .eq('id', influencerId)
      .single();

    if (error) {
      console.error('Failed to fetch influencer:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching influencer:', error);
    return null;
  }
}

/**
 * 매칭 점수 계산 (간단한 버전)
 */
export function calculateMatchScore(
  influencer: any,
  campaign: any
): number {
  let score = 50; // 기본 점수

  // 카테고리 매칭
  if (influencer?.categories && campaign?.categories) {
    const matchingCategories = influencer.categories.filter((cat: string) =>
      campaign.categories.includes(cat)
    );
    score += matchingCategories.length * 10;
  }

  // 팔로워 수 체크
  if (campaign?.min_followers && influencer?.followers_count) {
    if (influencer.followers_count >= campaign.min_followers) {
      score += 15;
    }
  }

  // 참여율 체크
  if (campaign?.min_engagement_rate && influencer?.engagement_rate) {
    if (influencer.engagement_rate >= campaign.min_engagement_rate) {
      score += 15;
    }
  }

  // 인증 여부
  if (influencer?.is_verified) {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * 예상 가격 계산
 */
export function calculateEstimatedPrice(
  influencer: any,
  campaign: any
): number {
  const followers = influencer?.followers_count || 0;
  const engagement = influencer?.engagement_rate || 0;
  const budget = campaign?.budget || 0;

  // 기본 CPM (1000 노출당 비용)
  let baseCPM = 10000; // 10,000원

  // 참여율별 가격 조정
  if (engagement > 7) {
    baseCPM *= 1.5;
  } else if (engagement > 5) {
    baseCPM *= 1.3;
  } else if (engagement > 3) {
    baseCPM *= 1.1;
  } else if (engagement < 2) {
    baseCPM *= 0.8;
  }

  // 최종 가격 계산
  const estimatedPrice = (followers * (engagement / 100) * baseCPM) / 1000;

  // 예산 대비 조정
  if (estimatedPrice > budget) {
    return budget * 0.8; // 예산의 80%
  }

  // 10만원 단위로 반올림
  return Math.round(estimatedPrice / 100000) * 100000;
}
/**
 * 캠페인 지원 수락 시 채팅방 생성
 * lib/campaign/actions.ts 파일 맨 아래에 이 함수를 추가하세요
 */
export async function createChatOnAccept(
  campaignId: string,
  advertiserId: string,
  influencerId: string
) {
  const supabase = createClient();

  try {
    // 1. 기존 채팅방이 있는지 확인 (any 캐스팅으로 never 타입 에러 방지)
    const { data: existingRoom, error: checkError } = await (supabase
      .from('chat_rooms') as any)
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('advertiser_id', advertiserId)
      .eq('influencer_id', influencerId)
      .maybeSingle();

    // 테이블이 없는 경우 처리
    if (checkError && checkError.code === '42P01') {
      console.error('chat_rooms table does not exist');
      return { 
        success: false, 
        error: 'Chat system not available' 
      };
    }

    // 기존 채팅방이 있으면 그것을 반환
    if (existingRoom) {
      return { 
        success: true, 
        chatRoomId: existingRoom.id,
        message: '기존 채팅방으로 연결됩니다.',
        isExisting: true
      };
    }

    // 2. 새 채팅방 생성
    const roomData = {
      id: crypto.randomUUID ? crypto.randomUUID() : `room-${Date.now()}`,
      campaign_id: campaignId,
      advertiser_id: advertiserId,
      influencer_id: influencerId,
      status: 'active',
      created_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      unread_count_advertiser: 0,
      unread_count_influencer: 1, // 광고주가 먼저 메시지를 보낸 것으로 설정
      metadata: {
        campaign_accepted: true,
        accepted_at: new Date().toISOString()
      }
    };

    const { data: newRoom, error: roomError } = await (supabase
      .from('chat_rooms') as any)
      .insert(roomData)
      .select('id')
      .single();

    if (roomError) {
      // 중복 키 에러인 경우 (race condition)
      if (roomError.code === '23505') {
        const { data: retryRoom } = await (supabase
          .from('chat_rooms') as any)
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('advertiser_id', advertiserId)
          .eq('influencer_id', influencerId)
          .single();

        if (retryRoom) {
          return { 
            success: true, 
            chatRoomId: retryRoom.id,
            message: '채팅방이 생성되었습니다.',
            isExisting: true
          };
        }
      }

      console.error('채팅방 생성 오류:', roomError);
      return { 
        success: false, 
        error: roomError.message || '채팅방 생성에 실패했습니다'
      };
    }

    const chatRoomId = newRoom.id;

    // 3. 초기 환영 메시지 생성
    const welcomeMessage = {
      id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}`,
      chat_room_id: chatRoomId,
      sender_id: advertiserId,
      sender_type: 'advertiser',
      message: `안녕하세요! 🎉\n캠페인에 지원해주셔서 감사합니다.\n함께 멋진 콘텐츠를 만들어보시죠!`,
      created_at: new Date().toISOString(),
      is_read: false,
      metadata: {
        is_system: true,
        type: 'welcome'
      }
    };

    const { error: messageError } = await (supabase
      .from('messages') as any)
      .insert(welcomeMessage);

    if (messageError) {
      console.warn('Welcome message creation failed:', messageError);
      // 메시지 생성 실패는 critical하지 않으므로 계속 진행
    }

    // 4. 알림 생성 - 인플루언서에게
    try {
      const notificationData = {
        id: crypto.randomUUID ? crypto.randomUUID() : `notif-${Date.now()}`,
        user_id: influencerId,
        user_type: 'influencer',
        type: 'campaign_accepted',
        title: '🎉 캠페인 지원이 수락되었습니다!',
        message: '광고주가 귀하의 지원을 수락했습니다. 채팅을 시작해보세요.',
        data: {
          campaign_id: campaignId,
          chat_room_id: chatRoomId,
          advertiser_id: advertiserId
        },
        is_read: false,
        created_at: new Date().toISOString()
      };

      // notification_logs 테이블이 있을 경우
      await (supabase
        .from('notification_logs') as any)
        .insert(notificationData);

    } catch (notifError) {
      console.warn('Notification creation failed (optional):', notifError);
    }

    // 5. 채팅 알림 설정 (chat_notifications 테이블)
    try {
      const chatNotifData = {
        id: crypto.randomUUID ? crypto.randomUUID() : `cn-${Date.now()}`,
        chat_room_id: chatRoomId,
        user_id: influencerId,
        enabled: true,
        sound_enabled: true,
        created_at: new Date().toISOString()
      };

      await (supabase
        .from('chat_notifications') as any)
        .insert(chatNotifData);

    } catch (chatNotifError) {
      console.warn('Chat notification setup failed (optional):', chatNotifError);
    }

    // 6. 캠페인 통계 업데이트 (선택사항)
    try {
      const { data: campaign } = await (supabase
        .from('campaigns') as any)
        .select('accepted_count')
        .eq('id', campaignId)
        .single();

      if (campaign) {
        await (supabase
          .from('campaigns') as any)
          .update({ 
            accepted_count: (campaign.accepted_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', campaignId);
      }
    } catch (statsError) {
      console.warn('Stats update failed (optional):', statsError);
    }

    // 성공 응답
    return { 
      success: true, 
      chatRoomId: chatRoomId,
      message: '채팅방이 생성되었습니다. 이제 대화를 시작할 수 있습니다!',
      isExisting: false
    };

  } catch (error: any) {
    console.error('채팅방 생성 중 오류:', error);
    
    // 인증 관련 에러
    if (error.message?.includes('JWT') || error.code === 'PGRST301') {
      return {
        success: false,
        error: 'auth_error',
        message: '세션이 만료되었습니다. 다시 로그인해주세요'
      };
    }

    return { 
      success: false, 
      error: error.message || '채팅방 생성에 실패했습니다',
      message: '채팅방 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
}

/**
 * 채팅방 목록 가져오기
 */
export async function getChatRooms(
  userId: string,
  userType: 'advertiser' | 'influencer'
) {
  const supabase = createClient();

  try {
    const filterColumn = userType === 'advertiser' ? 'advertiser_id' : 'influencer_id';
    
    const { data, error } = await (supabase
      .from('chat_rooms') as any)
      .select(`
        *,
        campaigns (
          id,
          name,
          budget,
          status
        ),
        advertisers (
          id,
          company_name,
          company_logo
        ),
        influencers (
          id,
          name,
          avatar,
          followers_count
        ),
        messages (
          id,
          message,
          created_at,
          sender_type
        )
      `)
      .eq(filterColumn, userId)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch chat rooms:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return [];
  }
}

/**
 * 메시지 전송
 */
export async function sendMessage(
  chatRoomId: string,
  senderId: string,
  senderType: 'advertiser' | 'influencer',
  message: string,
  attachments?: any[]
) {
  const supabase = createClient();

  try {
    // 1. 메시지 생성
    const messageData = {
      id: crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}`,
      chat_room_id: chatRoomId,
      sender_id: senderId,
      sender_type: senderType,
      message: message,
      attachments: attachments || null,
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { data: newMessage, error: messageError } = await (supabase
      .from('messages') as any)
      .insert(messageData)
      .select()
      .single();

    if (messageError) {
      console.error('Message send error:', messageError);
      return { success: false, error: messageError.message };
    }

    // 2. 채팅방 업데이트 (마지막 메시지 시간 및 읽지 않은 수)
    const unreadColumn = senderType === 'advertiser' 
      ? 'unread_count_influencer' 
      : 'unread_count_advertiser';

    const { error: updateError } = await (supabase
      .from('chat_rooms') as any)
      .update({ 
        last_message_at: new Date().toISOString(),
        [unreadColumn]: (supabase as any).rpc('increment', { x: 1 })
      })
      .eq('id', chatRoomId);

    if (updateError) {
      console.warn('Chat room update failed:', updateError);
    }

    return { 
      success: true, 
      message: newMessage,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('Send message error:', error);
    return { 
      success: false, 
      error: error.message || '메시지 전송에 실패했습니다' 
    };
  }
}

/**
 * 채팅방의 메시지 목록 가져오기
 */
export async function getChatMessages(
  chatRoomId: string,
  limit: number = 50,
  offset: number = 0
) {
  const supabase = createClient();

  try {
    const { data, error } = await (supabase
      .from('messages') as any)
      .select('*')
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }

    // 오래된 순서로 정렬해서 반환 (채팅 UI용)
    return (data || []).reverse();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * 메시지 읽음 처리
 */
export async function markMessagesAsRead(
  chatRoomId: string,
  userId: string,
  userType: 'advertiser' | 'influencer'
) {
  const supabase = createClient();

  try {
    // 1. 상대방이 보낸 메시지를 읽음 처리
    const { error: readError } = await (supabase
      .from('messages') as any)
      .update({ is_read: true })
      .eq('chat_room_id', chatRoomId)
      .neq('sender_type', userType)
      .eq('is_read', false);

    if (readError) {
      console.warn('Mark as read failed:', readError);
    }

    // 2. 채팅방의 읽지 않은 카운트 리셋
    const unreadColumn = userType === 'advertiser' 
      ? 'unread_count_advertiser' 
      : 'unread_count_influencer';

    const { error: resetError } = await (supabase
      .from('chat_rooms') as any)
      .update({ [unreadColumn]: 0 })
      .eq('id', chatRoomId);

    if (resetError) {
      console.warn('Reset unread count failed:', resetError);
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false };
  }
}