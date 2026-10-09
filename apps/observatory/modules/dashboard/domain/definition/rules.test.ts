import { describe, expect, it } from 'vitest';

import { validateDefinitionRules } from './rules';
import type { DashboardDefinition, TableSection } from './types';

function createDefinition(): DashboardDefinition {
  return {
    id: 'summary',
    title: 'Summary',
    grain: 'month',
    timeZone: 'UTC',
    locale: 'en-US',
    currency: 'USD',
    revalidate: 86_400,
    defaultPeriod: 'latest-with-data',
    sections: [
      {
        id: 'headline',
        title: 'Headline',
        kind: 'stat-tiles',
        source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
        tiles: [
          {
            label: 'Total',
            column: 'total',
            reduction: 'sum',
            format: { type: 'currency' },
          },
        ],
      },
    ],
  };
}

describe('validateDefinitionRules', () => {
  it('rejects stacking with an average series at its reduction path', () => {
    const definition = createDefinition();
    definition.sections = [
      {
        id: 'trend',
        title: 'Trend',
        kind: 'time-series',
        source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
        window: 12,
        variant: 'area',
        stacked: true,
        format: { type: 'number' },
        series: [{ label: 'Average', column: 'value', reduction: 'average' }],
      },
    ];

    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'series', 0, 'reduction'],
      message: 'Stacking adds values up and requires the sum reduction',
    });
  });

  it('rejects stacking on a line chart', () => {
    const definition = createDefinition();
    definition.sections = [
      {
        id: 'trend',
        title: 'Trend',
        kind: 'time-series',
        source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
        window: 12,
        variant: 'line',
        stacked: true,
        format: { type: 'number' },
        series: [{ label: 'Total', column: 'value', reduction: 'sum' }],
      },
    ];

    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'stacked'],
      message: 'Stacking requires the area variant',
    });
  });

  it('accepts stacked sum areas and rejects a currency section without currency', () => {
    const definition = createDefinition();
    definition.sections = [
      {
        id: 'trend',
        title: 'Trend',
        kind: 'time-series',
        source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
        window: 12,
        variant: 'area',
        stacked: true,
        format: { type: 'currency' },
        series: [
          { label: 'First', column: 'first', reduction: 'sum' },
          { label: 'Second', column: 'second', reduction: 'sum' },
        ],
      },
    ];

    expect(validateDefinitionRules(definition)).toEqual([]);
    delete definition.currency;
    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'format'],
      message: 'A currency section requires dashboard currency',
    });
  });
  it('reports the later path when section ids are duplicated', () => {
    const definition = createDefinition();
    definition.sections.push({ ...definition.sections[0] });

    const result = validateDefinitionRules(definition);

    expect(result).toContainEqual({
      path: ['sections', 1, 'id'],
      message: 'Duplicate section id "headline"',
    });
  });

  it('reports the tile path when currency formatting lacks a dashboard currency', () => {
    const definition = createDefinition();
    delete definition.currency;

    const result = validateDefinitionRules(definition);

    expect(result).toContainEqual({
      path: ['sections', 0, 'tiles', 0, 'format'],
      message: 'A currency tile requires dashboard currency',
    });
  });
});

describe('time-series grain rules', () => {
  function seriesDefinition(
    grain: DashboardDefinition['grain'],
    sectionGrain?: 'month' | 'week' | 'day' | 'hour',
    window?: number
  ) {
    const definition = createDefinition();
    definition.grain = grain;
    definition.sections = [
      {
        id: 'trend',
        title: 'Trend',
        kind: 'time-series',
        source: { dataset: 'metrics', view: 'readings', time: 'recorded_on' },
        ...(sectionGrain === undefined ? {} : { grain: sectionGrain }),
        ...(window === undefined ? {} : { window }),
        variant: 'line',
        stacked: false,
        format: { type: 'number' },
        series: [{ label: 'Value', column: 'value', reduction: 'average' }],
      },
    ];
    return definition;
  }

  it.each([
    { dashboard: 'month', section: 'week' },
    { dashboard: 'week', section: 'hour' },
  ] as const)(
    'rejects $dashboard to $section without cascading',
    ({ dashboard, section }) => {
      const definition = seriesDefinition(dashboard, section);

      expect(validateDefinitionRules(definition)).toEqual([
        {
          path: ['sections', 0, 'grain'],
          message: `Section grain "${section}" is not supported by dashboard grain "${dashboard}"`,
        },
      ]);
    }
  );

  it('requires a window at the dashboard grain', () => {
    const definition = seriesDefinition('month', 'month');

    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'window'],
      message: 'A time-series section at the dashboard grain requires window',
    });
  });

  it('requires a date-and-hour binding at hour grain', () => {
    const definition = seriesDefinition('day', 'hour');

    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'source', 'time'],
      message:
        'An hour section requires source.time with date and hour columns',
    });
  });

  it('accepts a finer hour section with a date-and-hour binding and no window', () => {
    const definition = seriesDefinition('day', 'hour');
    const section = definition.sections[0];
    section.source.time = { date: 'reading_date', hour: 'reading_hour' };

    expect(validateDefinitionRules(definition)).toEqual([]);
  });
});

