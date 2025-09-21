-- supabase/migrations/002_notification_system.sql

-- ============================================
-- Push 구독 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Push 구독 정보
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL, -- { p256dh, auth }
  
  -- 디바이스 정보
  device_info JSONB, -- { browser, os, device, user_agent }
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, endpoint)
);

-- ============================================
-- 알림 설정 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- 채널 설정
  channels JSONB DEFAULT '{"push": true, "email": true, "sms": false, "inApp": true}'::jsonb,
  
  -- 타입별 설정
  types JSONB DEFAULT '{}'::jsonb,
  
  -- 방해 금지 시간
  quiet_hours JSONB DEFAULT '{"enabled": false, "start": "22:00", "end": "08:00", "timezone": "Asia/Seoul"}'::jsonb,
  
  -- 그룹화 설정
  grouping JSONB DEFAULT '{"enabled": true, "interval": 30}'::jsonb,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 알림 테이블 확장 (기존 테이블 수정)
-- ============================================
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS action_url TEXT,
  ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'navigate' CHECK (action_type IN ('navigate', 'modal', 'external')),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS group_id TEXT,
  ADD COLUMN IF NOT EXISTS group_count INTEGER DEFAULT 1;

-- ============================================
-- 알림 템플릿 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 템플릿 정보
  type TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  
  -- 기본 설정
  default_priority TEXT DEFAULT 'medium',
  default_icon TEXT,
  default_color TEXT,
  default_channels JSONB DEFAULT '["push", "inApp"]'::jsonb,
  
  -- 액션 설정
  default_actions JSONB DEFAULT '[]'::jsonb,
  
  -- 메타데이터
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 알림 로그 테이블 (분석용)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 이벤트 정보
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'clicked', 'dismissed', 'failed')),
  channel TEXT CHECK (channel IN ('push', 'email', 'sms', 'inApp')),
  
  -- 상세 정보
  metadata JSONB,
  error_message TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 인덱스 생성
-- ============================================

-- Push 구독 인덱스
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- 알림 설정 인덱스
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- 알림 인덱스 (추가)
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_group ON notifications(group_id);

-- 알림 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_event ON notification_logs(event_type);

-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

-- Push 구독 정책
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 알림 설정 정책
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 알림 정책 (기존 테이블)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- 알림 로그 정책
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification logs"
  ON notification_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notification logs"
  ON notification_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 트리거 함수
-- ============================================

