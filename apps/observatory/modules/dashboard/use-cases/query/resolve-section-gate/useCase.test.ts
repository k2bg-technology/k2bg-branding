import { describe, expect, it, vi } from 'vitest';

import type {
  DashboardDefinition,
  Section,
  SourceDefinition,
} from '../../../domain';
import { Period } from '../../../domain';
import { ResolveSectionGate } from './useCase';

function dashboard(section: Section): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'Asia/Tokyo',
    locale: 'en-US',
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    sections: [section],
  };
}

function tiles(): Section {
  return {
    id: 'headline',
    title: 'Headline',
    kind: 'stat-tiles',
    source: { dataset: 'metrics', view: 'readings', time: 'recorded_on' },
    tiles: [
      {
        label: 'Value',
        column: 'value',
        reduction: 'sum',
        format: { type: 'number' },
      },
    ],
  };
}

function sutWithBounds(lastDate = '2026-08-15') {
  return new ResolveSectionGate(
    {
      fetchPeriodBounds: async (source) =>
        source.view === 'readings'
          ? { firstDate: '2026-01-01', lastDate }
          : null,
    },
    { fetchSectionReadiness: async () => true }
  );
}

function month(value: string) {
  const period = Period.parse('month', value);
  if (period === null) throw new Error('Expected fixture period');
  return period;
}

