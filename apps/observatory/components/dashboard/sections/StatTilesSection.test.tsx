import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const sparkline = vi.hoisted(() =>
  vi.fn((_props: React.ComponentProps<typeof import('ui').Sparkline>) => null)
);
vi.mock('ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('ui')>()),
  Sparkline: sparkline,
}));

import {
  type DashboardDefinition,
  Period,
  type StatTilesSection as StatTilesDefinition,
} from '../../../modules/dashboard/domain';
import { StatTilesSection } from './StatTilesSection';

const section: StatTilesDefinition = {
  id: 'headline',
  title: 'Headline',
  kind: 'stat-tiles',
  source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
  tiles: [
    {
      label: 'Total',
      column: 'total',
      reduction: 'sum',
      format: { type: 'number' },
      sparkline: { window: 3 },
    },
  ],
};
const dashboard: DashboardDefinition = {
  id: 'summary',
  title: 'Summary',
  grain: 'month',
  timeZone: 'UTC',
  locale: 'en-US',
  revalidate: 86_400,
  defaultPeriod: 'latest-with-data',
  sections: [section],
};
const data = {
  truncated: false,
  buckets: [
    { period: '2026-06', values: [5] },
    { period: '2026-08', values: [7] },
    { period: '2026-09', values: [9] },
  ],
};

describe('StatTilesSection', () => {
  it.each([
    { selected: '2026-08', values: [5, null, 7] },
    { selected: '2026-09', values: [null, 7, 9] },
  ])('ends the sparkline at $selected', ({ selected, values }) => {
    const period = Period.parse('month', selected);
    if (period === null) throw new Error('Expected month');
    const sut = (
      <StatTilesSection
        dashboard={dashboard}
        section={section}
        data={data}
        period={period}
      />
    );

    render(sut);

    expect(sparkline.mock.calls.at(-1)?.[0]).toMatchObject({
      label: 'Total',
      values,
    });
  });

  it('shows a tile without a sparkline', () => {
    const period = Period.parse('month', '2026-08');
    if (period === null) throw new Error('Expected month');
    const sut = (
      <StatTilesSection
        dashboard={dashboard}
        section={{
          ...section,
          tiles: [{ ...section.tiles[0], sparkline: undefined }],
        }}
        data={data}
        period={period}
      />
    );

    render(sut);

    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
