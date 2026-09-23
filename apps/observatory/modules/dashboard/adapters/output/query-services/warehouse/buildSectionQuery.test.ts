import { describe, expect, it } from 'vitest';

import type { SectionQueryPlan } from '../../../../domain';
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
    const period = Period.parse('2026-09');
    if (period === null) {
      throw new Error('Expected fixture period to parse');
    }

    const result = buildSectionQuery(
      planSection(dashboard.sections[0], period, dashboard.timeZone)
    );

    expect(result.params).toEqual({
      period_start: '2026-08-01',
      period_end: '2026-09-30',
      time_zone: 'Asia/Tokyo',
    });
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
