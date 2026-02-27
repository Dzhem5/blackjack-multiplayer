/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Disable ESLint during builds (optional)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build (optional)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
