'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // 임시 리다이렉트 (Supabase 연결 전)
    router.push('/(auth)/login');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-3xl font-bold">ITDA</h1>
        <p className="mt-2">로딩중...</p>
      </div>
    </div>
  );
}
