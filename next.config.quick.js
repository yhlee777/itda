/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'upload.wikimedia.org'
    ],
    unoptimized: true, // 빠른 빌드를 위해 임시로
  },
  swcMinify: true,
}

module.exports = nextConfig