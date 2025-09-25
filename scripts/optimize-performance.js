// scripts/optimize-performance.js
// 실행: node scripts/optimize-performance.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 ITDA 성능 최적화 시작...\n');

// 1. 빌드 크기 체크
function checkBuildSize() {
  console.log('📦 빌드 크기 체크...');
  try {
    const buildInfo = execSync('npm run build', { encoding: 'utf-8' });
    console.log('✅ 빌드 완료');
    
    // .next 폴더 크기 계산
    const getDirectorySize = (dir) => {
      let size = 0;
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          size += getDirectorySize(filePath);
        } else {
          size += stats.size;
        }
      });
      return size;
    };
    
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      const size = getDirectorySize(nextDir);
      console.log(`📊 총 빌드 크기: ${(size / 1024 / 1024).toFixed(2)} MB\n`);
    }
  } catch (error) {
    console.error('❌ 빌드 실패:', error.message);
  }
}

// 2. 이미지 최적화 체크
function checkImages() {
  console.log('🖼️  이미지 최적화 체크...');
  
  const publicDir = path.join(process.cwd(), 'public');
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  let totalSize = 0;
  let imageCount = 0;
  let largeImages = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        scanDirectory(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          imageCount++;
          totalSize += stats.size;
          
          // 500KB 이상 이미지 경고
          if (stats.size > 500 * 1024) {
            largeImages.push({
              path: filePath.replace(process.cwd(), ''),
              size: (stats.size / 1024).toFixed(2)
            });
          }
        }
      }
    });
  }
  
  if (fs.existsSync(publicDir)) {
    scanDirectory(publicDir);
    console.log(`📸 총 이미지: ${imageCount}개`);
    console.log(`💾 총 크기: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (largeImages.length > 0) {
      console.log('\n⚠️  최적화가 필요한 큰 이미지:');
      largeImages.forEach(img => {
        console.log(`   - ${img.path}: ${img.size} KB`);
      });
    }
  }
  console.log('');
}

// 3. 사용하지 않는 의존성 체크
function checkUnusedDeps() {
  console.log('📚 사용하지 않는 의존성 체크...');
  
  try {
    // depcheck 설치 확인
    try {
      execSync('npx depcheck --version', { stdio: 'ignore' });
    } catch {
      console.log('depcheck 설치 중...');
      execSync('npm install -g depcheck', { stdio: 'ignore' });
    }
    
    const result = execSync('npx depcheck --json', { encoding: 'utf-8' });
    const depcheck = JSON.parse(result);
    
    if (depcheck.dependencies && depcheck.dependencies.length > 0) {
      console.log('⚠️  사용하지 않는 의존성:');
      depcheck.dependencies.forEach(dep => {
        console.log(`   - ${dep}`);
      });
    } else {
      console.log('✅ 모든 의존성이 사용중입니다.');
    }
    
    if (depcheck.missing && Object.keys(depcheck.missing).length > 0) {
      console.log('\n⚠️  누락된 의존성:');
      Object.keys(depcheck.missing).forEach(dep => {
        console.log(`   - ${dep}`);
      });
    }
  } catch (error) {
    console.log('⏭️  depcheck 실행 스킵 (선택적)');
  }
  console.log('');
}

// 4. Lighthouse CI 실행
function runLighthouse() {
  console.log('🔍 Lighthouse 성능 측정...');
  
  try {
    // 개발 서버 실행 확인
    const isServerRunning = () => {
      try {
        execSync('curl -s http://localhost:3000', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    };
    
    if (!isServerRunning()) {
      console.log('⚠️  개발 서버가 실행중이 아닙니다. npm run dev를 먼저 실행하세요.');
      return;
    }
    
    // Lighthouse 실행
    const lighthouseCmd = `npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json --only-categories=performance --chrome-flags="--headless"`;
    
    console.log('Lighthouse 실행 중... (30초 정도 소요)');
    const result = execSync(lighthouseCmd, { encoding: 'utf-8', stdio: 'ignore' });
    
    // 결과 읽기
    if (fs.existsSync('./lighthouse-report.json')) {
      const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf-8'));
      const score = report.categories.performance.score * 100;
      
      console.log(`\n🎯 성능 점수: ${score.toFixed(0)}/100`);
      
      // 주요 메트릭
      const metrics = report.audits;
      console.log('\n📊 주요 메트릭:');
      console.log(`   - FCP: ${metrics['first-contentful-paint'].displayValue}`);
      console.log(`   - LCP: ${metrics['largest-contentful-paint'].displayValue}`);
      console.log(`   - TTI: ${metrics['interactive'].displayValue}`);
      console.log(`   - TBT: ${metrics['total-blocking-time'].displayValue}`);
      console.log(`   - CLS: ${metrics['cumulative-layout-shift'].displayValue}`);
      
      // 점수별 피드백
      if (score >= 90) {
        console.log('\n🎉 훌륭합니다! 성능이 매우 좋습니다.');
      } else if (score >= 70) {
        console.log('\n👍 좋습니다! 조금만 더 최적화하면 완벽합니다.');
      } else {
        console.log('\n⚠️  성능 개선이 필요합니다.');
      }
      
      // 보고서 파일 삭제
      fs.unlinkSync('./lighthouse-report.json');
    }
  } catch (error) {
    console.log('⏭️  Lighthouse 실행 스킵 (선택적)');
  }
  console.log('');
}

// 5. 번들 분석
function analyzeBundles() {
  console.log('📊 번들 분석 준비...');
  console.log('번들 분석을 실행하려면: npm run build:analyze');
  console.log('');
}

// 6. 환경 변수 체크
function checkEnvVars() {
  console.log('🔐 환경 변수 체크...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const envFile = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf-8');
    const missingVars = requiredEnvVars.filter(varName => 
      !envContent.includes(varName)
    );
    
    if (missingVars.length > 0) {
      console.log('⚠️  누락된 환경 변수:');
      missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
    } else {
      console.log('✅ 모든 필수 환경 변수가 설정되었습니다.');
    }
  } else {
    console.log('⚠️  .env.local 파일이 없습니다.');
  }
  console.log('');
}

// 7. 최적화 제안 생성
function generateOptimizationReport() {
  console.log('📋 최적화 제안:\n');
  
  const suggestions = [
    {
      title: '이미지 최적화',
      tasks: [
        'Next.js Image 컴포넌트 사용',
        'WebP 포맷 사용',
        'lazy loading 적용',
        'placeholder blur 추가'
      ]
    },
    {
      title: '코드 스플리팅',
      tasks: [
        'dynamic import 사용',
        '큰 라이브러리 분리',
        'Route-based code splitting'
      ]
    },
    {
      title: '캐싱 전략',
      tasks: [
        'Static Generation 활용',
        'ISR (Incremental Static Regeneration) 적용',
        'API 응답 캐싱',
        'CDN 활용'
      ]
    },
    {
      title: '번들 최적화',
      tasks: [
        'Tree shaking 확인',
        '사용하지 않는 의존성 제거',
        'Production 빌드 최적화'
      ]
    }
  ];
  
  suggestions.forEach((section, index) => {
    console.log(`${index + 1}. ${section.title}`);
    section.tasks.forEach(task => {
      console.log(`   ✓ ${task}`);
    });
    console.log('');
  });
}

// 실행
async function main() {
  checkEnvVars();
  checkImages();
  checkUnusedDeps();
  checkBuildSize();
  runLighthouse();
  analyzeBundles();
  generateOptimizationReport();
  
  console.log('✅ 성능 최적화 체크 완료!\n');
  console.log('다음 단계:');
  console.log('1. npm run build:analyze - 번들 상세 분석');
  console.log('2. npm run build:prod - 프로덕션 빌드');
  console.log('3. vercel deploy - Vercel 배포');
}

main();