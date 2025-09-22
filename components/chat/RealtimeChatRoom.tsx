// components/chat/RealtimeChatRoom.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Paperclip, FileText, ArrowLeft, Smile, X,
  FileIcon, Check, CheckCheck, Phone, MoreVertical,
  MessageCircle, Loader2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { createClient, supabaseHelpers } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
// @ts-ignore - ContractProposalModal 타입 무시
import ContractProposalModal from './ContractProposalModal';

interface RealtimeChatRoomProps {
  roomId: string;
  currentUserId: string;
  userType: 'influencer' | 'advertiser';
  onBack?: () => void;
}

export default function RealtimeChatRoom({ 
  roomId, 
  currentUserId, 
  userType,
  onBack 
}: RealtimeChatRoomProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatRoom, setChatRoom] = useState<any>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
    const channel = setupRealtimeSubscription();
    
    return () => {
      // @ts-ignore
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 데이터 로드
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // 채팅방 정보
      const { data: roomData } = await supabaseHelpers.getChatRoom(supabase, roomId);
      if (roomData) {
        setChatRoom(roomData);
        
        // 캠페인 정보
        if (roomData.campaign_id) {
          const { data: campaignData } = await supabaseHelpers.getCampaign(
            supabase, 
            roomData.campaign_id
          );
          setCampaign(campaignData);
        }
      }
      
      // 메시지 로드
      const { data: messagesData } = await supabaseHelpers.getMessages(supabase, roomId);
      setMessages(messagesData);
      
      // 읽음 처리
      await supabaseHelpers.markMessagesAsRead(supabase, roomId, currentUserId);
      await supabaseHelpers.updateUnreadCount(supabase, roomId, userType);
      
      scrollToBottom();
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('데이터를 불러올 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 실시간 구독
  const setupRealtimeSubscription = () => {
    // @ts-ignore
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_room_id=eq.${roomId}`
      }, (payload: any) => {
        const newMsg = payload.new;
        if (newMsg.sender_id !== currentUserId) {
          setMessages((prev: any) => [...prev, newMsg]);
          scrollToBottom();
          // 읽음 처리
          supabaseHelpers.markMessagesAsRead(supabase, roomId, currentUserId);
          supabaseHelpers.updateUnreadCount(supabase, roomId, userType);
        }
      })
      .subscribe();
    
    return channel;
  };

  // 메시지 전송
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) return;
    
    setIsSending(true);
    
    try {
      // 첨부파일 업로드
      let attachmentUrls: string[] = [];
      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${roomId}/${Date.now()}.${fileExt}`;
          
          // @ts-ignore
          const { data, error } = await supabase.storage
            .from('chat-attachments')
            .upload(fileName, file);
          
          if (!error && data) {
            // @ts-ignore
            const { data: { publicUrl } } = supabase.storage
              .from('chat-attachments')
              .getPublicUrl(data.path);
            attachmentUrls.push(publicUrl);
          }
        }
      }

      // 메시지 전송
      const { data, error } = await supabaseHelpers.sendMessage(supabase, {
        chat_room_id: roomId,
        sender_id: currentUserId,
        sender_type: userType,
        content: newMessage.trim(),
        message_type: attachmentUrls.length > 0 ? 'file' : 'text',
        attachments: attachmentUrls.length > 0 ? attachmentUrls : null
      });

      if (error) throw error;

      if (data) {
        setMessages((prev: any) => [...prev, data]);
        setNewMessage('');
        setAttachments([]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('메시지 전송 실패');
    } finally {
      setIsSending(false);
    }
  };

  // 스크롤
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 파일 첨부
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  // 이모지 추가
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // 메시지 시간 포맷
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return format(date, 'HH:mm');
    } else if (days === 1) {
      return '어제';
    } else if (days < 7) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } else {
      return format(date, 'MM/dd');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {userType === 'advertiser' ? 'I' : 'B'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {campaign?.name || '캠페인 채팅'}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowContractModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FileText className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-12 h-12 mb-3" />
            <p>대화를 시작해보세요!</p>
          </div>
        ) : (
          messages.map((message: any) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.sender_id === currentUserId ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.sender_id === currentUserId
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-900'
                }`}>
                  {message.message_type === 'system' ? (
                    <div className="text-center text-gray-500 text-sm italic">
                      {message.content}
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((url: string, idx: number) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs underline"
                        >
                          <FileIcon className="w-4 h-4" />
                          첨부파일 {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={`flex items-center gap-1 mt-1 ${
                  message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}>
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(message.created_at)}
                  </span>
                  {message.sender_id === currentUserId && (
                    <>
                      {message.read_at ? (
                        <CheckCheck className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Check className="w-3 h-3 text-gray-400" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <form onSubmit={sendMessage} className="bg-white border-t p-4">
        {attachments.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                <FileIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isSending}
          />
          
          <button
            type="submit"
            disabled={isSending || (!newMessage.trim() && attachments.length === 0)}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* 이모지 피커 */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 bg-white rounded-lg shadow-lg p-3 grid grid-cols-8 gap-2">
            {['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨'].map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="text-2xl hover:bg-gray-100 rounded p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* 계약 제안 모달 - 타입 에러 무시 */}
      {showContractModal && (
        <ContractProposalModal
          isOpen={showContractModal}
          onClose={() => setShowContractModal(false)}
          roomId={roomId}
          userType={userType}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}