import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../modules/dashboard/adapters/shared', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('../../modules/dashboard/adapters/shared')
  >()),
  dashboardLogger: { error: vi.fn(), warn: vi.fn() },
}));

import { dashboardDefinitionSchema } from '../../modules/dashboard/adapters/output/definition-sources/file-system/schemas';
import { toSectionData } from '../../modules/dashboard/adapters/output/query-services/warehouse/mapper';
import { dashboardLogger } from '../../modules/dashboard/adapters/shared';
import type {
  DashboardDefinition,
  UrlState,
} from '../../modules/dashboard/domain';
import {
  AmbiguousLatestValueError,
  Period,
  planSection,
} from '../../modules/dashboard/domain';
import sampleDashboard from '../../modules/dashboard/fixtures/sample-dashboard.json';
import type {
  DashboardPeriodResolution,
  MatrixData,
  PivotBuckets,
  SectionData,
} from '../../modules/dashboard/use-cases';
import { DashboardSection } from './DashboardSection';

const openGate = async ({
  selectedPeriod,
}: {
  selectedPeriod: Period | null;
}) =>
  selectedPeriod === null
    ? { status: 'empty' as const }
    : { status: 'open' as const, period: selectedPeriod };

function dashboard(locale = 'en-US'): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale,
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    periodSource: { dataset: 'metrics', view: 'bounds', time: 'recorded_on' },
    sections: [
      {
        id: 'headline',
        title: 'Headline',
        kind: 'stat-tiles',
        source: { dataset: 'metrics', view: 'values', time: 'recorded_on' },
        tiles: [
          {
            label: 'Total',
            column: 'total',
            reduction: 'sum',
            format: { type: 'number' },
            comparison: { direction: 'higher-is-better' },
          },
          {
            label: 'Latest',
            column: 'latest',
            reduction: 'latest',
            format: { type: 'number' },
          },
        ],
      },
    ],
  };
}

function timeSeriesDashboard(locale = 'en-US'): DashboardDefinition {
  const definition = dashboard(locale);
  definition.sections = [
    {
      id: 'trend',
      title: 'Monthly trend',
      kind: 'time-series',
      source: { dataset: 'metrics', view: 'values', time: 'recorded_on' },
      window: 3,
      variant: 'line',
      stacked: false,
      format: { type: 'number' },
      series: [{ label: 'Average', column: 'value', reduction: 'average' }],
    },
  ];
  return definition;
}

function calendarDashboard(): DashboardDefinition {
  const definition = dashboard();
  definition.sections = [
    {
      id: 'daily-values',
      title: 'Daily values',
      kind: 'calendar-heatmap',
      source: { dataset: 'metrics', view: 'values', time: 'recorded_on' },
      range: 'trailing',
      window: 7,
      value: { column: 'value', reduction: 'sum' },
      format: { type: 'number' },
    },
  ];
  return definition;
}

function resolution(month: string): DashboardPeriodResolution {
  const period = Period.parse('month', month);
  if (period === null) {
    throw new Error('Expected fixture period to parse');
  }
  return {
    period,
    bounds: { firstDate: '2026-08-01', lastDate: '2026-09-30' },
    previousTarget: null,
    nextTarget: null,
  };
}

function data(): SectionData {
  return {
    truncated: false,
    buckets: [
      { period: '2026-07', values: [100, null] },
      { period: '2026-08', values: [120, 9] },
    ],
  };
}

const urlState: UrlState = {
  period: null,
  controls: {},
  pages: {},
  foreign: [],
};

