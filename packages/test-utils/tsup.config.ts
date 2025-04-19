import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts', 'vitest.config.ts', 'setupTests.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['@vitejs/plugin-react-swc', 'vitest', '@testing-library/jest-dom'],
});
