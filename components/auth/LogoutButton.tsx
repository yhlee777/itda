// components/auth/LogoutButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AUTH_FLOW } from '@/lib/auth/config';

interface LogoutButtonProps {
  variant?: 'default' | 'icon' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
  onLogout?: () => void;
}

export function LogoutButton({ 
  variant = 'default',
  size = 'md',
  showIcon = true,
  showText = true,
  className = '',
  onLogout,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    if (isLoading) return;

    // 확인 다이얼로그 (text variant는 제외)
    if (variant !== 'text') {
      const confirmed = window.confirm('정말 로그아웃 하시겠습니까?');
      if (!confirmed) return;
    }

    setIsLoading(true);

    try {
      // Supabase 로그아웃
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // 스토리지 정리
      localStorage.clear();
      sessionStorage.clear();

      // 콜백 실행
      if (onLogout) {
        onLogout();
      }

      // 성공 알림
      toast.success('로그아웃되었습니다');

      // 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push(AUTH_FLOW.AFTER_LOGOUT);
      }, 500);

    } catch (error) {
      console.error('Logout error:', error);
      toast.error('로그아웃 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 스타일 결정
  const getButtonStyle = () => {
    const baseStyles = 'transition-all flex items-center justify-center gap-2';
    
    const sizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };
    
    const variantStyles = {
      default: 'px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg',
      icon: 'p-2 hover:bg-gray-100 rounded-full',
      text: 'text-gray-600 hover:text-gray-900',
      danger: 'px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium',
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };

  // 아이콘 크기
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'md': return 20;
      case 'lg': return 24;
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={getButtonStyle()}
      aria-label="로그아웃"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" size={getIconSize()} />
          {showText && <span>로그아웃 중...</span>}
        </>
      ) : (
        <>
          {showIcon && <LogOut size={getIconSize()} />}
          {showText && <span>로그아웃</span>}
        </>
      )}
    </button>
  );
}

// 사용 예시:
// <LogoutButton />  // 기본
// <LogoutButton variant="icon" showText={false} />  // 아이콘만
// <LogoutButton variant="text" showIcon={false} />  // 텍스트만
// <LogoutButton variant="danger" size="lg" />  // 위험 스타일 큰 사이즈