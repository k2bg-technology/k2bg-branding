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
export const CATEGORY_ALIAS = 'category';
export const SORT_KEY_ALIAS = 'sort_key';
export const SORT_KEY_DISTINCT_COUNT_ALIAS = 'sort_key_distinct_count';
