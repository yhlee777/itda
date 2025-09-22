-- supabase/migrations/003_swipe_and_queue_tables.sql

-- ============================================
-- 스와이프 히스토리 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS swipe_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
  match_score DECIMAL(5,2),
  category_match BOOLEAN DEFAULT false,
  
  swiped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(influencer_id, campaign_id)
);

-- ============================================
-- 캠페인 큐 테이블 (인플루언서별 캠페인 대기열)
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  queue_order INTEGER NOT NULL,
  category_priority INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '3 hours'),
  
  UNIQUE(influencer_id, campaign_id)
);

-- ============================================
-- 알림 설정 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- 채널별 설정
  channels JSONB DEFAULT '{
    "push": true,
    "email": true,
    "sms": false,
    "inApp": true
  }'::jsonb,
  
  -- 알림 유형별 설정
  types JSONB DEFAULT '{
    "campaign_match": true,
    "new_applicant": true,
    "application_accepted": true,
    "payment_received": true,
    "ai_insight": true
  }'::jsonb,
  
  -- 방해금지 시간
  quiet_hours JSONB DEFAULT '{
    "enabled": false,
    "start": "22:00",
    "end": "08:00",
    "timezone": "Asia/Seoul"
  }'::jsonb,
  
  -- 그룹화 설정
  grouping JSONB DEFAULT '{
    "enabled": true,
    "interval": 30
  }'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 채팅방 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  contract_status TEXT DEFAULT 'none' CHECK (contract_status IN ('none', 'proposed', 'negotiating', 'accepted', 'completed')),
  
  unread_advertiser INTEGER DEFAULT 0,
  unread_influencer INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(campaign_id, advertiser_id, influencer_id)
);

-- ============================================
-- 메시지 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('influencer', 'advertiser', 'system')),
  
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 알림 추가 컬럼
-- ============================================
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS action_url TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ============================================
-- 인덱스 생성
-- ============================================

CREATE INDEX IF NOT EXISTS idx_swipe_history_influencer ON swipe_history(influencer_id, swiped_at DESC);
CREATE INDEX IF NOT EXISTS idx_swipe_history_campaign ON swipe_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_swipe_history_action ON swipe_history(action);

CREATE INDEX IF NOT EXISTS idx_campaign_queue_influencer ON campaign_queue(influencer_id, queue_order);
CREATE INDEX IF NOT EXISTS idx_campaign_queue_expires ON campaign_queue(expires_at);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_campaign ON chat_rooms(campaign_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_participants ON chat_rooms(advertiser_id, influencer_id);

CREATE INDEX IF NOT EXISTS idx_messages_chat_room ON messages(chat_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(chat_room_id, is_read);

-- ============================================
-- RLS 정책
-- ============================================

ALTER TABLE swipe_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 스와이프 히스토리는 본인 것만
CREATE POLICY "Users view own swipe history" ON swipe_history
  FOR ALL USING (auth.uid() = influencer_id);

-- 캠페인 큐는 본인 것만
CREATE POLICY "Users view own campaign queue" ON campaign_queue
  FOR SELECT USING (auth.uid() = influencer_id);

-- 알림 설정은 본인 것만
CREATE POLICY "Users manage own notification preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 채팅방은 참여자만
CREATE POLICY "Chat participants only" ON chat_rooms
  FOR ALL USING (auth.uid() IN (advertiser_id, influencer_id));

-- 메시지는 채팅방 참여자만
CREATE POLICY "Message access for participants" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = messages.chat_room_id
      AND auth.uid() IN (chat_rooms.advertiser_id, chat_rooms.influencer_id)
    )
  );

-- ============================================
-- 트리거 함수
-- ============================================

-- 메시지 전송 시 미읽음 카운트 증가
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sender_type = 'advertiser' THEN
    UPDATE chat_rooms
    SET unread_influencer = unread_influencer + 1
    WHERE id = NEW.chat_room_id;
  ELSIF NEW.sender_type = 'influencer' THEN
    UPDATE chat_rooms
    SET unread_advertiser = unread_advertiser + 1
    WHERE id = NEW.chat_room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_count();

-- 캠페인 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_campaign_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET view_count = view_count + 1
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 스와이프 액션에 따른 카운트 업데이트
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'like' OR NEW.action = 'super_like' THEN
    UPDATE campaigns
    SET like_count = like_count + 1
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_swipe_action
  AFTER INSERT ON swipe_history
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();