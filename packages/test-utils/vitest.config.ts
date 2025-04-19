import { defineConfig } from 'vitest/config';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react-swc';

const __dirname = dirname(fileURLToPath(import.meta.url));

const setupFilePath = join(__dirname, 'setupTests');

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [setupFilePath],
    css: false,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
    ...(process.env.CI && {
      minThreads: 4,
      maxThreads: 4,
    }),
  },
});
