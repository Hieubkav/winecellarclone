import type { NextConfig } from "next";

type RemotePattern = NonNullable<NextConfig["images"]>["remotePatterns"];

const defaultPatterns: RemotePattern = [
  {
    protocol: "https",
    hostname: "winecellar.vn",
  },
  {
    protocol: "https",
    hostname: "placehold.co",
  },
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
];

const envMediaHosts = (process.env.NEXT_PUBLIC_MEDIA_HOSTS ?? "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

const parseHostToPattern = (raw: string) => {
  try {
    const url = raw.includes("://") ? new URL(raw) : new URL(`https://${raw}`);
    return {
      protocol: url.protocol.replace(":", "") || "https",
      hostname: url.hostname,
      port: url.port || undefined,
    } as (typeof defaultPatterns)[number];
  } catch {
    return null;
  }
};

const envPatterns = envMediaHosts
  .map(parseHostToPattern)
  .filter((pattern): pattern is NonNullable<typeof pattern> => Boolean(pattern));

const needsLocalhostPattern = !envPatterns.some(
  (pattern) => pattern.hostname === "localhost"
);

const remotePatterns: RemotePattern = [
  ...(needsLocalhostPattern
    ? [
        {
          protocol: "http",
          hostname: "localhost",
          port: "8000",
        } as (typeof defaultPatterns)[number],
      ]
    : []),
  ...envPatterns,
  ...defaultPatterns,
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  experimental: {
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Link',
            value: [
              '<https://winecellar.vn>; rel=preconnect; crossorigin',
              '<https://images.unsplash.com>; rel=preconnect; crossorigin',
              '<https://placehold.co>; rel=preconnect; crossorigin',
            ].join(', '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
