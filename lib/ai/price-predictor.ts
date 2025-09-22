// lib/ai/price-predictor.ts
import { createClient } from '@/lib/supabase/client';

export interface PricePredictionInput {
  influencerId: string;
  campaignId: string;
  category: string;
  followers: number;
  engagementRate: number;
  deliverables: string[];
  duration: number; // days
  previousCampaigns?: number;
  averageRating?: number;
  region?: string;
  isPremium?: boolean;
}

export interface PricePredictionResult {
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
  impact: number; // percentage
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

  /**
   * 메인 가격 예측 함수
   */
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

  /**
   * 기본 가격 계산
   */
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

  /**
   * 가격 조정 요인 계산
   */
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
    if (categoryWeight !== 1.0) {
      factors.push({
        name: '카테고리 프리미엄',
        impact: (categoryWeight - 1) * 100,
        description: `${input.category} 카테고리 시장 가격`
      });
    }
    
    // 경험 보정
    if (input.previousCampaigns && input.previousCampaigns > 10) {
      const experienceBonus = Math.min(20, input.previousCampaigns * 0.5);
      factors.push({
        name: '캠페인 경험',
        impact: experienceBonus,
        description: `${input.previousCampaigns}개 캠페인 수행`
      });
    }
    
    // 평점 보정
    if (input.averageRating && input.averageRating > 4.0) {
      const ratingBonus = (input.averageRating - 4.0) * 10;
      factors.push({
        name: '높은 평점',
        impact: ratingBonus,
        description: `평균 ${input.averageRating}점`
      });
    }
    
    // 지역 보정
    if (input.region === '서울') {
      factors.push({
        name: '수도권 프리미엄',
        impact: 10,
        description: '서울 지역 활동'
      });
    }
    
    // 프리미엄 인플루언서
    if (input.isPremium) {
      factors.push({
        name: '프리미엄 등급',
        impact: 30,
        description: '검증된 프리미엄 인플루언서'
      });
    }
    
    // 콘텐츠 타입별 보정
    const hasVideo = input.deliverables.some(d => 
      d.toLowerCase().includes('릴스') || 
      d.toLowerCase().includes('영상') ||
      d.toLowerCase().includes('유튜브')
    );
    
    if (hasVideo) {
      factors.push({
        name: '동영상 콘텐츠',
        impact: 25,
        description: '고품질 동영상 제작'
      });
    }
    
    // 긴급 캠페인
    if (input.duration < 7) {
      factors.push({
        name: '긴급 캠페인',
        impact: 30,
        description: `${input.duration}일 내 완료`
      });
    }
    
