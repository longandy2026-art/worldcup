/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  typescript: {
    ignoreBuildErrors: process.env.CI ? true : false,
  },
  eslint: {
    ignoreDuringBuilds: process.env.CI ? true : false,
  },
}

module.exports = nextConfig
