import react from '@vitejs/plugin-react-swc';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const uiAlias = resolve(__dirname, '../../packages/ui/index.ts');
const loggerAlias = resolve(__dirname, '../../packages/logger/index.ts');
const jsdomSetupPath = resolve(
  __dirname,
  '../../packages/test-utils/setupTests.ts'
);
const dbGlobalSetupPath = join(__dirname, 'vitest.globalSetup.node-db.ts');

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
        resolve: { alias: { ui: uiAlias, logger: loggerAlias } },
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
        resolve: { alias: { ui: uiAlias, logger: loggerAlias } },
        test: {
          name: 'node-db',
          globals: true,
          environment: 'node',
          include: ['**/*.db.test.ts'],
          exclude: ['node_modules/**', 'dist/**'],
          // globalSetup runs once per project (in the main process, before
          // workers fork) so the Testcontainers Postgres is started exactly
          // once for every *.db.test.ts file. A setupFile would re-run the
          // beforeAll/afterAll per test file.
          globalSetup: [dbGlobalSetupPath],
          // singleFork keeps all DB test files in one worker so they share the
          // same connection pool; per-test isolation comes from
          // truncateAllTables(), not from spinning up a new container.
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } },
          testTimeout: 30_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