describe('latest section rules', () => {
  function latestSeries() {
    const definition = createDefinition();
    definition.sections = [
      {
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
        variant: 'line',
        stacked: false,
        format: { type: 'number' },
        series: [{ label: 'Value', column: 'value', reduction: 'average' }],
      },
    ];
    return definition;
  }

  it('rejects a window', () => {
    const definition = latestSeries();
    const section = definition.sections[0];
    if (section.kind !== 'time-series') throw new Error('Expected time series');
    section.window = 24;
    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'window'],
      message: 'A latest section reads one date and does not accept window',
    });
  });

  it('rejects a day series without a dashboard-grain cascade', () => {
    const definition = latestSeries();
    const section = definition.sections[0];
    if (section.kind !== 'time-series') throw new Error('Expected time series');
    section.grain = 'day';
    expect(validateDefinitionRules(definition)).toEqual([
      {
        path: ['sections', 0, 'grain'],
        message: 'A latest time-series section requires grain "hour"',
      },
    ]);
  });

  it('requires a date-and-hour binding', () => {
    const definition = latestSeries();
    definition.sections[0].source.time = 'recorded_on';
    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'source', 'time'],
      message:
        'An hour section requires source.time with date and hour columns',
    });
  });

  it('accepts an hourly series on a month dashboard', () => {
    expect(validateDefinitionRules(latestSeries())).toEqual([]);
  });

  it('rejects tile comparison', () => {
    const definition = createDefinition();
    const section = definition.sections[0];
    if (section.kind !== 'stat-tiles') throw new Error('Expected tiles');
    section.period = 'latest';
    section.tiles[0].comparison = { direction: 'neutral' };
    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'tiles', 0, 'comparison'],
      message: 'A latest section reads one date and does not accept comparison',
    });
  });

  it('accepts availability and readiness on a following section', () => {
    const definition = createDefinition();
    const section = definition.sections[0];
    section.availability = { since: '2026-04-01', minimumBuckets: 3 };
    section.readiness = { column: 'is_complete' };
    expect(validateDefinitionRules(definition)).toEqual([]);
  });
});

function createTable(): TableSection {
  return {
    id: 'detail',
    title: 'Detail',
    kind: 'table',
    source: { dataset: 'metrics', view: 'entries', time: 'recorded_on' },
    columns: [
      { header: 'Date', column: 'occurred_on', type: 'date' },
      { header: 'Description', column: 'description', type: 'text' },
      {
        header: 'Amount',
        column: 'amount',
        type: 'number',
        format: { type: 'currency' },
      },
    ],
    paging: { pageSize: 20 },
  };
}

describe('table definition rules', () => {
  it.each([
    { name: 'both bounds', limit: 10, paging: { pageSize: 20 } },
    { name: 'neither bound', limit: undefined, paging: undefined },
  ])('rejects $name', ({ limit, paging }) => {
    const definition = createDefinition();
    definition.sections = [{ ...createTable(), limit, paging }];
    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'limit'],
      message: 'A table declares exactly one of limit and paging',
    });
  });

  it.each([
    {
      name: 'undeclared',
      column: 'missing',
      message: 'Sort column "missing" is not a declared column',
    },
    {
      name: 'duplicated',
      column: 'amount',
      message: 'Sort column "amount" matches several declared columns',
    },
  ])('rejects a $name sort column', ({ column, message }) => {
    const definition = createDefinition();
    const table = createTable();
    table.sort = { column, direction: 'descending' };
    if (column === 'amount') {
      table.columns.push({
        header: 'Other amount',
        column: 'amount',
        type: 'number',
        format: { type: 'number' },
      });
    }
    definition.sections = [table];
    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'sort', 'column'],
      message,
    });
  });

  it('requires dashboard currency for a currency column', () => {
    const definition = createDefinition();
    delete definition.currency;
    definition.sections = [createTable()];
    expect(validateDefinitionRules(definition)).toContainEqual({
      path: ['sections', 0, 'columns', 2, 'format'],
      message: 'A currency column requires dashboard currency',
    });
  });
});

