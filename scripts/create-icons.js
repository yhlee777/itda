// scripts/create-icons.js
// 실행: node scripts/create-icons.js

const fs = require('fs');
const path = require('path');

// ITDA 로고 SVG (보라색 그라데이션)
const logoSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="100" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333EA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M 150 200 L 150 312 L 180 312 L 180 200 Z" fill="white"/>
  <path d="M 210 200 L 210 230 L 240 230 L 240 312 L 270 312 L 270 230 L 300 230 L 300 200 Z" fill="white"/>
  <path d="M 150 340 L 150 370 L 210 370 L 210 400 L 150 400 L 150 430 L 210 430 C 230 430 240 420 240 400 L 240 370 C 240 350 230 340 210 340 Z" fill="white"/>
  <path d="M 270 340 L 330 340 L 360 430 L 390 430 L 360 340 C 380 340 390 330 390 310 L 390 280 C 390 260 380 250 360 250 L 330 250 L 330 340 Z M 330 280 L 360 280 L 360 310 L 330 310 Z" fill="white" opacity="0.9"/>
</svg>
`;

// 아이콘 HTML 템플릿 (PNG 대신 HTML로 렌더링)
function createIconHTML(size) {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; }
    .icon-container {
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
      border-radius: ${size * 0.2}px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .icon-text {
      color: white;
      font-size: ${size * 0.35}px;
      font-weight: 900;
      letter-spacing: ${size * 0.01}px;
    }
  </style>
</head>
<body>
  <div class="icon-container">
    <div class="icon-text">ITDA</div>
  </div>
</body>
</html>`;
}

// public 폴더에 아이콘 생성
const publicDir = path.join(__dirname, '..', 'public');

// SVG 아이콘 저장
fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSVG);

// 간단한 PNG 대체 (실제로는 canvas 라이브러리 필요)
const sizes = [192, 256, 384, 512];
sizes.forEach(size => {
  // HTML 파일로 임시 생성 (실제로는 PNG 변환 필요)
  const htmlContent = createIconHTML(size);
  fs.writeFileSync(path.join(publicDir, `icon-${size}x${size}.html`), htmlContent);
});

console.log('✅ 아이콘 파일들이 생성되었습니다!');
console.log('⚠️  주의: HTML 파일들을 PNG로 변환해야 합니다.');
console.log('💡 추천: https://realfavicongenerator.net 에서 logo.svg를 업로드하여 모든 아이콘 생성');