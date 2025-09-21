// types/notifications.ts

// 알림 타입 정의
export type NotificationType = 
  // 인플루언서용
  | 'campaign_match'        // 새 캠페인 매칭
  | 'application_accepted'  // 지원 승인
  | 'application_rejected'  // 지원 거절  
  | 'payment_received'      // 정산 완료
  | 'campaign_deadline'     // 캠페인 마감 임박
  | 'new_message'          // 새 메시지
  | 'campaign_reminder'    // 캠페인 리마인더
  | 'profile_view'         // 프로필 조회
  | 'super_like'          // 슈퍼라이크 받음
  
  // 광고주용
  | 'new_applicant'       // 새 지원자
  | 'milestone_reached'   // 마일스톤 달성
  | 'ai_insight'         // AI 인사이트
  | 'budget_alert'       // 예산 알림
  | 'campaign_completed' // 캠페인 완료
  | 'review_submitted'   // 리뷰 제출됨
  | 'content_uploaded'   // 콘텐츠 업로드
  | 'high_match_alert'   // 높은 매칭 알림
  
  // 공통
  | 'system_update'      // 시스템 업데이트
  | 'promotion'         // 프로모션
  | 'achievement'       // 업적 달성

// 알림 인터페이스
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  action_url?: string;
  action_type?: 'navigate' | 'modal' | 'external';
  priority?: 'high' | 'medium' | 'low';
  expires_at?: string;
  image_url?: string;
  icon?: string;
  color?: string;
}

// 메타데이터 타입
export interface NotificationMetadata {
  campaign_id?: string;
  campaign_name?: string;
  influencer_id?: string;
  influencer_name?: string;
  advertiser_id?: string;
  amount?: number;
  match_score?: number;
  applicant_count?: number;
  deadline?: string;
  [key: string]: any;
}

// 알림 설정
export interface NotificationPreferences {
  user_id: string;
  
  // 채널 설정
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  
  // 알림 타입별 설정
  types: {
    [key in NotificationType]?: {
      enabled: boolean;
      channels?: ('push' | 'email' | 'sms' | 'inApp')[];
      frequency?: 'instant' | 'hourly' | 'daily' | 'weekly';
    };
  };
  
  // 시간 설정
  quiet_hours?: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
    timezone: string;
  };
  
  // 알림 그룹화
  grouping?: {
    enabled: boolean;
    interval: number; // 분 단위
  };
}

// 알림 액션
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
  needsAuth?: boolean;
  data?: any;
}

// Push 구독 정보
export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  device_info?: {
    browser: string;
    os: string;
    device: string;
  };
  created_at: string;
  last_used_at: string;
}

// 알림 통계
export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<NotificationType, number>;
  by_priority: {
    high: number;
    medium: number;
    low: number;
  };
  last_read_at?: string;
}

