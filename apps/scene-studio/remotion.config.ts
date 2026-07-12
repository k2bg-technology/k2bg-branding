import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setEntryPoint('./src/index.ts');
// Keep webpack overrides composable so future integrations (e.g. Three.js
// GLSL loaders) can chain onto the Tailwind override.
Config.overrideWebpackConfig((currentConfiguration) =>
  enableTailwind(currentConfiguration)
);
Config.setOverwriteOutput(true);
