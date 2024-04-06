module.exports = {
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
