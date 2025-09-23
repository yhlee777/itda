'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { hasAdvertiser, safeString, safeArray, safeNumber } from '@/utils/type-guards';

interface MessageButtonProps {
  advertiserId: string;
  advertiserName: string;
  campaignId: string;
  className?: string;
}

export function InfluencerMessageButton({ 
  advertiserId, 
  advertiserName, 
  campaignId,
  className = ''
}: MessageButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleStartChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 기존 채팅방 확인
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('advertiser_id', advertiserId)
        .eq('influencer_id', user.id)
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (existingRoom) {
        // 인플루언서 채팅 페이지로 이동
        router.push(`/chat/${existingRoom.id}`);
      } else {
        // 새 채팅방 생성
        const { data: newRoom, error } = await supabase
          .from('chat_rooms')
          .insert({
            advertiser_id: advertiserId,
            influencer_id: user.id,
            campaign_id: campaignId,
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;

        // 시스템 메시지
        await supabase.from('messages').insert({
          chat_room_id: newRoom.id,
          sender_id: user.id,
          sender_type: 'system',
          content: `${advertiserName}님과 대화를 시작했습니다.`,
          is_read: false
        });

        // 인플루언서 채팅 페이지로 이동
        router.push(`/chat/${newRoom.id}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('채팅을 시작할 수 없습니다');
    }
  };

  return (
    <button
      onClick={handleStartChat}
      className={`flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      메시지
    </button>
  );
}