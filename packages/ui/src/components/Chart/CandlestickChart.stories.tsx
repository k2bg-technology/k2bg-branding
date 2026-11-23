import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import {
  CandlestickChart,
  type CandlestickDatum,
  ChartColor,
  ChartPeriod,
} from '.';

function createCandle(timestamp: number, index: number): CandlestickDatum {
  const open = Math.round(100 + index / 3 + 7 * Math.sin(index / 4));
  const close = open + Math.round(5 * Math.cos(index));
  return {
    timestamp,
    open,
    high: Math.max(open, close) + 3,
    low: Math.min(open, close) - 3,
    close,
  };
}

function sessionCandles(weekCount: number) {
  return Array.from({ length: weekCount * 5 }, (_, index) => {
    const day = 5 + Math.floor(index / 5) * 7 + (index % 5);
    return createCandle(Date.UTC(2026, 0, day), index);
  });
}

const sessions = sessionCandles(12);
const monthlyCandles = Array.from({ length: 60 }, (_, index) =>
  createCandle(Date.UTC(2021, index, 1), index)
);
const formatCurrency = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
}).format;

const meta = {
  component: CandlestickChart,
  args: {
    label: 'Daily measurement range',
    candles: sessions,
    labels: { open: 'Open', high: 'High', low: 'Low', close: 'Close' },
    period: ChartPeriod.QUARTER,
  },
  argTypes: {
    period: { control: 'select', options: Object.values(ChartPeriod) },
    upColor: { control: 'select', options: Object.values(ChartColor) },
    downColor: { control: 'select', options: Object.values(ChartColor) },
    height: { control: 'select', options: ['sm', 'md', 'lg'] },
    animated: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.candlestickChart.description',
      },
      overview: 'components.candlestickChart.overview',
      usage: 'components.candlestickChart.usage',
      accessibility: 'components.candlestickChart.accessibility',
      doList: 'components.candlestickChart.doList',
      dontList: 'components.candlestickChart.dontList',
      relatedComponents: 'components.candlestickChart.relatedComponents',
      dependencies: 'components.candlestickChart.dependencies',
      references: 'components.candlestickChart.references',
    },
  },
} satisfies Meta<typeof CandlestickChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const chart = await canvas.findByRole('application', { name: args.label });
    const tooltip = () =>
      canvasElement.querySelector('[data-slot="chart-tooltip"]');

    await userEvent.tab();
    await expect(chart).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(tooltip()).toBeInTheDocument());
    const firstTooltipText = tooltip()?.textContent;

    await userEvent.keyboard('{ArrowRight}');

    await waitFor(async () => {
      await expect(tooltip()).toBeInTheDocument();
      await expect(tooltip()?.textContent).not.toBe(firstTooltipText);
    });
  },
};

export const InvertedColors: Story = {
  args: { upColor: ChartColor.ERROR, downColor: ChartColor.CHART_1 },
};

export const IncompleteCandles: Story = {
  args: {
    candles: sessions.slice(0, 12).map((candle, index) => {
      if (index === 3 || index === 7) {
        return { ...candle, open: null, high: null, low: null };
      }
      if (index === 5) {
        return { ...candle, close: null };
      }
      return candle;
    }),
  },
};

export const FlatCandles: Story = {
  args: {
    candles: sessions
      .slice(0, 12)
      .map((candle) => ({ ...candle, close: candle.open })),
  },
};

export const Monthly: Story = {
  args: {
    label: 'Monthly measurement range',
    period: ChartPeriod.YEAR,
    candles: monthlyCandles,
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const chart = await canvas.findByRole('application', { name: args.label });
    const heading = () =>
      canvasElement.querySelector('[data-slot="chart-tooltip"] p')?.textContent;

    await userEvent.tab();
    await expect(chart).toHaveFocus();
    await waitFor(() => expect(heading()).toBe('2021/1'));
    const firstHeading = heading();

    await userEvent.keyboard('{ArrowRight>12/}');

    await waitFor(() => expect(heading()).toBe('2022/1'));
    await expect(heading()).not.toBe(firstHeading);
  },
};

export const Localized: Story = {
  args: {
    locale: 'ja-JP',
    timeZone: 'Asia/Tokyo',
    valueFormatter: formatCurrency,
  },
};

export const ManyCandles: Story = {
  args: { candles: sessionCandles(24) },
};

export const Empty: Story = {
  args: { label: 'Empty measurement range', candles: [] },
  play: async ({ args, canvas, canvasElement }) => {
    const chart = await canvas.findByRole('application', { name: args.label });

    await expect(chart).toBeInTheDocument();
    await expect(
      canvasElement.querySelectorAll('[data-slot="candlestick-candle"]')
    ).toHaveLength(0);
    await expect(
      canvasElement.querySelector('[data-slot="chart-tooltip"]')
    ).not.toBeInTheDocument();
  },
};
