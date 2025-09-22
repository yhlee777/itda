'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, ArrowLeft, MoreVertical, Phone, Video, 
  Paperclip, Image, Camera, Smile, Mic, 
  Check, CheckCheck, Search, Filter, X,
  User, Calendar, DollarSign, FileText,
  Shield, AlertCircle, Archive, Trash2,
  MessageCircle
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
}

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
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
      lastMessage: '네, 그렇게 진행하시죠!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
      unreadCount: 2,
      status: 'negotiating',
      isOnline: true,
      isTyping: false
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
      isTyping: false
    }
  ]);

  // 샘플 메시지 로드
  useEffect(() => {
    if (selectedRoom) {
      // 실제로는 API에서 메시지를 가져옴
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
          content: '네, 안녕하세요! 캠페인 내용이 정말 흥미로워요.',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          isRead: true
        },
        {
          id: '3',
          senderId: 'other',
          senderType: 'advertiser',
          content: '제안드린 금액과 일정은 어떠신가요?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isRead: true
        },
        {
          id: '4',
          senderId: 'system',
          senderType: 'system',
          content: '💼 계약 제안이 도착했습니다',
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          isRead: true,
          attachments: [{
            type: 'contract',
            url: '#',
            name: '계약서_나이키_여름캠페인.pdf'
          }]
        },
        {
          id: '5',
          senderId: 'me',
          senderType: 'influencer',
          content: '확인했습니다. 검토 후 말씀드릴게요!',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          isRead: true
        },
        {
          id: '6',
          senderId: 'other',
          senderType: 'advertiser',
          content: '네, 그렇게 진행하시죠!',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          isRead: false
        }
      ]);
    }
  }, [selectedRoom]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송
  const sendMessage = () => {
    if (!message.trim() || !selectedRoom) return;

    const newMessage: Message = {
      id: String(Date.now()),
      senderId: 'me',
      senderType: currentUserType,
      content: message,
      timestamp: new Date(),
      isRead: false
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // 타이핑 효과 시뮬레이션
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // 자동 응답 시뮬레이션
        const autoReply: Message = {
          id: String(Date.now() + 1),
          senderId: 'other',
          senderType: selectedRoom.otherPartyType,
          content: '네, 확인했습니다!',
          timestamp: new Date(),
          isRead: false
        };
        setMessages(prev => [...prev, autoReply]);
      }, 2000);
    }, 500);
  };

  // 파일 업로드
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom) return;

    // 실제로는 파일 업로드 처리
    const newMessage: Message = {
      id: String(Date.now()),
      senderId: 'me',
      senderType: currentUserType,
      content: '파일을 전송했습니다',
      timestamp: new Date(),
      isRead: false,
      attachments: [{
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        name: file.name
      }]
    };

    setMessages([...messages, newMessage]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 채팅방 목록 */}
      <div className={`${selectedRoom ? 'hidden md:block' : 'block'} w-full md:w-80 bg-white border-r`}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-3">메시지</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="대화 검색..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          {chatRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`w-full p-4 hover:bg-gray-50 transition-colors border-b ${
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
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{room.brandName}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(room.lastMessageTime, { 
                        addSuffix: true, 
                        locale: ko 
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{room.campaignName}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 truncate flex-1">
                      {room.lastMessage}
                    </p>
                    {room.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
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
                  <h2 className="font-semibold">{selectedRoom.brandName}</h2>
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
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'} ${
                  msg.senderType === 'system' ? 'justify-center' : ''
                }`}
              >
                {msg.senderType === 'system' ? (
                  <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-sm">
                    <p className="text-sm text-gray-700">{msg.content}</p>
                    {msg.attachments?.map((attachment, idx) => (
                      <div key={idx} className="mt-2 p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">{attachment.name}</span>
                        </div>
                        <button className="mt-2 w-full py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                          계약서 확인
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`max-w-[70%] ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        msg.senderId === 'me'
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.attachments?.map((attachment, idx) => (
                        <div key={idx} className="mt-2">
                          {attachment.type === 'image' ? (
                            <img
                              src={attachment.url}
                              alt="첨부 이미지"
                              className="rounded-lg max-w-full"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-white/10 rounded">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{attachment.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-xs text-gray-500">
                        {format(msg.timestamp, 'HH:mm')}
                      </span>
                      {msg.senderId === 'me' && (
                        msg.isRead ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Check className="w-3 h-3 text-gray-400" />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {(isTyping || selectedRoom.isTyping) && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="bg-white border-t p-4">
            <div className="flex items-end gap-2">
              <div className="flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="메시지를 입력하세요..."
                  className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-full">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className={`p-2 rounded-full transition-colors ${
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
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">대화를 선택하세요</h3>
            <p className="text-gray-500">브랜드와 메시지를 주고받을 수 있습니다</p>
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
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-sm">신고하기</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-red-600">
                <Archive className="w-5 h-5" />
                <span className="text-sm">대화 보관하기</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}