// lib/ai/price-predictor.ts
import { createClient } from '@/lib/supabase/client';

interface PricePredictionInput {
  influencerId: string;
  campaignId: string;
  category: string;
  followers: number;
  engagementRate: number;
  deliverables: string[];
  duration: number;
  previousCampaigns?: number;
  averageRating?: number;
  region?: string;
  isPremium?: boolean;
}

interface PricePredictionResult {
  estimatedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  factors: PriceFactor[];
  marketComparison: MarketComparison;
  recommendation: string;
}

interface PriceFactor {
  name: string;
  impact: number;
  description: string;
}

interface MarketComparison {
  averageMarketPrice: number;
  percentile: number;
  trend: 'rising' | 'stable' | 'falling';
  trendPercentage: number;
}

export class AIPricePredictor {
  private static supabase = createClient();

  static async predictPrice(input: PricePredictionInput): Promise<PricePredictionResult> {
    // 1. 기본 가격 계산
    const basePrice = this.calculateBasePrice(input);
    
    // 2. 조정 요인 계산
    const factors = await this.calculatePriceFactors(input);
    
    // 3. 최종 가격 계산
    const adjustedPrice = this.applyFactors(basePrice, factors);
    
    // 4. 시장 비교 분석
    const marketComparison = await this.analyzeMarket(input, adjustedPrice);
    
    // 5. 신뢰도 계산
    const confidence = this.calculateConfidence(input, marketComparison);
    
    // 6. 추천사항 생성
    const recommendation = this.generateRecommendation(
      adjustedPrice,
      marketComparison,
      confidence
    );

    return {
      estimatedPrice: Math.round(adjustedPrice),
      minPrice: Math.round(adjustedPrice * 0.8),
      maxPrice: Math.round(adjustedPrice * 1.2),
      confidence,
      factors,
      marketComparison,
      recommendation
    };
  }

  private static calculateBasePrice(input: PricePredictionInput): number {
    let basePrice = 0;
    
    // 팔로워 기반 계산 (티어별)
    if (input.followers < 10000) {
      basePrice = input.followers * 10; // 나노: 팔로워당 10원
    } else if (input.followers < 50000) {
      basePrice = 100000 + (input.followers - 10000) * 15; // 마이크로: 팔로워당 15원
    } else if (input.followers < 100000) {
      basePrice = 700000 + (input.followers - 50000) * 20; // 미드티어: 팔로워당 20원
    } else if (input.followers < 500000) {
      basePrice = 1700000 + (input.followers - 100000) * 25; // 매크로: 팔로워당 25원
    } else {
      basePrice = 11700000 + (input.followers - 500000) * 30; // 메가: 팔로워당 30원
    }
    
    // 참여율 보정 (기준 3.5%)
    const engagementMultiplier = Math.max(0.5, Math.min(2, input.engagementRate / 3.5));
    basePrice *= engagementMultiplier;
    
    // 콘텐츠 개수 보정
    const contentCount = input.deliverables.length;
    const contentMultiplier = 1 + (contentCount - 1) * 0.3; // 추가 콘텐츠당 30%
    basePrice *= contentMultiplier;
    
    // 기간 보정 (기준 14일)
    const durationMultiplier = Math.max(0.7, Math.min(1.5, input.duration / 14));
    basePrice *= durationMultiplier;
    
    return basePrice;
  }

