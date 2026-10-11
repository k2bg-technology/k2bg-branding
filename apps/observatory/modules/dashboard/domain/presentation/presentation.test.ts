import { describe, expect, it } from 'vitest';

import { DuplicateCategoryLabelError } from '../errors';
import { categoryItemsFromBuckets } from './categoryItemsFromBuckets';
import { categoryLabels } from './categoryLabels';
import type { CategoryItem } from './categoryValue';
import { orderCategories } from './orderCategories';
import { selectTopN } from './selectTopN';
import { widenPivot } from './widenPivot';

const items: CategoryItem[] = [
  { category: 'A', rank: 10, values: [10, 1], sortKey: 2 },
  { category: 'B', rank: 5, values: [5, null], sortKey: 1 },
  { category: 'C', rank: 3, values: [3, 2], sortKey: 3 },
  { category: 'D', rank: null, values: [null, 4], sortKey: null },
];

describe('widenPivot', () => {
  const buckets = [
    {
      period: '2026-01',
      cells: [
        { category: 'food', values: [10] },
        { category: 'rent', values: [20] },
      ],
    },
    { period: '2026-03', cells: [{ category: 'food', values: [5] }] },
  ];
  const labels = { nullCategory: 'None' };
  const context = { sectionId: 'trend' };

  it.each([
    {
      topN: { count: 1, otherLabel: 'Other' },
      series: [
        { id: 'category-0', label: 'rent' },
        { id: 'remainder', label: 'Other' },
      ],
    },
    {
      topN: null,
      series: [
        { id: 'category-0', label: 'rent' },
        { id: 'category-1', label: 'food' },
      ],
    },
    {
      topN: { count: 5, otherLabel: 'Other' },
      series: [
        { id: 'category-0', label: 'rent' },
        { id: 'category-1', label: 'food' },
      ],
    },
  ])('orders and folds categories for $topN', ({ topN, series }) => {
    expect(widenPivot(buckets, { topN, maximum: 12 }, labels, context)).toEqual(
      {
        status: 'ready',
        series,
        buckets: [
          { period: '2026-01', values: [20, 10] },
          { period: '2026-03', values: [null, 5] },
        ],
      }
    );
  });

  it('reports thirteen categories without topN and keeps twelve', () => {
    const cells = Array.from({ length: 13 }, (_, index) => ({
      category: `c${String(index + 1).padStart(2, '0')}`,
      values: [1],
    }));
    expect(
      widenPivot(
        [{ period: '2026-01', cells }],
        { topN: null, maximum: 12 },
        labels,
        context
      )
    ).toEqual({
      status: 'too-many-series',
      count: 13,
      maximum: 12,
    });
    const twelve = widenPivot(
      [{ period: '2026-01', cells: cells.slice(0, 12) }],
      { topN: null, maximum: 12 },
      labels,
      context
    );
    expect(twelve.status).toBe('ready');
    if (twelve.status === 'ready') expect(twelve.series).toHaveLength(12);
    const folded = widenPivot(
      [{ period: '2026-01', cells }],
      { topN: { count: 2, otherLabel: 'Other' }, maximum: 12 },
      labels,
      context
    );
    expect(folded.status).toBe('ready');
    if (folded.status === 'ready')
      expect(folded.series.map(({ id }) => id)).toEqual([
        'category-0',
        'category-1',
        'remainder',
      ]);
  });

  it('labels null and rejects a folded category with the remainder name', () => {
    const named = widenPivot(
      [
        {
          period: '2026-01',
          cells: [
            { category: null, values: [20] },
            { category: 'food', values: [10] },
          ],
        },
      ],
      { topN: null, maximum: 12 },
      labels,
      context
    );
    expect(named.status).toBe('ready');
    if (named.status === 'ready')
      expect(named.series.map(({ label }) => label)).toEqual(['None', 'food']);
    expect(() =>
      widenPivot(
        [
          {
            period: '2026-01',
            cells: [
              { category: 'food', values: [20] },
              { category: 'Other', values: [10] },
            ],
          },
        ],
        { topN: { count: 1, otherLabel: 'Other' }, maximum: 12 },
        labels,
        context
      )
    ).toThrow(DuplicateCategoryLabelError);
  });
});

