
// lib/notifications/batch-system.ts
export class NotificationBatcher {
  private static batchTimers = new Map<string, NodeJS.Timeout>();
  
  static async scheduleApplicationNotification(
    campaignId: string,
    advertiserId: string,
    applicantData: any
  ) {
    const supabase = createClient();
    
    // 배치 키 생성 (캠페인별로 배치)
    const batchKey = `${campaignId}_${advertiserId}`;
    
    // 기존 배치에 추가
    const { data: existingBatch } = await supabase
      .from('notification_batches')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .single();
    
    if (existingBatch) {
      // 기존 배치에 지원자 추가
      const applicants = existingBatch.applicants || [];
      applicants.push(applicantData);
      
      await supabase
        .from('notification_batches')
        .update({ 
          applicants,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBatch.id);
    } else {
      // 새 배치 생성
      await supabase
        .from('notification_batches')
        .insert({
          campaign_id: campaignId,
          advertiser_id: advertiserId,
          applicants: [applicantData],
          status: 'pending',
          scheduled_for: new Date(Date.now() + 30 * 60 * 1000) // 30분 후
        });
    }
    
    // 타이머 설정 (중복 방지)
    if (!this.batchTimers.has(batchKey)) {
      // 30분 후 첫 알림
      const timer30min = setTimeout(() => {
        this.sendBatchNotification(campaignId, advertiserId, '30min');
      }, 30 * 60 * 1000);
      
      // 2시간 후 두번째 알림
      const timer2hour = setTimeout(() => {
        this.sendBatchNotification(campaignId, advertiserId, '2hour');
      }, 2 * 60 * 60 * 1000);
      
      // 24시간 후 최종 알림
      const timer24hour = setTimeout(() => {
        this.sendBatchNotification(campaignId, advertiserId, '24hour');
        this.batchTimers.delete(batchKey);
      }, 24 * 60 * 60 * 1000);
      
      this.batchTimers.set(batchKey, timer30min);
    }
  }
  
  private static async sendBatchNotification(
    campaignId: string,
    advertiserId: string,
    batchType: '30min' | '2hour' | '24hour'
  ) {
    const supabase = createClient();
    
    // 배치 데이터 가져오기
    const { data: batch } = await supabase
      .from('notification_batches')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .single();
    
    if (!batch || !batch.applicants?.length) return;
    
    // AI 분석 실행
    const analyzedApplicants = await Promise.all(
      batch.applicants.map(async (applicant: any) => {
        const matchScore = await AIMatchingSystem.calculateMatchScore(
          applicant.influencer_id,
          campaignId
        );
        const pricing = await PricePredictor.predictPrice(
          applicant.influencer_id,
          campaignId
        );
        
        return {
          ...applicant,
          match_score: matchScore.score,
          match_breakdown: matchScore.breakdown,
          recommendation: matchScore.recommendation,
          predicted_price: pricing.recommended
        };
      })
    );
    
    // 점수순 정렬
    analyzedApplicants.sort((a, b) => b.match_score - a.match_score);
    
    // 알림 생성
    await supabase.from('notifications').insert({
      user_id: advertiserId,
      type: 'applicant_batch',
      title: `${batchType === '30min' ? '30분' : batchType === '2hour' ? '2시간' : '24시간'} 지원자 리포트`,
      message: `${analyzedApplicants.length}명의 새로운 지원자가 있습니다. AI 추천: ${analyzedApplicants[0]?.name}`,
      metadata: {
        campaign_id: campaignId,
        batch_type: batchType,
        applicants: analyzedApplicants,
        top_pick: analyzedApplicants[0]
      },
      priority: batchType === '30min' ? 'high' : 'medium'
    });
    
    // 배치 상태 업데이트
    await supabase
      .from('notification_batches')
      .update({ 
        status: batchType === '24hour' ? 'completed' : 'partial',
        last_sent_at: new Date().toISOString()
      })
      .eq('id', batch.id);
  }
}
