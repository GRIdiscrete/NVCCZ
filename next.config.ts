import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // For development/demo: allow external images without domain setup
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
