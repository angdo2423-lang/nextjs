/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // ← 추가
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  basePath: '/test',
};
module.exports = nextConfig;
