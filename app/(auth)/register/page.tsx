'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// 원본 컴포넌트를 Suspense로 감싸기
function RegisterContent() {
// app/(auth)/register/page.tsx - 수정된 버전


import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { 
  Mail, Lock, User, Phone, Building2, Camera,
  Check, ArrowRight, ArrowLeft, Eye, EyeOff,
  Loader2, Instagram, Youtube, CheckCircle,
  AlertCircle, Sparkles, Users, Award, X
} from 'lucide-react';

// 카테고리 옵션
const CATEGORIES = [
  { id: 'fashion', label: '패션', icon: '👗' },
  { id: 'beauty', label: '뷰티', icon: '💄' },
  { id: 'food', label: '푸드', icon: '🍔' },
  { id: 'travel', label: '여행', icon: '✈️' },
  { id: 'lifestyle', label: '라이프스타일', icon: '🏠' },
  { id: 'fitness', label: '피트니스', icon: '💪' },
  { id: 'tech', label: '테크', icon: '💻' },
  { id: 'gaming', label: '게이밍', icon: '🎮' },
];

// 플랫폼 옵션
const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'tiktok', label: 'TikTok', icon: Camera },
];

return ( RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // 상태 관리
  const [step, setStep] = useState('choose-type');
  const [userType, setUserType] = useState<'influencer' | 'advertiser' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [instagramVerified, setInstagramVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // 공통 정보
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');

  // 인플루언서 정보
  const [influencerName, setInfluencerName] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [mainPlatform, setMainPlatform] = useState('instagram');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [followers, setFollowers] = useState('');
  const [engagementRate, setEngagementRate] = useState('');

  // 광고주 정보
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [marketingBudget, setMarketingBudget] = useState('');

  // URL 파라미터에서 타입 확인
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'influencer' || type === 'advertiser') {
      setUserType(type);
      setStep('basic-info');
    }
  }, [searchParams]);

  // 이메일 중복 체크 (디바운스 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email) {
        checkEmailAvailability();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const checkEmailAvailability = async () => {
    if (!email || !email.includes('@')) {
      setEmailError('');
      return;
    }

    try {
      // auth.users 테이블이 아닌 users 테이블에서 체크
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        setEmailError('이미 사용중인 이메일입니다');
      } else {
        setEmailError('');
      }
    } catch (error: any) {
      // 404 에러는 사용 가능한 이메일
      if (error.code === 'PGRST116') {
        setEmailError('');
      }
    }
  };

  // 인스타그램 계정 검증 (Mock)
  const verifyInstagram = async () => {
    setVerifying(true);
    
    try {
      // 실제 구현시 Instagram Basic Display API 사용
      // 현재는 Mock 데이터 반환
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock 데이터 생성
      const mockData = {
        username: instagramUsername.replace('@', ''),
        followers: parseInt(followers) || Math.floor(Math.random() * 50000) + 10000,
        engagement_rate: parseFloat(engagementRate) || (Math.random() * 5 + 2),
        verified: Math.random() > 0.7,
        posts: Math.floor(Math.random() * 500) + 100
      };

      setInstagramVerified(true);
      setFollowers(mockData.followers.toString());
      setEngagementRate(mockData.engagement_rate.toFixed(2));
      
      toast.success(`@${mockData.username} 계정이 확인되었습니다!`, {
        icon: '✅',
        duration: 3000
      });
      
      return mockData;
    } catch (error) {
      toast.error('인스타그램 연동에 실패했습니다');
      return null;
    } finally {
      setVerifying(false);
    }
  };

  // 인플루언서 회원가입
  const handleInfluencerSignup = async () => {
    try {
      setIsLoading(true);

      // 유효성 검사
      if (emailError) {
        toast.error('이메일을 확인해주세요');
        return;
      }

      if (password !== passwordConfirm) {
        toast.error('비밀번호가 일치하지 않습니다');
        return;
      }

      if (password.length < 6) {
        toast.error('비밀번호는 6자 이상이어야 합니다');
        return;
      }

      if (categories.length === 0) {
        toast.error('최소 1개의 카테고리를 선택해주세요');
        return;
      }

      // Mock 인스타그램 데이터 (실제로는 API 연동)
      const instagramData = instagramVerified ? {
        followers: parseInt(followers) || 10000,
        engagement_rate: parseFloat(engagementRate) || 3.5,
        verified: false
      } : {
        followers: 10000,
        engagement_rate: 3.5,
        verified: false
      };

      // Supabase Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            user_type: 'influencer',
            name: influencerName
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('이미 가입된 이메일입니다. 로그인해주세요.');
          router.push('/login');
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('회원가입 실패');
      }

      // users 테이블에 기본 정보 저장
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email.toLowerCase(),
          phone: phone || null,
          user_type: 'influencer'
        });

      if (userError) {
        console.error('User table error:', userError);
        // 중복 키 에러는 무시 (이미 생성됨)
        if (!userError.message.includes('duplicate')) {
          throw userError;
        }
      }

      // influencers 테이블에 프로필 생성
      const { error: profileError } = await supabase
        .from('influencers')
        .insert({
          id: authData.user.id,
          name: influencerName,
          username: instagramUsername.replace('@', '') || influencerName.toLowerCase().replace(/\s+/g, ''),
          categories,
          followers_count: instagramData.followers,
          engagement_rate: instagramData.engagement_rate,
          is_verified: instagramData.verified,
          status: 'active',
          tier: instagramData.followers > 100000 ? 'gold' : 'standard',
          main_platform: mainPlatform,
          instagram_username: instagramUsername.replace('@', ''),
          youtube_channel: youtubeChannel || null,
          preferred_categories: categories,
          daily_swipes_count: 0,
          daily_swipes_reset_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        // 프로필 생성 실패해도 계정은 생성됨
        if (!profileError.message.includes('duplicate')) {
          toast.error('프로필 생성 중 오류가 발생했습니다. 온보딩에서 완성해주세요.');
        }
      }

      toast.success('회원가입 완료! 바로 시작하세요 🎉');
      setStep('complete');

      // 3초 후 캠페인 페이지로 이동
      setTimeout(() => {
        router.push('/campaigns');
      }, 3000);

    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || '회원가입 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 광고주 회원가입
  const handleAdvertiserSignup = async () => {
    try {
      setIsLoading(true);

      // 유효성 검사
      if (emailError) {
        toast.error('이메일을 확인해주세요');
        return;
      }

      if (password !== passwordConfirm) {
        toast.error('비밀번호가 일치하지 않습니다');
        return;
      }

      if (password.length < 6) {
        toast.error('비밀번호는 6자 이상이어야 합니다');
        return;
      }

      // Supabase Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            user_type: 'advertiser',
            company_name: companyName
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('이미 가입된 이메일입니다. 로그인해주세요.');
          router.push('/login');
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('회원가입 실패');
      }

      // users 테이블에 저장
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email.toLowerCase(),
          phone: phone || null,
          user_type: 'advertiser'
        });

      if (userError && !userError.message.includes('duplicate')) {
        console.error('User table error:', userError);
      }

      // advertisers 테이블에 저장
      const { error: advertiserError } = await supabase
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
        });

      if (advertiserError && !advertiserError.message.includes('duplicate')) {
        console.error('Advertiser table error:', advertiserError);
      }

      toast.success('회원가입 완료! 관리자 승인 후 이용 가능합니다.');
      setStep('complete');

      setTimeout(() => {
        router.push('/pending-approval');
      }, 3000);

    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || '회원가입 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold">ITDA 회원가입</h1>
        </div>

        {/* Step 1: 유저 타입 선택 */}
        {step === 'choose-type' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              어떤 목적으로 사용하시나요?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 인플루언서 카드 */}
              <button
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
                    하루 10개 캠페인 스와이프
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    AI 매칭 시스템
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    즉시 활동 가능
                  </li>
                </ul>
              </button>

              {/* 광고주 카드 */}
              <button
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
                    실시간 지원자 알림
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    AI 단가 예측
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    성과 분석 대시보드
                  </li>
                </ul>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: 기본 정보 입력 */}
        {step === 'basic-info' && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">
              {userType === 'influencer' ? '인플루언서' : '광고주'} 기본 정보
            </h2>

            <div className="space-y-4">
              {/* 이름/회사명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userType === 'influencer' ? '활동명' : '회사명'}
                </label>
                <input
                  type="text"
                  value={userType === 'influencer' ? influencerName : companyName}
                  onChange={(e) => userType === 'influencer' 
                    ? setInfluencerName(e.target.value) 
                    : setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder={userType === 'influencer' ? '예: 뷰티크리에이터' : '예: (주)잇다'}
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                    emailError ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="your@email.com"
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {emailError}
                  </p>
                )}
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="6자 이상"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="비밀번호 재입력"
                />
                {password && passwordConfirm && password !== passwordConfirm && (
                  <p className="text-red-500 text-sm mt-1">비밀번호가 일치하지 않습니다</p>
                )}
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호 (선택)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="010-1234-5678"
                />
              </div>

              {/* 광고주 추가 정보 */}
              {userType === 'advertiser' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사업자등록번호
                    </label>
                    <input
                      type="text"
                      value={businessNumber}
                      onChange={(e) => setBusinessNumber(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="123-45-67890"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        담당자명
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="홍길동"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        직책
                      </label>
                      <input
                        type="text"
                        value={contactPosition}
                        onChange={(e) => setContactPosition(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="마케팅팀 과장"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('choose-type')}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep('details')}
                  disabled={!email || !password || !!emailError || password !== passwordConfirm}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  다음
                  <ArrowRight className="inline-block ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: 상세 정보 */}
        {step === 'details' && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">
              {userType === 'influencer' ? '활동 정보' : '추가 정보'}
            </h2>

            {userType === 'influencer' ? (
              <div className="space-y-6">
                {/* 카테고리 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    관심 카테고리 (최대 3개)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {CATEGORIES.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          if (categories.includes(category.id)) {
                            toggleCategory(category.id);
                          } else if (categories.length < 3) {
                            toggleCategory(category.id);
                          } else {
                            toast.error('최대 3개까지 선택 가능합니다');
                          }
                        }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          categories.includes(category.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{category.icon}</div>
                        <div className="text-xs font-medium">{category.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 메인 플랫폼 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    메인 플랫폼
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {PLATFORMS.map(platform => (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => setMainPlatform(platform.id)}
                        className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                          mainPlatform === platform.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <platform.icon className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">{platform.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 인스타그램 계정 */}
                {mainPlatform === 'instagram' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram 계정
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={instagramUsername}
                        onChange={(e) => setInstagramUsername(e.target.value)}
                        placeholder="@username"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={verifyInstagram}
                        disabled={!instagramUsername || verifying}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          instagramVerified
                            ? 'bg-green-500 text-white'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        } disabled:opacity-50`}
                      >
                        {verifying ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : instagramVerified ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          '연동'
                        )}
                      </button>
                    </div>
                    {instagramVerified && (
                      <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        계정이 확인되었습니다
                      </p>
                    )}
                  </div>
                )}

                {/* 팔로워 수 & 참여율 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      팔로워 수
                    </label>
                    <input
                      type="number"
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="3.5"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // 광고주 추가 정보
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    웹사이트 (선택)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    업종
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">선택하세요</option>
                    <option value="fashion">패션/의류</option>
                    <option value="beauty">뷰티/화장품</option>
                    <option value="food">식품/음료</option>
                    <option value="tech">IT/테크</option>
                    <option value="lifestyle">라이프스타일</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    월 마케팅 예산 (선택)
                  </label>
                  <select
                    value={marketingBudget}
                    onChange={(e) => setMarketingBudget(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">선택하세요</option>
                    <option value="under-100">100만원 미만</option>
                    <option value="100-500">100-500만원</option>
                    <option value="500-1000">500-1000만원</option>
                    <option value="1000-5000">1000-5000만원</option>
                    <option value="over-5000">5000만원 이상</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setStep('basic-info')}
                className="px-6 py-3 text-gray-600 hover:text-gray-900"
              >
                이전
              </button>
              <button
                onClick={userType === 'influencer' ? handleInfluencerSignup : handleAdvertiserSignup}
                disabled={isLoading || (userType === 'influencer' && categories.length === 0)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    처리중...
                  </>
                ) : (
                  <>
                    가입 완료
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: 완료 */}
        {step === 'complete' && (
          <motion.div
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
              <>
                <p className="text-gray-600 mb-2">
                  관리자 승인 후 서비스를 이용하실 수 있습니다.
                </p>
                <p className="text-sm text-gray-500">
                  승인 완료 시 이메일로 안내드립니다.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-2">
                  지금 바로 캠페인을 탐색해보세요!
                </p>
                <p className="text-sm text-gray-500">
                  하루 10개의 캠페인이 준비되어 있습니다.
                </p>
              </>
            )}

            <div className="mt-8">
              <div className="animate-pulse text-gray-400">
                잠시 후 자동으로 이동합니다...
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
      <RegisterContent />
    </Suspense>
  );
}