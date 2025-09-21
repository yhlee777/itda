// components/chat/ChatRoom.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Paperclip, Image, FileText, DollarSign, Calendar,
  CheckCircle, XCircle, AlertCircle, MoreVertical, Phone,
  Video, Info, ArrowLeft, Smile, Mic, Play, Pause, X,
  FileIcon, Download, Eye, Check, CheckCheck, Edit,
  Shield, Zap, TrendingUp, Award, Clock, Users
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

// Supabase 타입 가져오기
type Tables = Database['public']['Tables'];
type MessageRow = Tables['messages']['Row'];
type ChatRoomRow = Tables['chat_rooms']['Row'];
type CampaignRow = Tables['campaigns']['Row'];
type AdvertiserRow = Tables['advertisers']['Row'];
type InfluencerRow = Tables['influencers']['Row'];

// 확장된 타입 정의 (관계 포함)
interface MessageWithSender extends MessageRow {
  sender?: {
    name: string;
    avatar: string;
    user_type: string;
  };
}

interface ChatRoomWithRelations extends ChatRoomRow {
  campaign?: Pick<CampaignRow, 'id' | 'name' | 'description'> & {
    image?: string;
  };
  advertiser?: Pick<AdvertiserRow, 'id' | 'company_name' | 'company_logo'>;
  influencer?: Pick<InfluencerRow, 'id' | 'name' | 'avatar' | 'followers_count' | 'engagement_rate'>;
}

interface ChatRoomProps {
  roomId: string;
  currentUserId: string;
  userType: 'influencer' | 'advertiser';
  onBack?: () => void;
}

