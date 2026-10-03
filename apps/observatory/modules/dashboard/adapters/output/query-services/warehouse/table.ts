import type { WarehouseQueryParams } from '../../../../../../infrastructure/warehouse';
import type { TableQueryPlan } from '../../../../domain';
import {
  cellColumnAlias,
  PAGE_COUNT_ALIAS,
  PAGE_NUMBER_ALIAS,
} from './aliases';
import { qualifiedView, quoteIdentifier } from './identifier';
import {
  type BuiltQuery,
  buildSourceFilters,
  calendarDateExpression,
  PERIOD_END_PARAMETER,
  PERIOD_START_PARAMETER,
  TIME_ZONE_PARAMETER,
  timeColumn,
  valueExpression,
} from './query';

export function buildTableQuery(plan: TableQueryPlan): BuiltQuery {
  const calendarDate = calendarDateExpression(plan.source.time);
  const filters = buildSourceFilters(plan.source);
  const aliases = plan.columns.map((_, index) => cellColumnAlias(index));
  const projections = plan.columns.map((column, index) => {
    const quoted = quoteIdentifier(column.column);
    const alias = cellColumnAlias(index);
    if (column.type === 'number') {
      return `${valueExpression(column.column, column.transform)} AS ${alias}`;
    }
    if (column.type === 'date') {
      return `FORMAT_DATE('%F', ${quoted}) AS ${alias}`;
    }
    if (column.type === 'timestamp') {
      return `CAST(UNIX_MILLIS(${quoted}) AS FLOAT64) AS ${alias}`;
    }
    return `CAST(${quoted} AS STRING) AS ${alias}`;
  });
  const sortAlias =
    plan.sort === null ? null : cellColumnAlias(plan.sort.columnIndex);
  const sortDirection = plan.sort?.direction === 'descending' ? 'DESC' : 'ASC';
  const order =
    sortAlias === null
      ? [
          'source_time DESC NULLS LAST',
          ...aliases.map((alias) => `${alias} ASC NULLS LAST`),
        ]
      : [
          `${sortAlias} ${sortDirection} NULLS LAST`,
          ...aliases
            .filter((alias) => alias !== sortAlias)
            .map((alias) => `${alias} ASC NULLS LAST`),
        ];
  const projected = [
    'WITH projected AS (',
    `SELECT ${[`${quoteIdentifier(timeColumn(plan.source.time))} AS source_time`, ...projections].join(', ')}`,
    `FROM ${qualifiedView(plan.source.dataset, plan.source.view)}`,
    `WHERE ${calendarDate} >= CAST(@${PERIOD_START_PARAMETER} AS DATE)`,
    `AND ${calendarDate} <= CAST(@${PERIOD_END_PARAMETER} AS DATE)`,
    ...filters.clauses.map((clause) => `AND ${clause}`),
    ')',
  ];
  const params: WarehouseQueryParams = {
    [PERIOD_START_PARAMETER]: plan.dateRange.firstDate,
    [PERIOD_END_PARAMETER]: plan.dateRange.lastDate,
    [TIME_ZONE_PARAMETER]: plan.timeZone,
    ...filters.params,
  };
  if ('limit' in plan.rows) {
    return {
      sql: projected
        .concat([
          `SELECT ${aliases.join(', ')}`,
          'FROM projected',
          `ORDER BY ${order.join(', ')}`,
          'LIMIT @row_limit',
        ])
        .join('\n'),
      params: { ...params, row_limit: plan.rows.limit },
    };
  }
  return {
    sql: projected
      .slice(0, -1)
      .concat([
        '),',
        'numbered AS (',
        `SELECT ${aliases.join(', ')}, ROW_NUMBER() OVER (ORDER BY ${order.join(', ')}) AS row_position, COUNT(*) OVER () AS row_count`,
        'FROM projected',
        '),',
        'paged AS (',
        'SELECT *, LEAST((@page - 1) * @page_size, DIV(row_count - 1, @page_size) * @page_size) AS page_offset',
        'FROM numbered',
        ')',
        `SELECT ${aliases.join(', ')}, CAST(DIV(page_offset, @page_size) + 1 AS FLOAT64) AS ${PAGE_NUMBER_ALIAS}, CAST(DIV(row_count - 1, @page_size) + 1 AS FLOAT64) AS ${PAGE_COUNT_ALIAS}`,
        'FROM paged',
        'WHERE row_position > page_offset AND row_position <= page_offset + @page_size',
        'ORDER BY row_position',
      ])
      .join('\n'),
    params: { ...params, page: plan.rows.page, page_size: plan.rows.pageSize },
  };
}
