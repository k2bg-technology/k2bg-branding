const BOUNDARY_COUNT = 1;
const SIBLING_COUNT = 1;

function getStartTransitionItems(
  siblingsStart: number,
  boundaryCount: number,
  count: number
) {
  if (siblingsStart > boundaryCount + 2) {
    return ['start-ellipsis'];
  }
  if (boundaryCount + 1 < count - boundaryCount) {
    return [boundaryCount + 1];
  }
  return [];
}

function getEndTransitionItems(
  siblingsEnd: number,
  boundaryCount: number,
  count: number
) {
  if (siblingsEnd < count - boundaryCount - 1) {
    return ['end-ellipsis'];
  }
  if (count - boundaryCount > boundaryCount) {
    return [count - boundaryCount];
  }
  return [];
}

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
      currentIndex - siblingCount,
      count - boundaryCount - siblingCount * 2 - 1
    ),
    boundaryCount + 2
  );

  const siblingsEnd = Math.min(
    Math.max(currentIndex + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1
  );

  const itemList = [
    ...startPages,

    ...getStartTransitionItems(siblingsStart, boundaryCount, count),

    ...range(siblingsStart, siblingsEnd),

    ...getEndTransitionItems(siblingsEnd, boundaryCount, count),

    ...endPages,
  ];

  return itemList;
}
