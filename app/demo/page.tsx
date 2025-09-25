'use client';

import dynamic from 'next/dynamic';

// 클라이언트에서만 렌더링
const DemoClient = dynamic(() => import('./DemoClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
});

export default function DemoPage() {
  return <DemoClient />;
}