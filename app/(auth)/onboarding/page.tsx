'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-6">
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">프로필 설정</h1>
            <p className="text-gray-600">당신에 대해 알려주세요</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="김인플루언서"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                인스타그램 아이디
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="@username"
              />
            </div>
            
            <button
              onClick={() => router.push('/(influencer)/campaigns')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg"
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
