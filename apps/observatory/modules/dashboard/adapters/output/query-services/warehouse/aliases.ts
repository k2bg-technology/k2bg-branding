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
