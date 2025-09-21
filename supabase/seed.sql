-- supabase/seed.sql
-- 완전한 시드 데이터 (Auth 연동 포함)
-- 실행: npx supabase db reset 또는 SQL Editor에서 직접 실행

-- ============================================
-- 0. 기존 데이터 정리 (선택사항)
-- ============================================
-- TRUNCATE TABLE campaign_influencers CASCADE;
-- TRUNCATE TABLE matching_history CASCADE;
-- TRUNCATE TABLE campaigns CASCADE;
-- TRUNCATE TABLE notifications CASCADE;
-- TRUNCATE TABLE influencers CASCADE;
-- TRUNCATE TABLE advertisers CASCADE;
-- TRUNCATE TABLE users CASCADE;

-- ============================================
-- 1. Auth 사용자 생성 (Supabase Auth)
-- ============================================
-- 광고주 Auth 사용자
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_metadata,
  raw_user_metadata,
  aud,
  role
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'advertiser@test.com',
  crypt('test1234', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"user_type": "advertiser"}',
  'authenticated',
  'authenticated'
);

-- 인플루언서 Auth 사용자
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_metadata,
  raw_user_metadata,
  aud,
  role
) VALUES (
  'b2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'influencer@test.com',
  crypt('test1234', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"user_type": "influencer"}',
  'authenticated',
  'authenticated'
);

-- 추가 인플루언서들 (다양한 카테고리)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_metadata,
  raw_user_metadata,
  aud,
  role
) VALUES 
(
  'b3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'beauty@test.com',
  crypt('test1234', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"user_type": "influencer"}',
  'authenticated',
  'authenticated'
),
(
  'b4444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'tech@test.com',
  crypt('test1234', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"user_type": "influencer"}',
  'authenticated',
  'authenticated'
),
(
  'b5555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000000',
  'food@test.com',
  crypt('test1234', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"user_type": "influencer"}',
  'authenticated',
  'authenticated'
);

-- ============================================
-- 2. 사용자 프로필 생성
-- ============================================

-- 사용자 테이블
INSERT INTO users (id, email, phone, user_type, created_at, updated_at)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'advertiser@test.com', '010-1234-5678', 'advertiser', NOW(), NOW()),
  ('b2222222-2222-2222-2222-222222222222', 'influencer@test.com', '010-9876-5432', 'influencer', NOW(), NOW()),
  ('b3333333-3333-3333-3333-333333333333', 'beauty@test.com', '010-1111-2222', 'influencer', NOW(), NOW()),
  ('b4444444-4444-4444-4444-444444444444', 'tech@test.com', '010-3333-4444', 'influencer', NOW(), NOW()),
  ('b5555555-5555-5555-5555-555555555555', 'food@test.com', '010-5555-6666', 'influencer', NOW(), NOW());

-- 광고주 프로필 (나이키 코리아)
INSERT INTO advertisers (
  id, company_name, business_registration, contact_name, contact_position,
  contact_phone, website, industry, marketing_budget, is_verified, verified_at,
  created_at, updated_at
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '나이키코리아(주)',
  '123-45-67890',
  '김마케팅',
  '마케팅 팀장',
  '010-1234-5678',
  'https://www.nike.co.kr',
  'fashion',
  '100m-500m',
  true,
  NOW(),
  NOW(),
  NOW()
);

