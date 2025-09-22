'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Send, ArrowLeft, MoreVertical, Phone, Video, 
  Paperclip, Image, Camera, Smile, Mic, 
  Check, CheckCheck, Search, Filter, X,
  User, Calendar, DollarSign, FileText,
  Shield, AlertCircle, Archive, Trash2,
  MessageCircle, ChevronLeft, Bell, Star,
  Clock, TrendingUp, Bot, Sparkles
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Message {
  id: string;
  senderId: string;
  senderType: 'influencer' | 'advertiser' | 'system';
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: {
    type: 'image' | 'file' | 'contract';
    url: string;
    name?: string;
  }[];
  contractData?: {
    price: number;
    deadline: string;
    status: 'pending' | 'accepted' | 'rejected';
  };
}

interface ChatRoom {
  id: string;
  campaignId: string;
  campaignName: string;
  brandName: string;
  brandLogo: string;
  otherPartyName: string;
  otherPartyAvatar: string;
  otherPartyType: 'influencer' | 'advertiser';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'negotiating' | 'contracted' | 'completed';
  isOnline: boolean;
  isTyping: boolean;
  isPinned?: boolean;
  estimatedPrice?: number;
}

export default function ChatPage() {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 현재 사용자 타입 (실제로는 세션에서 가져옴)
  const currentUserType: 'influencer' | 'advertiser' = 'influencer';

  // 채팅방 목록 (실제로는 API에서 가져옴)
  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      campaignId: 'c1',
      campaignName: '여름 컬렉션 프로모션',
      brandName: '나이키',
      brandLogo: 'https://via.placeholder.com/50',
      otherPartyName: '나이키 마케팅팀',
      otherPartyAvatar: 'https://via.placeholder.com/50',
      otherPartyType: 'advertiser',
      lastMessage: '네, 그렇게 진행하시죠! 단가는 협의 가능합니다.',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
      unreadCount: 2,
      status: 'negotiating',
      isOnline: true,
      isTyping: false,
      isPinned: true,
      estimatedPrice: 3500000
    },
    {
      id: '2',
      campaignId: 'c2',
      campaignName: '뷰티 제품 리뷰',
      brandName: '샤넬',
      brandLogo: 'https://via.placeholder.com/50',
      otherPartyName: '샤넬 뷰티팀',
      otherPartyAvatar: 'https://via.placeholder.com/50',
      otherPartyType: 'advertiser',
      lastMessage: '계약서 검토 부탁드립니다.',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
      unreadCount: 0,
      status: 'contracted',
      isOnline: false,
      isTyping: false,
      estimatedPrice: 5000000
    }
  ]);

  // 샘플 메시지 로드
  useEffect(() => {
    if (selectedRoom) {
      setMessages([
        {
          id: '1',
          senderId: 'other',
          senderType: 'advertiser',
          content: '안녕하세요! 캠페인에 관심을 가져주셔서 감사합니다.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          isRead: true
        },
        {
          id: '2',
          senderId: 'me',
          senderType: 'influencer',
          content: '네, 안녕하세요! 제안 주신 캠페인 정말 흥미롭네요.',
          timestamp: new Date(Date.now() - 1000 * 60 * 50),
          isRead: true
        },
        {
          id: '3',
          senderId: 'system',
          senderType: 'system',
          content: '💰 계약 제안이 도착했습니다',
          timestamp: new Date(Date.now() - 1000 * 60 * 40),
          isRead: true,
          contractData: {
            price: 3500000,
            deadline: '2024-12-31',
            status: 'pending'
          }
        },
        {
          id: '4',
          senderId: 'other',
          senderType: 'advertiser',
          content: '단가는 350만원으로 제안드리고 싶은데, 어떠신가요?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isRead: true
        }
      ]);
    }
  }, [selectedRoom]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderType: currentUserType,
      content: message,
      timestamp: new Date(),
      isRead: false
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const filteredRooms = chatRooms.filter(room =>
    room.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 정렬: 고정된 방 우선, 그다음 최신 순
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 - 채팅방 목록 */}
      <div className={`${selectedRoom ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 bg-white border-r`}>
        {/* 헤더 */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold flex-1">메시지</h1>
            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors relative"
            >
              <Bot className="w-5 h-5 text-purple-600" />
              <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
            </button>
          </div>
          
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="브랜드 또는 캠페인 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-600 transition-all"
            />
          </div>

          {/* 필터 탭 */}
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-full">
              전체
            </button>
            <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200">
              협상 중
            </button>
            <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200">
              계약 완료
            </button>
            <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200">
              읽지 않음
            </button>
          </div>
        </div>

        {/* AI 어시스턴트 패널 */}
        {showAIAssistant && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold">AI 협상 도우미</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              현재 2개의 협상이 진행 중입니다. AI가 최적 단가를 분석했습니다.
            </p>
            <div className="space-y-2">
              <div className="bg-white rounded-lg p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">나이키</span>
                  <span className="text-xs text-green-600">예상: 380만원</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-green-500 h-1 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <button className="w-full py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                AI 분석 보기
              </button>
            </div>
          </div>
        )}

        {/* 채팅방 목록 */}
        <div className="flex-1 overflow-y-auto">
          {sortedRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`w-full p-4 hover:bg-gray-50 transition-all border-b ${
                selectedRoom?.id === room.id ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={room.otherPartyAvatar}
                    alt={room.otherPartyName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {room.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                  {room.isPinned && (
                    <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{room.brandName}</h3>
                      {room.status === 'negotiating' && (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">
                          협상중
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(room.lastMessageTime, { 
                        addSuffix: false, 
                        locale: ko 
                      })} 전
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{room.campaignName}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 truncate flex-1">
                      {room.isTyping ? (
                        <span className="text-purple-600">입력 중...</span>
                      ) : (
                        room.lastMessage
                      )}
                    </p>
                    {room.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                  {room.estimatedPrice && (
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">
                        예상: {(room.estimatedPrice / 10000).toFixed(0)}만원
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 채팅 화면 */}
      {selectedRoom ? (
        <div className="flex-1 flex flex-col">
          {/* 채팅 헤더 */}
          <div className="bg-white border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={selectedRoom.brandLogo}
                  alt={selectedRoom.brandName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{selectedRoom.brandName}</h2>
                    {selectedRoom.status === 'negotiating' && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">
                        💰 협상중
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{selectedRoom.campaignName}</span>
                    {selectedRoom.isOnline ? (
                      <span className="text-xs text-green-600">• 온라인</span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        • {formatDistanceToNow(selectedRoom.lastMessageTime, { 
                          addSuffix: false, 
                          locale: ko 
                        })} 전 활동
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => setShowRoomInfo(!showRoomInfo)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'} ${
                  msg.senderType === 'system' ? 'justify-center' : ''
                }`}
              >
                {msg.senderType === 'system' ? (
                  <div className="bg-white rounded-lg px-4 py-3 shadow-sm max-w-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-sm">{msg.content}</span>
                    </div>
                    {msg.contractData && (
                      <div className="space-y-2">
                        <div className="bg-gray-50 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">제안 금액</span>
                            <span className="text-lg font-bold text-purple-600">
                              ₩{msg.contractData.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">마감일</span>
                            <span className="text-sm font-medium">
                              {msg.contractData.deadline}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                            수락하기
                          </button>
                          <button className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
                            협상하기
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`max-w-[70%] ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        msg.senderId === 'me'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <div className={`mt-1 flex items-center gap-1 ${
                      msg.senderId === 'me' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="text-xs text-gray-500">
                        {format(msg.timestamp, 'HH:mm')}
                      </span>
                      {msg.senderId === 'me' && (
                        msg.isRead ? (
                          <CheckCheck className="w-3 h-3 text-purple-600" />
                        ) : (
                          <Check className="w-3 h-3 text-gray-400" />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {selectedRoom.isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
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
          <div className="bg-white border-t p-4">
            {/* AI 추천 응답 */}
            <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-700">AI 추천 응답</span>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <button className="px-3 py-1.5 bg-white text-xs rounded-full whitespace-nowrap hover:bg-gray-50 border">
                  제안 감사합니다. 400만원은 어떠신가요? 💭
                </button>
                <button className="px-3 py-1.5 bg-white text-xs rounded-full whitespace-nowrap hover:bg-gray-50 border">
                  포트폴리오 확인 후 연락드리겠습니다 📊
                </button>
                <button className="px-3 py-1.5 bg-white text-xs rounded-full whitespace-nowrap hover:bg-gray-50 border">
                  일정 조율이 필요합니다 📅
                </button>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Image className="w-5 h-5 text-gray-600" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:bg-white focus:ring-2 focus:ring-purple-600 transition-all"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSendMessage}
                className={`p-2 rounded-lg transition-all ${
                  message.trim()
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {message.trim() ? (
                  <Send className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* 빠른 답변 */}
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
              <button className="px-3 py-1.5 bg-gray-100 text-sm rounded-full whitespace-nowrap hover:bg-gray-200">
                네, 좋아요! 👍
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-sm rounded-full whitespace-nowrap hover:bg-gray-200">
                조금 생각해볼게요
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-sm rounded-full whitespace-nowrap hover:bg-gray-200">
                금액 협의가 필요해요
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-sm rounded-full whitespace-nowrap hover:bg-gray-200">
                일정 확인하고 연락드릴게요
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">대화를 선택하세요</h3>
            <p className="text-gray-500">브랜드와 메시지를 주고받을 수 있습니다</p>
            
            {/* 빠른 통계 */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-700">2</p>
                <p className="text-xs text-gray-500">진행 중</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-700">850</p>
                <p className="text-xs text-gray-500">평균 단가(만원)</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-700">4</p>
                <p className="text-xs text-gray-500">완료된 계약</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 채팅방 정보 사이드바 */}
      <AnimatePresence>
        {showRoomInfo && selectedRoom && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 h-full w-80 bg-white border-l shadow-lg z-20"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">대화 정보</h3>
                <button
                  onClick={() => setShowRoomInfo(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center">
                <img
                  src={selectedRoom.brandLogo}
                  alt={selectedRoom.brandName}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                />
                <h4 className="font-semibold">{selectedRoom.brandName}</h4>
                <p className="text-sm text-gray-600">{selectedRoom.campaignName}</p>
                
                {/* 예상 단가 표시 */}
                {selectedRoom.estimatedPrice && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700">
                        AI 예상 단가: {(selectedRoom.estimatedPrice / 10000).toFixed(0)}만원
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 space-y-4">
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="text-sm">계약 제안하기</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-sm">일정 조율하기</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm">포트폴리오 공유</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-sm">신고하기</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                <Archive className="w-5 h-5 text-gray-600" />
                <span className="text-sm">대화 보관하기</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-red-600">
                <Trash2 className="w-5 h-5" />
                <span className="text-sm">대화 삭제</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}