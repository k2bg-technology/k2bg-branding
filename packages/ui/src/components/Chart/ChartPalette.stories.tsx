import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { BarChart } from '.';
import { CHART_PALETTE_SIZE } from './chartTheme';

const paletteTokens = Array.from(
  { length: CHART_PALETTE_SIZE },
  (_, index) => `chart-${index + 1}`
);

const swatchTokens = [...paletteTokens, 'chart-overflow'];

function tokenHex(token: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${token}`)
    .trim();
}

function relativeLuminance(hex: string): number | null {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    return null;
  }
  const [red, green, blue] = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Measured against the base-white token the charts sit on, not pure white. */
function contrastOnBaseWhite(hex: string): string {
  const foreground = relativeLuminance(hex);
  const background = relativeLuminance(tokenHex('base-white'));
  if (foreground === null || background === null) {
    return 'unresolved';
  }
  const lighter = Math.max(foreground, background);
  const darker = Math.min(foreground, background);
  return `${((lighter + 0.05) / (darker + 0.05)).toFixed(2)}:1`;
}

const snapshotCategories = ['Q1', 'Q2', 'Q3'];

const fileTypeSeries = [
  { id: 'documents', label: 'Documents', values: [18, 20, 23] },
  { id: 'images', label: 'Images', values: [42, 47, 51] },
  { id: 'video', label: 'Video', values: [96, 104, 121] },
  { id: 'audio', label: 'Audio', values: [12, 13, 13] },
  { id: 'archives', label: 'Archives', values: [24, 22, 28] },
  { id: 'code', label: 'Code', values: [8, 9, 11] },
  { id: 'fonts', label: 'Fonts', values: [3, 3, 4] },
  { id: 'datasets', label: 'Datasets', values: [31, 38, 44] },
  { id: 'backups', label: 'Backups', values: [64, 71, 69] },
  { id: 'logs', label: 'Logs', values: [15, 19, 26] },
  { id: 'installers', label: 'Installers', values: [21, 18, 17] },
  { id: 'exports', label: 'Exports', values: [9, 12, 14] },
];

const beyondPaletteSeries = [
  ...fileTypeSeries,
  { id: 'containers', label: 'Containers', values: [27, 33, 36] },
  { id: 'caches', label: 'Caches', values: [11, 14, 16] },
];

const gigabytes = (value: number) => `${value}GB`;

// The palette is a token set rather than a component, so the title is stated
// instead of being derived from a `component`.
const meta = {
  title: 'components/Chart/ChartPalette',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The palette in order, with each token's measured contrast on base-white. */
export const Swatches: Story = {
  render: () => (
    <div className="flex flex-col gap-spacious bg-base-white p-spacious">
      <p className="text-body-r-sm text-base-black/80">
        Series fall through <code>chart-1</code> … <code>chart-12</code> in this
        order. A thirteenth series takes <code>chart-overflow</code> rather than
        repeating a color, because two series sharing one color read as one
        group. Ratios are measured against base-white; the package declares no
        dark theme, so no dark-theme figure is stated.
      </p>
      <ul className="grid grid-cols-1 gap-normal sm:grid-cols-2 lg:grid-cols-3">
        {swatchTokens.map((token) => (
          <li key={token} className="flex items-center gap-normal">
            <span
              aria-hidden
              className="h-10 w-10 shrink-0 rounded-xs"
              style={{ backgroundColor: `var(--color-${token})` }}
            />
            <span className="flex flex-col">
              <span className="text-caption text-base-black">{token}</span>
              <span className="text-caption text-base-black/80">
                {tokenHex(token)} · {contrastOnBaseWhite(tokenHex(token))}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  ),
};

/** Twelve groups at once, so adjacent bands can be judged by eye. */
export const TwelveSeries: Story = {
  render: () => (
    <BarChart
      label="Storage used per file type across three snapshots"
      categories={snapshotCategories}
      series={fileTypeSeries}
      stacked
      showLegend
      height="lg"
      valueFormatter={gigabytes}
    />
  ),
  play: async ({ canvasElement }) => {
    const fills = new Set(
      Array.from(
        canvasElement.querySelectorAll('.recharts-bar-rectangle path'),
        (bar) => bar.getAttribute('fill')
      )
    );

    await expect(fills.size).toBe(CHART_PALETTE_SIZE);
  },
};

/** Past twelve, extra series share the neutral instead of a palette color. */
export const BeyondThePalette: Story = {
  render: () => (
    <BarChart
      label="Storage used per file type beyond the palette size"
      categories={snapshotCategories}
      series={beyondPaletteSeries}
      stacked
      showLegend
      height="lg"
      valueFormatter={gigabytes}
    />
  ),
  play: async ({ canvasElement }) => {
    const overflowBars = canvasElement.querySelectorAll(
      '.recharts-bar-rectangle path[fill="var(--color-chart-overflow)"]'
    );
    const seriesPastPalette = beyondPaletteSeries.length - CHART_PALETTE_SIZE;

    await expect(overflowBars).toHaveLength(
      seriesPastPalette * snapshotCategories.length
    );
  },
};
