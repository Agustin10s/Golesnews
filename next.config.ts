import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.api-sports.io' },
      { protocol: 'https', hostname: 'media-3.api-sports.io' },
      { protocol: 'https', hostname: 'media-2.api-sports.io' },
      { protocol: 'https', hostname: 'media-1.api-sports.io' },
      { protocol: 'https', hostname: 'crests.football-data.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' }, // allow all for logos from CMS
    ],
  },
};

export default nextConfig;
