const BOUNDARY_COUNT = 1;
const SIBLING_COUNT = 1;

export interface UsePaginationProps {
  count: number;
  currentIndex: number;
  boundaryCount?: number;
  siblingCount?: number;
}

/**
 * @see {@link https://github.com/mui/material-ui/blob/master/packages/mui-material/src/usePagination/usePagination.js}
 *
 * @returns example [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
 */
export function usePagination(props: UsePaginationProps) {
  const {
    count,
    currentIndex,
    boundaryCount = BOUNDARY_COUNT,
    siblingCount = SIBLING_COUNT,
  } = props;

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(
    Math.max(count - boundaryCount + 1, boundaryCount + 1),
    count
  );

  const siblingsStart = Math.max(
    Math.min(
      // Natural start
      currentIndex - siblingCount,
      // Lower boundary when page is high
      count - boundaryCount - siblingCount * 2 - 1
    ),
    // Greater than startPages
    boundaryCount + 2
  );

  const siblingsEnd = Math.min(
    Math.max(
      // Natural end
      currentIndex + siblingCount,
      // Upper boundary when page is low
      boundaryCount + siblingCount * 2 + 2
    ),
    // Less than endPages
    endPages.length > 0 ? endPages[0] - 2 : count - 1
  );

  // Basic list of items to render
  // for example itemList = [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
  const itemList = [
    ...startPages,

    // Start ellipsis
    ...(siblingsStart > boundaryCount + 2
      ? ['start-ellipsis']
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),

    // Sibling pages
    ...range(siblingsStart, siblingsEnd),

    // End ellipsis
    ...(siblingsEnd < count - boundaryCount - 1
      ? ['end-ellipsis']
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),

    ...endPages,
  ];

  return itemList;
}
