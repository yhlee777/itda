"use client";
// app/settings/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Bell, BellOff, Smartphone, Mail, MessageSquare, Clock,
  Check, X, Info, ChevronLeft, Save, Loader, AlertCircle,
  Sun, Moon, Volume2, VolumeX, Vibrate, Globe, Shield
} from 'lucide-react';
import { useNotifications, usePushNotifications } from '@/hooks/useNotifications';
import type { NotificationPreferences, NotificationType } from '@/types/notifications';

// 알림 카테고리
const NotificationCategories = {
  campaign: {
    title: '캠페인',
    icon: '🎯',
    types: ['campaign_match', 'campaign_deadline', 'campaign_reminder', 'campaign_completed']
  },
  application: {
    title: '지원',
    icon: '📋',
    types: ['application_accepted', 'application_rejected', 'new_applicant']
  },
  payment: {
    title: '정산',
    icon: '💰',
    types: ['payment_received', 'budget_alert']
  },
  communication: {
    title: '커뮤니케이션',
    icon: '💬',
    types: ['new_message', 'review_submitted']
  },
  insights: {
    title: 'AI & 인사이트',
    icon: '🤖',
    types: ['ai_insight', 'milestone_reached', 'high_match_alert']
  },
  profile: {
    title: '프로필',
    icon: '👤',
    types: ['profile_view', 'super_like', 'content_uploaded']
  },
  system: {
    title: '시스템',
    icon: '⚙️',
    types: ['system_update', 'promotion', 'achievement']
  }
};

