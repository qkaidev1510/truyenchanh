/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env['API_URL'] ?? 'http://localhost:4000',
    NEXT_PUBLIC_SIGNATURE_SECRET: process.env['SIGNATURE_SECRET'] ?? '',
  },
  // Transpile workspace packages
  transpilePackages: ['@manga/ui', '@manga/shared', '@manga/wasm'],
  webpack(config) {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,  // use browser's native SubtleCrypto; node path is guarded by typeof window
    };
    return config;
  },
};

export default nextConfig;
