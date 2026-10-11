import { describe, expect, it } from 'vitest';

import { RepositoryError } from '../../../adapters/shared/errors';
import type {
  DashboardDefinition,
  DistinctControlDefinition,
  SourceDefinition,
} from '../../../domain';
import type { GroupedValues } from '../../shared';
import { ResolveControlOptions } from './useCase';

const bounds = { firstDate: '2026-01-01', lastDate: '2026-09-30' };
const navigationSource: SourceDefinition = {
  dataset: 'metrics',
  view: 'navigation_months',
  time: 'recorded_on',
};
const entriesSource: SourceDefinition = {
  dataset: 'metrics',
  view: 'entries',
  time: 'recorded_on',
};
const categoryControl: DistinctControlDefinition = {
  id: 'category',
  label: 'Category',
  column: 'category',
  options: 'distinct',
  source: entriesSource,
  order: 'value-desc',
  value: { column: 'amount', reduction: 'sum' },
};

function dashboard(
  controls: DashboardDefinition['controls'] = [categoryControl]
): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale: 'en-US',
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    periodSource: navigationSource,
    controls,
    sections: [
      {
        id: 'headline',
        title: 'Headline',
        kind: 'stat-tiles',
        source: { ...navigationSource, view: 'section_months' },
        tiles: [
          {
            label: 'Total',
            column: 'amount',
            reduction: 'sum',
            format: { type: 'number' },
          },
        ],
      },
    ],
  };
}

