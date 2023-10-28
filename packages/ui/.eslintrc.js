module.exports = {
  root: true,
  extends: ['custom', 'plugin:storybook/recommended', 'next'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'react/jsx-props-no-spreading': 'off',
  },
};
