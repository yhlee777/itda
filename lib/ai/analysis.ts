// lib/ai/analysis.ts
// AI 분석 및 가격 예측 시스템

interface InfluencerProfile {
  followers_count: number;
  engagement_rate: number;
  average_likes: number;
  average_comments: number;
  categories: string[];
  tier: 'standard' | 'gold' | 'premium';
  total_campaigns: number;
  average_rating: number;
  growth_rate: number;
  audience_demographics: {
    age_distribution: Record<string, number>;
    gender_distribution: { male: number; female: number };
    location_distribution: Record<string, number>;
  };
}

interface Campaign {
  budget: number;
  categories: string[];
  target_audience: any;
  deliverables: any[];
  duration: number; // days
}

export class AIAnalyzer {
  // 단가 예측 알고리즘
  static predictPrice(influencer: InfluencerProfile, campaign: Campaign): {
    recommended: number;
    min: number;
    max: number;
    confidence: number;
    factors: string[];
  } {
    // 기본 단가 계산 (팔로워 기반)
    let basePrice = 0;
    const followers = influencer.followers_count;
    
    if (followers < 10000) {
      basePrice = followers * 50; // 팔로워당 50원
    } else if (followers < 50000) {
      basePrice = 500000 + (followers - 10000) * 30; // 팔로워당 30원
    } else if (followers < 100000) {
      basePrice = 1700000 + (followers - 50000) * 20; // 팔로워당 20원
    } else {
      basePrice = 2700000 + (followers - 100000) * 10; // 팔로워당 10원
    }

    // 참여율 가중치 (매우 중요)
    const engagementMultiplier = this.getEngagementMultiplier(influencer.engagement_rate);
    basePrice *= engagementMultiplier;

    // 카테고리 매칭 가중치
    const categoryMatch = this.calculateCategoryMatch(influencer.categories, campaign.categories);
    basePrice *= (1 + categoryMatch * 0.2); // 최대 20% 증가

    // 경험치 가중치
    const experienceMultiplier = this.getExperienceMultiplier(
      influencer.total_campaigns,
      influencer.average_rating
    );
    basePrice *= experienceMultiplier;

    // 콘텐츠 수량 조정
    const contentMultiplier = this.calculateContentMultiplier(campaign.deliverables);
    basePrice *= contentMultiplier;

    // 긴급도 조정
    if (campaign.duration < 7) {
      basePrice *= 1.3; // 긴급 캠페인 30% 추가
    } else if (campaign.duration < 14) {
      basePrice *= 1.15; // 급한 캠페인 15% 추가
    }

    // 최종 가격 범위 계산
    const recommended = Math.round(basePrice / 10000) * 10000; // 만원 단위 반올림
    const min = Math.round(recommended * 0.8);
    const max = Math.round(recommended * 1.3);

    // 신뢰도 계산
    const confidence = this.calculateConfidence(influencer, campaign);

    // 주요 가격 결정 요인
    const factors = this.getPriceFactors(influencer, campaign, {
      basePrice,
      engagementMultiplier,
      categoryMatch,
      experienceMultiplier,
      contentMultiplier
    });

    return { recommended, min, max, confidence, factors };
  }

  // 매칭 점수 계산
  static calculateMatchScore(influencer: InfluencerProfile, campaign: Campaign): {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: 'highly_recommended' | 'recommended' | 'possible' | 'not_recommended';
  } {
    let score = 50; // 기본 점수
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // 카테고리 매칭
    const categoryMatch = this.calculateCategoryMatch(influencer.categories, campaign.categories);
    score += categoryMatch * 20;
    if (categoryMatch > 0.7) {
      strengths.push('카테고리 완벽 매칭');
    } else if (categoryMatch < 0.3) {
      weaknesses.push('카테고리 불일치');
    }

    // 참여율 평가
    if (influencer.engagement_rate > 5) {
      score += 15;
      strengths.push('매우 높은 참여율');
    } else if (influencer.engagement_rate > 3) {
      score += 10;
      strengths.push('높은 참여율');
    } else if (influencer.engagement_rate < 1) {
      score -= 10;
      weaknesses.push('낮은 참여율');
    }

    // 오디언스 매칭
    const audienceMatch = this.calculateAudienceMatch(
      influencer.audience_demographics,
      campaign.target_audience
    );
    score += audienceMatch * 15;
    if (audienceMatch > 0.7) {
      strengths.push('타겟 오디언스 일치');
    }

    // 성장률 평가
    if (influencer.growth_rate > 10) {
      score += 5;
      strengths.push('빠른 성장세');
    } else if (influencer.growth_rate < -5) {
      score -= 5;
      weaknesses.push('팔로워 감소 추세');
    }

    // 경험 평가
    if (influencer.total_campaigns > 20 && influencer.average_rating > 4.5) {
      score += 10;
      strengths.push('풍부한 경험과 높은 평점');
    } else if (influencer.total_campaigns < 3) {
      weaknesses.push('캠페인 경험 부족');
    }

    // 최종 점수 정규화 (0-100)
    score = Math.max(0, Math.min(100, score));

    // 추천 레벨 결정
    let recommendation: 'highly_recommended' | 'recommended' | 'possible' | 'not_recommended';
    if (score >= 85) {
      recommendation = 'highly_recommended';
    } else if (score >= 70) {
      recommendation = 'recommended';
    } else if (score >= 50) {
      recommendation = 'possible';
    } else {
      recommendation = 'not_recommended';
    }

    return { score, strengths, weaknesses, recommendation };
  }

