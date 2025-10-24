import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "winecellar.vn",
      },
    ],
  },
};

export default nextConfig;
