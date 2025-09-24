-- supabase/migrations/005_daily_swipe_tracking.sql

-- ============================================
-- 인플루언서 테이블에 일일 스와이프 추적 컬럼 추가
-- ============================================

ALTER TABLE influencers
  ADD COLUMN IF NOT EXISTS daily_swipes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_swipe_date DATE,
  ADD COLUMN IF NOT EXISTS last_swipe_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS total_swipes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- RPC 함수: 컬럼 값 증가
-- ============================================

CREATE OR REPLACE FUNCTION increment(
  table_name text,
  column_name text,
  row_id uuid
)
RETURNS void AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET %I = COALESCE(%I, 0) + 1 WHERE id = $1',
    table_name, column_name, column_name
  ) USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 일일 스와이프 리셋 함수 (크론잡용)
-- ============================================

CREATE OR REPLACE FUNCTION reset_daily_swipes()
RETURNS void AS $$
BEGIN
  UPDATE influencers
  SET daily_swipes_count = 0
  WHERE last_swipe_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 스와이프 통계 뷰
-- ============================================

CREATE OR REPLACE VIEW swipe_statistics AS
SELECT 
  i.id as influencer_id,
  i.username,
  i.daily_swipes_count,
  i.total_swipes_count,
  i.last_swipe_at,
  COUNT(CASE WHEN sh.action = 'like' THEN 1 END) as total_likes,
  COUNT(CASE WHEN sh.action = 'super_like' THEN 1 END) as total_super_likes,
  COUNT(CASE WHEN sh.action = 'pass' THEN 1 END) as total_passes,
  COUNT(CASE 
    WHEN sh.swiped_at >= CURRENT_DATE THEN 1 
  END) as today_swipes
FROM influencers i
LEFT JOIN swipe_history sh ON i.id = sh.influencer_id
GROUP BY i.id, i.username, i.daily_swipes_count, i.total_swipes_count, i.last_swipe_at;

-- ============================================
-- 인덱스 추가
-- ============================================

CREATE INDEX IF NOT EXISTS idx_influencers_last_swipe_date 
  ON influencers(last_swipe_date);
CREATE INDEX IF NOT EXISTS idx_influencers_premium_expires 
  ON influencers(premium_expires_at) 
  WHERE premium_expires_at IS NOT NULL;

-- ============================================
-- 트리거: 총 스와이프 수 자동 업데이트
-- ============================================

CREATE OR REPLACE FUNCTION update_total_swipes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE influencers
  SET total_swipes_count = COALESCE(total_swipes_count, 0) + 1
  WHERE id = NEW.influencer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_total_swipes ON swipe_history;
CREATE TRIGGER trigger_update_total_swipes
  AFTER INSERT ON swipe_history
  FOR EACH ROW
  EXECUTE FUNCTION update_total_swipes();

-- ============================================
-- 프리미엄 체크 함수
-- ============================================

CREATE OR REPLACE FUNCTION is_premium_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT premium_expires_at INTO expires_at
  FROM influencers
  WHERE id = user_id;
  
  RETURN expires_at IS NOT NULL AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 일일 제한 체크 함수
-- ============================================

CREATE OR REPLACE FUNCTION get_remaining_swipes(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  is_premium BOOLEAN;
  daily_count INTEGER;
  last_date DATE;
BEGIN
  -- 프리미엄 체크
  is_premium := is_premium_user(user_id);
  
  IF is_premium THEN
    RETURN 999; -- 무제한
  END IF;
  
  -- 일반 사용자: 10개 제한
  SELECT daily_swipes_count, last_swipe_date 
  INTO daily_count, last_date
  FROM influencers
  WHERE id = user_id;
  
  -- 날짜가 다르면 리셋
  IF last_date IS NULL OR last_date < CURRENT_DATE THEN
    RETURN 10;
  END IF;
  
  RETURN GREATEST(0, 10 - COALESCE(daily_count, 0));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 샘플 데이터 업데이트 (선택사항)
-- ============================================

-- 테스트용 인플루언서에 스와이프 데이터 추가
UPDATE influencers 
SET 
  daily_swipes_count = 3,
  last_swipe_date = CURRENT_DATE,
  last_swipe_at = NOW() - INTERVAL '2 hours',
  total_swipes_count = 45
WHERE id IN (
  SELECT id FROM influencers 
  LIMIT 1
);