describe('DashboardSection', () => {
  it('shows empty for a calendar heatmap with no rows', async () => {
    const definition = calendarDashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: async () => ({
          status: 'open',
          period: resolution('2026-08').period,
        }),
        fetchSectionData: async () => null,
      })
    );

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('shows unavailable when the calendar heatmap query fails', async () => {
    const definition = calendarDashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: async () => ({
          status: 'open',
          period: resolution('2026-08').period,
        }),
        fetchSectionData: async () => Promise.reject(new Error('query failed')),
      })
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('names a time-series chart, fills missing months as gaps, and states its window', async () => {
    const definition = timeSeriesDashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-03')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => ({
          truncated: false,
          buckets: [
            { period: '2026-01', values: [15] },
            { period: '2026-03', values: [30] },
          ],
        }),
      })
    );

    expect(
      screen.getByRole('application', { name: 'Monthly trend' })
    ).toBeInTheDocument();
    expect(screen.getByText('Jan – Mar 2026')).toBeInTheDocument();
    expect(
      screen.queryByText(/Older months are not shown/)
    ).not.toBeInTheDocument();
  });

  it('states the full twelve-month window across a year boundary', async () => {
    const definition = timeSeriesDashboard();
    const section = definition.sections[0];
    if (section.kind !== 'time-series') {
      throw new Error('Expected a time-series section');
    }
    section.window = 12;

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section,
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => ({
          truncated: false,
          buckets: [{ period: '2026-08', values: [30] }],
        }),
      })
    );

    expect(screen.getByText('Sep 2025 – Aug 2026')).toBeInTheDocument();
  });

  it('keeps a time series ready with no bucket in the selected month and moves its window with the period', async () => {
    const definition = timeSeriesDashboard();
    const fetchSectionData = async ({ period }: { period: Period }) => ({
      truncated: false,
      buckets: [{ period: period.shift(-1).toString(), values: [15] }],
    });

    const first = render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-03')),
        resolveSectionGate: openGate,
        fetchSectionData,
      })
    );
    expect(screen.getByText('Jan – Mar 2026')).toBeInTheDocument();
    expect(screen.queryByText('No data available.')).not.toBeInTheDocument();

    first.unmount();
    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-04')),
        resolveSectionGate: openGate,
        fetchSectionData,
      })
    );
    expect(screen.getByText('Feb – Apr 2026')).toBeInTheDocument();
  });

  it('shows the shortened range and a localized truncation label', async () => {
    const definition = timeSeriesDashboard('ja-JP');
    definition.labels = { truncated: '古い月を省略' };

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-03')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => ({
          truncated: true,
          buckets: [
            { period: '2026-02', values: [20] },
            { period: '2026-03', values: [30] },
          ],
        }),
      })
    );

    expect(
      screen.getByText('2026/02～2026/03 · 古い月を省略')
    ).toBeInTheDocument();
  });

  it('shows empty for a time series with no buckets', async () => {
    const definition = timeSeriesDashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-03')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => null,
      })
    );

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });
  it('shows an own-source previous-month delta even when period bounds start later', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => data(),
      })
    );

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('keeps a mixed section ready when only a non-comparing previous value is ambiguous', async () => {
    const definition = dashboard();
    const selected = resolution('2026-08');
    const section = definition.sections[0];
    if (section.kind !== 'stat-tiles') {
      throw new Error('Expected stat-tiles fixture');
    }
    const mapped = toSectionData(
      [
        { period: '2026-07', value_0: 100, value_1: 7, distinct_count_1: 2 },
        { period: '2026-08', value_0: 120, value_1: 9, distinct_count_1: 1 },
      ],
      planSection(section, selected.period, definition.timeZone)
    );

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(selected),
        resolveSectionGate: openGate,
        fetchSectionData: async () => mapped,
      })
    );

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('queries and shows an outside-bounds month when its section has a bucket', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-07')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => data(),
      })
    );

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('uses locale for the delta text', async () => {
    const definition = dashboard('de-DE');

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => data(),
      })
    );

    expect(screen.getByText(/\+20\s%/)).toBeInTheDocument();
  });

  it('shows empty when the selected month has no bucket', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-09')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => data(),
      })
    );

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('shows empty without reading the section when there is no default period', async () => {
    const definition = dashboard();
    const fetchSectionData = vi.fn(async () => data());

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(null),
        resolveSectionGate: openGate,
        fetchSectionData,
      })
    );

    expect(screen.getByText('No data available.')).toBeInTheDocument();
    expect(fetchSectionData).not.toHaveBeenCalled();
  });

  it('shows empty when the section has no rows', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => null,
      })
    );

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('shows no delta when the previous month has no bucket', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => ({
          truncated: false,
          buckets: [{ period: '2026-08', values: [120, 9] }],
        }),
      })
    );

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.queryByText(/^[+-]/)).not.toBeInTheDocument();
  });

  it('shows unavailable when period resolution rejects', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.reject(new Error('warehouse failed')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => data(),
      })
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This section could not be loaded.'
    );
  });

  it('shows unavailable when a selected-month latest value is ambiguous', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () =>
          Promise.reject(new AmbiguousLatestValueError('headline', 'latest')),
      })
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows an em dash for a null selected value', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => ({
          truncated: false,
          buckets: [{ period: '2026-08', values: [null, 9] }],
        }),
      })
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('+0%')).not.toBeInTheDocument();
  });

  it('formats an absolute signed delta when the prior value is zero', async () => {
    const definition = dashboard();

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section: definition.sections[0],
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => ({
          truncated: false,
          buckets: [
            { period: '2026-07', values: [0, null] },
            { period: '2026-08', values: [5, 9] },
          ],
        }),
      })
    );

    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it('formats a duration tile delta as an absolute change when the prior value is zero', async () => {
    const definition = dashboard();
    const section = definition.sections[0];
    if (section.kind !== 'stat-tiles') {
      throw new Error('Expected a stat-tiles section');
    }
    section.tiles[0].format = { type: 'duration', inputUnit: 'seconds' };

    render(
      await DashboardSection({
        urlState,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        dashboard: definition,
        section,
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => ({
          truncated: false,
          buckets: [
            { period: '2026-07', values: [0, null] },
            { period: '2026-08', values: [-600, 9] },
          ],
        }),
      })
    );

    expect(screen.getAllByText('-10 min')).toHaveLength(2);
  });
});