    return factors;
  }

  /**
   * 요인 적용
   */
  private static applyFactors(basePrice: number, factors: PriceFactor[]): number {
    let adjustedPrice = basePrice;
    
    factors.forEach(factor => {
      adjustedPrice *= (1 + factor.impact / 100);
    });
    
    return adjustedPrice;
  }

  /**
   * 시장 분석
   */
  private static async analyzeMarket(
    input: PricePredictionInput,
    predictedPrice: number
  ): Promise<MarketComparison> {
    try {
      // 유사한 캠페인 가격 조회
      const { data: similarCampaigns } = await this.supabase
        .from('campaign_influencers')
        .select(`
          price,
          influencer:influencers(
            followers_count,
            engagement_rate
          ),
          campaign:campaigns(
            categories,
            created_at
          )
        `)
        .gte('influencers.followers_count', input.followers * 0.5)
        .lte('influencers.followers_count', input.followers * 2.0)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100);
      
      if (!similarCampaigns || similarCampaigns.length === 0) {
        // 데이터가 없을 경우 기본값 반환
        return {
          averageMarketPrice: predictedPrice,
          percentile: 50,
          trend: 'stable',
          trendPercentage: 0
        };
      }
      
      // 평균 가격 계산
      const prices = similarCampaigns.map(c => c.price).filter(p => p > 0);
      const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      
      // 백분위수 계산
      prices.sort((a, b) => a - b);
      const belowCount = prices.filter(p => p < predictedPrice).length;
      const percentile = Math.round((belowCount / prices.length) * 100);
      
      // 트렌드 분석 (최근 30일 vs 이전 60일)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentPrices = similarCampaigns
        .filter(c => new Date(c.campaign.created_at) > thirtyDaysAgo)
        .map(c => c.price);
      
      const olderPrices = similarCampaigns
        .filter(c => new Date(c.campaign.created_at) <= thirtyDaysAgo)
        .map(c => c.price);
      
      let trend: 'rising' | 'stable' | 'falling' = 'stable';
      let trendPercentage = 0;
      
      if (recentPrices.length > 0 && olderPrices.length > 0) {
        const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
        const olderAvg = olderPrices.reduce((sum, p) => sum + p, 0) / olderPrices.length;
        
        trendPercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (trendPercentage > 5) trend = 'rising';
        else if (trendPercentage < -5) trend = 'falling';
      }
      
      return {
        averageMarketPrice: Math.round(averagePrice),
        percentile,
        trend,
        trendPercentage: Math.round(trendPercentage)
      };
      
    } catch (error) {
      console.error('Market analysis error:', error);
      return {
        averageMarketPrice: predictedPrice,
        percentile: 50,
        trend: 'stable',
        trendPercentage: 0
      };
    }
  }

  /**
   * 신뢰도 계산
   */
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
      (marketComparison.averageMarketPrice - (input as any).estimatedPrice) / 
      marketComparison.averageMarketPrice
    );
    
    if (priceDifference < 0.1) confidence += 15;
    else if (priceDifference < 0.2) confidence += 10;
    else if (priceDifference < 0.3) confidence += 5;
    
    // 백분위수 극단값 보정
    if (marketComparison.percentile > 10 && marketComparison.percentile < 90) {
      confidence += 10;
    }
    
    return Math.min(95, confidence);
  }

  /**
   * 추천사항 생성
   */
  private static generateRecommendation(
    predictedPrice: number,
    marketComparison: MarketComparison,
    confidence: number
  ): string {
    const recommendations: string[] = [];
    
    // 가격 포지셔닝
    if (marketComparison.percentile > 70) {
      recommendations.push(
        `💡 예상 단가가 시장 상위 ${100 - marketComparison.percentile}%에 해당합니다. ` +
        `프리미엄 포지셔닝이 가능합니다.`
      );
    } else if (marketComparison.percentile < 30) {
      recommendations.push(
        `💰 경쟁력 있는 가격대입니다. ` +
        `빠른 매칭이 예상됩니다.`
      );
    } else {
      recommendations.push(
        `✅ 적정 시장 가격대입니다. ` +
        `안정적인 캠페인 진행이 가능합니다.`
      );
    }
    
    // 트렌드 반영
    if (marketComparison.trend === 'rising') {
      recommendations.push(
        `📈 시장 가격이 ${marketComparison.trendPercentage}% 상승 추세입니다. ` +
        `조기 계약을 추천합니다.`
      );
    } else if (marketComparison.trend === 'falling') {
      recommendations.push(
        `📉 시장 가격이 ${Math.abs(marketComparison.trendPercentage)}% 하락 추세입니다. ` +
        `협상 여지가 있을 수 있습니다.`
      );
    }
    
    // 신뢰도 기반 조언
    if (confidence < 60) {
      recommendations.push(
        `⚠️ 예측 신뢰도가 ${confidence}%로 낮습니다. ` +
        `추가 시장 조사를 권장합니다.`
      );
    } else if (confidence > 80) {
      recommendations.push(
        `✨ 예측 신뢰도가 ${confidence}%로 높습니다. ` +
        `안심하고 진행하셔도 좋습니다.`
      );
    }
    
    return recommendations.join('\n\n');
  }

  /**
   * 실시간 가격 업데이트
   */
  static async updatePriceInRealtime(
    campaignId: string,
    influencerId: string
  ): Promise<PricePredictionResult | null> {
    try {
      // 캠페인과 인플루언서 정보 조회
      const { data: campaign } = await this.supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      const { data: influencer } = await this.supabase
        .from('influencers')
        .select('*')
        .eq('id', influencerId)
        .single();
      
      if (!campaign || !influencer) return null;
      
      // 가격 예측
      const prediction = await this.predictPrice({
        influencerId: influencer.id,
        campaignId: campaign.id,
        category: campaign.categories[0],
        followers: influencer.followers_count,
        engagementRate: influencer.engagement_rate,
        deliverables: campaign.deliverables || [],
        duration: Math.ceil(
          (new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / 
          (1000 * 60 * 60 * 24)
        ),
        previousCampaigns: influencer.total_campaigns,
        averageRating: influencer.average_rating,
        region: influencer.location,
        isPremium: influencer.tier === 'premium'
      });
      
      // 결과 저장
      await this.supabase
        .from('price_predictions')
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          predicted_price: prediction.estimatedPrice,
          min_price: prediction.minPrice,
          max_price: prediction.maxPrice,
          confidence: prediction.confidence,
          factors: prediction.factors,
          market_comparison: prediction.marketComparison,
          recommendation: prediction.recommendation
        });
      
      return prediction;
      
    } catch (error) {
      console.error('Real-time price update error:', error);
      return null;
    }
  }

  /**
   * 일괄 가격 예측 (광고주용)
   */
  static async batchPredict(
    campaignId: string,
    influencerIds: string[]
  ): Promise<Map<string, PricePredictionResult>> {
    const results = new Map<string, PricePredictionResult>();
    
    // 병렬 처리를 위한 배치 사이즈
    const batchSize = 5;
    
    for (let i = 0; i < influencerIds.length; i += batchSize) {
      const batch = influencerIds.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (influencerId) => {
          const result = await this.updatePriceInRealtime(campaignId, influencerId);
          return { influencerId, result };
        })
      );
      
      batchResults.forEach(({ influencerId, result }) => {
        if (result) {
          results.set(influencerId, result);
        }
      });
    }
    
    return results;
  }
}

// React Hook for Price Prediction
export function usePricePrediction(campaignId?: string) {
  const [prediction, setPrediction] = useState<PricePredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (input: PricePredictionInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await AIPricePredictor.predictPrice(input);
      setPrediction(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '가격 예측 중 오류가 발생했습니다';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRealtime = useCallback(async (influencerId: string) => {
    if (!campaignId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await AIPricePredictor.updatePriceInRealtime(campaignId, influencerId);
      setPrediction(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '실시간 업데이트 중 오류가 발생했습니다';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  return {
    prediction,
    isLoading,
    error,
    predict,
    updateRealtime
  };
}

export default AIPricePredictor;