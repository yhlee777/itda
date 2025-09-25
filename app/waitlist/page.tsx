'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function WaitlistPage() {
  const [step, setStep] = useState(1);
  const [showFollowersDropdown, setShowFollowersDropdown] = useState(false);
  const [formData, setFormData] = useState({
    instagram: '',
    email: '',
    followers: '',
    category: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waitingNumber, setWaitingNumber] = useState(0);

  const followerOptions = [
    { value: '1k-5k', label: '1천 - 5천' },
    { value: '5k-10k', label: '5천 - 1만' },
    { value: '10k-50k', label: '1만 - 5만' },
    { value: '50k-100k', label: '5만 - 10만' },
    { value: '100k+', label: '10만 이상' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // localStorage에서 기존 데이터 가져오기
    const existingData = JSON.parse(localStorage.getItem('waitlistData') || '[]');
    
    // 대기번호 생성
    const waitNum = existingData.length + 300;
    
    // 새 데이터 추가
    const newEntry = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      waitingNumber: waitNum
    };
    
    // localStorage에 저장
    const updatedData = [...existingData, newEntry];
    localStorage.setItem('waitlistData', JSON.stringify(updatedData));
    
    // 대기번호 저장
    setWaitingNumber(waitNum);
    
    // API 호출 (optional - 나중에 백엔드 연동시)
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
    } catch (error) {
      console.log('API not available, saved to localStorage only');
    }
    
    // 성공 화면으로
    setIsSubmitted(true);
  };

  // 완료 화면
  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-4xl">✓</span>
          </motion.div>
          <h1 className="text-3xl text-white mb-4 font-bold">
            대기리스트 등록 완료!
          </h1>
          <p className="text-white/60 mb-2">
            현재 대기 순번: <span className="text-purple-400 font-bold text-2xl">#{waitingNumber}</span>
          </p>
          <p className="text-white/40 text-sm mb-8">
            11월 15일 오픈 시 바로 알려드릴게요
          </p>
          
          {/* 관심 표시한 캠페인 수 표시 */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 mb-6 max-w-sm mx-auto">
            <p className="text-purple-400 text-lg font-medium">
              {formData.category} 카테고리의 캠페인이 준비되어 있어요!
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Link href="/demo">
              <button className="text-purple-400 underline">
                다시 체험해보기
              </button>
            </Link>
            <Link href="/">
              <button className="text-white/60 underline">
                메인으로
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 폼 화면
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-8">
      <div className="w-full max-w-md">
        {/* 뒤로가기 */}
        <Link href="/demo">
          <button className="text-white/40 hover:text-white mb-8 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로
          </button>
        </Link>

        {/* 진행률 */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/40 mb-2">
            <span>거의 다 왔어요!</span>
            <span>{step}/3</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: 인스타그램 */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl text-white mb-2 font-medium">
                인스타그램 계정을 알려주세요
              </h2>
              <p className="text-white/60 mb-6">
                팔로워 확인용으로만 사용해요
              </p>
              
              {/* 인스타그램 아이디 입력 */}
              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  @
                </div>
                <input
                  type="text"
                  placeholder="instagram_id"
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value.replace('@', '')})}
                  className="w-full pl-8 pr-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 outline-none focus:bg-white/20 focus:border focus:border-purple-500/50 transition"
                  required
                />
              </div>
              
              {/* Custom Dropdown */}
              <div className="relative mb-6">
                <button
                  type="button"
                  onClick={() => setShowFollowersDropdown(!showFollowersDropdown)}
                  className={`w-full px-4 py-3 bg-white/10 rounded-lg text-left outline-none transition flex justify-between items-center ${
                    showFollowersDropdown ? 'bg-white/20 border border-purple-500/50' : ''
                  } ${formData.followers ? 'text-white' : 'text-white/40'}`}
                >
                  <span>
                    {formData.followers 
                      ? followerOptions.find(opt => opt.value === formData.followers)?.label 
                      : '팔로워 수 선택'}
                  </span>
                  <motion.svg 
                    animate={{ rotate: showFollowersDropdown ? 180 : 0 }}
                    className="w-5 h-5 text-white/60" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                
                {/* Custom Dropdown - 스타일 개선 */}
<AnimatePresence>
  {showFollowersDropdown && (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 w-full mt-2 bg-black border border-purple-500/50 rounded-lg overflow-hidden shadow-2xl shadow-purple-500/20"
      // bg-gray-900을 bg-black으로, border 색상 추가
    >
      {followerOptions.map((option, index) => (
        <motion.button
          key={option.value}
          type="button"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => {
            setFormData({...formData, followers: option.value});
            setShowFollowersDropdown(false);
          }}
          className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between group ${
            formData.followers === option.value 
              ? 'bg-purple-600 text-white' // 선택된 항목 더 선명하게
              : 'text-white bg-white/5 hover:bg-purple-600/30 hover:text-white'
              // 기본 항목도 배경색 추가
          }`}
        >
          <span className="font-medium">{option.label}</span> {/* font-medium 추가 */}
          {formData.followers === option.value && (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </motion.button>
      ))}
    </motion.div>
  )}
</AnimatePresence>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.instagram || !formData.followers}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-600/25 transition font-medium"
              >
                다음
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: 카테고리 */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl text-white mb-2 font-medium">
                주요 콘텐츠 카테고리는?
              </h2>
              <p className="text-white/60 mb-6">
                맞춤 캠페인을 추천해드려요
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['패션', '뷰티', '음식', '여행', '일상', '운동', '테크', '기타'].map((cat, index) => (
                  <motion.button
                    key={cat}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`py-3 rounded-lg border transition-all ${
                      formData.category === cat
                        ? 'border-purple-500 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white shadow-lg shadow-purple-600/25'
                        : 'border-white/20 text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-white/20 rounded-lg text-white/60 hover:bg-white/5 transition"
                >
                  이전
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.category}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-600/25 transition font-medium"
                >
                  다음
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: 이메일 */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl text-white mb-2 font-medium">
                마지막으로 이메일만!
              </h2>
              <p className="text-white/60 mb-6">
                오픈 알림을 보내드릴게요
              </p>
              
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-white/40 outline-none focus:bg-white/20 focus:border focus:border-purple-500/50 transition mb-6"
                required
              />
              
              {/* 혜택 안내 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/30 rounded-lg p-4 mb-6"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="text-green-400 font-medium mb-1">
                      선착순 100명 특별 혜택
                    </p>
                    <p className="text-green-400/80 text-sm">
                      평생 수수료 0% + 우선 매칭권
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-white/20 rounded-lg text-white/60 hover:bg-white/5 transition"
                >
                  이전
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-600/25 transition font-medium"
                >
                  완료
                </motion.button>
              </div>
            </motion.div>
          )}
        </form>

        {/* 신뢰도 높이기 */}
        <div className="mt-8 text-center">
          <p className="text-white/30 text-xs">
            {step === 1 && "🔒 인스타그램 정보는 안전하게 보호됩니다"}
            {step === 2 && "📊 카테고리별 맞춤 캠페인을 준비중이에요"}
            {step === 3 && "📧 스팸 메일은 보내지 않습니다"}
          </p>
        </div>
      </div>
    </main>
  );
}