/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable image optimization
  images: {
    domains: [],
    unoptimized: false,
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Webpack configuration for file handling
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle CSV and Excel files
    config.module.rules.push({
      test: /\.(csv|xlsx|xls)$/,
      use: 'raw-loader',
    });

    return config;
  },

  // Experimental features
  experimental: {
    // Enable modern JavaScript features
    esmExternals: true,
    // Improve performance
    optimizeCss: true,
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Output settings for Vercel
  output: 'standalone',
  
  // Trailing slash handling
  trailingSlash: false,
  
  // Compression
  compress: true,

  // PoweredByHeader
  poweredByHeader: false,

  // Generate ETags
  generateEtags: true,

  // Page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

module.exports = nextConfig;
