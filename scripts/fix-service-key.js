// scripts/fix-service-key.js
// Service Role Key 줄바꿈 제거 및 검증

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

console.log('🔍 Service Role Key 검증 도구\n');
console.log('================================\n');

// 1. 현재 키 상태 확인
const currentKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!currentKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

console.log('📊 현재 키 분석:');
console.log('-------------------');
console.log('• 전체 길이:', currentKey.length, '문자');
console.log('• 줄바꿈 포함:', currentKey.includes('\n') ? '❌ YES (문제!)' : '✅ NO');
console.log('• 캐리지 리턴:', currentKey.includes('\r') ? '❌ YES (문제!)' : '✅ NO');
console.log('• 탭 포함:', currentKey.includes('\t') ? '❌ YES (문제!)' : '✅ NO');
console.log('• 앞 공백:', currentKey.startsWith(' ') ? '❌ YES (문제!)' : '✅ NO');
console.log('• 뒤 공백:', currentKey.endsWith(' ') ? '❌ YES (문제!)' : '✅ NO');
console.log('• 처음 20자:', currentKey.substring(0, 20));
console.log('• 마지막 20자:', currentKey.substring(currentKey.length - 20));

// JWT 형식 확인
const jwtParts = currentKey.split('.');
console.log('\n📝 JWT 구조 분석:');
console.log('-------------------');
console.log('• JWT 파트 개수:', jwtParts.length, '(정상: 3개)');

if (jwtParts.length === 3) {
  console.log('✅ 올바른 JWT 형식');
  
  // Base64 디코딩 시도
  try {
    const header = JSON.parse(Buffer.from(jwtParts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString());
    
    console.log('\n🔐 토큰 정보:');
    console.log('• 알고리즘:', header.alg);
    console.log('• 타입:', header.typ);
    console.log('• 역할:', payload.role);
    console.log('• 프로젝트 REF:', payload.ref);
    
    if (payload.role !== 'service_role') {
      console.log('\n⚠️ 경고: 이 키는 service_role이 아닙니다!');
      console.log('   현재 role:', payload.role);
    }
  } catch (e) {
    console.log('⚠️ JWT 디코딩 실패 - 키가 손상되었을 수 있습니다.');
  }
} else {
  console.log('❌ JWT 형식이 잘못되었습니다!');
}

// 2. 자동 수정 제안
if (currentKey.includes('\n') || currentKey.includes('\r') || currentKey.includes(' ')) {
  console.log('\n🔧 자동 수정 중...');
  
  // 줄바꿈과 공백 제거
  const cleanedKey = currentKey.replace(/[\n\r\t]/g, '').trim();
  
  console.log('• 수정 전 길이:', currentKey.length);
  console.log('• 수정 후 길이:', cleanedKey.length);
  console.log('• 제거된 문자:', currentKey.length - cleanedKey.length);
  
  // .env.local 파일 업데이트
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // 백업 생성
  fs.writeFileSync(envPath + '.backup', envContent);
  console.log('\n📁 백업 파일 생성: .env.local.backup');
  
  // 새 키로 교체
  const newEnvContent = envContent.replace(
    /SUPABASE_SERVICE_ROLE_KEY=.*/,
    `SUPABASE_SERVICE_ROLE_KEY=${cleanedKey}`
  );
  
  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ .env.local 파일 업데이트 완료!');
  console.log('\n🎯 다시 실행해보세요:');
  console.log('   node scripts/create-users.js');
} else {
  console.log('\n✅ 키 형식은 정상입니다.');
  
  if (currentKey.length < 100) {
    console.log('⚠️ 하지만 키가 너무 짧습니다. Service Role Key가 맞나요?');
  }
}

// 3. 연결 테스트
console.log('\n🧪 Supabase 연결 테스트...');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const testKey = currentKey.replace(/[\n\r\t]/g, '').trim();

try {
  const supabase = createClient(SUPABASE_URL, testKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  // 간단한 쿼리 테스트
  const { data, error } = await supabase.from('users').select('count').limit(1);
  
  if (error) {
    console.log('❌ 연결 실패:', error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 가능한 원인:');
      console.log('1. 잘못된 키를 복사함 (anon key vs service_role key)');
      console.log('2. 키가 재생성되었음');
      console.log('3. 프로젝트 URL이 맞지 않음');
      console.log('4. 프로젝트가 일시 중지됨');
    }
  } else {
    console.log('✅ 연결 성공!');
  }
} catch (e) {
  console.log('❌ 예외 발생:', e.message);
}

console.log('\n================================');
console.log('검증 완료!');
console.log('================================\n');