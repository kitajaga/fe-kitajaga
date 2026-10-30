import type { NextConfig } from "next";

const baseApiUrl =
  process.env.BASE_API_URL ||
  process.env.BASE_URL_API ||
  "http://localhost:5000/api/v1";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${baseApiUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
