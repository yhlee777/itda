export class CampaignQueueManager {
  static async generateQueue(
    influencerId: string,
    limit: number = 10
  ): Promise<string[]> {
    const supabase = createClient();
    
    // 인플루언서 정보 가져오기
    const { data: influencer } = await supabase
      .from('influencers')
      .select('categories, preferred_categories')
      .eq('id', influencerId)
      .single();
    
    if (!influencer) return [];
    
    // 이미 본 캠페인 제외
    const { data: swipedCampaigns } = await supabase
      .from('swipe_history')
      .select('campaign_id')
      .eq('influencer_id', influencerId);
    
    const excludeIds = swipedCampaigns?.map(s => s.campaign_id) || [];
    
    // 카테고리 우선순위 설정
    const primaryCategories = influencer.preferred_categories || influencer.categories || [];
    const secondaryCategories = ['lifestyle', 'general']; // 기본 카테고리
    
    // 1. 주 카테고리 캠페인 (70%)
    const primaryCount = Math.ceil(limit * 0.7);
    const { data: primaryCampaigns } = await supabase
      .from('campaigns')
      .select('id')
      .contains('categories', primaryCategories)
      .eq('status', 'active')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .order('is_premium', { ascending: false })
      .order('urgency', { ascending: false })
      .order('budget', { ascending: false })
      .limit(primaryCount);
    
    // 2. 보조 카테고리 캠페인 (30%)
    const secondaryCount = limit - (primaryCampaigns?.length || 0);
    const { data: secondaryCampaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('status', 'active')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(secondaryCount);
    
    const allCampaigns = [
      ...(primaryCampaigns || []),
      ...(secondaryCampaigns || [])
    ];
    
    // 큐에 저장
    if (allCampaigns.length > 0) {
      const queueItems = allCampaigns.map((campaign, index) => ({
        influencer_id: influencerId,
        campaign_id: campaign.id,
        queue_order: index + 1,
        category_priority: index < primaryCount ? 1 : 2,
        added_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // 3시간 후 만료
      }));
      
      await supabase.from('campaign_queue').insert(queueItems);
    }
    
    return allCampaigns.map(c => c.id);
  }
  
  static async getNextCampaign(influencerId: string): Promise<any> {
    const supabase = createClient();
    
    // 큐에서 다음 캠페인 가져오기
    const { data: queueItem } = await supabase
      .from('campaign_queue')
      .select(`
        campaign_id,
        campaigns (*)
      `)
      .eq('influencer_id', influencerId)
      .gt('expires_at', new Date().toISOString())
      .order('queue_order', { ascending: true })
      .limit(1)
      .single();
    
    if (!queueItem) {
      // 큐가 비었으면 새로 생성
      await this.generateQueue(influencerId);
      return this.getNextCampaign(influencerId);
    }
    
    // 큐에서 제거
    await supabase
      .from('campaign_queue')
      .delete()
      .eq('influencer_id', influencerId)
      .eq('campaign_id', queueItem.campaign_id);
    
    return queueItem.campaigns;
  }
}