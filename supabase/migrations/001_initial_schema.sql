-- supabase/migrations/001_initial_schema.sql

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 사용자 테이블
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('influencer', 'advertiser', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 광고주 테이블 (개선됨)
-- ============================================
CREATE TABLE advertisers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_registration TEXT UNIQUE NOT NULL,
  contact_name TEXT NOT NULL,
  contact_position TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  industry TEXT,
  marketing_budget TEXT,
  company_logo TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 인플루언서 테이블 (개선됨)
-- ============================================
CREATE TABLE influencers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar TEXT,
  bio TEXT,
  categories TEXT[] DEFAULT '{}',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- 오디언스 정보
  audience_demographics JSONB DEFAULT '{}',
  
  -- 성과 지표
  average_likes INTEGER DEFAULT 0,
  average_comments INTEGER DEFAULT 0,
  average_reach INTEGER DEFAULT 0,
  
  -- 가용성
  availability JSONB DEFAULT '{"status": "immediate"}',
  
  -- 등급 및 검증
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'gold', 'premium')),
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  
  -- 성장률
  growth_rate DECIMAL(5,2) DEFAULT 0,
  content_quality_score DECIMAL(3,1) DEFAULT 0,
  
  -- 결제 정보
  bank_account JSONB,
  
  -- 통계
  total_campaigns INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  
  -- 소셜미디어 플랫폼 정보 (추가됨)
  status TEXT DEFAULT 'active',
  main_platform TEXT,
  instagram_username TEXT,
  youtube_channel TEXT,
  tiktok_username TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 캠페인 테이블
-- ============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
  
  -- 기본 정보
  name TEXT NOT NULL,
  description TEXT,
  objectives TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  
  -- 예산 및 기간
  budget DECIMAL(12,2) NOT NULL,
  spent DECIMAL(12,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- 타겟 설정
  target_audience JSONB DEFAULT '{}',
  min_followers INTEGER DEFAULT 0,
  min_engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- 요구사항
  deliverables JSONB DEFAULT '[]',
  requirements TEXT[] DEFAULT '{}',
  
  -- 상태
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'matching', 'in_progress', 'completed', 'cancelled')),
  
  -- 성과 지표
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 캠페인-인플루언서 매칭
-- ============================================
CREATE TABLE campaign_influencers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  
  -- 매칭 정보
  match_score DECIMAL(5,2),
  match_details JSONB,
  
  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed')),
  
  -- 계약 조건
  agreed_price DECIMAL(12,2),
  deliverables JSONB,
  
  -- 날짜
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- 성과
  content_links JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  rating DECIMAL(3,2),
  review TEXT,
  
  UNIQUE(campaign_id, influencer_id)
);

-- ============================================
-- 매칭 히스토리
-- ============================================
CREATE TABLE matching_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  matched_influencers JSONB NOT NULL,
  filters_used JSONB,
  total_analyzed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 알림
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 인덱스 생성
-- ============================================

-- 사용자 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);

-- 광고주 인덱스
CREATE INDEX idx_advertisers_is_verified ON advertisers(is_verified);
CREATE INDEX idx_advertisers_business_registration ON advertisers(business_registration);

-- 인플루언서 인덱스
CREATE INDEX idx_influencers_username ON influencers(username);
CREATE INDEX idx_influencers_categories ON influencers USING GIN(categories);
CREATE INDEX idx_influencers_followers ON influencers(followers_count);
CREATE INDEX idx_influencers_engagement ON influencers(engagement_rate);
CREATE INDEX idx_influencers_tier ON influencers(tier);
CREATE INDEX idx_influencers_status ON influencers(status);

-- 캠페인 인덱스
CREATE INDEX idx_campaigns_advertiser ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_categories ON campaigns USING GIN(categories);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- 매칭 인덱스
CREATE INDEX idx_campaign_influencers_campaign ON campaign_influencers(campaign_id);
CREATE INDEX idx_campaign_influencers_influencer ON campaign_influencers(influencer_id);
CREATE INDEX idx_campaign_influencers_status ON campaign_influencers(status);

-- 알림 인덱스
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================
-- 트리거 함수
-- ============================================

-- Updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_influencers_updated_at BEFORE UPDATE ON influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_advertisers_updated_at BEFORE UPDATE ON advertisers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 볼 수 있음
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 인플루언서 프로필은 모두 볼 수 있음 (공개 프로필)
CREATE POLICY "Public influencer profiles" ON influencers
  FOR SELECT USING (true);

-- 자신의 프로필만 수정 가능
CREATE POLICY "Influencers can update own profile" ON influencers
  FOR UPDATE USING (auth.uid() = id);

-- 캠페인은 활성 상태인 것만 공개
CREATE POLICY "Public active campaigns" ON campaigns
  FOR SELECT USING (status IN ('active', 'matching', 'in_progress'));

-- 광고주는 자신의 모든 캠페인 관리 가능
CREATE POLICY "Advertisers manage own campaigns" ON campaigns
  FOR ALL USING (auth.uid() = advertiser_id);

-- 알림은 수신자만 볼 수 있음
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);