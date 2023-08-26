module.exports = {
  extends: [
    'next',
    'turbo',
    'prettier',
    'airbnb',
    'airbnb/hooks',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'import'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-filename-extension': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/prefer-default-export': 'off',
    camelcase: 'off',
    'max-len': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
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
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        assert: 'either',
      },
    ],
  },
  ignorePatterns: ['.eslintrc.js'],
};
