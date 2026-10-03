'use client';

import Link from 'next/link';
import { Pagination } from 'ui';

import type { DashboardLabels } from '../../modules/dashboard/domain';

interface Props {
  pageCount: number;
  currentPage: number;
  path: string;
  query: string;
  pageKey: string;
  labels: Pick<DashboardLabels, 'previousPage' | 'nextPage' | 'pagination'>;
}

export function TablePagination({
  pageCount,
  currentPage,
  path,
  query,
  pageKey,
  labels,
}: Props) {
  const href = (page: number) => {
    const nextQuery =
      page === 1
        ? query
        : [query, `${encodeURIComponent(pageKey)}=${page}`]
            .filter(Boolean)
            .join('&');
    return nextQuery === '' ? path : `${path}?${nextQuery}`;
  };
  return (
    <Pagination
      aria-label={labels.pagination}
      count={pageCount}
      currentIndex={currentPage}
      prevProps={{
        'aria-label': labels.previousPage,
        render:
          currentPage > 1 ? <Link href={href(currentPage - 1)} /> : undefined,
      }}
      nextProps={{
        'aria-label': labels.nextPage,
        render:
          currentPage < pageCount ? (
            <Link href={href(currentPage + 1)} />
          ) : undefined,
      }}
      renderItem={(index) => (
        <Pagination.Item
          selected={index === currentPage}
          render={<Link href={href(index)} />}
        >
          {index}
        </Pagination.Item>
      )}
    />
  );
}
