// supabase/functions/ai-matching/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  campaignId: string;
  filters?: {
    minFollowers?: number;
    minEngagement?: number;
    categories?: string[];
    maxBudget?: number;
    limit?: number;
  };
  userId?: string;
  action?: 'match' | 'analyze' | 'recommend';
}

interface InfluencerScore {
  influencer_id: string;
  score: number;
  name: string;
  username: string;
  avatar?: string;
  followers_count: number;
  engagement_rate: number;
  categories: string[];
  strengths: string[];
  estimated_reach: number;
  estimated_price: number;
  risk_level: 'low' | 'medium' | 'high';
  match_details: {
    categoryMatch: number;
    engagementRate: number;
    audienceFit: number;
    pastPerformance: number;
    availability: number;
    priceRange: number;
  };
}

serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { campaignId, filters, action = 'match' } = await req.json() as RequestBody

    // 캠페인 정보 조회
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        advertisers (
          id,
          company_name,
          industry
        )
      `)
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      throw new Error('Campaign not found')
    }

    // 인플루언서 조회 (필터 적용)
    let query = supabase
      .from('influencers')
      .select('*')
      .eq('status', 'active')

    // 필터 적용
    if (filters?.minFollowers) {
      query = query.gte('followers_count', filters.minFollowers)
    }
    if (filters?.minEngagement) {
      query = query.gte('engagement_rate', filters.minEngagement)
    }

    const { data: influencers, error: influencersError } = await query.limit(200)

    if (influencersError) {
      throw influencersError
    }

    // 이미 지원한 인플루언서 제외
    const { data: existingApplications } = await supabase
      .from('campaign_influencers')
      .select('influencer_id')
      .eq('campaign_id', campaignId)

    const appliedInfluencerIds = existingApplications?.map(app => app.influencer_id) || []
    
    const availableInfluencers = influencers?.filter(
      inf => !appliedInfluencerIds.includes(inf.id)
    ) || []

    // 각 인플루언서에 대한 AI 매칭 점수 계산
    const scoredInfluencers: InfluencerScore[] = await Promise.all(
      availableInfluencers.map(async (influencer) => {
        const score = await calculateAIScore(influencer, campaign, filters)
        return score
      })
    )

    // 점수순 정렬 및 상위 N개 선택
    const topMatches = scoredInfluencers
      .sort((a, b) => b.score - a.score)
      .slice(0, filters?.limit || 20)

    // 매칭 히스토리 저장
    if (action === 'match') {
      await supabase.from('matching_history').insert({
        campaign_id: campaignId,
        matched_influencers: topMatches,
        total_analyzed: availableInfluencers.length,
        filters_used: filters
      })
    }

    // 응답 반환
    return new Response(
      JSON.stringify({
        matches: topMatches,
        total_count: availableInfluencers.length,
        filters_applied: filters,
        campaign_name: campaign.name,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// AI 점수 계산 함수
async function calculateAIScore(
  influencer: any,
  campaign: any,
  filters?: any
): Promise<InfluencerScore> {
  const weights = {
    categoryMatch: 0.35,
    engagementRate: 0.25,
    audienceFit: 0.20,
    pastPerformance: 0.10,
    availability: 0.05,
    priceRange: 0.05
  }

  const details = {
    categoryMatch: 0,
    engagementRate: 0,
    audienceFit: 0,
    pastPerformance: 0,
    availability: 0,
    priceRange: 0
  }

  const strengths: string[] = []
  let riskLevel: 'low' | 'medium' | 'high' = 'low'

  // 1. 카테고리 매칭 점수
  if (influencer.categories && campaign.categories) {
    const intersection = influencer.categories.filter((cat: string) =>
      campaign.categories.includes(cat)
    )
    details.categoryMatch = (intersection.length / campaign.categories.length) * 100
    
    if (details.categoryMatch > 80) {
      strengths.push('완벽한 카테고리 매치')
    } else if (details.categoryMatch > 50) {
      strengths.push('카테고리 적합')
    }
  }

  // 2. 참여율 점수
  const engagementRate = influencer.engagement_rate || 0
  const minRequired = campaign.min_engagement_rate || 2

  if (engagementRate >= minRequired) {
    details.engagementRate = Math.min(100, (engagementRate / 5) * 100)
    
    if (engagementRate > 7) {
      strengths.push('매우 높은 참여율')
    } else if (engagementRate > 5) {
      strengths.push('우수한 참여율')
    } else if (engagementRate > 3) {
      strengths.push('양호한 참여율')
    }
  } else {
    details.engagementRate = (engagementRate / minRequired) * 50
    riskLevel = 'medium'
  }

  // 3. 오디언스 적합도
  const audienceDemographics = influencer.audience_demographics || {}
  const targetAudience = campaign.target_audience || {}
  
  // 간단한 매칭 로직
  let audienceScore = 60 // 기본 점수
  
  if (targetAudience.age_range && audienceDemographics.age_range) {
    // 연령대가 비슷하면 점수 추가
    audienceScore += 20
  }
  
  if (targetAudience.gender && audienceDemographics.gender) {
    if (targetAudience.gender === audienceDemographics.gender) {
      audienceScore += 20
    }
  }
  
  details.audienceFit = Math.min(100, audienceScore)

  // 4. 과거 성과
  const totalCampaigns = influencer.total_campaigns || 0
  const avgRating = influencer.average_rating || 0
  
  let performanceScore = 50
  if (totalCampaigns > 50) {
    performanceScore += 25
    strengths.push('풍부한 캠페인 경험')
  } else if (totalCampaigns > 20) {
    performanceScore += 15
    strengths.push('검증된 경험')
  } else if (totalCampaigns > 10) {
    performanceScore += 10
  } else if (totalCampaigns < 5) {
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
  }
  
  if (avgRating >= 4.5) {
    performanceScore += 25
    strengths.push('높은 평점')
  } else if (avgRating >= 4.0) {
    performanceScore += 15
  } else if (avgRating < 3.5 && avgRating > 0) {
    riskLevel = 'high'
  }
  
  details.pastPerformance = Math.min(100, performanceScore)

  // 5. 가용성
  const availability = influencer.availability || { status: 'available' }
  if (availability.status === 'immediate' || availability.status === 'available') {
    details.availability = 100
    strengths.push('즉시 시작 가능')
  } else if (availability.status === 'busy') {
    details.availability = 30
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
  } else {
    details.availability = 70
  }

  // 6. 가격 적합도
  const estimatedPrice = calculateEstimatedPrice(influencer, campaign)
  const budget = campaign.budget || 0
  
  if (estimatedPrice <= budget * 0.8) {
    details.priceRange = 100
    strengths.push('예산 내 적정 가격')
  } else if (estimatedPrice <= budget) {
    details.priceRange = 80
  } else if (estimatedPrice <= budget * 1.2) {
    details.priceRange = 50
  } else {
    details.priceRange = 20
    riskLevel = 'high'
  }

  // 총점 계산
  const totalScore = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + (details[key as keyof typeof details] * weight)
  }, 0)

  // 예상 도달 수 계산
  const followers = influencer.followers_count || 0
  const engagement = influencer.engagement_rate || 0
  const estimatedReach = Math.round(followers * (engagement / 100) * 0.3)

  return {
    influencer_id: influencer.id,
    score: Math.round(totalScore),
    name: influencer.name || 'Unknown',
    username: influencer.username || '@unknown',
    avatar: influencer.avatar,
    followers_count: followers,
    engagement_rate: engagement,
    categories: influencer.categories || [],
    strengths: strengths.slice(0, 3),
    estimated_reach: estimatedReach,
    estimated_price: estimatedPrice,
    risk_level: riskLevel,
    match_details: details
  }
}

// 예상 가격 계산
function calculateEstimatedPrice(influencer: any, campaign: any): number {
  const followers = influencer.followers_count || 0
  const engagement = influencer.engagement_rate || 0
  const tier = influencer.tier || 'standard'
  
  // 기본 CPM (1000 노출당 비용)
  let baseCPM = 10000 // 10,000원
  
  // 티어별 가격 조정
  if (tier === 'premium') {
    baseCPM *= 2.5
  } else if (tier === 'gold') {
    baseCPM *= 1.8
  }
  
  // 참여율별 가격 조정
  if (engagement > 7) {
    baseCPM *= 1.5
  } else if (engagement > 5) {
    baseCPM *= 1.3
  } else if (engagement > 3) {
    baseCPM *= 1.1
  } else if (engagement < 2) {
    baseCPM *= 0.8
  }
  
  // 캠페인 긴급도별 가격 조정
  if (campaign.urgency === 'high') {
    baseCPM *= 1.3
  }
  
  // 최종 가격 계산 (팔로워수 * 참여율 * CPM)
  const estimatedPrice = (followers * (engagement / 100) * baseCPM) / 1000
  
  // 10만원 단위로 반올림
  return Math.round(estimatedPrice / 100000) * 100000
}