-- supabase/migrations/004_matching_system.sql

-- ============================================
-- 인플루언서 테이블에 매칭 관련 컬럼 추가
-- ============================================
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS daily_swipes_count INTEGER DEFAULT 0;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS daily_swipes_reset_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS last_swipe_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS preferred_categories TEXT[] DEFAULT '{}';

-- ============================================
-- 캠페인 테이블에 매칭 관련 컬럼 추가
-- ============================================
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'medium' 
  CHECK (urgency IN ('high', 'medium', 'low'));
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ============================================
-- 알림 테이블에 우선순위 추가
-- ============================================
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' 
  CHECK (priority IN ('high', 'medium', 'low'));
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 채팅방 테이블 수정 (nullable로 변경)
-- ============================================
ALTER TABLE chat_rooms ALTER COLUMN campaign_id DROP NOT NULL;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
  CHECK (status IN ('active', 'archived', 'blocked'));
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'none' 
  CHECK (contract_status IN ('none', 'proposed', 'negotiating', 'accepted', 'completed'));

-- ============================================
-- Edge Function 호출 권한 설정
-- ============================================
GRANT EXECUTE ON FUNCTION generate_campaign_queue TO authenticated;
GRANT EXECUTE ON FUNCTION reset_daily_swipes TO authenticated;

-- ============================================
-- 매칭 관련 함수들
-- ============================================

-- 캠페인 큐 생성 함수
CREATE OR REPLACE FUNCTION generate_campaign_queue(
  p_influencer_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS VOID AS $$
DECLARE
  v_categories TEXT[];
  v_seen_campaigns UUID[];
BEGIN
  -- 인플루언서 카테고리 조회
  SELECT categories INTO v_categories
  FROM influencers
  WHERE id = p_influencer_id;
  
  -- 이미 본 캠페인 조회
  SELECT ARRAY_AGG(campaign_id) INTO v_seen_campaigns
  FROM swipe_history
  WHERE influencer_id = p_influencer_id;
  
  -- 기존 큐 삭제
  DELETE FROM campaign_queue
  WHERE influencer_id = p_influencer_id;
  
  -- 새로운 큐 생성 (카테고리 우선, 프리미엄 우선, 긴급 우선)
  INSERT INTO campaign_queue (
    influencer_id,
    campaign_id,
    queue_order,
    category_priority,
    expires_at
  )
  SELECT 
    p_influencer_id,
    c.id,
    ROW_NUMBER() OVER (ORDER BY 
      CASE WHEN c.is_premium THEN 0 ELSE 1 END,
      CASE WHEN c.urgency = 'high' THEN 0 WHEN c.urgency = 'medium' THEN 1 ELSE 2 END,
      CASE WHEN c.categories && v_categories THEN 0 ELSE 1 END,
      c.created_at DESC
    ),
    CASE 
      WHEN c.categories && v_categories THEN 3
      WHEN EXISTS (
        SELECT 1 FROM unnest(c.categories) cat 
        WHERE cat = ANY(v_categories)
      ) THEN 2
      ELSE 1
    END,
    NOW() + INTERVAL '3 hours'
  FROM campaigns c
  WHERE c.status = 'active'
    AND c.end_date >= NOW()
    AND (v_seen_campaigns IS NULL OR NOT (c.id = ANY(v_seen_campaigns)))
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 일일 스와이프 리셋 함수
CREATE OR REPLACE FUNCTION reset_daily_swipes(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE influencers
  SET 
    daily_swipes_count = 0,
    daily_swipes_reset_at = NOW()
  WHERE id = p_user_id
    AND (daily_swipes_reset_at IS NULL 
         OR daily_swipes_reset_at < NOW() - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 매칭 시 자동 채팅방 생성 트리거
CREATE OR REPLACE FUNCTION create_chat_room_on_match()
RETURNS TRIGGER AS $$
BEGIN
  -- 이미 채팅방이 있는지 확인
  IF NOT EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE campaign_id = NEW.campaign_id
      AND influencer_id = NEW.influencer_id
  ) THEN
    INSERT INTO chat_rooms (
      campaign_id,
      advertiser_id,
      influencer_id,
      status,
      contract_status
    )
    SELECT 
      NEW.campaign_id,
      c.advertiser_id,
      NEW.influencer_id,
      'active',
      'none'
    FROM campaigns c
    WHERE c.id = NEW.campaign_id
      AND c.advertiser_id IS NOT NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_create_chat_on_match ON campaign_influencers;
CREATE TRIGGER trigger_create_chat_on_match
  AFTER INSERT ON campaign_influencers
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION create_chat_room_on_match();

-- 캠페인 통계 업데이트 트리거
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'swipe_history' THEN
    -- 좋아요 카운트 증가
    IF NEW.action IN ('like', 'super_like') THEN
      UPDATE campaigns
      SET like_count = like_count + 1
      WHERE id = NEW.campaign_id;
    END IF;
    
    -- 조회수 증가
    UPDATE campaigns
    SET view_count = view_count + 1
    WHERE id = NEW.campaign_id;
    
  ELSIF TG_TABLE_NAME = 'campaign_influencers' THEN
    -- 지원자 수 증가
    UPDATE campaigns
    SET application_count = application_count + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_campaign_stats_swipe ON swipe_history;
CREATE TRIGGER trigger_update_campaign_stats_swipe
  AFTER INSERT ON swipe_history
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();

DROP TRIGGER IF EXISTS trigger_update_campaign_stats_apply ON campaign_influencers;
CREATE TRIGGER trigger_update_campaign_stats_apply
  AFTER INSERT ON campaign_influencers
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();

-- ============================================
-- 실시간 알림 생성 함수
-- ============================================
CREATE OR REPLACE FUNCTION create_notification_simple(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata,
    priority,
    action_url
  )
  VALUES (
    p_user_id,
    p_type::notification_type,
    p_title,
    p_message,
    p_metadata,
    p_priority,
    p_action_url
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 인덱스 생성
-- ============================================
CREATE INDEX IF NOT EXISTS idx_campaign_queue_influencer 
  ON campaign_queue(influencer_id, queue_order);
CREATE INDEX IF NOT EXISTS idx_campaign_queue_expires 
  ON campaign_queue(expires_at);
CREATE INDEX IF NOT EXISTS idx_swipe_history_influencer 
  ON swipe_history(influencer_id, swiped_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_active 
  ON campaigns(status, end_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================
-- RLS 정책 업데이트
-- ============================================

-- 인플루언서는 자신의 큐만 볼 수 있음
CREATE POLICY "Influencers view own queue" ON campaign_queue
  FOR SELECT USING (auth.uid() = influencer_id);

-- 인플루언서는 자신의 스와이프 기록만 볼 수 있음
CREATE POLICY "Influencers view own swipes" ON swipe_history
  FOR ALL USING (auth.uid() = influencer_id);

-- 캠페인 통계는 모두 볼 수 있음
CREATE POLICY "Everyone can view campaign stats" ON campaigns
  FOR SELECT USING (true);

-- ============================================
-- 샘플 데이터 (선택사항)
-- ============================================
/*
-- 테스트용 긴급 캠페인 생성
UPDATE campaigns 
SET urgency = 'high', is_premium = true
WHERE id IN (
  SELECT id FROM campaigns 
  WHERE status = 'active' 
  ORDER BY budget DESC 
  LIMIT 2
);

-- 테스트용 카테고리 설정
UPDATE influencers
SET preferred_categories = categories
WHERE preferred_categories = '{}';
*/