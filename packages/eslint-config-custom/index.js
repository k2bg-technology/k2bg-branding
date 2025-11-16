module.exports = {
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    'import/prefer-default-export': 'off',
    camelcase: 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
    'no-shadow': ['error', { allow: ['props'] }],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: [
          __dirname,
          `${__dirname}/../../`,
          `${__dirname}/../../apps/blog`,
          `${__dirname}/../../apps/portfolio`,
          `${__dirname}/../../packages/test-utils`,
          `${__dirname}/../../packages/ui`,
        ],
      },
    ],
  },
  ignorePatterns: ['.eslintrc.js'],
};
