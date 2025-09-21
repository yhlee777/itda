// app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';  // ✅ Link import 추가!
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  Mail, Lock, User, Building2, Camera, Phone,
  ArrowRight, ArrowLeft, Check, Globe, Briefcase,
  FileText, CreditCard, Instagram, Youtube, Users,
  TrendingUp, Loader2, Shield, Award, ChevronRight
} from 'lucide-react';

type UserType = 'influencer' | 'advertiser' | null;
type Step = 'select-type' | 'basic-info' | 'verification' | 'complete';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [step, setStep] = useState<Step>('select-type');

  // 공통 필드
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');

  // 광고주 전용 필드
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [marketingBudget, setMarketingBudget] = useState('');

  // 인플루언서 전용 필드
  const [influencerName, setInfluencerName] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [mainPlatform, setMainPlatform] = useState('');

  // 사업자등록번호 검증 (광고주)
  const validateBusinessNumber = async (bizNum: string) => {
    const cleaned = bizNum.replace(/-/g, '');
    if (cleaned.length !== 10) {
      toast.error('올바른 사업자등록번호를 입력하세요 (10자리)');
      return false;
    }
    return true;
  };

  // 인스타그램 계정 검증 (인플루언서)
  const verifyInstagram = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData = {
        followers: 52000,
        engagement_rate: 4.5,
        verified: true
      };

      toast.success(`인증 완료! 팔로워: ${mockData.followers.toLocaleString()}`);
      return mockData;
    } catch (error) {
      toast.error('인스타그램 계정 확인 실패');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 광고주 회원가입
  const handleAdvertiserSignup = async () => {
    try {
      setIsLoading(true);

      // 비밀번호 확인
      if (password !== passwordConfirm) {
        toast.error('비밀번호가 일치하지 않습니다');
        return;
      }

      // 사업자등록번호 검증
      const isValid = await validateBusinessNumber(businessNumber);
      if (!isValid) return;

      // Supabase Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'advertiser',
            company_name: companyName
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('회원가입 실패');

      // 사용자 기본 정보 저장
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          phone: phone || null,
          user_type: 'advertiser'
        } as any);

      if (userError) throw userError;

      // 광고주 프로필 생성
      const { error: profileError } = await supabase
        .from('advertisers')
        .insert({
          id: authData.user.id,
          company_name: companyName,
          business_registration: businessNumber,
          contact_name: contactName,
          contact_position: contactPosition,
          contact_phone: phone || null,
          website: website || null,
          industry: industry || null,
          marketing_budget: marketingBudget || null,
          is_verified: false
        } as any);

      if (profileError) throw profileError;

      toast.success('회원가입 완료! 관리자 승인 후 이용 가능합니다.');
      setStep('complete');
    } catch (error: any) {
      toast.error(error.message || '회원가입 실패');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 인플루언서 회원가입
  const handleInfluencerSignup = async () => {
    try {
      setIsLoading(true);

      // 비밀번호 확인
      if (password !== passwordConfirm) {
        toast.error('비밀번호가 일치하지 않습니다');
        return;
      }

      // 소셜미디어 계정 검증
      const instagramData = await verifyInstagram();
      if (!instagramData) return;

      // Supabase Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'influencer',
            name: influencerName
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('회원가입 실패');

      // 사용자 기본 정보 저장
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          phone: phone || null,
          user_type: 'influencer'
        } as any);

      if (userError) throw userError;

      // 인플루언서 프로필 생성
      const { error: profileError } = await supabase
        .from('influencers')
        .insert({
          id: authData.user.id,
          name: influencerName,
          username: instagramUsername || `@${influencerName.toLowerCase().replace(/\s+/g, '')}`,
          categories,
          followers_count: instagramData.followers,
          engagement_rate: instagramData.engagement_rate,
          is_verified: instagramData.verified,
          status: 'active',
          tier: instagramData.followers > 100000 ? 'gold' : 'standard',
          main_platform: mainPlatform,
          instagram_username: instagramUsername || null,
          youtube_channel: youtubeChannel || null
        } as any);

      if (profileError) throw profileError;

      toast.success('회원가입 완료! 바로 시작하세요.');
      setStep('complete');
    } catch (error: any) {
      toast.error(error.message || '회원가입 실패');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">ITDA</h1>
          <p className="text-gray-600">인플루언서와 브랜드를 잇다</p>
        </div>

        {/* 진행 상태 바 */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {['회원 유형', '기본 정보', '인증', '완료'].map((label, idx) => {
              const steps: Step[] = ['select-type', 'basic-info', 'verification', 'complete'];
              const isActive = steps.indexOf(step) >= idx;
              const isCompleted = steps.indexOf(step) > idx;
              
              return (
                <div key={idx} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isCompleted ? 'bg-green-500 text-white' : 
                      isActive ? 'bg-purple-600 text-white' : 
                      'bg-gray-200 text-gray-500'}
                  `}>
                    {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  {idx < 3 && (
                    <div className={`w-20 h-1 mx-2 transition-all ${
                      isCompleted ? 'bg-green-500' : 
                      isActive ? 'bg-purple-600' : 
                      'bg-gray-200'
                    }`} />
                  )}
                  <span className={`ml-2 text-sm font-medium hidden md:inline ${
                    isActive ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: 회원 유형 선택 */}
          {step === 'select-type' && (
            <motion.div
              key="select-type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-center mb-8">
                어떤 회원으로 가입하시나요?
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 인플루언서 선택 카드 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setUserType('influencer');
                    setStep('basic-info');
                  }}
                  className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all text-left group"
                >
                  <Camera className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">인플루언서</h3>
                  <p className="text-gray-600 mb-4">
                    브랜드와 협업하고 수익을 창출하세요
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      소셜미디어 계정 연동
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      즉시 활동 가능
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      AI 매칭 시스템
                    </li>
                  </ul>
                </motion.button>

                {/* 광고주 선택 카드 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setUserType('advertiser');
                    setStep('basic-info');
                  }}
                  className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all text-left group"
                >
                  <Building2 className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">광고주</h3>
                  <p className="text-gray-600 mb-4">
                    검증된 인플루언서와 협업하세요
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      사업자 인증
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      실시간 캠페인 관리
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      성과 분석 대시보드
                    </li>
                  </ul>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: 기본 정보 입력 */}
          {step === 'basic-info' && (
            <motion.div
              key="basic-info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6">
                {userType === 'advertiser' ? '회사 정보 입력' : '프로필 정보 입력'}
              </h2>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (password !== passwordConfirm) {
                  toast.error('비밀번호가 일치하지 않습니다');
                  return;
                }
                setStep('verification');
              }}>
                {/* 계정 정보 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-600" />
                    계정 정보
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        연락처 *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="010-1234-5678"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        비밀번호 *
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="8자 이상 입력"
                        minLength={8}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        비밀번호 확인 *
                      </label>
                      <input
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="비밀번호 재입력"
                        minLength={8}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 광고주 전용 정보 */}
                {userType === 'advertiser' && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        회사 정보
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            회사명 *
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="(주)회사명"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            사업자등록번호 *
                          </label>
                          <input
                            type="text"
                            value={businessNumber}
                            onChange={(e) => setBusinessNumber(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="123-45-67890"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            담당자명 *
                          </label>
                          <input
                            type="text"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="홍길동"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            직책 *
                          </label>
                          <input
                            type="text"
                            value={contactPosition}
                            onChange={(e) => setContactPosition(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="마케팅 팀장"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            회사 홈페이지
                          </label>
                          <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            업종 *
                          </label>
                          <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          >
                            <option value="">선택하세요</option>
                            <option value="fashion">패션/의류</option>
                            <option value="beauty">뷰티/화장품</option>
                            <option value="food">식품/음료</option>
                            <option value="tech">IT/테크</option>
                            <option value="lifestyle">라이프스타일</option>
                            <option value="sports">스포츠/피트니스</option>
                            <option value="education">교육</option>
                            <option value="finance">금융</option>
                            <option value="other">기타</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        월 마케팅 예산 (선택)
                      </label>
                      <select
                        value={marketingBudget}
                        onChange={(e) => setMarketingBudget(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">선택하세요</option>
                        <option value="under-10m">1천만원 미만</option>
                        <option value="10m-50m">1천만원 ~ 5천만원</option>
                        <option value="50m-100m">5천만원 ~ 1억원</option>
                        <option value="100m-500m">1억원 ~ 5억원</option>
                        <option value="over-500m">5억원 이상</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 인플루언서 전용 정보 */}
                {userType === 'influencer' && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-600" />
                        프로필 정보
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            활동명 *
                          </label>
                          <input
                            type="text"
                            value={influencerName}
                            onChange={(e) => setInfluencerName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="인플루언서 활동명"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        주요 활동 플랫폼 *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Instagram', 'YouTube', 'TikTok'].map(platform => (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => setMainPlatform(platform)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              mainPlatform === platform 
                                ? 'border-purple-600 bg-purple-50 text-purple-600' 
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {platform}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        활동 카테고리 (최대 3개) *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['패션', '뷰티', '푸드', '여행', '일상', '피트니스', '테크', '게임', '교육'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              if (categories.includes(cat)) {
                                setCategories(categories.filter(c => c !== cat));
                              } else if (categories.length < 3) {
                                setCategories([...categories, cat]);
                              } else {
                                toast.error('최대 3개까지 선택 가능합니다');
                              }
                            }}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              categories.includes(cat)
                                ? 'border-purple-600 bg-purple-50 text-purple-600' 
                                : 'border-gray-200 hover:border-purple-300'
                            } ${categories.length >= 3 && !categories.includes(cat)
                                ? 'opacity-50 cursor-not-allowed' 
                                : ''}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep('select-type')}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    이전
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: 인증 */}
          {step === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6">
                {userType === 'advertiser' ? '사업자 인증' : '소셜미디어 연동'}
              </h2>

              {userType === 'advertiser' ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <Shield className="text-blue-600 mt-1" size={24} />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">사업자 정보 확인</h3>
                        <p className="text-gray-600">
                          입력하신 사업자등록번호를 통해 회사 정보를 확인합니다.
                          관리자 승인까지 영업일 기준 1-2일이 소요됩니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold mb-4">입력하신 정보</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">회사명</span>
                        <p className="font-medium">{companyName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">사업자등록번호</span>
                        <p className="font-medium">{businessNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">담당자</span>
                        <p className="font-medium">{contactName} {contactPosition}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">업종</span>
                        <p className="font-medium">{industry}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">이메일</span>
                        <p className="font-medium">{email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">연락처</span>
                        <p className="font-medium">{phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                      <span>⚠️</span>
                      <span>승인 완료 시 이메일로 안내드립니다. 허위 정보 입력 시 가입이 거절될 수 있습니다.</span>
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep('basic-info')}
                      className="px-6 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      이전
                    </button>
                    <button
                      onClick={handleAdvertiserSignup}
                      disabled={isLoading}
                      className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          처리 중...
                        </>
                      ) : (
                        <>
                          가입 완료
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <Instagram className="text-purple-600 mt-1" size={24} />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">소셜미디어 계정 연동</h3>
                        <p className="text-gray-600">
                          팔로워 수와 참여율을 자동으로 확인하여 프로필을 생성합니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  {mainPlatform === 'Instagram' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        인스타그램 아이디 *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={instagramUsername}
                          onChange={(e) => setInstagramUsername(e.target.value)}
                          placeholder="@username (@ 제외)"
                          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={verifyInstagram}
                          disabled={isLoading || !instagramUsername}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                        >
                          {isLoading ? <Loader2 className="animate-spin" /> : '인증'}
                        </button>
                      </div>
                    </div>
                  )}

                  {mainPlatform === 'YouTube' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube 채널 URL
                      </label>
                      <input
                        type="url"
                        value={youtubeChannel}
                        onChange={(e) => setYoutubeChannel(e.target.value)}
                        placeholder="https://youtube.com/@channel"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep('basic-info')}
                      className="px-6 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      이전
                    </button>
                    <button
                      onClick={handleInfluencerSignup}
                      disabled={isLoading}
                      className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          처리 중...
                        </>
                      ) : (
                        <>
                          가입 완료
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: 완료 */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-12 h-12 text-green-600" />
              </motion.div>

              <h2 className="text-3xl font-bold mb-4">회원가입 완료!</h2>

              {userType === 'advertiser' ? (
                <div>
                  <p className="text-gray-600 mb-8">
                    관리자 승인 후 서비스를 이용하실 수 있습니다.<br />
                    승인 완료 시 <span className="font-semibold">{email}</span>로 안내 메일을 보내드립니다.
                  </p>
                  <p className="text-sm text-gray-500 mb-8">
                    영업일 기준 1-2일 내 처리됩니다
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    로그인 페이지로 이동
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-8">
                    지금 바로 다양한 브랜드 캠페인을 둘러보고<br />
                    협업 기회를 찾아보세요!
                  </p>
                  <button
                    onClick={() => router.push('/campaigns')}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    캠페인 둘러보기
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 로그인 링크 */}
        {step !== 'complete' && (
          <p className="text-center mt-8 text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-700">
              로그인
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}