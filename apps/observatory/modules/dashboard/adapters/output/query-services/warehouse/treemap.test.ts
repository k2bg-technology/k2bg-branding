import { describe, expect, it } from 'vitest';

import { Period, planTreemapParts } from '../../../../domain';
import sampleDashboard from '../../../../fixtures/sample-dashboard.json';
import { RepositoryError } from '../../../shared';
import { dashboardDefinitionSchema } from '../../definition-sources/file-system/schemas';
import { buildTreemapQuery } from './treemap';

const dashboard = dashboardDefinitionSchema.parse(sampleDashboard);
const section = dashboard.sections.find(
  (candidate) => candidate.id === 'category-tree'
);
if (section?.kind !== 'treemap') throw new Error('Expected treemap fixture');
const period = Period.parse('month', '2026-08');
if (period === null) throw new Error('Expected fixture period');
const plan = planTreemapParts(section, period, dashboard.timeZone);

describe('buildTreemapQuery', () => {
  it('builds the exact grouped treemap query', () => {
    const result = buildTreemapQuery(plan);

    expect(result).toEqual({
      sql: [
        'WITH filtered AS (',
        'SELECT CAST(`category_group` AS STRING) AS group_key, CAST(`category` AS STRING) AS category, ABS(CAST(`amount` AS FLOAT64)) AS value_0',
        'FROM `sample_dataset.entries`',
        'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
        ')',
        'SELECT group_key, category, CAST(SUM(value_0) AS FLOAT64) AS value_0',
        'FROM filtered',
        'GROUP BY group_key, category',
        'ORDER BY group_key, category',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
      },
    });
  });

  it('omits the group key without a group', () => {
    const result = buildTreemapQuery({ ...plan, group: null });

    expect(result.sql).toContain(
      'SELECT CAST(`category` AS STRING) AS category, ABS(CAST(`amount` AS FLOAT64)) AS value_0'
    );
    expect(result.sql).toContain(
      'SELECT category, CAST(SUM(value_0) AS FLOAT64) AS value_0'
    );
    expect(result.sql).toContain('GROUP BY category\nORDER BY category');
    expect(result.params).toEqual({
      period_start: '2026-08-01',
      period_end: '2026-08-31',
      time_zone: 'Asia/Tokyo',
    });
  });

  it('binds a control filter as a parameter', () => {
    const result = buildTreemapQuery({
      ...plan,
      source: {
        ...plan.source,
        filters: [
          { column: 'category', operator: 'equals', value: 'reporting' },
        ],
      },
    });

    expect(result.sql).toContain('AND `category` = @filter_0');
    expect(result.params.filter_0).toBe('reporting');
    expect(result.sql).not.toContain('reporting');
  });

  it('rejects an unsafe group identifier', () => {
    expect(() => buildTreemapQuery({ ...plan, group: 'bad-name' })).toThrow(
      RepositoryError
    );
  });
});
