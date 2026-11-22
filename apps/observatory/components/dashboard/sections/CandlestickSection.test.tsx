import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const chart = vi.hoisted(() =>
  vi.fn(
    (_props: React.ComponentProps<typeof import('ui').CandlestickChart>) => null
  )
);

vi.mock('ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('ui')>()),
  CandlestickChart: chart,
}));

import { ChartColor, ChartPeriod } from 'ui';

import type {
  CandlestickSection as CandlestickSectionDefinition,
  DashboardDefinition,
} from '../../../modules/dashboard/domain';
import { Period } from '../../../modules/dashboard/domain';
import type { SectionData } from '../../../modules/dashboard/use-cases';
import { CandlestickSection } from './CandlestickSection';

function renderCandles(
  data: SectionData,
  overrides: Partial<CandlestickSectionDefinition> = {}
) {
  const section: CandlestickSectionDefinition = {
    id: 'candles',
    title: 'Price range',
    kind: 'candlestick',
    source: { dataset: 'metrics', view: 'quotes', time: 'quote_date' },
    grain: 'day',
    window: 7,
    format: { type: 'currency' },
    open: { column: 'opening_value', label: 'Opening price' },
    high: { column: 'highest_value', label: 'Session high' },
    low: { column: 'lowest_value', label: 'Session low' },
    close: { column: 'closing_value', label: 'Closing price' },
    ...overrides,
  };
  const dashboard: DashboardDefinition = {
    id: 'market',
    title: 'Market',
    grain: 'month',
    timeZone: 'Asia/Tokyo',
    locale: 'en-US',
    currency: 'USD',
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    labels: { truncated: 'Older sessions are hidden' },
    sections: [section],
  };
  const period = Period.parse('month', '2026-08');
  if (period === null) throw new Error('Expected a fixture month');
  const Sut = CandlestickSection;

  render(
    <Sut dashboard={dashboard} section={section} data={data} period={period} />
  );

  const props = chart.mock.calls.at(-1)?.[0];
  if (props === undefined) throw new Error('Expected candlestick chart props');
  return props;
}

beforeEach(() => chart.mockClear());

describe('CandlestickSection', () => {
  it('gives only returned buckets slots in order with Tokyo midnight timestamps', () => {
    const data: SectionData = {
      truncated: false,
      buckets: [
        { period: '2026-08-25', values: [10, 24, 9, 20] },
        { period: '2026-08-28', values: [null, null, null, null] },
      ],
    };

    const props = renderCandles(data);

    expect(props.candles).toEqual([
      { timestamp: 1787583600000, open: 10, high: 24, low: 9, close: 20 },
      {
        timestamp: 1787842800000,
        open: null,
        high: null,
        low: null,
        close: null,
      },
    ]);
    expect(props.timeZone).toBe('Asia/Tokyo');
    expect(props.period).toBe(ChartPeriod.WEEK);
  });

  it.each([
    {
      colors: undefined,
      upColor: ChartColor.SUCCESS,
      downColor: ChartColor.ERROR,
    },
    {
      colors: 'green-up',
      upColor: ChartColor.SUCCESS,
      downColor: ChartColor.ERROR,
    },
    {
      colors: 'red-up',
      upColor: ChartColor.ERROR,
      downColor: ChartColor.CHART_1,
    },
  ] as const)(
    'passes the $colors direction colors to the chart',
    ({ colors, upColor, downColor }) => {
      const data: SectionData = {
        truncated: false,
        buckets: [{ period: '2026-08-28', values: [10, 24, 9, 20] }],
      };

      const props = renderCandles(data, { colors });

      expect(props).toMatchObject({ upColor, downColor });
    }
  );

  it('passes the section labels and formats chart values in the dashboard currency', () => {
    const data: SectionData = {
      truncated: false,
      buckets: [{ period: '2026-08-28', values: [10, 24, 9, 20] }],
    };

    const props = renderCandles(data);

    expect(props.label).toBe('Price range');
    expect(props.labels).toEqual({
      open: 'Opening price',
      high: 'Session high',
      low: 'Session low',
      close: 'Closing price',
    });
    expect(props.valueFormatter?.(1234.5)).toBe('$1,234.50');
  });

  it('uses year-and-month ticks for monthly candles', () => {
    const data: SectionData = {
      truncated: false,
      buckets: [
        { period: '2026-07', values: [9, 25, 8, 20] },
        { period: '2026-08', values: [19, 35, 10, 30] },
      ],
    };

    const props = renderCandles(data, { grain: 'month', window: 2 });

    expect(props.period).toBe(ChartPeriod.YEAR);
  });

  it('shows the calendar window including days without sessions', () => {
    const data: SectionData = {
      truncated: false,
      buckets: [{ period: '2026-08-28', values: [10, 24, 9, 20] }],
    };

    renderCandles(data);

    expect(screen.getByText(/^Aug 25.*31, 2026$/)).toBeInTheDocument();
  });

  it('shortens the window to the first retained bucket and shows the truncation label', () => {
    const data: SectionData = {
      truncated: true,
      buckets: [{ period: '2026-08-28', values: [10, 24, 9, 20] }],
    };

    renderCandles(data);

    expect(
      screen.getByText(/^Aug 28.*31, 2026 · Older sessions are hidden$/)
    ).toBeInTheDocument();
  });
});
