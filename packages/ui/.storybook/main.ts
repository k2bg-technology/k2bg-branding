import remarkGfm from 'remark-gfm';
import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-onboarding',
    '@storybook/addon-webpack5-compiler-swc',
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        rules: [
          {
            test: /\.module\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  modules: {
                    namedExport: false,
                    localIdentName: '[name]__[local]--[hash:base64:5]',
                  },
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  implementation: 'postcss',
                },
              },
            ],
          },
          {
            test: /\.css$/,
            exclude: /\.module\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  implementation: 'postcss',
                },
              },
            ],
          },
        ],
      },
    },
    '@storybook/addon-mcp',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  staticDirs: ['../public'],
  // Explicitly set output directory for Vercel
  managerHead: (head) => `
    ${head}
    <base href="./">
  `,
  swc: () => ({
    jsc: {
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
  }),
};
export default config;
