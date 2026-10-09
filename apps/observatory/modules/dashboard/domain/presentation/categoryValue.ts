export type CategoryValue = string | null;
export type SortKeyValue = string | number | null;

export interface CategoryItem {
  category: CategoryValue;
  rank: number | null;
  sortKey?: SortKeyValue;
  values: (number | null)[];
}

export function compareCategoryValues(
  first: CategoryValue,
  second: CategoryValue
): number {
  if (first === null) return second === null ? 0 : 1;
  if (second === null) return -1;
  if (first < second) return -1;
  if (first > second) return 1;
  return 0;
}
