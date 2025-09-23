// app/(advertiser)/create-campaign/page.tsx
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, Upload, X, Plus, Minus,
  Calendar, DollarSign, Users, Target, Clock,
  Camera, Hash, MapPin, TrendingUp, AlertCircle,
  CheckCircle, Sparkles, Crown, Zap, Image as ImageIcon,
  FileText, Video, Instagram, Youtube, MessageCircle,
  Loader2, Info, Shield, Award, Eye
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { hasAdvertiser, safeString, safeArray, safeNumber } from '@/utils/type-guards';

interface Deliverable {
  type: string;
  count: number;
  description: string;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 단계 관리
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 캠페인 데이터
  const [campaignData, setCampaignData] = useState({
    // Step 1: 기본 정보
    title: '',
    brand: '',
    description: '',
    category: '',
    image: null as File | null,
    imagePreview: '',
    
    // Step 2: 예산 & 기간
    budget: '',
    budgetType: 'fixed', // fixed, range
    budgetMin: '',
    budgetMax: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    location: '',
    
    // Step 3: 콘텐츠 요구사항
    deliverables: [
      { type: 'feed', count: 1, description: '피드 포스트' }
    ] as Deliverable[],
    requirements: [] as string[],
    
    // Step 4: 타겟 설정
    minFollowers: 10000,
    minEngagementRate: 2,
    targetAudience: {
      gender: 'all', // all, female, male
      ageRange: '20-35',
      interests: [] as string[]
    },
    
    // Step 5: 추가 옵션
    urgency: 'medium' as 'low' | 'medium' | 'high',
    isPremium: false,
    autoMatch: true,
    matchBonus: 0,
    tags: [] as string[]
  });
  
  // 임시 입력 상태
  const [newRequirement, setNewRequirement] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // 카테고리 목록
  const categories = [
    '패션', '뷰티', '라이프', '여행', '음식', 
    '건강', '운동', '테크', '게임', '교육', '펫'
  ];

