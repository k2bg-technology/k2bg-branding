import react from '@vitejs/plugin-react-swc';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const uiAlias = resolve(__dirname, '../../packages/ui/index.ts');
const jsdomSetupPath = resolve(
  __dirname,
  '../../packages/test-utils/setupTests.ts'
);

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { ui: uiAlias } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [jsdomSetupPath],
    css: false,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules/**', 'dist/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
    ...(process.env.CI && { minThreads: 4, maxThreads: 4 }),
  },
});