describe('category presentation', () => {
  it('keeps the largest categories and folds every other value into a last remainder', () => {
    expect(selectTopN(items, 2)).toEqual({
      kept: items.slice(0, 2),
      remainder: [3, 6],
    });
    expect(selectTopN(items, 1).remainder).toEqual([8, 6]);
    expect(selectTopN(items, 4)).toEqual({ kept: items, remainder: null });
    expect(selectTopN(items, 3).remainder).toEqual([null, 4]);
    expect(
      selectTopN(
        [
          { category: 'A', rank: 2, values: [2] },
          { category: null, rank: 2, values: [2] },
        ],
        1
      ).kept[0].category
    ).toBe('A');
    expect(
      selectTopN(
        [
          { category: 'B', rank: 5, values: [5] },
          { category: 'A', rank: 5, values: [5] },
        ],
        2
      ).kept.map((item) => item.category)
    ).toEqual(['A', 'B']);
    expect(
      selectTopN([{ category: 'X', rank: null, values: [null, null] }], 0)
        .remainder
    ).toEqual([null, null]);
  });

  it('orders the selected set by value or sort key without moving the remainder', () => {
    expect(
      orderCategories([...items].reverse(), 'value-desc').map(
        (item) => item.category
      )
    ).toEqual(['A', 'B', 'C', 'D']);
    expect(
      orderCategories(items, {
        sortKey: { column: 'order', type: 'number' },
      }).map((item) => item.category)
    ).toEqual(['B', 'A', 'C', 'D']);
    expect(
      orderCategories(
        [
          { ...items[0], sortKey: 'b' },
          { ...items[1], sortKey: 'a' },
        ],
        { sortKey: { column: 'order', type: 'text' } }
      ).map((item) => item.category)
    ).toEqual(['B', 'A']);
    expect(
      orderCategories(
        [
          { ...items[1], sortKey: 1 },
          { ...items[0], sortKey: 1 },
        ],
        { sortKey: { column: 'order', type: 'number' } }
      ).map((item) => item.category)
    ).toEqual(['A', 'B']);
    expect(
      orderCategories(selectTopN(items, 2).kept, {
        sortKey: { column: 'order', type: 'number' },
      }).map((item) => item.category)
    ).toEqual(['B', 'A']);
  });

  it('spines pivot categories with null gaps and measured ranks', () => {
    expect(
      categoryItemsFromBuckets([
        {
          period: '2026-01',
          cells: [
            { category: 'food', values: [100] },
            { category: null, values: [20] },
            { category: 'unused', values: [null] },
          ],
        },
        { period: '2026-02', cells: [{ category: 'food', values: [null] }] },
      ])
    ).toEqual([
      { category: 'food', rank: 100, values: [100, null] },
      { category: null, rank: 20, values: [20, null] },
      { category: 'unused', rank: null, values: [null, null] },
    ]);
  });

  it('labels nulls and fails duplicate visible names', () => {
    const labels = { nullCategory: 'None' };
    const context = { sectionId: 'bars' };
    expect(
      categoryLabels(
        [
          { ...items[0], category: 'Rent' },
          { ...items[1], category: null },
        ],
        'Other',
        labels,
        context
      )
    ).toEqual(['Rent', 'None', 'Other']);
    expect(categoryLabels(items.slice(0, 1), null, labels, context)).toEqual([
      'A',
    ]);
    expect(() =>
      categoryLabels(
        [{ ...items[0], category: 'Other' }],
        'Other',
        labels,
        context
      )
    ).toThrow(DuplicateCategoryLabelError);
    expect(() =>
      categoryLabels(
        [
          { ...items[0], category: 'None' },
          { ...items[1], category: null },
        ],
        null,
        labels,
        context
      )
    ).toThrow(DuplicateCategoryLabelError);
    expect(() =>
      categoryLabels([{ ...items[0], category: 'None' }], null, labels, context)
    ).toThrow(DuplicateCategoryLabelError);
  });
});