-- 알림 생성시 로그 기록
CREATE OR REPLACE FUNCTION log_notification_sent()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_logs (
    notification_id,
    user_id,
    event_type,
    channel,
    metadata
  ) VALUES (
    NEW.id,
    NEW.user_id,
    'sent',
    'inApp',
    jsonb_build_object(
      'type', NEW.type,
      'priority', NEW.priority
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_notification_sent
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION log_notification_sent();

-- 알림 읽음시 로그 기록
CREATE OR REPLACE FUNCTION log_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_read = false AND NEW.is_read = true THEN
    INSERT INTO notification_logs (
      notification_id,
      user_id,
      event_type,
      metadata
    ) VALUES (
      NEW.id,
      NEW.user_id,
      'clicked',
      jsonb_build_object(
        'read_at', NEW.read_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_notification_read
  AFTER UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION log_notification_read();

-- ============================================
-- 기본 알림 템플릿 삽입
-- ============================================

INSERT INTO notification_templates (type, title_template, message_template, default_priority, default_icon, default_color) VALUES
-- 인플루언서용
('campaign_match', '🎯 새로운 매칭: {{campaign_name}}', '{{brand}}의 새 캠페인이 {{match_score}}% 매칭되었습니다!', 'high', '🎯', 'purple'),
('application_accepted', '✅ 지원이 승인되었습니다!', '{{campaign_name}} 캠페인에 선정되었습니다. 축하합니다!', 'high', '✅', 'green'),
('application_rejected', '📋 지원 결과 안내', '{{campaign_name}} 캠페인은 다른 인플루언서가 선정되었습니다.', 'low', '📋', 'gray'),
('payment_received', '💰 정산이 완료되었습니다!', '{{amount}}원이 입금되었습니다.', 'high', '💰', 'green'),
('campaign_deadline', '⏰ 마감 임박!', '{{campaign_name}} 캠페인이 {{hours}}시간 후 마감됩니다.', 'medium', '⏰', 'orange'),
('new_message', '💬 {{sender_name}}님의 메시지', '{{message_preview}}', 'medium', '💬', 'blue'),
('campaign_reminder', '📅 캠페인 리마인더', '{{campaign_name}} 콘텐츠 제출일이 {{days}}일 남았습니다.', 'medium', '📅', 'blue'),
('profile_view', '👀 프로필 조회', '{{viewer_name}}님이 당신의 프로필을 확인했습니다.', 'low', '👀', 'purple'),
('super_like', '⭐ 슈퍼라이크를 받았습니다!', '{{brand}}가 당신에게 특별한 관심을 보였습니다!', 'high', '⭐', 'yellow'),

-- 광고주용
('new_applicant', '🔔 새 지원자 {{count}}명', '{{campaign_name}}에 새로운 인플루언서가 지원했습니다.', 'high', '🔔', 'purple'),
('milestone_reached', '🏆 마일스톤 달성!', '캠페인이 {{milestone}}을 달성했습니다!', 'medium', '🏆', 'gold'),
('ai_insight', '🤖 AI 분석 완료', '{{insight_type}}: {{summary}}', 'medium', '🤖', 'blue'),
('budget_alert', '💳 예산 알림', '예산의 {{percentage}}%가 사용되었습니다.', 'high', '💳', 'orange'),
('campaign_completed', '🎉 캠페인 완료!', '{{campaign_name}}이 성공적으로 완료되었습니다.', 'medium', '🎉', 'green'),
('review_submitted', '⭐ 새 리뷰', '{{influencer_name}}님이 {{rating}}점 리뷰를 남겼습니다.', 'low', '⭐', 'yellow'),
('content_uploaded', '📸 콘텐츠 업로드', '{{influencer_name}}님이 콘텐츠를 업로드했습니다.', 'medium', '📸', 'purple'),
('high_match_alert', '🔥 높은 매칭률!', '{{influencer_name}}님이 {{match_score}}% 매칭됩니다!', 'high', '🔥', 'red'),

-- 공통
('system_update', '📢 시스템 업데이트', '{{message}}', 'low', '📢', 'gray'),
('promotion', '🎁 특별 프로모션!', '{{message}}', 'medium', '🎁', 'pink'),
('achievement', '🏅 업적 달성!', '"{{achievement_name}}" 업적을 달성했습니다!', 'medium', '🏅', 'gold')
ON CONFLICT (type) DO NOTHING;

-- ============================================
-- 함수: 알림 생성 헬퍼
-- ============================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_template notification_templates%ROWTYPE;
  v_title TEXT;
  v_message TEXT;
  v_notification_id UUID;
BEGIN
  -- 템플릿 가져오기
  SELECT * INTO v_template
  FROM notification_templates
  WHERE type = p_type AND is_active = true;
  
  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Notification template not found for type: %', p_type;
  END IF;
  
  -- 템플릿 렌더링 (간단한 치환)
  v_title := v_template.title_template;
  v_message := v_template.message_template;
  
  -- 메타데이터 기반 치환
  FOR key, value IN SELECT * FROM jsonb_each_text(p_metadata)
  LOOP
    v_title := REPLACE(v_title, '{{' || key || '}}', value);
    v_message := REPLACE(v_message, '{{' || key || '}}', value);
  END LOOP;
  
  -- 알림 생성
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata,
    priority,
    icon,
    color
  ) VALUES (
    p_user_id,
    p_type,
    v_title,
    v_message,
    p_metadata,
    v_template.default_priority,
    v_template.default_icon,
    v_template.default_color
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;