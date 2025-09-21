// app/(auth)/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  User, Building2, Camera, ArrowRight, 
  Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userType, setUserType] = useState<'influencer' | 'advertiser' | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  
  const [formData, setFormData] = useState({
    // 광고주 필드
    companyName: '',
    businessRegistration: '',
    contactName: '',
    contactPosition: '',
    contactPhone: '',
    website: '',
    industry: '',
    marketingBudget: '',
    
    // 인플루언서 필드
    name: '',
    username: '',
    bio: '',
    categories: [] as string[],
    mainPlatform: 'Instagram'
  });

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      // 현재 로그인한 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || '');

      // 이미 설정된 user_type이 있는지 확인
      const { data: userData, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (!error && userData?.user_type) {
        console.log('이미 user_type 있음:', userData.user_type);
        
        // 이미 타입이 설정되어 있다면
        if (userData.user_type === 'advertiser') {
          // 광고주 프로필 확인
          const { data: advertiserData } = await supabase
            .from('advertisers')
            .select('is_verified')
            .eq('id', user.id)
            .single();
          
          if (advertiserData?.is_verified) {
            // 이미 승인된 광고주
            router.push('/dashboard');
            return;
          }
        } else if (userData.user_type === 'influencer') {
          // 인플루언서 프로필 확인
          const { data: influencerData } = await supabase
            .from('influencers')
            .select('id')
            .eq('id', user.id)
            .single();
          
          if (influencerData) {
            // 이미 설정된 인플루언서
            router.push('/campaigns');
            return;
          }
        }
        
        // 타입은 있지만 프로필이 완성되지 않은 경우
        setUserType(userData.user_type as 'influencer' | 'advertiser');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('User check error:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      toast.error('사용자 타입을 선택해주세요');
      return;
    }

    try {
      setIsSaving(true);

      // 1. users 테이블 업데이트
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: userEmail,
          user_type: userType,
          phone: formData.contactPhone
        });

      if (userError) {
        console.error('User update error:', userError);
        throw userError;
      }

      // 2. 타입별 프로필 생성
      if (userType === 'advertiser') {
        // 광고주 프로필 생성
        const { error: advertiserError } = await supabase
          .from('advertisers')
          .upsert({
            id: userId,
            company_name: formData.companyName,
            business_registration: formData.businessRegistration || `temp-${Date.now()}`,
            contact_name: formData.contactName,
            contact_position: formData.contactPosition,
            contact_phone: formData.contactPhone,
            website: formData.website,
            industry: formData.industry,
            marketing_budget: formData.marketingBudget,
            is_verified: false  // 승인 대기
          });

        if (advertiserError) {
          console.error('Advertiser profile error:', advertiserError);
          throw advertiserError;
        }

        toast.success('광고주 등록이 완료되었습니다. 승인 후 이용 가능합니다.');
        
        // 로그아웃 (승인 대기 상태)
        await supabase.auth.signOut();
        router.push('/login');
        
      } else {
        // 인플루언서 프로필 생성
        const { error: influencerError } = await supabase
          .from('influencers')
          .upsert({
            id: userId,
            name: formData.name,
            username: formData.username || `@${userEmail.split('@')[0]}`,
            bio: formData.bio,
            categories: formData.categories,
            main_platform: formData.mainPlatform,
            tier: 'standard',
            status: 'active',
            followers_count: 0,
            engagement_rate: 0
          });

        if (influencerError) {
          console.error('Influencer profile error:', influencerError);
          throw influencerError;
        }

        toast.success('프로필이 생성되었습니다!');
        router.push('/campaigns');
      }
      
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error('프로필 생성 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  // 이미 광고주로 설정된 경우 처리
  const handleExistingAdvertiser = async () => {
    try {
      setIsSaving(true);
      
      // advertisers 테이블에 기본 데이터 생성
      const { error } = await supabase
        .from('advertisers')
        .upsert({
          id: userId,
          company_name: '미입력',
          business_registration: `pending-${userId.substring(0, 8)}`,
          contact_name: '미입력',
          contact_position: '미입력',
          is_verified: true  // 테스트용 자동 승인
        });

      if (!error) {
        toast.success('광고주 대시보드로 이동합니다');
        router.push('/dashboard');
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Advertiser setup error:', error);
      toast.error('설정 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  // 이미 광고주 타입이지만 프로필이 없는 경우
  if (userType === 'advertiser' && !formData.companyName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <Building2 className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">광고주 계정 확인</h2>
            <p className="text-gray-600 mt-2">
              광고주로 설정되어 있지만 프로필이 없습니다.
            </p>
          </div>
          
          <button
            onClick={handleExistingAdvertiser}
            disabled={isSaving}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                설정 중...
              </>
            ) : (
              <>
                광고주 대시보드로 이동
                <ArrowRight size={20} />
              </>
            )}
          </button>
          
          <button
            onClick={() => setUserType('influencer')}
            className="w-full mt-3 text-gray-600 hover:text-gray-900 text-sm"
          >
            인플루언서로 변경하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            프로필 설정
          </h1>
          <p className="text-gray-600">
            ITDA에서 활동할 프로필을 완성해주세요
          </p>
        </div>

        {/* 사용자 타입 선택 */}
        {!userType && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">어떤 역할로 활동하시나요?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setUserType('influencer')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all"
              >
                <Camera className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <div className="font-semibold text-lg mb-1">인플루언서</div>
                <div className="text-sm text-gray-600">
                  콘텐츠를 제작하고 브랜드와 협업합니다
                </div>
              </button>

              <button
                onClick={() => setUserType('advertiser')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all"
              >
                <Building2 className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <div className="font-semibold text-lg mb-1">광고주</div>
                <div className="text-sm text-gray-600">
                  인플루언서와 함께 마케팅을 진행합니다
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 프로필 입력 폼 */}
        {userType && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {userType === 'advertiser' ? '광고주 정보' : '인플루언서 정보'}
              </h2>
              <button
                type="button"
                onClick={() => setUserType(null)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                변경
              </button>
            </div>

            {userType === 'advertiser' ? (
              // 광고주 폼
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회사명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당자명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    직책 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPosition}
                    onChange={(e) => setFormData({...formData, contactPosition: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락처
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="010-0000-0000"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-800">승인 대기</p>
                      <p className="text-yellow-700 mt-1">
                        광고주 등록 후 관리자 승인이 필요합니다. 
                        승인 완료 시 이메일로 안내드립니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 인플루언서 폼
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    활동명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사용자명 (@ 포함)
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    소개
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    rows={3}
                    placeholder="간단한 자기소개를 작성해주세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주 활동 플랫폼
                  </label>
                  <select
                    value={formData.mainPlatform}
                    onChange={(e) => setFormData({...formData, mainPlatform: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Blog">Blog</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  저장 중...
                </>
              ) : (
                <>
                  프로필 완성하기
                  <CheckCircle size={20} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}