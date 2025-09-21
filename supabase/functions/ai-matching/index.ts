// supabase/functions/ai-matching/index.ts

// ✅ Supabase Edge Functions는 Deno.serve를 직접 사용합니다
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

// ============================================
// 타입 정의
// ============================================

interface Campaign {
  id: string
  advertiser_id: string
  name: string
  categories: string[]
  target_audience: any
  min_engagement_rate: number
  min_followers: number
  start_date: string
  budget: number
  brand_id?: string
}

interface Influencer {
  id: string
  name: string
  username: string
  avatar?: string
  categories: string[]
  followers_count: number
  engagement_rate: number
  audience_demographics: any
  past_campaigns?: any[]
  availability?: any
  is_verified: boolean
  tier: 'standard' | 'gold' | 'premium'
  worked_with_brands?: string[]
  growth_rate: number
  content_quality_score: number
  status: string
}

interface MatchedInfluencer extends Influencer {
  matchScore: number
  matchDetails: MatchDetails
}

interface MatchDetails {
  score: number
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  estimatedReach: number
  estimatedEngagement: number
  suggestedBudget: number
}

interface RequestBody {
  campaignId: string
  filters?: {
    categories?: string[]
    minFollowers?: number
    minEngagement?: number
  }
}

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// 메인 서버 함수 - Deno.serve 사용
// ============================================

