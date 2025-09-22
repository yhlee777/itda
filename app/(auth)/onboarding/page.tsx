// app/(auth)/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // ✅ 올바른 import
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Building2, Camera, ArrowRight, ArrowLeft,
  Loader2, CheckCircle, AlertCircle, Sparkles,
  TrendingUp, Target, Users, Award, Zap, Shield,
  Instagram, Youtube, ChevronDown, Hash
} from 'lucide-react';

type UserType = 'influencer' | 'advertiser' | null;
type Step = 'select' | 'details' | 'processing' | 'complete';

const CATEGORIES = [
  { id: 'fashion', label: '패션', icon: '👗', color: 'bg-pink-100 text-pink-700' },
  { id: 'beauty', label: '뷰티', icon: '💄', color: 'bg-purple-100 text-purple-700' },
  { id: 'food', label: '푸드', icon: '🍔', color: 'bg-orange-100 text-orange-700' },
  { id: 'travel', label: '여행', icon: '✈️', color: 'bg-blue-100 text-blue-700' },
  { id: 'tech', label: '테크', icon: '💻', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'fitness', label: '피트니스', icon: '💪', color: 'bg-green-100 text-green-700' },
  { id: 'gaming', label: '게이밍', icon: '🎮', color: 'bg-red-100 text-red-700' },
  { id: 'lifestyle', label: '라이프스타일', icon: '🌟', color: 'bg-yellow-100 text-yellow-700' },
];

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'tiktok', label: 'TikTok', icon: Hash },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  
  // 공통 필드
  const [phone, setPhone] = useState('');
  
  // 광고주 필드
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [marketingBudget, setMarketingBudget] = useState('');
  
  // 인플루언서 필드
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [mainPlatform, setMainPlatform] = useState('instagram');
  const [followers, setFollowers] = useState('');
  const [engagementRate, setEngagementRate] = useState('');

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || '');

      // 이미 설정된 user_type 확인
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (userData?.user_type) {
        // 이미 온보딩 완료
        if (userData.user_type === 'advertiser') {
          router.push('/dashboard');
        } else {
          router.push('/campaigns');
        }
        return;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Status check error:', error);
      setIsLoading(false);
    }
  };

  const handleUserTypeSelect = (type: 'influencer' | 'advertiser') => {
    setUserType(type);
    setStep('details');
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (!userType || !userId) return;

    setIsSaving(true);
    setStep('processing');

    try {
      // 1. users 테이블 업데이트
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          user_type: userType,
          phone: phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (userError) throw userError;

      if (userType === 'advertiser') {
        // 2. advertisers 테이블 생성
        const { error: advertiserError } = await supabase
          .from('advertisers')
          .insert({
            id: userId,
            company_name: companyName,
            business_registration: businessNumber,
            contact_name: contactName,
            contact_position: contactPosition,
            contact_phone: phone,
            website: website || null,
            industry: industry || null,
            marketing_budget: marketingBudget || null,
            is_verified: false // 관리자 승인 대기
          });

        if (advertiserError) throw advertiserError;

        setStep('complete');
        toast.success('광고주 등록이 완료되었습니다. 승인을 기다려주세요.');
        
        setTimeout(() => {
          router.push('/pending-approval');
        }, 2000);
        
      } else {
        // 3. influencers 테이블 생성
        const { error: influencerError } = await supabase
          .from('influencers')
          .insert({
            id: userId,
            name: name,
            username: username,
            bio: bio || null,
            categories: categories,
            main_platform: mainPlatform,
            followers_count: parseInt(followers) || 0,
            engagement_rate: parseFloat(engagementRate) || 0,
            instagram_handle: mainPlatform === 'instagram' ? username : null,
            youtube_channel: mainPlatform === 'youtube' ? username : null,
            tiktok_handle: mainPlatform === 'tiktok' ? username : null,
            is_verified: false
          });

        if (influencerError) throw influencerError;

        setStep('complete');
        toast.success('프로필이 생성되었습니다!');
        
        setTimeout(() => {
          router.push('/campaigns');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || '프로필 생성 중 오류가 발생했습니다');
      setStep('details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={40} className="text-purple-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* 진행 상태 바 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-purple-600" size={24} />
              <span className="font-bold text-xl">ITDA</span>
            </div>
            <div className="flex items-center gap-1">
              {['select', 'details', 'processing', 'complete'].map((s, idx) => (
                <div key={s} className="flex items-center">
                  <div className={`
                    w-2 h-2 rounded-full transition-all
                    ${step === s ? 'w-8 bg-purple-600' : 
                      idx < ['select', 'details', 'processing', 'complete'].indexOf(step) 
                        ? 'bg-purple-600' : 'bg-gray-300'}
                  `} />
                  {idx < 3 && <div className="w-12 h-0.5 bg-gray-300 ml-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: 유저 타입 선택 */}
          {step === 'select' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  어떤 목적으로 ITDA를 사용하시나요?
                </h1>
                <p className="text-lg text-gray-600">
                  선택에 따라 최적화된 경험을 제공해드립니다
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 인플루언서 카드 */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUserTypeSelect('influencer')}
                  className="bg-gradient-to-br from-purple-500 to-pink-500 p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow"
                >
                  <div className="bg-white rounded-2xl p-8 h-full">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                        <Camera className="text-purple-600" size={40} />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      인플루언서로 시작하기
                    </h2>
                    <div className="space-y-3 text-left mb-6">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="text-purple-500" size={20} />
                        <span className="text-gray-700">틴더처럼 스와이프로 캠페인 매칭</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Target className="text-purple-500" size={20} />
                        <span className="text-gray-700">AI가 추천하는 맞춤 캠페인</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="text-purple-500" size={20} />
                        <span className="text-gray-700">실시간 단가 예측 및 협상</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold">
                      <span>시작하기</span>
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </motion.button>

                {/* 광고주 카드 */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUserTypeSelect('advertiser')}
                  className="bg-gradient-to-br from-blue-500 to-indigo-500 p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow"
                >
                  <div className="bg-white rounded-2xl p-8 h-full">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                        <Building2 className="text-blue-600" size={40} />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      광고주로 시작하기
                    </h2>
                    <div className="space-y-3 text-left mb-6">
                      <div className="flex items-center gap-3">
                        <Zap className="text-blue-500" size={20} />
                        <span className="text-gray-700">우버처럼 실시간 인플루언서 매칭</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="text-blue-500" size={20} />
                        <span className="text-gray-700">30분마다 지원자 알림</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="text-blue-500" size={20} />
                        <span className="text-gray-700">AI 기반 성과 예측</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                      <span>시작하기</span>
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: 상세 정보 입력 */}
          {step === 'details' && userType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setStep('select')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>뒤로</span>
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  {userType === 'advertiser' ? '광고주 정보' : '인플루언서 프로필'}
                </h2>
                <div className="w-20" />
              </div>

              {userType === 'advertiser' ? (
                // 광고주 폼
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        회사명 *
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="(주)예시회사"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        사업자등록번호 *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessNumber}
                        onChange={(e) => setBusinessNumber(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="123-45-67890"
                        maxLength={12}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        담당자명 *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="홍길동"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        직책 *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPosition}
                        onChange={(e) => setContactPosition(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="마케팅팀 팀장"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        연락처
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="010-0000-0000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        웹사이트
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        업종
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      >
                        <option value="">선택하세요</option>
                        <option value="fashion">패션/의류</option>
                        <option value="beauty">뷰티/화장품</option>
                        <option value="food">식품/음료</option>
                        <option value="tech">IT/테크</option>
                        <option value="travel">여행/숙박</option>
                        <option value="education">교육</option>
                        <option value="finance">금융/보험</option>
                        <option value="other">기타</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        월 마케팅 예산
                      </label>
                      <select
                        value={marketingBudget}
                        onChange={(e) => setMarketingBudget(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      >
                        <option value="">선택하세요</option>
                        <option value="under_100">100만원 미만</option>
                        <option value="100_500">100-500만원</option>
                        <option value="500_1000">500-1000만원</option>
                        <option value="1000_5000">1000-5000만원</option>
                        <option value="over_5000">5000만원 이상</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-yellow-800">승인 절차 안내</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          광고주 등록 후 영업일 기준 1-2일 내 승인이 완료됩니다.
                          승인 완료 시 이메일로 안내드립니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 인플루언서 폼
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        활동명 *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="활동명을 입력하세요"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        사용자명 *
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      자기소개
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      rows={3}
                      placeholder="간단한 자기소개를 작성해주세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      활동 카테고리 (최대 3개) *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {CATEGORIES.map(category => (
                        <motion.button
                          key={category.id}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleCategory(category.id)}
                          disabled={categories.length >= 3 && !categories.includes(category.id)}
                          className={`
                            p-3 rounded-xl border-2 transition-all flex items-center gap-2
                            ${categories.includes(category.id)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                            ${categories.length >= 3 && !categories.includes(category.id)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                            }
                          `}
                        >
                          <span className="text-xl">{category.icon}</span>
                          <span className="text-sm font-medium">{category.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      주 활동 플랫폼 *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {PLATFORMS.map(platform => (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => setMainPlatform(platform.id)}
                          className={`
                            p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                            ${mainPlatform === platform.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <platform.icon size={24} />
                          <span className="text-sm font-medium">{platform.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        팔로워 수
                      </label>
                      <input
                        type="number"
                        value={followers}
                        onChange={(e) => setFollowers(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="10000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        평균 참여율 (%)
                      </label>
                      <input
                        type="number"
                        value={engagementRate}
                        onChange={(e) => setEngagementRate(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="3.5"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="text-purple-600 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-purple-800">AI 매칭 시작</p>
                        <p className="text-sm text-purple-700 mt-1">
                          프로필 생성 후 바로 캠페인 매칭이 시작됩니다.
                          스와이프로 관심있는 캠페인을 선택하세요!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving || !companyName && !name}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>처리 중...</span>
                    </>
                  ) : (
                    <>
                      <span>완료</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: 처리 중 */}
          {step === 'processing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-8"
              >
                <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                프로필을 생성하고 있습니다
              </h2>
              <p className="text-gray-600">잠시만 기다려주세요...</p>
            </motion.div>
          )}

          {/* Step 4: 완료 */}
          {step === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="mb-8"
              >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {userType === 'advertiser' ? '광고주 등록 완료!' : '프로필 생성 완료!'}
              </h2>
              <p className="text-gray-600">
                {userType === 'advertiser' 
                  ? '승인 대기 페이지로 이동합니다...'
                  : '캠페인 매칭 페이지로 이동합니다...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}