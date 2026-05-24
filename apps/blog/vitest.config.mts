import react from '@vitejs/plugin-react-swc';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const uiAlias = resolve(__dirname, '../../packages/ui/index.ts');
const jsdomSetupPath = resolve(
  __dirname,
  '../../packages/test-utils/setupTests.ts'
);
const dbSetupPath = join(__dirname, 'vitest.setup.node-db.ts');

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
    // Vitest renamed `workspace` to `projects` in 3.2; this app is pinned to
    // 3.1.x via test-utils' peerDependency, so the older field name applies.
    workspace: [
      {
        plugins: [react()],
        resolve: { alias: { ui: uiAlias } },
        test: {
          name: 'jsdom',
          globals: true,
          environment: 'jsdom',
          setupFiles: [jsdomSetupPath],
          css: false,
          include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          exclude: ['**/*.db.test.ts', 'node_modules/**', 'dist/**'],
          ...(process.env.CI && { minThreads: 4, maxThreads: 4 }),
        },
      },
      {
        resolve: { alias: { ui: uiAlias } },
        test: {
          name: 'node-db',
          globals: true,
          environment: 'node',
          include: ['**/*.db.test.ts'],
          exclude: ['node_modules/**', 'dist/**'],
          setupFiles: [dbSetupPath],
          // Share one Postgres container across all DB tests by running them
          // in a single forked worker; per-test isolation comes from the
          // truncateAllTables() helper, not from spinning up a new container.
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } },
          testTimeout: 30_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
