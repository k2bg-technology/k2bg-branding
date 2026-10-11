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
}

export type WidenedPivot =
  | {
      status: 'ready';
      series: { id: string; label: string }[];
      buckets: { period: string; values: (number | null)[] }[];
    }
  | { status: 'too-many-series'; count: number; maximum: number };

export function widenPivot(
  buckets: PivotBucket[],
  { topN, maximum }: WidenPivotOptions,
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
  return {
    status: 'ready',
    series: names.map((label, index) => ({
      id: index < kept.length ? `category-${index}` : 'remainder',
      label,
    })),
    buckets: buckets.map((bucket, index) => ({
      period: bucket.period,
      values: [
        ...kept.map((item) => item.values[index] ?? null),
        ...(remainder === null ? [] : [remainder[index] ?? null]),
      ],
    })),
  };
}
