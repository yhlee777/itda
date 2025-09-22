// components/auth/LogoutButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LogoutButtonProps {
  variant?: 'default' | 'compact' | 'danger';
  showIcon?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export function LogoutButton({ 
  variant = 'default', 
  showIcon = true,
  className = '',
  onSuccess
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    if (isLoading) return;

    // 확인 다이얼로그
    const confirmed = window.confirm('정말 로그아웃 하시겠습니까?');
    if (!confirmed) return;

    setIsLoading(true);

    try {
      // Supabase 로그아웃
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // 로컬 스토리지 정리
      localStorage.removeItem('swipeTutorial');
      localStorage.removeItem('notificationSound');
      localStorage.removeItem('userPreferences');
      
      // 세션 스토리지 정리
      sessionStorage.clear();

      // 성공 알림
      toast.success('로그아웃 되었습니다');

      // 콜백 실행
      if (onSuccess) {
        onSuccess();
      }

      // 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/login');
      }, 500);

    } catch (error) {
      console.error('Logout error:', error);
      toast.error('로그아웃 중 오류가 발생했습니다');
      setIsLoading(false);
    }
  };

  // 버튼 스타일 결정
  const getButtonStyle = () => {
    switch (variant) {
      case 'compact':
        return 'flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-gray-50 transition-colors';
      case 'danger':
        return `w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors ${className}`;
      default:
        return `flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ${className}`;
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={getButtonStyle()}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>로그아웃 중...</span>
        </>
      ) : (
        <>
          {showIcon && <LogOut className="w-5 h-5" />}
          <span>로그아웃</span>
        </>
      )}
    </button>
  );
}

// 로그아웃 훅 (프로그래밍 방식으로 사용)
export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const logout = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // 스토리지 정리
      localStorage.clear();
      sessionStorage.clear();

      // 리다이렉트
      router.push('/login');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
}