describe('ResolveSectionGate', () => {
  it('opens a following section at the selected period', async () => {
    const section = tiles();
    const sut = sutWithBounds();
    const result = await sut.execute({
      dashboard: dashboard(section),
      section,
      selectedPeriod: month('2026-05'),
      selections: {},
    });
    expect(result.status).toBe('open');
    if (result.status === 'open')
      expect(result.period.toString()).toBe('2026-05');
  });

  it('returns empty without a selected period', async () => {
    const section = tiles();
    const sut = sutWithBounds();
    expect(
      await sut.execute({
        dashboard: dashboard(section),
        section,
        selectedPeriod: null,
        selections: {},
      })
    ).toEqual({ status: 'empty' });
  });

  it('accumulates a following month without either query, even when readiness would fail', async () => {
    const section = {
      ...tiles(),
      availability: {
        since: '2026-03-15',
        minimumBuckets: 3,
        note: 'Three months are needed',
      },
      readiness: { column: 'is_complete' },
    };
    const fetchPeriodBounds = vi.fn(async () => null);
    const fetchSectionReadiness = vi.fn(async () => false);
    const sut = new ResolveSectionGate(
      { fetchPeriodBounds },
      { fetchSectionReadiness }
    );
    expect(
      await sut.execute({
        dashboard: dashboard(section),
        section,
        selectedPeriod: month('2026-05'),
        selections: {},
      })
    ).toEqual({
      status: 'accumulating',
      since: '2026-03-15',
      availableFrom: { grain: 'month', start: { date: '2026-06-01', hour: 0 } },
      note: 'Three months are needed',
    });
    expect(fetchPeriodBounds).not.toHaveBeenCalled();
    expect(fetchSectionReadiness).not.toHaveBeenCalled();
  });

  it('opens at the target month', async () => {
    const section = {
      ...tiles(),
      availability: { since: '2026-03-15', minimumBuckets: 3 },
    };
    const sut = sutWithBounds();
    const result = await sut.execute({
      dashboard: dashboard(section),
      section,
      selectedPeriod: month('2026-06'),
      selections: {},
    });
    expect(result.status === 'open' && result.period.toString()).toBe(
      '2026-06'
    );
  });

  it.each([
    {
      selected: '2026-07',
      expected: {
        status: 'accumulating',
        since: '2026-08-15',
        availableFrom: { grain: 'day', start: { date: '2026-08-22', hour: 0 } },
        note: undefined,
      },
    },
    { selected: '2026-08', expected: { status: 'open' } },
  ])(
    'uses section day grain for a $selected selection',
    async ({ selected, expected }) => {
      const section: Section = {
        id: 'trend',
        title: 'Trend',
        kind: 'time-series',
        grain: 'day',
        source: { dataset: 'metrics', view: 'readings', time: 'recorded_on' },
        availability: { since: '2026-08-15', minimumBuckets: 7 },
        variant: 'line',
        stacked: false,
        format: { type: 'number' },
        series: [{ label: 'Value', column: 'value', reduction: 'average' }],
      };
      const sut = sutWithBounds();
      const result = await sut.execute({
        dashboard: dashboard(section),
        section,
        selectedPeriod: month(selected),
        selections: {},
      });
      expect(result).toMatchObject(expected);
    }
  );

  it.each([month('2026-03'), null])(
    'ignores selected period %s for a latest section',
    async (selectedPeriod) => {
      const section = { ...tiles(), period: 'latest' as const };
      const sut = sutWithBounds();
      const result = await sut.execute({
        dashboard: dashboard(section),
        section,
        selectedPeriod,
        selections: {},
      });
      expect(result.status === 'open' && result.period.toString()).toBe(
        '2026-08-15'
      );
    }
  );

  it('returns empty when a latest source has no rows', async () => {
    const section = {
      ...tiles(),
      period: 'latest' as const,
      source: { dataset: 'metrics', view: 'empty', time: 'recorded_on' },
    };
    const sut = sutWithBounds();
    expect(
      await sut.execute({
        dashboard: dashboard(section),
        section,
        selectedPeriod: month('2026-03'),
        selections: {},
      })
    ).toEqual({ status: 'empty' });
  });

  it.each([
    {
      latestDate: '2026-08-15',
      expected: {
        status: 'accumulating',
        since: '2026-08-10',
        availableFrom: { grain: 'day', start: { date: '2026-08-17', hour: 0 } },
        note: undefined,
      },
    },
    { latestDate: '2026-08-17', expected: { status: 'open' } },
  ])(
    'judges latest tile availability at $latestDate',
    async ({ latestDate, expected }) => {
      const section = {
        ...tiles(),
        period: 'latest' as const,
        availability: { since: '2026-08-10', minimumBuckets: 7 },
      };
      const sut = sutWithBounds(latestDate);
      expect(
        await sut.execute({
          dashboard: dashboard(section),
          section,
          selectedPeriod: null,
          selections: {},
        })
      ).toMatchObject(expected);
    }
  );

  it('counts hours for a latest time series', async () => {
    const section: Section = {
      id: 'trend',
      title: 'Trend',
      kind: 'time-series',
      period: 'latest',
      grain: 'hour',
      source: {
        dataset: 'metrics',
        view: 'readings',
        time: { date: 'reading_date', hour: 'reading_hour' },
      },
      availability: { since: '2026-08-15', minimumBuckets: 30 },
      variant: 'line',
      stacked: false,
      format: { type: 'number' },
      series: [{ label: 'Value', column: 'value', reduction: 'average' }],
    };
    const sut = sutWithBounds();
    expect(
      await sut.execute({
        dashboard: dashboard(section),
        section,
        selectedPeriod: null,
        selections: {},
      })
    ).toMatchObject({
      status: 'accumulating',
      availableFrom: { grain: 'hour', start: { date: '2026-08-16', hour: 6 } },
    });
  });

  it.each([
    { selected: '2026-08', status: 'not-ready' },
    { selected: '2026-07', status: 'open' },
  ])(
    'judges readiness over the $selected read period',
    async ({ selected, status }) => {
      const section = {
        ...tiles(),
        readiness: {
          column: 'is_complete',
          note: 'Waiting for the monthly close',
        },
      };
      const sut = new ResolveSectionGate(
        { fetchPeriodBounds: async () => null },
        {
          fetchSectionReadiness: async (plan) =>
            !(
              plan.column === 'is_complete' &&
              plan.dateRange.firstDate === '2026-08-01' &&
              plan.dateRange.lastDate === '2026-08-31'
            ),
        }
      );
      const result = await sut.execute({
        dashboard: dashboard(section),
        section,
        selectedPeriod: month(selected),
        selections: {},
      });
      expect(result.status).toBe(status);
      if (status === 'not-ready')
        expect(result).toEqual({
          status: 'not-ready',
          note: 'Waiting for the monthly close',
        });
    }
  );

  it('judges a latest section over its single date', async () => {
    const section = {
      ...tiles(),
      period: 'latest' as const,
      readiness: { column: 'is_complete' },
    };
    const sut = new ResolveSectionGate(
      {
        fetchPeriodBounds: async () => ({
          firstDate: '2026-01-01',
          lastDate: '2026-08-15',
        }),
      },
      {
        fetchSectionReadiness: async (plan) =>
          !(
            plan.dateRange.firstDate === '2026-08-15' &&
            plan.dateRange.lastDate === '2026-08-15'
          ),
      }
    );
    expect(
      await sut.execute({
        dashboard: dashboard(section),
        section,
        selectedPeriod: null,
        selections: {},
      })
    ).toEqual({ status: 'not-ready', note: undefined });
  });

  it('reads the latest date and readiness of a controlled section from the selected slice', async () => {
    const section = {
      ...tiles(),
      period: 'latest' as const,
      readiness: { column: 'is_complete' },
      controls: ['category'],
    };
    const definition = {
      ...dashboard(section),
      controls: [
        {
          id: 'category',
          label: 'Category',
          column: 'category',
          options: ['food', 'rent'],
        },
      ],
    };
    const selectsFood = (source: SourceDefinition) =>
      source.filters?.some(
        (filter) =>
          filter.column === 'category' &&
          filter.operator === 'equals' &&
          filter.value === 'food'
      ) ?? false;
    const sut = new ResolveSectionGate(
      {
        fetchPeriodBounds: async (source) => ({
          firstDate: '2026-01-01',
          lastDate: selectsFood(source) ? '2026-08-10' : '2026-08-15',
        }),
      },
      { fetchSectionReadiness: async (plan) => selectsFood(plan.source) }
    );

    const result = await sut.execute({
      dashboard: definition,
      section,
      selectedPeriod: null,
      selections: { category: 'food' },
    });

    expect(result).toMatchObject({ status: 'open' });
    expect(result.status === 'open' && result.period.lastDate).toBe(
      '2026-08-10'
    );
  });
});