describe('bars definition rules', () => {
  const validBars = (): import('./types').BarsSection => ({
    id: 'bars',
    title: 'Bars',
    kind: 'bars',
    source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
    x: { axis: 'category', column: 'category', order: 'value-desc' },
    series: [{ label: 'Amount', column: 'amount', reduction: 'sum' }],
    stacked: false,
    format: { type: 'number' },
  });
  const violations = (
    section: import('./types').BarsSection,
    currency = 'USD'
  ) => {
    const definition = createDefinition();
    if (currency === '') delete definition.currency;
    else definition.currency = currency;
    definition.sections = [section];
    return validateDefinitionRules(definition);
  };

  it('requires exactly one series source', () => {
    const section = validBars();
    expect(violations({ ...section, series: undefined })).toContainEqual({
      path: ['sections', 0, 'series'],
      message: 'A bars section declares exactly one of series and pivot',
    });
    expect(
      violations({
        ...section,
        pivot: {
          column: 'category',
          value: { column: 'amount', reduction: 'sum' },
          topN: { count: 1, otherLabel: 'Other' },
        },
      })
    ).toContainEqual({
      path: ['sections', 0, 'series'],
      message: 'A bars section declares exactly one of series and pivot',
    });
  });

  it('requires one resolvable ranking binding when several series rank', () => {
    const section = validBars();
    section.series?.push({ label: 'Count', column: 'count', reduction: 'sum' });
    section.x = {
      axis: 'category',
      column: 'category',
      order: 'value-desc',
      topN: { count: 1, otherLabel: 'Other' },
    };
    expect(violations(section)).toContainEqual({
      path: ['sections', 0, 'x', 'by'],
      message: 'Ranking several series requires by',
    });
    section.x.by = 'fee';
    expect(violations(section)).toContainEqual({
      path: ['sections', 0, 'x', 'by'],
      message: 'Ranking column "fee" is not a declared series',
    });
    section.x.by = 'amount';
    section.series?.push({
      label: 'Duplicate',
      column: 'amount',
      reduction: 'sum',
    });
    expect(violations(section)).toContainEqual({
      path: ['sections', 0, 'x', 'by'],
      message: 'Ranking column "amount" matches several declared series',
    });
    section.x = {
      axis: 'category',
      column: 'category',
      order: { sortKey: { column: 'weekday', type: 'number' } },
    };
    expect(violations(section)).toEqual([]);
  });

  it('requires the time axis for a pivot and sum where bars add values', () => {
    const section = validBars();
    section.pivot = {
      column: 'category',
      value: { column: 'amount', reduction: 'average' },
      topN: { count: 1, otherLabel: 'Other' },
    };
    section.series = undefined;
    expect(violations(section)).toContainEqual({
      path: ['sections', 0, 'pivot'],
      message:
        'pivot splits time buckets by a category column and requires the time axis',
    });
    expect(violations(section)).toContainEqual({
      path: ['sections', 0, 'pivot', 'value', 'reduction'],
      message: 'A remainder adds values up and requires the sum reduction',
    });
    section.x = { axis: 'time', window: 12 };
    section.stacked = true;
    expect(violations(section)).toContainEqual({
      path: ['sections', 0, 'pivot', 'value', 'reduction'],
      message: 'Stacking adds values up and requires the sum reduction',
    });
  });

  it('checks stacking, remainder, ranking, and currency independently', () => {
    const section = validBars();
    section.series?.push({
      label: 'Average',
      column: 'average',
      reduction: 'average',
    });
    section.x = {
      axis: 'category',
      column: 'category',
      by: 'average',
      topN: { count: 1, otherLabel: 'Other' },
      order: 'value-desc',
    };
    section.stacked = true;
    section.format = { type: 'currency' };
    const messages = violations(section, '').map(({ message }) => message);
    expect(messages).toContain(
      'Stacking adds values up and requires the sum reduction'
    );
    expect(messages).toContain(
      'A remainder adds values up and requires the sum reduction'
    );
    expect(messages).toContain(
      'Ranking by value adds values up and requires the sum reduction'
    );
    expect(messages).toContain(
      'A currency section requires dashboard currency'
    );
  });

  it('accepts a stacked sum pivot and a two-series sort key section', () => {
    const pivot = validBars();
    pivot.x = { axis: 'time', window: 12 };
    pivot.series = undefined;
    pivot.pivot = {
      column: 'category',
      value: { column: 'amount', reduction: 'sum' },
      topN: { count: 1, otherLabel: 'Other' },
    };
    pivot.stacked = true;
    expect(violations(pivot)).toEqual([]);
    const keyed = validBars();
    keyed.x = {
      axis: 'category',
      column: 'category',
      order: { sortKey: { column: 'weekday', type: 'number' } },
    };
    keyed.series?.push({
      label: 'Average',
      column: 'average',
      reduction: 'average',
    });
    expect(violations(keyed)).toEqual([]);
  });
});