  // 이미지 업로드 처리
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('이미지는 5MB 이하여야 합니다');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCampaignData({
          ...campaignData,
          image: file,
          imagePreview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 딜리버러블 추가/삭제
  const addDeliverable = () => {
    setCampaignData({
      ...campaignData,
      deliverables: [...campaignData.deliverables, 
        { type: '', count: 1, description: '' }
      ]
    });
  };

  const removeDeliverable = (index: number) => {
    setCampaignData({
      ...campaignData,
      deliverables: campaignData.deliverables.filter((_, i) => i !== index)
    });
  };

  const updateDeliverable = (index: number, field: string, value: any) => {
    const updated = [...campaignData.deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setCampaignData({ ...campaignData, deliverables: updated });
  };

  // 요구사항 추가
  const addRequirement = () => {
    if (newRequirement.trim()) {
      setCampaignData({
        ...campaignData,
        requirements: [...campaignData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  // 태그 추가
  const addTag = () => {
    if (newTag.trim() && campaignData.tags.length < 5) {
      setCampaignData({
        ...campaignData,
        tags: [...campaignData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  // 관심사 추가
  const addInterest = () => {
    if (newInterest.trim()) {
      setCampaignData({
        ...campaignData,
        targetAudience: {
          ...campaignData.targetAudience,
          interests: [...campaignData.targetAudience.interests, newInterest.trim()]
        }
      });
      setNewInterest('');
    }
  };

  // 단계 유효성 검사
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return campaignData.title && campaignData.brand && 
               campaignData.category && campaignData.image;
      case 2:
        return (campaignData.budgetType === 'fixed' ? campaignData.budget : 
                (campaignData.budgetMin && campaignData.budgetMax));
      case 3:
        return campaignData.deliverables.length > 0;
      case 4:
        return true; // 타겟 설정은 선택사항
      case 5:
        return true; // 추가 옵션도 선택사항
      default:
        return false;
    }
  };

  // 캠페인 제출
  const submitCampaign = async () => {
  setIsSubmitting(true);
  const supabase = createClient();
  
  try {
    // 1. 이미지 업로드 (기존 코드 유지)
    let imageUrl = '';
    if (campaignData.image) {
      const fileName = `campaigns/${Date.now()}_${campaignData.image.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-images')
        .upload(fileName, campaignData.image);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(uploadData.path);
      
      imageUrl = publicUrl;
    }
    
    // 2. 광고주 ID 가져오기 (기존 코드 유지)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('사용자 정보를 찾을 수 없습니다');
    
    // 3. ⚠️ 이 부분을 아래 코드로 교체! ⚠️
    const campaignPayload = {
      advertiser_id: user.id,
      name: campaignData.title || '',
      description: campaignData.description || '',
      objectives: [],  // 빈 배열로 설정
      categories: campaignData.category ? [campaignData.category] : [],
      budget: Number(campaignData.budget) || 0,  // 숫자로 변환
      spent: 0,
      start_date: campaignData.startDate || new Date().toISOString(),
      end_date: campaignData.endDate || new Date().toISOString(),
      target_audience: {},  // 빈 객체로 설정
      min_followers: Number(campaignData.minFollowers) || 10000,
      min_engagement_rate: Number(campaignData.minEngagementRate) || 2.0,
      deliverables: [],  // 빈 배열로 설정
      requirements: campaignData.requirements || [],
      status: 'active' as const,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      metadata: {
        brand: campaignData.brand || '',
        image: imageUrl,
        location: campaignData.location || '전국',
        urgency: campaignData.urgency || 'medium',
        isPremium: campaignData.isPremium || false,
        tags: campaignData.tags || []
      },
      view_count: 0,
      like_count: 0,
      application_count: 0,
      is_premium: Boolean(campaignData.isPremium),
      urgency: (campaignData.urgency || 'medium') as 'high' | 'medium' | 'low'
    };
    
    // 4. 캠페인 생성 (기존 코드 유지)
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignPayload)
      .select()
      .single();
    
    if (error) {
      console.error('Campaign creation error:', error);
      throw error;
    }
    
    // 5. 성공 처리 (기존 코드 유지)
    if (data) {
      toast.success('캠페인이 성공적으로 생성되었습니다!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
    
  } catch (error: any) {
    console.error('Campaign submission error:', error);
    toast.error(error.message || '캠페인 생성에 실패했습니다');
  } finally {
    setIsSubmitting(false);
  }
};
  // 예산 포맷팅
  const formatBudget = (value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString();
  };

  // 단계별 컴포넌트
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">기본 정보를 입력해주세요</h2>
            
            {/* 캠페인 이미지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                캠페인 이미지 (필수)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
              >
                {campaignData.imagePreview ? (
                  <div className="relative">
                    <img 
                      src={campaignData.imagePreview} 
                      alt="Preview" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCampaignData({ ...campaignData, image: null, imagePreview: '' });
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">클릭하여 이미지를 업로드하세요</p>
                    <p className="text-sm text-gray-400 mt-1">JPG, PNG (최대 5MB)</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* 브랜드명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                브랜드명
              </label>
              <input
                type="text"
                value={campaignData.brand}
                onChange={(e) => setCampaignData({ ...campaignData, brand: e.target.value })}
                placeholder="예: 나이키코리아"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* 캠페인 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                캠페인 제목
              </label>
              <input
                type="text"
                value={campaignData.title}
                onChange={(e) => setCampaignData({ ...campaignData, title: e.target.value })}
                placeholder="예: 2024 여름 신상품 프로모션"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                캠페인 설명
              </label>
              <textarea
                value={campaignData.description}
                onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                placeholder="캠페인의 목적과 내용을 자세히 설명해주세요"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCampaignData({ ...campaignData, category: cat })}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      campaignData.category === cat
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">예산과 일정을 설정하세요</h2>
            
            {/* 예산 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예산 형태
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCampaignData({ ...campaignData, budgetType: 'fixed' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    campaignData.budgetType === 'fixed'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium">고정 예산</p>
                </button>
                <button
                  onClick={() => setCampaignData({ ...campaignData, budgetType: 'range' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    campaignData.budgetType === 'range'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium">예산 범위</p>
                </button>
              </div>
            </div>

            {/* 예산 입력 */}
            {campaignData.budgetType === 'fixed' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예산 (만원)
                </label>
                <input
                  type="text"
                  value={formatBudget(campaignData.budget)}
                  onChange={(e) => setCampaignData({ 
                    ...campaignData, 
                    budget: e.target.value.replace(/[^0-9]/g, '') 
                  })}
                  placeholder="500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최소 예산 (만원)
                  </label>
                  <input
                    type="text"
                    value={formatBudget(campaignData.budgetMin)}
                    onChange={(e) => setCampaignData({ 
                      ...campaignData, 
                      budgetMin: e.target.value.replace(/[^0-9]/g, '') 
                    })}
                    placeholder="300"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 예산 (만원)
                  </label>
                  <input
                    type="text"
                    value={formatBudget(campaignData.budgetMax)}
                    onChange={(e) => setCampaignData({ 
                      ...campaignData, 
                      budgetMax: e.target.value.replace(/[^0-9]/g, '') 
                    })}
                    placeholder="500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            )}

            {/* 기간 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일
                </label>
                <input
                  type="date"
                  value={campaignData.startDate}
                  onChange={(e) => setCampaignData({ ...campaignData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일
                </label>
                <input
                  type="date"
                  value={campaignData.endDate}
                  onChange={(e) => setCampaignData({ ...campaignData, endDate: e.target.value })}
                  min={campaignData.startDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* 위치 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위치 (선택)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={campaignData.location}
                  onChange={(e) => setCampaignData({ ...campaignData, location: e.target.value })}
                  placeholder="예: 서울, 전국"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">콘텐츠 요구사항</h2>
            
            {/* 딜리버러블 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제작할 콘텐츠
              </label>
              <div className="space-y-3">
                {campaignData.deliverables.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={item.type}
                      onChange={(e) => updateDeliverable(index, 'type', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">선택</option>
                      <option value="feed">피드 포스트</option>
                      <option value="reels">릴스</option>
                      <option value="story">스토리</option>
                      <option value="youtube">유튜브 영상</option>
                      <option value="shorts">쇼츠</option>
                      <option value="blog">블로그</option>
                    </select>
                    <input
                      type="number"
                      value={item.count}
                      onChange={(e) => updateDeliverable(index, 'count', parseInt(e.target.value))}
                      min="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                      placeholder="설명"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                    {campaignData.deliverables.length > 1 && (
                      <button
                        onClick={() => removeDeliverable(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addDeliverable}
                  className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  항목 추가
                </button>
              </div>
            </div>

            {/* 요구사항 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                필수 요구사항
              </label>
              <div className="space-y-2">
                {campaignData.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="flex-1 text-sm">{req}</span>
                    <button
                      onClick={() => setCampaignData({
                        ...campaignData,
                        requirements: campaignData.requirements.filter((_, i) => i !== idx)
                      })}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    placeholder="예: 브랜드 태그 필수, 제품 착용 사진 포함"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    onClick={addRequirement}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">타겟 인플루언서 설정</h2>
            
            {/* 팔로워 수 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최소 팔로워 수: {campaignData.minFollowers.toLocaleString()}명
              </label>
              <input
                type="range"
                min="1000"
                max="1000000"
                step="1000"
                value={campaignData.minFollowers}
                onChange={(e) => setCampaignData({ 
                  ...campaignData, 
                  minFollowers: parseInt(e.target.value) 
                })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1K</span>
                <span>100K</span>
                <span>500K</span>
                <span>1M</span>
              </div>
            </div>

            {/* 참여율 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최소 참여율: {campaignData.minEngagementRate}%
              </label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={campaignData.minEngagementRate}
                onChange={(e) => setCampaignData({ 
                  ...campaignData, 
                  minEngagementRate: parseFloat(e.target.value) 
                })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5%</span>
                <span>5%</span>
                <span>10%</span>
              </div>
            </div>

            {/* 성별 타겟 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                타겟 성별
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['all', 'female', 'male'].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setCampaignData({
                      ...campaignData,
                      targetAudience: { ...campaignData.targetAudience, gender }
                    })}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      campaignData.targetAudience.gender === gender
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {gender === 'all' ? '전체' : gender === 'female' ? '여성' : '남성'}
                  </button>
                ))}
              </div>
            </div>

            {/* 연령대 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                타겟 연령대
              </label>
              <select
                value={campaignData.targetAudience.ageRange}
                onChange={(e) => setCampaignData({
                  ...campaignData,
                  targetAudience: { ...campaignData.targetAudience, ageRange: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
              >
                <option value="10-20">10-20대</option>
                <option value="20-30">20-30대</option>
                <option value="20-35">20-35세</option>
                <option value="30-40">30-40대</option>
                <option value="40+">40대 이상</option>
              </select>
            </div>

            {/* 관심사 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                타겟 관심사
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {campaignData.targetAudience.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {interest}
                      <button
                        onClick={() => setCampaignData({
                          ...campaignData,
                          targetAudience: {
                            ...campaignData.targetAudience,
                            interests: campaignData.targetAudience.interests.filter((_, i) => i !== idx)
                          }
                        })}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    placeholder="예: 운동, 뷰티, 여행"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    onClick={addInterest}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">추가 옵션</h2>
            
            {/* 긴급도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                긴급도
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'low', label: '여유', icon: Clock, color: 'green' },
                  { value: 'medium', label: '보통', icon: Clock, color: 'yellow' },
                  { value: 'high', label: '긴급', icon: AlertCircle, color: 'red' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCampaignData({ 
                      ...campaignData, 
                      urgency: option.value as any 
                    })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      campaignData.urgency === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option.icon className={`w-5 h-5 mx-auto mb-1 text-${option.color}-600`} />
                    <p className="text-sm font-medium">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 프리미엄 옵션 */}
            <div className="p-4 border-2 border-purple-200 rounded-xl bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">프리미엄 캠페인</h3>
                    <p className="text-sm text-gray-600">상단 노출 + AI 우선 매칭</p>
                  </div>
                </div>
                <button
                  onClick={() => setCampaignData({ 
                    ...campaignData, 
                    isPremium: !campaignData.isPremium 
                  })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    campaignData.isPremium ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    campaignData.isPremium ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              {campaignData.isPremium && (
                <div className="space-y-2 text-sm text-purple-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>인플루언서 피드 최상단 노출</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>AI 매칭 우선순위</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>실시간 지원자 알림</span>
                  </div>
                </div>
              )}
            </div>

            {/* 자동 매칭 */}
            <div className="flex items-center justify-between p-4 border rounded-xl">
              <div>
                <h3 className="font-medium">AI 자동 매칭</h3>
                <p className="text-sm text-gray-600">최적의 인플루언서를 자동으로 추천</p>
              </div>
              <button
                onClick={() => setCampaignData({ 
                  ...campaignData, 
                  autoMatch: !campaignData.autoMatch 
                })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  campaignData.autoMatch ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  campaignData.autoMatch ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* 매칭 보너스 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                빠른 매칭 보너스 (선택)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={campaignData.matchBonus}
                  onChange={(e) => setCampaignData({ 
                    ...campaignData, 
                    matchBonus: parseInt(e.target.value) || 0 
                  })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">만원</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                24시간 내 지원한 인플루언서에게 추가 지급
              </p>
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                캠페인 태그 (최대 5개)
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {campaignData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => setCampaignData({
                          ...campaignData,
                          tags: campaignData.tags.filter((_, i) => i !== idx)
                        })}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {campaignData.tags.length < 5 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="예: 여름, 신제품, 이벤트"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      추가
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">캠페인 생성</h1>
            </div>
            <div className="text-sm text-gray-600">
              {currentStep} / 5 단계
            </div>
          </div>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              animate={{ width: `${(currentStep / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {renderStep()}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            이전
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepValid()}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isStepValid()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              다음
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitCampaign}
              disabled={isSubmitting || !isStepValid()}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                !isSubmitting && isStepValid()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  캠페인 생성
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}