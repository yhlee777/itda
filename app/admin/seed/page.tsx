// app/admin/seed/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { hasAdvertiser, safeString, safeArray, safeNumber } from '@/utils/type-guards';

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const supabase = createClient();
  
  const seedCampaigns = async () => {
    setIsSeeding(true);
    setLogs(['🌱 캠페인 데이터 시딩 시작...']);
    
    try {
      // 광고주 계정 생성 (없으면)
      const { data: advertiserData } = await supabase
        .from('advertisers')
        .select('id')
        .limit(1)
        .single();
        
      let advertiserId = advertiserData?.id;
      
      if (!advertiserId) {
        setLogs(prev => [...prev, '📝 광고주 계정 생성 중...']);
        
        const { data: newAdvertiser, error: advertiserError } = await supabase
          .from('advertisers')
          .insert({
            company_name: 'Sample Company',
            company_email: 'advertiser@example.com',
            company_phone: '02-1234-5678',
            business_number: '123-45-67890',
            company_address: '서울특별시 강남구',
            company_logo: 'https://via.placeholder.com/200',
            industry: '마케팅',
            website: 'https://example.com'
          })
          .select('id')
          .single();
          
        if (advertiserError) {
          throw new Error('광고주 생성 실패: ' + advertiserError.message);
        }
        
        advertiserId = newAdvertiser.id;
        setLogs(prev => [...prev, '✅ 광고주 계정 생성 완료']);
      } else {
        setLogs(prev => [...prev, '✅ 기존 광고주 계정 사용']);
      }
      
      // 샘플 캠페인 데이터
      const campaigns = [
        {
          name: '2024 나이키 봄 컬렉션',
          description: '나이키의 새로운 봄 컬렉션을 소개하는 대규모 캠페인입니다.',
          objectives: ['브랜드 인지도 향상', '신제품 홍보'],
          categories: ['패션', '스포츠'],
          budget: 5000000,
          spent: 0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          target_audience: {
            gender: '여성 70%',
            age_range: '20-35세',
            location: '서울'
          },
          min_followers: 50000,
          min_engagement_rate: 3.0,
          deliverables: {
            items: ['인스타그램 피드 3개', '릴스 2개', '스토리 5개']
          },
          requirements: ['팔로워 5만+', '패션 콘텐츠', '고품질 사진'],
          status: 'active' as const,
          metadata: {
            brand_name: '나이키',
            brand_logo: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=200',
            location: '서울',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
            perks: ['제품 증정', '추가 협업 기회']
          },
          view_count: 328,
          application_count: 23,
          is_premium: true,
          urgency: 'high' as const
        },
        {
          name: '샤넬 뷰티 신제품 론칭',
          description: '샤넬의 2024 봄 뷰티 컬렉션을 알리는 럭셔리 캠페인',
          objectives: ['신제품 홍보', '프리미엄 이미지 강화'],
          categories: ['뷰티', '럭셔리'],
          budget: 8000000,
          spent: 0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          target_audience: {
            gender: '여성 90%',
            age_range: '25-45세',
            location: '서울, 부산'
          },
          min_followers: 100000,
          min_engagement_rate: 4.0,
          deliverables: {
            items: ['인스타그램 피드 4개', '유튜브 영상 1개']
          },
          requirements: ['팔로워 10만+', '뷰티 전문', '럭셔리 콘텐츠'],
          status: 'active' as const,
          metadata: {
            brand_name: '샤넬',
            brand_logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200',
            location: '서울, 부산',
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
            is_vip: true,
            perks: ['럭셔리 제품 세트', 'VIP 이벤트']
          },
          view_count: 567,
          application_count: 45,
          is_premium: true,
          urgency: 'medium' as const
        },
        {
          name: '스타벅스 봄 신메뉴',
          description: '스타벅스 봄 시즌 한정 메뉴 홍보',
          objectives: ['신메뉴 홍보', '매장 방문 유도'],
          categories: ['푸드', '카페'],
          budget: 3000000,
          spent: 0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          target_audience: {
            gender: '전체',
            age_range: '20-40세',
            location: '전국'
          },
          min_followers: 30000,
          min_engagement_rate: 2.5,
          deliverables: {
            items: ['피드 2개', '스토리 10개']
          },
          requirements: ['팔로워 3만+', '카페 콘텐츠'],
          status: 'active' as const,
          metadata: {
            brand_name: '스타벅스',
            brand_logo: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=200',
            location: '전국',
            image: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800',
            perks: ['음료 쿠폰', 'MD 상품']
          },
          view_count: 892,
          application_count: 78,
          is_premium: false,
          urgency: 'low' as const
        }
      ];
      
      // 캠페인 추가
      let successCount = 0;
      
      for (const campaign of campaigns) {
        setLogs(prev => [...prev, `⏳ "${campaign.name}" 추가 중...`]);
        
        const { error } = await supabase
          .from('campaigns')
          .insert({
            ...campaign,
            advertiser_id: advertiserId
          });
          
        if (error) {
          setLogs(prev => [...prev, `❌ 실패: ${error.message}`]);
        } else {
          setLogs(prev => [...prev, `✅ "${campaign.name}" 추가 완료`]);
          successCount++;
        }
      }
      
      setLogs(prev => [...prev, `🎉 완료! ${successCount}/${campaigns.length}개 캠페인 추가됨`]);
      toast.success(`${successCount}개의 캠페인이 추가되었습니다!`);
      
    } catch (error) {
      console.error('시딩 실패:', error);
      setLogs(prev => [...prev, `❌ 에러: ${error}`]);
      toast.error('데이터 시딩 중 오류가 발생했습니다');
    } finally {
      setIsSeeding(false);
    }
  };
  
  const clearCampaigns = async () => {
    if (!confirm('정말로 모든 캠페인을 삭제하시겠습니까?')) return;
    
    setIsSeeding(true);
    setLogs(['🗑️ 캠페인 데이터 삭제 중...']);
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 캠페인 삭제
        
      if (error) {
        throw error;
      }
      
      setLogs(prev => [...prev, '✅ 모든 캠페인 삭제 완료']);
      toast.success('모든 캠페인이 삭제되었습니다');
    } catch (error) {
      console.error('삭제 실패:', error);
      setLogs(prev => [...prev, `❌ 에러: ${error}`]);
      toast.error('캠페인 삭제 중 오류가 발생했습니다');
    } finally {
      setIsSeeding(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">데이터베이스 시딩</h1>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">주의사항</p>
                <p className="text-sm text-amber-800 mt-1">
                  이 페이지는 개발 환경에서만 사용하세요. 
                  실제 운영 환경에서는 사용하지 마세요.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={seedCampaigns}
              disabled={isSeeding}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSeeding ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  캠페인 데이터 추가
                </>
              )}
            </button>
            
            <button
              onClick={clearCampaigns}
              disabled={isSeeding}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              모든 캠페인 삭제
            </button>
          </div>
          
          {logs.length > 0 && (
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}