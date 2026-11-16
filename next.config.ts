import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed reactCompiler to fix the type error
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.example.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      // Add your future production domain here later
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
  },
};

export default nextConfig;