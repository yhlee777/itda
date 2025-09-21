import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Crown, Gift, TrendingUp } from 'lucide-react';

interface SwipeLimits {
  remaining: number;
  total: number;
  nextRefresh: Date;
  tier: 'free' | 'premium' | 'vip';
  bonusSwipes: number;
}

export function SwipeLimitSystem({ userId }: { userId: string }) {
  const [limits, setLimits] = useState<SwipeLimits>({
    remaining: 10,
    total: 10,
    nextRefresh: new Date(Date.now() + 3600000),
    tier: 'free',
    bonusSwipes: 0
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const getTimeUntilRefresh = () => {
    const diff = limits.nextRefresh.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}시간 ${minutes}분`;
  };

  const tierBenefits = {
    free: { swipes: 10, refreshHours: 24, price: 0 },
    premium: { swipes: 50, refreshHours: 12, price: 9900 },
    vip: { swipes: -1, refreshHours: 0, price: 29900 } // 무제한
  };

  return (
    <>
      {/* 스와이프 제한 표시 */}
      <div className="fixed top-20 right-4 z-30">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-3 min-w-[200px]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">남은 스와이프</span>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-600">
                {limits.tier === 'vip' ? '∞' : limits.remaining}
              </span>
              {limits.tier !== 'vip' && (
                <span className="text-sm text-gray-500">/ {limits.total}</span>
              )}
            </div>
            
            {limits.bonusSwipes > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Gift className="w-3 h-3" />
                <span>+{limits.bonusSwipes} 보너스</span>
              </div>
            )}
          </div>

          {limits.tier !== 'vip' && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(limits.remaining / limits.total) * 100}%` }}
                />
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{getTimeUntilRefresh()} 후 충전</span>
              </div>
            </>
          )}

          {limits.tier === 'vip' && (
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Crown className="w-3 h-3" />
              <span>VIP 무제한</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* 업그레이드 모달 */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">더 많은 매칭 기회를 잡으세요!</h3>
              
              <div className="space-y-3">
                {/* Free 플랜 */}
                <div className={`border rounded-lg p-4 ${
                  limits.tier === 'free' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Free</h4>
                    {limits.tier === 'free' && (
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">현재 플랜</span>
                    )}
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 하루 10번 스와이프</li>
                    <li>• 24시간마다 충전</li>
                    <li>• 기본 매칭 알고리즘</li>
                  </ul>
                  <div className="mt-3 text-lg font-bold">무료</div>
                </div>

                {/* Premium 플랜 */}
                <div className={`border rounded-lg p-4 ${
                  limits.tier === 'premium' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-1">
                      Premium
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </h4>
                    {limits.tier === 'premium' && (
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">현재 플랜</span>
                    )}
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 하루 50번 스와이프</li>
                    <li>• 12시간마다 충전</li>
                    <li>• AI 추천 우선 노출</li>
                    <li>• 매칭률 2배 부스트</li>
                  </ul>
                  <div className="mt-3">
                    <span className="text-lg font-bold">월 9,900원</span>
                    <span className="text-sm text-gray-500 ml-1">연 99,000원</span>
                  </div>
                  {limits.tier !== 'premium' && (
                    <button className="w-full mt-2 py-2 bg-purple-600 text-white rounded-lg">
                      업그레이드
                    </button>
                  )}
                </div>

                {/* VIP 플랜 */}
                <div className={`border rounded-lg p-4 relative overflow-hidden ${
                  limits.tier === 'vip' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                }`}>
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-400 text-white text-xs px-3 py-1 rounded-bl-lg">
                    BEST
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-1">
                      VIP
                      <Crown className="w-4 h-4 text-yellow-600" />
                    </h4>
                    {limits.tier === 'vip' && (
                      <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">현재 플랜</span>
                    )}
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <strong>무제한</strong> 스와이프</li>
                    <li>• 즉시 충전 불필요</li>
                    <li>• VIP 전용 캠페인</li>
                    <li>• 1:1 매칭 매니저</li>
                    <li>• 슈퍼라이크 무제한</li>
                  </ul>
                  <div className="mt-3">
                    <span className="text-lg font-bold">월 29,900원</span>
                    <span className="text-sm text-gray-500 ml-1">연 299,000원</span>
                  </div>
                  {limits.tier !== 'vip' && (
                    <button className="w-full mt-2 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold">
                      VIP 되기
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}