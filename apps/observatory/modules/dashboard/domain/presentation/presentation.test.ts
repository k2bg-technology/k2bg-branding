import { describe, expect, it } from 'vitest';

import { DuplicateCategoryLabelError } from '../errors';
import { categoryItemsFromBuckets } from './categoryItemsFromBuckets';
import { categoryLabels } from './categoryLabels';
import type { CategoryItem } from './categoryValue';
import { orderCategories } from './orderCategories';
import { selectTopN } from './selectTopN';

const items: CategoryItem[] = [
  { category: 'A', rank: 10, values: [10, 1], sortKey: 2 },
  { category: 'B', rank: 5, values: [5, null], sortKey: 1 },
  { category: 'C', rank: 3, values: [3, 2], sortKey: 3 },
  { category: 'D', rank: null, values: [null, 4], sortKey: null },
];

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