export default function ChatRoom({ roomId, currentUserId, userType, onBack }: ChatRoomProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoomWithRelations | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 메시지 불러오기
  useEffect(() => {
    loadChatRoom();
    loadMessages();
    
    // 실시간 구독
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_room_id=eq.${roomId}`
      }, handleNewMessage)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        checkTypingStatus(state);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const loadChatRoom = async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        campaigns!campaign_id (
          id,
          name,
          description
        ),
        advertisers!advertiser_id (
          id,
          company_name,
          company_logo
        ),
        influencers!influencer_id (
          id,
          name,
          avatar,
          followers_count,
          engagement_rate
        )
      `)
      .eq('id', roomId)
      .single();

    if (data) {
      // 타입 안전하게 변환
      const transformedData: ChatRoomWithRelations = {
        ...data,
        campaign: data.campaigns ? {
          id: data.campaigns.id,
          name: data.campaigns.name,
          description: data.campaigns.description
        } : undefined,
        advertiser: data.advertisers ? {
          id: data.advertisers.id,
          company_name: data.advertisers.company_name,
          company_logo: data.advertisers.company_logo
        } : undefined,
        influencer: data.influencers ? {
          id: data.influencers.id,
          name: data.influencers.name,
          avatar: data.influencers.avatar,
          followers_count: data.influencers.followers_count,
          engagement_rate: data.influencers.engagement_rate
        } : undefined
      };
      
      setChatRoom(transformedData);
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users!sender_id (
          id,
          user_type
        )
      `)
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: true });

    if (data) {
      // 메시지에 발신자 정보 추가
      const messagesWithSender: MessageWithSender[] = data.map(msg => {
        // 발신자 정보 구성
        let senderInfo = {
          name: 'Unknown',
          avatar: '',
          user_type: msg.sender_type || 'system'
        };

        if (msg.sender_type === 'advertiser' && chatRoom?.advertiser) {
          senderInfo.name = chatRoom.advertiser.company_name;
          senderInfo.avatar = chatRoom.advertiser.company_logo || '';
        } else if (msg.sender_type === 'influencer' && chatRoom?.influencer) {
          senderInfo.name = chatRoom.influencer.name;
          senderInfo.avatar = chatRoom.influencer.avatar || '';
        } else if (msg.sender_type === 'system') {
          senderInfo.name = 'System';
          senderInfo.avatar = '';
        }

        return {
          ...msg,
          sender: senderInfo
        };
      });

      setMessages(messagesWithSender);
      markAsRead();
    }
  };

  const handleNewMessage = (payload: any) => {
    const newMsg = payload.new as MessageRow;
    if (newMsg.sender_id !== currentUserId) {
      // 새 메시지에 발신자 정보 추가
      let senderInfo = {
        name: 'Unknown',
        avatar: '',
        user_type: newMsg.sender_type || 'system'
      };

      if (newMsg.sender_type === 'advertiser' && chatRoom?.advertiser) {
        senderInfo.name = chatRoom.advertiser.company_name;
        senderInfo.avatar = chatRoom.advertiser.company_logo || '';
      } else if (newMsg.sender_type === 'influencer' && chatRoom?.influencer) {
        senderInfo.name = chatRoom.influencer.name;
        senderInfo.avatar = chatRoom.influencer.avatar || '';
      }

      const messageWithSender: MessageWithSender = {
        ...newMsg,
        sender: senderInfo
      };

      setMessages(prev => [...prev, messageWithSender]);
      markAsRead();
    }
  };

  const markAsRead = async () => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('chat_room_id', roomId)
      .neq('sender_id', currentUserId);
  };

  const checkTypingStatus = (state: any) => {
    const others = Object.values(state).filter((presence: any) => 
      presence[0]?.user_id !== currentUserId
    );
    setOtherUserTyping(others.some((p: any) => p[0]?.typing));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    const messageData = {
      chat_room_id: roomId,
      sender_id: currentUserId,
      sender_type: userType,
      message_type: attachments.length > 0 ? 'image' : 'text',
      content: newMessage,
      attachments: attachments.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      }))
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (data) {
      // 발신자 정보 추가
      let senderInfo = {
        name: userType === 'advertiser' ? chatRoom?.advertiser?.company_name || 'Unknown' : chatRoom?.influencer?.name || 'Unknown',
        avatar: userType === 'advertiser' ? chatRoom?.advertiser?.company_logo || '' : chatRoom?.influencer?.avatar || '',
        user_type: userType
      };

      const messageWithSender: MessageWithSender = {
        ...data,
        sender: senderInfo
      };

      setMessages(prev => [...prev, messageWithSender]);
      setNewMessage('');
      setAttachments([]);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (!isTyping) {
      setIsTyping(true);
      // Broadcast typing status
      // Implementation here
    }
  };

  // AI 인사이트 데이터 파싱
  const parseAIInsights = (insights: any) => {
    try {
      if (typeof insights === 'string') {
        return JSON.parse(insights);
      }
      return insights || {};
    } catch {
      return {};
    }
  };

  // 계약 제안 모달
  const ContractProposalModal = () => {
    const aiInsights = parseAIInsights(chatRoom?.ai_insights);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowContractModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold mb-4">계약 제안</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">제안 금액</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="0"
                  defaultValue={chatRoom?.suggested_price || ''}
                />
                <span className="absolute right-3 top-2.5 text-gray-500">원</span>
              </div>
              {chatRoom?.suggested_price && (
                <p className="text-xs text-purple-600 mt-1">
                  AI 추천가: {chatRoom.suggested_price.toLocaleString()}원
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">콘텐츠 요구사항</label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-3 p-2 border rounded-lg">
                  <Image className="w-4 h-4 text-gray-500" />
                  <input type="number" className="w-12 border-b text-center" defaultValue="3" />
                  <span className="text-sm">피드 포스트</span>
                </div>
                <div className="flex items-center gap-3 p-2 border rounded-lg">
                  <Video className="w-4 h-4 text-gray-500" />
                  <input type="number" className="w-12 border-b text-center" defaultValue="2" />
                  <span className="text-sm">릴스</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">마감일</label>
              <input
                type="date"
                className="w-full mt-1 px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">추가 조건</label>
              <textarea
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                rows={3}
                placeholder="추가 요청사항을 입력하세요..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowContractModal(false)}
              className="flex-1 py-2 border border-gray-300 rounded-lg"
            >
              취소
            </button>
            <button className="flex-1 py-2 bg-purple-600 text-white rounded-lg">
              제안하기
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // AI 인사이트 패널
  const AIInsightsPanel = () => {
    const aiInsights = parseAIInsights(chatRoom?.ai_insights);
    
    return (
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        exit={{ x: 300 }}
        className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl z-40 overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              AI 인사이트
            </h3>
            <button onClick={() => setShowAIInsights(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 매칭 점수 */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">매칭 점수</span>
              <span className="text-2xl font-bold text-purple-600">
                {aiInsights.compatibility || chatRoom?.match_score || 85}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                style={{ width: `${aiInsights.compatibility || chatRoom?.match_score || 85}%` }}
              />
            </div>
          </div>

          {/* 예상 성과 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-3">예상 성과</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">도달</span>
                <span className="font-semibold">
                  {(aiInsights.estimated_reach || 85000).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">참여율</span>
                <span className="font-semibold">
                  {aiInsights.predicted_engagement || 3.5}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">추천 예산</span>
                <span className="font-semibold text-green-600">
                  {(aiInsights.recommended_budget || chatRoom?.suggested_price || 2000000).toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 강점 */}
          <div>
            <h4 className="font-semibold text-sm mb-2">강점</h4>
            <div className="space-y-2">
              {(aiInsights.strengths || [
                '높은 팔로워 참여율',
                '타겟 연령층 일치',
                '유사 캠페인 경험'
              ]).map((strength: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 고려사항 */}
          <div>
            <h4 className="font-semibold text-sm mb-2">고려사항</h4>
            <div className="space-y-2">
              {(aiInsights.considerations || [
                '첫 협업',
                '콘텐츠 스타일 조율 필요'
              ]).map((consideration: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span className="text-sm text-gray-700">{consideration}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 추천 액션 */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">추천 액션</h4>
            <p className="text-sm text-gray-700 mb-3">
              현재 단가 기준 협업 진행을 추천합니다. 
              초기 제안가를 {(chatRoom?.suggested_price || 2000000).toLocaleString()}원으로 시작하세요.
            </p>
            <button 
              onClick={() => setShowContractModal(true)}
              className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold"
            >
              AI 추천가로 제안하기
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      {/* 헤더 */}
      <div className="border-b bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="lg:hidden">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                {userType === 'influencer' 
                  ? chatRoom?.advertiser?.company_name?.[0]
                  : chatRoom?.influencer?.name?.[0]
                }
              </div>
              <div>
                <h3 className="font-semibold">
                  {userType === 'influencer' 
                    ? chatRoom?.advertiser?.company_name
                    : chatRoom?.influencer?.name
                  }
                </h3>
                <p className="text-xs text-gray-500">
                  {chatRoom?.campaign?.name}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Zap className="w-5 h-5 text-purple-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* 계약 상태 바 */}
        {chatRoom?.contract_status && (
          <div className="px-4 py-2 bg-purple-50 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                계약 상태: {chatRoom.contract_status === 'negotiating' ? '협상 중' : 
                          chatRoom.contract_status === 'agreed' ? '합의됨' :
                          chatRoom.contract_status === 'signed' ? '계약 완료' : '취소됨'}
              </span>
              {chatRoom.agreed_price && (
                <span className="text-sm font-semibold text-green-600">
                  합의 금액: {chatRoom.agreed_price.toLocaleString()}원
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] ${message.sender_type === 'system' ? 'w-full' : ''}`}>
              {message.sender_type === 'system' ? (
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">{message.content}</p>
                </div>
              ) : message.message_type === 'contract_proposal' ? (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-sm">계약 제안</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>💰 제안 금액: {(message.contract_data as any)?.price?.toLocaleString()}원</p>
                    <p>📅 마감일: {(message.contract_data as any)?.deadline}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-1.5 bg-green-500 text-white rounded text-sm">
                      수락
                    </button>
                    <button className="flex-1 py-1.5 bg-gray-200 rounded text-sm">
                      거절
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`rounded-2xl px-4 py-2 ${
                  message.sender_id === currentUserId 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs opacity-60">
                      {format(new Date(message.created_at), 'HH:mm')}
                    </span>
                    {message.sender_id === currentUserId && (
                      message.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t bg-white p-4">
        {/* 첨부파일 프리뷰 */}
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {attachments.map((file, idx) => (
              <div key={idx} className="relative">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-8 h-8 text-gray-400" />
                  ) : (
                    <FileIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 빠른 액션 버튼 */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setShowContractModal(true)}
            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1"
          >
            <FileText className="w-4 h-4" />
            계약 제안
          </button>
          <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            견적 요청
          </button>
          <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            일정 조율
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
          />
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Smile className="w-5 h-5 text-gray-500" />
          </button>
          
          {!newMessage ? (
            <button 
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-lg ${isRecording ? 'bg-red-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={sendMessage}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 모달들 */}
      <AnimatePresence>
        {showContractModal && <ContractProposalModal />}
        {showAIInsights && <AIInsightsPanel />}
      </AnimatePresence>
    </div>
  );
}