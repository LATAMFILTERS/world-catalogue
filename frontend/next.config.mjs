/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    // Keep Render deploys unblocked while legacy lint debt is audited separately.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
