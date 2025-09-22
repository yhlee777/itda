// lib/utils/toast.ts
import { toast as sonnerToast, ExternalToast } from 'sonner';
import type { ReactNode, ReactElement } from 'react';
import { createElement } from 'react';

// 커스텀 토스트 유틸리티
export const toast = {
  // 성공 토스트
  success: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.success(message, {
      description,
      duration: 3000,
      style: {
        background: '#10b981',
        color: 'white',
        border: 'none',
      },
      ...options,
    });
  },

  // 에러 토스트
  error: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.error(message, {
      description,
      duration: 4000,
      style: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
      },
      ...options,
    });
  },

  // 정보 토스트
  info: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.info(message, {
      description,
      duration: 3000,
      style: {
        background: '#3b82f6',
        color: 'white',
        border: 'none',
      },
      ...options,
    });
  },

  // 경고 토스트
  warning: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.warning(message, {
      description,
      duration: 3500,
      style: {
        background: '#f59e0b',
        color: 'white',
        border: 'none',
      },
      ...options,
    });
  },

  // 로딩 토스트
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      duration: Infinity,
      style: {
        background: '#f3f4f6',
        color: '#6b7280',
      },
    });
  },

  // 프라미스 토스트
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },

  // 커스텀 토스트 (함수 방식만 지원)
  custom: (renderFn: (id: string | number) => ReactElement) => {
    return sonnerToast.custom(renderFn);
  },

  // 간단한 커스텀 토스트 (ReactNode를 안전하게 처리)
  customSimple: (content: ReactNode) => {
    return sonnerToast.custom((id) => 
      createElement('div', { key: id, children: content })
    );
  },

  // 매칭 성공 알림 (특별한 스타일)
  matchSuccess: (campaignName: string) => {
    return sonnerToast.success(
      `🎯 매칭 성공!`,
      {
        description: `${campaignName} 캠페인과 연결되었습니다`,
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
        },
      }
    );
  },

  // AI 인사이트 알림
  aiInsight: (message: string, insight: string) => {
    return sonnerToast(message, {
      description: insight,
      icon: '🤖',
      duration: 6000,
      position: 'top-center',
      style: {
        background: '#f3f4f6',
        color: '#111827',
        border: '1px solid #e5e7eb',
      },
    });
  },

  // 지원자 알림
  newApplicant: (count: number, campaignId: string) => {
    return sonnerToast(
      `새로운 지원자 ${count}명`,
      {
        description: '클릭하여 확인하기',
        icon: '👥',
        duration: 5000,
        action: {
          label: '확인',
          onClick: () => {
            window.location.href = `/dashboard/campaigns/${campaignId}/applicants`;
          },
        },
      }
    );
  },

  // 가격 변동 알림
  priceUpdate: (price: number, change: number) => {
    const isIncrease = change > 0;
    return sonnerToast(
      `단가 ${isIncrease ? '상승' : '하락'}`,
      {
        description: `${price.toLocaleString()}원 (${Math.abs(change)}%)`,
        icon: isIncrease ? '📈' : '📉',
        duration: 4000,
        style: {
          background: isIncrease ? '#fef3c7' : '#fee2e2',
          color: isIncrease ? '#92400e' : '#991b1b',
          border: `1px solid ${isIncrease ? '#fde68a' : '#fecaca'}`,
        },
      }
    );
  },

  // 결제 완료
  paymentComplete: (amount: number, campaignName: string) => {
    return sonnerToast.success(
      `💰 결제 완료`,
      {
        description: `${campaignName}: ${amount.toLocaleString()}원`,
        duration: 5000,
        style: {
          background: '#10b981',
          color: 'white',
        },
      }
    );
  },

  // 토스트 닫기
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};

// 사용 예제
/*
import { toast } from '@/lib/utils/toast';
import { createElement } from 'react';

// 기본 사용
toast.success('성공했습니다!');
toast.error('오류가 발생했습니다');
toast.info('알려드립니다', '새로운 기능이 추가되었습니다');
toast.warning('주의하세요');

// 프라미스 처리
toast.promise(
  fetch('/api/data'),
  {
    loading: '데이터 불러오는 중...',
    success: (data) => `${data.length}개 항목 로드 완료`,
    error: (err) => `오류: ${err.message}`,
  }
);

// 특별한 알림
toast.matchSuccess('나이키 캠페인');
toast.aiInsight('AI 분석 완료', '매칭률 92%로 높은 편입니다');
toast.newApplicant(5, 'campaign-123');
toast.priceUpdate(3500000, 12.5);
toast.paymentComplete(2500000, '설화수 캠페인');

// 커스텀 JSX - 함수 방식
toast.custom((id) => 
  createElement('div', {
    className: 'bg-white p-4 rounded-lg shadow-lg',
    children: [
      createElement('h3', { key: 'title', className: 'font-bold' }, '커스텀 알림'),
      createElement('p', { key: 'content' }, '원하는 내용을 자유롭게'),
      createElement('button', { 
        key: 'btn',
        onClick: () => toast.dismiss(id)
      }, '닫기')
    ]
  })
);

// 커스텀 JSX - 간단한 방식 (JSX 사용 시)
toast.customSimple(
  <>
    <h3 className="font-bold">특별 알림</h3>
    <p>간단하게 사용하기</p>
  </>
);

// 로딩 상태 업데이트
const loadingId = toast.loading('처리 중...');
// 나중에 업데이트
toast.dismiss(loadingId);
toast.success('완료!');
*/