// 알림 타입 라벨
const NotificationTypeLabels: Record<NotificationType, string> = {
  campaign_match: '새 캠페인 매칭',
  application_accepted: '지원 승인',
  application_rejected: '지원 거절',
  payment_received: '정산 완료',
  campaign_deadline: '캠페인 마감 임박',
  new_message: '새 메시지',
  campaign_reminder: '캠페인 리마인더',
  profile_view: '프로필 조회',
  super_like: '슈퍼라이크',
  new_applicant: '새 지원자',
  milestone_reached: '마일스톤 달성',
  ai_insight: 'AI 인사이트',
  budget_alert: '예산 알림',
  campaign_completed: '캠페인 완료',
  review_submitted: '리뷰 제출',
  content_uploaded: '콘텐츠 업로드',
  high_match_alert: '높은 매칭 알림',
  system_update: '시스템 업데이트',
  promotion: '프로모션',
  achievement: '업적 달성'
};

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { isSupported, permission, subscribe, unsubscribe } = usePushNotifications();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    user_id: '',
    channels: {
      push: true,
      email: true,
      sms: false,
      inApp: true
    },
    types: {},
    quiet_hours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'Asia/Seoul'
    },
    grouping: {
      enabled: true,
      interval: 30
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // 설정 불러오기
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  // 설정 저장
  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      
      if (response.ok) {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 채널 토글
  const toggleChannel = (channel: keyof typeof preferences.channels) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel]
      }
    }));
  };

  // 알림 타입 토글
  const toggleNotificationType = (type: NotificationType) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: {
          enabled: !prev.types[type]?.enabled,
          channels: ['push', 'inApp'],
          frequency: 'instant'
        }
      }
    }));
  };

  // 카테고리 전체 토글
  const toggleCategory = (category: string, types: string[]) => {
    const allEnabled = types.every(type => preferences.types[type as NotificationType]?.enabled);
    
    const updatedTypes = { ...preferences.types };
    types.forEach(type => {
      updatedTypes[type as NotificationType] = {
        enabled: !allEnabled,
        channels: ['push', 'inApp'],
        frequency: 'instant'
      };
    });
    
    setPreferences(prev => ({
      ...prev,
      types: updatedTypes
    }));
  };

  // 카테고리 확장/축소
  const toggleCategoryExpand = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Push 알림 활성화
  const handleEnablePush = async () => {
    if (permission === 'granted') {
      toggleChannel('push');
    } else {
      await subscribe();
      if (Notification.permission === 'granted') {
        setPreferences(prev => ({
          ...prev,
          channels: { ...prev.channels, push: true }
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">알림 설정</h1>
            </div>
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save size={18} />
                  저장
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 저장 성공 토스트 */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <Check size={18} />
            설정이 저장되었습니다
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 알림 채널 설정 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">알림 받을 방법</h2>
          
          <div className="space-y-4">
            {/* Push 알림 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Push 알림</p>
                  <p className="text-sm text-gray-600">브라우저 푸시 알림</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {permission === 'denied' && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                    차단됨
                  </span>
                )}
                <button
                  onClick={handleEnablePush}
                  disabled={permission === 'denied'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.channels.push && permission === 'granted'
                      ? 'bg-purple-600' 
                      : 'bg-gray-200'
                  } ${permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.channels.push && permission === 'granted'
                        ? 'translate-x-6' 
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 이메일 알림 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">이메일</p>
                  <p className="text-sm text-gray-600">중요한 알림만 이메일로</p>
                </div>
              </div>
              <button
                onClick={() => toggleChannel('email')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.channels.email ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.channels.email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* SMS 알림 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">SMS</p>
                  <p className="text-sm text-gray-600">긴급 알림만 문자로</p>
                </div>
              </div>
              <button
                onClick={() => toggleChannel('sms')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.channels.sms ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.channels.sms ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 인앱 알림 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">앱 내 알림</p>
                  <p className="text-sm text-gray-600">앱 사용 중 알림 표시</p>
                </div>
              </div>
              <button
                onClick={() => toggleChannel('inApp')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.channels.inApp ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.channels.inApp ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 알림 타입별 설정 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">알림 종류별 설정</h2>
          
          <div className="space-y-3">
            {Object.entries(NotificationCategories).map(([key, category]) => {
              const isExpanded = expandedCategories.includes(key);
              const types = category.types as NotificationType[];
              const enabledCount = types.filter(type => 
                preferences.types[type]?.enabled
              ).length;
              
              return (
                <div key={key} className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleCategoryExpand(key)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{category.title}</p>
                        <p className="text-sm text-gray-600">
                          {enabledCount}/{types.length} 활성화
                        </p>
                      </div>
                    </div>
                    <ChevronLeft
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? '-rotate-90' : 'rotate-0'
                      }`}
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 py-3 border-t bg-gray-50">
                      <div className="flex justify-end mb-3">
                        <button
                          onClick={() => toggleCategory(key, types)}
                          className="text-sm text-purple-600 hover:text-purple-700"
                        >
                          {enabledCount === types.length ? '모두 끄기' : '모두 켜기'}
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {types.map(type => (
                          <label
                            key={type}
                            className="flex items-center justify-between py-2 cursor-pointer"
                          >
                            <span className="text-sm text-gray-700">
                              {NotificationTypeLabels[type]}
                            </span>
                            <input
                              type="checkbox"
                              checked={preferences.types[type]?.enabled || false}
                              onChange={() => toggleNotificationType(type)}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 방해 금지 시간 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">방해 금지 시간</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Moon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">방해 금지 모드</p>
                  <p className="text-sm text-gray-600">설정된 시간에는 알림 무음</p>
                </div>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  quiet_hours: {
                    ...prev.quiet_hours!,
                    enabled: !prev.quiet_hours?.enabled
                  }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.quiet_hours?.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.quiet_hours?.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {preferences.quiet_hours?.enabled && (
              <div className="grid grid-cols-2 gap-4 pl-13">
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">시작 시간</label>
                  <input
                    type="time"
                    value={preferences.quiet_hours.start}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      quiet_hours: {
                        ...prev.quiet_hours!,
                        start: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">종료 시간</label>
                  <input
                    type="time"
                    value={preferences.quiet_hours.end}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      quiet_hours: {
                        ...prev.quiet_hours!,
                        end: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 알림 그룹화 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">알림 그룹화</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">유사한 알림 그룹화</p>
                <p className="text-sm text-gray-600">같은 종류의 알림을 하나로 표시</p>
              </div>
            </div>
            <button
              onClick={() => setPreferences(prev => ({
                ...prev,
                grouping: {
                  ...prev.grouping!,
                  enabled: !prev.grouping?.enabled
                }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.grouping?.enabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.grouping?.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 정보 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">알림 설정 안내</p>
            <p>중요한 알림(캠페인 매칭, 지원 승인 등)은 항상 받으시는 것을 권장합니다. 
               브라우저 설정에서 알림을 차단한 경우, 브라우저 설정을 변경해야 Push 알림을 받을 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}