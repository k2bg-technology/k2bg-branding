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

  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < count;

  return (
    <UIPagination
      count={count}
      currentIndex={currentPage}
      prevProps={{
        // Disabled prev/next stay plain <button>s — an <a> can't express the
        // disabled state (no `:disabled` pseudo-class), so only wire a Link
        // render when the control is actually enabled.
        render: hasPrevPage ? (
          <Link href={createPageURL(currentPage - 1)} />
        ) : undefined,
      }}
      nextProps={{
        render: hasNextPage ? (
          <Link href={createPageURL(currentPage + 1)} />
        ) : undefined,
      }}
      renderItem={(index) => (
        <UIPagination.Item
          selected={index === currentPage}
          render={<Link href={createPageURL(index)} />}
          data-gtm={`article_click_pagination_${index}`}
        >
          {index}
        </UIPagination.Item>
      )}
    />
  );
}
