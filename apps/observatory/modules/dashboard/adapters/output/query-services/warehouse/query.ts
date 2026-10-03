import type { WarehouseQueryParams } from '../../../../../../infrastructure/warehouse';
import {
  PeriodGrain,
  type SourceDefinition,
  type TimeBinding,
  type ValueTransform,
} from '../../../../domain';
import { qualifiedView, quoteIdentifier } from './identifier';

const periodKeyFormats: Record<PeriodGrain, string> = {
  [PeriodGrain.MONTH]: '%Y-%m',
  [PeriodGrain.WEEK]: '%G-W%V',
  [PeriodGrain.DAY]: '%F',
};

export function periodKeyExpression(
  grain: PeriodGrain,
  calendarDate: string
): string {
  return `FORMAT_DATE('${periodKeyFormats[grain]}', ${calendarDate})`;
}

export const PERIOD_START_PARAMETER = 'period_start';
export const PERIOD_END_PARAMETER = 'period_end';
export const TIME_ZONE_PARAMETER = 'time_zone';
export const FIRST_DATE_ALIAS = 'first_date';
export const LAST_DATE_ALIAS = 'last_date';

export interface BuiltQuery {
  sql: string;
  params: WarehouseQueryParams;
}

export function valueExpression(
  column: string,
  transform?: ValueTransform
): string {
  const value = `CAST(${quoteIdentifier(column)} AS FLOAT64)`;
  if (transform === 'negate') {
    return `-(${value})`;
  }
  if (transform === 'absolute') {
    return `ABS(${value})`;
  }
  return value;
}

export function buildSourceFilters(source: SourceDefinition): {
  clauses: string[];
  params: WarehouseQueryParams;
} {
  const filters = source.filters ?? [];
  const clauses = filters.map((filter, filterIndex) => {
    const column = quoteIdentifier(filter.column);
    if ('value' in filter) {
      const operators = {
        equals: '=',
        'not-equals': '!=',
        'less-than': '<',
        'less-than-or-equal': '<=',
        'greater-than': '>',
        'greater-than-or-equal': '>=',
      };
      return `${column} ${operators[filter.operator]} @filter_${filterIndex}`;
    }
    if ('values' in filter) {
      const parameters = filter.values.map(
        (_, valueIndex) => `@filter_${filterIndex}_${valueIndex}`
      );
      const operator = filter.operator === 'in' ? 'IN' : 'NOT IN';
      return `${column} ${operator} (${parameters.join(', ')})`;
    }
    return `${column} ${filter.operator === 'is-null' ? 'IS NULL' : 'IS NOT NULL'}`;
  });
  const params = filters.reduce<WarehouseQueryParams>(
    (parameters, filter, filterIndex) => {
      if ('value' in filter) {
        parameters[`filter_${filterIndex}`] = filter.value;
        return parameters;
      }
      if ('values' in filter) {
        return filter.values.reduce<WarehouseQueryParams>(
          (setParameters, value, valueIndex) => {
            setParameters[`filter_${filterIndex}_${valueIndex}`] = value;
            return setParameters;
          },
          parameters
        );
      }
      return parameters;
    },
    {}
  );
  return { clauses, params };
}

export function timeColumn(time: TimeBinding): string {
  if (typeof time === 'string') {
    return time;
  }
  return 'date' in time ? time.date : time.column;
}

export function calendarDateExpression(time: TimeBinding): string {
  const quoted = quoteIdentifier(timeColumn(time));
  if (typeof time !== 'string' && 'date' in time) {
    return quoted;
  }
  return typeof time === 'string'
    ? `DATE(TIMESTAMP(DATETIME(${quoted}), @${TIME_ZONE_PARAMETER}), @${TIME_ZONE_PARAMETER})`
    : `DATE(${quoted}, @${TIME_ZONE_PARAMETER})`;
}

export function buildPeriodBoundsQuery(
  source: SourceDefinition,
  timeZone: string
): BuiltQuery {
  const calendarDate = calendarDateExpression(source.time);
  const filters = buildSourceFilters(source);
  return {
    sql: [
      `SELECT FORMAT_DATE('%F', MIN(${calendarDate})) AS ${FIRST_DATE_ALIAS},`,
      `FORMAT_DATE('%F', MAX(${calendarDate})) AS ${LAST_DATE_ALIAS}`,
      `FROM ${qualifiedView(source.dataset, source.view)}`,
      ...(filters.clauses.length === 0
        ? []
        : [`WHERE ${filters.clauses.join('\nAND ')}`]),
      'HAVING COUNT(*) > 0',
    ].join('\n'),
    params: { [TIME_ZONE_PARAMETER]: timeZone, ...filters.params },
  };
}
