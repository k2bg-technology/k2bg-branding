import type { CategoryItem, CategoryValue } from './categoryValue';

export function categoryItemsFromBuckets(
  buckets: {
    period: string;
    cells: { category: CategoryValue; values: (number | null)[] }[];
  }[]
): CategoryItem[] {
  const categories = Array.from(
    new Set(
      buckets.flatMap((bucket) => bucket.cells.map((cell) => cell.category))
    )
  );
  return categories.map((category) => {
    const values = buckets.map(
      (bucket) =>
        bucket.cells.find((cell) => cell.category === category)?.values[0] ??
        null
    );
    const measured = values.filter((value): value is number => value !== null);
    return {
      category,
      values,
      rank:
        measured.length === 0
          ? null
          : measured.reduce((sum, value) => sum + value, 0),
    };
  });
}
