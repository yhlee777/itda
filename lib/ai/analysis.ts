// lib/ai/analysis.ts
export interface InfluencerProfile {
  id: string;
  name: string;
  username: string;
  followers_count: number;
  engagement_rate: number;
  categories: string[];
  tier: 'bronze' | 'silver' | 'gold' | 'premium';
  average_rating: number;
  total_campaigns: number;
  audience_demographics: any;
  content_quality_score: number;
}

export interface Campaign {
  id: string;
  title: string;
  budget: number;
  categories: string[];
  target_audience: any;
  deliverables: any[];
  duration: number;
  urgency: 'low' | 'medium' | 'high';
}

export class AIAnalysisEngine {
  // 매칭 점수 계산
  static calculateMatchScore(influencer: InfluencerProfile, campaign: Campaign): {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: 'highly_recommended' | 'recommended' | 'possible' | 'not_recommended';
  } {
    let score = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // 1. 카테고리 매칭 (30점)
    const categoryMatch = this.calculateCategoryMatch(influencer.categories, campaign.categories);
    score += categoryMatch * 30;
    if (categoryMatch > 0.7) {
      strengths.push('카테고리 전문성이 캠페인과 잘 맞습니다');
    } else if (categoryMatch < 0.3) {
      weaknesses.push('카테고리 매칭도가 낮습니다');
    }

    // 2. 오디언스 매칭 (25점)
    const audienceMatch = this.calculateAudienceMatch(
      influencer.audience_demographics,
      campaign.target_audience
    );
    score += audienceMatch * 25;
    if (audienceMatch > 0.7) {
      strengths.push('타겟 오디언스와 팔로워 층이 일치합니다');
    }

    // 3. 참여율 평가 (20점)
    const engagementScore = Math.min(influencer.engagement_rate / 10, 1) * 20;
    score += engagementScore;
    if (influencer.engagement_rate > 5) {
      strengths.push('높은 참여율을 보유하고 있습니다');
    } else if (influencer.engagement_rate < 2) {
      weaknesses.push('참여율이 평균보다 낮습니다');
    }

    // 4. 콘텐츠 품질 (15점)
    const qualityScore = (influencer.content_quality_score / 10) * 15;
    score += qualityScore;
    if (influencer.content_quality_score > 8) {
      strengths.push('고품질 콘텐츠 제작 능력');
    }

    // 5. 경험 및 신뢰도 (10점)
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

  // 단가 예측
  static predictPrice(influencer: InfluencerProfile, campaign: Campaign): {
    suggested_price: number;
    min_price: number;
    max_price: number;
    price_factors: string[];
    confidence: number;
  } {
    // 기본 단가 계산 (팔로워 수 기반)
    let basePrice = 0;
    const followers = influencer.followers_count;
    
    if (followers < 10000) {
      basePrice = followers * 10; // 팔로워당 10원
    } else if (followers < 50000) {
      basePrice = 100000 + (followers - 10000) * 8; // 10만 + 팔로워당 8원
    } else if (followers < 100000) {
      basePrice = 420000 + (followers - 50000) * 6; // 42만 + 팔로워당 6원
    } else if (followers < 500000) {
      basePrice = 720000 + (followers - 100000) * 4; // 72만 + 팔로워당 4원
    } else {
      basePrice = 2320000 + (followers - 500000) * 2; // 232만 + 팔로워당 2원
    }

    // 조정 요소들
    const engagementMultiplier = this.getEngagementMultiplier(influencer.engagement_rate);
    const tierMultiplier = this.getTierMultiplier(influencer.tier);
    const categoryMatch = this.calculateCategoryMatch(influencer.categories, campaign.categories);
    const urgencyMultiplier = campaign.urgency === 'high' ? 1.3 : campaign.urgency === 'medium' ? 1.1 : 1.0;
    const experienceMultiplier = this.getExperienceMultiplier(
      influencer.total_campaigns,
      influencer.average_rating
    );
    const contentMultiplier = this.calculateContentMultiplier(campaign.deliverables);

    // 최종 가격 계산
    const finalPrice = basePrice * 
      engagementMultiplier * 
      tierMultiplier * 
      (1 + categoryMatch * 0.2) * 
      urgencyMultiplier * 
      experienceMultiplier *
      contentMultiplier;

    // 가격 범위 설정
    const minPrice = Math.round(finalPrice * 0.8);
    const maxPrice = Math.round(finalPrice * 1.2);
    const suggestedPrice = Math.round(finalPrice);

    // 가격 결정 요인
    const priceFactors = this.getPriceFactors(
      influencer,
      campaign,
      {
        engagementMultiplier,
        tierMultiplier,
        categoryMatch,
        urgencyMultiplier,
        experienceMultiplier,
        contentMultiplier
      }
    );

    // 신뢰도 계산
    const confidence = this.calculateConfidence(influencer, campaign);

    return {
      suggested_price: suggestedPrice,
      min_price: minPrice,
      max_price: maxPrice,
      price_factors: priceFactors,
      confidence
    };
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

  private static getTierMultiplier(tier: string): number {
    switch(tier) {
      case 'premium': return 1.5;
      case 'gold': return 1.2;
      case 'silver': return 1.0;
      case 'bronze': return 0.8;
      default: return 1.0;
    }
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

// 실시간 매칭 시스템
export class RealtimeMatchingSystem {
  static async findMatches(campaignId: string, limit: number = 10): Promise<any[]> {
    // 실제로는 Supabase에서 데이터를 가져와야 함
    // 여기서는 시뮬레이션
    return [];
  }

  static async notifyInfluencer(influencerId: string, campaignId: string): Promise<void> {
    // 푸시 알림 전송 로직
    console.log(`Notifying influencer ${influencerId} about campaign ${campaignId}`);
  }

  static async scheduleNotifications(advertiserId: string, intervals: number[]): Promise<void> {
    // 광고주에게 정기 알림 스케줄링
    intervals.forEach((minutes) => {
      setTimeout(() => {
        console.log(`Sending notification to advertiser ${advertiserId} after ${minutes} minutes`);
      }, minutes * 60 * 1000);
    });
  }
}