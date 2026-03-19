import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ix4rae0uj5sw13tm.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
