import react from '@vitejs/plugin-react-swc';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [join(__dirname, '../test-utils/setupTests.ts')],
    css: false,
    include: ['src/**/*.test.*'],
  },
});
