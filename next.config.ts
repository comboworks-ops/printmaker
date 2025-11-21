import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
};

// Vercel: force clean build (cache buster: 1)
export default nextConfig;
