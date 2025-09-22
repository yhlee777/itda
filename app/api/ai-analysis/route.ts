// app/api/ai-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// AI 단가 예측 모델 (실제로는 ML 모델 사용)
function predictPrice(
  followers: number,
  engagement: number,
  category: string,
  campaignBudget: number,
  deliverables: any[]
): {
  estimatedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  factors: Array<{ factor: string; impact: number; description: string }>;
} {
  // 기본 가격 계산 (팔로워 기준)
  let basePrice = 0;
  if (followers < 10000) {
    basePrice = followers * 30; // 마이크로 인플루언서
  } else if (followers < 50000) {
    basePrice = 300000 + (followers - 10000) * 20; // 나노 인플루언서
  } else if (followers < 100000) {
    basePrice = 1100000 + (followers - 50000) * 15; // 미드티어
  } else if (followers < 500000) {
    basePrice = 1850000 + (followers - 100000) * 10; // 매크로 인플루언서
  } else {
    basePrice = 5850000 + (followers - 500000) * 5; // 메가 인플루언서
  }

  // 참여율 가중치
  const engagementMultiplier = 1 + (engagement - 3) * 0.15;
  basePrice *= engagementMultiplier;

  // 카테고리별 가중치
  const categoryMultipliers: Record<string, number> = {
    '뷰티': 1.3,
    '패션': 1.2,
    '테크': 1.4,
    '푸드': 1.1,
    '여행': 1.25,
    '피트니스': 1.15,
    '게이밍': 1.35,
    '라이프스타일': 1.0
  };
  basePrice *= (categoryMultipliers[category] || 1.0);

  // 딜리버러블 기준 조정
  const deliverableCount = deliverables.reduce((sum, d) => sum + (d.count || 1), 0);
  if (deliverableCount > 5) {
    basePrice *= 1 + (deliverableCount - 5) * 0.1;
  }

  // 캠페인 예산 대비 조정
  const budgetRatio = basePrice / campaignBudget;
  if (budgetRatio > 0.5) {
    basePrice = campaignBudget * 0.4; // 예산의 40%로 제한
  }

  // 최종 가격 범위 계산
  const estimatedPrice = Math.round(basePrice / 10000) * 10000;
  const minPrice = Math.round(estimatedPrice * 0.8 / 10000) * 10000;
  const maxPrice = Math.round(estimatedPrice * 1.3 / 10000) * 10000;

  // 신뢰도 계산
  let confidence = 85;
  if (followers > 100000) confidence += 5;
  if (engagement > 5) confidence += 5;
  if (engagement < 2) confidence -= 10;

  // 가격 결정 요인 분석
  const factors = [
    {
      factor: '팔로워 수',
      impact: 40,
      description: `${(followers / 1000).toFixed(0)}K 팔로워`
    },
    {
      factor: '참여율',
      impact: 30,
      description: `${engagement.toFixed(1)}% 참여율`
    },
    {
      factor: '카테고리',
      impact: 20,
      description: `${category} 프리미엄`
    },
    {
      factor: '콘텐츠 양',
      impact: 10,
      description: `${deliverableCount}개 콘텐츠`
    }
  ];

  return {
    estimatedPrice,
    minPrice,
    maxPrice,
    confidence,
    factors
  };
}

// Supabase 서버 클라이언트 생성
function createSupabaseServerClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        }
      }
    }
  );
}

// POST: AI 단가 예측
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      influencerId, 
      campaignId,
      customData 
    } = body;

    // 인플루언서 정보 조회
    const { data: influencer } = await supabase
      .from('influencers')
      .select('*')
      .eq('id', influencerId || user.id)
      .single();

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
    }

    // 캠페인 정보 조회 (있는 경우)
    let campaign = null;
    if (campaignId) {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      campaign = data;
    }

    // 커스텀 데이터 또는 실제 데이터 사용
    const followers = customData?.followers || influencer.followers_count || 10000;
    const engagement = customData?.engagement || influencer.engagement_rate || 3.5;
    const category = customData?.category || influencer.categories?.[0] || '라이프스타일';
    const budget = campaign?.budget || customData?.budget || 5000000;
    const deliverables = campaign?.deliverables || customData?.deliverables || [
      { type: 'feed', count: 3 },
      { type: 'story', count: 5 }
    ];

    // AI 예측 실행
    const prediction = predictPrice(
      followers,
      engagement,
      category,
      budget,
      deliverables
    );

    // 예측 기록 저장 (선택적)
    await supabase
      .from('price_predictions')
      .insert({
        influencer_id: influencerId || user.id,
        campaign_id: campaignId,
        predicted_price: prediction.estimatedPrice,
        min_price: prediction.minPrice,
        max_price: prediction.maxPrice,
        confidence: prediction.confidence,
        factors: prediction.factors,
        created_at: new Date().toISOString()
      });

    // 추천 메시지 생성
    let recommendation = '';
    if (prediction.estimatedPrice < budget * 0.2) {
      recommendation = '매우 합리적인 가격입니다. 빠른 계약을 추천드립니다.';
    } else if (prediction.estimatedPrice < budget * 0.4) {
      recommendation = '적정 가격입니다. 협상 여지가 있습니다.';
    } else if (prediction.estimatedPrice < budget * 0.6) {
      recommendation = '예산 대비 다소 높은 편입니다. 딜리버러블 조정을 고려해보세요.';
    } else {
      recommendation = '예산을 초과할 가능성이 있습니다. 다른 인플루언서도 검토해보세요.';
    }

    return NextResponse.json({
      success: true,
      prediction: {
        ...prediction,
        recommendation,
        currency: 'KRW',
        influencer: {
          id: influencer.id,
          name: influencer.name,
          username: influencer.username,
          followers: influencer.followers_count,
          engagement: influencer.engagement_rate,
          tier: influencer.tier
        },
        campaign: campaign ? {
          id: campaign.id,
          name: campaign.name,
          budget: campaign.budget
        } : null,
        analyzedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET: 과거 예측 기록 조회
export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const influencerId = searchParams.get('influencerId');
    const campaignId = searchParams.get('campaignId');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('price_predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (influencerId) {
      query = query.eq('influencer_id', influencerId);
    }
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data: predictions, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      predictions: predictions || []
    });
    
  } catch (error) {
    console.error('Get predictions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}