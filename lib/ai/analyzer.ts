// lib/ai/analyzer.ts
import { createClient } from '@/lib/supabase/client';

export interface InfluencerProfile {
  id: string;
  name: string;
  followers: number;
  engagementRate: number;
  primaryCategory: string;
  completedCampaigns?: number;
  avgRating?: number;
  demographics?: {
    gender: { male: number; female: number };
    age: { [key: string]: number };
    location: { [key: string]: number };
  };
}

export interface CampaignData {
  id: string;
  name: string;
  budget: number;
  categories: string[];
  requirements: string[];
  targetAudience?: any;
}

export interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  predictedPerformance: {
    reach: number;
    engagement: number;
    conversions: number;
    roi: number;
  };
}

export class AIAnalyzer {
  private static supabase = createClient();

  /**
   * 인플루언서 분석
   */
  static analyzeInfluencer(profile: InfluencerProfile): AnalysisResult {
    const score = this.calculateScore(profile);
    const strengths = this.identifyStrengths(profile);
    const weaknesses = this.identifyWeaknesses(profile);
    const recommendations = this.generateRecommendations(profile);
    const predictedPerformance = this.predictPerformance(profile);

    return {
      score,
      strengths,
      weaknesses,
      recommendations,
      predictedPerformance
    };
  }

  /**
   * 캠페인-인플루언서 매칭 점수 계산
   */
  static calculateMatchScore(
    influencer: InfluencerProfile,
    campaign: CampaignData
  ): number {
    let score = 50; // 기본 점수

    // 카테고리 일치도
    if (campaign.categories.includes(influencer.primaryCategory)) {
      score += 20;
    }

    // 참여율 점수
    if (influencer.engagementRate > 5) score += 15;
    else if (influencer.engagementRate > 3) score += 10;
    else if (influencer.engagementRate > 2) score += 5;

    // 경험 점수
    if (influencer.completedCampaigns && influencer.completedCampaigns > 10) {
      score += 10;
    }

    // 평점 점수
    if (influencer.avgRating && influencer.avgRating > 4.5) {
      score += 5;
    }

    return Math.min(100, score);
  }

  private static calculateScore(profile: InfluencerProfile): number {
    let score = 0;

    // 팔로워 점수 (최대 30점)
    if (profile.followers > 100000) score += 30;
    else if (profile.followers > 50000) score += 25;
    else if (profile.followers > 10000) score += 20;
    else if (profile.followers > 5000) score += 15;
    else score += 10;

    // 참여율 점수 (최대 40점)
    const engagementScore = Math.min(40, profile.engagementRate * 8);
    score += engagementScore;

    // 경험 점수 (최대 20점)
    if (profile.completedCampaigns) {
      score += Math.min(20, profile.completedCampaigns);
    }

    // 평점 점수 (최대 10점)
    if (profile.avgRating) {
      score += profile.avgRating * 2;
    }

    return Math.round(score);
  }

  private static identifyStrengths(profile: InfluencerProfile): string[] {
    const strengths: string[] = [];

    if (profile.engagementRate > 5) {
      strengths.push('매우 높은 참여율');
    } else if (profile.engagementRate > 3) {
      strengths.push('평균 이상의 참여율');
    }

    if (profile.followers > 100000) {
      strengths.push('대규모 팔로워 보유');
    } else if (profile.followers > 50000) {
      strengths.push('중규모 팔로워 보유');
    }

    if (profile.completedCampaigns && profile.completedCampaigns > 20) {
      strengths.push('풍부한 캠페인 경험');
    }

    if (profile.avgRating && profile.avgRating >= 4.5) {
      strengths.push('우수한 평점');
    }

    return strengths;
  }

  private static identifyWeaknesses(profile: InfluencerProfile): string[] {
    const weaknesses: string[] = [];

    if (profile.engagementRate < 2) {
      weaknesses.push('낮은 참여율');
    }

    if (profile.followers < 5000) {
      weaknesses.push('소규모 팔로워');
    }

    if (!profile.completedCampaigns || profile.completedCampaigns < 5) {
      weaknesses.push('캠페인 경험 부족');
    }

    if (profile.avgRating && profile.avgRating < 3.5) {
      weaknesses.push('개선 필요한 평점');
    }

    return weaknesses;
  }

  private static generateRecommendations(profile: InfluencerProfile): string[] {
    const recommendations: string[] = [];

    if (profile.engagementRate < 3) {
      recommendations.push('참여율 향상을 위한 콘텐츠 전략 개선 필요');
    }

    if (profile.followers < 10000) {
      recommendations.push('팔로워 성장 전략 수립 권장');
    }

    if (!profile.completedCampaigns || profile.completedCampaigns < 10) {
      recommendations.push('더 많은 캠페인 경험 축적 필요');
    }

    if (profile.avgRating && profile.avgRating < 4) {
      recommendations.push('서비스 품질 개선 필요');
    }

    return recommendations;
  }

  private static predictPerformance(profile: InfluencerProfile): {
    reach: number;
    engagement: number;
    conversions: number;
    roi: number;
  } {
    // 도달률: 팔로워의 30-50%
    const reach = Math.floor(profile.followers * 0.4);
    
    // 참여: 도달 * 참여율
    const engagement = Math.floor(reach * (profile.engagementRate / 100));
    
    // 전환: 참여의 2-5%
    const conversions = Math.floor(engagement * 0.03);
    
    // ROI: 간단한 계산
    const roi = Math.round((conversions * 50000) / (profile.followers * 10) * 100);

    return {
      reach,
      engagement,
      conversions,
      roi
    };
  }
}