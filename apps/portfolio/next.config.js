module.exports = {
  reactStrictMode: true,
  transpilePackages: ['ui', 'tailwind-config'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg/,
      type: 'asset/resource',
    });

    return config;
  },
};
