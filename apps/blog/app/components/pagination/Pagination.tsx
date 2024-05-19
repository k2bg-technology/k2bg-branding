'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Pagination as UIPagination } from 'ui';

interface Props {
  count: number;
}

export default function Pagination(props: Props) {
  const { count } = props;

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <UIPagination
      count={count}
      currentIndex={currentPage}
      prevProps={{
        onClick: () => router.push(createPageURL(currentPage - 1)),
      }}
      nextProps={{
        onClick: () => router.push(createPageURL(currentPage + 1)),
      }}
      renderItem={(index) => (
        <UIPagination.Item
          selected={index === currentPage}
          onClick={() => router.push(createPageURL(index))}
        >
          {index}
        </UIPagination.Item>
      )}
    />
  );
}
