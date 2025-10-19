import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    
    // Ignore problematic modules that are not needed when USE_WALLET is false
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    // Ignore Node.js modules in client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
  experimental: {
    // Disable server components that might conflict with miniapp SDK
    serverComponentsExternalPackages: ['@neynar/react'],
  },
};

export default nextConfig;
