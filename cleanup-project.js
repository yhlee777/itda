// cleanup-project.js
// 불필요한 파일 정리 스크립트
// 실행: node cleanup-project.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 ITDA 프로젝트 정리 시작...\n');

// 삭제할 파일/폴더 목록
const filesToDelete = {
  // 1. 중복 파일들
  duplicates: [
    'utils/supabase.ts',  // lib/supabase와 중복
    'lib/supabase.ts',    // lib/supabase/client.ts 사용
    'src/app',            // app 디렉토리와 중복 (Next.js 13+는 app 사용)
    'pages',              // Next.js 13+에서는 app 디렉토리 사용
  ],
  
  // 2. 테스트/임시 파일들
  temporary: [
    'test.ts',
    'test.js',
    'temp.ts',
    'temp.js',
    '*.test.ts',
    '*.test.tsx',
    '*.spec.ts',
    '*.spec.tsx',
    'pp/api',  // 오타로 보이는 디렉토리
  ],
  
  // 3. 백업 파일들
  backups: [
    '*.bak',
    '*.backup',
    '*.old',
    '*_old.*',
    '*_backup.*',
    '*.orig',
  ],
  
  // 4. 사용하지 않는 설정 파일들
  unusedConfigs: [
    '.eslintrc.js',      // .eslintrc.json이나 eslint.config.mjs 사용
    'jsconfig.json',     // TypeScript 프로젝트는 tsconfig.json만 필요
    'jest.config.js',    // 테스트 안 함
    'babel.config.js',   // Next.js는 자체 babel 설정 사용
    '.babelrc',
  ],
  
  // 5. 불필요한 스크립트/유틸리티
  unusedScripts: [
    'scripts/create-users.js',      // 이미 실행됨
    'scripts/debug-tables.js',      // 디버깅 완료
    'scripts/fix-imports.js',       // 수정 완료
    'fix-all-types.js',             // 수정 완료
    'quick-fix.js',                 // 수정 완료
    'complete-fix.js',              // 수정 완료
    'fix-types.sh',                 // 수정 완료
  ],
  
  // 6. IDE 설정 (선택적)
  ideSettings: [
    '.idea',              // IntelliJ IDEA
    '.vscode/settings.json', // VS Code 설정 (팀 공유 필요시 유지)
  ],
  
  // 7. 샘플/예제 파일
  examples: [
    'example.*',
    'sample.*',
    'demo.*',
    '*.example.*',
    'README-*.md',
  ],
  
  // 8. 빌드 아티팩트 (git ignore에 있어야 함)
  buildArtifacts: [
    'dist',
    'build',
    '.next',         // 주의: 개발 중이면 유지
    'out',
    '*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
  ],
  
  // 9. 사용하지 않는 타입 파일
  unusedTypes: [
    'types/supabase.ts',        // database.types.ts 사용
    'types/index.ts',           // 개별 타입 파일 사용
    'types-helpers-template.ts', // 템플릿 파일
  ],
  
  // 10. 빈 디렉토리
  emptyDirs: [
    'public/temp',
    'public/uploads',  // 업로드 기능 없으면 삭제
    'src/components',  // src 사용 안 함
    'src/lib',
    'src/hooks',
    'src/types',
    'src/utils',
  ]
};

// 안전 검사 목록 (삭제하면 안 되는 파일들)
const protectedFiles = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'next.config.ts',
  'next.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  '.env',
  '.env.local',
  '.gitignore',
  'README.md',
  'app',
  'components',
  'lib',
  'hooks',
  'types/database.types.ts',
  'types/helpers.ts',
  'types/chat.types.ts',
  'types/notifications.ts',
  'public/icon-*.png',
  'public/manifest.json',
  'styles',
];

// 삭제 통계
const stats = {
  deleted: [],
  skipped: [],
  errors: [],
  sizeFreed: 0
};

// 파일 크기 가져오기
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

// 디렉토리 크기 계산
function getDirectorySize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    });
  } catch {}
  return size;
}

// 파일/폴더 삭제 함수
function deleteItem(itemPath, category) {
  // 보호된 파일 체크
  const isProtected = protectedFiles.some(protected => {
    const protectedPath = path.resolve(protected);
    const itemFullPath = path.resolve(itemPath);
    return itemFullPath === protectedPath || itemFullPath.startsWith(protectedPath + path.sep);
  });
  
  if (isProtected) {
    stats.skipped.push({ path: itemPath, reason: 'protected' });
    return;
  }
  
  try {
    if (!fs.existsSync(itemPath)) {
      return;
    }
    
    const isDirectory = fs.statSync(itemPath).isDirectory();
    const size = isDirectory ? getDirectorySize(itemPath) : getFileSize(itemPath);
    
    if (isDirectory) {
      fs.rmSync(itemPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(itemPath);
    }
    
    stats.deleted.push({ 
      path: itemPath, 
      category, 
      type: isDirectory ? 'directory' : 'file',
      size 
    });
    stats.sizeFreed += size;
    
    console.log(`  ✅ 삭제: ${itemPath} (${formatSize(size)})`);
  } catch (error) {
    stats.errors.push({ path: itemPath, error: error.message });
    console.log(`  ❌ 실패: ${itemPath} - ${error.message}`);
  }
}

// 파일 크기 포맷
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// glob 패턴 매칭
function findFiles(pattern) {
  const files = [];
  const baseDir = '.';
  
  function searchDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        
        // node_modules와 .git은 건너뛰기
        if (item === 'node_modules' || item === '.git') return;
        
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          searchDir(fullPath);
        } else {
          // 패턴 매칭
          const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
          if (regex.test(item)) {
            files.push(fullPath);
          }
        }
      });
    } catch {}
  }
  
  searchDir(baseDir);
  return files;
}

