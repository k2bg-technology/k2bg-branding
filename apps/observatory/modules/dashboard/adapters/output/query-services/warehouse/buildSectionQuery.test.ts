import { describe, expect, it } from 'vitest';

import type { SectionQueryPlan, SourceFilter } from '../../../../domain';
import { Period, planSection, Reduction } from '../../../../domain';
import sampleDashboard from '../../../../fixtures/sample-dashboard.json';
import { RepositoryError } from '../../../shared';
import { dashboardDefinitionSchema } from '../../definition-sources/file-system/schemas';
import { buildSectionQuery } from './buildSectionQuery';
import { buildPeriodBoundsQuery } from './query';

function plan(
  reduction: Reduction = Reduction.SUM,
  compares = false
): SectionQueryPlan {
  return {
    kind: 'stat-tiles',
    sectionId: 'headline',
    grain: 'month',
    source: { dataset: 'metrics', view: 'monthly', time: 'recorded_on' },
    timeZone: 'Asia/Tokyo',
    selectedPeriod: '2026-09',
    dateRange: {
      firstDate: compares ? '2026-08-01' : '2026-09-01',
      lastDate: '2026-09-30',
    },
    measures: [{ column: 'amount', reduction, compares }],
  };
}

describe('buildSectionQuery', () => {
  it('builds the fixture time series with a trailing window, two reductions, and one extra bucket', () => {
    const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
    const section = dashboard.sections[1];
    const period = Period.parse('month', '2026-08');
    if (period === null || section.kind !== 'time-series') {
      throw new Error('Expected time-series fixture and period');
    }

    const result = buildSectionQuery(
      planSection(section, period, dashboard.timeZone)
    );

    expect(result).toEqual({
      sql: [
        'WITH filtered AS (',
        "SELECT FORMAT_DATE('%Y-%m', DATE(`recorded_at`, @time_zone)) AS period, `recorded_at` AS source_time, CAST(`first_value` AS FLOAT64) AS value_0, CAST(`second_value` AS FLOAT64) AS value_1",
        'FROM `sample_dataset.monthly_summary`',
        'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
        '),',
        'bucket_times AS (SELECT period, MAX(source_time) AS latest_time FROM filtered GROUP BY period)',
        'SELECT filtered.period, CAST(SUM(value_0) AS FLOAT64) AS value_0,',
        'CAST(SUM(value_1) AS FLOAT64) AS value_1',
        'FROM filtered JOIN bucket_times USING (period)',
        'GROUP BY filtered.period',
        'ORDER BY filtered.period DESC',
        'LIMIT @bucket_limit',
      ].join('\n'),
      params: {
        period_start: '2025-09-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
        bucket_limit: 121,
      },
    });
  });

  it('rejects an unsafe time-series measure identifier', () => {
    const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
    const section = dashboard.sections[1];
    const period = Period.parse('month', '2026-08');
    if (period === null || section.kind !== 'time-series') {
      throw new Error('Expected time-series fixture and period');
    }
    const plan = planSection(section, period, dashboard.timeZone);
    plan.measures[0].column = 'value; DROP TABLE rows';

    expect(() => buildSectionQuery(plan)).toThrow(RepositoryError);
  });
  it('returns complete monthly buckets and bound date parameters', () => {
    const result = buildSectionQuery(plan());

    expect(result).toEqual({
      sql: [
        'WITH filtered AS (',
        "SELECT FORMAT_DATE('%Y-%m', DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone)) AS period, `recorded_on` AS source_time, CAST(`amount` AS FLOAT64) AS value_0",
        'FROM `metrics.monthly`',
        'WHERE DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) <= CAST(@period_end AS DATE)',
        '),',
        'bucket_times AS (SELECT period, MAX(source_time) AS latest_time FROM filtered GROUP BY period)',
        'SELECT filtered.period, CAST(SUM(value_0) AS FLOAT64) AS value_0',
        'FROM filtered JOIN bucket_times USING (period)',
        'GROUP BY filtered.period',
        'ORDER BY filtered.period',
      ].join('\n'),
      params: {
        period_start: '2026-09-01',
        period_end: '2026-09-30',
        time_zone: 'Asia/Tokyo',
      },
    });
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
  ])('reduces each month with $reduction', ({ reduction, expression }) => {
    const result = buildSectionQuery(plan(reduction, true));

    expect(result.sql).toContain(expression);
    expect(result.sql).toContain('GROUP BY filtered.period');
    expect(result.params.period_start).toBe('2026-08-01');
  });

  it('projects latest ambiguity for each bucket including null', () => {
    const result = buildSectionQuery(plan(Reduction.LATEST, true));

    expect(result.sql).toContain(
      'COUNT(DISTINCT IF(source_time = latest_time, TO_JSON_STRING(value_0), NULL))'
    );
    expect(result.sql).toContain(
      'MAX(source_time) AS latest_time FROM filtered GROUP BY period'
    );
  });

  it('builds a two-month query when the fixture has one comparing tile', () => {
    const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
    const section = dashboard.sections[0];
    const period = Period.parse('month', '2026-09');
    if (period === null || section.kind !== 'stat-tiles') {
      throw new Error('Expected stat-tiles fixture and period');
    }

    const result = buildSectionQuery(
      planSection(section, period, dashboard.timeZone)
    );

    expect(result.params).toEqual({
      period_start: '2026-08-01',
      period_end: '2026-09-30',
      time_zone: 'Asia/Tokyo',
      filter_0: 'reporting',
    });
    expect(result.sql).toContain('AND `category` = @filter_0');
    expect(result.sql).toContain(
      'ABS(CAST(`total_value` AS FLOAT64)) AS value_0'
    );
    expect(result.sql).toContain('SUM(value_0) AS FLOAT64');
    expect(result.sql).toContain(
      'ARRAY_AGG(STRUCT(source_time, value_1) ORDER BY source_time DESC LIMIT 1)'
    );
    expect(result.sql).toContain(
      "FORMAT_DATE('%Y-%m', DATE(`recorded_at`, @time_zone)) AS period"
    );
  });

  it('does not widen the range for a non-comparing tile', () => {
    const result = buildSectionQuery(plan(Reduction.SUM));

    expect(result.params.period_start).toBe('2026-09-01');
  });

  it('rejects an injection-shaped identifier', () => {
    const unsafe = {
      ...plan(),
      source: {
        dataset: 'metrics; DROP TABLE rows',
        view: 'monthly',
        time: 'recorded_on',
      },
    };

    expect(() => buildSectionQuery(unsafe)).toThrow(RepositoryError);
  });

  it('builds a complete two-week query across the ISO year boundary', () => {
    const dashboard = dashboardDefinitionSchema.parse({
      ...sampleDashboard,
      grain: 'week',
    });
    const section = dashboard.sections[1];
    if (section.kind !== 'time-series') {
      throw new Error('Expected a time-series fixture section');
    }
    section.window = 2;
    const period = Period.parse('week', '2027-W01');
    if (period === null) {
      throw new Error('Expected fixture period to parse');
    }

    const result = buildSectionQuery(
      planSection(section, period, dashboard.timeZone)
    );

    expect(result).toEqual({
      sql: [
        'WITH filtered AS (',
        "SELECT FORMAT_DATE('%G-W%V', DATE(`recorded_at`, @time_zone)) AS period, `recorded_at` AS source_time, CAST(`first_value` AS FLOAT64) AS value_0, CAST(`second_value` AS FLOAT64) AS value_1",
        'FROM `sample_dataset.monthly_summary`',
        'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
        '),',
        'bucket_times AS (SELECT period, MAX(source_time) AS latest_time FROM filtered GROUP BY period)',
        'SELECT filtered.period, CAST(SUM(value_0) AS FLOAT64) AS value_0,',
        'CAST(SUM(value_1) AS FLOAT64) AS value_1',
        'FROM filtered JOIN bucket_times USING (period)',
        'GROUP BY filtered.period',
        'ORDER BY filtered.period DESC',
        'LIMIT @bucket_limit',
      ].join('\n'),
      params: {
        period_start: '2026-12-28',
        period_end: '2027-01-10',
        time_zone: 'Asia/Tokyo',
        bucket_limit: 121,
      },
    });
  });

  it('compares a day tile with the preceding day', () => {
    const dashboard = dashboardDefinitionSchema.parse({
      ...sampleDashboard,
      grain: 'day',
    });
    const section = dashboard.sections[0];
    const period = Period.parse('day', '2026-09-03');
    if (period === null || section.kind !== 'stat-tiles') {
      throw new Error('Expected stat-tiles fixture and period');
    }

    const result = buildSectionQuery(
      planSection(section, period, dashboard.timeZone)
    );

    expect(result.params).toEqual({
      period_start: '2026-09-02',
      period_end: '2026-09-03',
      time_zone: 'Asia/Tokyo',
      filter_0: 'reporting',
    });
    expect(result.sql).toContain(
      "FORMAT_DATE('%F', DATE(`recorded_at`, @time_zone)) AS period"
    );
  });

  it.each([
    { operator: 'equals', sqlOperator: '=' },
    { operator: 'not-equals', sqlOperator: '!=' },
    { operator: 'less-than', sqlOperator: '<' },
    { operator: 'less-than-or-equal', sqlOperator: '<=' },
    { operator: 'greater-than', sqlOperator: '>' },
    { operator: 'greater-than-or-equal', sqlOperator: '>=' },
  ] as const)('binds a $operator comparison', ({ operator, sqlOperator }) => {
    const source = {
      ...plan().source,
      filters: [{ column: 'category', operator, value: "x' OR '1'='1" }],
    };

    const result = buildSectionQuery({ ...plan(), source });

    expect(result.sql).toContain(`AND \`category\` ${sqlOperator} @filter_0`);
    expect(result.sql).not.toContain("x' OR '1'='1");
    expect(result.params).toEqual({
      period_start: '2026-09-01',
      period_end: '2026-09-30',
      time_zone: 'Asia/Tokyo',
      filter_0: "x' OR '1'='1",
    });
  });

  it.each([
    { operator: 'in', sqlOperator: 'IN' },
    { operator: 'not-in', sqlOperator: 'NOT IN' },
  ] as const)(
    'binds each member of a $operator set',
    ({ operator, sqlOperator }) => {
      const source = {
        ...plan().source,
        filters: [
          { column: 'category', operator, values: ['one', 'two', 'three'] },
        ],
      };

      const result = buildSectionQuery({ ...plan(), source });

      expect(result.sql).toContain(
        `AND \`category\` ${sqlOperator} (@filter_0_0, @filter_0_1, @filter_0_2)`
      );
      expect(result.params).toEqual({
        period_start: '2026-09-01',
        period_end: '2026-09-30',
        time_zone: 'Asia/Tokyo',
        filter_0_0: 'one',
        filter_0_1: 'two',
        filter_0_2: 'three',
      });
    }
  );

  it.each([
    { operator: 'is-null', sqlOperator: 'IS NULL' },
    { operator: 'is-not-null', sqlOperator: 'IS NOT NULL' },
  ] as const)(
    'builds a $operator null check without a value',
    ({ operator, sqlOperator }) => {
      const source = {
        ...plan().source,
        filters: [{ column: 'category', operator }],
      };

      const result = buildSectionQuery({ ...plan(), source });

      expect(result.sql).toContain(`AND \`category\` ${sqlOperator}`);
      expect(result.params).toEqual({
        period_start: '2026-09-01',
        period_end: '2026-09-30',
        time_zone: 'Asia/Tokyo',
      });
    }
  );

  it('joins two filters and applies the same clause to period bounds', () => {
    const filters: SourceFilter[] = [
      { column: 'category', operator: 'equals', value: 'reporting' },
      { column: 'amount', operator: 'greater-than', value: 0 },
    ];
    const source = { ...plan().source, filters };

    const section = buildSectionQuery({ ...plan(), source });
    const bounds = buildPeriodBoundsQuery(source, 'Asia/Tokyo');

    expect(section.sql).toContain(
      'AND `category` = @filter_0\nAND `amount` > @filter_1'
    );
    expect(bounds.sql).toContain(
      'WHERE `category` = @filter_0\nAND `amount` > @filter_1'
    );
    expect(section.params).toMatchObject({
      filter_0: 'reporting',
      filter_1: 0,
    });
    expect(bounds.params).toEqual({
      time_zone: 'Asia/Tokyo',
      filter_0: 'reporting',
      filter_1: 0,
    });
  });

  it('transforms row values in filtered before sum and latest reductions', () => {
    const section = plan();
    section.measures = [
      {
        column: 'amount',
        reduction: 'sum',
        transform: 'absolute',
        compares: false,
      },
      {
        column: 'amount',
        reduction: 'latest',
        transform: 'negate',
        compares: false,
      },
    ];

    const result = buildSectionQuery(section);

    expect(result.sql).toContain(
      'ABS(CAST(`amount` AS FLOAT64)) AS value_0, -(CAST(`amount` AS FLOAT64)) AS value_1\nFROM'
    );
    expect(result.sql).toContain('SUM(value_0)');
    expect(result.sql).toContain(
      'ARRAY_AGG(STRUCT(source_time, value_1) ORDER BY source_time DESC LIMIT 1)'
    );
    expect(result.sql).toContain(
      'COUNT(DISTINCT IF(source_time = latest_time, TO_JSON_STRING(value_1), NULL))'
    );
  });
});

describe('buildPeriodBoundsQuery', () => {
  it.each([
    {
      time: 'recorded_on' as const,
      expression:
        'DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone)',
    },
    {
      time: { column: 'recorded_at', type: 'timestamp' as const },
      expression: 'DATE(`recorded_at`, @time_zone)',
    },
  ])('projects calendar bounds as JSON-safe dates', ({ time, expression }) => {
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
  });
});
