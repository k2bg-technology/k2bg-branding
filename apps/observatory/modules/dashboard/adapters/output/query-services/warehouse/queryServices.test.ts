import { describe, expect, it } from 'vitest';

import type {
  WarehouseClient,
  WarehouseQueryRequest,
} from '../../../../../../infrastructure/warehouse';
import type {
  ReadinessQueryPlan,
  SectionQueryPlan,
  TableQueryPlan,
} from '../../../../domain';
import { Period, planBarsSection } from '../../../../domain';
import sampleDashboard from '../../../../fixtures/sample-dashboard.json';
import { MappingError, RepositoryError } from '../../../shared';
import { dashboardDefinitionSchema } from '../../definition-sources/file-system/schemas';
import { WarehouseFetchGroupedValuesQueryService } from './fetchGroupedValuesQueryService';
import { WarehouseFetchPeriodBoundsQueryService } from './fetchPeriodBoundsQueryService';
import { WarehouseFetchSectionDataQueryService } from './fetchSectionDataQueryService';
import { WarehouseFetchSectionReadinessQueryService } from './fetchSectionReadinessQueryService';
import { WarehouseFetchTableRowsQueryService } from './fetchTableRowsQueryService';

function createPlan(
  reduction: SectionQueryPlan['measures'][number]['reduction']
) {
  return {
    kind: 'stat-tiles',
    sectionId: 'headline',
    grain: 'month',
    source: { dataset: 'metrics', view: 'events', time: 'recorded_on' },
    timeZone: 'UTC',
    selectedPeriod: '2026-09',
    dateRange: { firstDate: '2026-09-01', lastDate: '2026-09-30' },
    measures: [{ column: 'amount', reduction, compares: false }],
  } satisfies SectionQueryPlan;
}

describe('WarehouseFetchSectionReadinessQueryService', () => {
  const plan: ReadinessQueryPlan = {
    sectionId: 'headline',
    source: { dataset: 'metrics', view: 'daily', time: 'recorded_on' },
    timeZone: 'Asia/Tokyo',
    dateRange: { firstDate: '2026-08-15', lastDate: '2026-08-15' },
    column: 'is_complete',
  };
  const options = { name: 'readiness', revalidate: 86_400 };

  it('maps a ready result from the readiness query', async () => {
    const client: WarehouseClient = {
      query: async (request) =>
        request.sql.includes('COUNTIF(ready IS NOT TRUE)') &&
        request.params?.period_start === '2026-08-15'
          ? [{ not_ready_count: 0 }]
          : [],
    };
    const sut = new WarehouseFetchSectionReadinessQueryService(client);
    expect(await sut.fetchSectionReadiness(plan, options)).toBe(true);
  });

  it('wraps a driver failure with its cause', async () => {
    const cause = new Error('driver failed');
    const client: WarehouseClient = {
      query: async () => Promise.reject(cause),
    };
    const sut = new WarehouseFetchSectionReadinessQueryService(client);
    const result = sut.fetchSectionReadiness(plan, options);
    await expect(result).rejects.toBeInstanceOf(RepositoryError);
    await expect(result).rejects.toMatchObject({ cause });
  });

  it('keeps a mapping error unwrapped', async () => {
    const client: WarehouseClient = {
      query: async () => [{ not_ready_count: 'x' }],
    };
    const sut = new WarehouseFetchSectionReadinessQueryService(client);
    const error = await sut
      .fetchSectionReadiness(plan, options)
      .catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(MappingError);
    expect(error).toMatchObject({ cause: undefined });
  });
});

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
        truncated: false,
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

describe('WarehouseFetchTableRowsQueryService', () => {
  const plan: TableQueryPlan = {
    sectionId: 'detail',
    source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
    timeZone: 'UTC',
    dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
    columns: [{ column: 'description', type: 'text' }],
    sort: null,
    rows: { pageSize: 20, page: 7 },
  };

  it('returns the clamped page from the warehouse row', async () => {
    const client: WarehouseClient = {
      query: async ({ sql, params }) =>
        params?.page === 7 && params.page_size === 20 && sql.includes('LEAST(')
          ? [{ cell_0: 'Rent', page_number: 3, page_count: 3 }]
          : [],
    };
    const sut = new WarehouseFetchTableRowsQueryService(client);
    expect(
      await sut.fetchTableRows(plan, { name: 'detail', revalidate: 86_400 })
    ).toEqual({
      rows: [['Rent']],
      page: { number: 3, count: 3 },
    });
  });

  it('returns limit rows without page metadata', async () => {
    const client: WarehouseClient = {
      query: async ({ params }) =>
        params?.row_limit === 10 && !('page' in params)
          ? [{ cell_0: 'Rent' }]
          : [],
    };
    const sut = new WarehouseFetchTableRowsQueryService(client);
    expect(
      await sut.fetchTableRows(
        { ...plan, rows: { limit: 10 } },
        { name: 'topn', revalidate: 86_400 }
      )
    ).toEqual({
      rows: [['Rent']],
      page: null,
    });
  });

  it('wraps driver failure with cause', async () => {
    const cause = new Error('driver failed');
    const client: WarehouseClient = {
      query: async () => Promise.reject(cause),
    };
    const sut = new WarehouseFetchTableRowsQueryService(client);
    const result = sut.fetchTableRows(plan, {
      name: 'detail',
      revalidate: 86_400,
    });
    await expect(result).rejects.toBeInstanceOf(RepositoryError);
    await expect(result).rejects.toMatchObject({ cause });
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

describe('WarehouseFetchGroupedValuesQueryService', () => {
  const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
  const section = dashboard.sections.find(
    (candidate) => candidate.id === 'category-trend'
  );
  const period = Period.parse('month', '2026-08');
  if (section?.kind !== 'bars' || period === null)
    throw new Error('Expected bars fixture');
  const plan = planBarsSection(section, period, dashboard.timeZone);

  it('maps pivot rows from the grouped warehouse query', async () => {
    const client: WarehouseClient = {
      query: async ({ params, sql }) =>
        params?.bucket_limit === 121 &&
        params?.filter_0 === 'transfer' &&
        sql.includes('GROUP BY period, category')
          ? [{ period: '2026-08', category: 'food', value_0: 10 }]
          : [],
    };
    const sut = new WarehouseFetchGroupedValuesQueryService(client);

    expect(
      await sut.fetchGroupedValues(plan, { name: 'bars', revalidate: 86_400 })
    ).toEqual({
      grouping: 'period-category',
      truncated: false,
      buckets: [
        { period: '2026-08', cells: [{ category: 'food', values: [10] }] },
      ],
    });
  });

  it('wraps driver failure with its cause', async () => {
    const cause = new Error('driver failed');
    const sut = new WarehouseFetchGroupedValuesQueryService({
      query: async () => Promise.reject(cause),
    });

    await expect(
      sut.fetchGroupedValues(plan, { name: 'bars', revalidate: 86_400 })
    ).rejects.toMatchObject({ cause });
  });
});
