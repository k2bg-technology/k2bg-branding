const { createPortfolioSecurityHeaders } = require('security-headers');

module.exports = {
  reactStrictMode: true,
  transpilePackages: ['ui', 'tailwind-config'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: createPortfolioSecurityHeaders(true), // true = report-only mode for safe rollout
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg/,
      type: 'asset/resource',
    });

    return config;
  },
};
