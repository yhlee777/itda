// utils/type-guards.ts
// 타입 가드와 null 안전 유틸리티 함수들

import type { 
  User, 
  Campaign, 
  Influencer, 
  Advertiser 
} from '@/types/helpers'
import type { Database } from '@/types/database.types'

// ========================================
// User 타입 가드
// ========================================

export function isInfluencerUser(user: User | null): boolean {
  return user?.user_type === 'influencer'
}

export function isAdvertiserUser(user: User | null): boolean {
  return user?.user_type === 'advertiser'
}

export function isAdminUser(user: User | null): boolean {
  return user?.user_type === 'admin'
}

// ========================================
// Campaign 타입 가드
// ========================================

// ⚠️ 중요: advertiser_id null 체크
export function hasAdvertiser(
  campaign: Campaign
): campaign is Campaign & { advertiser_id: string } {
  return campaign.advertiser_id !== null
}

export function isActiveCampaign(campaign: Campaign): boolean {
  return campaign.status === 'active'
}

export function isPremiumCampaign(campaign: Campaign): boolean {
  return campaign.is_premium === true
}

export function isUrgentCampaign(campaign: Campaign): boolean {
  return campaign.urgency === 'high'
}

// ========================================
// Influencer 타입 가드
// ========================================

export function isVerifiedInfluencer(influencer: Influencer): boolean {
  return influencer.is_verified === true
}

export function hasCategories(influencer: Influencer): boolean {
  return influencer.categories !== null && influencer.categories.length > 0
}

// ========================================
// Null 안전 유틸리티 함수들
// ========================================

// 객체 속성 안전하게 가져오기
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K]
): T[K] {
  return obj?.[key] ?? defaultValue
}

// 배열 안전 처리
export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return arr ?? []
}

// 숫자 안전 처리
export function safeNumber(
  val: number | null | undefined, 
  defaultValue = 0
): number {
  return val ?? defaultValue
}

// 문자열 안전 처리
export function safeString(
  val: string | null | undefined, 
  defaultValue = ''
): string {
  return val ?? defaultValue
}

// 불린 안전 처리
export function safeBoolean(
  val: boolean | null | undefined, 
  defaultValue = false
): boolean {
  return val ?? defaultValue
}

// ========================================
// JSON 타입 안전 처리
// ========================================

type Json = Database['public']['Tables']['campaigns']['Row']['metadata']

export function parseJsonSafe<T>(
  json: Json | null, 
  defaultValue: T
): T {
  if (!json) return defaultValue
  
  try {
    if (typeof json === 'string') {
      return JSON.parse(json) as T
    }
    return json as T
  } catch {
    return defaultValue
  }
}

// ========================================
// 날짜 유틸리티
// ========================================

export function isExpired(dateString: string | null): boolean {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

export function daysUntil(dateString: string | null): number {
  if (!dateString) return 0
  const diff = new Date(dateString).getTime() - new Date().getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

// ========================================
// 가격 포맷팅
// ========================================

export function formatPrice(price: number | null): string {
  if (!price) return '0원'
  return `${price.toLocaleString('ko-KR')}원`
}

export function formatFollowers(count: number | null): string {
  if (!count) return '0'
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

// ========================================
// 실제 사용 예시
// ========================================

/*
사용 예시:

import { hasAdvertiser, safeArray, formatPrice } from '@/utils/type-guards'

// 1. Campaign advertiser_id null 체크
const campaign = await getCampaign(id)
if (hasAdvertiser(campaign)) {
  // 이제 campaign.advertiser_id는 string 타입!
  await sendNotification(campaign.advertiser_id, ...)
}

// 2. 배열 안전 처리
const categories = safeArray(campaign.categories)
categories.map(cat => ...) // null 에러 없음!

// 3. 가격 포맷팅
const price = formatPrice(campaign.budget) // "1,000,000원"

// 4. JSON 파싱
interface Metadata {
  tags: string[]
}
const metadata = parseJsonSafe<Metadata>(
  campaign.metadata, 
  { tags: [] }
)
*/