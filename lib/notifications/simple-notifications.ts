// lib/notifications/simple-notifications.ts
// 실제 DB 타입을 그대로 사용하는 단순한 구조

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

// ====================================
// DB 타입 그대로 사용
// ====================================
type Notification = Database['public']['Tables']['notifications']['Row'];

// ====================================
// 메인 알림 Hook - 단순하게
// ====================================
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data);
        // null 체크 추가
        const unread = data.filter(n => n.is_read === false).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('알림 로드 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId 
          ? { ...n, is_read: true } 
          : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('읽음 처리 오류:', err);
    }
  }, []);
  
  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('모두 읽음 처리 오류:', err);
    }
  }, []);
  
  useEffect(() => {
    loadNotifications();
    
    // 30초마다 새로고침
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);
  
  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications
  };
}

// ====================================
// 광고주용 Hook
// ====================================
export function useAdvertiserNotifications() {
  const { notifications, ...rest } = useNotifications();
  
  // 광고주 관련 알림만 필터링
  const advertiserNotifications = notifications.filter(n => 
    ['new_applicant', 'super_like', 'high_match', 'applicant_summary'].includes(n.type)
  );
  
  return {
    notifications: advertiserNotifications,
    ...rest
  };
}

// ====================================
// 인플루언서용 Hook  
// ====================================
export function useInfluencerNotifications() {
  const { notifications, ...rest } = useNotifications();
  
  // 인플루언서 관련 알림만 필터링
  const influencerNotifications = notifications.filter(n =>
    ['ai_recommendation', 'new_campaigns', 'proposal_accepted', 'campaign_matched'].includes(n.type)
  );
  
  return {
    notifications: influencerNotifications,
    ...rest
  };
}

// ====================================
// Push 알림 Hook (브라우저)
// ====================================
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(window.Notification.permission);
    }
  }, []);
  
  const subscribe = async () => {
    if (!('Notification' in window)) {
      console.log('브라우저가 알림을 지원하지 않습니다');
      return false;
    }
    
    const result = await window.Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      new window.Notification('알림 활성화!', {
        body: 'ITDA 알림을 받을 수 있습니다.',
        icon: '/logo.png'
      });
    }
    
    return result === 'granted';
  };
  
  return {
    permission,
    subscribe,
    canShow: permission === 'granted'
  };
}

// ====================================
// 액션 함수들 - 단순 버전
// ====================================

// 1. 캠페인 생성
export async function handleCampaignCreate(campaignData: any) {
  const supabase = createClient();
  
  try {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();
    
    return { campaign, error };
  } catch (err) {
    return { campaign: null, error: err };
  }
}

// 2. 인플루언서 스와이프
export async function handleInfluencerSwipe(
  campaignId: string,
  influencerId: string,
  action: 'like' | 'super_like' | 'pass'
) {
  const supabase = createClient();
  
  try {
    // 스와이프 기록
    await supabase.from('swipe_history').insert({
      campaign_id: campaignId,
      influencer_id: influencerId,
      action
    });
    
    // 슈퍼라이크면 광고주에게 알림
    if (action === 'super_like') {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('advertiser_id')
        .eq('id', campaignId)
        .single();
      
      if (campaign?.advertiser_id) {
        await supabase.from('notifications').insert({
          user_id: campaign.advertiser_id,
          type: 'super_like',
          title: '⭐ 슈퍼라이크!',
          message: '인플루언서가 큰 관심을 보였습니다.',
          metadata: { campaign_id: campaignId, influencer_id: influencerId }
        });
      }
    }
    
    return { success: true };
  } catch (err) {
    console.error('스와이프 오류:', err);
    return { success: false };
  }
}

// 3. 제안 수락
export async function handleProposalAcceptance(
  campaignId: string,
  influencerId: string,
  advertiserId: string
) {
  const supabase = createClient();
  
  try {
    // 상태 업데이트
    await supabase
      .from('campaign_influencers')
      .update({ status: 'accepted' })
      .eq('campaign_id', campaignId)
      .eq('influencer_id', influencerId);
    
    // 채팅방 생성
    const { data: chatRoom } = await supabase
      .from('chat_rooms')
      .insert({
        campaign_id: campaignId,
        advertiser_id: advertiserId,
        influencer_id: influencerId,
        status: 'active'
      })
      .select()
      .single();
    
    // 인플루언서에게 알림
    await supabase.from('notifications').insert({
      user_id: influencerId,
      type: 'proposal_accepted',
      title: '✅ 제안 수락!',
      message: '광고주가 제안을 수락했습니다.',
      metadata: { 
        campaign_id: campaignId,
        chat_room_id: chatRoom?.id 
      }
    });
    
    return { success: true, chatRoom };
  } catch (err) {
    console.error('제안 수락 오류:', err);
    return { success: false };
  }
}

// 4. AI 추천
export async function handleAIRecommendation(
  influencerId: string,
  campaignId: string,
  matchScore: number
) {
  if (matchScore < 90) {
    return { notified: false };
  }
  
  const supabase = createClient();
  
  try {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('name')
      .eq('id', campaignId)
      .single();
    
    await supabase.from('notifications').insert({
      user_id: influencerId,
      type: 'ai_recommendation',
      title: '🎯 AI 추천',
      message: `${matchScore}% 매칭! "${campaign?.name || '캠페인'}"`,
      metadata: { 
        campaign_id: campaignId,
        match_score: matchScore 
      }
    });
    
    return { notified: true };
  } catch (err) {
    console.error('AI 추천 오류:', err);
    return { notified: false };
  }
}

// 5. 새 캠페인 알림
export async function handleNewCampaignsAdded(
  category: string,
  campaigns: any[]
) {
  const supabase = createClient();
  
  try {
    // 관심 카테고리 인플루언서 조회
    const { data: influencers } = await supabase
      .from('influencers')
      .select('id')
      .contains('categories', [category]);
    
    if (!influencers || influencers.length === 0) {
      return { notifiedCount: 0 };
    }
    
    // 배치 알림 생성
    const notifications = influencers.map(inf => ({
      user_id: inf.id,
      type: 'new_campaigns',
      title: '📊 새 캠페인',
      message: `${category}에 ${campaigns.length}개 캠페인 추가`,
      metadata: {
        category,
        campaign_ids: campaigns.map(c => c.id)
      }
    }));
    
    await supabase.from('notifications').insert(notifications);
    
    return { notifiedCount: influencers.length };
  } catch (err) {
    console.error('새 캠페인 알림 오류:', err);
    return { notifiedCount: 0 };
  }
}

// ====================================
// 유틸리티 함수들
// ====================================

// 알림 아이콘 가져오기
export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    'super_like': '⭐',
    'new_applicant': '👤',
    'ai_recommendation': '🤖',
    'new_campaigns': '📊',
    'proposal_accepted': '✅',
    'campaign_matched': '🎉',
    'payment_received': '💸',
    'new_message': '💬',
    'high_match': '🎯'
  };
  return icons[type] || '🔔';
}

// 알림 시간 포맷
export function formatNotificationTime(dateString: string | null): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  return date.toLocaleDateString('ko-KR');
}

// 알림 색상
export function getNotificationColor(type: string): string {
  const colors: Record<string, string> = {
    'super_like': 'bg-yellow-50 text-yellow-700',
    'high_match': 'bg-purple-50 text-purple-700',
    'proposal_accepted': 'bg-green-50 text-green-700',
    'ai_recommendation': 'bg-blue-50 text-blue-700',
    'new_campaigns': 'bg-gray-50 text-gray-700'
  };
  return colors[type] || 'bg-gray-50 text-gray-700';
}