// 빈 디렉토리 찾기
function findEmptyDirs(dir = '.') {
  const emptyDirs = [];
  
  function checkDir(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      if (items.length === 0) {
        emptyDirs.push(dirPath);
      } else {
        items.forEach(item => {
          const fullPath = path.join(dirPath, item);
          if (fs.statSync(fullPath).isDirectory() && 
              !fullPath.includes('node_modules') && 
              !fullPath.includes('.git')) {
            checkDir(fullPath);
          }
        });
      }
    } catch {}
  }
  
  checkDir(dir);
  return emptyDirs;
}

// 메인 정리 함수
function cleanup(dryRun = false) {
  console.log(dryRun ? '🔍 DRY RUN 모드 (실제 삭제 안 함)\n' : '🗑️  실제 삭제 모드\n');
  
  // 각 카테고리별 처리
  Object.entries(filesToDelete).forEach(([category, patterns]) => {
    console.log(`\n📂 ${category.toUpperCase()}`);
    console.log('─'.repeat(40));
    
    patterns.forEach(pattern => {
      if (pattern.includes('*')) {
        // glob 패턴
        const files = findFiles(pattern);
        files.forEach(file => {
          if (!dryRun) deleteItem(file, category);
          else console.log(`  🔍 발견: ${file}`);
        });
      } else {
        // 일반 경로
        if (fs.existsSync(pattern)) {
          if (!dryRun) deleteItem(pattern, category);
          else console.log(`  🔍 발견: ${pattern}`);
        }
      }
    });
  });
  
  // 빈 디렉토리 정리
  console.log('\n📂 빈 디렉토리');
  console.log('─'.repeat(40));
  const emptyDirs = findEmptyDirs();
  emptyDirs.forEach(dir => {
    if (!dryRun) deleteItem(dir, 'empty-directory');
    else console.log(`  🔍 발견: ${dir}`);
  });
}

// 백업 생성
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `../itda-backup-before-cleanup-${timestamp}`;
  
  console.log('📦 백업 생성 중...');
  try {
    execSync(`cp -r . ${backupDir}`, { stdio: 'ignore' });
    console.log(`✅ 백업 완료: ${backupDir}\n`);
    return backupDir;
  } catch {
    console.log('⚠️  백업 실패 (계속 진행)\n');
    return null;
  }
}

// 결과 출력
function printResults() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 정리 결과');
  console.log('='.repeat(50));
  
  console.log(`\n✅ 삭제된 항목: ${stats.deleted.length}개`);
  if (stats.deleted.length > 0) {
    const byCategory = {};
    stats.deleted.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    });
    Object.entries(byCategory).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count}개`);
    });
  }
  
  console.log(`\n⏭️  건너뛴 항목: ${stats.skipped.length}개`);
  console.log(`❌ 오류: ${stats.errors.length}개`);
  console.log(`\n💾 확보된 공간: ${formatSize(stats.sizeFreed)}`);
  
  if (stats.errors.length > 0) {
    console.log('\n오류 상세:');
    stats.errors.forEach(err => {
      console.log(`  - ${err.path}: ${err.error}`);
    });
  }
}

// 추가 정리 제안
function suggestAdditionalCleanup() {
  console.log('\n' + '='.repeat(50));
  console.log('💡 추가 정리 제안');
  console.log('='.repeat(50));
  
  console.log('\n다음 명령어로 추가 정리 가능:');
  console.log('\n# Git 정리 (큰 파일 히스토리 제거)');
  console.log('git gc --prune=now --aggressive');
  
  console.log('\n# node_modules 재설치로 용량 최적화');
  console.log('rm -rf node_modules package-lock.json');
  console.log('npm install');
  
  console.log('\n# Next.js 캐시 정리');
  console.log('rm -rf .next');
  
  console.log('\n# 사용하지 않는 의존성 확인');
  console.log('npx depcheck');
}

// 메인 실행
async function main() {
  console.log('='.repeat(50));
  console.log('  🧹 ITDA 프로젝트 정리 도구');
  console.log('='.repeat(50));
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // DRY RUN 먼저 실행
  console.log('\n먼저 삭제될 파일을 확인합니다...\n');
  cleanup(true);
  
  console.log('\n' + '='.repeat(50));
  readline.question('\n🚨 위 파일들을 정말 삭제하시겠습니까? (백업 생성됨) (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      // 백업 생성
      const backupPath = createBackup();
      
      // 실제 삭제 실행
      cleanup(false);
      
      // 결과 출력
      printResults();
      
      // 추가 제안
      suggestAdditionalCleanup();
      
      if (backupPath) {
        console.log(`\n📦 백업 위치: ${backupPath}`);
      }
      
      console.log('\n✨ 정리 완료!\n');
    } else {
      console.log('\n❌ 취소되었습니다.\n');
    }
    
    readline.close();
  });
}

// 명령줄 인수 처리
const args = process.argv.slice(2);
if (args.includes('--force') || args.includes('-f')) {
  // 강제 실행 (확인 없이)
  console.log('⚠️  강제 실행 모드\n');
  cleanup(false);
  printResults();
} else {
  // 대화형 실행
  main().catch(console.error);
}