export class CampaignStatsUpdater {
  static async updateOnView(campaignId: string, viewerId: string) {
    const supabase = createClient();
    
    await supabase.rpc('increment_campaign_view', {
      p_campaign_id: campaignId,
      p_viewer_id: viewerId
    });
  }
  
  static async updateOnSwipe(
    campaignId: string,
    action: 'like' | 'pass' | 'super_like'
  ) {
    const supabase = createClient();
    
    const updates: any = {
      view_count: supabase.raw('view_count + 1')
    };
    
    if (action === 'like' || action === 'super_like') {
      updates.like_count = supabase.raw('like_count + 1');
    }
    
    if (action === 'super_like') {
      updates.super_like_count = supabase.raw('super_like_count + 1');
    }
    
    await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', campaignId);
  }
  
  static async updateOnApplication(campaignId: string) {
    const supabase = createClient();
    
    await supabase
      .from('campaigns')
      .update({
        application_count: supabase.raw('application_count + 1')
      })
      .eq('id', campaignId);
  }
}