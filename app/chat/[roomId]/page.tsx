// app/(chat)/chat/[roomId]/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Paperclip, Image, MoreVertical, 
  ArrowLeft, Phone, Video, Info, Smile,
  Check, CheckCheck, Clock, Shield, Star,
  DollarSign, Calendar, FileText, AlertCircle,
  Loader2, Camera, Mic, X
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { format, isSameDay, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Database } from '@/types/database.types';

// DB 타입 가져오기
type Tables = Database['public']['Tables'];
type MessageRow = Tables['messages']['Row'];
type ChatRoomRow = Tables['chat_rooms']['Row'];

// 확장된 타입 정의
interface Message extends MessageRow {
  sender?: {
    name: string;
    avatar: string;
    user_type: 'influencer' | 'advertiser';
  };
}

interface ChatRoom extends ChatRoomRow {
  campaign?: {
    id: string;
    name: string;
    budget: number;
    categories: string[] | null;
  };
  advertiser?: {
    id: string;
    company_name: string;
    company_logo: string | null;
  };
  influencer?: {
    id: string;
    name: string;
    avatar: string | null;
    followers_count: number | null;
    engagement_rate: number | null;
    is_verified: boolean | null;
  };
}

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const supabase = createClient();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<'influencer' | 'advertiser'>('influencer');
  const [otherUserInfo, setOtherUserInfo] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchChatRoom();
    fetchMessages();
    const unsubscribe = setupRealtimeSubscription();
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      unsubscribe?.();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatRoom = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUser(user);

      // 채팅방 정보 가져오기
      const { data: room, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          campaigns (id, name, budget, categories),
          advertisers (id, company_name, company_logo),
          influencers (id, name, avatar, followers_count, engagement_rate, is_verified)
        `)
        .eq('id', roomId)
        .single();

      if (error) throw error;

      setChatRoom(room as ChatRoom);

      // 사용자 타입 확인
      if (room.advertiser_id === user.id) {
        setUserType('advertiser');
        setOtherUserInfo(room.influencers);
      } else {
        setUserType('influencer');
        setOtherUserInfo(room.advertisers);
      }
    } catch (error) {
      console.error('Error fetching chat room:', error);
      toast.error('채팅방 정보를 불러오는데 실패했습니다');
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', roomId) // room_id → chat_room_id
        .order('created_at', { ascending: true });

      if (error) throw error;

      // 각 메시지에 발신자 정보 추가
      const messagesWithSender = await Promise.all(
        (data || []).map(async (msg) => {
          let senderInfo;
          
          // 발신자가 광고주인지 인플루언서인지 확인
          if (chatRoom?.advertiser_id === msg.sender_id) {
            senderInfo = {
              name: chatRoom.advertiser?.company_name || '광고주',
              avatar: chatRoom.advertiser?.company_logo || '/default-company.png',
              user_type: 'advertiser' as const
            };
          } else {
            senderInfo = {
              name: chatRoom?.influencer?.name || '인플루언서',
              avatar: chatRoom?.influencer?.avatar || '/default-avatar.png',
              user_type: 'influencer' as const
            };
          }

          return {
            ...msg,
            sender: senderInfo
          };
        })
      );

      setMessages(messagesWithSender);
      markMessagesAsRead();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!currentUser) return;

    await supabase
      .from('messages')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString() 
      })
      .eq('chat_room_id', roomId)
      .neq('sender_id', currentUser.id)
      .is('read_at', null);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_room_id=eq.${roomId}` // room_id → chat_room_id
      }, async (payload) => {
        const newMsg = payload.new as MessageRow;
        
        // 발신자 정보 추가
        let senderInfo;
        if (chatRoom?.advertiser_id === newMsg.sender_id) {
          senderInfo = {
            name: chatRoom.advertiser?.company_name || '광고주',
            avatar: chatRoom.advertiser?.company_logo || '/default-company.png',
            user_type: 'advertiser' as const
          };
        } else {
          senderInfo = {
            name: chatRoom?.influencer?.name || '인플루언서',
            avatar: chatRoom?.influencer?.avatar || '/default-avatar.png',
            user_type: 'influencer' as const
          };
        }

        setMessages(prev => [...prev, { ...newMsg, sender: senderInfo }]);
        
        if (newMsg.sender_id !== currentUser?.id) {
          markMessagesAsRead();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || sending) return;

    setSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_room_id: roomId, // room_id → chat_room_id
          sender_id: currentUser.id,
          content: messageContent, // message → content
          sender_type: userType,
          message_type: 'text'
        });

      if (error) throw error;

      // 알림 생성 (상대방에게)
      const recipientId = chatRoom?.advertiser_id === currentUser.id 
        ? chatRoom?.influencer_id 
        : chatRoom?.advertiser_id;

      if (recipientId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: recipientId,
            type: 'new_message',
            title: '새 메시지',
            message: `${userType === 'advertiser' ? chatRoom?.advertiser?.company_name : chatRoom?.influencer?.name}님이 메시지를 보냈습니다`,
            metadata: { 
              chat_room_id: roomId,
              sender_id: currentUser.id 
            }
          });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('메시지 전송에 실패했습니다');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();

    if (isSameDay(messageDate, now)) {
      return format(messageDate, 'HH:mm', { locale: ko });
    }
    
    return formatDistanceToNow(messageDate, { 
      addSuffix: true, 
      locale: ko 
    });
  };

  const renderMessageGroup = (messages: Message[], date: Date) => {
    const dateString = isSameDay(date, new Date()) 
      ? '오늘' 
      : format(date, 'yyyy년 MM월 dd일', { locale: ko });

    return (
      <div key={date.toISOString()}>
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-500">{dateString}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${
              message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender_id !== currentUser?.id && (
              <img
                src={message.sender?.avatar || '/default-avatar.png'}
                alt={message.sender?.name}
                className="w-8 h-8 rounded-full mr-2"
              />
            )}

            <div
              className={`max-w-[70%] ${
                message.sender_id === currentUser?.id
                  ? 'order-1'
                  : 'order-2'
              }`}
            >
              {message.sender_id !== currentUser?.id && (
                <div className="text-xs text-gray-500 mb-1">
                  {message.sender?.name}
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-2 ${
                  message.sender_id === currentUser?.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <span>{formatMessageTime(message.created_at || new Date().toISOString())}</span>
                {message.sender_id === currentUser?.id && (
                  message.read_at ? (
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const groupMessagesByDate = () => {
    const groups = new Map<string, Message[]>();
    
    messages.forEach((message) => {
      const date = format(new Date(message.created_at || new Date()), 'yyyy-MM-dd');
      const existing = groups.get(date) || [];
      groups.set(date, [...existing, message]);
    });

    return Array.from(groups.entries()).map(([date, msgs]) => ({
      date: new Date(date),
      messages: msgs
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500">채팅방을 찾을 수 없습니다</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  userType === 'advertiser'
                    ? otherUserInfo?.avatar || '/default-avatar.png'
                    : otherUserInfo?.company_logo || '/default-company.png'
                }
                alt="프로필"
                className="w-10 h-10 rounded-full object-cover"
              />
              {otherUserInfo?.is_verified && (
                <Shield className="w-4 h-4 text-blue-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">
                  {userType === 'advertiser'
                    ? otherUserInfo?.name
                    : otherUserInfo?.company_name}
                </h2>
              </div>
              
              {chatRoom.campaign && (
                <p className="text-xs text-gray-500">
                  {chatRoom.campaign.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 캠페인 정보 바 */}
      {chatRoom.campaign && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                {chatRoom.campaign.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                ₩{chatRoom.campaign.budget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {groupMessagesByDate().map(({ date, messages }) => 
          renderMessageGroup(messages, date)
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>입력 중...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex items-end gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Camera className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="메시지를 입력하세요..."
              className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={sending}
            />
            
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className={`p-2 rounded-lg transition-all ${
              newMessage.trim() && !sending
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}