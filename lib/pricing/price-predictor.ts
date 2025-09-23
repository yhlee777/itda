// lib/pricing/price-predictor.ts
export class PricePredictor {
  static async predictPrice(
    influencerId: string,
    campaignId: string
  ): Promise<{
    recommended: number;
    min: number;
    max: number;
    factors: {
      basePrice: number;
      engagementMultiplier: number;
      categoryMultiplier: number;
      urgencyMultiplier: number;
    };
  }> {
    const supabase = createClient();
    
    // 데이터 가져오기
    const [influencerRes, campaignRes, marketRes] = await Promise.all([
      supabase.from('influencers').select('*').eq('id', influencerId).single(),
      supabase.from('campaigns').select('*').eq('id', campaignId).single(),
      this.getMarketRate(influencerId)
    ]);
    
    const influencer = influencerRes.data!;
    const campaign = campaignRes.data!;
    
    // 기본 가격 계산 (팔로워 기반)
    const basePrice = influencer.followers_count * 0.01;
    
    // 참여율 배수
    const engagementMultiplier = 
      influencer.engagement_rate > 5 ? 1.5 :
      influencer.engagement_rate > 3 ? 1.2 :
      influencer.engagement_rate > 1 ? 1.0 : 0.8;
    
    // 카테고리 배수 (프리미엄 카테고리)
    const categoryMultiplier = 
      campaign.categories?.includes('luxury') ? 2.0 :
      campaign.categories?.includes('fashion') ? 1.5 :
      campaign.categories?.includes('beauty') ? 1.3 : 1.0;
    
    // 긴급도 배수
    const urgencyMultiplier = 
      campaign.urgency === 'high' ? 1.3 :
      campaign.urgency === 'medium' ? 1.0 : 0.9;
    
    // 최종 가격 계산
    const recommendedPrice = Math.round(
      basePrice * 
      engagementMultiplier * 
      categoryMultiplier * 
      urgencyMultiplier / 10000
    ) * 10000;
    
    return {
      recommended: recommendedPrice,
      min: Math.round(recommendedPrice * 0.7),
      max: Math.round(recommendedPrice * 1.3),
      factors: {
        basePrice,
        engagementMultiplier,
        categoryMultiplier,
        urgencyMultiplier
      }
    };
  }
  
  private static async getMarketRate(influencerId: string): Promise<number> {
    const supabase = createClient();
    
    // 비슷한 인플루언서들의 최근 거래가 조회
    const { data: influencer } = await supabase
      .from('influencers')
      .select('followers_count, categories')
      .eq('id', influencerId)
      .single();
    
    if (!influencer) return 0;
    
    // 팔로워 ±20% 범위의 인플루언서들
    const followerMin = influencer.followers_count * 0.8;
    const followerMax = influencer.followers_count * 1.2;
    
    const { data: similarDeals } = await supabase
      .from('campaign_influencers')
      .select(`
        agreed_price,
        influencer:influencers!inner(
          followers_count
        )
      `)
      .gte('influencer.followers_count', followerMin)
      .lte('influencer.followers_count', followerMax)
      .not('agreed_price', 'is', null)
      .order('matched_at', { ascending: false })
      .limit(10);
    
    if (!similarDeals || similarDeals.length === 0) return 0;
    
    const avgPrice = similarDeals.reduce((sum, deal) => 
      sum + (deal.agreed_price || 0), 0
    ) / similarDeals.length;
    
    return avgPrice;
  }
}