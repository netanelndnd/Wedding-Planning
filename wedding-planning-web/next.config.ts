import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Performance Optimizations
  reactStrictMode: true,
  
  // Compiler options for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.log in production
  },
  
  // Enable optimizations
  experimental: {
    optimizePackageImports: ['firebase', '@firebase/auth', '@firebase/firestore'],
  },
};

export default nextConfig;
