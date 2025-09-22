'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Search, Filter, Send, Paperclip, Image, 
  Calendar, DollarSign, FileText, Phone, Video, Info,
  Star, Clock, CheckCircle, AlertCircle, MoreVertical,
  Archive, Pin, Trash2, ChevronLeft, Smile, Mic,
  Shield, TrendingUp, Users, Zap, Bell, X, Check, CheckCheck
} from 'lucide-react';

// 타입 정의
interface InfluencerInfo {
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  engagement: number;
  verified: boolean;
}

interface CampaignInfo {
  name: string;
  status: 'negotiating' | 'active' | 'completed';
}

interface ChatRoom {
  id: number;
  influencer: InfluencerInfo;
  campaign: CampaignInfo;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'negotiating' | 'active' | 'completed';
  isOnline: boolean;
  isPinned: boolean;
  contractStatus: 'proposed' | 'accepted' | 'completed' | 'none';
  proposedPrice?: number;
}

interface Attachment {
  type: 'contract' | 'image' | 'file';
  name: string;
  data?: {
    price?: number;
    deadline?: string;
  };
}

interface Message {
  id: number;
  senderId: 'advertiser' | 'influencer' | 'system';
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: Attachment[];
}

export default function AdvertiserChatPage() {
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'negotiating' | 'completed'>('all');
  const [showChatInfo, setShowChatInfo] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 테스트용 채팅방 데이터
  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: 1,
      influencer: {
        name: '김민지',
        handle: '@minji_style',
        avatar: '👩‍🎨',
        followers: 125000,
        engagement: 4.8,
        verified: true
      },
      campaign: {
        name: '여름 신상품 프로모션',
        status: 'negotiating'
      },
      lastMessage: '네, 제안해주신 조건 검토해보고 연락드릴게요!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
      unreadCount: 2,
      status: 'negotiating',
      isOnline: true,
      isPinned: true,
      contractStatus: 'proposed',
      proposedPrice: 2500000
    },
    {
      id: 2,
      influencer: {
        name: '이준호',
        handle: '@junho_food',
        avatar: '👨‍🍳',
        followers: 89000,
        engagement: 5.2,
        verified: true
      },
      campaign: {
        name: '맛집 탐방 캠페인',
        status: 'active'
      },
      lastMessage: '촬영 일정 확정되면 바로 알려드릴게요',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
      unreadCount: 0,
      status: 'active',
      isOnline: false,
      isPinned: false,
      contractStatus: 'accepted',
      proposedPrice: 1800000
    },
    {
      id: 3,
      influencer: {
        name: '박서연',
        handle: '@seoyeon_beauty',
        avatar: '💄',
        followers: 234000,
        engagement: 3.9,
        verified: true
      },
      campaign: {
        name: '뷰티 콜라보레이션',
        status: 'completed'
      },
      lastMessage: '리뷰 영상 업로드 완료했습니다!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      unreadCount: 0,
      status: 'completed',
      isOnline: false,
      isPinned: false,
      contractStatus: 'completed',
      proposedPrice: 3500000
    }
  ]);

  // 메시지 데이터
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: 'advertiser',
      content: '안녕하세요! 여름 신상품 프로모션 캠페인에 관심 가져주셔서 감사합니다.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isRead: true
    },
    {
      id: 2,
      senderId: 'influencer',
      content: '안녕하세요! 캠페인 내용이 정말 흥미로워 보여요. 구체적인 조건이 궁금합니다.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      isRead: true
    },
    {
      id: 3,
      senderId: 'advertiser',
      content: '피드 포스트 3개, 릴스 1개로 진행하고자 하며, 단가는 250만원을 생각하고 있습니다.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: true,
      attachments: [{
        type: 'contract',
        name: '계약 제안서',
        data: { price: 2500000, deadline: '2024-02-15' }
      }]
    },
    {
      id: 4,
      senderId: 'influencer',
      content: '네, 제안해주신 조건 검토해보고 연락드릴게요!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true
    }
  ]);

  // 필터링된 채팅방
  const filteredChatRooms = chatRooms.filter(room => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!room.influencer.name.toLowerCase().includes(query) &&
          !room.campaign.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (filterType !== 'all' && room.status !== filterType) {
      return false;
    }
    return true;
  });

  // 메시지 전송
  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      senderId: 'advertiser',
      content: message,
      timestamp: new Date(),
      isRead: false
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    
    // 스크롤 하단으로
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 시간 포맷
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 채팅 목록 사이드바 */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-96 bg-white border-r flex-col`}>
        {/* 헤더 */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-4">메시지</h1>
          
          {/* 검색 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="인플루언서 또는 캠페인 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 필터 탭 */}
          <div className="flex gap-1">
            {[
              { value: 'all' as const, label: '전체', count: chatRooms.length },
              { value: 'negotiating' as const, label: '협상중', count: 1 },
              { value: 'active' as const, label: '진행중', count: 1 },
              { value: 'completed' as const, label: '완료', count: 1 }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterType === tab.value
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 text-xs">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 채팅방 목록 */}
        <div className="flex-1 overflow-y-auto">
          {filteredChatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setSelectedChat(room)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedChat?.id === room.id ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 아바타 */}
                <div className="relative">
                  <div className="text-3xl">{room.influencer.avatar}</div>
                  {room.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{room.influencer.name}</h3>
                      {room.influencer.verified && (
                        <Shield className="w-3 h-3 text-blue-500" />
                      )}
                      {room.isPinned && (
                        <Pin className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTime(room.lastMessageTime)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-1">{room.campaign.name}</p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 truncate pr-2">
                      {room.lastMessage}
                    </p>
                    {room.unreadCount > 0 && (
                      <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* 상태 태그 */}
                  <div className="flex items-center gap-2 mt-2">
                    {room.contractStatus === 'proposed' && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        계약 검토중
                      </span>
                    )}
                    {room.contractStatus === 'accepted' && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        계약 완료
                      </span>
                    )}
                    {room.proposedPrice && (
                      <span className="text-xs text-gray-600">
                        ₩{(room.proposedPrice/10000).toFixed(0)}만원
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 채팅창 */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* 채팅 헤더 */}
          <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-3xl">{selectedChat.influencer.avatar}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold">{selectedChat.influencer.name}</h2>
                  {selectedChat.influencer.verified && (
                    <Shield className="w-4 h-4 text-blue-500" />
                  )}
                  {selectedChat.isOnline && (
                    <span className="text-xs text-green-600">● 온라인</span>
                  )}
                </div>
                <p className="text-xs text-gray-600">{selectedChat.campaign.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={() => setShowChatInfo(!showChatInfo)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Info className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === 'advertiser' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    msg.senderId === 'advertiser' 
                      ? 'bg-purple-600 text-white rounded-l-2xl rounded-br-2xl' 
                      : 'bg-white rounded-r-2xl rounded-bl-2xl shadow-sm'
                  } px-4 py-3`}>
                    <p className="text-sm">{msg.content}</p>
                    
                    {/* 계약 제안 첨부 */}
                    {msg.attachments?.some(a => a.type === 'contract') && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        msg.senderId === 'advertiser' 
                          ? 'bg-purple-700' 
                          : 'bg-gray-100'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-medium">계약 제안서</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>제안 금액:</span>
                            <span className="font-bold">₩250만원</span>
                          </div>
                          <div className="flex justify-between">
                            <span>마감일:</span>
                            <span>2024-02-15</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${
                        msg.senderId === 'advertiser' ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString('ko-KR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {msg.senderId === 'advertiser' && (
                        <div className="ml-2">
                          {msg.isRead ? (
                            <CheckCheck className="w-4 h-4 text-purple-200" />
                          ) : (
                            <Check className="w-4 h-4 text-purple-300" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 타이핑 표시 */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 빠른 액션 버튼 */}
          <div className="bg-white border-t px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1">
                <FileText className="w-3 h-3" />
                계약서 전송
              </button>
              <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                단가 협상
              </button>
              <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                일정 조율
              </button>
              <button className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1">
                <Image className="w-3 h-3" />
                콘텐츠 요청
              </button>
            </div>
          </div>

          {/* 메시지 입력창 */}
          <div className="bg-white border-t p-4">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Image className="w-5 h-5 text-gray-500" />
              </button>
              
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Smile className="w-5 h-5 text-gray-500" />
              </button>
              
              {message ? (
                <button
                  onClick={sendMessage}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Mic className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 채팅방 미선택 상태 */
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              대화를 선택해주세요
            </h2>
            <p className="text-sm text-gray-500">
              인플루언서와 소통하고 캠페인을 진행하세요
            </p>
          </div>
        </div>
      )}

      {/* 채팅 정보 사이드바 */}
      {showChatInfo && selectedChat && (
        <div className="w-80 bg-white border-l p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{selectedChat.influencer.avatar}</div>
              <h3 className="font-bold text-lg">{selectedChat.influencer.name}</h3>
              <p className="text-sm text-gray-500">{selectedChat.influencer.handle}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">팔로워</p>
                <p className="font-bold">
                  {(selectedChat.influencer.followers/1000).toFixed(0)}K
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">참여율</p>
                <p className="font-bold text-green-600">
                  {selectedChat.influencer.engagement}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">평점</p>
                <div className="flex items-center justify-center">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="font-bold ml-1">4.9</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">캠페인 정보</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">캠페인명</span>
                  <span className="font-medium">{selectedChat.campaign.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">상태</span>
                  <span className="font-medium text-green-600">협상중</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">제안 금액</span>
                  <span className="font-medium">
                    ₩{(selectedChat.proposedPrice || 0)/10000}만원
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">빠른 작업</h4>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                  계약서 보기
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  캠페인 상세 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}