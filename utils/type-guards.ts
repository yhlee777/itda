// utils/type-guards.ts
// 자동 생성된 타입 가드 유틸리티
import type { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']

// ========================================
// Null 안전 헬퍼 함수들
// ========================================

export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K]
): T[K] {
  return obj?.[key] ?? defaultValue
}

export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return arr ?? []
}

export function safeString(
  val: string | null | undefined, 
  defaultValue = ''
): string {
  return val ?? defaultValue
}

export function safeNumber(
  val: number | null | undefined, 
  defaultValue = 0
): number {
  return val ?? defaultValue
}

export function safeBoolean(
  val: boolean | null | undefined, 
  defaultValue = false
): boolean {
  return val ?? defaultValue
}

// ========================================
// Campaign 타입 가드
// ========================================

export function hasAdvertiser(
  campaign: Tables['campaigns']['Row']
): campaign is Tables['campaigns']['Row'] & { advertiser_id: string } {
  return campaign.advertiser_id !== null
}

export function isActiveCampaign(campaign: Tables['campaigns']['Row']): boolean {
  return campaign.status === 'active'
}

// ========================================
// User 타입 가드
// ========================================

export function isInfluencerUser(user: Tables['users']['Row'] | null): boolean {
  return user?.user_type === 'influencer'
}

export function isAdvertiserUser(user: Tables['users']['Row'] | null): boolean {
  return user?.user_type === 'advertiser'
}

// ========================================
// JSON 안전 파싱
// ========================================

export function safeJsonParse<T>(json: unknown, defaultValue: T): T {
  if (!json) return defaultValue
  try {
    return typeof json === 'string' ? JSON.parse(json) : json as T
  } catch {
    return defaultValue
  }
}

// ========================================
// Influencer 타입 가드
// ========================================

export function isVerifiedInfluencer(
  influencer: Tables['influencers']['Row']
): boolean {
  return influencer.is_verified === true
}

export function hasCategories(
  influencer: Tables['influencers']['Row']
): boolean {
  return Array.isArray(influencer.categories) && influencer.categories.length > 0
}
