import { describe, expect, it, vi } from 'vitest';

vi.mock('../../modules/dashboard/adapters/shared', () => ({
  dashboardLogger: { error: vi.fn(), warn: vi.fn() },
}));

import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import type { DashboardDefinition } from '../../modules/dashboard/domain';
import { loadControlOptions } from './loadControlOptions';

const dashboard: DashboardDefinition = {
  id: 'summary',
  title: 'Summary',
  grain: 'month',
  timeZone: 'UTC',
  locale: 'en-US',
  revalidate: 86_400,
  defaultPeriod: 'latest-with-data',
  controls: [
    {
      id: 'region',
      label: 'Region',
      column: 'region',
      options: 'distinct',
      order: { sortKey: { column: 'region', type: 'text' } },
    },
  ],
  sections: [],
};

describe('loadControlOptions', () => {
  it('returns no options without calling a resolver for fixed lists', async () => {
    const result = await loadControlOptions({
      dashboard: {
        ...dashboard,
        controls: [
          {
            id: 'region',
            label: 'Region',
            column: 'region',
            options: ['east'],
          },
        ],
      },
      resolveControlOptions: async () => {
        throw new Error('must not run');
      },
    });

    expect(result).toEqual({});
  });

  it('passes ready outcomes through', async () => {
    const outcomes = {
      region: { status: 'ready' as const, options: ['east'], truncated: false },
    };

    const result = await loadControlOptions({
      dashboard,
      resolveControlOptions: async () => outcomes,
    });

    expect(result).toEqual(outcomes);
  });

  it('logs an unavailable control at error level', async () => {
    vi.clearAllMocks();
    const error = new Error('query failed');

    await loadControlOptions({
      dashboard,
      resolveControlOptions: async () => ({
        region: { status: 'unavailable', error },
      }),
    });

    expect(dashboardLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        err: error,
        dashboardId: 'summary',
        controlId: 'region',
      }),
      'Failed to resolve control options'
    );
  });

  it('logs truncation with the fixed limit', async () => {
    vi.clearAllMocks();

    await loadControlOptions({
      dashboard,
      resolveControlOptions: async () => ({
        region: { status: 'ready', options: ['east'], truncated: true },
      }),
    });

    expect(dashboardLogger.warn).toHaveBeenCalledWith(
      { dashboardId: 'summary', controlId: 'region', limit: 100 },
      'Control options were truncated'
    );
  });

  it('degrades every distinct control when the resolver throws', async () => {
    vi.clearAllMocks();
    const error = new Error('configuration failed');

    const result = await loadControlOptions({
      dashboard,
      resolveControlOptions: async () => {
        throw error;
      },
    });

    expect(result).toEqual({ region: { status: 'unavailable' } });
    expect(dashboardLogger.error).toHaveBeenCalledTimes(1);
    expect(dashboardLogger.error).toHaveBeenCalledWith(
      { err: error, dashboardId: 'summary' },
      'Failed to resolve control options'
    );
  });
});
