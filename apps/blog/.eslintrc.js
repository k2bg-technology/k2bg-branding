module.exports = {
  root: true,
  extends: ['custom', 'next'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
