import { describe, expect, it } from 'vitest';

import type { StatTilesSection } from '../definition';
import { Period } from '../period';
import { planStatTilesSection } from './statTiles';

function section() {
  return {
    id: 'headline-trend',
    title: 'Headline with trend',
    kind: 'stat-tiles',
    width: 'half',
    source: {
      dataset: 'sample_dataset',
      view: 'monthly_summary',
      time: { column: 'recorded_at', type: 'timestamp' },
    },
    tiles: [
      {
        label: 'Total',
        column: 'total_value',
        reduction: 'sum',
        transform: 'absolute',
        comparison: { direction: 'higher-is-better' },
        format: { type: 'currency' },
        sparkline: { window: 6 },
      },
    ],
  } satisfies StatTilesSection;
}

describe('stat tile plans', () => {
  it('reads six trailing buckets for a sparkline and comparison', () => {
    const sut = planStatTilesSection;
    const definition = section();
    const period = Period.parse('month', '2026-08');
    if (period === null) throw new Error('Expected month');

    const result = sut(definition, period, 'Asia/Tokyo');

    expect(result).toEqual({
      kind: 'stat-tiles',
      sectionId: 'headline-trend',
      grain: 'month',
      source: definition.source,
      timeZone: 'Asia/Tokyo',
      selectedPeriod: '2026-08',
      dateRange: { firstDate: '2026-03-01', lastDate: '2026-08-31' },
      measures: [
        {
          column: 'total_value',
          reduction: 'sum',
          transform: 'absolute',
          compares: true,
          sparkline: { window: 6 },
          firstPeriod: '2026-03',
        },
      ],
    });
  });

  it('reads only the selected period without sparkline or comparison', () => {
    const sut = planStatTilesSection;
    const definition = section();
    const period = Period.parse('month', '2026-08');
    if (period === null) throw new Error('Expected month');

    const result = sut(
      {
        ...definition,
        tiles: [
          {
            ...definition.tiles[0],
            comparison: undefined,
            sparkline: undefined,
          },
        ],
      },
      period,
      'Asia/Tokyo'
    );

    expect(result.dateRange.firstDate).toBe('2026-08-01');
    expect(result.measures[0]).not.toHaveProperty('sparkline');
  });

  it("keeps each tile's own period boundary when another tile widens the query", () => {
    const sut = planStatTilesSection;
    const definition = section();
    const period = Period.parse('month', '2026-08');
    if (period === null) throw new Error('Expected month');

    const result = sut(
      {
        ...definition,
        tiles: [
          definition.tiles[0],
          { ...definition.tiles[0], sparkline: undefined },
          {
            ...definition.tiles[0],
            sparkline: undefined,
            comparison: undefined,
          },
        ],
      },
      period,
      'Asia/Tokyo'
    );

    expect(result.measures.map((measure) => measure.firstPeriod)).toEqual([
      '2026-03',
      '2026-07',
      '2026-08',
    ]);
  });
});
