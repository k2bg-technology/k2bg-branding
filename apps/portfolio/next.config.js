module.exports = {
  reactStrictMode: true,
  transpilePackages: ['ui', 'tailwind-config'],
  experimental: {
    optimizePackageImports: ['ui'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg/,
      type: 'asset/resource',
    });

    return config;
  },
};
