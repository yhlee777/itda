export class DailyLimitsManager {
  static async checkAndUpdateSwipeLimit(
    influencerId: string
  ): Promise<{
    canSwipe: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const supabase = createClient();
    
    // 오늘 스와이프 횟수 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data: todaySwipes } = await supabase
      .from('swipe_history')
      .select('id')
      .eq('influencer_id', influencerId)
      .gte('swiped_at', today.toISOString())
      .lt('swiped_at', tomorrow.toISOString());
    
    const swipeCount = todaySwipes?.length || 0;
    const dailyLimit = 100; // 초창기에는 100개
    
    // 스와이프 가능 여부 확인
    const canSwipe = swipeCount < dailyLimit;
    const remaining = Math.max(0, dailyLimit - swipeCount);
    
    // 리셋 시간 (다음날 자정)
    const resetAt = tomorrow;
    
    // 인플루언서 테이블 업데이트
    await supabase
      .from('influencers')
      .update({
        daily_swipes_count: swipeCount,
        daily_swipes_limit: dailyLimit,
        last_swipe_at: new Date().toISOString()
      })
      .eq('id', influencerId);
    
    return {
      canSwipe,
      remaining,
      resetAt
    };
  }
  
  static async resetDailyLimits() {
    const supabase = createClient();
    
    // 모든 인플루언서의 일일 제한 리셋
    await supabase
      .from('influencers')
      .update({
        daily_swipes_count: 0,
        daily_swipes_limit: 100
      })
      .gt('daily_swipes_count', 0);
    
    console.log('Daily limits reset completed');
  }
}
