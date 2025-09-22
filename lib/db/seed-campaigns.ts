// lib/db/seed-campaigns.ts
// 캠페인 데이터 시딩 스크립트

import { createClient } from '@/lib/supabase/client';

export async function seedCampaigns() {
  const supabase = createClient();
  
  // 샘플 캠페인 데이터
  const campaigns = [
    {
      name: '2024 봄 컬렉션 프로모션',
      description: '나이키의 새로운 봄 컬렉션을 소개하는 대규모 캠페인입니다. 스포티하면서도 캐주얼한 스타일을 강조합니다.',
      objectives: ['브랜드 인지도 향상', '신제품 홍보', '판매 증대'],
      categories: ['패션', '스포츠', '라이프스타일'],
      budget: 5000000,
      spent: 0,
      start_date: '2024-02-01',
      end_date: '2024-03-31',
      target_audience: {
        gender: '여성 70%',
        age_range: '20-35세',
        location: '서울, 경기',
        interests: ['운동', '패션', '건강']
      },
      min_followers: 50000,
      min_engagement_rate: 3.0,
      deliverables: {
        items: [
          '인스타그램 피드 3개',
          '인스타그램 릴스 2개',
          '스토리 5개'
        ]
      },
      requirements: [
        '팔로워 5만 이상',
        '패션/스포츠 카테고리',
        '고품질 콘텐츠 제작 가능'
      ],
      status: 'active',
      metadata: {
        brand_name: '나이키',
        brand_logo: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=200',
        location: '서울',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        is_vip: false,
        perks: ['제품 증정', '추가 협업 기회', '이벤트 초대']
      },
      view_count: 328,
      like_count: 89,
      application_count: 23,
      is_premium: true,
      urgency: 'high' as const
    },
    {
      name: '샤넬 뷰티 신제품 론칭',
      description: '샤넬의 2024 봄 뷰티 컬렉션을 알리는 럭셔리 캠페인입니다. 우아하고 세련된 이미지를 추구합니다.',
      objectives: ['신제품 홍보', '프리미엄 브랜드 이미지 강화'],
      categories: ['뷰티', '럭셔리', '패션'],
      budget: 8000000,
      spent: 0,
      start_date: '2024-02-15',
      end_date: '2024-04-15',
      target_audience: {
        gender: '여성 90%',
        age_range: '25-45세',
        location: '서울, 부산',
        interests: ['뷰티', '패션', '럭셔리']
      },
      min_followers: 100000,
      min_engagement_rate: 4.0,
      deliverables: {
        items: [
          '인스타그램 피드 4개',
          '유튜브 영상 1개',
          '인스타 릴스 3개'
        ]
      },
      requirements: [
        '팔로워 10만 이상',
        '뷰티 전문 인플루언서',
        '고급스러운 콘텐츠 스타일'
      ],
      status: 'active',
      metadata: {
        brand_name: '샤넬',
        brand_logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200',
        location: '서울, 부산',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
        is_vip: true,
        perks: ['럭셔리 제품 풀세트', 'VIP 이벤트 초대', '장기 계약 가능']
      },
      view_count: 567,
      like_count: 234,
      application_count: 45,
      is_premium: true,
      urgency: 'medium' as const
    },
    {
      name: '스타벅스 봄 신메뉴 캠페인',
      description: '스타벅스의 봄 시즌 한정 메뉴를 홍보하는 캠페인입니다. 따뜻하고 친근한 분위기를 강조합니다.',
      objectives: ['신메뉴 홍보', '매장 방문 유도', '브랜드 친밀감 증대'],
      categories: ['푸드', '라이프스타일', '카페'],
      budget: 3000000,
      spent: 0,
      start_date: '2024-03-01',
      end_date: '2024-04-30',
      target_audience: {
        gender: '전체',
        age_range: '20-40세',
        location: '전국',
        interests: ['카페', '디저트', '라이프스타일']
      },
      min_followers: 30000,
      min_engagement_rate: 2.5,
      deliverables: {
        items: [
          '인스타그램 피드 2개',
          '스토리 10개',
          '릴스 1개'
        ]
      },
      requirements: [
        '팔로워 3만 이상',
        '카페 문화 콘텐츠',
        '밝고 따뜻한 분위기'
      ],
      status: 'active',
      metadata: {
        brand_name: '스타벅스',
        brand_logo: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=200',
        location: '전국',
        image: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800',
        is_vip: false,
        perks: ['음료 쿠폰', 'MD 상품', '매장 이용권']
      },
      view_count: 892,
      like_count: 456,
      application_count: 78,
      is_premium: false,
      urgency: 'low' as const
    },
    {
      name: 'LG 가전 스마트홈 캠페인',
      description: 'LG전자의 스마트홈 가전제품을 소개하는 테크 캠페인입니다. 혁신적이고 편리한 라이프스타일을 보여줍니다.',
      objectives: ['제품 인지도 향상', '기술 혁신 이미지 강화'],
      categories: ['테크', '라이프스타일', '가전'],
      budget: 6000000,
      spent: 0,
      start_date: '2024-02-20',
      end_date: '2024-04-20',
      target_audience: {
        gender: '전체',
        age_range: '25-45세',
        location: '서울, 경기',
        interests: ['테크', '스마트홈', '인테리어']
      },
      min_followers: 50000,
      min_engagement_rate: 2.0,
      deliverables: {
        items: [
          '유튜브 리뷰 영상 1개',
          '인스타그램 피드 3개',
          '블로그 포스트 1개'
        ]
      },
      requirements: [
        '팔로워 5만 이상',
        '테크/라이프스타일 콘텐츠',
        '상세한 제품 리뷰 가능'
      ],
      status: 'active',
      metadata: {
        brand_name: 'LG전자',
        brand_logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200',
        location: '서울, 경기',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        is_vip: false,
        perks: ['제품 증정', '체험단 활동', '추가 협업 기회']
      },
      view_count: 234,
      like_count: 67,
      application_count: 12,
      is_premium: true,
      urgency: 'medium' as const
    },
    {
      name: '에뛰드 하우스 틴트 컬렉션',
      description: '에뛰드하우스의 새로운 틴트 라인을 소개하는 뷰티 캠페인입니다. 발랄하고 사랑스러운 이미지를 추구합니다.',
      objectives: ['신제품 홍보', '젊은 층 타겟 마케팅'],
      categories: ['뷰티', '메이크업'],
      budget: 2500000,
      spent: 0,
      start_date: '2024-03-10',
      end_date: '2024-05-10',
      target_audience: {
        gender: '여성 95%',
        age_range: '18-30세',
        location: '전국',
        interests: ['메이크업', 'K-뷰티', '패션']
      },
      min_followers: 20000,
      min_engagement_rate: 4.0,
      deliverables: {
        items: [
          '인스타그램 피드 2개',
          '릴스 2개',
          '스토리 5개'
        ]
      },
      requirements: [
        '팔로워 2만 이상',
        '뷰티 콘텐츠 전문',
        '밝고 화사한 이미지'
      ],
      status: 'active',
      metadata: {
        brand_name: '에뛰드하우스',
        brand_logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200',
        location: '전국',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
        is_vip: false,
        perks: ['전 제품 증정', '신제품 우선 체험']
      },
      view_count: 445,
      like_count: 123,
      application_count: 34,
      is_premium: false,
      urgency: 'low' as const
    }
  ];

  // 광고주 계정 생성 (없으면)
  const { data: advertiserData } = await supabase
    .from('advertisers')
    .select('id')
    .limit(1)
    .single();
    
  let advertiserId = advertiserData?.id;
  
  if (!advertiserId) {
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
      console.error('광고주 생성 실패:', advertiserError);
      return;
    }
    
    advertiserId = newAdvertiser.id;
  }

  // 캠페인 추가
  for (const campaign of campaigns) {
    const { error } = await supabase
      .from('campaigns')
      .insert({
        ...campaign,
        advertiser_id: advertiserId
      });
      
    if (error) {
      console.error('캠페인 추가 실패:', error);
    } else {
      console.log(`캠페인 추가 성공: ${campaign.name}`);
    }
  }
  
  console.log('✅ 캠페인 시딩 완료!');
}

// 실행 함수
export async function runSeed() {
  console.log('🌱 캠페인 데이터 시딩 시작...');
  await seedCampaigns();
}

// 직접 실행 시
if (require.main === module) {
  runSeed().catch(console.error);
}