import { describe, expect, it } from 'vitest';

import type {
  WarehouseClient,
  WarehouseQueryRequest,
} from '../../../../../../infrastructure/warehouse';
import type { SectionQueryPlan } from '../../../../domain';
import { MappingError, RepositoryError } from '../../../shared';
import { WarehouseFetchPeriodBoundsQueryService } from './fetchPeriodBoundsQueryService';
import { WarehouseFetchSectionDataQueryService } from './fetchSectionDataQueryService';

function createPlan(
  reduction: SectionQueryPlan['measures'][number]['reduction']
) {
  return {
    kind: 'stat-tiles',
    sectionId: 'headline',
    source: { dataset: 'metrics', view: 'events', time: 'recorded_on' },
    timeZone: 'UTC',
    selectedPeriod: '2026-09',
    dateRange: { firstDate: '2026-09-01', lastDate: '2026-09-30' },
    measures: [{ column: 'amount', reduction, compares: false }],
  } satisfies SectionQueryPlan;
}

describe('WarehouseFetchSectionDataQueryService', () => {
  it.each([
    { reduction: 'sum' as const, warehouseValue: 6 },
    { reduction: 'average' as const, warehouseValue: 2 },
    { reduction: 'minimum' as const, warehouseValue: 1 },
    { reduction: 'maximum' as const, warehouseValue: 3 },
    { reduction: 'latest' as const, warehouseValue: 3 },
  ])(
    'selects the $reduction query and maps its returned value',
    async ({ reduction, warehouseValue }) => {
      const client: WarehouseClient = {
        query: async (request) => {
          const expectsReduction =
            reduction === 'latest'
              ? request.sql.includes('ARRAY_AGG')
              : request.sql.includes(
                  {
                    sum: 'SUM',
                    average: 'AVG',
                    minimum: 'MIN',
                    maximum: 'MAX',
                  }[reduction]
                );
          return expectsReduction
            ? [
                {
                  period: '2026-09',
                  value_0: warehouseValue,
                  ...(reduction === 'latest' ? { distinct_count_0: 1 } : {}),
                },
              ]
            : [];
        },
      };
      const sut = new WarehouseFetchSectionDataQueryService(client);

      const result = await sut.fetchSectionData(createPlan(reduction), {
        name: 'headline',
        revalidate: 86_400,
      });

      expect(result).toEqual({
        buckets: [{ period: '2026-09', values: [warehouseValue] }],
      });
    }
  );

  it('wraps a driver failure with its cause', async () => {
    const cause = new Error('driver failed');
    const client: WarehouseClient = {
      query: async () => Promise.reject(cause),
    };
    const sut = new WarehouseFetchSectionDataQueryService(client);

    const result = sut.fetchSectionData(createPlan('sum'), {
      name: 'headline',
      revalidate: 86_400,
    });

    await expect(result).rejects.toMatchObject({ cause });
  });

  it('does not wrap a mapping failure as a repository failure', async () => {
    const client: WarehouseClient = {
      query: async () => [{ period: '2026-09', value_0: 'not-a-number' }],
    };
    const sut = new WarehouseFetchSectionDataQueryService(client);

    const error = await sut
      .fetchSectionData(createPlan('sum'), {
        name: 'headline',
        revalidate: 86_400,
      })
      .catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(MappingError);
    expect(error).toMatchObject({ cause: undefined });
  });
});

describe('WarehouseFetchPeriodBoundsQueryService', () => {
  it('binds the dashboard time zone when timestamp data crosses a month boundary', async () => {
    const expectedRequest: WarehouseQueryRequest = {
      name: 'period-bounds',
      sql: [
        "SELECT FORMAT_DATE('%F', MIN(DATE(`recorded_at`, @time_zone))) AS first_date,",
        "FORMAT_DATE('%F', MAX(DATE(`recorded_at`, @time_zone))) AS last_date",
        'FROM `metrics.events`',
        'HAVING COUNT(*) > 0',
      ].join('\n'),
      params: { time_zone: 'Asia/Tokyo' },
      revalidate: 86_400,
    };
    const client: WarehouseClient = {
      query: async (request) =>
        request.sql === expectedRequest.sql &&
        request.params?.time_zone === 'Asia/Tokyo'
          ? [{ first_date: '2026-09-01', last_date: '2026-09-01' }]
          : [],
    };
    const sut = new WarehouseFetchPeriodBoundsQueryService(client);

    const result = await sut.fetchPeriodBounds(
      {
        dataset: 'metrics',
        view: 'events',
        time: { column: 'recorded_at', type: 'timestamp' },
      },
      'Asia/Tokyo',
      { name: 'period-bounds', revalidate: 86_400 }
    );

    expect(result).toEqual({
      firstDate: '2026-09-01',
      lastDate: '2026-09-01',
    });
  });

  it('returns null when the bounds aggregate yields zero rows for an empty source', async () => {
    const client: WarehouseClient = {
      query: async () => [],
    };
    const sut = new WarehouseFetchPeriodBoundsQueryService(client);

    const result = await sut.fetchPeriodBounds(
      {
        dataset: 'metrics',
        view: 'events',
        time: { column: 'recorded_at', type: 'timestamp' },
      },
      'UTC',
      { name: 'period-bounds', revalidate: 86_400 }
    );

    expect(result).toBeNull();
  });

  it('wraps a driver failure in RepositoryError with its cause', async () => {
    const cause = new Error('driver failed');
    const client: WarehouseClient = {
      query: async () => Promise.reject(cause),
    };
    const sut = new WarehouseFetchPeriodBoundsQueryService(client);

    const result = sut.fetchPeriodBounds(
      {
        dataset: 'metrics',
        view: 'events',
        time: { column: 'recorded_at', type: 'timestamp' },
      },
      'UTC',
      { name: 'period-bounds', revalidate: 86_400 }
    );

    await expect(result).rejects.toBeInstanceOf(RepositoryError);
    await expect(result).rejects.toMatchObject({ cause });
  });
});
