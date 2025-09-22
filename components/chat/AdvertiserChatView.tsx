// components/chat/AdvertiserChatView.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, Search, Send, Paperclip, Image, 
  Calendar, DollarSign, FileText, Phone, Video, Info,
  Star, Clock, CheckCircle, Shield, ChevronLeft, Smile, Mic,
  TrendingUp, Users, Zap, Check, CheckCheck, Camera,
  Pin, Filter
} from 'lucide-react';

interface AdvertiserChatViewProps {
  userId: string;
}

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
  id: string;
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

interface Message {
  id: string;
  senderId: 'advertiser' | 'influencer' | 'system';
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export default function AdvertiserChatView({ userId }: AdvertiserChatViewProps) {
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'negotiating' | 'completed'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 테스트 데이터
  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
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
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 10),
      unreadCount: 1,
      status: 'negotiating',
      isOnline: true,
      isPinned: true,
      contractStatus: 'proposed',
      proposedPrice: 1500000
    },
    {
      id: '2',
      influencer: {
        name: '이준호',
        handle: '@junho_tech',
        avatar: '👨‍💻',
        followers: 89000,
        engagement: 5.2,
        verified: false
      },
      campaign: {
        name: '테크 리뷰 캠페인',
        status: 'active'
      },
      lastMessage: '리뷰 콘텐츠 제작 중입니다!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60),
      unreadCount: 0,
      status: 'active',
      isOnline: false,
      isPinned: false,
      contractStatus: 'accepted',
      proposedPrice: 1000000
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'advertiser',
      content: '안녕하세요! 이번 캠페인 참여 제안드립니다.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true
    },
    {
      id: '2',
      senderId: 'influencer',
      content: '안녕하세요! 제안 감사합니다. 자세한 내용 확인해보겠습니다.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true
    },
    {
      id: '3',
      senderId: 'advertiser',
      content: '단가는 협의 가능하니 편하게 말씀해주세요!',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isRead: true
    }
  ]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString();
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    console.log('메시지 전송:', message);
    setMessage('');
  };

  const filteredRooms = chatRooms.filter(room => {
    if (filterType !== 'all' && room.status !== filterType) return false;
    if (searchQuery && !room.influencer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full bg-gray-50">
      {/* 채팅방 목록 */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col bg-white border-r`}>
        {/* 헤더 */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-4 text-gray-900">인플루언서 메시지</h1>
          
          {/* 검색바 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="인플루언서 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 필터 */}
          <div className="flex gap-2">
            {(['all', 'active', 'negotiating', 'completed'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterType === type 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'all' && '전체'}
                {type === 'active' && '진행중'}
                {type === 'negotiating' && '협상중'}
                {type === 'completed' && '완료'}
              </button>
            ))}
          </div>
        </div>

        {/* 채팅방 리스트 */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              onClick={() => setSelectedChat(room)}
              className={`p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors ${
                selectedChat?.id === room.id ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="text-3xl">{room.influencer.avatar}</div>
                  {room.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{room.influencer.name}</h3>
                      {room.influencer.verified && (
                        <Shield className="w-3 h-3 text-blue-500" />
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
                      <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      👥 {(room.influencer.followers / 1000).toFixed(0)}K
                    </span>
                    <span className="text-xs text-gray-500">
                      ⚡ {room.influencer.engagement}%
                    </span>
                    {room.contractStatus === 'proposed' && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        계약 검토중
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
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString('ko-KR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {msg.senderId === 'advertiser' && (
                        msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 빠른 액션 버튼들 */}
          <div className="bg-gray-50 border-t border-b p-2 flex gap-2 overflow-x-auto">
            <button className="px-3 py-1 bg-white border rounded-full text-sm whitespace-nowrap hover:bg-gray-50">
              📋 계약서 전송
            </button>
            <button className="px-3 py-1 bg-white border rounded-full text-sm whitespace-nowrap hover:bg-gray-50">
              💰 단가 제안
            </button>
            <button className="px-3 py-1 bg-white border rounded-full text-sm whitespace-nowrap hover:bg-gray-50">
              📅 일정 확인
            </button>
            <button className="px-3 py-1 bg-white border rounded-full text-sm whitespace-nowrap hover:bg-gray-50">
              📄 가이드라인
            </button>
          </div>

          {/* 메시지 입력창 */}
          <div className="bg-white p-4">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
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
    </div>
  );
}