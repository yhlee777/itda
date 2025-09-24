"use client";
// app/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Bell, BellOff, Check, CheckCheck, Trash2, Filter, Search,
  Clock, AlertCircle, Star, DollarSign, MessageCircle,
  TrendingUp, Users, Award, Sparkles, ChevronRight,
  Calendar, Eye, Heart, Zap, Info, Archive, ChevronLeft,
  Inbox, Settings, X, Loader, RefreshCw, SortAsc, SortDesc
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification, NotificationType } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import NotificationCenter from '@/components/NotificationCenter';

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

// 알림 타입 라벨
const NotificationTypeLabels: Record<NotificationType, string> = {
  campaign_match: '캠페인 매칭',
  application_accepted: '지원 승인',
  application_rejected: '지원 거절',
  payment_received: '정산 완료',
  campaign_deadline: '마감 임박',
  new_message: '새 메시지',
  campaign_reminder: '리마인더',
  profile_view: '프로필 조회',
  super_like: '슈퍼라이크',
  new_applicant: '새 지원자',
  milestone_reached: '마일스톤',
  ai_insight: 'AI 인사이트',
  budget_alert: '예산 알림',
  campaign_completed: '캠페인 완료',
  review_submitted: '리뷰',
  content_uploaded: '콘텐츠',
  high_match_alert: '높은 매칭',
  system_update: '시스템',
  promotion: '프로모션',
  achievement: '업적'
};

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    stats,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // 그룹화된 알림 (날짜별)
  const groupedNotifications = filteredNotifications.reduce((groups, notif) => {
    const date = new Date(notif.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = '어제';
    } else {
      dateKey = date.toLocaleDateString('ko-KR', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    }
    
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
      router.push(notification.action_url);
    }
  };

  // 선택된 알림 일괄 삭제
  const handleBulkDelete = async () => {
    for (const id of selectedNotifications) {
      await deleteNotification(id);
    }
    setSelectedNotifications([]);
  };

  // 새로고침
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 알림 선택 토글
  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // 템플릿 import
  const { NotificationTemplates } = require('@/types/notifications');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">알림</h1>
                {stats && (
                  <p className="text-sm text-gray-600">
                    전체 {stats.total}개 · 미읽음 {stats.unread}개
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Filter size={20} />
                {(selectedType !== 'all' || filter !== 'all') && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full" />
                )}
              </button>
              <button
                onClick={() => router.push('/settings/notifications')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* 검색 바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="알림 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 빠른 필터 */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                filter === 'unread' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              미읽음
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  모두 읽음
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 필터 패널 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t bg-gray-50 overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">알림 타입</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedType === 'all'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    전체
                  </button>
                  {Object.entries(NotificationTypeLabels).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type as NotificationType)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedType === type
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 선택 모드 툴바 */}
      {selectedNotifications.length > 0 && (
        <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedNotifications([])}
              className="p-1"
            >
              <X size={20} />
            </button>
            <span className="font-medium">
              {selectedNotifications.length}개 선택됨
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
            >
              삭제
            </button>
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1 bg-purple-700 hover:bg-purple-800 rounded-lg text-sm font-medium transition-colors"
            >
              {selectedNotifications.length === filteredNotifications.length ? '선택 해제' : '전체 선택'}
            </button>
          </div>
        </div>
      )}

      {/* 알림 목록 */}
      <div className="pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">알림을 불러오는 중...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              {filter === 'unread' ? (
                <>
                  <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">미읽은 알림이 없습니다</p>
                </>
              ) : searchQuery ? (
                <>
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">검색 결과가 없습니다</p>
                </>
              ) : (
                <>
                  <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">알림이 없습니다</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div>
            {Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date}>
                <div className="px-4 py-2 bg-gray-100">
                  <p className="text-sm font-medium text-gray-600">{date}</p>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {notifs.map((notification) => {
                    const Icon = NotificationIcons[notification.type] || Bell;
                    const template = NotificationTemplates[notification.type];
                    const colorClass = NotificationColors[template?.color || 'gray'];
                    const isSelected = selectedNotifications.includes(notification.id);
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`relative px-4 py-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.is_read ? 'bg-blue-50/30' : ''
                        } ${isSelected ? 'bg-purple-50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* 체크박스 (선택 모드) */}
                          {selectedNotifications.length > 0 && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleNotificationSelection(notification.id)}
                              className="mt-1 w-4 h-4 text-purple-600 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          
                          {/* 미읽음 표시 */}
                          {!notification.is_read && (
                            <span className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          
                          {/* 아이콘 */}
                          <div 
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                            onClick={(e) => {
                              if (selectedNotifications.length === 0) {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }
                            }}
                          >
                            <Icon size={20} />
                          </div>
                          
                          {/* 콘텐츠 */}
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => {
                              if (selectedNotifications.length === 0) {
                                handleNotificationClick(notification);
                              } else {
                                toggleNotificationSelection(notification.id);
                              }
                            }}
                          >
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
                                <ChevronRight className="w-3 h-3 text-gray-400" />
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
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 플로팅 액션 버튼 (설정) */}
      <button
        onClick={() => router.push('/settings/notifications')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
      >
        <Settings size={24} />
      </button>
    </div>
  );
}