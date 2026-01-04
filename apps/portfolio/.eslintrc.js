module.exports = {
  root: true,
  extends: ['custom', 'next', 'plugin:storybook/recommended'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
