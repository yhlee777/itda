'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onComplete: () => void;
}

export default function OnboardingTutorial({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      emoji: "👋",
      title: "환영합니다!",
      description: "itda는 스와이프로 캠페인을 선택하는\n인플루언서 마켓플레이스입니다"
    },
    {
      emoji: "💚❌",
      title: "스와이프로 선택하세요",
      description: "관심 있는 캠페인은 오른쪽으로\n관심 없으면 왼쪽으로 스와이프!",
      demo: true
    },
    {
      emoji: "🎯",
      title: "매칭이 되면",
      description: "브랜드도 당신을 선택하면\n캠페인 진행이 가능합니다!"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-purple-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full"
        >
          <button
            onClick={onComplete}
            className="text-white/40 text-sm hover:text-white/60 transition-colors"
          >
            건너뛰기
          </button>

          <div className="flex justify-center gap-2 mt-4 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-purple-500'
                    : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            {steps[currentStep].demo ? (
              <div className="h-40 relative mb-8">
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-32 bg-white rounded-2xl shadow-2xl flex items-center justify-center"
                  animate={{
                    x: [-50, 50, -50],
                    rotate: [-10, 10, -10],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-3xl">📱</span>
                </motion.div>
                
                <motion.div
                  className="absolute left-8 top-1/2 -translate-y-1/2"
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8] 
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    times: [0, 0.3, 1]
                  }}
                >
                  <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">✕</span>
                  </div>
                </motion.div>
                
                <motion.div
                  className="absolute right-8 top-1/2 -translate-y-1/2"
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    times: [0.5, 0.8, 1],
                    delay: 1.5
                  }}
                >
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">💚</span>
                  </div>
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-12">
                  <span className="text-white/40 text-sm">← 패스</span>
                  <span className="text-white/40 text-sm">관심 →</span>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-7xl mb-8"
              >
                {steps[currentStep].emoji}
              </motion.div>
            )}

            <h2 className="text-2xl font-bold text-white mb-4">
              {steps[currentStep].title}
            </h2>
            <p className="text-white/70 whitespace-pre-line text-sm">
              {steps[currentStep].description}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium text-lg"
          >
            {currentStep === steps.length - 1 ? '시작하기' : '다음'}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}