Deno.serve(async (req: Request) => {
  // OPTIONS 요청 처리 (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 요청 본문 파싱
    const body: RequestBody = await req.json()
    const { campaignId, filters } = body
    
    // 환경변수 가져오기
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('환경변수가 설정되지 않았습니다')
    }
    
    // Supabase 클라이언트 초기화
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. 캠페인 정보 조회
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError) {
      console.error('캠페인 조회 오류:', campaignError)
      throw new Error(`캠페인을 찾을 수 없습니다: ${campaignId}`)
    }

    // 2. 인플루언서 조회 쿼리 구성
    let query = supabase
      .from('influencers')
      .select('*')

    // 기본 필터: 활성 상태만
    query = query.eq('status', 'active')

    // 추가 필터 적용
    if (filters?.categories && filters.categories.length > 0) {
      query = query.contains('categories', filters.categories)
    }
    if (filters?.minFollowers) {
      query = query.gte('followers_count', filters.minFollowers)
    }
    if (filters?.minEngagement) {
      query = query.gte('engagement_rate', filters.minEngagement)
    }

    const { data: influencers, error: influencersError } = await query

    if (influencersError) {
      console.error('인플루언서 조회 오류:', influencersError)
      throw new Error('인플루언서 조회 실패')
    }

    // 3. AI 매칭 점수 계산 (타입 명시)
    const matchedInfluencers: MatchedInfluencer[] = (influencers || []).map((influencer: Influencer) => {
      const matchScore = calculateMatchScore(campaign as Campaign, influencer)
      return {
        ...influencer,
        matchScore,
        matchDetails: getMatchDetails(campaign as Campaign, influencer, matchScore)
      }
    })

    // 4. 점수 순으로 정렬 (타입 명시)
    matchedInfluencers.sort((a: MatchedInfluencer, b: MatchedInfluencer) => b.matchScore - a.matchScore)

    // 5. 상위 20명 선택
    const topMatches = matchedInfluencers.slice(0, 20)

    // 6. 매칭 기록 저장
    if (topMatches.length > 0) {
      const { error: saveError } = await supabase
        .from('matching_history')
        .insert({
          campaign_id: campaignId,
          matched_influencers: topMatches.map(m => ({
            influencer_id: m.id,
            match_score: m.matchScore,
            match_details: m.matchDetails
          })),
          created_at: new Date().toISOString()
        })

      if (saveError) {
        console.warn('매칭 기록 저장 실패:', saveError)
      }
    }

    // 성공 응답 반환
    return new Response(
      JSON.stringify({
        success: true,
        campaign,
        matches: topMatches,
        totalAnalyzed: influencers?.length || 0,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    // 에러 처리
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    console.error('함수 실행 오류:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

// ============================================
// AI 매칭 알고리즘 함수들
// ============================================

/**
 * AI 매칭 점수 계산
 */
function calculateMatchScore(campaign: Campaign, influencer: Influencer): number {
  let score = 0
  const weights = {
    categoryMatch: 30,
    audienceMatch: 25,
    engagementRate: 20,
    pastPerformance: 15,
    availability: 10
  }

  // 1. 카테고리 매칭 (30%)
  if (campaign.categories && influencer.categories) {
    const categoryScore = calculateCategoryMatch(campaign.categories, influencer.categories)
    score += categoryScore * weights.categoryMatch
  }

  // 2. 오디언스 매칭 (25%)
  if (campaign.target_audience && influencer.audience_demographics) {
    const audienceScore = calculateAudienceMatch(
      campaign.target_audience,
      influencer.audience_demographics
    )
    score += audienceScore * weights.audienceMatch
  }

  // 3. 참여율 (20%)
  const engagementScore = calculateEngagementScore(
    influencer.engagement_rate || 0,
    campaign.min_engagement_rate || 0
  )
  score += engagementScore * weights.engagementRate

  // 4. 과거 성과 (15%) - 기본값 사용
  score += 0.5 * weights.pastPerformance

  // 5. 가용성 (10%) - 기본값 사용
  score += 1.0 * weights.availability

  // 보너스 점수 추가
  if (influencer.is_verified) score += 3
  if (influencer.tier === 'premium') score += 2
  else if (influencer.tier === 'gold') score += 1
  if (influencer.growth_rate && influencer.growth_rate > 20) score += 2
  if (influencer.content_quality_score && influencer.content_quality_score >= 8) score += 2

  return Math.min(100, Math.round(score))
}

/**
 * 카테고리 매칭 점수 계산
 */
function calculateCategoryMatch(campaignCategories: string[], influencerCategories: string[]): number {
  if (!campaignCategories.length || !influencerCategories.length) return 0
  
  const matches = campaignCategories.filter(cat => 
    influencerCategories.includes(cat)
  )
  
  return matches.length / campaignCategories.length
}

/**
 * 오디언스 매칭 점수 계산
 */
function calculateAudienceMatch(targetAudience: any, influencerAudience: any): number {
  let matchScore = 0.5 // 기본 점수
  
  // 연령대 매칭
  if (targetAudience.age_range && influencerAudience.age_distribution) {
    // 간단한 매칭 로직
    matchScore += 0.2
  }
  
  // 성별 매칭  
  if (targetAudience.gender && influencerAudience.gender_distribution) {
    // 간단한 매칭 로직
    matchScore += 0.15
  }
  
  // 지역 매칭
  if (targetAudience.location && influencerAudience.location_distribution) {
    // 간단한 매칭 로직
    matchScore += 0.15
  }
  
  return Math.min(1, matchScore)
}

/**
 * 참여율 점수 계산
 */
function calculateEngagementScore(influencerRate: number, minRate: number): number {
  if (!influencerRate) return 0
  if (!minRate) return 0.7
  
  const ratio = influencerRate / minRate
  
  if (ratio >= 1.5) return 1.0  // 150% 이상
  if (ratio >= 1.0) return 0.8  // 100% 이상
  if (ratio >= 0.8) return 0.6  // 80% 이상
  return 0.3
}

/**
 * 매칭 상세 정보 생성
 */
function getMatchDetails(campaign: Campaign, influencer: Influencer, score: number): MatchDetails {
  // 강점 분석
  const strengths: string[] = []
  if (influencer.engagement_rate > 5) {
    strengths.push('높은 참여율')
  }
  if (influencer.is_verified) {
    strengths.push('인증된 계정')
  }
  if (influencer.tier === 'premium' || influencer.tier === 'gold') {
    strengths.push(`${influencer.tier === 'premium' ? '프리미엄' : '골드'} 등급`)
  }
  if (influencer.followers_count > 100000) {
    strengths.push('대규모 팔로워')
  }
  
  // 약점 분석
  const weaknesses: string[] = []
  if (campaign.min_engagement_rate && influencer.engagement_rate < campaign.min_engagement_rate) {
    weaknesses.push('목표 참여율 미달')
  }
  if (campaign.min_followers && influencer.followers_count < campaign.min_followers) {
    weaknesses.push('팔로워 수 부족')
  }
  
  // 추천 레벨 결정
  let recommendation = '재검토 필요'
  if (score >= 90) recommendation = '강력 추천'
  else if (score >= 80) recommendation = '추천'
  else if (score >= 70) recommendation = '적합'
  else if (score >= 60) recommendation = '고려 가능'
  
  // 예상 지표 계산
  const estimatedReach = Math.floor(influencer.followers_count * 0.3)
  const estimatedEngagement = Math.floor(
    influencer.followers_count * (influencer.engagement_rate / 100)
  )
  
  // 제안 예산 계산
  let suggestedBudget = 500000 // 기본 50만원
  
  if (influencer.followers_count > 500000) {
    suggestedBudget = 5000000 // 500만원
  } else if (influencer.followers_count > 100000) {
    suggestedBudget = 2000000 // 200만원
  } else if (influencer.followers_count > 50000) {
    suggestedBudget = 1000000 // 100만원
  } else if (influencer.followers_count > 10000) {
    suggestedBudget = 700000 // 70만원
  }
  
  // 티어별 보정
  if (influencer.tier === 'premium') {
    suggestedBudget = Math.round(suggestedBudget * 1.5)
  } else if (influencer.tier === 'gold') {
    suggestedBudget = Math.round(suggestedBudget * 1.2)
  }
  
  // 참여율 보정
  if (influencer.engagement_rate > 7) {
    suggestedBudget = Math.round(suggestedBudget * 1.2)
  } else if (influencer.engagement_rate > 5) {
    suggestedBudget = Math.round(suggestedBudget * 1.1)
  }
  
  return {
    score,
    strengths,
    weaknesses,
    recommendation,
    estimatedReach,
    estimatedEngagement,
    suggestedBudget
  }
}