-- 인플루언서 프로필들
INSERT INTO influencers (
  id, name, username, avatar, bio, categories, followers_count, following_count,
  posts_count, engagement_rate, audience_demographics, average_likes, average_comments,
  average_reach, availability, tier, is_verified, verification_date, growth_rate,
  content_quality_score, total_campaigns, total_earnings, average_rating, status,
  main_platform, instagram_username, created_at, updated_at
) VALUES 
-- 패션 인플루언서
(
  'b2222222-2222-2222-2222-222222222222',
  '김패션',
  '@kimfashion',
  'https://i.pravatar.cc/150?img=47',
  '패션과 라이프스타일을 사랑하는 인플루언서입니다 ✨ Daily Outfit & Style Tips',
  ARRAY['패션', '라이프스타일', '뷰티'],
  85000, 1200, 450, 4.8,
  '{"age_distribution": {"18-24": 35, "25-34": 45, "35-44": 15, "45+": 5}, "gender_distribution": {"female": 75, "male": 23, "other": 2}, "location_distribution": {"서울": 45, "경기": 25, "부산": 10, "기타": 20}}'::jsonb,
  3500, 120, 42000,
  '{"status": "immediate"}'::jsonb,
  'gold', true, NOW(), 15.5, 8.5, 12, 15000000, 4.7, 'active',
  'Instagram', 'kimfashion', NOW(), NOW()
),
-- 뷰티 인플루언서
(
  'b3333333-3333-3333-3333-333333333333',
  '이뷰티',
  '@beautylee',
  'https://i.pravatar.cc/150?img=25',
  '✨ K-Beauty Expert | 메이크업 & 스킨케어 | 정직한 리뷰',
  ARRAY['뷰티', '스킨케어', '메이크업'],
  120000, 890, 670, 5.2,
  '{"age_distribution": {"18-24": 40, "25-34": 35, "35-44": 20, "45+": 5}, "gender_distribution": {"female": 92, "male": 6, "other": 2}, "location_distribution": {"서울": 50, "경기": 20, "부산": 8, "기타": 22}}'::jsonb,
  5800, 230, 58000,
  '{"status": "immediate"}'::jsonb,
  'premium', true, NOW(), 22.3, 9.2, 25, 32000000, 4.9, 'active',
  'Instagram', 'beautylee', NOW(), NOW()
),
-- 테크 인플루언서
(
  'b4444444-4444-4444-4444-444444444444',
  '박테크',
  '@techpark',
  'https://i.pravatar.cc/150?img=13',
  '🚀 최신 테크 리뷰 | 가젯 덕후 | IT 트렌드 분석가',
  ARRAY['테크', 'IT', '가젯'],
  200000, 450, 890, 3.8,
  '{"age_distribution": {"18-24": 25, "25-34": 40, "35-44": 25, "45+": 10}, "gender_distribution": {"female": 25, "male": 73, "other": 2}, "location_distribution": {"서울": 55, "경기": 25, "부산": 5, "기타": 15}}'::jsonb,
  7200, 340, 95000,
  '{"status": "scheduled", "available_from": "2024-02-01"}'::jsonb,
  'premium', true, NOW(), 18.7, 9.5, 30, 45000000, 4.8, 'active',
  'YouTube', 'techpark_official', NOW(), NOW()
),
-- 푸드 인플루언서
(
  'b5555555-5555-5555-5555-555555555555',
  '최푸드',
  '@foodiechoi',
  'https://i.pravatar.cc/150?img=32',
  '🍽️ 맛집 탐험가 | 레시피 크리에이터 | 푸드 스타일리스트',
  ARRAY['푸드', '요리', '맛집'],
  65000, 780, 520, 6.2,
  '{"age_distribution": {"18-24": 30, "25-34": 35, "35-44": 25, "45+": 10}, "gender_distribution": {"female": 65, "male": 33, "other": 2}, "location_distribution": {"서울": 60, "경기": 15, "부산": 10, "기타": 15}}'::jsonb,
  4100, 180, 38000,
  '{"status": "immediate"}'::jsonb,
  'gold', true, NOW(), 12.4, 8.8, 18, 22000000, 4.6, 'active',
  'Instagram', 'foodiechoi', NOW(), NOW()
);

-- ============================================
-- 3. 캠페인 생성 (다양한 상태)
-- ============================================

