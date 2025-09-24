// lib/actions/swipe-actions.ts
'use server';

import { createServerComponentClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveSwipeAction(
  campaignId: string,
  influencerId: string,
  action: 'like' | 'pass' | 'super_like',
  metadata?: any
) {
  const supabase = createServerComponentClient();
  
  try {
    // 1. 스와이프 히스토리 저장
    const { error: swipeError } = await supabase
      .from('swipe_history')
      .insert({
        influencer_id: influencerId,
        campaign_id: campaignId,
        action: action,
        match_score: metadata?.match_score,
        category_match: metadata?.category_match || false
      });
    
    if (swipeError && swipeError.code !== '23505') { // 중복 제외
      throw swipeError;
    }
    
    // 2. Like 또는 Super Like인 경우 매칭 처리
    if (action === 'like' || action === 'super_like') {
      // 캠페인 정보 가져오기
      const { data: campaign } = await supabase
        .from('campaigns')
        .select(`
          *,
          advertisers!inner(*)
        `)
        .eq('id', campaignId)
        .single();
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      // 인플루언서 정보 가져오기
      const { data: influencer } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', influencerId)
        .single();
      
      if (!influencer) {
        throw new Error('Influencer not found');
      }
      
      // campaign_influencers에 매칭 기록
      const { data: existingMatch } = await supabase
        .from('campaign_influencers')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencerId)
        .single();
      
      if (!existingMatch) {
        const { error: matchError } = await supabase
          .from('campaign_influencers')
          .insert({
            campaign_id: campaignId,
            influencer_id: influencerId,
            match_score: metadata?.match_score || 80,
            match_details: {
              action: action,
              predicted_price: metadata?.predicted_price,
              timestamp: new Date().toISOString()
            },
            status: 'pending',
            agreed_price: metadata?.predicted_price || campaign.budget
          });
        
        if (matchError) {
          console.error('Match error:', matchError);
        }
        
        // 채팅방 생성
        if (campaign.advertisers?.id) {
          const { error: chatError } = await supabase
            .from('chat_rooms')
            .insert({
              campaign_id: campaignId,
              advertiser_id: campaign.advertisers.id,
              influencer_id: influencerId,
              status: 'active'
            });
          
          if (chatError && chatError.code !== '23505') {
            console.error('Chat room creation error:', chatError);
          }
        }
        
        // Super Like인 경우 광고주에게 즉시 알림
        if (action === 'super_like' && campaign.advertisers?.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: campaign.advertisers.id,
              type: 'super_like',
              title: '⭐ 슈퍼 라이크!',
              message: `${influencer.name || influencer.username}님이 캠페인에 큰 관심을 보였습니다!`,
              metadata: {
                campaign_id: campaignId,
                influencer_id: influencerId,
                match_score: metadata?.match_score
              },
              priority: 'high'
            });
        }
        
        // 일반 알림
        if (campaign.advertisers?.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: campaign.advertisers.id,
              type: 'new_applicant',
              title: '새로운 지원자',
              message: `${influencer.name || influencer.username}님이 캠페인에 지원했습니다.`,
              metadata: {
                campaign_id: campaignId,
                influencer_id: influencerId,
                match_score: metadata?.match_score
              }
            });
        }
      }
    }
    
    // 3. 캠페인 통계 업데이트
    if (action === 'like' || action === 'super_like') {
      await supabase.rpc('increment', {
        table_name: 'campaigns',
        column_name: 'like_count',
        row_id: campaignId
      });
      
      await supabase.rpc('increment', {
        table_name: 'campaigns',
        column_name: 'application_count',
        row_id: campaignId
      });
    }
    
    // 조회수는 항상 증가
    await supabase.rpc('increment', {
      table_name: 'campaigns',
      column_name: 'view_count',
      row_id: campaignId
    });
    
    // 4. 인플루언서 일일 스와이프 카운트 업데이트
    const today = new Date().toISOString().split('T')[0];
    const { data: currentCount } = await supabase
      .from('influencers')
      .select('daily_swipes_count, last_swipe_date')
      .eq('id', influencerId)
      .single();
    
    const isNewDay = currentCount?.last_swipe_date !== today;
    const newCount = isNewDay ? 1 : (currentCount?.daily_swipes_count || 0) + 1;
    
    await supabase
      .from('influencers')
      .update({
        daily_swipes_count: newCount,
        last_swipe_date: today,
        last_swipe_at: new Date().toISOString()
      })
      .eq('id', influencerId);
    
    revalidatePath('/campaigns');
    
    return {
      success: true,
      matched: action === 'like' || action === 'super_like'
    };
    
  } catch (error) {
    console.error('Swipe action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 일일 스와이프 제한 체크
export async function checkDailySwipeLimit(influencerId: string) {
  const supabase = createServerComponentClient();
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('influencers')
      .select('daily_swipes_count, last_swipe_date')
      .eq('id', influencerId)
      .single();
    
    if (!data) return { canSwipe: true, remaining: 10 };
    
    // 날짜가 다르면 리셋
    if (data.last_swipe_date !== today) {
      return { canSwipe: true, remaining: 10 };
    }
    
    const remaining = Math.max(0, 10 - (data.daily_swipes_count || 0));
    
    return {
      canSwipe: remaining > 0,
      remaining: remaining
    };
    
  } catch (error) {
    console.error('Check daily limit error:', error);
    return { canSwipe: true, remaining: 10 };
  }
}

// 캠페인 큐 새로고침
export async function refreshCampaignQueue(influencerId: string) {
  const supabase = createServerComponentClient();
  
  try {
    // 만료된 큐 항목 삭제
    await supabase
      .from('campaign_queue')
      .delete()
      .eq('influencer_id', influencerId)
      .lt('expires_at', new Date().toISOString());
    
    revalidatePath('/campaigns');
    
    return { success: true };
  } catch (error) {
    console.error('Refresh queue error:', error);
    return { success: false };
  }
}