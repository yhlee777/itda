// supabase/functions/ai-matching/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================
// AI 매칭 알고리즘 메인 함수
// ============================================
serve(async (req) => {
  try {
    const { campaignId, filters } = await req.json()
    
    // Supabase 클라이언트 초기화
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 1. 캠페인 정보 가져오기
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError) throw campaignError

    // 2. 인플루언서 프로필 가져오기
    let query = supabaseClient
      .from('influencers')
      .select('*')
      .eq('status', 'active')

    // 필터 적용
    if (filters?.categories?.length > 0) {
      query = query.contains('categories', filters.categories)
    }
    if (filters?.minFollowers) {
      query = query.gte('followers_count', filters.minFollowers)
    }
    if (filters?.minEngagement) {
      query = query.gte('engagement_rate', filters.minEngagement)
    }

    const { data: influencers, error: influencersError } = await query

    if (influencersError) throw influencersError

    // 3. AI 매칭 점수 계산
    const matchedInfluencers = influencers.map(influencer => {
      const matchScore = calculateMatchScore(campaign, influencer)
      return {
        ...influencer,
        matchScore,
        matchDetails: getMatchDetails(campaign, influencer, matchScore)
      }
    })

    // 4. 점수 순으로 정렬
    matchedInfluencers.sort((a, b) => b.matchScore - a.matchScore)

    // 5. 상위 20명만 반환
    const topMatches = matchedInfluencers.slice(0, 20)

    // 6. 매칭 기록 저장
    await saveMatchingHistory(supabaseClient, campaignId, topMatches)

    return new Response(
      JSON.stringify({
        success: true,
        campaign,
        matches: topMatches,
        totalAnalyzed: influencers.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

// ============================================
// AI 매칭 점수 계산 알고리즘
// ============================================
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
  const categoryScore = calculateCategoryMatch(campaign.categories, influencer.categories)
  score += categoryScore * weights.categoryMatch

  // 2. 오디언스 매칭 (25%)
  const audienceScore = calculateAudienceMatch(campaign.target_audience, influencer.audience_demographics)
  score += audienceScore * weights.audienceMatch

  // 3. 참여율 (20%)
  const engagementScore = calculateEngagementScore(influencer.engagement_rate, campaign.min_engagement_rate)
  score += engagementScore * weights.engagementRate

  // 4. 과거 성과 (15%)
  const performanceScore = calculatePastPerformance(influencer.past_campaigns)
  score += performanceScore * weights.pastPerformance

  // 5. 가용성 (10%)
  const availabilityScore = calculateAvailability(influencer.availability, campaign.start_date)
  score += availabilityScore * weights.availability

  // 보너스 점수
  score += calculateBonusPoints(campaign, influencer)

  return Math.min(100, Math.round(score))
}

// ============================================
// 세부 매칭 알고리즘
// ============================================

// 카테고리 매칭 계산
function calculateCategoryMatch(campaignCategories: string[], influencerCategories: string[]): number {
  if (!campaignCategories?.length || !influencerCategories?.length) return 0
  
  const matches = campaignCategories.filter(cat => 
    influencerCategories.includes(cat)
  )
  
  const baseScore = (matches.length / campaignCategories.length) * 0.7
  const bonusScore = matches.length > 0 ? 0.3 : 0
  
  return baseScore + bonusScore
}

// 오디언스 매칭 계산
function calculateAudienceMatch(targetAudience: AudienceData, influencerAudience: AudienceData): number {
  if (!targetAudience || !influencerAudience) return 0.5
  
  let matchScore = 0
  let factors = 0

  // 연령대 매칭
  if (targetAudience.age_range && influencerAudience.age_distribution) {
    const ageMatch = calculateAgeRangeMatch(
      targetAudience.age_range,
      influencerAudience.age_distribution
    )
    matchScore += ageMatch
    factors++
  }

  // 성별 매칭
  if (targetAudience.gender && influencerAudience.gender_distribution) {
    const genderMatch = calculateGenderMatch(
      targetAudience.gender,
      influencerAudience.gender_distribution
    )
    matchScore += genderMatch
    factors++
  }

  // 지역 매칭
  if (targetAudience.location && influencerAudience.location_distribution) {
    const locationMatch = calculateLocationMatch(
      targetAudience.location,
      influencerAudience.location_distribution
    )
    matchScore += locationMatch
    factors++
  }

  return factors > 0 ? matchScore / factors : 0.5
}

// 참여율 점수 계산
function calculateEngagementScore(influencerRate: number, minRate: number): number {
  if (!influencerRate) return 0
  if (!minRate) return 0.7 // 최소 요구사항이 없으면 기본 점수
  
  if (influencerRate >= minRate * 1.5) return 1 // 150% 이상이면 만점
  if (influencerRate >= minRate) return 0.8
  if (influencerRate >= minRate * 0.8) return 0.6
  return 0.3
}

// 과거 성과 계산
function calculatePastPerformance(pastCampaigns: PastCampaign[]): number {
  if (!pastCampaigns?.length) return 0.5 // 신규 인플루언서
  
  const recentCampaigns = pastCampaigns.slice(-5) // 최근 5개 캠페인
  
  let totalScore = 0
  recentCampaigns.forEach(campaign => {
    let campaignScore = 0
    
    // ROI 기준
    if (campaign.roi >= 300) campaignScore += 0.4
    else if (campaign.roi >= 200) campaignScore += 0.3
    else if (campaign.roi >= 100) campaignScore += 0.2
    else campaignScore += 0.1
    
    // 완료율 기준
    if (campaign.completion_rate >= 100) campaignScore += 0.3
    else if (campaign.completion_rate >= 90) campaignScore += 0.25
    else if (campaign.completion_rate >= 80) campaignScore += 0.2
    else campaignScore += 0.1
    
    // 평점 기준
    if (campaign.rating >= 4.5) campaignScore += 0.3
    else if (campaign.rating >= 4) campaignScore += 0.25
    else if (campaign.rating >= 3.5) campaignScore += 0.2
    else campaignScore += 0.1
    
    totalScore += campaignScore
  })
  
  return totalScore / recentCampaigns.length
}

// 가용성 계산
function calculateAvailability(availability: AvailabilityData, campaignStartDate: string): number {
  if (!availability) return 0.5
  
  const startDate = new Date(campaignStartDate)
  const now = new Date()
  const daysUntilStart = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  // 즉시 가능
  if (availability.status === 'immediate') return 1
  
  // 예약 가능 날짜 체크
  if (availability.available_from) {
    const availableDate = new Date(availability.available_from)
    const daysUntilAvailable = Math.floor((availableDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilAvailable <= daysUntilStart) return 0.8
    if (daysUntilAvailable <= daysUntilStart + 7) return 0.6
    return 0.3
  }
  
  return 0.5
}

// 보너스 포인트 계산
function calculateBonusPoints(campaign: Campaign, influencer: Influencer): number {
  let bonus = 0
  
  // 검증된 계정
  if (influencer.is_verified) bonus += 3
  
  // 프리미엄 인플루언서
  if (influencer.tier === 'premium') bonus += 2
  else if (influencer.tier === 'gold') bonus += 1
  
  // 브랜드와 이전 협업 경험
  if (influencer.worked_with_brands?.includes(campaign.brand_id)) bonus += 5
  
  // 급성장 중인 인플루언서
  if (influencer.growth_rate > 20) bonus += 2
  
  // 콘텐츠 품질 점수
  if (influencer.content_quality_score >= 9) bonus += 3
  else if (influencer.content_quality_score >= 8) bonus += 2
  else if (influencer.content_quality_score >= 7) bonus += 1
  
  return bonus
}

// ============================================
// 헬퍼 함수들
// ============================================

function calculateAgeRangeMatch(targetRange: string, distribution: AgeDistribution): number {
  // 연령대 매칭 로직
  const targetAges = parseAgeRange(targetRange)
  let matchPercentage = 0
  
  Object.entries(distribution).forEach(([ageRange, percentage]) => {
    const ages = parseAgeRange(ageRange)
    if (hasOverlap(targetAges, ages)) {
      matchPercentage += percentage
    }
  })
  
  return Math.min(1, matchPercentage / 100)
}

function calculateGenderMatch(targetGender: string, distribution: GenderDistribution): number {
  if (targetGender === 'all') return 1
  
  if (targetGender === 'male') return distribution.male / 100
  if (targetGender === 'female') return distribution.female / 100
  
  return 0.5
}

function calculateLocationMatch(targetLocations: string[], distribution: LocationDistribution): number {
  let matchPercentage = 0
  
  targetLocations.forEach(location => {
    if (distribution[location]) {
      matchPercentage += distribution[location]
    }
  })
  
  return Math.min(1, matchPercentage / 100)
}

function parseAgeRange(range: string): { min: number; max: number } {
  // "20-30" -> { min: 20, max: 30 }
  const parts = range.split('-').map(s => parseInt(s.trim()))
  return { min: parts[0], max: parts[1] || 100 }
}

function hasOverlap(range1: { min: number; max: number }, range2: { min: number; max: number }): boolean {
  return range1.min <= range2.max && range2.min <= range1.max
}

// 매칭 상세 정보 생성
function getMatchDetails(campaign: Campaign, influencer: Influencer, score: number): MatchDetails {
  return {
    score,
    strengths: getStrengths(campaign, influencer),
    weaknesses: getWeaknesses(campaign, influencer),
    recommendation: getRecommendation(score),
    estimatedReach: calculateEstimatedReach(influencer),
    estimatedEngagement: calculateEstimatedEngagement(influencer),
    suggestedBudget: calculateSuggestedBudget(influencer, campaign)
  }
}

function getStrengths(campaign: Campaign, influencer: Influencer): string[] {
  const strengths = []
  
  if (influencer.engagement_rate > 5) {
    strengths.push('높은 참여율')
  }
  if (influencer.is_verified) {
    strengths.push('인증된 계정')
  }
  if (influencer.content_quality_score >= 8) {
    strengths.push('우수한 콘텐츠 품질')
  }
  
  // 카테고리 일치
  const categoryMatches = campaign.categories?.filter(cat => 
    influencer.categories?.includes(cat)
  )
  if (categoryMatches?.length > 0) {
    strengths.push(`${categoryMatches.join(', ')} 전문`)
  }
  
  return strengths
}

function getWeaknesses(campaign: Campaign, influencer: Influencer): string[] {
  const weaknesses = []
  
  if (influencer.engagement_rate < campaign.min_engagement_rate) {
    weaknesses.push('목표 참여율 미달')
  }
  if (influencer.followers_count < campaign.min_followers) {
    weaknesses.push('팔로워 수 부족')
  }
  if (!influencer.availability || influencer.availability.status !== 'immediate') {
    weaknesses.push('즉시 시작 불가')
  }
  
  return weaknesses
}

function getRecommendation(score: number): string {
  if (score >= 90) return '강력 추천'
  if (score >= 80) return '추천'
  if (score >= 70) return '적합'
  if (score >= 60) return '고려 가능'
  return '재검토 필요'
}

function calculateEstimatedReach(influencer: Influencer): number {
  // 평균 도달률 계산 (팔로워의 30-50%)
  const reachRate = 0.3 + (influencer.engagement_rate / 100) * 0.2
  return Math.floor(influencer.followers_count * reachRate)
}

function calculateEstimatedEngagement(influencer: Influencer): number {
  return Math.floor(influencer.followers_count * (influencer.engagement_rate / 100))
}

function calculateSuggestedBudget(influencer: Influencer, campaign: Campaign): number {
  let baseBudget = 0
  
  // 팔로워 수 기준
  if (influencer.followers_count < 10000) baseBudget = 500000
  else if (influencer.followers_count < 50000) baseBudget = 1000000
  else if (influencer.followers_count < 100000) baseBudget = 2000000
  else if (influencer.followers_count < 500000) baseBudget = 5000000
  else baseBudget = 10000000
  
  // 참여율 보정
  const engagementMultiplier = 1 + (influencer.engagement_rate - 3) * 0.1
  
  // 티어 보정
  let tierMultiplier = 1
  if (influencer.tier === 'premium') tierMultiplier = 1.5
  else if (influencer.tier === 'gold') tierMultiplier = 1.2
  
  return Math.floor(baseBudget * engagementMultiplier * tierMultiplier)
}

// 매칭 히스토리 저장
async function saveMatchingHistory(supabase: any, campaignId: string, matches: any[]) {
  const history = {
    campaign_id: campaignId,
    matched_influencers: matches.map(m => ({
      influencer_id: m.id,
      match_score: m.matchScore,
      match_details: m.matchDetails
    })),
    created_at: new Date().toISOString()
  }
  
  await supabase.from('matching_history').insert(history)
}

// ============================================
// 타입 정의
// ============================================

interface Campaign {
  id: string
  brand_id: string
  name: string
  categories: string[]
  target_audience: AudienceData
  min_engagement_rate: number
  min_followers: number
  start_date: string
  budget: number
  objectives: string[]
}

interface Influencer {
  id: string
  name: string
  categories: string[]
  followers_count: number
  engagement_rate: number
  audience_demographics: AudienceData
  past_campaigns: PastCampaign[]
  availability: AvailabilityData
  is_verified: boolean
  tier: 'standard' | 'gold' | 'premium'
  worked_with_brands?: string[]
  growth_rate: number
  content_quality_score: number
}

interface AudienceData {
  age_range?: string
  age_distribution?: AgeDistribution
  gender?: string
  gender_distribution?: GenderDistribution
  location?: string[]
  location_distribution?: LocationDistribution
  interests?: string[]
}

interface AgeDistribution {
  [ageRange: string]: number // e.g., "18-24": 35
}

interface GenderDistribution {
  male: number
  female: number
  other?: number
}

interface LocationDistribution {
  [location: string]: number // e.g., "Seoul": 45
}

interface PastCampaign {
  campaign_id: string
  roi: number
  completion_rate: number
  rating: number
  date: string
}

interface AvailabilityData {
  status: 'immediate' | 'scheduled' | 'busy'
  available_from?: string
  blackout_dates?: string[]
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