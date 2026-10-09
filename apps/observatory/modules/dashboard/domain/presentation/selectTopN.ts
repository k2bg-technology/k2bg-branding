import { type CategoryItem, compareCategoryValues } from './categoryValue';

export interface TopNSelection {
  kept: CategoryItem[];
  remainder: (number | null)[] | null;
}

export function selectTopN(
  items: CategoryItem[],
  count: number
): TopNSelection {
  const ranked = [...items].sort((first, second) => {
    if (first.rank === null)
      return second.rank === null
        ? compareCategoryValues(first.category, second.category)
        : 1;
    if (second.rank === null) return -1;
    return (
      second.rank - first.rank ||
      compareCategoryValues(first.category, second.category)
    );
  });
  const kept = ranked.slice(0, count);
  const folded = ranked.slice(count);
  if (folded.length === 0) return { kept, remainder: null };
  const remainder = Array.from(
    { length: folded[0].values.length },
    (_, index) => {
      const measured = folded
        .map((item) => item.values[index])
        .filter((value): value is number => value !== null);
      return measured.length === 0
        ? null
        : measured.reduce((sum, value) => sum + value, 0);
    }
  );
  return { kept, remainder };
}
