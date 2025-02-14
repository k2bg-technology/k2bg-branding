/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-unresolved, import/no-extraneous-dependencies
const sharedConfig = require('tailwind-config');

module.exports = {
  ...sharedConfig,
  content: ['./src/**/*.{ts,tsx,mdx}'],
  plugins: [],
};
