'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    categories: [] as string[],
    followers: '',
    engagement: '',
  });

  const categories = [
    '패션', '뷰티', '푸드', '여행', '라이프스타일',
    '테크', '피트니스', '게임', '음악', '아트'
  ];

  const handleComplete = () => {
    // 프로필 저장 후 메인 페이지로
    console.log('Profile:', profileData);
    router.push('/campaigns');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-6">
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* 진행 표시 */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-1/3 h-2 rounded-full mx-1 ${
                  num <= step ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">프로필 설정</h2>
                <p className="text-gray-600">기본 정보를 입력해주세요</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인스타그램 아이디
                </label>
                <input
                  type="text"
                  placeholder="@username"
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  소개
                </label>
                <textarea
                  placeholder="간단한 자기소개를 작성해주세요"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                />
              </div>
              
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                다음
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">관심 카테고리</h2>
                <p className="text-gray-600">최대 3개까지 선택하세요</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      const newCategories = profileData.categories.includes(category)
                        ? profileData.categories.filter(c => c !== category)
                        : [...profileData.categories, category].slice(0, 3);
                      setProfileData({...profileData, categories: newCategories});
                    }}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      profileData.categories.includes(category)
                        ? 'border-purple-600 bg-purple-100 text-purple-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={profileData.categories.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">채널 정보</h2>
                <p className="text-gray-600">정확한 매칭을 위해 필요해요</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팔로워 수
                </label>
                <select
                  value={profileData.followers}
                  onChange={(e) => setProfileData({...profileData, followers: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">선택하세요</option>
                  <option value="0-1k">0 - 1천</option>
                  <option value="1k-10k">1천 - 1만</option>
                  <option value="10k-50k">1만 - 5만</option>
                  <option value="50k-100k">5만 - 10만</option>
                  <option value="100k+">10만+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  평균 참여율
                </label>
                <select
                  value={profileData.engagement}
                  onChange={(e) => setProfileData({...profileData, engagement: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">선택하세요</option>
                  <option value="0-1">0% - 1%</option>
                  <option value="1-3">1% - 3%</option>
                  <option value="3-5">3% - 5%</option>
                  <option value="5-10">5% - 10%</option>
                  <option value="10+">10% 이상</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  시작하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}