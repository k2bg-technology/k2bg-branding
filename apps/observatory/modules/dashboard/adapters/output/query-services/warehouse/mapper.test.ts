import { describe, expect, it } from 'vitest';

import type { SectionQueryPlan } from '../../../../domain';
import { AmbiguousLatestValueError } from '../../../../domain';
import { toDateBounds, toSectionData } from './mapper';

function createPlan(): SectionQueryPlan {
  return {
    kind: 'stat-tiles',
    sectionId: 'headline',
    source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
    timeZone: 'UTC',
    dateRange: { firstDate: '2026-09-01', lastDate: '2026-09-30' },
    measures: [
      { column: 'total', reduction: 'sum' },
      { column: 'status', reduction: 'latest' },
    ],
  };
}

describe('warehouse dashboard mapper', () => {
  it('returns null when a section query yields zero rows', () => {
    const result = toSectionData([], createPlan());

    expect(result).toBeNull();
  });

  it('keeps all-null measures as null values', () => {
    const result = toSectionData(
      [{ value_0: null, value_1: null, distinct_count_1: 1 }],
      createPlan()
    );

    expect(result).toEqual({ values: [null, null] });
  });

  it('throws when null and a value share the latest source time', () => {
    const act = () =>
      toSectionData(
        [{ value_0: 10, value_1: null, distinct_count_1: 2 }],
        createPlan()
      );

    expect(act).toThrow(AmbiguousLatestValueError);
  });

  it('maps formatted bounds while preserving their calendar dates', () => {
    const result = toDateBounds([
      { first_date: '2026-08-01', last_date: '2026-09-30' },
    ]);

    expect(result).toEqual({
      firstDate: '2026-08-01',
      lastDate: '2026-09-30',
    });
  });
});
