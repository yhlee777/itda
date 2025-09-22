// components/ui/CountdownTimer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetTime: Date;
  onComplete?: () => void;
  className?: string;
}

export default function CountdownTimer({ 
  targetTime, 
  onComplete, 
  className = '' 
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining('만료됨');
        onComplete?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}일 ${hours}시간`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}시간 ${minutes}분`);
      } else {
        setTimeRemaining(`${minutes}분 ${seconds}초`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete, isClient]);

  // 서버 렌더링 시 기본값 표시
  if (!isClient) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Clock className="w-4 h-4" />
        <span>로딩중...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Clock className="w-4 h-4" />
      <span>{timeRemaining}</span>
    </div>
  );
}