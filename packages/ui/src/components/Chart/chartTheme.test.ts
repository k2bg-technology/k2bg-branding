import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { CHART_PALETTE_SIZE, resolveSeriesColor } from './chartTheme';

// Read from the package root rather than `import.meta.url`: Vite serves test
// modules over a non-file URL, so a relative URL cannot be opened.
function readStyles(packageRelativePath: string) {
  return readFileSync(resolve(process.cwd(), packageRelativePath), 'utf8');
}

const chartStyles = readStyles('src/globals.css');
// The background the charts sit on is a generated design token, resolved the
// same way `globals.css` imports it rather than copied into this test.
const designTokenStyles = readStyles(
  'node_modules/tailwind-config/design-token/tailwind-theme-color.css'
);

function tokenValue(styles: string, token: string) {
  const declaration = styles.match(
    new RegExp(`--color-${token}:\\s*(#[0-9a-f]{6})`)
  );
  if (!declaration) {
    throw new Error(`no --color-${token} declaration found`);
  }
  return declaration[1];
}

function relativeLuminance(hex: string) {
  const [red, green, blue] = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

const backgroundLuminance = relativeLuminance(
  tokenValue(designTokenStyles, 'base-white')
);

function contrastAgainstBaseWhite(hex: string) {
  const foregroundLuminance = relativeLuminance(hex);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('resolveSeriesColor', () => {
  it.each`
    label                     | index
    ${'the first index past'} | ${CHART_PALETTE_SIZE}
    ${'an index far past'}    | ${CHART_PALETTE_SIZE * 9}
  `(
    'gives $label the palette the overflow color instead of a repeat',
    ({ index }) => {
      const series = {};

      const result = resolveSeriesColor(series, index);

      expect(result).toBe('var(--color-chart-overflow)');
    }
  );
});

describe('chart palette tokens', () => {
  // WCAG 1.4.11 asks graphical objects to reach 3:1 against their background,
  // and these charts sit on base-white.
  const minimumGraphicalContrast = 3;

  it.each([
    'chart-6',
    'chart-7',
    'chart-8',
    'chart-9',
    'chart-10',
    'chart-11',
    'chart-12',
    'chart-overflow',
  ])(
    'declares %s above the graphical-object contrast floor on base-white',
    (token) => {
      const result = contrastAgainstBaseWhite(tokenValue(chartStyles, token));

      expect(result).toBeGreaterThanOrEqual(minimumGraphicalContrast);
    }
  );

  // The first five predate that floor and four of them fall under it. They are
  // pinned rather than corrected, because moving them recolors every chart that
  // already ships.
  it.each`
    token        | expected
    ${'chart-1'} | ${'#2a78d6'}
    ${'chart-2'} | ${'#eb6834'}
    ${'chart-3'} | ${'#1baf7a'}
    ${'chart-4'} | ${'#eda100'}
    ${'chart-5'} | ${'#e87ba4'}
  `(
    'keeps $token at $expected so existing charts hold their color',
    ({ token, expected }) => {
      const result = tokenValue(chartStyles, token);

      expect(result).toBe(expected);
    }
  );
});