describe('composition sections', () => {
  const compositionDashboard = (
    kind: 'donut' | 'treemap'
  ): DashboardDefinition => {
    const definition = dashboard();
    definition.labels = {
      negativeComposition: 'Parts below zero cannot be drawn',
    };
    const fields = {
      id: 'composition',
      title: 'Composition',
      source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
      category: 'category',
      categoryLabel: 'Category',
      value: { label: 'Amount', column: 'amount', reduction: 'sum' as const },
      format: { type: 'number' as const },
    };
    definition.sections =
      kind === 'donut'
        ? [{ ...fields, kind, order: 'value-desc' }]
        : [{ ...fields, kind }];
    return definition;
  };
  const show = async (
    definition: DashboardDefinition,
    fetchCompositionData: NonNullable<
      Parameters<typeof DashboardSection>[0]['fetchCompositionData']
    >
  ) => {
    const view = await DashboardSection({
      dashboard: definition,
      section: definition.sections[0],
      urlState,
      periodResolution: Promise.resolve(resolution('2026-08')),
      resolveSectionGate: openGate,
      fetchSectionData: async () => null,
      fetchTableRows: async () => null,
      fetchBarsData: async () => null,
      fetchCompositionData,
      fetchMatrixData: async () => null,
      fetchTimeSeriesPivot: async () => null,
      fetchPivotData: async () => null,
      fetchScatterData: async () => null,
    });
    return render(view);
  };

  it.each(['donut', 'treemap'] as const)(
    'shows the explanation instead of a %s chart when a part is negative',
    async (kind) => {
      const definition = compositionDashboard(kind);

      await show(definition, async () => ({
        parts: [
          { category: 'Rent', value: 300 },
          { category: 'Refund', value: -20 },
        ],
        center: null,
      }));

      expect(
        screen.getByText('Parts below zero cannot be drawn')
      ).toBeInTheDocument();
      expect(screen.queryByRole('application')).toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
    }
  );

  it.each(['donut', 'treemap'] as const)(
    'shows empty for a %s whose parts are all zero',
    async (kind) => {
      await show(compositionDashboard(kind), async () => ({
        parts: [
          { category: 'Rent', value: 0 },
          { category: 'Food', value: null },
        ],
        center: null,
      }));

      expect(screen.getByText('No data available.')).toBeInTheDocument();
    }
  );

  it('shows empty for a donut with no rows', async () => {
    await show(compositionDashboard('donut'), async () => null);

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('shows unavailable when a composition query fails', async () => {
    await show(compositionDashboard('donut'), async () => {
      throw new Error('Warehouse unavailable');
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows unavailable when a category is labelled like the remainder', async () => {
    const definition = compositionDashboard('donut');
    const section = definition.sections[0];
    if (section.kind !== 'donut') throw new Error('Expected donut');
    section.topN = { count: 1, otherLabel: 'Other' };

    await show(definition, async () => ({
      parts: [
        { category: 'Other', value: 1 },
        { category: 'Rent', value: 2 },
      ],
      center: null,
    }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(dashboardLogger.error).toHaveBeenCalled();
  });
});

describe('matrix heatmap sections', () => {
  const definition = dashboardDefinitionSchema.parse(sampleDashboard);
  const matrixProps = (
    sectionId: string,
    fetchMatrixData: Parameters<typeof DashboardSection>[0]['fetchMatrixData'],
    month = '2026-08'
  ) => {
    const section = definition.sections.find(
      (candidate) => candidate.id === sectionId
    );
    if (section?.kind !== 'matrix-heatmap')
      throw new Error(`Expected matrix fixture ${sectionId}`);
    return {
      dashboard: definition,
      section,
      urlState,
      periodResolution: Promise.resolve(resolution(month)),
      resolveSectionGate: async () => ({
        status: 'open' as const,
        period: resolution(month).period,
      }),
      fetchSectionData: async () => null,
      fetchTableRows: async () => null,
      fetchBarsData: async () => null,
      fetchTimeSeriesPivot: async () => null,
      fetchPivotData: async () => null,
      fetchScatterData: async () => null,
      fetchMatrixData,
      fetchCompositionData: async () => null,
    };
  };

  it('names the grid, fills every hour and day, and tells a missing cell from zero', async () => {
    const result: MatrixData = {
      status: 'ready',
      rowCategories: null,
      columnCategories: null,
      cells: [
        { row: '00', column: '2026-08-01', value: 0 },
        { row: '23', column: '2026-08-31', value: 12.5 },
      ],
    };
    const view = await DashboardSection(
      matrixProps('hourly-readings', async () => result)
    );

    render(view);
    await act(() => Promise.resolve());

    expect(
      screen.getByRole('img', { name: 'Readings by hour' })
    ).toBeInTheDocument();
    expect(screen.getAllByTitle(/^\d{2} \d{1,2}\/\d{1,2}: /)).toHaveLength(744);
    expect(screen.getByTitle('00 8/1: 0 °C')).toBeInTheDocument();
    expect(screen.getByTitle('23 8/31: 12.5 °C')).toBeInTheDocument();
    expect(screen.getByTitle('01 8/1: No entries')).toBeInTheDocument();
  });

  it('orders categories by rank with the null label last over the window days', async () => {
    const result: MatrixData = {
      status: 'ready',
      rowCategories: ['9', '10', null],
      columnCategories: null,
      cells: [
        { row: '9', column: '2026-06-09', value: 1200 },
        { row: null, column: '2026-08-31', value: 50 },
      ],
    };
    const view = await DashboardSection(
      matrixProps('daily-category-totals', async () => result)
    );

    render(view);
    await act(() => Promise.resolve());

    expect(
      screen.getAllByTitle(/ 6\/9: /).map((cell) => cell.getAttribute('title'))
    ).toEqual([
      '9 6/9: ￥1,200',
      '10 6/9: No entries',
      'No category 6/9: No entries',
    ]);
    expect(screen.getAllByTitle(/: /)).toHaveLength(252);
    expect(screen.getByTitle('No category 8/31: ￥50')).toBeInTheDocument();
  });

  it('shows the too-large explanation instead of a grid', async () => {
    const props = matrixProps('hourly-readings', async () => ({
      status: 'too-large',
    }));
    const labels = { ...props.dashboard.labels };
    delete labels.cellBudgetExceeded;
    const view = await DashboardSection({
      ...props,
      dashboard: { ...props.dashboard, labels },
    });

    render(view);

    expect(
      screen.getByText(
        'Too many cells to show. Narrow the section with a filter, a shorter window, or top-N.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows empty for no rows and unavailable for a failed query', async () => {
    const emptyView = await DashboardSection(
      matrixProps('hourly-readings', async () => null)
    );
    render(emptyView);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
    document.body.innerHTML = '';

    const unavailableView = await DashboardSection(
      matrixProps('hourly-readings', async () =>
        Promise.reject(new Error('driver failed'))
      )
    );
    render(unavailableView);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('time-series pivot', () => {
  function pivotDashboard(locale = 'en-US'): DashboardDefinition {
    const definition = timeSeriesDashboard(locale);
    definition.sections = [
      {
        id: 'category-series',
        title: 'Categories',
        kind: 'time-series',
        source: { dataset: 'metrics', view: 'values', time: 'recorded_on' },
        window: 3,
        variant: 'line',
        stacked: false,
        format: { type: 'number' },
        pivot: {
          column: 'category',
          value: { column: 'amount', reduction: 'sum' },
        },
      },
    ];
    return definition;
  }

  async function renderPivot(
    definition: DashboardDefinition,
    fetchTimeSeriesPivot: () => Promise<PivotBuckets | null>
  ) {
    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        urlState,
        periodResolution: Promise.resolve(resolution('2026-03')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => null,
        fetchTableRows: async () => null,
        fetchBarsData: async () => null,
        fetchMatrixData: async () => null,
        fetchTimeSeriesPivot,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        fetchCompositionData: async () => null,
      })
    );
  }

  const buckets: PivotBuckets = {
    grouping: 'period-category',
    truncated: false,
    buckets: [
      {
        period: '2026-01',
        cells: [
          { category: 'food', values: [10] },
          { category: 'rent', values: [20] },
        ],
      },
      { period: '2026-03', cells: [{ category: 'food', values: [5] }] },
    ],
  };

  it('shows the largest category and a last remainder with a spine gap', async () => {
    const definition = pivotDashboard();
    const section = definition.sections[0];
    if (section.kind !== 'time-series' || section.pivot === undefined)
      throw new Error('Expected pivot');
    section.pivot.topN = { count: 1, otherLabel: 'Other categories' };

    await renderPivot(definition, async () => buckets);

    expect(
      screen.getByRole('application', { name: 'Categories' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent)
    ).toEqual(['rent', 'Other categories']);
    expect(screen.getByText('Jan – Mar 2026')).toBeInTheDocument();
  });

  it('explains an unbounded pivot above twelve categories without an alert', async () => {
    const definition = pivotDashboard();
    const many: PivotBuckets = {
      grouping: 'period-category',
      truncated: false,
      buckets: [
        {
          period: '2026-03',
          cells: Array.from({ length: 13 }, (_, index) => ({
            category: `c${index}`,
            values: [1],
          })),
        },
      ],
    };

    await renderPivot(definition, async () => many);

    expect(
      screen.getByText('Too many series to show (13 / 12)')
    ).toBeInTheDocument();
    expect(screen.queryByRole('application')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    document.body.innerHTML = '';
    const localized = pivotDashboard('ja-JP');
    localized.labels = { tooManySeries: '系列が多すぎます' };
    await renderPivot(localized, async () => many);
    expect(screen.getByText('系列が多すぎます (13 / 12)')).toBeInTheDocument();
  });

  it('shows unavailable for a colliding remainder label and empty for no rows', async () => {
    const definition = pivotDashboard();
    const section = definition.sections[0];
    if (section.kind !== 'time-series' || section.pivot === undefined)
      throw new Error('Expected pivot');
    section.pivot.topN = { count: 1, otherLabel: 'Other categories' };
    await renderPivot(definition, async () => ({
      grouping: 'period-category',
      truncated: false,
      buckets: [
        {
          period: '2026-03',
          cells: [
            { category: 'food', values: [20] },
            { category: 'Other categories', values: [10] },
          ],
        },
      ],
    }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      (await import('../../modules/dashboard/adapters/shared')).dashboardLogger
        .error
    ).toHaveBeenCalled();

    document.body.innerHTML = '';
    await renderPivot(definition, async () => null);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });
});

function tableDashboard(
  locale = 'en-US',
  emptyMessage?: string
): DashboardDefinition {
  return {
    ...dashboard(locale),
    timeZone: 'Asia/Tokyo',
    sections: [
      {
        id: 'detail',
        title: 'Largest entries',
        kind: 'table',
        source: {
          dataset: 'metrics',
          view: 'entries',
          time: { column: 'recorded_at', type: 'timestamp' },
        },
        columns: [
          { header: 'Date', column: 'occurred_on', type: 'date' },
          { header: 'Description', column: 'description', type: 'text' },
          { header: 'Recorded at', column: 'recorded_at', type: 'timestamp' },
          {
            header: 'Amount',
            column: 'amount',
            type: 'number',
            format: { type: 'number' },
          },
          { header: 'Missing', column: 'missing', type: 'text' },
        ],
        paging: { pageSize: 20 },
        emptyMessage,
      },
    ],
  };
}

describe('DashboardSection table', () => {
  it.each([
    {
      locale: 'en-US',
      date: 'Aug 15, 2026',
      timestamp: /Aug 15, 2026, 6:05[ \u202f]PM/,
    },
    { locale: 'ja-JP', date: '2026/08/15', timestamp: '2026/08/15 18:05' },
  ])('formats table cells in $locale', async ({ locale, date, timestamp }) => {
    const definition = tableDashboard(locale);
    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        urlState,
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        fetchTableRows: async () => ({
          rows: [['2026-08-15', 'Rent', 1786784700000, 1200, null]],
          page: { number: 1, count: 1 },
        }),
      })
    );
    expect(
      screen.getByRole('table', { name: 'Largest entries' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent)
    ).toEqual(['Date', 'Description', 'Recorded at', 'Amount', 'Missing']);
    expect(screen.getByText(date)).toBeInTheDocument();
    expect(screen.getByText(timestamp)).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders the table empty message when the row query is empty', async () => {
    const definition = tableDashboard('en-US', 'No entries in this period.');
    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        urlState,
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => null,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
      })
    );
    expect(
      screen.getByRole('table', { name: 'Largest entries' })
    ).toHaveTextContent('No entries in this period.');
  });

  it('shows the generic empty state without an override', async () => {
    const definition = tableDashboard();
    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        urlState,
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => null,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
      })
    );
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('uses the clamped page instead of the URL page', async () => {
    const definition = tableDashboard();
    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        urlState: { ...urlState, pages: { detail: 7 } },
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
        fetchTableRows: async () => ({
          rows: [['2026-08-15', 'Rent', 1786784700000, 1200, null]],
          page: { number: 3, count: 3 },
        }),
      })
    );
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('shows unavailable state when the row query fails', async () => {
    const definition = tableDashboard();
    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        urlState,
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => null,
        fetchTableRows: async () => Promise.reject(new Error('driver failed')),
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
      })
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('DashboardSection gates', () => {
  it('shows accumulation and does not fetch chart data', async () => {
    const definition = timeSeriesDashboard();
    const fetchSectionData = vi.fn(async () => data());
    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        urlState,
        periodResolution: Promise.resolve(resolution('2026-05')),
        resolveSectionGate: async () => ({
          status: 'accumulating',
          since: '2026-03-15',
          availableFrom: {
            grain: 'month',
            start: { date: '2026-06-01', hour: 0 },
          },
          note: 'Three months are needed',
        }),
        fetchSectionData,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
      })
    );
    expect(
      screen.getByText(
        'Accumulating since March 15, 2026 · Available from June 2026'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Three months are needed')).toBeInTheDocument();
    expect(screen.queryByRole('application')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(fetchSectionData).not.toHaveBeenCalled();
  });

  it('formats an hourly availability target', async () => {
    const definition = timeSeriesDashboard();
    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        urlState,
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: async () => ({
          status: 'accumulating',
          since: '2026-08-15',
          availableFrom: {
            grain: 'hour',
            start: { date: '2026-08-16', hour: 6 },
          },
        }),
        fetchSectionData: async () => null,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
      })
    );
    expect(
      screen.getByText(/Available from August 16, 2026 at 06:00/)
    ).toBeInTheDocument();
  });

  it('shows not ready and does not fetch chart data', async () => {
    const definition = timeSeriesDashboard();
    const fetchSectionData = vi.fn(async () => data());
    render(
      await DashboardSection({
        dashboard: definition,
        section: definition.sections[0],
        urlState,
        periodResolution: Promise.resolve(resolution('2026-08')),
        resolveSectionGate: async () => ({
          status: 'not-ready',
          note: 'Waiting for the monthly close',
        }),
        fetchSectionData,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
      })
    );
    expect(
      screen.getByText('The latest data is not ready yet')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Waiting for the monthly close')
    ).toBeInTheDocument();
    expect(screen.queryByRole('application')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(fetchSectionData).not.toHaveBeenCalled();
  });

  it('uses Japanese accumulation and readiness labels', async () => {
    const definition = timeSeriesDashboard('ja-JP');
    definition.labels = {
      accumulatingSince: '収集開始',
      availableFrom: '有効化',
      notReady: '準備中',
    };
    const props = {
      dashboard: definition,
      section: definition.sections[0],
      urlState,
      periodResolution: Promise.resolve(resolution('2026-05')),
      fetchSectionData: async () => null,
      fetchTableRows: async () => null,
      fetchMatrixData: async () => null,
      fetchBarsData: async () => null,
      fetchCompositionData: async () => null,
      fetchTimeSeriesPivot: async () => null,
      fetchPivotData: async () => null,
      fetchScatterData: async () => null,
    };
    const first = render(
      await DashboardSection({
        ...props,
        resolveSectionGate: async () => ({
          status: 'accumulating',
          since: '2026-03-15',
          availableFrom: {
            grain: 'month' as const,
            start: { date: '2026-06-01', hour: 0 },
          },
        }),
      })
    );
    expect(
      screen.getByText('収集開始 2026年3月15日 · 有効化 2026年6月')
    ).toBeInTheDocument();
    first.unmount();
    render(
      await DashboardSection({
        ...props,
        resolveSectionGate: async () => ({ status: 'not-ready' }),
      })
    );
    expect(screen.getByText('準備中')).toBeInTheDocument();
  });

  it('renders a latest tile without awaiting dashboard period resolution', async () => {
    const definition = dashboard();
    const section = definition.sections[0];
    if (section.kind !== 'stat-tiles') throw new Error('Expected tiles');
    section.period = 'latest';
    section.tiles = section.tiles
      .slice(1)
      .map((tile) => ({ ...tile, comparison: undefined }));
    const day = Period.parse('day', '2026-08-15');
    if (day === null) throw new Error('Expected day');
    const periodResolution = Promise.reject(new Error('never awaited'));
    void periodResolution.catch(() => undefined);
    render(
      await DashboardSection({
        dashboard: definition,
        section,
        urlState,
        periodResolution,
        resolveSectionGate: async () => ({ status: 'open', period: day }),
        fetchSectionData: async ({ period }) =>
          period.toString() === '2026-08-15'
            ? {
                truncated: false,
                buckets: [{ period: '2026-08-15', values: [21.5] }],
              }
            : null,
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
      })
    );
    expect(screen.getByText('As of August 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('21.5')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the latest hourly chart with one as-of date', async () => {
    const definition = timeSeriesDashboard();
    definition.timeZone = 'Asia/Tokyo';
    const section = definition.sections[0];
    if (section.kind !== 'time-series') throw new Error('Expected series');
    section.period = 'latest';
    section.grain = 'hour';
    section.window = undefined;
    section.source.time = { date: 'reading_date', hour: 'reading_hour' };
    const day = Period.parse('day', '2026-08-15');
    if (day === null) throw new Error('Expected day');
    render(
      await DashboardSection({
        dashboard: definition,
        section,
        urlState,
        periodResolution: Promise.resolve(resolution('2026-03')),
        resolveSectionGate: async () => ({ status: 'open', period: day }),
        fetchSectionData: async () => ({
          truncated: false,
          buckets: [
            { period: '2026-08-15T00', values: [21] },
            { period: '2026-08-15T23', values: [25] },
          ],
        }),
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
      })
    );
    expect(
      screen.getByRole('application', { name: 'Monthly trend' })
    ).toBeInTheDocument();
    expect(screen.getByText('As of August 15, 2026')).toBeInTheDocument();
    expect(screen.queryByText('Aug 15, 2026')).toBeNull();
  });

  it('shows availability without a minimum above ready content', async () => {
    const definition = timeSeriesDashboard();
    const section = definition.sections[0];
    section.availability = { since: '2026-03-15', note: 'Started mid-March' };
    render(
      await DashboardSection({
        dashboard: definition,
        section,
        urlState,
        periodResolution: Promise.resolve(resolution('2026-03')),
        resolveSectionGate: openGate,
        fetchSectionData: async () => ({
          truncated: false,
          buckets: [{ period: '2026-03', values: [30] }],
        }),
        fetchTableRows: async () => null,
        fetchMatrixData: async () => null,
        fetchBarsData: async () => null,
        fetchCompositionData: async () => null,
        fetchTimeSeriesPivot: async () => null,
        fetchPivotData: async () => null,
        fetchScatterData: async () => null,
      })
    );
    expect(
      screen.getByRole('application', { name: 'Monthly trend' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Accumulating since March 15, 2026')
    ).toBeInTheDocument();
    expect(screen.getByText('Started mid-March')).toBeInTheDocument();
  });

  it('shows a latest table with its empty message', async () => {
    const definition = tableDashboard('en-US', 'No entries in this period.');
    const section = definition.sections[0];
    section.period = 'latest';
    const day = Period.parse('day', '2026-08-15');
    if (day === null) throw new Error('Expected day');
    await act(async () => {
      render(
        await DashboardSection({
          dashboard: definition,
          section,
          urlState,
          periodResolution: Promise.resolve(null),
          resolveSectionGate: async () => ({ status: 'open', period: day }),
          fetchSectionData: async () => null,
          fetchTableRows: async () => null,
          fetchMatrixData: async () => null,
          fetchBarsData: async () => null,
          fetchCompositionData: async () => null,
          fetchTimeSeriesPivot: async () => null,
          fetchPivotData: async () => null,
          fetchScatterData: async () => null,
        })
      );
    });
    expect(
      screen.getByRole('table', { name: 'Largest entries' })
    ).toHaveTextContent('No entries in this period.');
    expect(screen.getByText('As of August 15, 2026')).toBeInTheDocument();
  });
});

function categoryAxisLabels(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll(
      '.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value'
    ),
    (tick) => tick.textContent ?? ''
  );
}

describe('bars sections', () => {
  const makeDashboard = (): DashboardDefinition => {
    const definition = dashboard();
    definition.sections = [
      {
        id: 'bars',
        title: 'Largest categories',
        kind: 'bars',
        source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
        x: {
          axis: 'category',
          column: 'category',
          topN: { count: 2, otherLabel: 'Other categories' },
          order: 'value-desc',
        },
        series: [{ label: 'Amount', column: 'amount', reduction: 'sum' }],
        stacked: false,
        format: { type: 'number' },
      },
    ];
    return definition;
  };
  const renderBars = async (
    definition: DashboardDefinition,
    fetchBarsData: NonNullable<
      Parameters<typeof DashboardSection>[0]['fetchBarsData']
    >,
    month = '2026-08'
  ) => {
    const view = await DashboardSection({
      dashboard: definition,
      section: definition.sections[0],
      urlState,
      periodResolution: Promise.resolve(resolution(month)),
      resolveSectionGate: async () => ({
        status: 'open',
        period: resolution(month).period,
      }),
      fetchSectionData: async () => null,
      fetchTableRows: async () => null,
      fetchMatrixData: async () => null,
      fetchBarsData,
      fetchCompositionData: async () => null,
      fetchTimeSeriesPivot: async () => null,
      fetchPivotData: async () => null,
      fetchScatterData: async () => null,
    });
    return render(view);
  };

  it('shows the latest day above category bars', async () => {
    const definition = makeDashboard();
    const section = definition.sections[0];
    const day = Period.parse('day', '2026-08-15');
    if (section.kind !== 'bars' || day === null)
      throw new Error('Expected latest bars section');
    section.period = 'latest';
    section.x = { axis: 'category', column: 'category', order: 'value-desc' };

    const view = await DashboardSection({
      dashboard: definition,
      section,
      urlState,
      periodResolution: Promise.resolve(resolution('2026-08')),
      resolveSectionGate: async () => ({ status: 'open', period: day }),
      fetchSectionData: async () => null,
      fetchTableRows: async () => null,
      fetchMatrixData: async () => null,
      fetchBarsData: async () => ({
        grouping: 'category',
        groups: [
          { category: 'Rent', values: [1200] },
          { category: 'Food', values: [300] },
        ],
      }),
      fetchCompositionData: async () => null,
      fetchTimeSeriesPivot: async () => null,
      fetchPivotData: async () => null,
      fetchScatterData: async () => null,
    });
    const { container } = render(view);

    expect(screen.getByText('As of August 15, 2026')).toBeInTheDocument();
    expect(categoryAxisLabels(container)).toEqual(['Rent', 'Food']);
  });

  it('shows top categories by value and the folded remainder last', async () => {
    const definition = makeDashboard();
    const { container } = await renderBars(definition, async () => ({
      grouping: 'category',
      groups: [
        { category: 'Rent', values: [1200] },
        { category: 'Food', values: [300] },
        { category: null, values: [50] },
        { category: 'Fun', values: [100] },
      ],
    }));

    expect(
      screen.getByRole('application', { name: 'Largest categories' })
    ).toBeInTheDocument();
    expect(categoryAxisLabels(container)).toEqual([
      'Rent',
      'Food',
      'Other categories',
    ]);
  });

  it('uses numeric sort keys and the dashboard null label', async () => {
    const definition = makeDashboard();
    definition.labels = { nullCategory: 'No category' };
    const section = definition.sections[0];
    if (section.kind !== 'bars') throw new Error('Expected bars');
    section.x = {
      axis: 'category',
      column: 'category',
      order: { sortKey: { column: 'weekday', type: 'number' } },
    };
    section.series?.push({ label: 'Count', column: 'count', reduction: 'sum' });
    const { container } = await renderBars(definition, async () => ({
      grouping: 'category',
      groups: [
        { category: 'Tue', values: [20, 2], sortKey: 2 },
        { category: 'Mon', values: [10, 1], sortKey: 1 },
        { category: null, values: [5, 1], sortKey: null },
      ],
    }));

    expect(categoryAxisLabels(container)).toEqual([
      'Mon',
      'Tue',
      'No category',
    ]);
  });

  it('renders unavailable and logs a label collision with a folded category', async () => {
    const definition = makeDashboard();
    await renderBars(definition, async () => ({
      grouping: 'category',
      groups: [
        { category: 'Rent', values: [10] },
        { category: 'Food', values: [5] },
        { category: 'Other categories', values: [1] },
      ],
    }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      (await import('../../modules/dashboard/adapters/shared')).dashboardLogger
        .error
    ).toHaveBeenCalled();
  });

  it('fills missing pivot months and keeps the remainder last in the legend', async () => {
    const definition = makeDashboard();
    const section = definition.sections[0];
    if (section.kind !== 'bars') throw new Error('Expected bars');
    section.x = { axis: 'time', window: 3 };
    section.series = undefined;
    section.pivot = {
      column: 'category',
      value: { column: 'amount', reduction: 'sum' },
      topN: { count: 1, otherLabel: 'Other categories' },
    };
    const { container } = await renderBars(
      definition,
      async () => ({
        grouping: 'period-category',
        truncated: false,
        buckets: [
          {
            period: '2026-01',
            cells: [
              { category: 'food', values: [10] },
              { category: 'rent', values: [20] },
            ],
          },
          { period: '2026-03', cells: [{ category: 'food', values: [5] }] },
        ],
      }),
      '2026-03'
    );

    expect(categoryAxisLabels(container)).toEqual([
      'January 2026',
      'February 2026',
      'March 2026',
    ]);
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent)
    ).toEqual(['rent', 'Other categories']);
    expect(screen.getByText('Jan – Mar 2026')).toBeInTheDocument();
  });

  it('draws one bar per day of the selected month and leaves days without rows as gaps', async () => {
    const definition = makeDashboard();
    const section = definition.sections.find(
      (candidate) => candidate.id === 'bars'
    );
    if (section?.kind !== 'bars') throw new Error('Expected bars');
    section.x = { axis: 'time', grain: 'day' };

    const { container } = await renderBars(definition, async () => ({
      grouping: 'period',
      truncated: false,
      buckets: [
        { period: '2026-08-03', values: [10] },
        { period: '2026-08-31', values: [20] },
      ],
    }));

    const labels = categoryAxisLabels(container);
    expect(labels).toHaveLength(31);
    expect(labels[0]).toBe('August 1, 2026');
    expect(labels[2]).toBe('August 3, 2026');
    expect(labels[30]).toBe('August 31, 2026');
    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(
      2
    );
    expect(screen.getByText('Aug 1 – 31, 2026')).toBeInTheDocument();
  });

  it('ranks pivot categories over the displayed days and keeps the remainder last', async () => {
    const definition = makeDashboard();
    const section = definition.sections.find(
      (candidate) => candidate.id === 'bars'
    );
    if (section?.kind !== 'bars') throw new Error('Expected bars');
    section.x = { axis: 'time', grain: 'day', window: 3 };
    section.series = undefined;
    section.pivot = {
      column: 'category',
      value: { column: 'amount', reduction: 'sum' },
      topN: { count: 1, otherLabel: 'Other categories' },
    };
    section.stacked = true;

    const { container } = await renderBars(definition, async () => ({
      grouping: 'period-category',
      truncated: false,
      buckets: [
        {
          period: '2026-08-29',
          cells: [
            { category: 'food', values: [10] },
            { category: 'rent', values: [20] },
          ],
        },
        {
          period: '2026-08-31',
          cells: [{ category: 'food', values: [5] }],
        },
      ],
    }));

    expect(categoryAxisLabels(container)).toEqual([
      'August 29, 2026',
      'August 30, 2026',
      'August 31, 2026',
    ]);
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent)
    ).toEqual(['rent', 'Other categories']);
    expect(screen.getByText('Aug 29 – 31, 2026')).toBeInTheDocument();
  });

  it('shortens a truncated time window and shows the truncation label', async () => {
    const definition = makeDashboard();
    const section = definition.sections[0];
    if (section.kind !== 'bars') throw new Error('Expected bars');
    section.x = { axis: 'time', window: 12 };
    const { container } = await renderBars(definition, async () => ({
      grouping: 'period',
      truncated: true,
      buckets: [
        { period: '2026-07', values: [10] },
        { period: '2026-08', values: [20] },
      ],
    }));

    expect(categoryAxisLabels(container)).toEqual(['July 2026', 'August 2026']);
    expect(
      screen.getByText('Jul – Aug 2026 · Older periods are not shown')
    ).toBeInTheDocument();
  });

  it('shows an empty state for no rows and unavailable for a failed query', async () => {
    const definition = makeDashboard();
    await renderBars(definition, async () => null);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
    document.body.innerHTML = '';
    await renderBars(definition, async () =>
      Promise.reject(new Error('driver failed'))
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

function scatterDashboard(): DashboardDefinition {
  const definition = dashboard();
  definition.sections = [
    {
      id: 'correlation',
      title: 'Correlation',
      kind: 'scatter',
      source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
      x: { column: 'amount', label: 'Amount', format: { type: 'number' } },
      y: { column: 'balance', label: 'Balance', format: { type: 'number' } },
      series: { column: 'category', label: 'Category' },
      limit: 10,
    },
  ];
  return definition;
}

async function showScatter(
  definition: DashboardDefinition,
  fetchScatterData: () => Promise<
    import('../../modules/dashboard/use-cases').ScatterData | null
  >
) {
  const view = await DashboardSection({
    dashboard: definition,
    section: definition.sections[0],
    urlState,
    periodResolution: Promise.resolve(resolution('2026-08')),
    resolveSectionGate: async () => ({
      status: 'open',
      period: resolution('2026-08').period,
    }),
    fetchSectionData: async () => null,
    fetchTableRows: async () => null,
    fetchBarsData: async () => null,
    fetchCompositionData: async () => null,
    fetchMatrixData: async () => null,
    fetchTimeSeriesPivot: async () => null,
    fetchPivotData: async () => null,
    fetchScatterData,
  });
  render(view);
  await act(() => Promise.resolve());
}

describe('scatter sections', () => {
  it('shows empty for a scatter with no points', async () => {
    await showScatter(scatterDashboard(), async () => null);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('shows unavailable when the points query fails', async () => {
    await showScatter(scatterDashboard(), async () =>
      Promise.reject(new Error('query failed'))
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows unavailable and logs when a series is labelled like the null category', async () => {
    await showScatter(scatterDashboard(), async () => ({
      points: [{ x: 1, y: 2, series: 'None' }],
      truncated: false,
      trendLine: null,
    }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(dashboardLogger.error).toHaveBeenCalled();
  });
});
