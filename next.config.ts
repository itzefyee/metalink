import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
  },
  
  // Use webpack (Turbopack is disabled by not including it)
  webpack: (config, { isServer }) => {
    // Handle WASM files with file-loader
    config.module.rules.push({
      test: /\.wasm$/,
      type: "javascript/auto",
      loader: "file-loader",
    });

    // For Webpack 5 (Next.js), add fallback for Node.js modules (client-side only)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        perf_hooks: false,
        os: false,
        worker_threads: false,
        crypto: false,
        stream: false,
        child_process: false,
        path: false,
        util: false,
      };
    }

    return config;
  },

  // Empty turbopack config to silence the error (we're using webpack)
  turbopack: {}
};

export default nextConfig;