describe('ResolveControlOptions', () => {
  it('orders summed values and drops null and empty categories', async () => {
    const data: GroupedValues = {
      grouping: 'category',
      groups: [
        { category: 'rent', values: [500] },
        { category: null, values: [900] },
        { category: 'food', values: [1200] },
        { category: '', values: [50] },
        { category: 'drink', values: [null] },
      ],
    };
    const sut = new ResolveControlOptions(
      {
        fetchPeriodBounds: async (source, timeZone, options) =>
          source.view === 'navigation_months' &&
          timeZone === 'UTC' &&
          options.name === 'dashboard-summary-period-bounds' &&
          options.revalidate === 86_400
            ? bounds
            : null,
      },
      {
        fetchGroupedValues: async (plan, options) =>
          plan.source.view === 'entries' &&
          plan.dateRange.firstDate === '2026-01-01' &&
          plan.dateRange.lastDate === '2026-09-30' &&
          plan.buckets === null &&
          plan.category?.column === 'category' &&
          plan.category.sortKey === null &&
          JSON.stringify(plan.measures) ===
            JSON.stringify([{ column: 'amount', reduction: 'sum' }]) &&
          options.name === 'dashboard-summary-control-category-options' &&
          options.revalidate === 86_400
            ? data
            : null,
      }
    );

    expect(await sut.execute({ dashboard: dashboard() })).toEqual({
      category: {
        status: 'ready',
        options: ['food', 'rent', 'drink'],
        truncated: false,
      },
    });
  });

  it('orders categories by a sort key without measures', async () => {
    const weekday: DistinctControlDefinition = {
      id: 'weekday',
      label: 'Weekday',
      column: 'weekday_name',
      options: 'distinct',
      order: { sortKey: { column: 'weekday_number', type: 'number' } },
    };
    const sut = new ResolveControlOptions(
      { fetchPeriodBounds: async () => bounds },
      {
        fetchGroupedValues: async (plan) =>
          plan.measures.length === 0 &&
          plan.category?.sortKey?.column === 'weekday_number' &&
          plan.category.sortKey.type === 'number'
            ? {
                grouping: 'category',
                groups: [
                  { category: 'Tue', values: [], sortKey: 2 },
                  { category: 'Mon', values: [], sortKey: 1 },
                ],
              }
            : null,
      }
    );

    expect(await sut.execute({ dashboard: dashboard([weekday]) })).toEqual({
      weekday: { status: 'ready', options: ['Mon', 'Tue'], truncated: false },
    });
  });

  it.each([
    { periodSource: navigationSource, expectedView: 'navigation_months' },
    { periodSource: undefined, expectedView: 'section_months' },
  ])(
    'defaults an omitted source to $expectedView',
    async ({ periodSource, expectedView }) => {
      const definition = {
        ...dashboard([{ ...categoryControl, source: undefined }]),
        periodSource,
      };
      const sut = new ResolveControlOptions(
        {
          fetchPeriodBounds: async (source) =>
            source.view === expectedView ? bounds : null,
        },
        {
          fetchGroupedValues: async (plan) =>
            plan.source.view === expectedView
              ? {
                  grouping: 'category',
                  groups: [{ category: 'food', values: [3] }],
                }
              : null,
        }
      );

      expect(await sut.execute({ dashboard: definition })).toEqual({
        category: { status: 'ready', options: ['food'], truncated: false },
      });
    }
  );

  it('returns an empty list when the period source has no bounds', async () => {
    const sut = new ResolveControlOptions(
      { fetchPeriodBounds: async () => null },
      {
        fetchGroupedValues: async () => ({
          grouping: 'category',
          groups: [{ category: 'food', values: [3] }],
        }),
      }
    );

    expect(await sut.execute({ dashboard: dashboard() })).toEqual({
      category: { status: 'ready', options: [], truncated: false },
    });
  });

  it('limits the ordered list to 100 values', async () => {
    const sut = new ResolveControlOptions(
      { fetchPeriodBounds: async () => bounds },
      {
        fetchGroupedValues: async () => ({
          grouping: 'category',
          groups: Array.from({ length: 101 }, (_, index) => ({
            category: `c${String(index).padStart(3, '0')}`,
            values: [101 - index],
          })),
        }),
      }
    );

    const result = await sut.execute({ dashboard: dashboard() });

    expect(result.category.status).toBe('ready');
    if (result.category.status !== 'ready')
      throw new Error('Expected ready options');
    expect(result.category.options).toHaveLength(100);
    expect(result.category.options[0]).toBe('c000');
    expect(result.category.options[99]).toBe('c099');
    expect(result.category.options).not.toContain('c100');
    expect(result.category.truncated).toBe(true);
  });

  it('keeps another control ready when one grouped read fails', async () => {
    const error = new RepositoryError('query failed');
    const broken: DistinctControlDefinition = {
      ...categoryControl,
      id: 'broken',
      column: 'broken',
    };
    const sut = new ResolveControlOptions(
      { fetchPeriodBounds: async () => bounds },
      {
        fetchGroupedValues: async (plan) => {
          if (plan.category?.column === 'broken') throw error;
          return {
            grouping: 'category',
            groups: [{ category: 'food', values: [3] }],
          };
        },
      }
    );

    const result = await sut.execute({
      dashboard: dashboard([categoryControl, broken]),
    });

    expect(result.category).toEqual({
      status: 'ready',
      options: ['food'],
      truncated: false,
    });
    expect(result.broken).toEqual({ status: 'unavailable', error });
    if (result.broken.status === 'unavailable')
      expect(result.broken.error).toBe(error);
  });

  it('marks every distinct control unavailable when bounds fail', async () => {
    const error = new RepositoryError('bounds failed');
    const sut = new ResolveControlOptions(
      {
        fetchPeriodBounds: async () => {
          throw error;
        },
      },
      { fetchGroupedValues: async () => null }
    );

    expect(
      await sut.execute({
        dashboard: dashboard([
          categoryControl,
          { ...categoryControl, id: 'other' },
        ]),
      })
    ).toEqual({
      category: { status: 'unavailable', error },
      other: { status: 'unavailable', error },
    });
  });

  it('does not read bounds for fixed-list-only dashboards', async () => {
    const sut = new ResolveControlOptions(
      {
        fetchPeriodBounds: async () => {
          throw new Error('must not run');
        },
      },
      {
        fetchGroupedValues: async () => {
          throw new Error('must not run');
        },
      }
    );

    expect(
      await sut.execute({
        dashboard: dashboard([
          {
            id: 'category',
            label: 'Category',
            column: 'category',
            options: ['food'],
          },
        ]),
      })
    ).toEqual({});
  });
});
