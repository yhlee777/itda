-- supabase/seed.sql
-- 테스트용 시드 데이터 생성
-- Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. 테스트용 광고주 계정 생성
-- ============================================

-- 광고주 사용자 생성
INSERT INTO users (id, email, phone, user_type, created_at, updated_at)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'advertiser@test.com',
  '010-1234-5678',
  'advertiser',
  NOW(),
  NOW()
);

-- 광고주 프로필 생성 (나이키 코리아)
INSERT INTO advertisers (
  id,
  company_name,
  business_registration,
  contact_name,
  contact_position,
  contact_phone,
  website,
  industry,
  marketing_budget,
  is_verified,
  verified_at,
  created_at,
  updated_at
)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '나이키코리아(주)',
  '123-45-67890',
  '김마케팅',
  '마케팅 팀장',
  '010-1234-5678',
  'https://www.nike.co.kr',
  'fashion',
  '100m-500m',
  true,  -- 이미 승인된 상태
  NOW(),
  NOW(),
  NOW()
);

-- ============================================
-- 2. 테스트용 인플루언서 계정 생성
-- ============================================

-- 인플루언서 사용자 생성
INSERT INTO users (id, email, phone, user_type, created_at, updated_at)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'influencer@test.com',
  '010-9876-5432',
  'influencer',
  NOW(),
  NOW()
);

-- 인플루언서 프로필 생성 (패션 인플루언서)
INSERT INTO influencers (
  id,
  name,
  username,
  avatar,
  bio,
  categories,
  followers_count,
  following_count,
  posts_count,
  engagement_rate,
  audience_demographics,
  average_likes,
  average_comments,
  average_reach,
  availability,
  tier,
  is_verified,
  verification_date,
  growth_rate,
  content_quality_score,
  total_campaigns,
  total_earnings,
  average_rating,
  status,
  main_platform,
  instagram_username,
  created_at,
  updated_at
)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  '김인플',
  '@kiminfluencer',
  'https://i.pravatar.cc/150?img=47',
  '패션과 라이프스타일을 사랑하는 인플루언서입니다 ✨',
  ARRAY['패션', '라이프스타일', '뷰티'],
  85000,  -- 팔로워 8.5만
  1200,
  450,
  4.8,  -- 참여율 4.8%
  '{
    "age_distribution": {"18-24": 35, "25-34": 45, "35-44": 15, "45+": 5},
    "gender_distribution": {"female": 75, "male": 23, "other": 2},
    "location_distribution": {"서울": 45, "경기": 25, "부산": 10, "기타": 20}
  }',
  3500,  -- 평균 좋아요
  120,   -- 평균 댓글
  42000, -- 평균 도달
  '{"status": "immediate"}',
  'gold',  -- 골드 티어
  true,    -- 인증됨
  NOW(),
  15.5,    -- 성장률 15.5%
  8.5,     -- 콘텐츠 품질 점수 8.5
  12,      -- 총 캠페인 12개
  15000000,  -- 총 수익 1500만원
  4.7,     -- 평균 평점 4.7
  'active',
  'Instagram',
  'kiminfluencer',
  NOW(),
  NOW()
);

-- ============================================
-- 3. 테스트용 캠페인 생성 (광고주가 생성한 캠페인)
-- ============================================

INSERT INTO campaigns (
  id,
  advertiser_id,
  name,
  description,
  objectives,
  categories,
  budget,
  spent,
  start_date,
  end_date,
  target_audience,
  min_followers,
  min_engagement_rate,
  deliverables,
  requirements,
  status,
  created_at,
  updated_at
)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  'a1111111-1111-1111-1111-111111111111',
  '2024 나이키 에어맥스 신제품 런칭 캠페인',
  '새로운 에어맥스 라인업을 소개하고 젊은 세대와 소통하는 캠페인입니다.',
  ARRAY['브랜드 인지도 향상', '제품 홍보', '판매 증진'],
  ARRAY['패션', '스포츠', '라이프스타일'],
  5000000,  -- 예산 500만원
  0,
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '37 days',
  '{
    "age_range": "20-35",
    "gender": "all",
    "location": ["서울", "경기", "부산"],
    "interests": ["패션", "운동", "스니커즈"]
  }',
  10000,  -- 최소 팔로워 1만
  3.0,    -- 최소 참여율 3%
  '[
    {"type": "instagram_post", "count": 3, "description": "피드 포스팅"},
    {"type": "instagram_reel", "count": 2, "description": "릴스 제작"},
    {"type": "instagram_story", "count": 5, "description": "스토리 업로드"}
  ]',
  ARRAY['제품 착용 사진 필수', '해시태그 5개 이상', '멘션 @nike_korea'],
  'active',
  NOW(),
  NOW()
);

-- ============================================
-- 4. 매칭 히스토리 생성 (AI가 매칭한 것처럼)
-- ============================================

INSERT INTO matching_history (
  campaign_id,
  matched_influencers,
  filters_used,
  total_analyzed,
  created_at
)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  '[
    {
      "influencer_id": "b2222222-2222-2222-2222-222222222222",
      "match_score": 92,
      "match_details": {
        "score": 92,
        "strengths": ["높은 참여율", "타겟 연령대 일치", "패션 전문"],
        "weaknesses": [],
        "recommendation": "강력 추천"
      }
    }
  ]',
  '{"minFollowers": 10000, "minEngagement": 3.0, "categories": ["패션"]}',
  150,
  NOW()
);

-- ============================================
-- 5. 캠페인-인플루언서 매칭 (인플루언서가 지원한 상태)
-- ============================================

INSERT INTO campaign_influencers (
  campaign_id,
  influencer_id,
  match_score,
  match_details,
  status,
  agreed_price,
  matched_at
)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  'b2222222-2222-2222-2222-222222222222',
  92,
  '{
    "score": 92,
    "strengths": ["높은 참여율", "타겟 연령대 일치", "패션 전문"],
    "weaknesses": [],
    "recommendation": "강력 추천",
    "estimatedReach": 42000,
    "estimatedEngagement": 4080,
    "suggestedBudget": 1500000
  }',
  'pending',  -- 대기 중 상태
  1500000,
  NOW()
);

-- ============================================
-- 6. 로그인 정보 안내
-- ============================================

/*
테스트 계정 정보:

🏢 광고주 계정
- 이메일: advertiser@test.com
- 비밀번호: test1234
- 회사명: 나이키코리아(주)
- 상태: 승인 완료 (바로 로그인 가능)

👤 인플루언서 계정
- 이메일: influencer@test.com
- 비밀번호: test1234
- 활동명: 김인플
- 팔로워: 85,000명
- 티어: Gold

Note: Supabase Auth에서 직접 계정을 생성하거나,
      회원가입 페이지를 통해 위 이메일로 가입하세요.
*/