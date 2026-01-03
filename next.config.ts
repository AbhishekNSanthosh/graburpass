import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Firebase Storage
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },

      // Google Auth profile photos
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Unsplash
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
