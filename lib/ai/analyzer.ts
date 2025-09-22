// lib/ai/analyzer.ts
import { InfluencerProfile, CampaignData, AnalysisResult } from '@/types';

export class AIAnalyzer {
  /**
   * 인플루언서 단가 예측
   * 팔로워, 참여율, 카테고리, 과거 성과 등을 종합 분석
   */
  static predictPricing(influencer: InfluencerProfile): {
    recommended: number;
    min: number;
    max: number;
    factors: Array<{ factor: string; impact: number; description: string }>;
  } {
    const basePrice = 100000; // 기본 단가 10만원
    let multiplier = 1;
    const factors = [];

    // 팔로워 수 계산 (로그 스케일 적용)
    const followerScore = Math.log10(influencer.followers || 1000) / 6; // 1M followers = 1.0
    multiplier *= (1 + followerScore * 2);
    factors.push({
      factor: '팔로워 수',
      impact: followerScore * 100,
      description: `${(influencer.followers || 0).toLocaleString()}명의 팔로워`
    });

    // 참여율 계산 (업계 평균 3% 기준)
    const engagementRate = influencer.engagementRate || 3;
    const engagementScore = engagementRate / 3;
    multiplier *= (1 + (engagementScore - 1) * 0.5);
    factors.push({
      factor: '참여율',
      impact: (engagementScore - 1) * 50,
      description: `${engagementRate}% (업계 평균 대비 ${engagementScore > 1 ? '+' : ''}${((engagementScore - 1) * 100).toFixed(0)}%)`
    });

    // 카테고리별 가중치
    const categoryWeights: Record<string, number> = {
      '뷰티': 1.3,
      '패션': 1.2,
      '테크': 1.4,
      '여행': 1.1,
      '음식': 1.0,
      '라이프': 0.9,
      '피트니스': 1.15,
      '게임': 1.25
    };
    
    const categoryWeight = categoryWeights[influencer.primaryCategory] || 1.0;
    multiplier *= categoryWeight;
    factors.push({
      factor: '카테고리',
      impact: (categoryWeight - 1) * 100,
      description: `${influencer.primaryCategory} 카테고리 시장 수요`
    });

    // 과거 캠페인 성과
    if (influencer.completedCampaigns && influencer.avgRating) {
      const performanceScore = influencer.avgRating / 5;
      multiplier *= (1 + (performanceScore - 0.8) * 0.3);
      factors.push({
        factor: '과거 성과',
        impact: (performanceScore - 0.8) * 30,
        description: `평균 평점 ${influencer.avgRating}/5 (${influencer.completedCampaigns}개 캠페인)`
      });
    }

    // 콘텐츠 퀄리티 점수 (가상 AI 분석)
    const qualityScore = this.calculateContentQuality(influencer);
    multiplier *= (1 + (qualityScore - 0.7) * 0.4);
    factors.push({
      factor: '콘텐츠 품질',
      impact: (qualityScore - 0.7) * 40,
      description: `AI 품질 점수 ${(qualityScore * 100).toFixed(0)}/100`
    });

    const recommendedPrice = Math.round(basePrice * multiplier / 10000) * 10000;
    
    return {
      recommended: recommendedPrice,
      min: Math.round(recommendedPrice * 0.8),
      max: Math.round(recommendedPrice * 1.3),
      factors: factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    };
  }

  /**
   * 캠페인-인플루언서 매칭 점수 계산
   */
  static calculateMatchScore(
    campaign: CampaignData,
    influencer: InfluencerProfile
  ): {
    score: number;
    reasons: string[];
    strengths: string[];
    concerns: string[];
  } {
    let score = 50; // 기본 점수
    const reasons = [];
    const strengths = [];
    const concerns = [];

    // 카테고리 매칭
    if (campaign.categories.includes(influencer.primaryCategory)) {
      score += 20;
      strengths.push('카테고리 완벽 매칭');
    } else if (campaign.categories.some(c => influencer.categories?.includes(c))) {
      score += 10;
      strengths.push('서브 카테고리 매칭');
    } else {
      concerns.push('카테고리 불일치');
    }

    // 타겟 오디언스 연령대 매칭
    const audienceMatch = this.calculateAudienceMatch(
      campaign.targetAgeRange,
      influencer.audienceAgeRange
    );
    score += audienceMatch * 15;
    if (audienceMatch > 0.7) {
      strengths.push(`오디언스 연령대 ${(audienceMatch * 100).toFixed(0)}% 일치`);
    } else if (audienceMatch < 0.3) {
      concerns.push('타겟 연령대 불일치');
    }

    // 예산 적합성
    const pricing = this.predictPricing(influencer);
    if (campaign.budget >= pricing.recommended * 0.9 && 
        campaign.budget <= pricing.recommended * 1.5) {
      score += 15;
      strengths.push('예산 범위 적합');
    } else if (campaign.budget < pricing.recommended * 0.5) {
      score -= 10;
      concerns.push('예산 부족');
    }

    // 참여율 기준
    if (influencer.engagementRate >= campaign.minEngagementRate) {
      score += 10;
      strengths.push(`높은 참여율 (${influencer.engagementRate}%)`);
    } else {
      score -= 5;
      concerns.push(`참여율 미달 (기준: ${campaign.minEngagementRate}%)`);
    }

    // 지역 매칭 (선택사항)
    if (campaign.location && influencer.location === campaign.location) {
      score += 5;
      reasons.push('지역 매칭');
    }

    // 과거 브랜드 경험
    if (influencer.brandHistory?.includes(campaign.brandCategory)) {
      score += 10;
      strengths.push('유사 브랜드 경험 보유');
    }

    // 최종 점수 정규화 (0-100)
    score = Math.max(0, Math.min(100, score));

    // 점수에 따른 추천 이유 생성
    if (score >= 80) {
      reasons.push('🔥 완벽한 매칭! 강력 추천');
    } else if (score >= 60) {
      reasons.push('👍 좋은 매칭 - 추천');
    } else if (score >= 40) {
      reasons.push('🤔 고려 가능한 매칭');
    } else {
      reasons.push('⚠️ 매칭도 낮음');
    }

    return { score, reasons, strengths, concerns };
  }

