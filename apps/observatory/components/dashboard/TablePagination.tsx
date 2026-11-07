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
  const createPageHref = (page: number) => {
    const pageQuery =
      page === 1
        ? query
        : [query, `${encodeURIComponent(pageKey)}=${page}`]
            .filter(Boolean)
            .join('&');
    return pageQuery === '' ? path : `${path}?${pageQuery}`;
  };
  return (
    <Pagination
      aria-label={labels.pagination}
      count={pageCount}
      currentPage={currentPage}
      prevProps={{
        'aria-label': labels.previousPage,
        render:
          currentPage > 1 ? (
            <Link href={createPageHref(currentPage - 1)} scroll={false} />
          ) : undefined,
      }}
      nextProps={{
        'aria-label': labels.nextPage,
        render:
          currentPage < pageCount ? (
            <Link href={createPageHref(currentPage + 1)} scroll={false} />
          ) : undefined,
      }}
      renderItem={(page) => (
        <Pagination.Item
          selected={page === currentPage}
          render={<Link href={createPageHref(page)} scroll={false} />}
        >
          {page}
        </Pagination.Item>
      )}
    />
  );
}
