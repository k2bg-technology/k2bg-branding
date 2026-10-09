import { describe, expect, it } from 'vitest';

import type { ReadinessQueryPlan } from '../../../../domain';
import { RepositoryError } from '../../../shared';
import { buildReadinessQuery } from './readiness';

const dateRange = { firstDate: '2026-08-15', lastDate: '2026-08-15' };

describe('buildReadinessQuery', () => {
  it('builds the date-column query', () => {
    const plan: ReadinessQueryPlan = {
      sectionId: 'headline',
      source: { dataset: 'metrics', view: 'daily', time: 'recorded_on' },
      timeZone: 'Asia/Tokyo',
      dateRange: { firstDate: '2026-08-01', lastDate: '2026-08-31' },
      column: 'is_complete',
    };
    expect(buildReadinessQuery(plan)).toEqual({
      sql: [
        'WITH filtered AS (',
        'SELECT `is_complete` AS ready, `recorded_on` AS source_time',
        'FROM `metrics.daily`',
        'WHERE DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(TIMESTAMP(DATETIME(`recorded_on`), @time_zone), @time_zone) <= CAST(@period_end AS DATE)',
        ')',
        'SELECT CAST(COUNTIF(ready IS NOT TRUE) AS FLOAT64) AS not_ready_count',
        'FROM filtered',
        'WHERE source_time = (SELECT MAX(source_time) FROM filtered)',
      ].join('\n'),
      params: {
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        time_zone: 'Asia/Tokyo',
      },
    });
  });

  it('builds the timestamp query with a source filter', () => {
    const plan: ReadinessQueryPlan = {
      sectionId: 'headline',
      source: {
        dataset: 'home',
        view: 'readings',
        time: { column: 'recorded_at', type: 'timestamp' },
        filters: [{ column: 'location', operator: 'equals', value: 'primary' }],
      },
      timeZone: 'Asia/Tokyo',
      dateRange,
      column: 'is_location_primary',
    };
    expect(buildReadinessQuery(plan)).toEqual({
      sql: [
        'WITH filtered AS (',
        'SELECT `is_location_primary` AS ready, `recorded_at` AS source_time',
        'FROM `home.readings`',
        'WHERE DATE(`recorded_at`, @time_zone) >= CAST(@period_start AS DATE)',
        'AND DATE(`recorded_at`, @time_zone) <= CAST(@period_end AS DATE)',
        'AND `location` = @filter_0',
        ')',
        'SELECT CAST(COUNTIF(ready IS NOT TRUE) AS FLOAT64) AS not_ready_count',
        'FROM filtered',
        'WHERE source_time = (SELECT MAX(source_time) FROM filtered)',
      ].join('\n'),
      params: {
        period_start: '2026-08-15',
        period_end: '2026-08-15',
        time_zone: 'Asia/Tokyo',
        filter_0: 'primary',
      },
    });
  });

  it('builds the date-and-hour query', () => {
    const plan: ReadinessQueryPlan = {
      sectionId: 'headline',
      source: {
        dataset: 'home',
        view: 'readings',
        time: { date: 'reading_date', hour: 'reading_hour' },
      },
      timeZone: 'Asia/Tokyo',
      dateRange,
      column: 'is_calibrated',
    };
    expect(buildReadinessQuery(plan)).toEqual({
      sql: [
        'WITH filtered AS (',
        "SELECT `is_calibrated` AS ready, DATETIME(`reading_date`, TIME(IF(`reading_hour` BETWEEN 0 AND 23, `reading_hour`, ERROR('source.time.hour must be an integer from 0 through 23')), 0, 0)) AS source_time",
        'FROM `home.readings`',
        'WHERE `reading_date` >= CAST(@period_start AS DATE)',
        'AND `reading_date` <= CAST(@period_end AS DATE)',
        "AND IF(`reading_hour` BETWEEN 0 AND 23, `reading_hour`, ERROR('source.time.hour must be an integer from 0 through 23')) IS NOT NULL",
        ')',
        'SELECT CAST(COUNTIF(ready IS NOT TRUE) AS FLOAT64) AS not_ready_count',
        'FROM filtered',
        'WHERE source_time = (SELECT MAX(source_time) FROM filtered)',
      ].join('\n'),
      params: {
        period_start: '2026-08-15',
        period_end: '2026-08-15',
        time_zone: 'Asia/Tokyo',
      },
    });
  });

  it('rejects an unsafe readiness column', () => {
    expect(() =>
      buildReadinessQuery({
        sectionId: 'headline',
        source: { dataset: 'metrics', view: 'daily', time: 'recorded_on' },
        timeZone: 'Asia/Tokyo',
        dateRange,
        column: 'ready; DROP TABLE rows',
      })
    ).toThrow(RepositoryError);
  });
});