// 알림 템플릿
export const NotificationTemplates: Record<NotificationType, {
  title: (data?: any) => string;
  message: (data?: any) => string;
  icon: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}> = {
  // 인플루언서용
  campaign_match: {
    title: (data) => `🎯 새로운 매칭: ${data?.campaign_name}`,
    message: (data) => `${data?.brand}의 새 캠페인이 ${data?.match_score}% 매칭되었습니다!`,
    icon: '🎯',
    color: 'purple',
    priority: 'high'
  },
  application_accepted: {
    title: () => '✅ 지원이 승인되었습니다!',
    message: (data) => `${data?.campaign_name} 캠페인에 선정되었습니다. 축하합니다!`,
    icon: '✅',
    color: 'green',
    priority: 'high'
  },
  application_rejected: {
    title: () => '📋 지원 결과 안내',
    message: (data) => `${data?.campaign_name} 캠페인은 다른 인플루언서가 선정되었습니다.`,
    icon: '📋',
    color: 'gray',
    priority: 'low'
  },
  payment_received: {
    title: () => '💰 정산이 완료되었습니다!',
    message: (data) => `${data?.amount?.toLocaleString()}원이 입금되었습니다.`,
    icon: '💰',
    color: 'green',
    priority: 'high'
  },
  campaign_deadline: {
    title: () => '⏰ 마감 임박!',
    message: (data) => `${data?.campaign_name} 캠페인이 ${data?.hours}시간 후 마감됩니다.`,
    icon: '⏰',
    color: 'orange',
    priority: 'medium'
  },
  new_message: {
    title: (data) => `💬 ${data?.sender_name}님의 메시지`,
    message: (data) => data?.message_preview || '새 메시지가 도착했습니다.',
    icon: '💬',
    color: 'blue',
    priority: 'medium'
  },
  campaign_reminder: {
    title: () => '📅 캠페인 리마인더',
    message: (data) => `${data?.campaign_name} 콘텐츠 제출일이 ${data?.days}일 남았습니다.`,
    icon: '📅',
    color: 'blue',
    priority: 'medium'
  },
  profile_view: {
    title: () => '👀 프로필 조회',
    message: (data) => `${data?.viewer_name}님이 당신의 프로필을 확인했습니다.`,
    icon: '👀',
    color: 'purple',
    priority: 'low'
  },
  super_like: {
    title: () => '⭐ 슈퍼라이크를 받았습니다!',
    message: (data) => `${data?.brand}가 당신에게 특별한 관심을 보였습니다!`,
    icon: '⭐',
    color: 'yellow',
    priority: 'high'
  },
  
  // 광고주용
  new_applicant: {
    title: (data) => `🔔 새 지원자 ${data?.count || 1}명`,
    message: (data) => `${data?.campaign_name}에 새로운 인플루언서가 지원했습니다.`,
    icon: '🔔',
    color: 'purple',
    priority: 'high'
  },
  milestone_reached: {
    title: () => '🏆 마일스톤 달성!',
    message: (data) => `캠페인이 ${data?.milestone}을 달성했습니다!`,
    icon: '🏆',
    color: 'gold',
    priority: 'medium'
  },
  ai_insight: {
    title: () => '🤖 AI 분석 완료',
    message: (data) => `${data?.insight_type}: ${data?.summary}`,
    icon: '🤖',
    color: 'blue',
    priority: 'medium'
  },
  budget_alert: {
    title: () => '💳 예산 알림',
    message: (data) => `예산의 ${data?.percentage}%가 사용되었습니다.`,
    icon: '💳',
    color: 'orange',
    priority: 'high'
  },
  campaign_completed: {
    title: () => '🎉 캠페인 완료!',
    message: (data) => `${data?.campaign_name}이 성공적으로 완료되었습니다.`,
    icon: '🎉',
    color: 'green',
    priority: 'medium'
  },
  review_submitted: {
    title: () => '⭐ 새 리뷰',
    message: (data) => `${data?.influencer_name}님이 ${data?.rating}점 리뷰를 남겼습니다.`,
    icon: '⭐',
    color: 'yellow',
    priority: 'low'
  },
  content_uploaded: {
    title: () => '📸 콘텐츠 업로드',
    message: (data) => `${data?.influencer_name}님이 콘텐츠를 업로드했습니다.`,
    icon: '📸',
    color: 'purple',
    priority: 'medium'
  },
  high_match_alert: {
    title: () => '🔥 높은 매칭률!',
    message: (data) => `${data?.influencer_name}님이 ${data?.match_score}% 매칭됩니다!`,
    icon: '🔥',
    color: 'red',
    priority: 'high'
  },
  
  // 공통
  system_update: {
    title: () => '📢 시스템 업데이트',
    message: (data) => data?.message || '새로운 기능이 추가되었습니다.',
    icon: '📢',
    color: 'gray',
    priority: 'low'
  },
  promotion: {
    title: () => '🎁 특별 프로모션!',
    message: (data) => data?.message || '지금 확인하세요!',
    icon: '🎁',
    color: 'pink',
    priority: 'medium'
  },
  achievement: {
    title: () => '🏅 업적 달성!',
    message: (data) => `"${data?.achievement_name}" 업적을 달성했습니다!`,
    icon: '🏅',
    color: 'gold',
    priority: 'medium'
  }
};

// 알림 그룹화 유틸리티
export function groupNotifications(notifications: Notification[]): Map<string, Notification[]> {
  const grouped = new Map<string, Notification[]>();
  
  notifications.forEach(notification => {
    const key = `${notification.type}_${notification.metadata?.campaign_id || 'general'}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    
    grouped.get(key)!.push(notification);
  });
  
  return grouped;
}

// 알림 우선순위 정렬
export function sortByPriority(notifications: Notification[]): Notification[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  
  return notifications.sort((a, b) => {
    const aPriority = priorityOrder[a.priority || 'low'];
    const bPriority = priorityOrder[b.priority || 'low'];
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // 같은 우선순위면 시간순
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

// 알림 필터링
export function filterNotifications(
  notifications: Notification[],
  filters: {
    unreadOnly?: boolean;
    types?: NotificationType[];
    priority?: ('high' | 'medium' | 'low')[];
    dateRange?: { start: Date; end: Date };
  }
): Notification[] {
  return notifications.filter(notification => {
    if (filters.unreadOnly && notification.is_read) {
      return false;
    }
    
    if (filters.types && !filters.types.includes(notification.type)) {
      return false;
    }
    
    if (filters.priority && notification.priority && !filters.priority.includes(notification.priority)) {
      return false;
    }
    
    if (filters.dateRange) {
      const createdAt = new Date(notification.created_at);
      if (createdAt < filters.dateRange.start || createdAt > filters.dateRange.end) {
        return false;
      }
    }
    
    return true;
  });
}