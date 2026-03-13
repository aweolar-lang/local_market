import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  reactCompiler: true,
  
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yknfqievslbzhlkkmywr.supabase.co', // Your specific Supabase ID
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;