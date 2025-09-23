// lib/utils/toast.tsx
'use client';

import React from 'react';
import { toast as hotToast, ToastOptions, Toast } from 'react-hot-toast';

// CustomToastOptions 인터페이스 - 사용하지 않으므로 제거 가능
interface CustomToastOptions extends Partial<ToastOptions> {
  title?: string;
  description?: string;
}

/**
 * 커스텀 toast 유틸리티
 * react-hot-toast를 확장하여 info, warning 등 추가 타입 지원
 */
export const toast = {
  // 기본 토스트
  show: (message: string, options?: ToastOptions) => {
    return hotToast(message, options);
  },

  // 성공
  success: (message: string, options?: ToastOptions) => {
    return hotToast.success(message, {
      duration: 3000,
      ...options,
    });
  },

  // 에러
  error: (message: string, options?: ToastOptions) => {
    return hotToast.error(message, {
      duration: 4000,
      ...options,
    });
  },

  // 정보
  info: (message: string, options?: ToastOptions) => {
    return hotToast(message, {
      icon: 'ℹ️',
      duration: 3000,
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
      ...options,
    });
  },

  // 경고
  warning: (message: string, options?: ToastOptions) => {
    return hotToast(message, {
      icon: '⚠️',
      duration: 3000,
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
      ...options,
    });
  },

  // 로딩
  loading: (message: string, options?: ToastOptions) => {
    return hotToast.loading(message, options);
  },

  // Promise 처리
  promise: <T,>(
    promise: Promise<T> | (() => Promise<T>),
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return hotToast.promise(promise, msgs, options);
  },

  // 커스텀 토스트 - Toast 타입 명시
  custom: (jsx: JSX.Element | ((t: Toast) => JSX.Element), options?: ToastOptions) => {
    return hotToast.custom(jsx, options);
  },

  // 알림 토스트 (제목 + 설명)
  notification: ({ title, description, type = 'info' }: {
    title: string;
    description?: string;
    type?: 'success' | 'error' | 'info' | 'warning';
  }) => {
    const icons: Record<string, string> = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };

    const colors: Record<string, { bg: string; text: string }> = {
      success: { bg: '#10B981', text: '#fff' },
      error: { bg: '#EF4444', text: '#fff' },
      info: { bg: '#3B82F6', text: '#fff' },
      warning: { bg: '#F59E0B', text: '#fff' }
    };

    return hotToast.custom((t: Toast) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        style={{ backgroundColor: colors[type].bg }}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">{icons[type]}</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium" style={{ color: colors[type].text }}>
                {title}
              </p>
              {description && (
                <p className="mt-1 text-sm opacity-90" style={{ color: colors[type].text }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-white/20">
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium hover:bg-white/10 focus:outline-none"
            style={{ color: colors[type].text }}
          >
            닫기
          </button>
        </div>
      </div>
    ), {
      duration: 4000,
    });
  },

  // 액션 토스트 (버튼 포함)
  action: ({
    message,
    actionLabel,
    onAction,
    type = 'info'
  }: {
    message: string;
    actionLabel: string;
    onAction: () => void;
    type?: 'success' | 'error' | 'info' | 'warning';
  }) => {
    const colors: Record<string, string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };

    return hotToast.custom((t: Toast) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full ${colors[type]} shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <p className="text-sm font-medium text-white">
            {message}
          </p>
        </div>
        <div className="flex">
          <button
            onClick={() => {
              onAction();
              hotToast.dismiss(t.id);
            }}
            className="w-full border-l border-white/20 rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
    });
  },

  // 토스트 닫기
  dismiss: (toastId?: string) => {
    if (toastId) {
      hotToast.dismiss(toastId);
    } else {
      hotToast.dismiss();
    }
  },

  // 모든 토스트 제거
  remove: (toastId?: string) => {
    if (toastId) {
      hotToast.remove(toastId);
    } else {
      // 모든 토스트 제거는 지원하지 않음
      hotToast.dismiss();
    }
  }
};

// 타입 내보내기
export type { ToastOptions };

// 기본 내보내기
export default toast;