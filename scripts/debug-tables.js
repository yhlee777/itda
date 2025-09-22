// scripts/debug-tables.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 환경변수 확인');
console.log('================');
console.log('URL:', SUPABASE_URL ? '✅' : '❌');
console.log('ANON_KEY:', ANON_KEY ? '✅' : '❌');
console.log('SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✅' : '❌');
console.log('');

// 1. ANON KEY로 시도
console.log('1️⃣ ANON KEY로 테이블 접근 시도...');
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function testAnonAccess() {
  const tables = ['users', 'influencers', 'advertisers', 'campaigns'];
  
  for (const table of tables) {
    const { data, error } = await anonClient
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: 접근 가능 (${data?.length || 0}개 레코드)`);
    }
  }
}

// 2. SERVICE ROLE KEY로 시도
console.log('\n2️⃣ SERVICE ROLE KEY로 테이블 접근 시도...');
const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testServiceAccess() {
  const tables = ['users', 'influencers', 'advertisers', 'campaigns'];
  
  for (const table of tables) {
    const { data, error } = await serviceClient
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: 접근 가능 (${data?.length || 0}개 레코드)`);
    }
  }
}

// 3. 직접 SQL 실행 시도
console.log('\n3️⃣ 직접 SQL 쿼리 실행 시도...');
async function testDirectSQL() {
  // Service Role로 직접 SQL 실행
  const { data, error } = await serviceClient.rpc('get_table_list', {});
  
  if (error) {
    // RPC 함수가 없을 수 있으므로 다른 방법 시도
    console.log('⚠️ RPC 함수 없음, 직접 쿼리 시도...');
    
    // Auth users 테이블 확인
    const { data: authUsers, error: authError } = await serviceClient.auth.admin.listUsers();
    if (authError) {
      console.log('❌ Auth 사용자 조회 실패:', authError.message);
    } else {
      console.log(`✅ Auth 사용자: ${authUsers?.users?.length || 0}명`);
    }
  } else {
    console.log('✅ SQL 쿼리 성공');
  }
}

// 4. 테이블 생성 시도
console.log('\n4️⃣ 테이블이 정말 없다면 생성 시도...');
async function tryCreateTable() {
  // 간단한 테스트 테이블 생성 시도
  const { data, error } = await serviceClient
    .from('test_table_check')
    .select('*')
    .limit(1);
  
  if (error && error.message.includes('relation')) {
    console.log('📝 테스트 테이블도 없음 - 스키마 문제일 가능성');
    
    // users 테이블에 직접 insert 시도
    const testId = 'test-' + Date.now();
    const { error: insertError } = await serviceClient
      .from('users')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: `test${Date.now()}@test.com`,
        user_type: 'influencer'
      });
    
    if (insertError) {
      console.log('❌ Insert 실패:', insertError.message);
      if (insertError.message.includes('relation')) {
        console.log('🚨 테이블이 정말로 없습니다!');
      } else if (insertError.message.includes('duplicate')) {
        console.log('✅ 테이블은 있지만 중복 데이터');
      } else if (insertError.message.includes('permission')) {
        console.log('⚠️ 권한 문제입니다');
      }
    } else {
      console.log('✅ Insert 성공 - 테이블 존재 확인!');
    }
  }
}

// 5. 스키마 확인
console.log('\n5️⃣ 스키마 정보 확인...');
async function checkSchema() {
  // public 스키마의 테이블 목록을 가져오는 쿼리
  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  
  console.log('📋 SQL Editor에서 이 쿼리를 실행해보세요:');
  console.log(query);
}

// 실행
async function main() {
  console.log('\n========================================');
  console.log('  Supabase 테이블 연결 디버깅');
  console.log('========================================\n');
  
  await testAnonAccess();
  await testServiceAccess();
  await testDirectSQL();
  await tryCreateTable();
  await checkSchema();
  
  console.log('\n========================================');
  console.log('  진단 결과');
  console.log('========================================');
  console.log('위 결과를 확인하고 다음을 시도하세요:');
  console.log('1. Service Role Key가 올바른지 확인');
  console.log('2. RLS가 비활성화되어 있는지 확인');
  console.log('3. 테이블이 public 스키마에 있는지 확인');
  console.log('========================================\n');
}

main().catch(console.error);