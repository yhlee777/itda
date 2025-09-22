// lib/notifications/advertiser-notifications.ts
import { createClient } from '@/lib/supabase/client';
import { AIAnalyzer } from '@/lib/ai/analyzer';

export class AdvertiserNotificationSystem {
  private supabase = createClient();
  private notificationSchedule = new Map<string, NodeJS.Timeout[]>();

  /**
   * 캠페인 생성 시 알림 스케줄 설정
   */
  async setupCampaignNotifications(
    campaignId: string,
    advertiserId: string,
    options: {
      intervals?: number[]; // 알림 간격 (분 단위)
      aiAnalysis?: boolean; // AI 분석 포함 여부
      minApplicants?: number; // 최소 지원자 수
    } = {}
  ) {
    const {
      intervals = [30, 120, 360, 1440], // 30분, 2시간, 6시간, 24시간
      aiAnalysis = true,
      minApplicants = 1
    } = options;

    // 기존 스케줄 취소
    this.clearSchedule(campaignId);

    const schedules: NodeJS.Timeout[] = [];

    // 각 간격마다 알림 스케줄 설정
    intervals.forEach(minutes => {
      const timeout = setTimeout(async () => {
        await this.sendApplicationSummary(campaignId, advertiserId, {
          includeAI: aiAnalysis,
          minApplicants
        });
      }, minutes * 60 * 1000);

      schedules.push(timeout);
    });

    this.notificationSchedule.set(campaignId, schedules);

    // 실시간 구독도 설정
    this.subscribeToApplications(campaignId, advertiserId);

    return { success: true, scheduledIntervals: intervals };
  }

  /**
   * 지원자 요약 알림 전송
   */
  private async sendApplicationSummary(
    campaignId: string,
    advertiserId: string,
    options: {
      includeAI?: boolean;
      minApplicants?: number;
    }
  ) {
    // 새로운 지원자 조회
    const { data: applications, error } = await this.supabase
      .from('campaign_influencers')
      .select(`
        *,
        influencer:influencers(*)
      `)
      .eq('campaign_id', campaignId)
      .eq('notified', false)
      .order('created_at', { ascending: false });

    if (!applications || applications.length < (options.minApplicants || 1)) {
      return;
    }

    // 캠페인 정보 조회
    const { data: campaign } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    let notification: NotificationPayload = {
      type: 'application_summary',
      title: `🎯 캠페인 지원자 알림`,
      body: `"${campaign?.name}"에 ${applications.length}명의 새로운 지원자가 있습니다.`,
      data: {
        campaignId,
        applicantCount: applications.length,
        topApplicants: []
      }
    };

    // AI 분석 포함
    if (options.includeAI && campaign) {
      const aiResults = AIAnalyzer.recommendInfluencers(
        {
          id: campaign.id,
          name: campaign.name,
          budget: campaign.budget,
          categories: campaign.categories,
          targetAgeRange: campaign.target_age_range,
          minEngagementRate: campaign.min_engagement_rate
        },
        applications.map(app => ({
          id: app.influencer.id,
          name: app.influencer.name,
          followers: app.influencer.followers_count,
          engagementRate: app.influencer.engagement_rate,
          primaryCategory: app.influencer.categories[0],
          categories: app.influencer.categories,
          completedCampaigns: app.influencer.completed_campaigns,
          avgRating: app.influencer.avg_rating
        })),
        { maxResults: 3 }
      );

      notification.body = `🤖 AI가 ${applications.length}명 중 TOP 3를 선정했습니다!`;
      notification.data.topApplicants = aiResults.map(result => ({
        influencerId: result.influencer.id,
        name: result.influencer.name,
        matchScore: result.matchScore,
        recommendation: result.recommendation,
        estimatedPrice: result.pricing.recommended
      }));
    }

    // 알림 전송
    await this.sendNotification(advertiserId, notification);

    // 지원자들을 notified로 표시
    await this.supabase
      .from('campaign_influencers')
      .update({ notified: true })
      .in('id', applications.map(a => a.id));
  }

