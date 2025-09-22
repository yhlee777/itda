// scripts/create-users.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 환경변수 확인
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 환경변수 확인...');
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
console.log('SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✅ 설정됨' : '❌ 없음');
console.log('');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ 환경변수가 설정되지 않았습니다!');
  console.error('');
  console.error('📝 .env.local 파일을 생성하고 다음 내용을 추가하세요:');
  console.error('');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('');
  console.error('Supabase 대시보드 → Settings → API에서 키를 찾을 수 있습니다.');
  process.exit(1);
}

// Supabase 클라이언트 생성
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTables() {
  console.log('📊 테이블 확인 중...\n');
  
  // users 테이블 확인
  const { data: usersCheck, error: usersError } = await supabase
    .from('users')
    .select('id')
    .limit(1);
  
  if (usersError) {
    console.log('❌ users 테이블이 없습니다. 생성 중...');
    
    // 테이블 생성 SQL
    const createTableSQL = `
      -- users 테이블
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('influencer', 'advertiser')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- influencers 테이블
      CREATE TABLE IF NOT EXISTS public.influencers (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        name VARCHAR(255),
        username VARCHAR(255) UNIQUE,
        status VARCHAR(50) DEFAULT 'pending',
        categories TEXT[],
        followers_count INTEGER DEFAULT 0,
        engagement_rate DECIMAL(5,2) DEFAULT 0.00,
        tier VARCHAR(50) DEFAULT 'bronze',
        bio TEXT,
        profile_image VARCHAR(500),
        instagram_handle VARCHAR(100),
        youtube_channel VARCHAR(100),
        total_campaigns INTEGER DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        location VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- advertisers 테이블
      CREATE TABLE IF NOT EXISTS public.advertisers (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        company_name VARCHAR(255),
        is_verified BOOLEAN DEFAULT false,
        business_registration VARCHAR(100),
        representative VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        website VARCHAR(500),
        industry VARCHAR(100),
        company_size VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- campaigns 테이블
      CREATE TABLE IF NOT EXISTS public.campaigns (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        categories TEXT[],
        budget DECIMAL(12,2),
        start_date DATE,
        end_date DATE,
        target_audience TEXT,
        min_followers INTEGER DEFAULT 0,
        min_engagement_rate DECIMAL(5,2) DEFAULT 0.00,
        deliverables TEXT[],
        requirements TEXT[],
        status VARCHAR(50) DEFAULT 'draft',
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('⚠️ 테이블을 생성하려면 Supabase SQL Editor에서 위 SQL을 실행하세요.');
    console.log('또는 Supabase Dashboard → SQL Editor에서 다음을 실행:');
    console.log('');
    console.log(createTableSQL);
    return false;
  }
  
  console.log('✅ users 테이블 확인됨');
  
  // influencers 테이블 확인
  const { error: influencersError } = await supabase
    .from('influencers')
    .select('id')
    .limit(1);
    
  if (influencersError) {
    console.log('⚠️ influencers 테이블이 없습니다.');
    return false;
  }
  console.log('✅ influencers 테이블 확인됨');
  
  // advertisers 테이블 확인
  const { error: advertisersError } = await supabase
    .from('advertisers')
    .select('id')
    .limit(1);
    
  if (advertisersError) {
    console.log('⚠️ advertisers 테이블이 없습니다.');
    return false;
  }
  console.log('✅ advertisers 테이블 확인됨\n');
  
  return true;
}

async function createUsers() {
  console.log('🚀 테스트 사용자 생성 시작...\n');

  try {
    // 인플루언서 계정 생성
    console.log('📝 인플루언서 계정 생성 중...');
    const { data: influencer, error: error1 } = await supabase.auth.admin.createUser({
      email: 'influencer@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { 
        user_type: 'influencer',
        name: '김인플'
      }
    });

    if (error1) {
      if (error1.message?.includes('already been registered')) {
        console.log('⚠️ 인플루언서 계정이 이미 존재합니다.');
        
        // 기존 사용자 ID 찾기
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingInfluencer = existingUsers?.users?.find(u => u.email === 'influencer@test.com');
        
        if (existingInfluencer) {
          console.log('   ID:', existingInfluencer.id);
        }
      } else {
        console.error('❌ 인플루언서 계정 생성 실패:', error1.message);
      }
    } else if (influencer && influencer.user) {
      console.log('✅ 인플루언서 Auth 생성 완료');
      console.log('   ID:', influencer.user.id);
      console.log('   Email:', influencer.user.email);
      
      // users 테이블에 추가
      const { error: userError } = await supabase.from('users').upsert({
        id: influencer.user.id,
        email: 'influencer@test.com',
        user_type: 'influencer'
      }, { onConflict: 'id' });

      if (userError) {
        console.log('⚠️ users 테이블 추가 실패:', userError.message);
      } else {
        console.log('✅ users 테이블 추가 완료');
      }

      // influencers 테이블에 추가
      const { error: profileError } = await supabase.from('influencers').upsert({
        id: influencer.user.id,
        name: '김인플',
        username: 'kiminflu',
        status: 'active',
        categories: ['패션', '뷰티', '라이프'],
        followers_count: 125000,
        engagement_rate: 4.8,
        tier: 'gold',
        bio: '패션과 라이프스타일을 사랑하는 인플루언서입니다 ✨',
        instagram_handle: '@kiminflu',
        location: '서울'
      }, { onConflict: 'id' });

      if (profileError) {
        console.log('⚠️ influencers 테이블 추가 실패:', profileError.message);
      } else {
        console.log('✅ influencers 프로필 생성 완료');
      }
    }

    console.log('');

    // 광고주 계정 생성
    console.log('📝 광고주 계정 생성 중...');
    const { data: advertiser, error: error2 } = await supabase.auth.admin.createUser({
      email: 'advertiser@test.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: { 
        user_type: 'advertiser',
        company: '테스트 컴퍼니'
      }
    });

    if (error2) {
      if (error2.message?.includes('already been registered')) {
        console.log('⚠️ 광고주 계정이 이미 존재합니다.');
        
        // 기존 사용자 ID 찾기
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingAdvertiser = existingUsers?.users?.find(u => u.email === 'advertiser@test.com');
        
        if (existingAdvertiser) {
          console.log('   ID:', existingAdvertiser.id);
        }
      } else {
        console.error('❌ 광고주 계정 생성 실패:', error2.message);
      }
    } else if (advertiser && advertiser.user) {
      console.log('✅ 광고주 Auth 생성 완료');
      console.log('   ID:', advertiser.user.id);
      console.log('   Email:', advertiser.user.email);
      
      // users 테이블에 추가
      const { error: userError } = await supabase.from('users').upsert({
        id: advertiser.user.id,
        email: 'advertiser@test.com',
        user_type: 'advertiser'
      }, { onConflict: 'id' });

      if (userError) {
        console.log('⚠️ users 테이블 추가 실패:', userError.message);
      } else {
        console.log('✅ users 테이블 추가 완료');
      }

      // advertisers 테이블에 추가
      const { error: profileError } = await supabase.from('advertisers').upsert({
        id: advertiser.user.id,
        company_name: '테스트 컴퍼니',
        is_verified: true,
        business_registration: '123-45-67890',
        representative: '홍길동',
        phone: '02-1234-5678',
        address: '서울시 강남구',
        website: 'https://testcompany.com',
        industry: 'IT/Tech'
      }, { onConflict: 'id' });

      if (profileError) {
        console.log('⚠️ advertisers 테이블 추가 실패:', profileError.message);
      } else {
        console.log('✅ advertisers 프로필 생성 완료');
      }
    }

  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error);
    console.error('');
    console.error('💡 해결 방법:');
    console.error('1. .env.local 파일의 키가 올바른지 확인');
    console.error('2. Supabase 프로젝트가 활성화되어 있는지 확인');
    console.error('3. Service Role Key가 올바른지 확인');
  }
}

// 메인 실행
async function main() {
  console.log('================================');
  console.log('  ITDA 테스트 사용자 생성 도구');
  console.log('================================\n');

  // 테이블 확인
  const tablesExist = await checkTables();
  
  if (!tablesExist) {
    console.log('\n❌ 필요한 테이블이 없습니다.');
    console.log('📝 위의 SQL을 Supabase SQL Editor에서 실행한 후 다시 시도하세요.\n');
    process.exit(1);
  }

  // 사용자 생성
  await createUsers();

  console.log('\n================================');
  console.log('📝 생성된 테스트 계정:');
  console.log('================================');
  console.log('인플루언서: influencer@test.com / test1234');
  console.log('광고주: advertiser@test.com / test1234');
  console.log('================================\n');
  console.log('✨ 완료! 이제 로그인할 수 있습니다.\n');
}

// 실행
main().catch(error => {
  console.error('❌ 치명적 오류:', error);
  process.exit(1);
});