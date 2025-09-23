export async function dailyResetFunction() {
  // 매일 자정에 실행
  await DailyLimitsManager.resetDailyLimits();
  
  // 만료된 큐 정리
  const supabase = createClient();
  await supabase
    .from('campaign_queue')
    .delete()
    .lt('expires_at', new Date().toISOString());
  
  return { success: true };
}
