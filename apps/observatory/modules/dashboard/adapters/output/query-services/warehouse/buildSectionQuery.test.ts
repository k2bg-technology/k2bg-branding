import { describe, expect, it } from 'vitest';

import type { SectionQueryPlan } from '../../../../domain';
import { Period, planSection, Reduction } from '../../../../domain';
import sampleDashboard from '../../../../fixtures/sample-dashboard.json';
import { RepositoryError } from '../../../shared';
import { dashboardDefinitionSchema } from '../../definition-sources/file-system/schemas';
import { buildSectionQuery } from './buildSectionQuery';
import { buildPeriodBoundsQuery } from './query';

function createPlan(reduction: Reduction = Reduction.SUM): SectionQueryPlan {
  return {
    kind: 'stat-tiles',
    sectionId: 'headline',
    source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
    timeZone: 'Asia/Tokyo',
    dateRange: { firstDate: '2026-09-01', lastDate: '2026-09-30' },
    measures: [{ column: 'amount', reduction }],
  };
}

describe('buildSectionQuery', () => {
  it('returns the documented SQL and bound parameters for a sum tile', () => {
    const plan = createPlan();

    const result = buildSectionQuery(plan);

    expect(result).toEqual({
      sql: [
        'WITH filtered AS (',
        'SELECT `recorded_on` AS source_time, CAST(`amount` AS FLOAT64) AS value_0',
        'FROM `metrics.monthly`',
        'WHERE DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) <= CAST(@period_end AS DATE)',
        ')',
        'SELECT CAST((SELECT SUM(value_0) FROM filtered) AS FLOAT64) AS value_0',
        'FROM (SELECT 1 AS singleton)',
        'WHERE EXISTS (SELECT 1 FROM filtered)',
      ].join('\n'),
      params: {
        period_start: '2026-09-01',
        period_end: '2026-09-30',
        time_zone: 'Asia/Tokyo',
      },
    });
  });

  it('returns one row for a nonempty source when every tile uses latest', () => {
    const plan = createPlan(Reduction.LATEST);

    const result = buildSectionQuery(plan);

    expect(result.sql).toBe(
      [
        'WITH filtered AS (',
        'SELECT `recorded_on` AS source_time, CAST(`amount` AS FLOAT64) AS value_0',
        'FROM `metrics.monthly`',
        'WHERE DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) <= CAST(@period_end AS DATE)',
        ')',
        'SELECT CAST((SELECT ARRAY_AGG(STRUCT(source_time, value_0) ORDER BY source_time DESC LIMIT 1)[SAFE_OFFSET(0)].value_0 FROM filtered) AS FLOAT64) AS value_0,',
        'CAST((SELECT COUNT(DISTINCT TO_JSON_STRING(value_0)) FROM filtered WHERE source_time = (SELECT MAX(source_time) FROM filtered)) AS FLOAT64) AS distinct_count_0',
        'FROM (SELECT 1 AS singleton)',
        'WHERE EXISTS (SELECT 1 FROM filtered)',
      ].join('\n')
    );
  });

  it.each([
    { reduction: Reduction.SUM, expression: 'SUM(value_0)' },
    { reduction: Reduction.AVERAGE, expression: 'AVG(value_0)' },
    { reduction: Reduction.MINIMUM, expression: 'MIN(value_0)' },
    { reduction: Reduction.MAXIMUM, expression: 'MAX(value_0)' },
    {
      reduction: Reduction.LATEST,
      expression:
        'ARRAY_AGG(STRUCT(source_time, value_0) ORDER BY source_time DESC LIMIT 1)',
    },
  ])(
    'groups one month with the $reduction reduction',
    ({ reduction, expression }) => {
      const plan = createPlan(reduction);

      const result = buildSectionQuery(plan);

      expect(result.sql).toContain(expression);
    }
  );

  it('counts null as a distinct latest value and projects both results as numbers', () => {
    const plan = createPlan(Reduction.LATEST);

    const result = buildSectionQuery(plan);

    expect(result.sql).toContain(
      'CAST((SELECT COUNT(DISTINCT TO_JSON_STRING(value_0)) FROM filtered WHERE source_time = (SELECT MAX(source_time) FROM filtered)) AS FLOAT64) AS distinct_count_0'
    );
    expect(result.sql).toContain('CAST((SELECT ARRAY_AGG');
  });

  it('uses the dashboard time zone for a timestamp at a calendar-month boundary', () => {
    const period = Period.parse('2026-09');
    if (period === null) {
      throw new Error('Expected fixture period to parse');
    }
    const plan = planSection(
      {
        id: 'headline',
        title: 'Headline',
        kind: 'stat-tiles',
        source: {
          dataset: 'metrics',
          view: 'events',
          time: { column: 'recorded_at', type: 'timestamp' },
        },
        tiles: [
          {
            label: 'Total',
            column: 'amount',
            reduction: 'sum',
            format: { type: 'number' },
          },
        ],
      },
      period,
      'Asia/Tokyo'
    );

    const result = buildSectionQuery(plan);

    expect(result.sql).toContain('DATE(`recorded_at`, @time_zone)');
    expect(result.params).toMatchObject({ time_zone: 'Asia/Tokyo' });
  });

  it('builds one parameterized query for the fixture sum and latest tiles', () => {
    const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
    const period = Period.parse('2026-09');
    if (period === null) {
      throw new Error('Expected fixture period to parse');
    }

    const result = buildSectionQuery(
      planSection(dashboard.sections[0], period, dashboard.timeZone)
    );

    expect(result.sql).toContain(
      'CAST((SELECT SUM(value_0) FROM filtered) AS FLOAT64) AS value_0'
    );
    expect(result.sql).toContain(
      'ARRAY_AGG(STRUCT(source_time, value_1) ORDER BY source_time DESC LIMIT 1)'
    );
    expect(result.sql).toContain('WHERE EXISTS (SELECT 1 FROM filtered)');
    expect(result.params).toEqual({
      period_start: '2026-09-01',
      period_end: '2026-09-30',
      time_zone: 'Asia/Tokyo',
    });
  });

  it.each([
    {
      name: 'dataset',
      mutate: (plan: SectionQueryPlan) => ({
        ...plan,
        source: { ...plan.source, dataset: 'metrics; DROP TABLE events' },
      }),
    },
    {
      name: 'measure column',
      mutate: (plan: SectionQueryPlan) => ({
        ...plan,
        measures: [{ ...plan.measures[0], column: 'amount` FROM secrets' }],
      }),
    },
  ])('rejects an injection-shaped $name', ({ mutate }) => {
    const plan = mutate(createPlan());

    const act = () => buildSectionQuery(plan);

    expect(act).toThrow(RepositoryError);
  });
});

describe('buildPeriodBoundsQuery', () => {
  it.each([
    {
      name: 'DATE',
      time: 'recorded_on' as const,
      expression:
        'DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone)',
    },
    {
      name: 'TIMESTAMP',
      time: { column: 'recorded_at', type: 'timestamp' as const },
      expression: 'DATE(`recorded_at`, @time_zone)',
    },
  ])(
    'projects $name bounds as JSON-safe date strings',
    ({ time, expression }) => {
      const result = buildPeriodBoundsQuery(
        { dataset: 'metrics', view: 'events', time },
        'Asia/Tokyo'
      );

      expect(result).toEqual({
        sql: [
          `SELECT FORMAT_DATE('%F', MIN(${expression})) AS first_date,`,
          `FORMAT_DATE('%F', MAX(${expression})) AS last_date`,
          'FROM `metrics.events`',
          'HAVING COUNT(*) > 0',
        ].join('\n'),
        params: { time_zone: 'Asia/Tokyo' },
      });
    }
  );
});
