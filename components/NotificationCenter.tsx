// components/NotificationCenter.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, Check, CheckCheck, Trash2, Settings, Filter,
  Clock, AlertCircle, Star, DollarSign, MessageCircle,
  TrendingUp, Users, Award, Sparkles, ChevronRight,
  Calendar, Eye, Heart, Zap, Info, Archive, Search
} from 'lucide-react';
import { useNotifications, usePushNotifications } from '@/hooks/useNotifications';
import type { Notification, NotificationType } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// 알림 아이콘 매핑
const NotificationIcons: Record<string, any> = {
  campaign_match: TrendingUp,
  application_accepted: Check,
  application_rejected: X,
  payment_received: DollarSign,
  campaign_deadline: Clock,
  new_message: MessageCircle,
  campaign_reminder: Calendar,
  profile_view: Eye,
  super_like: Star,
  new_applicant: Users,
  milestone_reached: Award,
  ai_insight: Sparkles,
  budget_alert: AlertCircle,
  campaign_completed: CheckCheck,
  review_submitted: Star,
  content_uploaded: Eye,
  high_match_alert: Zap,
  system_update: Info,
  promotion: Heart,
  achievement: Award
};

// 알림 색상 매핑
const NotificationColors: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
  gold: 'bg-amber-100 text-amber-700 border-amber-200'
};

export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    stats,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const { isSupported, permission, subscribe } = usePushNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);

  // 필터링된 알림
  const filteredNotifications = notifications.filter(notif => {
    // 읽음/미읽음 필터
    if (filter === 'unread' && notif.is_read) return false;
    
    // 타입 필터
    if (selectedType !== 'all' && notif.type !== selectedType) return false;
    
    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notif.title.toLowerCase().includes(query) ||
        notif.message.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // 그룹화된 알림 (날짜별)
  const groupedNotifications = filteredNotifications.reduce((groups, notif) => {
    const date = new Date(notif.created_at);
    const dateKey = date.toLocaleDateString('ko-KR');
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(notif);
    return groups;
  }, {} as Record<string, Notification[]>);

  // 알림 클릭 핸들러
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    
    setIsOpen(false);
  };

  // Push 알림 활성화
  const enablePushNotifications = async () => {
    await subscribe();
  };

  return (
    <>
      {/* 알림 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <Bell size={24} className="text-gray-700" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* 알림 센터 패널 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 백드롭 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* 알림 패널 */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* 헤더 */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell size={20} />
                    알림
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* 통계 */}
                {stats && (
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{stats.total}개 알림</span>
                    <span className="text-red-600 font-medium">{stats.unread}개 미읽음</span>
                  </div>
                )}

                {/* 검색 바 */}
                <div className="mt-3 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="알림 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* 필터 */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'all' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'unread' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    미읽음
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="ml-auto text-sm text-purple-600 hover:text-purple-700"
                    >
                      모두 읽음
                    </button>
                  )}
                </div>
              </div>

              {/* 설정 패널 */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b bg-gray-50 overflow-hidden"
                  >
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-3">알림 설정</h3>
                      
                      {/* Push 알림 설정 */}
                      {isSupported && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700">Push 알림</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              permission === 'granted' 
                                ? 'bg-green-100 text-green-700'
                                : permission === 'denied'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {permission === 'granted' ? '활성화' : 
                               permission === 'denied' ? '차단됨' : '미설정'}
                            </span>
                          </div>
                          {permission !== 'granted' && (
                            <button
                              onClick={enablePushNotifications}
                              className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                            >
                              Push 알림 활성화
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* 알림 타입 필터 */}
                      <div>
                        <p className="text-sm text-gray-700 mb-2">알림 타입</p>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value as any)}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value="all">전체 타입</option>
                          <option value="campaign_match">캠페인 매칭</option>
                          <option value="application_accepted">지원 승인</option>
                          <option value="payment_received">정산 완료</option>
                          <option value="new_message">새 메시지</option>
                          <option value="new_applicant">새 지원자</option>
                          <option value="ai_insight">AI 인사이트</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 알림 목록 */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-500">알림을 불러오는 중...</p>
                    </div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">알림이 없습니다</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {Object.entries(groupedNotifications).map(([date, notifs]) => (
                      <div key={date}>
                        <div className="px-4 py-2 bg-gray-50">
                          <p className="text-xs font-medium text-gray-600">{date}</p>
                        </div>
                        {notifs.map((notification) => {
                          const Icon = NotificationIcons[notification.type] || Bell;
                          const colorClass = NotificationColors[
                            NotificationTemplates[notification.type]?.color || 'gray'
                          ];
                          
                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`relative p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !notification.is_read ? 'bg-blue-50/50' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              {/* 미읽음 표시 */}
                              {!notification.is_read && (
                                <span className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                              )}

                              <div className="flex gap-3 ml-3">
                                {/* 아이콘 */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                  <Icon size={20} />
                                </div>

                                {/* 콘텐츠 */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 mb-1">
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  
                                  {/* 메타데이터 */}
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-gray-500">
                                      {formatDistanceToNow(new Date(notification.created_at), {
                                        addSuffix: true,
                                        locale: ko
                                      })}
                                    </span>
                                    
                                    {notification.priority === 'high' && (
                                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                        중요
                                      </span>
                                    )}
                                    
                                    {notification.action_url && (
                                      <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
                                    )}
                                  </div>
                                </div>

                                {/* 액션 버튼 */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} className="text-gray-500" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 하단 액션 */}
              {filteredNotifications.length > 0 && (
                <div className="p-4 border-t bg-gray-50">
                  <button
                    onClick={() => window.location.href = '/notifications'}
                    className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                  >
                    모든 알림 보기
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// NotificationTemplates import
import { NotificationTemplates } from '@/types/notifications';