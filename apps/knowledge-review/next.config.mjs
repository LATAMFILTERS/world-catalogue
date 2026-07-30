/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  generateEtags: true,
};

export default nextConfig;
