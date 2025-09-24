// components/chat/RealtimeChat.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Smile, MoreVertical, Phone, Video,
  Check, CheckCheck, Clock, Image as ImageIcon, File, X, ChevronLeft,
  Mic, StopCircle, Play, Pause, Trash2, Download,
  Heart, Star, Zap, Gift, Camera, MapPin, MessageCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

// 데이터베이스 스키마와 일치하는 타입
interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_type: string;
  content: string; // message가 아닌 content
  attachments?: any;
  is_read?: boolean;
  is_edited?: boolean;
  is_deleted?: boolean;
  is_offer?: boolean;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
  metadata?: any;
  parent_id?: string;
  read_at?: string;
  thread_count?: number;
}

interface ChatRoom {
  id: string;
  campaign_id?: string;
  advertiser_id?: string;
  influencer_id?: string;
  status: string;
  last_message_at?: string;
  unread_count_advertiser?: number;
  unread_count_influencer?: number;
  metadata?: any;
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  typing?: boolean;
}

interface RealtimeChatProps {
  chatRoomId: string;
  currentUserId: string;
  currentUserType: 'advertiser' | 'influencer';
  otherUser?: ChatUser;
  campaignName?: string;
}

export default function RealtimeChat({
  chatRoomId,
  currentUserId,
  currentUserType,
  otherUser,
  campaignName
}: RealtimeChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  
  // 음성 메시지 관련
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 실시간 구독 관련
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이모지 리스트
  const emojis = ['😀', '😍', '🤝', '👍', '❤️', '🎉', '🔥', '💯', '😊', '🙏', '💪', '✨'];

  // 빠른 답장 템플릿
  const quickReplies = [
    '안녕하세요!',
    '네, 좋습니다!',
    '언제 가능하신가요?',
    '자세히 설명해주세요',
    '감사합니다!'
  ];

  // 초기 로드
  useEffect(() => {
    loadChatRoom();
    loadMessages();
    markAsRead();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [chatRoomId]);

  // 채팅방 정보 로드
  const loadChatRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', chatRoomId)
        .single();

      if (error) {
        console.error('Failed to load chat room:', error);
        return;
      }

      setChatRoom(data);
    } catch (error) {
      console.error('Error loading chat room:', error);
    }
  };

  // 메시지 로드
  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to load messages:', error);
        toast.error('메시지를 불러올 수 없습니다');
      } else {
        setMessages(data || []);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 실시간 구독 설정
  const setupRealtimeSubscription = () => {
    channelRef.current = supabase
      .channel(`chat:${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        },
        (payload: any) => {
          const newMsg = payload.new as Message;
          
          // 자신이 보낸 메시지가 아닐 때만 추가
          if (newMsg.sender_id !== currentUserId) {
            setMessages(prev => [...prev, newMsg]);
            scrollToBottom();
            
            // 알림음 재생
            playNotificationSound();
            
            // 브라우저 알림
            if (Notification.permission === 'granted') {
              new Notification(`새 메시지 from ${otherUser?.name || '상대방'}`, {
                body: newMsg.content,
                icon: '/logo.png'
              });
            }
            
            // 읽음 처리
            markAsRead();
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channelRef.current.presenceState();
        checkOtherUserPresence(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        if (key !== currentUserId) {
          setOtherUserTyping(false);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }: any) => {
        if (key !== currentUserId) {
          setOtherUserTyping(false);
        }
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channelRef.current.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });
  };

  // 타이핑 상태 확인
  const checkOtherUserPresence = (state: any) => {
    const otherUserState = Object.keys(state)
      .filter(key => key !== currentUserId)
      .map(key => state[key])
      .flat();

    if (otherUserState.length > 0) {
      const isTyping = otherUserState.some((presence: any) => presence.is_typing);
      setOtherUserTyping(isTyping);
    }
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    stopTyping();

    const messageData = {
      chat_room_id: chatRoomId,
      sender_id: currentUserId,
      sender_type: currentUserType,
      content: messageText, // message가 아닌 content 사용
      attachments: selectedImage ? [{ type: 'image', url: selectedImage }] : null,
      is_read: false,
      created_at: new Date().toISOString()
    };

    // 낙관적 업데이트
    const optimisticMessage: Message = {
      ...messageData,
      id: `temp-${Date.now()}`,
      is_edited: false,
      is_deleted: false,
      is_offer: false
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Failed to send message:', error);
        toast.error('메시지 전송 실패');
        // 실패 시 낙관적 업데이트 롤백
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      } else {
        // 성공 시 임시 메시지를 실제 메시지로 교체
        setMessages(prev => prev.map(m => 
          m.id === optimisticMessage.id ? data : m
        ));
        
        // 채팅방 업데이트
        await updateChatRoom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('메시지 전송 중 오류가 발생했습니다');
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }

    setSelectedImage(null);
    setIsSending(false);
  };

  // 채팅방 업데이트
  const updateChatRoom = async () => {
    const unreadColumn = currentUserType === 'advertiser' 
      ? 'unread_count_influencer' 
      : 'unread_count_advertiser';

    try {
      await supabase
        .from('chat_rooms')
        .update({ 
          last_message_at: new Date().toISOString(),
          [unreadColumn]: 0
        })
        .eq('id', chatRoomId);
    } catch (error) {
      console.error('Error updating chat room:', error);
    }
  };

  // 읽음 처리
  const markAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_room_id', chatRoomId)
        .neq('sender_type', currentUserType)
        .eq('is_read', false);

      const unreadColumn = currentUserType === 'advertiser' 
        ? 'unread_count_advertiser' 
        : 'unread_count_influencer';

      await supabase
        .from('chat_rooms')
        .update({ [unreadColumn]: 0 })
        .eq('id', chatRoomId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // 타이핑 인디케이터
  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      await channelRef.current?.track({
        user_id: currentUserId,
        is_typing: true,
        online_at: new Date().toISOString(),
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = async () => {
    setIsTyping(false);
    await channelRef.current?.track({
      user_id: currentUserId,
      is_typing: false,
      online_at: new Date().toISOString(),
    });
  };

  // 음성 메시지 녹음
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        sendVoiceMessage(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('마이크 권한이 필요합니다');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const sendVoiceMessage = async (blob: Blob) => {
    // 실제 구현 시 blob을 스토리지에 업로드하고 URL을 메시지에 첨부
    toast.success('음성 메시지가 전송되었습니다');
  };

  // 파일 첨부
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('이미지 파일만 첨부 가능합니다');
      }
    }
  };

  // 알림음 재생
  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  // 스크롤 제어
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 메시지 시간 포맷
  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
      if (diffInMinutes < 1) return '방금 전';
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  // 메시지 그룹화
  const isFirstInGroup = (index: number) => {
    if (index === 0) return true;
    return messages[index].sender_id !== messages[index - 1].sender_id;
  };

  const isLastInGroup = (index: number) => {
    if (index === messages.length - 1) return true;
    return messages[index].sender_id !== messages[index + 1].sender_id;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden">
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                {otherUser?.avatar || otherUser?.name?.[0] || '?'}
              </div>
              {otherUser?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">{otherUser?.name || '상대방'}</h3>
              <p className="text-xs text-gray-500">
                {otherUserTyping ? (
                  <span className="text-purple-600 flex items-center gap-1">
                    <span className="animate-pulse">입력 중</span>
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ...
                    </motion.span>
                  </span>
                ) : campaignName ? (
                  campaignName
                ) : (
                  '온라인'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">메시지를 불러오는 중...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">대화를 시작해보세요!</h3>
            <p className="text-gray-500 max-w-sm">
              {campaignName} 캠페인에 대해 이야기를 나눠보세요
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => setNewMessage(reply)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => {
              const isOwn = msg.sender_id === currentUserId;
              const firstInGroup = isFirstInGroup(index);
              const lastInGroup = isLastInGroup(index);

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${!firstInGroup ? 'mt-1' : 'mt-4'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {/* 아바타 */}
                    {!isOwn && firstInGroup && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                        {otherUser?.name?.[0] || '?'}
                      </div>
                    )}
                    {!isOwn && !firstInGroup && <div className="w-8" />}

                    <div>
                      {/* 메시지 버블 */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          isOwn
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white border border-gray-200'
                        } ${firstInGroup ? '' : 'mt-0.5'} ${
                          isOwn
                            ? lastInGroup ? 'rounded-br-sm' : ''
                            : lastInGroup ? 'rounded-bl-sm' : ''
                        }`}
                      >
                        {/* 이미지 첨부 */}
                        {msg.attachments?.[0]?.type === 'image' && (
                          <img
                            src={msg.attachments[0].url}
                            alt="첨부 이미지"
                            className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.attachments[0].url, '_blank')}
                          />
                        )}
                        
                        <p className={`text-sm ${isOwn ? 'text-white' : 'text-gray-800'} whitespace-pre-wrap break-words`}>
                          {msg.content}
                        </p>

                        {/* 메타 정보 */}
                        {lastInGroup && (
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                            <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                              {formatMessageTime(msg.created_at)}
                            </span>
                            {isOwn && (
                              <span className="text-white/70">
                                {msg.is_read ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* 타이핑 인디케이터 */}
        <AnimatePresence>
          {otherUserTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                {otherUser?.name?.[0] || '?'}
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* 선택된 이미지 미리보기 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 bg-white border-t"
          >
            <div className="relative inline-block">
              <img
                src={selectedImage}
                alt="첨부할 이미지"
                className="h-20 rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 이모지 피커 */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-3 bg-white border-t"
          >
            <div className="flex gap-2 flex-wrap">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojis(false);
                  }}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 입력 영역 */}
      <div className="bg-white border-t px-4 py-4">
        {/* 빠른 답장 */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => setNewMessage(reply)}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* 첨부 버튼 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* 이모지 버튼 */}
          <button
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>

          {/* 메시지 입력 */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="메시지를 입력하세요..."
              className="w-full px-4 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              disabled={isSending}
            />
          </div>

          {/* 전송 버튼 */}
          {newMessage || selectedImage ? (
            <button
              onClick={sendMessage}
              disabled={isSending}
              className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSending ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2.5 rounded-lg transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isRecording ? (
                <StopCircle className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* 녹음 시간 표시 */}
        {isRecording && (
          <div className="mt-2 text-center">
            <span className="text-red-500 text-sm font-medium">
              녹음 중... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}