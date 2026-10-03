import { describe, expect, it } from 'vitest';

import { validateDefinitionRules } from './rules';
import type { DashboardDefinition } from './types';

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
