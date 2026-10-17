export function valueColumnAlias(index: number): string {
  return `value_${index}`;
}

export function distinctCountAlias(index: number): string {
  return `distinct_count_${index}`;
}

export function cellColumnAlias(index: number): string {
  return `cell_${index}`;
}

export const PAGE_NUMBER_ALIAS = 'page_number';
export const PAGE_COUNT_ALIAS = 'page_count';
export const NOT_READY_COUNT_ALIAS = 'not_ready_count';
export const CATEGORY_ALIAS = 'category';
export const SORT_KEY_ALIAS = 'sort_key';
export const SORT_KEY_DISTINCT_COUNT_ALIAS = 'sort_key_distinct_count';
export const GROUP_ALIAS = 'group_key';
export const ROW_KEY_ALIAS = 'row_key';
export const COLUMN_KEY_ALIAS = 'column_key';
export const ROW_RANK_ALIAS = 'row_rank';
export const COLUMN_RANK_ALIAS = 'column_rank';
export const CELL_LIMIT_PARAMETER = 'cell_limit';
export const X_VALUE_ALIAS = 'x_value';
export const Y_VALUE_ALIAS = 'y_value';
export const SERIES_ALIAS = 'series_key';
