'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Pagination as UIPagination } from 'ui';

interface Props {
  count: number;
}

export function Pagination(props: Props) {
  const { count } = props;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < count;

  return (
    <UIPagination
      count={count}
      currentPage={currentPage}
      prevProps={{
        'aria-label': '前のページ',
        // Disabled prev/next stay plain <button>s — an <a> can't express the
        // disabled state (no `:disabled` pseudo-class), so only wire a Link
        // render when the control is actually enabled.
        render: hasPreviousPage ? (
          <Link href={createPageURL(currentPage - 1)} />
        ) : undefined,
      }}
      nextProps={{
        'aria-label': '次のページ',
        render: hasNextPage ? (
          <Link href={createPageURL(currentPage + 1)} />
        ) : undefined,
      }}
      renderItem={(page) => (
        <UIPagination.Item
          selected={page === currentPage}
          render={<Link href={createPageURL(page)} />}
          data-gtm={`article_click_pagination_${page}`}
        >
          {page}
        </UIPagination.Item>
      )}
    />
  );
}
