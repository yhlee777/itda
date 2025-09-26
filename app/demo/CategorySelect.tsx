'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface CategorySelectProps {
  onSelectCategory: (category: string) => void;
}

export default function CategorySelect({ onSelectCategory }: CategorySelectProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = [
    { id: 'beauty', label: '뷰티', icon: '💄', count: 28 },
    { id: 'fashion', label: '패션', icon: '👗', count: 19 },
    { id: 'food', label: '푸드', icon: '🍽️', count: 23 },
    { id: 'lifestyle', label: '라이프', icon: '🏠', count: 15 },
    { id: 'tech', label: '테크', icon: '📱', count: 7 },
    { id: 'fitness', label: '운동', icon: '💪', count: 11 },
  ];

  const handleStart = () => {
    if (selectedCategory) {
      onSelectCategory(selectedCategory);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            어떤 분야의 인플루언서신가요?
          </h1>
          <p className="text-white/60">
            관심 카테고리를 선택하면 맞춤 캠페인을 보여드려요
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedCategory === cat.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <div className="text-white font-medium">{cat.label}</div>
              <div className="text-white/40 text-sm mt-1">
                {cat.count}개 캠페인
              </div>
            </motion.button>
          ))}
        </div>

        {selectedCategory && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg"
          >
            캠페인 보러 가기 →
          </motion.button>
        )}
      </div>
    </div>
  );
}