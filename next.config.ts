import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Les images de valorant-api.com sont déjà optimisées et servies par CDN.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "media.valorant-api.com" }],
  },
  poweredByHeader: false,
};

export default nextConfig;
