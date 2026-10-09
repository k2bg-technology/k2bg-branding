import type { CategoryOrder } from '../definition';
import {
  type CategoryItem,
  compareCategoryValues,
  type SortKeyValue,
} from './categoryValue';

function compareNullableValues(first: SortKeyValue, second: SortKeyValue) {
  if (first === null) return second === null ? 0 : 1;
  if (second === null) return -1;
  if (first < second) return -1;
  if (first > second) return 1;
  return 0;
}

export function orderCategories(
  items: CategoryItem[],
  order: CategoryOrder
): CategoryItem[] {
  return [...items].sort((first, second) => {
    if (order === 'value-desc') {
      if (first.rank === null)
        return second.rank === null
          ? compareCategoryValues(first.category, second.category)
          : 1;
      if (second.rank === null) return -1;
      return (
        second.rank - first.rank ||
        compareCategoryValues(first.category, second.category)
      );
    }
    return (
      compareNullableValues(first.sortKey ?? null, second.sortKey ?? null) ||
      compareCategoryValues(first.category, second.category)
    );
  });
}
