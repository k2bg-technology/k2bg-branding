import { describe, expect, it } from 'vitest';

import { getPaginationItems } from './getPaginationItems';

describe('pagination ranges', () => {
  it.each([
    {
      count: 1,
      currentPage: 1,
      expectedItems: [1],
    },
    {
      count: 5,
      currentPage: 1,
      expectedItems: [1, 2, 3, 4, 5],
    },
    {
      count: 10,
      currentPage: 1,
      expectedItems: [1, 2, 3, 4, 5, 'end-ellipsis', 10],
    },
    {
      count: 10,
      currentPage: 5,
      expectedItems: [1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10],
    },
    {
      count: 10,
      currentPage: 10,
      expectedItems: [1, 'start-ellipsis', 6, 7, 8, 9, 10],
    },
    {
      count: 20,
      currentPage: 10,
      boundaryCount: 2,
      siblingCount: 2,
      expectedItems: [
        1,
        2,
        'start-ellipsis',
        8,
        9,
        10,
        11,
        12,
        'end-ellipsis',
        19,
        20,
      ],
    },
    {
      count: 20,
      currentPage: 4,
      boundaryCount: 2,
      siblingCount: 2,
      expectedItems: [1, 2, 3, 4, 5, 6, 7, 8, 'end-ellipsis', 19, 20],
    },
    {
      count: 20,
      currentPage: 17,
      boundaryCount: 2,
      siblingCount: 2,
      expectedItems: [1, 2, 'start-ellipsis', 13, 14, 15, 16, 17, 18, 19, 20],
    },
  ])(
    'returns visible pages and ellipses for page $currentPage of $count',
    ({ expectedItems, ...props }) => {
      const sut = getPaginationItems(props);

      expect(sut).toEqual(expectedItems);
    }
  );
});
