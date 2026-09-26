import { describe, expect, it } from 'vitest';
import { collectDatasetIds } from './collectDatasetIds';
import type { DashboardDefinition } from './types';

function createDefinition(datasets: string[]): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale: 'en-US',
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    sections: datasets.map((dataset, index) => ({
      id: `section_${index}`,
      title: 'Section',
      kind: 'stat-tiles',
      source: { dataset, view: 'monthly', time: 'recorded_on' },
      tiles: [
        {
          label: 'Total',
          column: 'total',
          reduction: 'sum',
          format: { type: 'number' },
        },
      ],
    })),
  };
}

describe('collectDatasetIds', () => {
  it('returns sorted unique section dataset ids across definitions', () => {
    const definitions = [
      createDefinition(['zeta', 'alpha']),
      createDefinition(['alpha', 'beta']),
    ];

    const result = collectDatasetIds(definitions);

    expect(result).toEqual(['alpha', 'beta', 'zeta']);
  });
});