  // 성과 예측
  static predictPerformance(influencer: InfluencerProfile, campaign: Campaign): {
    estimated_reach: number;
    estimated_impressions: number;
    estimated_engagement: number;
    estimated_clicks: number;
    estimated_conversions: number;
    roi_prediction: number;
  } {
    const reach = Math.floor(influencer.followers_count * 0.3); // 평균 30% 도달
    const impressions = Math.floor(reach * 2.5); // 평균 2.5회 노출
    const engagement = Math.floor(reach * (influencer.engagement_rate / 100));
    const clicks = Math.floor(engagement * 0.15); // 참여의 15%가 클릭
    const conversions = Math.floor(clicks * 0.02); // 클릭의 2%가 전환
    
    // ROI 예측 (매우 단순화된 모델)
    const estimatedRevenue = conversions * 50000; // 전환당 평균 매출 5만원 가정
    const roi_prediction = (estimatedRevenue / campaign.budget) * 100;

    return {
      estimated_reach: reach,
      estimated_impressions: impressions,
      estimated_engagement: engagement,
      estimated_clicks: clicks,
      estimated_conversions: conversions,
      roi_prediction: Math.round(roi_prediction)
    };
  }

  // Helper 메소드들
  private static getEngagementMultiplier(rate: number): number {
    if (rate > 7) return 1.5;
    if (rate > 5) return 1.3;
    if (rate > 3) return 1.1;
    if (rate > 2) return 1.0;
    if (rate > 1) return 0.9;
    return 0.7;
  }

  private static getExperienceMultiplier(campaigns: number, rating: number): number {
    if (campaigns > 50 && rating > 4.5) return 1.3;
    if (campaigns > 20 && rating > 4.0) return 1.15;
    if (campaigns > 10 && rating > 3.5) return 1.0;
    if (campaigns < 5) return 0.85;
    return 1.0;
  }

  private static calculateContentMultiplier(deliverables: any[]): number {
    let multiplier = 0;
    deliverables.forEach(item => {
      if (item.type === 'feed_post') multiplier += 0.3;
      if (item.type === 'story') multiplier += 0.1;
      if (item.type === 'reels') multiplier += 0.5;
      if (item.type === 'youtube_video') multiplier += 1.0;
      if (item.type === 'blog_post') multiplier += 0.4;
    });
    return Math.max(1, multiplier);
  }

  private static calculateCategoryMatch(influencerCats: string[], campaignCats: string[]): number {
    const intersection = influencerCats.filter(cat => campaignCats.includes(cat));
    return intersection.length / Math.max(campaignCats.length, 1);
  }

  private static calculateAudienceMatch(influencerAud: any, campaignTarget: any): number {
    // 간단한 매칭 로직 (실제로는 더 복잡해야 함)
    return 0.7; // 70% 매칭 가정
  }

  private static calculateConfidence(influencer: InfluencerProfile, campaign: Campaign): number {
    let confidence = 50;
    
    if (influencer.total_campaigns > 10) confidence += 20;
    if (influencer.average_rating > 4.0) confidence += 15;
    if (this.calculateCategoryMatch(influencer.categories, campaign.categories) > 0.5) confidence += 15;
    
    return Math.min(95, confidence);
  }

  private static getPriceFactors(
    influencer: InfluencerProfile,
    campaign: Campaign,
    calculations: any
  ): string[] {
    const factors: string[] = [];
    
    if (calculations.engagementMultiplier > 1.2) {
      factors.push('높은 참여율 (+' + Math.round((calculations.engagementMultiplier - 1) * 100) + '%)');
    }
    if (calculations.categoryMatch > 0.7) {
      factors.push('카테고리 전문성 (+' + Math.round(calculations.categoryMatch * 20) + '%)');
    }
    if (influencer.tier === 'premium') {
      factors.push('프리미엄 인플루언서');
    }
    if (campaign.duration < 7) {
      factors.push('긴급 캠페인 (+30%)');
    }
    if (influencer.total_campaigns > 20) {
      factors.push('풍부한 경험');
    }
    
    return factors;
  }
}