  /**
   * 실시간 지원 알림 구독
   */
  private subscribeToApplications(campaignId: string, advertiserId: string) {
    const channel = this.supabase
      .channel(`campaign-applications-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_influencers',
          filter: `campaign_id=eq.${campaignId}`
        },
        async (payload) => {
          // 즉시 알림 (첫 지원자 또는 VIP 인플루언서)
          const { data: influencer } = await this.supabase
            .from('influencers')
            .select('*')
            .eq('id', payload.new.influencer_id)
            .single();

          if (influencer && (
            payload.new.is_first || 
            influencer.tier === 'vip' ||
            influencer.followers_count > 1000000
          )) {
            await this.sendNotification(advertiserId, {
              type: 'instant_application',
              title: '⚡ 즉시 알림',
              body: influencer.tier === 'vip' 
                ? `VIP 인플루언서 "${influencer.name}"님이 지원했습니다!`
                : `첫 번째 지원자 "${influencer.name}"님이 도착했습니다!`,
              priority: 'high',
              data: {
                campaignId,
                influencerId: influencer.id,
                followers: influencer.followers_count,
                engagementRate: influencer.engagement_rate
              }
            });
          }
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * 알림 전송
   */
  private async sendNotification(
    userId: string,
    notification: NotificationPayload
  ) {
    // 데이터베이스에 알림 저장
    await this.supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        priority: notification.priority || 'normal',
        is_read: false
      });

    // 푸시 알림 전송 (FCM, OneSignal 등)
    if (notification.priority === 'high') {
      await this.sendPushNotification(userId, notification);
    }

    // 이메일 알림 (선택적)
    if (notification.type === 'application_summary') {
      await this.sendEmailNotification(userId, notification);
    }
  }

  /**
   * 푸시 알림 전송
   */
  private async sendPushNotification(userId: string, notification: NotificationPayload) {
    // FCM 또는 OneSignal 통합
    console.log('푸시 알림 전송:', { userId, notification });
    
    // 실제 구현 시:
    // await fcm.send({
    //   token: userFcmToken,
    //   notification: {
    //     title: notification.title,
    //     body: notification.body
    //   },
    //   data: notification.data
    // });
  }

  /**
   * 이메일 알림 전송
   */
  private async sendEmailNotification(userId: string, notification: NotificationPayload) {
    const { data: user } = await this.supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (!user?.email) return;

    // 이메일 템플릿 생성
    const emailHtml = this.generateEmailTemplate(notification, user.name);

    // 이메일 전송 (SendGrid, AWS SES 등)
    console.log('이메일 전송:', { to: user.email, subject: notification.title });

    // 실제 구현 시:
    // await sendgrid.send({
    //   to: user.email,
    //   subject: notification.title,
    //   html: emailHtml
    // });
  }

  /**
   * 이메일 템플릿 생성
   */
  private generateEmailTemplate(notification: NotificationPayload, userName?: string): string {
    const topApplicants = notification.data.topApplicants || [];
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
            .applicant-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px; }
            .score { display: inline-block; background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 14px; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ITDA Business</h1>
              <h2>${notification.title}</h2>
            </div>
            <div class="content">
              <p>안녕하세요 ${userName || ''}님,</p>
              <p>${notification.body}</p>
              
              ${topApplicants.length > 0 ? `
                <h3>🏆 AI 추천 TOP 인플루언서</h3>
                ${topApplicants.map((applicant, idx) => `
                  <div class="applicant-card">
                    <h4>${idx + 1}. ${applicant.name}</h4>
                    <p><span class="score">매칭점수 ${applicant.matchScore}점</span></p>
                    <p>예상 단가: ${applicant.estimatedPrice.toLocaleString()}원</p>
                    <p>💡 ${applicant.recommendation}</p>
                  </div>
                `).join('')}
              ` : ''}
              
              <a href="https://itda.app/campaigns/${notification.data.campaignId}" class="button">
                지원자 상세보기 →
              </a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * 스케줄 취소
   */
  private clearSchedule(campaignId: string) {
    const schedules = this.notificationSchedule.get(campaignId);
    if (schedules) {
      schedules.forEach(timeout => clearTimeout(timeout));
      this.notificationSchedule.delete(campaignId);
    }
  }

  /**
   * 모든 스케줄 정리
   */
  cleanup() {
    this.notificationSchedule.forEach((schedules, campaignId) => {
      this.clearSchedule(campaignId);
    });
  }
}

// 타입 정의
interface NotificationPayload {
  type: 'application_summary' | 'instant_application' | 'campaign_update';
  title: string;
  body: string;
  priority?: 'high' | 'normal' | 'low';
  data: {
    campaignId: string;
    applicantCount?: number;
    topApplicants?: Array<{
      influencerId: string;
      name: string;
      matchScore: number;
      recommendation: string;
      estimatedPrice: number;
    }>;
    [key: string]: any;
  };
}

// 사용 예시
export const notificationSystem = new AdvertiserNotificationSystem();