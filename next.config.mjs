import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['study-programme.vercel.app'],
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig);