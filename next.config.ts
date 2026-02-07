import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "110mb", // Videos hasta 100MB
    },
  },
};

export default nextConfig;
