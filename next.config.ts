import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client'],
  outputFileTracingIncludes: {
    '/**': ['./prisma/**'],
  },
};

export default nextConfig;
