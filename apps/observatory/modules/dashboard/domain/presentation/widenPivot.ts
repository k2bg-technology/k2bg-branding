import type { TopN } from '../definition';
import { categoryItemsFromBuckets } from './categoryItemsFromBuckets';
import { categoryLabels } from './categoryLabels';
import type { CategoryValue } from './categoryValue';
import { selectTopN } from './selectTopN';

export const MAXIMUM_PIVOT_SERIES = 12;

export interface PivotBucket {
  period: string;
  cells: { category: CategoryValue; values: (number | null)[] }[];
}

export interface WidenPivotOptions {
  topN: TopN | null;
  maximum: number;
  warmUp?: PivotBucket[];
  base?: PivotBucket | null;
}

export type WidenedPivot =
  | {
      status: 'ready';
      series: { id: string; label: string }[];
      buckets: { period: string; values: (number | null)[] }[];
      warmUpBuckets?: { period: string; values: (number | null)[] }[];
      baseValues?: (number | null)[];
    }
  | { status: 'too-many-series'; count: number; maximum: number };

export function widenPivot(
  buckets: PivotBucket[],
  { topN, maximum, warmUp, base }: WidenPivotOptions,
  labels: { nullCategory: string },
  context: { sectionId: string }
): WidenedPivot {
  const items = categoryItemsFromBuckets(buckets);
  if (topN === null && items.length > maximum) {
    return { status: 'too-many-series', count: items.length, maximum };
  }
  categoryLabels(items, topN?.otherLabel ?? null, labels, context);
  const { kept, remainder } = selectTopN(items, topN?.count ?? maximum);
  const names = categoryLabels(
    kept,
    remainder === null ? null : (topN?.otherLabel ?? null),
    labels,
    context
  );
  const series = names.map((label, index) => ({
    id: index < kept.length ? `category-${index}` : 'remainder',
    label,
  }));
  const keptCategories = kept.map((item) => item.category);
  return {
    status: 'ready',
    series,
    buckets: buckets.map((bucket) =>
      widenBucket(bucket, keptCategories, remainder !== null)
    ),
    ...(warmUp === undefined
      ? {}
      : {
          warmUpBuckets: warmUp.map((bucket) =>
            widenBucket(bucket, keptCategories, remainder !== null)
          ),
        }),
    ...(base === undefined
      ? {}
      : {
          baseValues:
            base === null
              ? series.map(() => null)
              : widenBucket(base, keptCategories, remainder !== null).values,
        }),
  };
}

function widenBucket(
  bucket: PivotBucket,
  kept: (string | null)[],
  hasRemainder: boolean
) {
  const measured = bucket.cells
    .filter((cell) => !kept.includes(cell.category))
    .map((cell) => cell.values[0] ?? null)
    .filter((value) => value !== null);
  const remainder =
    measured.length === 0
      ? null
      : measured.reduce((total, value) => total + value, 0);
  return {
    period: bucket.period,
    values: [
      ...kept.map(
        (category) =>
          bucket.cells.find((cell) => cell.category === category)?.values[0] ??
          null
      ),
      ...(hasRemainder ? [remainder] : []),
    ],
  };
}
