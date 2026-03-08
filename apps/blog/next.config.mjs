/**
 * @type {import('next').NextConfig}
 */
const securityHeaders = [
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
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://platform.twitter.com https://*.hcaptcha.com https://hcaptcha.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://res.cloudinary.com https://*.amazonaws.com https://images.unsplash.com https://*.cdninstagram.com https://pbs.twimg.com data:",
      "font-src 'self'",
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com https://*.hcaptcha.com https://hcaptcha.com https://api.cloudinary.com https://www.instagram.com https://pagead2.googlesyndication.com",
      'frame-src https://*.hcaptcha.com https://hcaptcha.com https://platform.twitter.com https://syndication.twitter.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com',
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const config = {
  reactStrictMode: true,
  transpilePackages: ['ui', 'tailwind-config'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/blog',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg/,
      type: 'asset/resource',
    });

    return config;
  },
};

export default config;
