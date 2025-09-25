/** @type {import('next').NextConfig} */
const nextConfig = {
  // 기존 설정 유지
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // 이미지 최적화
  images: {
    domains: [
      'images.unsplash.com', 
      'upload.wikimedia.org',
      'images.samsung.com',
      't1.kakaocdn.net',
      'static.oliveyoung.co.kr',
      'www.apgroup.com',
      'www.woowahan.com',
      'image.rocketpunch.com'
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  
  // SWC 컴파일러 최적화
  swcMinify: true,
  
  // 프로덕션 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // 헤더 설정 (캐싱)
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig