/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['study-programme.vercel.app'],
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;