  /**
   * 인플루언서 리스트 AI 추천 및 정렬
   */
  static recommendInfluencers(
    campaign: CampaignData,
    candidates: InfluencerProfile[],
    options: {
      maxResults?: number;
      minScore?: number;
      priorityFactors?: Array<'price' | 'engagement' | 'experience' | 'audience'>;
    } = {}
  ): AnalysisResult[] {
    const { maxResults = 10, minScore = 60, priorityFactors = ['engagement', 'experience'] } = options;

    // 각 인플루언서에 대한 분석
    const analyses = candidates.map(influencer => {
      const matchResult = this.calculateMatchScore(campaign, influencer);
      const pricing = this.predictPricing(influencer);
      
      // 우선순위 요소에 따른 추가 점수
      let priorityBonus = 0;
      if (priorityFactors.includes('price') && pricing.recommended <= campaign.budget) {
        priorityBonus += 5;
      }
      if (priorityFactors.includes('engagement') && influencer.engagementRate > 5) {
        priorityBonus += 5;
      }
      if (priorityFactors.includes('experience') && influencer.completedCampaigns > 10) {
        priorityBonus += 5;
      }
      if (priorityFactors.includes('audience') && this.calculateAudienceQuality(influencer) > 0.8) {
        priorityBonus += 5;
      }

      const finalScore = Math.min(100, matchResult.score + priorityBonus);

      return {
        influencer,
        matchScore: finalScore,
        pricing,
        analysis: matchResult,
        recommendation: this.generateRecommendation(finalScore, matchResult, pricing, campaign)
      };
    });

    // 점수순 정렬 및 필터링
    return analyses
      .filter(a => a.matchScore >= minScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults);
  }

  /**
   * 콘텐츠 품질 점수 계산 (모의 AI 분석)
   */
  private static calculateContentQuality(influencer: InfluencerProfile): number {
    let quality = 0.7; // 기본 품질 점수

    // 참여율 기반
    if (influencer.engagementRate > 5) quality += 0.1;
    if (influencer.engagementRate > 10) quality += 0.1;

    // 완료 캠페인 수 기반
    if (influencer.completedCampaigns > 5) quality += 0.05;
    if (influencer.completedCampaigns > 20) quality += 0.05;

    // 평점 기반
    if (influencer.avgRating >= 4.5) quality += 0.1;

    return Math.min(1.0, quality);
  }

  /**
   * 오디언스 매칭도 계산
   */
  private static calculateAudienceMatch(
    targetRange: [number, number],
    audienceRange?: [number, number]
  ): number {
    if (!audienceRange) return 0.5; // 정보 없으면 중간값

    const overlap = Math.min(targetRange[1], audienceRange[1]) - 
                   Math.max(targetRange[0], audienceRange[0]);
    const targetSize = targetRange[1] - targetRange[0];
    
    return Math.max(0, Math.min(1, overlap / targetSize));
  }

  /**
   * 오디언스 품질 점수
   */
  private static calculateAudienceQuality(influencer: InfluencerProfile): number {
    let quality = 0.5;

    // 실제 팔로워 비율 (가짜 팔로워 제외)
    if (influencer.realFollowerRatio) {
      quality = influencer.realFollowerRatio;
    }

    // 참여율로 보정
    if (influencer.engagementRate > 3) {
      quality = Math.min(1.0, quality + 0.2);
    }

    return quality;
  }

  /**
   * AI 추천 문구 생성
   */
  private static generateRecommendation(
    score: number,
    matchResult: any,
    pricing: any,
    campaign: CampaignData
  ): string {
    if (score >= 90) {
      return `🏆 최고의 선택! ${matchResult.strengths[0]}. 예상 ROI가 매우 높습니다.`;
    } else if (score >= 80) {
      return `✨ 적극 추천! ${matchResult.strengths.slice(0, 2).join(', ')}. 캠페인 목표 달성 가능성 높음.`;
    } else if (score >= 70) {
      return `👍 추천 대상. ${matchResult.strengths[0]}. ${matchResult.concerns[0] ? `단, ${matchResult.concerns[0]}` : '안정적인 선택'}.`;
    } else if (score >= 60) {
      return `🤔 검토 필요. ${matchResult.strengths[0] || '기본 조건 충족'}. ${matchResult.concerns.slice(0, 2).join(', ')}.`;
    } else {
      return `⚠️ 신중한 검토 필요. ${matchResult.concerns.join(', ')}.`;
    }
  }
}

// TypeScript 타입 정의
export interface InfluencerProfile {
  id: string;
  name: string;
  followers: number;
  engagementRate: number;
  primaryCategory: string;
  categories?: string[];
  completedCampaigns?: number;
  avgRating?: number;
  audienceAgeRange?: [number, number];
  location?: string;
  brandHistory?: string[];
  realFollowerRatio?: number;
}

export interface CampaignData {
  id: string;
  name: string;
  budget: number;
  categories: string[];
  targetAgeRange: [number, number];
  minEngagementRate: number;
  location?: string;
  brandCategory?: string;
}

export interface AnalysisResult {
  influencer: InfluencerProfile;
  matchScore: number;
  pricing: any;
  analysis: any;
  recommendation: string;
}