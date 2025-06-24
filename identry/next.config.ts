import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tuexsobbaasxuaxtgccq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    domains: [
      'lh3.googleusercontent.com',
      'images.unsplash.com',
    ],
  },
};

export default nextConfig;
