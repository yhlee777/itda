'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'influencer' | 'advertiser' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 임시 회원가입 처리
    console.log('Signup:', { userType, ...formData });
    
    // 온보딩으로 이동
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>
        
        {!userType ? (
          /* 사용자 타입 선택 */
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              어떤 서비스를 이용하시겠어요?
            </p>
            
            <button
              onClick={() => setUserType('influencer')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-all group"
            >
              <div className="text-3xl mb-2">🌟</div>
              <h3 className="font-bold text-lg mb-1">인플루언서</h3>
              <p className="text-sm text-gray-600">
                브랜드 캠페인에 참여하고 수익을 창출하세요
              </p>
            </button>
            
            <button
              onClick={() => setUserType('advertiser')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-all group"
            >
              <div className="text-3xl mb-2">🏢</div>
              <h3 className="font-bold text-lg mb-1">광고주/브랜드</h3>
              <p className="text-sm text-gray-600">
                인플루언서와 함께 효과적인 마케팅을 진행하세요
              </p>
            </button>
          </div>
        ) : (
          /* 회원가입 폼 */
          <form onSubmit={handleSignup} className="space-y-4">
            <button
              type="button"
              onClick={() => setUserType(null)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              ← 뒤로가기
            </button>
            
            <div>
              <input
                type="text"
                placeholder="이름"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <input
                type="email"
                placeholder="이메일"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <input
                type="tel"
                placeholder="전화번호"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {userType === 'advertiser' && (
              <div>
                <input
                  type="text"
                  placeholder="회사명"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              가입하기
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              가입하면 ITDA의{' '}
              <a href="#" className="text-purple-600 hover:underline">이용약관</a> 및{' '}
              <a href="#" className="text-purple-600 hover:underline">개인정보처리방침</a>에
              동의하게 됩니다.
            </p>
          </form>
        )}
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-purple-600 hover:underline font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}