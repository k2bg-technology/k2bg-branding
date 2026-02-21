import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { mergeConfig } from 'vitest/config';
import { defineConfig as defaultDefineConfig } from 'test-utils';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default mergeConfig(defaultDefineConfig, {
  resolve: {
    alias: {
      ui: resolve(__dirname, '../../packages/ui/index.ts'),
    },
  },
});
