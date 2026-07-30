/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  generateEtags: true,

  // Silence Turbopack monorepo workspace warning
  turbopack: {
    root: '.',
  },
};

export default nextConfig;
