/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid OOM during static export: Render previously spawned 47 workers for 1,035 pages.
  // Limit build worker concurrency while preserving every exported route.
  experimental: { cpus: 2 },
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.elimfilters.com'
  }
};

export default nextConfig;