  private static async calculatePriceFactors(input: PricePredictionInput): Promise<PriceFactor[]> {
    const factors: PriceFactor[] = [];
    
    // 카테고리별 가중치
    const categoryWeights: Record<string, number> = {
      '패션': 1.2,
      '뷰티': 1.3,
      '럭셔리': 1.8,
      'IT/테크': 1.1,
      '푸드': 0.9,
      '여행': 1.15,
      '피트니스': 1.0,
      '라이프': 0.95
    };
    
    const categoryWeight = categoryWeights[input.category] || 1.0;
    factors.push({
      name: '카테고리',
      impact: (categoryWeight - 1) * 100,
      description: `${input.category} 카테고리 시장 수요`
    });
    
    // 경력 보정
    if (input.previousCampaigns) {
      const experienceMultiplier = 1 + Math.min(input.previousCampaigns * 0.01, 0.3);
      factors.push({
        name: '경력',
        impact: (experienceMultiplier - 1) * 100,
        description: `${input.previousCampaigns}개 캠페인 완료`
      });
    }
    
    // 평점 보정
    if (input.averageRating) {
      const ratingMultiplier = input.averageRating / 4;
      factors.push({
        name: '평균 평점',
        impact: (ratingMultiplier - 1) * 100,
        description: `평점 ${input.averageRating}/5`
      });
    }
    
    // 프리미엄 계정
    if (input.isPremium) {
      factors.push({
        name: '프리미엄 계정',
        impact: 20,
        description: '인증된 프리미엄 인플루언서'
      });
    }
    
    // 지역 보정
    if (input.region) {
      const regionWeights: Record<string, number> = {
        '서울': 1.2,
        '경기': 1.1,
        '부산': 1.0,
        '제주': 1.15,
        '기타': 0.95
      };
      
      const regionWeight = regionWeights[input.region] || 1.0;
      factors.push({
        name: '지역',
        impact: (regionWeight - 1) * 100,
        description: `${input.region} 지역`
      });
    }
    
    return factors;
  }

  private static applyFactors(basePrice: number, factors: PriceFactor[]): number {
    let adjustedPrice = basePrice;
    
    factors.forEach(factor => {
      adjustedPrice *= (1 + factor.impact / 100);
    });
    
    return adjustedPrice;
  }

  private static async analyzeMarket(
    input: PricePredictionInput,
    predictedPrice: number
  ): Promise<MarketComparison> {
    // 실제로는 DB에서 유사 캠페인 분석
    // 여기서는 시뮬레이션
    const averageMarketPrice = predictedPrice * (0.9 + Math.random() * 0.2);
    const percentile = Math.floor(Math.random() * 40) + 40;
    const trend = Math.random() > 0.5 ? 'rising' : 'stable';
    const trendPercentage = trend === 'rising' ? Math.random() * 10 : 0;
    
    return {
      averageMarketPrice: Math.round(averageMarketPrice),
      percentile,
      trend,
      trendPercentage: Math.round(trendPercentage)
    };
  }

  private static calculateConfidence(
    input: PricePredictionInput,
    marketComparison: MarketComparison
  ): number {
    let confidence = 50;
    
    // 데이터 완성도
    if (input.previousCampaigns) confidence += 10;
    if (input.averageRating) confidence += 10;
    if (input.region) confidence += 5;
    
    // 시장 데이터 일치도
    const priceDifference = Math.abs(
      marketComparison.percentile - 50
    ) / 50;
    
    if (priceDifference < 0.2) confidence += 15;
    else if (priceDifference < 0.4) confidence += 10;
    else if (priceDifference < 0.6) confidence += 5;
    
    return Math.min(95, confidence);
  }

  private static generateRecommendation(
    predictedPrice: number,
    marketComparison: MarketComparison,
    confidence: number
  ): string {
    const recommendations: string[] = [];
    
    // 가격 포지셔닝
    if (marketComparison.percentile > 70) {
      recommendations.push(`💡 프리미엄 포지셔닝이 가능합니다.`);
    } else if (marketComparison.percentile < 30) {
      recommendations.push(`💰 경쟁력 있는 가격대입니다.`);
    } else {
      recommendations.push(`✅ 적정 시장 가격대입니다.`);
    }
    
    // 트렌드 반영
    if (marketComparison.trend === 'rising') {
      recommendations.push(`📈 시장이 상승 추세입니다. 조기 계약을 추천합니다.`);
    }
    
    // 신뢰도 조언
    if (confidence > 80) {
      recommendations.push(`✨ 높은 신뢰도의 예측입니다.`);
    }
    
    return recommendations.join(' ');
  }
}