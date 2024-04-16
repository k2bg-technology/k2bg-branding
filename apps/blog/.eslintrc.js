module.exports = {
  root: true,
  extends: ['custom', 'next', 'next/babel'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
