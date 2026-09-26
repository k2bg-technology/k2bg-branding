import { describe, expect, it } from 'vitest';

import type { DashboardDefinition, SourceDefinition } from '../../../domain';
import { Period } from '../../../domain';
import { ResolveDashboardPeriod } from './useCase';

function dashboard(): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale: 'en-US',
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    sections: [
      {
        id: 'headline',
        title: 'Headline',
        kind: 'stat-tiles',
        source: {
          dataset: 'metrics',
          view: 'section_months',
          time: 'recorded_on',
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

function createSut(
  expectedView: string,
  bounds: { firstDate: string; lastDate: string } | null
) {
  return new ResolveDashboardPeriod(
    {
      fetchPeriodBounds: async (source: SourceDefinition) =>
        source.view === expectedView ? bounds : null,
    },
    { now: () => Date.parse('2026-10-15T00:00:00Z') }
  );
}

describe('ResolveDashboardPeriod', () => {
  it('uses periodSource when declared', async () => {
    const definition = dashboard();
    definition.periodSource = {
      dataset: 'metrics',
      view: 'navigation_months',
      time: 'recorded_on',
    };
    const sut = createSut('navigation_months', {
      firstDate: '2026-08-01',
      lastDate: '2026-09-30',
    });

    const result = await sut.execute({
      dashboard: definition,
      requestedPeriod: null,
    });

    expect(result?.period.toString()).toBe('2026-09');
    expect(result?.previousTarget?.toString()).toBe('2026-08');
  });

  it.each([
    { defaultPeriod: 'latest-with-data', expected: '2026-10' },
    { defaultPeriod: 'last-complete', expected: '2026-09' },
  ] as const)(
    'selects $expected for the $defaultPeriod default period',
    async ({ defaultPeriod, expected }) => {
      const definition = dashboard();
      definition.defaultPeriod = defaultPeriod;
      const sut = createSut('section_months', {
        firstDate: '2026-08-01',
        lastDate: '2026-10-10',
      });

      const result = await sut.execute({
        dashboard: definition,
        requestedPeriod: null,
      });

      expect(result?.period.toString()).toBe(expected);
    }
  );

  it('finds the last complete month in the dashboard time zone', async () => {
    const definition = dashboard();
    definition.defaultPeriod = 'last-complete';
    definition.timeZone = 'Asia/Tokyo';
    const sut = new ResolveDashboardPeriod(
      {
        fetchPeriodBounds: async () => ({
          firstDate: '2026-07-01',
          lastDate: '2026-10-01',
        }),
      },
      { now: () => Date.parse('2026-09-30T20:00:00Z') }
    );

    const result = await sut.execute({
      dashboard: definition,
      requestedPeriod: null,
    });

    expect(result?.period.toString()).toBe('2026-09');
  });

  it('reads bounds from the first section when periodSource is absent', async () => {
    const definition = dashboard();
    definition.sections.push({
      ...definition.sections[0],
      id: 'detail',
      source: {
        dataset: 'metrics',
        view: 'detail_months',
        time: 'recorded_on',
      },
    });
    const bounds = { firstDate: '2026-07-01', lastDate: '2026-08-31' };
    const sut = createSut('section_months', bounds);

    const result = await sut.execute({
      dashboard: definition,
      requestedPeriod: null,
    });

    expect(result?.period.toString()).toBe('2026-08');
    expect(result?.bounds).toEqual(bounds);
  });

  it('keeps the requested period even outside the bounds', async () => {
    const requestedPeriod = Period.parse('2026-06');
    if (requestedPeriod === null) {
      throw new Error('Expected fixture period to parse');
    }
    const sut = createSut('section_months', {
      firstDate: '2026-08-01',
      lastDate: '2026-09-30',
    });

    const result = await sut.execute({
      dashboard: dashboard(),
      requestedPeriod,
    });

    expect(result?.period.toString()).toBe('2026-06');
    expect(result?.nextTarget?.toString()).toBe('2026-08');
  });

  it('reads bounds in the dashboard time zone and revalidation window', async () => {
    const definition = dashboard();
    definition.timeZone = 'Asia/Tokyo';
    definition.revalidate = 3_600;
    const sut = new ResolveDashboardPeriod(
      {
        fetchPeriodBounds: async (_source, timeZone, options) =>
          timeZone === 'Asia/Tokyo' && options.revalidate === 3_600
            ? { firstDate: '2026-08-01', lastDate: '2026-09-30' }
            : null,
      },
      { now: () => Date.parse('2026-10-15T00:00:00Z') }
    );

    const result = await sut.execute({
      dashboard: definition,
      requestedPeriod: null,
    });

    expect(result?.period.toString()).toBe('2026-09');
  });

  it('returns null for an empty source without a requested period', async () => {
    const sut = createSut('section_months', null);

    expect(
      await sut.execute({ dashboard: dashboard(), requestedPeriod: null })
    ).toBeNull();
  });

  it('keeps a requested period for an empty source and disables navigation', async () => {
    const requestedPeriod = Period.parse('2026-08');
    if (requestedPeriod === null) {
      throw new Error('Expected fixture period to parse');
    }
    const sut = createSut('section_months', null);

    const result = await sut.execute({
      dashboard: dashboard(),
      requestedPeriod,
    });

    expect(result).toEqual({
      period: requestedPeriod,
      bounds: null,
      previousTarget: null,
      nextTarget: null,
    });
  });
});
