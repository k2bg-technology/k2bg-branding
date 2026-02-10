module.exports = {
  reactStrictMode: true,
  transpilePackages: ['ui', 'tailwind-config'],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg/,
      type: 'asset/resource',
    });

    return config;
  },
};
