import { describe, expect, it } from 'vitest';

import type { DashboardDefinition } from '../../../domain';
import { FetchPeriodBounds } from './useCase';

function createDashboard(): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'Asia/Tokyo',
    locale: 'en-US',
    revalidate: 3_600,
    sections: [
      {
        id: 'headline',
        title: 'Headline',
        kind: 'stat-tiles',
        source: {
          dataset: 'metrics',
          view: 'monthly',
          time: { column: 'recorded_at', type: 'timestamp' },
        },
        tiles: [
          {
            label: 'Total',
            column: 'total',
            reduction: 'sum',
            format: { type: 'number' },
          },
        ],
      },
    ],
  };
}

describe('FetchPeriodBounds', () => {
  it('uses the first section source with the dashboard time zone and revalidation window', async () => {
    const dashboard = createDashboard();
    const queryService = {
      fetchPeriodBounds: async (
        source: DashboardDefinition['sections'][number]['source'],
        timeZone: string,
        options: { name: string; revalidate: number }
      ) =>
        source.view === 'monthly' &&
        timeZone === 'Asia/Tokyo' &&
        options.revalidate === 3_600
          ? { firstDate: '2026-08-01', lastDate: '2026-09-30' }
          : null,
    };
    const sut = new FetchPeriodBounds(queryService);

    const result = await sut.execute(dashboard);

    expect(result).toEqual({
      firstDate: '2026-08-01',
      lastDate: '2026-09-30',
    });
  });
});
