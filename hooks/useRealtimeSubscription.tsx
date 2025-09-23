// hooks/useRealtimeSubscription.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import { hasAdvertiser, safeString, safeArray, safeNumber } from '@/utils/type-guards';

// 실시간 이벤트 타입
type RealtimeEvent = 
  | 'new_application'
  | 'campaign_matched'
  | 'message_received'
  | 'campaign_updated'
  | 'price_predicted'
  | 'contract_proposed';

interface RealtimeConfig {
  userId: string;
  userType: 'influencer' | 'advertiser';
  onNewApplication?: (payload: any) => void;
  onCampaignMatched?: (payload: any) => void;
  onMessageReceived?: (payload: any) => void;
  onCampaignUpdated?: (payload: any) => void;
  onPricePredicted?: (payload: any) => void;
  onContractProposed?: (payload: any) => void;
}

export function useRealtimeSubscription(config: RealtimeConfig) {
  const supabase = createClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    if (!config.userId) return;

    // 실시간 채널 생성
    const newChannel = supabase.channel(`realtime:${config.userId}`, {
      config: {
        presence: {
          key: config.userId,
        },
      },
    });

    // 광고주용 구독
    if (config.userType === 'advertiser') {
      // 새로운 지원자 알림
      newChannel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_influencers',
          filter: `advertiser_id=eq.${config.userId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('New application received:', payload);
          setLastEvent({ type: 'new_application', data: payload.new });
          
          if (config.onNewApplication) {
            config.onNewApplication(payload.new);
          }
          
          // 토스트 알림
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      새로운 인플루언서가 지원했습니다! 🎉
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      매칭 점수: {payload.new?.match_score || 0}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-purple-600 hover:text-purple-500 focus:outline-none"
                >
                  확인
                </button>
              </div>
            </div>
          ), {
            duration: 5000,
            position: 'top-right',
          });
        }
      );

      // AI 가격 예측 완료
      newChannel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'price_predictions',
          filter: `advertiser_id=eq.${config.userId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Price predicted:', payload);
          setLastEvent({ type: 'price_predicted', data: payload.new });
          
          if (config.onPricePredicted) {
            config.onPricePredicted(payload.new);
          }
          
          toast.success(`AI 단가 분석 완료: ₩${payload.new?.predicted_price?.toLocaleString()}`, {
            icon: '🤖',
            duration: 4000,
          });
        }
      );
    }

    // 인플루언서용 구독
    if (config.userType === 'influencer') {
      // 매칭 완료 알림
      newChannel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaign_influencers',
          filter: `influencer_id=eq.${config.userId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.new?.status === 'accepted' && payload.old?.status === 'pending') {
            console.log('Application accepted:', payload);
            setLastEvent({ type: 'campaign_matched', data: payload.new });
            
            if (config.onCampaignMatched) {
              config.onCampaignMatched(payload.new);
            }
            
            toast.success('축하합니다! 캠페인에 선정되었습니다! 🎊', {
              duration: 6000,
              position: 'top-center',
            });
          }
        }
      );

      // 새 캠페인 알림
      newChannel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_queue',
          filter: `influencer_id=eq.${config.userId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('New campaign in queue:', payload);
          toast('새로운 캠페인이 도착했어요! 🚀', {
            icon: '📢',
            duration: 3000,
          });
        }
      );
    }

    // 공통: 메시지 수신
    newChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      async (payload: RealtimePostgresChangesPayload<any>) => {
        // 자신이 보낸 메시지는 무시
        if (payload.new?.sender_id === config.userId) return;
        
        // 해당 채팅방 참여자인지 확인
        const { data: chatRoom } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', payload.new?.chat_room_id)
          .single();
        
        if (chatRoom && (
          chatRoom.advertiser_id === config.userId || 
          chatRoom.influencer_id === config.userId
        )) {
          console.log('Message received:', payload);
          setLastEvent({ type: 'message_received', data: payload.new });
          
          if (config.onMessageReceived) {
            config.onMessageReceived(payload.new);
          }
          
          // 브라우저 알림 (권한이 있는 경우)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('새 메시지', {
              body: payload.new?.content?.substring(0, 50) || '새로운 메시지가 도착했습니다',
              icon: '/icon-192x192.png',
              tag: 'message',
              requireInteraction: false,
            });
          } else {
            toast('새로운 메시지가 있습니다 💬', {
              duration: 3000,
            });
          }
        }
      }
    );

    // 공통: 계약 제안
    newChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'contract_proposals',
      },
      (payload: RealtimePostgresChangesPayload<any>) => {
        if (payload.new?.proposed_to === config.userId) {
          console.log('Contract proposed:', payload);
          setLastEvent({ type: 'contract_proposed', data: payload.new });
          
          if (config.onContractProposed) {
            config.onContractProposed(payload.new);
          }
          
          toast.custom((t) => (
            <div className="max-w-md w-full bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-xl shadow-2xl">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    📄
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">새로운 계약 제안</p>
                    <p className="text-sm text-gray-600">
                      ₩{payload.new?.proposed_price?.toLocaleString()} 제안
                    </p>
                  </div>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ), {
            duration: 6000,
            position: 'top-center',
          });
        }
      }
    );

    // Presence 구독 (온라인 상태)
    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState();
        console.log('Presence state:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      });

    // 구독 시작
    newChannel.subscribe((status) => {
      console.log('Realtime subscription status:', status);
      setIsConnected(status === 'SUBSCRIBED');
      
      if (status === 'SUBSCRIBED') {
        toast.success('실시간 연결 성공 ✅', {
          duration: 2000,
          position: 'bottom-right',
        });
      } else if (status === 'CHANNEL_ERROR') {
        toast.error('실시간 연결 오류', {
          duration: 3000,
          position: 'bottom-right',
        });
      }
    });

    setChannel(newChannel);

    // 클린업
    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [config.userId, config.userType]);

  // 수동으로 재연결
  const reconnect = useCallback(() => {
    if (channel) {
      channel.subscribe();
    }
  }, [channel]);

  // 수동으로 연결 해제
  const disconnect = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
      setIsConnected(false);
    }
  }, [channel, supabase]);

  // Presence 업데이트 (온라인 상태 전송)
  const updatePresence = useCallback((state: any) => {
    if (channel && isConnected) {
      channel.track(state);
    }
  }, [channel, isConnected]);

  return {
    isConnected,
    lastEvent,
    reconnect,
    disconnect,
    updatePresence,
    channel,
  };
}

// 브라우저 알림 권한 요청 헬퍼
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}