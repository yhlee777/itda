-- supabase/migrations/006_fix_schema_issues.sql
-- 기존 스키마와 코드 간 차이점 해결

-- ============================================
-- campaign_influencers 테이블 수정
-- ============================================
-- proposed_price 필드 추가 (agreed_price와 별도로)
ALTER TABLE campaign_influencers 
  ADD COLUMN IF NOT EXISTS proposed_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 기존 agreed_price 값을 proposed_price로 복사
UPDATE campaign_influencers 
SET proposed_price = agreed_price 
WHERE proposed_price IS NULL AND agreed_price IS NOT NULL;

-- ============================================
-- campaigns 테이블 수정
-- ============================================
-- deadline 필드 추가 (end_date와 동일하게)
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS max_followers INTEGER DEFAULT 999999999;

-- end_date 값을 deadline으로 복사
UPDATE campaigns 
SET deadline = end_date 
WHERE deadline IS NULL;

-- ============================================
-- campaign_queue 테이블 수정
-- ============================================
-- position과 match_score 필드 추가
ALTER TABLE campaign_queue
  ADD COLUMN IF NOT EXISTS position INTEGER,
  ADD COLUMN IF NOT EXISTS match_score NUMERIC(5,2) DEFAULT 0;

-- queue_order 값을 position으로 복사
UPDATE campaign_queue 
SET position = queue_order 
WHERE position IS NULL;

-- ============================================
-- 뷰 생성 (호환성을 위한)
-- ============================================
CREATE OR REPLACE VIEW v_applications AS
SELECT 
  ci.*,
  ci.agreed_price as proposed_price,
  ci.accepted_at as reviewed_at,
  c.end_date as deadline
FROM campaign_influencers ci
JOIN campaigns c ON ci.campaign_id = c.id;

-- ============================================
-- 함수 생성: 안전한 지원 생성
-- ============================================
CREATE OR REPLACE FUNCTION safe_create_application(
  p_campaign_id UUID,
  p_influencer_id UUID,
  p_proposed_price NUMERIC,
  p_cover_letter TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_application_id UUID;
BEGIN
  INSERT INTO campaign_influencers (
    campaign_id,
    influencer_id,
    agreed_price,
    proposed_price,
    status,
    deliverables,
    applied_at
  ) VALUES (
    p_campaign_id,
    p_influencer_id,
    p_proposed_price,  -- agreed_price에도 같은 값
    p_proposed_price,  -- proposed_price
    'pending',
    CASE WHEN p_cover_letter IS NOT NULL 
      THEN jsonb_build_object('coverLetter', p_cover_letter)
      ELSE NULL
    END,
    NOW()
  )
  RETURNING id INTO v_application_id;
  
  RETURN v_application_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 트리거: 필드 동기화
-- ============================================
CREATE OR REPLACE FUNCTION sync_campaign_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- end_date와 deadline 동기화
  IF NEW.end_date IS DISTINCT FROM OLD.end_date THEN
    NEW.deadline := NEW.end_date;
  ELSIF NEW.deadline IS DISTINCT FROM OLD.deadline THEN
    NEW.end_date := NEW.deadline;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_campaign_fields ON campaigns;
CREATE TRIGGER trigger_sync_campaign_fields
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION sync_campaign_fields();

-- ============================================
-- campaign_queue 동기화 트리거
-- ============================================
CREATE OR REPLACE FUNCTION sync_queue_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- queue_order와 position 동기화
  IF NEW.queue_order IS DISTINCT FROM OLD.queue_order THEN
    NEW.position := NEW.queue_order;
  ELSIF NEW.position IS DISTINCT FROM OLD.position THEN
    NEW.queue_order := NEW.position;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_queue_fields ON campaign_queue;
CREATE TRIGGER trigger_sync_queue_fields
  BEFORE UPDATE ON campaign_queue
  FOR EACH ROW
  EXECUTE FUNCTION sync_queue_fields();

-- ============================================
-- 인덱스 최적화
-- ============================================
CREATE INDEX IF NOT EXISTS idx_campaigns_deadline ON campaigns(deadline);
CREATE INDEX IF NOT EXISTS idx_campaign_influencers_proposed ON campaign_influencers(proposed_price);
CREATE INDEX IF NOT EXISTS idx_queue_position ON campaign_queue(influencer_id, position);

-- ============================================
-- 실행 로그
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 스키마 호환성 문제 해결 완료';
  RAISE NOTICE '- proposed_price 필드 추가됨';
  RAISE NOTICE '- deadline 필드 추가됨';
  RAISE NOTICE '- position 필드 추가됨';
  RAISE NOTICE '- 자동 동기화 트리거 설정됨';
END $$;