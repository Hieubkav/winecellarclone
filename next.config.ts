import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "winecellar.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.winecellar.vn",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