INSERT INTO campaigns (
  id, advertiser_id, name, description, objectives, categories, budget, spent,
  start_date, end_date, target_audience, min_followers, min_engagement_rate,
  deliverables, requirements, status, created_at, updated_at
) VALUES 
-- 활성 캠페인 1
(
  'c1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  '2024 나이키 에어맥스 신제품 런칭',
  '새로운 에어맥스 라인업을 소개하고 젊은 세대와 소통하는 캠페인입니다.',
  ARRAY['브랜드 인지도 향상', '제품 홍보', '판매 증진'],
  ARRAY['패션', '스포츠', '라이프스타일'],
  5000000, 0,
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '37 days',
  '{"age_range": "20-35", "gender": "all", "location": ["서울", "경기", "부산"], "interests": ["패션", "운동", "스니커즈"]}'::jsonb,
  10000, 3.0,
  '[{"type": "instagram_post", "count": 3, "description": "피드 포스팅"}, {"type": "instagram_reel", "count": 2, "description": "릴스 제작"}, {"type": "instagram_story", "count": 5, "description": "스토리 업로드"}]'::jsonb,
  ARRAY['제품 착용 사진 필수', '해시태그 5개 이상', '멘션 @nike_korea'],
  'active', NOW(), NOW()
),
-- 활성 캠페인 2
(
  'c2222222-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111',
  '나이키 러닝 챌린지 2024',
  '건강한 라이프스타일을 추구하는 러너들과 함께하는 챌린지',
  ARRAY['커뮤니티 활성화', '브랜드 충성도 향상'],
  ARRAY['스포츠', '피트니스', '라이프스타일'],
  3000000, 500000,
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '20 days',
  '{"age_range": "25-40", "gender": "all", "location": ["전국"], "interests": ["러닝", "피트니스", "건강"]}'::jsonb,
  5000, 4.0,
  '[{"type": "instagram_post", "count": 2, "description": "러닝 인증샷"}, {"type": "instagram_story", "count": 10, "description": "일일 러닝 기록"}]'::jsonb,
  ARRAY['러닝 인증 필수', '#나이키러닝챌린지', '주 3회 이상 활동'],
  'in_progress', NOW() - INTERVAL '10 days', NOW()
),
-- 매칭 중인 캠페인
(
  'c3333333-3333-3333-3333-333333333333',
  'a1111111-1111-1111-1111-111111111111',
  '나이키 요가 컬렉션 홍보',
  '새로운 요가웨어 라인 런칭을 위한 인플루언서 모집',
  ARRAY['제품 홍보', '타겟 고객 확대'],
  ARRAY['요가', '피트니스', '웰빙'],
  2500000, 0,
  CURRENT_DATE + INTERVAL '14 days',
  CURRENT_DATE + INTERVAL '44 days',
  '{"age_range": "25-45", "gender": "female", "location": ["서울", "경기"], "interests": ["요가", "필라테스", "웰빙"]}'::jsonb,
  8000, 3.5,
  '[{"type": "instagram_post", "count": 4, "description": "요가 포즈와 함께"}, {"type": "youtube_video", "count": 1, "description": "요가 루틴 영상"}]'::jsonb,
  ARRAY['요가 전문 인플루언서 우대', '실제 착용 컷 필수'],
  'matching', NOW() - INTERVAL '2 days', NOW()
);

-- ============================================
-- 4. 캠페인-인플루언서 매칭
-- ============================================

INSERT INTO campaign_influencers (
  campaign_id, influencer_id, match_score, match_details, status, 
  agreed_price, matched_at
) VALUES 
-- 나이키 에어맥스 캠페인 매칭
(
  'c1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  92,
  '{"score": 92, "strengths": ["높은 참여율", "타겟 연령대 일치", "패션 전문"], "weaknesses": [], "recommendation": "강력 추천", "estimatedReach": 42000, "estimatedEngagement": 4080, "suggestedBudget": 1500000}'::jsonb,
  'pending', 1500000, NOW()
),
(
  'c1111111-1111-1111-1111-111111111111',
  'b3333333-3333-3333-3333-333333333333',
  85,
  '{"score": 85, "strengths": ["높은 팔로워", "여성 타겟 강점"], "weaknesses": ["스포츠 카테고리 약함"], "recommendation": "추천", "estimatedReach": 58000, "estimatedEngagement": 5200, "suggestedBudget": 2000000}'::jsonb,
  'accepted', 1800000, NOW() - INTERVAL '2 days'
),
-- 러닝 챌린지 캠페인 매칭
(
  'c2222222-2222-2222-2222-222222222222',
  'b2222222-2222-2222-2222-222222222222',
  88,
  '{"score": 88, "strengths": ["스포츠웨어 경험", "높은 참여율"], "weaknesses": [], "recommendation": "추천", "estimatedReach": 42000, "estimatedEngagement": 4080, "suggestedBudget": 800000}'::jsonb,
  'in_progress', 750000, NOW() - INTERVAL '8 days'
),
(
  'c2222222-2222-2222-2222-222222222222',
  'b5555555-5555-5555-5555-555555555555',
  75,
  '{"score": 75, "strengths": ["라이프스타일 콘텐츠"], "weaknesses": ["스포츠 카테고리 부족"], "recommendation": "보통", "estimatedReach": 38000, "estimatedEngagement": 6200, "suggestedBudget": 600000}'::jsonb,
  'accepted', 550000, NOW() - INTERVAL '5 days'
);

-- ============================================
-- 5. 매칭 히스토리
-- ============================================

