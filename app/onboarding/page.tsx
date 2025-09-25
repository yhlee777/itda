'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'influencer' | 'brand'>('influencer');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // 인플루언서 필드
    instagram: '',
    followers: '',
    category: '',
    rate: '',
    // 브랜드 필드
    companyName: '',
    industry: '',
    budget: '',
    targetAudience: ''
  });

  useEffect(() => {
    const type = localStorage.getItem('userType') as 'influencer' | 'brand';
    if (type) setUserType(type);
  }, []);

  const totalSteps = userType === 'influencer' ? 3 : 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // 온보딩 완료
      router.push('/campaigns');
    }
  };

  const handleSkip = () => {
    router.push('/campaigns');
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-8">
      <div className="w-full max-w-md">
        {/* 진행률 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-sm">프로필 설정</h2>
            <button 
              onClick={handleSkip}
              className="text-white/40 text-sm hover:text-white transition"
            >
              건너뛰기
            </button>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* 인플루언서 온보딩 */}
        {userType === 'influencer' && (
          <>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl text-white mb-2">SNS 계정</h3>
                <p className="text-white/60 mb-6">어떤 채널로 활동하시나요?</p>
                
                <input
                  type="text"
                  placeholder="@instagram_id"
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 outline-none focus:bg-white/20 transition mb-4"
                />
                
                <input
                  type="text"
                  placeholder="팔로워 수 (예: 10,000)"
                  value={formData.followers}
                  onChange={(e) => setFormData({...formData, followers: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 outline-none focus:bg-white/20 transition"
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-2xl text-white mb-2">카테고리</h3>
                <p className="text-white/60 mb-6">주로 어떤 콘텐츠를 만드시나요?</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {['패션', '뷰티', '음식', '여행', '일상', '운동'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFormData({...formData, category: cat})}
                      className={`py-3 rounded-lg border transition ${
                        formData.category === cat 
                          ? 'border-purple-500 bg-purple-500/20 text-white' 
                          : 'border-white/20 text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-2xl text-white mb-2">광고 단가</h3>
                <p className="text-white/60 mb-6">포스팅 1건당 희망 단가는?</p>
                
                <input
                  type="text"
                  placeholder="예: 500,000원"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 outline-none focus:bg-white/20 transition"
                />
                
                <p className="text-white/40 text-sm mt-4">
                  나중에 언제든 수정할 수 있어요
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* 브랜드 온보딩 */}
        {userType === 'brand' && (
          <>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-2xl text-white mb-2">회사 정보</h3>
                <p className="text-white/60 mb-6">어떤 브랜드인가요?</p>
                
                <input
                  type="text"
                  placeholder="회사명"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 outline-none focus:bg-white/20 transition mb-4"
                />
                
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 rounded-lg text-white outline-none focus:bg-white/20 transition"
                >
                  <option value="">업종 선택</option>
                  <option value="fashion">패션</option>
                  <option value="beauty">뷰티</option>
                  <option value="food">식품</option>
                  <option value="tech">IT/테크</option>
                </select>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-2xl text-white mb-2">예산 범위</h3>
                <p className="text-white/60 mb-6">캠페인 예산은 어느 정도인가요?</p>
                
                <div className="space-y-3">
                  {['100만원 이하', '100-500만원', '500-1000만원', '1000만원 이상'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setFormData({...formData, budget: range})}
                      className={`w-full py-3 rounded-lg border transition ${
                        formData.budget === range 
                          ? 'border-purple-500 bg-purple-500/20 text-white' 
                          : 'border-white/20 text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-2xl text-white mb-2">타겟 고객</h3>
                <p className="text-white/60 mb-6">어떤 고객층을 원하시나요?</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {['10대', '20대', '30대', '40대+', '남성', '여성'].map((target) => (
                    <button
                      key={target}
                      onClick={() => setFormData({...formData, targetAudience: target})}
                      className={`py-3 rounded-lg border transition ${
                        formData.targetAudience === target 
                          ? 'border-purple-500 bg-purple-500/20 text-white' 
                          : 'border-white/20 text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {target}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* 버튼 */}
        <div className="mt-8 flex gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 border border-white/20 rounded-lg text-white/60 hover:bg-white/5 transition"
            >
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-600/25 transition-all"
          >
            {step === totalSteps ? '시작하기' : '다음'}
          </button>
        </div>
      </div>
    </main>
  );
}