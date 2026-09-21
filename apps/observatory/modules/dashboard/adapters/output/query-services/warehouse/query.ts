import type { WarehouseQueryParams } from '../../../../../../infrastructure/warehouse';
import type { SourceDefinition, TimeBinding } from '../../../../domain';
import { qualifiedView, quoteIdentifier } from './identifier';

export const PERIOD_START_PARAMETER = 'period_start';
export const PERIOD_END_PARAMETER = 'period_end';
export const TIME_ZONE_PARAMETER = 'time_zone';
export const FIRST_DATE_ALIAS = 'first_date';
export const LAST_DATE_ALIAS = 'last_date';

export interface BuiltQuery {
  sql: string;
  params: WarehouseQueryParams;
}

export function timeColumn(time: TimeBinding): string {
  return typeof time === 'string' ? time : time.column;
}

export function calendarDateExpression(time: TimeBinding): string {
  const quoted = quoteIdentifier(timeColumn(time));
  return typeof time === 'string'
    ? `DATE(TIMESTAMP(DATETIME(${quoted}), @${TIME_ZONE_PARAMETER}), @${TIME_ZONE_PARAMETER})`
    : `DATE(${quoted}, @${TIME_ZONE_PARAMETER})`;
}

export function buildPeriodBoundsQuery(
  source: SourceDefinition,
  timeZone: string
): BuiltQuery {
  const calendarDate = calendarDateExpression(source.time);
  return {
    sql: [
      `SELECT FORMAT_DATE('%F', MIN(${calendarDate})) AS ${FIRST_DATE_ALIAS},`,
      `FORMAT_DATE('%F', MAX(${calendarDate})) AS ${LAST_DATE_ALIAS}`,
      `FROM ${qualifiedView(source.dataset, source.view)}`,
      'HAVING COUNT(*) > 0',
    ].join('\n'),
    params: { [TIME_ZONE_PARAMETER]: timeZone },
  };
}