INSERT INTO matching_history (
  campaign_id, matched_influencers, filters_used, total_analyzed, created_at
) VALUES 
(
  'c1111111-1111-1111-1111-111111111111',
  '[{"influencer_id": "b2222222-2222-2222-2222-222222222222", "match_score": 92}, {"influencer_id": "b3333333-3333-3333-3333-333333333333", "match_score": 85}]'::jsonb,
  '{"minFollowers": 10000, "minEngagement": 3.0, "categories": ["패션"]}'::jsonb,
  150, NOW() - INTERVAL '3 days'
),
(
  'c2222222-2222-2222-2222-222222222222',
  '[{"influencer_id": "b2222222-2222-2222-2222-222222222222", "match_score": 88}, {"influencer_id": "b5555555-5555-5555-5555-555555555555", "match_score": 75}]'::jsonb,
  '{"minFollowers": 5000, "minEngagement": 3.5, "categories": ["스포츠", "피트니스"]}'::jsonb,
  120, NOW() - INTERVAL '9 days'
),
(
  'c3333333-3333-3333-3333-333333333333',
  '[{"influencer_id": "b2222222-2222-2222-2222-222222222222", "match_score": 78}, {"influencer_id": "b3333333-3333-3333-3333-333333333333", "match_score": 82}]'::jsonb,
  '{"minFollowers": 8000, "minEngagement": 3.5, "categories": ["요가", "피트니스"]}'::jsonb,
  80, NOW() - INTERVAL '2 days'
);

-- ============================================
-- 6. 알림 생성
-- ============================================

INSERT INTO notifications (
  user_id, type, title, message, metadata, is_read, created_at
) VALUES 
-- 인플루언서 알림
(
  'b2222222-2222-2222-2222-222222222222',
  'campaign_matched',
  '새로운 캠페인 매칭!',
  '나이키 에어맥스 캠페인에 매칭되었습니다. 확인해보세요!',
  '{"campaign_id": "c1111111-1111-1111-1111-111111111111", "match_score": 92}'::jsonb,
  false, NOW() - INTERVAL '3 hours'
),
(
  'b3333333-3333-3333-3333-333333333333',
  'campaign_accepted',
  '캠페인 수락 완료',
  '나이키 에어맥스 캠페인 참여가 확정되었습니다.',
  '{"campaign_id": "c1111111-1111-1111-1111-111111111111"}'::jsonb,
  true, NOW() - INTERVAL '2 days'
),
-- 광고주 알림
(
  'a1111111-1111-1111-1111-111111111111',
  'influencer_joined',
  '인플루언서 참여 확정',
  '@beautylee님이 캠페인에 참여했습니다.',
  '{"campaign_id": "c1111111-1111-1111-1111-111111111111", "influencer_id": "b3333333-3333-3333-3333-333333333333"}'::jsonb,
  false, NOW() - INTERVAL '2 days'
),
(
  'a1111111-1111-1111-1111-111111111111',
  'campaign_progress',
  '캠페인 진행 중',
  '러닝 챌린지 캠페인이 순조롭게 진행되고 있습니다.',
  '{"campaign_id": "c2222222-2222-2222-2222-222222222222", "progress": 35}'::jsonb,
  true, NOW() - INTERVAL '1 day'
);

-- ============================================
-- 7. 테스트 계정 정보 출력
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ 시드 데이터 생성 완료!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📱 테스트 계정 정보:';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE '';
  RAISE NOTICE '🏢 광고주 계정:';
  RAISE NOTICE '이메일: advertiser@test.com';
  RAISE NOTICE '비밀번호: test1234';
  RAISE NOTICE '회사명: 나이키코리아(주)';
  RAISE NOTICE '상태: ✅ 승인 완료';
  RAISE NOTICE '';
  RAISE NOTICE '👤 인플루언서 계정들:';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE '1. 패션 인플루언서';
  RAISE NOTICE '   이메일: influencer@test.com';
  RAISE NOTICE '   비밀번호: test1234';
  RAISE NOTICE '   팔로워: 85,000명 (Gold 등급)';
  RAISE NOTICE '';
  RAISE NOTICE '2. 뷰티 인플루언서';
  RAISE NOTICE '   이메일: beauty@test.com';
  RAISE NOTICE '   비밀번호: test1234';
  RAISE NOTICE '   팔로워: 120,000명 (Premium 등급)';
  RAISE NOTICE '';
  RAISE NOTICE '3. 테크 인플루언서';
  RAISE NOTICE '   이메일: tech@test.com';
  RAISE NOTICE '   비밀번호: test1234';
  RAISE NOTICE '   팔로워: 200,000명 (Premium 등급)';
  RAISE NOTICE '';
  RAISE NOTICE '4. 푸드 인플루언서';
  RAISE NOTICE '   이메일: food@test.com';
  RAISE NOTICE '   비밀번호: test1234';
  RAISE NOTICE '   팔로워: 65,000명 (Gold 등급)';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 로그인 페이지: http://localhost:3000/login';
  RAISE NOTICE '========================================';
END $$;